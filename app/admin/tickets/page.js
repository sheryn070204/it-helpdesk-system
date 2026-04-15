"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Ticket, Filter, Database, ArrowUpRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";

export default function AdminTicketsPage() {
  const searchParams = useSearchParams();
  const assignedToId = searchParams.get("assigned_to");
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigneeName, setAssigneeName] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, [assignedToId]);

  async function fetchTickets() {
    setLoading(true);
    let query = supabase
      .from("tickets")
      .select(`
        id, title, priority, status, created_at,
        submitter:profiles!tickets_submitted_by_fkey (full_name, avatar_url),
        assignee:profiles!tickets_assigned_to_fkey (id, full_name, avatar_url)
      `);

    // Force filter if assigned_to param is present
    if (assignedToId) {
      query = query.eq("assigned_to", assignedToId);
    }

    const { data } = await query.order("created_at", { ascending: false });

    if (data) {
      setTickets(data);
      // If filtering by user, set the display name from the first ticket's assignee
      if (assignedToId && data.length > 0) {
        setAssigneeName(data[0].assignee?.full_name || "Selected Staff");
      }
    }
    setLoading(false);
  }

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    if (assignedToId) {
      // Logic to clear the URL param would typically involve router.push('/admin/tickets')
      window.location.href = "/admin/tickets";
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Support Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {assignedToId ? (
              <>Assigned to <span className="text-indigo-500">{assigneeName}</span></>
            ) : (
              <>All <span className="text-indigo-500">Tickets</span></>
            )}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {assignedToId 
              ? `Showing tickets currently assigned to this staff member.` 
              : `Monitoring ${tickets.length} total tickets across the platform.`}
          </p>
        </div>
        
        {assignedToId && (
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = "/admin/tickets"}
            className="h-12 px-6 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest"
          >
            <X className="w-4 h-4 mr-2" /> Clear Staff Filter
          </Button>
        )}
      </div>

      {/* ─── FILTERS AREA ─── */}
      <Card className="bg-[#111113] border-white/5 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-6 flex flex-col xl:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <Input 
              placeholder="Search by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-[#09090b] text-white border-white/5 rounded-2xl focus-visible:ring-indigo-500 placeholder:text-slate-700 font-medium text-base shadow-inner"
            />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-14 lg:w-[160px] bg-[#09090b] text-white border-white/5 rounded-2xl focus:ring-indigo-500 font-bold text-xs uppercase tracking-widest shadow-inner">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-white rounded-xl">
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-14 lg:w-[160px] bg-[#09090b] text-white border-white/5 rounded-2xl focus:ring-indigo-500 font-bold text-xs uppercase tracking-widest shadow-inner">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10 text-white rounded-xl">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="h-14 border-dashed border-white/10 bg-transparent text-slate-500 hover:text-white hover:bg-white/5 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest"
            >
              Reset
            </Button>
            
            <Button 
              onClick={fetchTickets}
              className="h-14 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── TABLE CONTENT ─── */}
      <Card className="bg-[#111113] border-white/5 shadow-2xl rounded-[32px] overflow-hidden">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-6" />
            <p className="font-black text-[11px] text-slate-500 uppercase tracking-[0.4em]">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center text-center px-10">
            <div className="w-20 h-20 bg-[#09090b] rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-inner">
              <Ticket className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No Tickets Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">
              {tickets.length === 0 
                ? "This staff member currently has no tickets assigned to them." 
                : "No tickets match your search criteria."}
          </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 bg-white/[0.02] h-16 hover:bg-transparent">
                  <TableHead className="font-black text-slate-600 text-[10px] uppercase tracking-[0.2em] pl-10 text-left">Ticket Information</TableHead>
                  <TableHead className="font-black text-slate-600 text-[10px] uppercase tracking-[0.2em] text-center w-[150px]">Priority</TableHead>
                  <TableHead className="font-black text-slate-600 text-[10px] uppercase tracking-[0.2em] text-center w-[150px]">Status</TableHead>
                  <TableHead className="font-black text-slate-600 text-[10px] uppercase tracking-[0.2em] text-center w-[200px]">Assigned To</TableHead>
                  <TableHead className="text-right font-black text-slate-600 text-[10px] uppercase tracking-[0.2em] pr-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="group hover:bg-white/[0.03] transition-colors h-24 border-none">
                    <TableCell className="pl-10">
                       <div className="flex items-center gap-5">
                          <UserAvatar 
                            avatarUrl={ticket.submitter?.avatar_url} 
                            fullName={ticket.submitter?.full_name} 
                            size="default"
                            className="w-12 h-12 rounded-2xl ring-2 ring-white/5"
                          />
                          <div className="flex flex-col gap-1">
                             <span className="font-black text-white text-base max-w-[320px] truncate leading-tight tracking-tight">{ticket.title}</span>
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest whitespace-nowrap">ID: {ticket.id.slice(0, 8)}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-700" />
                               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{ticket.submitter?.full_name || "Guest"}</span>
                             </div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex justify-center">{getPriorityBadge(ticket.priority)}</div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex justify-center">{getStatusBadge(ticket.status)}</div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {ticket.assignee ? (
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl">
                            {ticket.assignee.full_name.split(' ')[0]}
                          </Badge>
                        ) : (
                          <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <Button className="font-black text-[10px] uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all rounded-2xl px-8 h-12 active:scale-95 group/btn">
                          View
                          <ArrowUpRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
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
