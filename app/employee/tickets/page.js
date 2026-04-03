"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Search, Ticket, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";

export default function EmployeeTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    async function fetchTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false });

      if (data) setTickets(data);
      setLoading(false);
    }
    
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = tickets.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Tickets</h1>
          {!loading && (
            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
              {totalCount} Total
            </span>
          )}
        </div>
        <Link href="/employee/submit">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-transform hover:-translate-y-0.5">
            New Ticket
          </Button>
        </Link>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search tickets by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
          />
        </div>
        <div className="flex flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 focus:ring-blue-500 font-medium text-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 focus:ring-blue-500 font-medium text-slate-700">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="font-medium">Loading your tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No tickets found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {tickets.length === 0 
                ? "You haven't submitted any IT tickets yet." 
                : "No tickets match your current filters. Try adjusting them!"}
            </p>
            {tickets.length > 0 && (
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all"); }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-500 w-[100px]">ID</TableHead>
                  <TableHead className="font-semibold text-slate-500">Title</TableHead>
                  <TableHead className="font-semibold text-slate-500">Priority</TableHead>
                  <TableHead className="font-semibold text-slate-500">Status</TableHead>
                  <TableHead className="font-semibold text-slate-500">Submitted</TableHead>
                  <TableHead className="text-right font-semibold text-slate-500">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-400 font-medium">
                      #{ticket.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {ticket.title}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(ticket.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm font-medium">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="font-semibold text-slate-600 hover:text-blue-600 border-slate-200">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
