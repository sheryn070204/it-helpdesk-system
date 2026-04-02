import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all tickets for system-wide stats
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id, title, priority, status, created_at,
      submitter:profiles!tickets_submitted_by_fkey (full_name)
    `)
    .order("created_at", { ascending: false });

  // 1. KPI Calculations
  const t = tickets || [];
  const total = t.length;
  const critical = t.filter(x => x.priority === "critical" && x.status !== "resolved").length;
  const unassigned = t.filter(x => x.status === "open").length; // assuming open means needing action/assignment
  const resolved = t.filter(x => x.status === "resolved").length;

  // 2. Priority Breakdown Data (CSS Chart)
  const pCounts = {
    critical: t.filter(x => x.priority === "critical").length,
    high: t.filter(x => x.priority === "high").length,
    medium: t.filter(x => x.priority === "medium").length,
    low: t.filter(x => x.priority === "low").length,
  };
  // Math for percentages
  const maxP = Math.max(pCounts.critical, pCounts.high, pCounts.medium, pCounts.low) || 1;

  // 3. Recent Critical/High tickets
  const urgentTickets = t
    .filter(x => (x.priority === "critical" || x.priority === "high") && x.status !== "resolved")
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* ─── Page Header & Quick Actions ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-sm font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Live Metrics & Operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/tickets" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors border border-slate-700 font-mono">
            Access Master Logs
          </Link>
        </div>
      </div>

      {/* ─── Top KPI Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Active Critical" value={critical} trend={critical > 0 ? "URGENT" : "SAFE"} alert={critical > 0} color="red" />
        <KpiCard title="Unassigned / Open" value={unassigned} trend="QUEUE" color="indigo" />
        <KpiCard title="Total Resolved" value={resolved} trend="COMPLETE" color="emerald" />
        <KpiCard title="System Volume" value={total} trend="LIFETIME" color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* ─── Priority Volume Chart (CSS-based) ─── */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Priority Distribution
          </h2>
          <div className="space-y-5">
            <ChartBar label="Critical" count={pCounts.critical} max={maxP} color="bg-red-500" text="text-red-700" bg="bg-red-50" />
            <ChartBar label="High" count={pCounts.high} max={maxP} color="bg-orange-500" text="text-orange-700" bg="bg-orange-50" />
            <ChartBar label="Medium" count={pCounts.medium} max={maxP} color="bg-amber-500" text="text-amber-700" bg="bg-amber-50" />
            <ChartBar label="Low" count={pCounts.low} max={maxP} color="bg-emerald-500" text="text-emerald-700" bg="bg-emerald-50" />
          </div>
        </div>

        {/* ─── Urgent Action Required ─── */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Urgent Attention Required
            </h2>
            <span className="text-xs font-mono text-slate-400">Top {urgentTickets.length} items</span>
          </div>
          
          <div className="flex-1 overflow-auto">
            {urgentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                <svg className="w-10 h-10 text-emerald-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-slate-700">No active critical threats.</p>
                <p className="text-xs text-slate-400 mt-1">System is healthy and queues are managed.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-100">
                  {urgentTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded border ${
                            ticket.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {ticket.priority}
                          </span>
                          <span className="font-mono text-xs text-slate-400">#{ticket.id.slice(0, 8)}</span>
                        </div>
                        <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {ticket.title}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {ticket.submitter?.full_name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/tickets/${ticket.id}`}
                          className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-800 hover:text-white hover:border-slate-800 rounded-lg text-xs font-bold transition-all"
                        >
                          Triage &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function KpiCard({ title, value, trend, alert = false, color = "indigo" }) {
  const colors = {
    indigo: "border-indigo-500 text-indigo-600 bg-indigo-50",
    red: "border-red-500 text-red-600 bg-red-50",
    emerald: "border-emerald-500 text-emerald-600 bg-emerald-50",
    slate: "border-slate-400 text-slate-600 bg-slate-50"
  };
  
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden ${alert ? 'ring-1 ring-red-500 ring-opacity-20' : ''}`}>
      {alert && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end justify-between mt-3">
        <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
        <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${colors[color]}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function ChartBar({ label, count, max, color, text, bg }) {
  const widthPct = Math.round((count / max) * 100) + "%";
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-slate-600 uppercase tracking-wider">{label}</span>
        <span className={text}>{count}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color}`} 
          style={{ width: count === 0 ? "0%" : widthPct }}
        ></div>
      </div>
    </div>
  );
}
