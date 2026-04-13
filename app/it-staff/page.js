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
  const [me, setMe] = useState(null);

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
      setMe(user);

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
      toast.error("Failed to load dashboard data.");
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
      toast.success(newStatus === 'in_progress' ? "Status updated to In Progress" : "Ticket marked as Resolved");
      fetchDashboardData();
    }
  }

  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: "bg-slate-100 text-slate-600 border-slate-200",
      medium: "bg-blue-50 text-blue-700 border-blue-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      urgent: "bg-red-50 text-red-700 border-red-200",
      critical: "bg-red-50 text-red-700 border-red-200"
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[priority?.toLowerCase()] || colors.low}`}>
        {priority}
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${configs[status] || configs.open}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {greeting}, {me?.user_metadata?.full_name?.split(' ')[0] || "Staff"}!
        </h1>
        <p className="text-slate-500 text-lg mt-1">Here is the summary of your assigned tasks.</p>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Assigned to me" 
          value={stats.assigned} 
          icon={Inbox} 
          color="text-blue-600" 
          bg="bg-blue-50" 
          sub="New tickets"
        />
        <StatCard 
          title="In Progress" 
          value={stats.in_progress} 
          icon={Loader2} 
          color="text-yellow-600" 
          bg="bg-yellow-50"
          sub="Active tasks"
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolved} 
          icon={CheckCircle2} 
          color="text-green-600" 
          bg="bg-green-50"
          sub="Total completed"
        />
      </div>

      {/* ─── TICKETS SECTION ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-slate-900">My Tickets</h2>
            <Badge className="bg-blue-600 text-white border-transparent ml-3 h-5 px-2 text-[10px] font-bold">
              {myTickets.length} ACTIVE
            </Badge>
          </div>
          <Link href="/it-staff/tickets" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">
            View All Tickets →
          </Link>
        </div>

        {myTickets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-24 text-center shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-70" />
            <h3 className="text-2xl font-bold text-slate-900">All clear!</h3>
            <p className="text-slate-500 text-base mt-1 font-medium">You have no active tickets assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className={`bg-white border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all border-l-[6px] ${
                  ticket.priority === 'critical' ? 'border-l-red-500' : 
                  ticket.priority === 'high' ? 'border-l-orange-500' : 
                  ticket.priority === 'medium' ? 'border-l-blue-500' : 
                  'border-l-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                      <span className="text-slate-400 text-xs font-semibold">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 leading-tight truncate">
                      {ticket.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-slate-400" />
                       <span className="text-slate-500 text-sm font-medium">
                         Submitted by <span className="text-slate-900 font-semibold">{ticket.submitter?.full_name || 'System'}</span>
                       </span>
                    </div>

                    <p className="text-slate-600 text-base leading-relaxed line-clamp-2 mt-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 md:pt-0 min-w-[200px] justify-end items-center">
                    {ticket.status === 'open' && (
                      <Button 
                        onClick={() => updateStatus(ticket.id, 'in_progress')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest px-5 h-10 rounded-xl transition-all shadow-sm"
                      >
                        Start Task
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button 
                        onClick={() => updateStatus(ticket.id, 'resolved')}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-widest px-5 h-10 rounded-xl transition-all shadow-sm"
                      >
                        Resolve
                      </Button>
                    )}
                    <Link href={`/it-staff/tickets/${ticket.id}`}>
                      <Button 
                        variant="ghost" 
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold uppercase tracking-widest h-10 px-4 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                      >
                        View <ChevronRight className="w-4 h-4 ml-1" />
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
    <Card className="bg-white border-slate-200 rounded-2xl p-6 shadow-sm group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
      </div>
      <div>
        <h3 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{value}</h3>
        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{sub}</p>
      </div>
    </Card>
  );
}
