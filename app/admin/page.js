import { createClient } from "@/lib/supabaseServer";
import { 
  Ticket, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Activity,
  Zap,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { UserAvatar } from "@/components/UserAvatar";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Fetch Stats
  const { data: tickets } = await supabase.from("tickets").select("status, priority");
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

  const totalTickets = tickets?.length || 0;
  const openTickets = tickets?.filter((t) => t.status === "open").length || 0;
  const resolvedTickets = tickets?.filter((t) => t.status === "resolved").length || 0;
  const criticalTickets = tickets?.filter((t) => t.priority === "critical").length || 0;

  // 2. Fetch Recent Activity
  const { data: recentTickets } = await supabase
    .from("tickets")
    .select(`
      id, title, status, priority, created_at,
      submitter:profiles!tickets_submitted_by_fkey (full_name, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ─── PRO DASHBOARD HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Overview of all helpdesk tickets and activity.</p>
        </div>
      </div>

      {/* ─── KPI GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="TOTAL TICKETS" 
          value={totalTickets} 
          icon={Activity} 
          trend="" 
          color="text-indigo-400"
          bg="bg-indigo-500/10"
        />
        <KpiCard 
          title="OPEN TICKETS" 
          value={openTickets} 
          icon={Zap} 
          trend="" 
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
        <KpiCard 
          title="RESOLVED" 
          value={resolvedTickets} 
          icon={ShieldCheck} 
          trend="" 
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <KpiCard 
          title="CRITICAL" 
          value={criticalTickets} 
          icon={AlertCircle} 
          trend="" 
          color="text-red-400"
          bg="bg-red-500/10"
        />
      </div>

      {/* ─── MAIN CONTENT SPLIT ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recent Activity Table (Left 2/3) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-500" />
              Recent Tickets
            </h2>
            <Link href="/admin/tickets" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 group">
              View All →
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <Card className="bg-[#111113] border-white/5 shadow-2xl overflow-hidden rounded-3xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ticket</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Priority</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentTickets?.map((ticket) => (
                      <tr key={ticket.id} className="group hover:bg-white/[0.02] transition-colors h-24">
                        <td className="px-8 flex items-center gap-4 h-24">
                          <UserAvatar 
                            avatarUrl={ticket.submitter?.avatar_url} 
                            fullName={ticket.submitter?.full_name} 
                            size="default"
                            className="w-11 h-11"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate max-w-[200px] leading-tight mb-1">{ticket.title}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{ticket.submitter?.full_name}</p>
                          </div>
                        </td>
                        <td className="px-6 text-center">
                          <div className="flex justify-center">{getPriorityBadge(ticket.priority)}</div>
                        </td>
                        <td className="px-6 text-center">
                          <div className="flex justify-center">{getStatusBadge(ticket.status)}</div>
                        </td>
                        <td className="px-8 text-right">
                          <Link href={`/admin/tickets/${ticket.id}`}>
                            <button className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95">
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Stats (Right 1/3) */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-500" />
            IT Staff Overview
          </h2>
          <Card className="bg-[#111113] border-white/5 shadow-2xl rounded-3xl p-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-4xl font-black text-white tracking-tighter">{userCount}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Total Users</p>
              </div>
              <div className="pt-4">
                <Link href="/admin/settings">
                  <button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95">
                    Manage IT Staff
                  </button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, color, bg }) {
  return (
    <Card className="bg-[#111113] border-white/5 shadow-2xl rounded-3xl overflow-hidden relative group font-sans">
      <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
        <Icon className={`w-20 h-20 ${color}`} />
      </div>
      <CardContent className="p-8 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{title}</span>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{value}</h3>
          {trend && (
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              trend === 'Critical' ? 'text-red-500' : 'text-indigo-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
