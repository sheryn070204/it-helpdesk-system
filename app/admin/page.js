import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

/**
 * AdminDashboard — the main operations center for IT staff.
 *
 * Shows:
 * - Stats row: Total, Open, In Progress, Resolved, Critical ticket counts
 * - A highlighted section for Critical/High priority tickets
 * - A table of the 10 most recent tickets with ID, title, priority, status, submitter, and date
 */
export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all tickets with submitter profile info (using a join)
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(`
      id,
      title,
      priority,
      status,
      created_at,
      submitted_by,
      profiles!tickets_submitted_by_fkey (full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-red-700 font-mono text-sm">
        ERROR: {error.message}
      </div>
    );
  }

  // Compute dashboard stats
  const stats = {
    total:       tickets?.length ?? 0,
    open:        tickets?.filter((t) => t.status === "open").length ?? 0,
    in_progress: tickets?.filter((t) => t.status === "in_progress").length ?? 0,
    resolved:    tickets?.filter((t) => t.status === "resolved").length ?? 0,
    critical:    tickets?.filter((t) => t.priority === "critical").length ?? 0,
  };

  // Urgent tickets: critical or high priority, not yet resolved
  const urgentTickets = tickets?.filter(
    (t) => (t.priority === "critical" || t.priority === "high") && t.status !== "resolved"
  ) ?? [];

  // Latest 10 tickets for the main table
  const recentTickets = tickets?.slice(0, 10) ?? [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1 font-mono">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Tickets" value={stats.total} className="bg-slate-800 text-white" />
        <StatCard label="Open" value={stats.open} className="bg-blue-50 text-blue-900 border border-blue-100" />
        <StatCard label="In Progress" value={stats.in_progress} className="bg-amber-50 text-amber-900 border border-amber-100" />
        <StatCard label="Resolved" value={stats.resolved} className="bg-green-50 text-green-900 border border-green-100" />
        <StatCard label="⚠ Critical" value={stats.critical} className="bg-red-50 text-red-900 border border-red-200" urgent />
      </div>

      {/* Urgent Tickets Alert */}
      {urgentTickets.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
            <h2 className="font-semibold text-red-800 text-sm">
              {urgentTickets.length} Urgent Ticket{urgentTickets.length > 1 ? "s" : ""} Requiring Attention
            </h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {urgentTickets.slice(0, 5).map((ticket) => (
              <li key={ticket.id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">{ticket.title}</p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    #{ticket.id.slice(0, 8)} · {ticket.profiles?.full_name ?? "Unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <Link
                    href={`/admin/tickets/${ticket.id}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Tickets</h2>
          <Link href="/admin/tickets" className="text-sm text-indigo-600 hover:underline font-medium">
            View all tickets →
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <p className="font-mono text-sm">No tickets in the system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {ticket.profiles?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatCard({ label, value, className, urgent }) {
  return (
    <div className={`rounded-xl p-5 ${className}`}>
      <p className={`text-3xl font-bold ${urgent && value > 0 ? "animate-pulse" : ""}`}>
        {value}
      </p>
      <p className="text-sm font-medium mt-1 opacity-70">{label}</p>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    critical: "bg-red-100 text-red-700",
    high:     "bg-orange-100 text-orange-700",
    medium:   "bg-yellow-100 text-yellow-700",
    low:      "bg-green-100 text-green-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[priority] ?? "bg-slate-100 text-slate-600"}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    open:        "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved:    "bg-green-100 text-green-700",
  };
  const labels = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
