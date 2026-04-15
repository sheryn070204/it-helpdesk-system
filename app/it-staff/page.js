"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  User,
  Ticket
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";

export default function ITStaffDashboard() {
  const [stats, setStats] = useState({
    assigned: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Guard against double fetch
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);

      const { data: allTickets, error: statsError } = await supabase
        .from("tickets")
        .select("*")
        .eq("assigned_to", user.id);

      if (statsError) throw statsError;

      if (allTickets) {
        setStats({
          assigned: allTickets.filter(t => t.status === 'open').length,
          in_progress: allTickets.filter(t => t.status === 'in_progress').length,
          resolved: allTickets.filter(t => t.status === 'resolved').length,
        });

        const { data: recentTickets, error: ticketsError } = await supabase
          .from("tickets")
          .select(`
            id, title, priority, status, created_at, description,
            submitter:profiles!tickets_submitted_by_fkey (full_name, avatar_url)
          `)
          .eq("assigned_to", user.id)
          .neq("status", "resolved")
          .order("created_at", { ascending: false })
          .limit(10);

        if (ticketsError) throw ticketsError;
        setMyTickets(recentTickets || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      toast.error("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(ticketId, newStatus) {
    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(newStatus === 'in_progress' ? "Task is now active" : "Ticket successfully resolved");
      fetchDashboardData();
    }
  }

  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: "bg-slate-100 text-slate-500 border-slate-200",
      medium: "bg-blue-50 text-blue-600 border-blue-100",
      high: "bg-orange-50 text-orange-600 border-orange-100",
      urgent: "bg-red-50 text-red-600 border-red-100",
      critical: "bg-red-50 text-red-600 border-red-100"
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[priority?.toLowerCase()] || colors.low}`}>
        {priority}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      open: "bg-blue-600 text-white border-transparent",
      in_progress: "bg-amber-500 text-white border-transparent",
      resolved: "bg-emerald-500 text-white border-transparent",
      closed: "bg-slate-400 text-white border-transparent"
    };
    const labelMap = {
      open: "New",
      in_progress: "Active",
      resolved: "Done",
      closed: "Closed"
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${configs[status] || configs.open}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-6" />
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Initializing Core...</p>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* ─── GREETING HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {greeting}, <span className="text-blue-600">{profile?.full_name?.split(' ')[0] || "Staff"}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Ready to solve some tickets today?</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
           <div className="bg-slate-50 px-4 py-2 rounded-xl text-center border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Today's Date</p>
             <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
           </div>
        </div>
      </div>

      {/* ─── STATS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Assigned to me" 
          value={stats.assigned} 
          icon={Inbox} 
          color="text-blue-600" 
          bg="bg-blue-50" 
          sub="Pending Triage"
        />
        <StatCard 
          title="In Progress" 
          value={stats.in_progress} 
          icon={Loader2} 
          color="text-amber-600" 
          bg="bg-amber-50"
          sub="Active Tasks"
        />
        <StatCard 
          title="My Resolved" 
          value={stats.resolved} 
          icon={CheckCircle2} 
          color="text-emerald-600" 
          bg="bg-emerald-50"
          sub="Total Completed"
        />
      </div>

      {/* ─── TICKETS SECTION ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">My active queue</h2>
            <Badge className="bg-blue-600 text-white border-transparent h-6 px-3 text-[10px] font-black tracking-widest">
              {myTickets.length} REMAINING
            </Badge>
          </div>
          <Link href="/it-staff/tickets">
            <Button variant="ghost" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-colors">
              Full Registry →
            </Button>
          </Link>
        </div>

        {myTickets.length === 0 ? (
          <Card className="bg-white border-slate-200 border-dashed rounded-[32px] py-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Zero Pending tasks</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Your personal workspace is clear. Great job!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="bg-white border-slate-200 rounded-[28px] p-8 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                      {ticket.title}
                    </h3>
                    
                    <div className="flex items-center gap-4">
                       <UserAvatar 
                          avatarUrl={ticket.submitter?.avatar_url} 
                          fullName={ticket.submitter?.full_name} 
                          size="sm"
                          className="ring-2 ring-slate-100"
                       />
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted By</p>
                          <p className="text-sm font-bold text-slate-700">{ticket.submitter?.full_name || 'Anonymous'}</p>
                       </div>
                       <div className="h-4 w-px bg-slate-100 mx-2 hidden sm:block" />
                       <div className="hidden sm:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created Date</p>
                          <p className="text-sm font-bold text-slate-700">{new Date(ticket.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                    {ticket.status === 'open' && (
                      <Button 
                        onClick={() => updateStatus(ticket.id, 'in_progress')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 h-12 rounded-xl"
                      >
                         Claim Task
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button 
                        onClick={() => updateStatus(ticket.id, 'resolved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 h-12 rounded-xl"
                      >
                        Resolve
                      </Button>
                    )}
                    <Link href={`/it-staff/tickets/${ticket.id}`}>
                      <Button 
                        variant="ghost" 
                        className="text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest h-12 px-6 rounded-xl border border-slate-100"
                      >
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, sub }) {
  return (
    <Card className="bg-white border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
      <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 ${color}`}>
         <Icon className="w-24 h-24 rotate-12" />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center ${bg} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
      </div>
      <div>
        <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
        <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.3em] ml-1">{sub}</p>
      </div>
    </Card>
  );
}
