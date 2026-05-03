// Tell the computer this code runs in the browser
"use client";

// Import tools from React and Next.js
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link"; // For clickable links
import { useSearchParams } from "next/navigation"; // To read the URL (like ?status=open)
// Import connection to our database
import { supabase } from "@/lib/supabase";
// Import icons for the design
import { 
  Search, 
  ChevronRight, 
  Clock, 
  User, 
  Loader2,
  Ticket
} from "lucide-react";
// Import UI components (boxes, tables, buttons, etc.)
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Import helpers to show colored labels for status and priority
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { UserAvatar } from "@/components/UserAvatar";

// This is the actual content for the IT Staff Tickets page
function TicketsContent() {
  // Tools to read the URL and find "status" filters
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  // These "states" remember the list of tickets and filters
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // What the user typed in search
  const [filter, setFilter] = useState(statusParam || "all"); // Status filter (Open, Closed, etc.)

  // If the status in the URL changes, update our filter
  useEffect(() => {
    if (statusParam) {
      setFilter(statusParam);
    }
  }, [statusParam]);

  // This prevents the code from running twice by accident
  const hasFetched = useRef(false);

  // Run this when the page first opens to get the tickets
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchTickets();
  }, []);

  // Function to get ALL tickets from the database
  async function fetchTickets() {
    setLoading(true);
    try {
      // Find out who is logged in
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Fetch tickets without the join
      const { data, error } = await supabase
        .from("tickets")
        .select(`id, title, priority, status, created_at, submitted_by`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Manually get the profiles
        const submitterIds = [...new Set(data.map(t => t.submitted_by))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", submitterIds);

        // Combine them
        const mappedData = data.map(ticket => ({
          ...ticket,
          submitter: profiles?.find(p => p.id === ticket.submitted_by)
        }));
        setTickets(mappedData);
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter the list based on what is typed in search and the selected status
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = (t.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
                           (t.id?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    // Main container for the page
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* ─── HEADER ─── */}
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

      {/* ─── SEARCH AND FILTERS BOX ─── */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          {/* Search box */}
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by title or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500 placeholder:text-slate-400 font-medium"
            />
          </div>
          {/* Status filter dropdown */}
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

      {/* ─── TICKETS TABLE ─── */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            // Loading spinner
            <div className="py-32 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-slate-500 font-medium">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            // No tickets found message
            <div className="py-32 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-4">
                  <Ticket className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">No tickets found</h3>
               <p className="text-slate-500 text-sm mt-1">No requests match your current filters.</p>
            </div>
          ) : (
            // The table showing all tickets
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100 h-14">
                    <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider pl-8 text-left w-[40%]">Ticket Details</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider text-center w-[15%]">ID</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider text-center w-[15%]">Priority</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider text-center w-[15%]">Status</TableHead>
                    <TableHead className="font-bold text-slate-500 text-xs tracking-wider text-right pr-8 w-[15%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="group hover:bg-slate-50/70 transition-colors h-20 border-none">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-4">
                           {/* Submitter's profile picture */}
                           <UserAvatar 
                             avatarUrl={ticket.submitter?.avatar_url} 
                             fullName={ticket.submitter?.full_name} 
                             size="md"
                             className="border border-slate-200 shadow-sm"
                           />
                           <div className="flex flex-col gap-1">
                              {/* Ticket title */}
                              <h3 className="text-sm font-bold text-slate-900 truncate max-w-[300px] leading-tight group-hover:text-blue-600 transition-colors">{ticket.title}</h3>
                              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                 {/* Submitter's name */}
                                 <span className="flex items-center gap-1">
                                   <User className="w-3 h-3 text-slate-400" />
                                   {ticket.submitter?.full_name || 'System'}
                                 </span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                 {/* Date created */}
                                 <span className="flex items-center gap-1">
                                   <Clock className="w-3 h-3 text-slate-400" />
                                   {new Date(ticket.created_at).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-center">
                         {/* Ticket ID label */}
                         <span className="bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px] font-bold px-2.5 py-1 rounded-md">
                           {ticket.id.slice(0, 8).toUpperCase()}
                         </span>
                      </TableCell>
                      <TableCell className="px-4">
                        {/* Priority label */}
                        <div className="flex justify-center">
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        {/* Status label */}
                        <div className="flex justify-center">
                          {getStatusBadge(ticket.status)}
                        </div>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                         {/* View Details button */}
                         <Link href={`/it-staff/tickets/${ticket.id}`}>
                           <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm group-hover:border-blue-200 group-hover:text-blue-500">
                              <ChevronRight className="w-4 h-4" />
                           </Button>
                         </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper to handle loading states for URL search params
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
