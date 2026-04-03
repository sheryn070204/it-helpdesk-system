"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    async function fetchTickets() {
      const { data } = await supabase
        .from("tickets")
        .select(`
          id, title, priority, status, created_at,
          submitter:profiles!tickets_submitted_by_fkey (full_name),
          assignee:profiles!tickets_assigned_to_fkey (full_name)
        `)
        .order("created_at", { ascending: false });

      if (data) setTickets(data);
      setLoading(false);
    }
    
    fetchTickets();
  }, []);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = tickets.length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Master Ticket Log</h1>
          {!loading && (
            <p className="text-sm text-slate-400 font-medium mt-1">Viewing all {totalCount} system tickets</p>
          )}
        </div>
      </div>

      {/* ─── Filters ─── */}
      <Card className="shadow-sm border-slate-800 bg-[#18181b]">
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search by ticket title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#09090b] text-white border-slate-800 focus-visible:ring-indigo-500 placeholder-slate-500"
            />
          </div>
          
          <div className="flex flex-row gap-4 w-full lg:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[160px] bg-[#09090b] text-white border-slate-800 focus:ring-indigo-500 font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-slate-700 text-white">
                <SelectItem className="hover:bg-slate-800" value="all">All Statuses</SelectItem>
                <SelectItem className="hover:bg-slate-800" value="open">Open</SelectItem>
                <SelectItem className="hover:bg-slate-800" value="in_progress">In Progress</SelectItem>
                <SelectItem className="hover:bg-slate-800" value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-[160px] bg-[#09090b] text-white border-slate-800 focus:ring-indigo-500 font-medium">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-slate-700 text-white">
                <SelectItem className="hover:bg-slate-800" value="all">All Priorities</SelectItem>
                <SelectItem className="hover:bg-slate-800" value="critical">Critical</SelectItem>
                <SelectItem className="hover:bg-slate-800" value="high">High</SelectItem>
                <SelectItem className="hover:bg-slate-800" value="medium">Medium</SelectItem>
                <SelectItem className="hover:bg-slate-800" value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="px-4 border-slate-700 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800 border-dashed"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Table ─── */}
      <Card className="shadow-sm border-slate-800 overflow-hidden bg-[#18181b]">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="font-medium text-sm">Querying master database...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#09090b] rounded-full flex items-center justify-center mb-4 border border-slate-800">
              <Ticket className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tickets found</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">
              {tickets.length === 0 
                ? "The system has not logged any tickets." 
                : "No tickets match your specific filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent h-14 bg-transparent transition-none">
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-8 w-[80px]">ID Ref</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest w-[300px]">Incident Subject</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center">Priority</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center">Triage</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center">Staff Assignment</TableHead>
                  <TableHead className="text-right font-bold text-slate-500 text-[10px] uppercase tracking-widest pr-8">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors h-20 group">
                    <TableCell className="pl-8 font-mono text-[10px] text-slate-500">
                      {ticket.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-100 text-sm max-w-[280px] truncate">{ticket.title}</span>
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">By: {ticket.submitter?.full_name || "Guest"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      {getPriorityBadge(ticket.priority)}
                    </TableCell>
                    <TableCell className="text-center px-4">
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell className="text-center px-4">
                      {ticket.assignee ? (
                        <div className="flex justify-center">
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                            {ticket.assignee.full_name}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] animate-pulse">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-600/20 border border-transparent hover:border-indigo-500/30 transition-all rounded-xl px-6 h-9 bg-indigo-500/5">
                          Analyze
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
