import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

/**
 * Employee Dashboard — the homepage after an employee logs in.
 *
 * Shows:
 * - A personalized welcome message
 * - Summary stat cards (Total, Open, In Progress, Resolved)
 * - A list of the 5 most recent tickets with status badges
 * - A prominent "Submit New Ticket" CTA button
 */
export default async function EmployeeDashboard() {
  const supabase = await createClient();

  // Get the current user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the user's profile for their name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Fetch ALL of this employee's tickets to compute stats
  const { data: allTickets, error } = await supabase
    .from("tickets")
    .select("id, title, status, priority, created_at")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-red-500">Failed to load your tickets. Please refresh.</p>;
  }

  // Compute stats from the fetched data
  const stats = {
    total: allTickets?.length ?? 0,
    open: allTickets?.filter((t) => t.status === "open").length ?? 0,
    in_progress: allTickets?.filter((t) => t.status === "in_progress").length ?? 0,
    resolved: allTickets?.filter((t) => t.status === "resolved").length ?? 0,
  };

  // Only show the 5 most recent tickets in the preview list
  const recentTickets = allTickets?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your IT requests.</p>
        </div>
        <Link
          href="/employee/submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit New Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={stats.total} color="blue" icon="📋" />
        <StatCard label="Open" value={stats.open} color="sky" icon="🔵" />
        <StatCard label="In Progress" value={stats.in_progress} color="amber" icon="🟡" />
        <StatCard label="Resolved" value={stats.resolved} color="green" icon="✅" />
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
          <Link href="/employee/tickets" className="text-sm text-blue-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-medium text-gray-700">No tickets yet!</p>
            <p className="text-sm text-gray-400 mt-1">
              Got an IT issue? Submit your first ticket and we&apos;ll take care of it.
            </p>
            <Link
              href="/employee/submit"
              className="mt-4 inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Submit a Ticket
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentTickets.map((ticket) => (
              <li key={ticket.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(ticket.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ label, value, color, icon }) {
  const colors = {
    blue:  "bg-blue-50 text-blue-700 border-blue-100",
    sky:   "bg-sky-50 text-sky-700 border-sky-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    green: "bg-green-50 text-green-700 border-green-100",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-green-100 text-green-700",
  };
  const labels = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[priority] ?? "bg-gray-100 text-gray-600"}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
}
