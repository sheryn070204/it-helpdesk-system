"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  ChevronRight, 
  Clock, 
  User, 
  Loader2,
  Ticket
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/UserAvatar";

function TicketsContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(statusParam || "all");

  // Sync filter with status param if it changes
  useEffect(() => {
    if (statusParam) {
      setFilter(statusParam);
    }
  }, [statusParam]);

  // Guard against double fetch
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
    } catch (err) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = (t.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
                           (t.id?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: "bg-slate-100 text-slate-600 border-slate-200",
      medium: "bg-blue-50 text-blue-700 border-blue-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      urgent: "bg-red-50 text-red-700 border-red-200",
      critical: "bg-red-50 text-red-700 border-red-200"
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[priority?.toLowerCase()] || colors.low}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      open: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
      resolved: "bg-green-50 text-green-700 border-green-200",
      closed: "bg-slate-100 text-slate-500 border-slate-200"
    };
    const labelMap = {
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed"
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${configs[status] || configs.open}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ticket List</h1>
          <p className="text-slate-500 mt-1">Manage and respond to all system support requests.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by title or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500 placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-12 w-full md:w-[180px] bg-slate-50 border-slate-200 rounded-xl font-semibold text-sm text-slate-700 focus:ring-blue-500">
                  <SelectValue placeholder="FILTER STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-xl">
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-500 font-medium">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-32 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-4">
                  <Ticket className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">No tickets found</h3>
               <p className="text-slate-500 text-sm mt-1">No requests match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Ticket Details</th>
                    <th className="px-4 py-4 text-center">ID</th>
                    <th className="px-4 py-4 text-center">Priority</th>
                    <th className="px-4 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <UserAvatar 
                             avatarUrl={ticket.submitter?.avatar_url} 
                             fullName={ticket.submitter?.full_name} 
                             size="md"
                             className="border border-slate-100 shadow-sm"
                           />
                           <div className="min-w-0">
                              <h3 className="text-base font-bold text-slate-900 truncate max-w-[300px] mb-1 group-hover:text-blue-600 transition-colors">{ticket.title}</h3>
                              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                 <span className="flex items-center gap-1.5">
                                   <User className="w-3.5 h-3.5 opacity-60" />
                                   {ticket.submitter?.full_name || 'System'}
                                 </span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                 <span className="flex items-center gap-1.5">
                                   <Clock className="w-3.5 h-3.5 opacity-60" />
                                   {new Date(ticket.created_at).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                         <span className="bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px] font-bold px-2 py-1 rounded-md">
                           {ticket.id.slice(0, 8).toUpperCase()}
                         </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <StatusBadge status={ticket.status} />
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <Link href={`/it-staff/tickets/${ticket.id}`}>
                           <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-white hover:border-blue-200 transition-all shadow-sm">
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

export default function ITStaffTickets() {
  return (
    <Suspense fallback={
      <div className="py-40 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Initializing ticket registry...</p>
      </div>
    }>
      <TicketsContent />
    </Suspense>
  );
}
