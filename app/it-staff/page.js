"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMe(user);

    const { data: allTickets } = await supabase
      .from("tickets")
      .select("*")
      .eq("assigned_to", user.id);

    if (allTickets) {
      setStats({
        assigned: allTickets.filter(t => t.status === 'open').length,
        in_progress: allTickets.filter(t => t.status === 'in_progress').length,
        resolved: allTickets.filter(t => t.status === 'resolved').length,
      });

      const { data: recentTickets } = await supabase
        .from("tickets")
        .select(`
          id, title, priority, status, created_at, description,
          submitter:profiles!tickets_submitted_by_fkey (full_name, avatar_url)
        `)
        .eq("assigned_to", user.id)
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(10);

      setMyTickets(recentTickets || []);
    }
    setLoading(false);
  }

  // Update Status Logic
  async function updateStatus(ticketId, newStatus) {
    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(newStatus === 'in_progress' ? "Started working!" : "Ticket resolved!");
      fetchDashboardData();
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
        <p className="text-slate-500 text-sm">Getting your queue ready...</p>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {greeting}, {me?.user_metadata?.full_name?.split(' ')[0] || "Staff"}!
        </h1>
        <p className="text-[#7B8FAF] text-base mt-1 font-medium">Here are your assigned tickets.</p>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard 
          title="ASSIGNED TO ME" 
          value={stats.assigned} 
          icon={Inbox} 
          color="text-indigo-400" 
          bg="bg-indigo-500/20" 
          sub="In your queue"
        />
        <StatCard 
          title="IN PROGRESS" 
          value={stats.in_progress} 
          icon={Loader2} 
          color="text-amber-400" 
          bg="bg-amber-500/20"
          sub="Currently working on"
        />
        <StatCard 
          title="RESOLVED" 
          value={stats.resolved} 
          icon={CheckCircle2} 
          color="text-green-400" 
          bg="bg-green-500/20"
          sub="All time"
        />
      </div>

      {/* ─── MY QUEUE SECTION ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-white">My Assigned Tickets</h2>
            <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 ml-3 h-5 px-2 text-[10px] font-bold">
              {myTickets.length} TICKETS
            </Badge>
          </div>
          <Link href="/it-staff/tickets" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">
            View All →
          </Link>
        </div>

        {myTickets.length === 0 ? (
          <div className="bg-[#1E2738] border border-[#2A3550] rounded-2xl py-24 text-center shadow-xl">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-5 opacity-80" />
            <h3 className="text-2xl font-bold text-white">Your queue is clear!</h3>
            <p className="text-[#7B8FAF] text-base mt-2 font-medium">No tickets assigned to you right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className={`bg-[#1E2738] border-[#2A3550] rounded-2xl p-6 hover:border-indigo-500/40 transition-all shadow-xl group/card relative overflow-hidden transition-all duration-300 border-l-4 ${
                  ticket.priority === 'critical' ? 'border-l-red-500 bg-red-950/5' : 
                  ticket.priority === 'high' ? 'border-l-orange-500' : 
                  ticket.priority === 'medium' ? 'border-l-yellow-500' : 
                  'border-l-green-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                      <span className="text-[#7B8FAF] text-xs font-medium uppercase tracking-tighter">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white leading-tight">
                      {ticket.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                       <User className="w-4 h-4 text-[#7B8FAF]" />
                       <span className="text-[#7B8FAF] text-sm font-medium">
                         Submitted by <span className="text-white">{ticket.submitter?.full_name}</span>
                       </span>
                    </div>

                    <p className="text-[#8FA3BF] text-[15px] leading-relaxed line-clamp-2 mt-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 md:pt-0 min-w-[200px] justify-end">
                    {ticket.status === 'open' && (
                      <Button 
                        onClick={() => updateStatus(ticket.id, 'in_progress')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest px-5 h-11 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                      >
                        Start Working
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button 
                        onClick={() => updateStatus(ticket.id, 'resolved')}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-widest px-5 h-11 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                      >
                        Mark Resolved
                      </Button>
                    )}
                    <Link href={`/it-staff/tickets/${ticket.id}`}>
                      <Button 
                        variant="ghost" 
                        className="text-[#7B8FAF] hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest h-11 px-5 rounded-xl transition-colors"
                      >
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
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
    <Card className="bg-[#1E2738] border border-[#2A3550] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7B8FAF]">{title}</span>
      </div>
      <div>
        <h3 className="text-5xl font-bold text-white tracking-tighter leading-none">{value}</h3>
        <p className="text-xs font-bold text-[#7B8FAF] mt-3 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{sub}</p>
      </div>
    </Card>
  );
}
