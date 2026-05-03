// Tell the computer this code runs in the browser
"use client";

// Import tools from React and Next.js
import { useState, useEffect } from "react";
import Link from "next/link"; // For clickable links
import { supabase } from "@/lib/supabase"; // Connection to our database
// Import icons for the dashboard
import { 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  ChevronRight, 
  Loader2,
  LifeBuoy,
  History,
  Activity,
  ArrowUpRight,
  LayoutDashboard
} from "lucide-react";
// Import UI components for boxes and buttons
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
// Import helpers to show colored labels for status and priority
import { getStatusBadge, getPriorityBadge } from "@/lib/badgeHelpers";

// This is the Employee Dashboard page
export default function EmployeeDashboard() {
  // These "states" remember the tickets and if we are still loading
  const [tickets, setTickets] = useState([]); // List of tickets
  const [loading, setLoading] = useState(true); // Is it still loading?
  // Remember the numbers for the top boxes
  const [stats, setStats] = useState({
    active: 0,
    resolved: 0,
    updates: 0
  });

  // This part runs when the page first opens
  useEffect(() => {
    fetchMyTickets(); // Get the user's tickets from the database
  }, []);

  // This function gets all tickets submitted by the current user
  async function fetchMyTickets() {
    setLoading(true); // Show the loading spinner
    // Find out who is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // If no one is logged in, stop here

    // 1. Get the user's tickets without any joins
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(`id, title, status, priority, created_at, assigned_to`)
      .eq("submitted_by", user.id) // Only get tickets submitted by THIS user
      .order("created_at", { ascending: false });

    if (ticketError) {
      console.error("Dashboard fetch error:", ticketError);
      setLoading(false);
      return;
    }

    // 2. MANUALLY get the profiles for the IT staff (assignees)
    if (ticketData && ticketData.length > 0) {
      const assigneeIds = [...new Set(ticketData.filter(t => t.assigned_to).map(t => t.assigned_to))];
      
      let profiles = [];
      if (assigneeIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", assigneeIds);
        profiles = profileData || [];
      }

      // Combine them manually
      const mappedData = ticketData.map(ticket => ({
        ...ticket,
        assignee: profiles.find(p => p.id === ticket.assigned_to)
      }));

      setTickets(mappedData);
      
      // Calculate stats
      setStats({
        active: mappedData.filter(t => t.status !== 'resolved').length,
        resolved: mappedData.filter(t => t.status === 'resolved').length,
        updates: mappedData.length
      });
    } else {
      setTickets([]);
      setStats({ active: 0, resolved: 0, updates: 0 });
    }
    setLoading(false); // Hide the loading spinner
  }

  // If the page is still loading, show a spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-slate-50 min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-6" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* ─── HEADER (Title and "New Ticket" button) ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Overview of your support tickets and activity.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Button to go to the "Submit Ticket" page */}
           <Link href="/employee/submit">
            <Button className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-indigo-600/20 px-8 group transition-all active:scale-95">
              <PlusCircle className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              New Ticket
            </Button>
           </Link>
        </div>
      </div>

      {/* ─── STAT GRID (The three boxes at the top with numbers) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Box for Open Tickets */}
        <Card className="bg-white border-none shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-500">
           <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <History className="w-7 h-7" />
                 </div>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Open Tickets</p>
              <div className="flex items-end gap-3">
                 <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{stats.active}</h3>
                 <p className="text-xs font-bold text-slate-500 mb-1">Tickets</p>
              </div>
           </CardContent>
        </Card>

        {/* Box for Resolved Tickets */}
        <Card className="bg-white border-none shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-500">
           <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-7 h-7" />
                 </div>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Resolved</p>
              <div className="flex items-end gap-3">
                 <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{stats.resolved}</h3>
                 <p className="text-xs font-bold text-slate-500 mb-1">Tickets</p>
              </div>
           </CardContent>
        </Card>

        {/* Box for Total Tickets */}
        <Card className="bg-white border-none shadow-sm rounded-[32px] overflow-hidden group hover:shadow-xl transition-all duration-500">
           <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                 <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <Activity className="w-7 h-7" />
                 </div>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total</p>
              <div className="flex items-end gap-3">
                 <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{stats.active + stats.resolved}</h3>
                 <p className="text-xs font-bold text-slate-500 mb-1">Total tickets</p>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* ─── MAIN CONTENT (The list of recent tickets) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* LEFT PART: List of tickets */}
         <div className="lg:col-span-8">
            <Card className="bg-white border-none shadow-2xl rounded-[32px] overflow-hidden">
               <CardHeader className="p-8 sm:p-10 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <MessageSquare className="w-6 h-6" />
                     </div>
                     <div>
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Recent Tickets</CardTitle>
                        <CardDescription className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mt-1">Your support history</CardDescription>
                     </div>
                  </div>
                  <Link href="/employee/tickets">
                     <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-transparent">
                        View All <ArrowUpRight className="ml-2 w-4 h-4" />
                     </Button>
                  </Link>
               </CardHeader>
               <CardContent className="p-0">
                  {/* If there are NO tickets, show a friendly message */}
                  {tickets.length === 0 ? (
                    <div className="p-24 text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-[30px] border border-slate-100 mx-auto flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                          <LifeBuoy className="w-10 h-10" />
                       </div>
                       <h4 className="text-xl font-black text-slate-900 tracking-tight">No tickets found.</h4>
                       <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">You haven't submitted any support requests yet.</p>
                       <Link href="/employee/submit">
                          <Button variant="link" className="mt-6 font-black text-[10px] uppercase tracking-widest text-indigo-600 decoration-2">Submit New Ticket</Button>
                       </Link>
                    </div>
                  ) : (
                    // If there ARE tickets, show them in a list
                    <div className="divide-y divide-slate-50">
                      {tickets.map((ticket) => (
                        <Link key={ticket.id} href={`/employee/tickets/${ticket.id}`} className="block group">
                          <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all duration-300 border-l-[6px] border-l-transparent hover:border-l-indigo-600">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                               {/* Show the profile picture of the IT Staff working on the ticket */}
                               <div className="relative group-hover:scale-105 transition-transform duration-500">
                                  <UserAvatar 
                                    avatarUrl={ticket.assignee?.avatar_url} 
                                    fullName={ticket.assignee?.full_name} 
                                    size="lg"
                                    className="ring-4 ring-white shadow-sm"
                                  />
                               </div>
                               <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                                     <h3 className="font-black text-slate-900 text-lg truncate tracking-tight">{ticket.title}</h3>
                                     {/* Show the priority (Critical, High, etc.) */}
                                     {getPriorityBadge(ticket.priority)}
                                  </div>
                                  <div className="flex items-center gap-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                     <span className="flex items-center gap-1.5 overflow-hidden max-w-[150px] truncate">
                                       Staff: {ticket.assignee?.full_name || "Awaiting Assignment"}
                                     </span>
                                     <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                     <span className="flex items-center gap-1.5">
                                       {new Date(ticket.created_at).toLocaleDateString()}
                                     </span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               {/* Show the status (Open, Resolved, etc.) */}
                               {getStatusBadge(ticket.status)}
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                  <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* RIGHT PART: Small help box */}
         <div className="lg:col-span-4 space-y-10">
            <Card className="bg-white border border-slate-100 shadow-sm rounded-[32px] overflow-hidden relative">
               <CardContent className="p-10 relative z-10">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-8">
                     <LifeBuoy className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight mb-4 text-slate-900">Need <br />Support?</h3>
                  <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">Our IT team is here to help you. Submit a ticket for any technical issues or hardware requests.</p>
                  
                  <Link href="/employee/submit" className="block">
                     <Button className="w-full h-14 bg-indigo-600 text-white hover:bg-indigo-700 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all active:scale-95">
                        Submit Ticket
                     </Button>
                  </Link>
               </CardContent>
            </Card>
         </div>

      </div>

    </div>
  );
}
