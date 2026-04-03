"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  ChevronRight, 
  Clock, 
  User, 
  Loader2,
  Ticket,
  Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/UserAvatar";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";

export default function ITStaffTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("tickets")
      .select(`
        id, title, priority, status, created_at,
        submitter:profiles!tickets_submitted_by_fkey (full_name, avatar_url)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  }

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = (t.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
                           (t.id?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Master Registry</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">System <span className="text-indigo-500">Registry</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Full archive of all system support tickets and historical records.</p>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <Card className="bg-[#1C2333] border-[#2A3550] shadow-2xl rounded-[24px] overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <Input 
              placeholder="Search by title or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 h-14 bg-[#161B27] text-white border-[#2A3550] rounded-xl focus-visible:ring-indigo-500 placeholder:text-slate-600 font-medium text-base shadow-inner"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-14 w-full md:w-[200px] bg-[#161B27] text-white border-[#2A3550] rounded-xl font-bold text-xs uppercase tracking-widest focus:ring-indigo-500">
                  <SelectValue placeholder="FILTER STATE" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C2333] border-[#2A3550] text-white rounded-xl p-2 shadow-2xl">
                  <SelectItem className="rounded-lg py-3 focus:bg-indigo-600" value="all">Full Registry</SelectItem>
                  <SelectItem className="rounded-lg py-3 focus:bg-indigo-600" value="open">Awaiting Action</SelectItem>
                  <SelectItem className="rounded-lg py-3 focus:bg-indigo-600" value="in_progress">Currently Active</SelectItem>
                  <SelectItem className="rounded-lg py-3 focus:bg-indigo-600" value="resolved">Completed / Fixed</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </CardContent>
      </Card>

      {/* ─── TICKET TABLE ─── */}
      <Card className="bg-[#1C2333] border-[#2A3550] shadow-2xl rounded-[24px] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
              <p className="text-slate-500 text-sm font-medium">Accessing registry database...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-40 text-center">
               <div className="w-16 h-16 bg-[#161B27] rounded-2xl border border-[#2A3550] mx-auto flex items-center justify-center text-slate-600 mb-6 shadow-inner">
                  <Ticket className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-white">Registry Empty</h3>
               <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">No tickets match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#161B27]/50 border-b border-[#2A3550] uppercase text-[10px] font-black text-slate-500 tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Ticket Information</th>
                    <th className="px-4 py-5 text-center">Reference</th>
                    <th className="px-4 py-5 text-center">Priority</th>
                    <th className="px-4 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3550]">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-[#161B27]/30 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                           <UserAvatar 
                             avatarUrl={ticket.submitter?.avatar_url} 
                             fullName={ticket.submitter?.full_name} 
                             size="md"
                             className="ring-2 ring-indigo-500/10 shadow-sm"
                           />
                           <div className="min-w-0">
                              <h3 className="text-base font-bold text-white truncate max-w-[350px] mb-1 group-hover:text-indigo-400 transition-colors">{ticket.title}</h3>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5">
                                   <User className="w-3.5 h-3.5 opacity-50" />
                                   {ticket.submitter?.full_name}
                                 </span>
                                 <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                 <span className="flex items-center gap-1.5">
                                   <Clock className="w-3.5 h-3.5 opacity-50" />
                                   {new Date(ticket.created_at).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                         <span className="bg-[#161B27] border border-[#2A3550] text-[#7B8FAF] font-mono text-[10px] font-bold px-2 py-1 rounded-md">
                           TIC-{ticket.id.slice(0, 8).toUpperCase()}
                         </span>
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex justify-center scale-90">
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </td>
                      <td className="px-4 py-6">
                         <div className="flex justify-center scale-90">
                           {getStatusBadge(ticket.status)}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <Link href={`/it-staff/tickets/${ticket.id}`}>
                           <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-transparent border border-[#374151] text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-95">
                              <ChevronRight className="w-4 h-4" />
                           </Button>
                         </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
