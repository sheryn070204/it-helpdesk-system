"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Ticket, 
  Loader2, 
  ChevronRight, 
  Activity, 
  Clock, 
  MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { Card, CardContent } from "@/components/ui/card";

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
        .select(`
          *,
          assignee:profiles!tickets_assigned_to_fkey (full_name, avatar_url)
        `)
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

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* ─── PRO HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Logs</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Incident <span className="text-indigo-600">Registry</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Full historical record of all support interactions and lifecycle states.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-500" />
              Node: Active
           </div>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <Card className="bg-white border-none shadow-sm rounded-[32px] overflow-hidden">
        <CardContent className="p-6 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <Input 
              placeholder="Query protocol registry by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-14 h-16 bg-slate-50 border-slate-100 rounded-2xl font-bold text-base shadow-inner focus-visible:ring-indigo-500 placeholder:text-slate-300"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-16 w-full lg:w-[180px] bg-slate-50 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-inner">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-xl">
                  <SelectItem value="all">Full Lifecycle</SelectItem>
                  <SelectItem value="open">Awaiting Triage</SelectItem>
                  <SelectItem value="in_progress">Engineer Active</SelectItem>
                  <SelectItem value="resolved">Terminated</SelectItem>
                </SelectContent>
             </Select>

             <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-16 w-full lg:w-[180px] bg-slate-50 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-inner">
                  <SelectValue placeholder="PRIORITY" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-xl">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </CardContent>
      </Card>

      {/* ─── TABLE ─── */}
      <Card className="bg-white border-none shadow-2xl rounded-[40px] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6" />
              <p className="font-black text-[10px] text-slate-400 uppercase tracking-[0.4em]">Querying Registry...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-40 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-[30px] border border-slate-50 mx-auto flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                  <Ticket className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Records Available</h3>
               <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">The registry is empty or no incidents match your current filter state.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100/50 uppercase text-[10px] font-black text-slate-400 tracking-[0.2em]">
                  <tr>
                    <th className="px-10 py-6">Incident Matrix</th>
                    <th className="px-6 py-6 text-center">Protocol ID</th>
                    <th className="px-6 py-6 text-center">Triage</th>
                    <th className="px-6 py-6 text-center">State</th>
                    <th className="px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-6">
                            <div className="relative">
                               <UserAvatar 
                                 avatarUrl={ticket.assignee?.avatar_url} 
                                 fullName={ticket.assignee?.full_name} 
                                 size="lg"
                                 className="ring-4 ring-slate-100 group-hover:ring-white transition-all shadow-sm"
                               />
                               {ticket.assignee && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                               )}
                            </div>
                            <div className="min-w-0">
                               <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1.5 truncate max-w-[350px]">{ticket.title}</h3>
                               <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                    {ticket.assignee?.full_name || "Unassigned"}
                                  </span>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                         <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg group-hover:bg-white transition-colors">
                           TIC-{ticket.id.slice(0, 8).toUpperCase()}
                         </span>
                      </td>
                      <td className="px-6 py-8">
                         <div className="flex justify-center scale-110">
                           {getPriorityBadge(ticket.priority)}
                         </div>
                      </td>
                      <td className="px-6 py-8">
                         <div className="flex justify-center scale-110">
                           {getStatusBadge(ticket.status)}
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <Link href={`/employee/tickets/${ticket.id}`}>
                           <Button className="h-12 w-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-white hover:bg-slate-900 transition-all shadow-sm flex items-center justify-center p-0 group-hover:scale-105">
                              <ChevronRight className="w-5 h-5" />
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
