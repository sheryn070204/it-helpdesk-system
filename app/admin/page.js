import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Ticket, Clock, Loader2, CheckCircle2, UserCheck } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all tickets for system-wide stats
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id, title, priority, status, created_at, assigned_to,
      submitter:profiles!tickets_submitted_by_fkey (full_name),
      assignee:profiles!tickets_assigned_to_fkey (full_name)
    `)
    .order("created_at", { ascending: false });

  // 1. KPI Calculations
  const t = tickets || [];
  const total = t.length;
  const critical = t.filter(x => x.priority === "critical" && x.status !== "resolved").length;
  const open = t.filter(x => x.status === "open").length;
  const inProgress = t.filter(x => x.status === "in_progress").length;
  const resolved = t.filter(x => x.status === "resolved").length;

  // 2. Priority Breakdown Data (CSS Chart)
  const pCounts = {
    critical: t.filter(x => x.priority === "critical").length,
    high: t.filter(x => x.priority === "high").length,
    medium: t.filter(x => x.priority === "medium").length,
    low: t.filter(x => x.priority === "low").length,
  };
  const maxP = Math.max(pCounts.critical, pCounts.high, pCounts.medium, pCounts.low) || 1;

  // 3. Recent Critical/High tickets (Urgent)
  const urgentTickets = t
    .filter(x => (x.priority === "critical" || x.priority === "high") && x.status !== "resolved")
    .slice(0, 5);

  const recentTickets = t.slice(0, 8);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Live Helpdesk Metrics & Operations</p>
        </div>
      </div>

      {/* ─── KPI Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard title="Total Tickets" value={total} icon={Ticket} color="text-slate-400" bg="bg-slate-800" border="border-slate-800" />
        <KpiCard title="Open Queue" value={open} icon={Clock} color="text-blue-400" bg="bg-blue-900/30" border="border-blue-900/50" />
        <KpiCard title="In Progress" value={inProgress} icon={Loader2} color="text-amber-400" bg="bg-amber-900/30" border="border-amber-900/50" />
        <KpiCard title="Resolved" value={resolved} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-900/30" border="border-emerald-900/50" />
        <KpiCard 
          title="Active Critical" 
          value={critical} 
          icon={ShieldAlert} 
          color="text-red-400" 
          bg="bg-red-900/30" 
          border="border-red-900/50"
          alert={critical > 0} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Priority Breakdown ─── */}
        <Card className="lg:col-span-1 shadow-sm border-slate-800 bg-[#18181b]">
          <CardHeader className="pb-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Tickets by Priority</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChartBar label="Critical" count={pCounts.critical} max={maxP} bg="bg-red-500" icon={ShieldAlert} iconColor="text-red-500" />
            <ChartBar label="High" count={pCounts.high} max={maxP} bg="bg-orange-500" icon={AlertTriangle} iconColor="text-orange-500" />
            <ChartBar label="Medium" count={pCounts.medium} max={maxP} bg="bg-amber-500" icon={AlertCircle} iconColor="text-amber-500" />
            <ChartBar label="Low" count={pCounts.low} max={maxP} bg="bg-emerald-500" icon={Info} iconColor="text-emerald-500" />
          </CardContent>
        </Card>

        {/* ─── Urgent Tickets ─── */}
        <Card className="lg:col-span-2 shadow-[0_0_20px_rgba(239,68,68,0.05)] border-red-900/30 bg-[#18181b] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-red-900/20 bg-red-950/10 flex items-center gap-3">
             <div className="relative">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div className="absolute inset-0 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-20" />
             </div>
             <div>
               <h2 className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">Urgent Response Required</h2>
               <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-wider">Critical priority tickets awaiting triage</p>
             </div>
          </div>
          <CardContent className="flex-1 p-0 overflow-auto">
            {urgentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="font-bold text-slate-200 text-lg">No urgent tickets!</p>
                <p className="text-sm text-slate-500 mt-1">The system is currently healthy.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {urgentTickets.map(ticket => (
                  <div key={ticket.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors border-l-4 border-l-transparent hover:border-l-red-500">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        {getPriorityBadge(ticket.priority)}
                        <span className="text-xs font-mono text-slate-500">#{ticket.id.slice(0, 8)}</span>
                      </div>
                      <p className="font-bold text-white text-base truncate">{ticket.title}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Reported by <span className="font-semibold text-slate-300">{ticket.submitter?.full_name}</span> • {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm" className="font-bold text-indigo-400 hover:text-indigo-300 border-indigo-900/50 hover:bg-indigo-950/50 bg-[#09090b]">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Recent Tickets Table ─── */}
      <Card className="shadow-sm border-slate-800 bg-[#18181b] overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-transparent">
          <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Recent System Activity</h2>
          <Link href="/admin/tickets">
            <Button variant="link" className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest p-0 h-auto hover:text-indigo-300">View Entire Queue →</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent h-14 bg-transparent transition-none">
                <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest pl-8 w-[100px]">ID Ref</TableHead>
                <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">Incident</TableHead>
                <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center">Priority</TableHead>
                <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right pr-8">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.map(ticket => (
                <TableRow key={ticket.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors h-16 group">
                  <TableCell className="pl-8 font-mono text-[10px] text-slate-500">
                    {ticket.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="py-2">
                     <div className="flex flex-col gap-0.5">
                       <span className="font-bold text-slate-100 text-sm max-w-[250px] truncate">{ticket.title}</span>
                       <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">By: {ticket.submitter?.full_name || "Unknown"}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-center px-4">
                    {getPriorityBadge(ticket.priority)}
                  </TableCell>
                  <TableCell className="text-center px-4">
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Link href={`/admin/tickets/${ticket.id}`}>
                      <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-600/20 border border-transparent hover:border-indigo-500/30 transition-all rounded-lg px-6 h-9 bg-indigo-500/5">
                        Analyze
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

    </div>
  );
}

// ─── Sub-components ───

function KpiCard({ title, value, icon: Icon, color, bg, border = "border-slate-800", alert }) {
  return (
    <Card className={`overflow-hidden bg-[#18181b] shadow-sm transition-all hover:shadow-md border ${alert ? 'border-red-900/50 ring-1 ring-red-500/20' : border}`}>
      {alert && <div className="h-1 w-full bg-red-500 absolute top-0 left-0" />}
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-xl ${bg} ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black text-white tracking-tight leading-none mb-1.5">{value}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartBar({ label, count, max, bg, icon: Icon, iconColor }) {
  const widthPct = Math.round((count / max) * 100) + "%";
  return (
    <div>
      <div className="flex justify-between items-center text-sm font-bold mb-2">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          {label}
        </span>
        <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-xs">{count}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${bg}`} 
          style={{ width: count === 0 ? "0%" : widthPct }}
        />
      </div>
    </div>
  );
}
