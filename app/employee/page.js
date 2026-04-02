import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const supabase = await createClient();

  // 1. Get current logged-in employee
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Handled by layout redirect

  // 2. Fetch full name for greeting
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // 3. Fetch all their tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, title, status, priority, created_at")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  // 4. Calculate Stats
  const total = tickets?.length || 0;
  const open = tickets?.filter((t) => t.status === "open").length || 0;
  const inProgress = tickets?.filter((t) => t.status === "in_progress").length || 0;
  const resolved = tickets?.filter((t) => t.status === "resolved").length || 0;

  // 5. Get 5 most recent tickets for list
  const recentTickets = tickets?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* ─── Hero Welcome Section ─── */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 text-white shadow-lg relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-32 right-10 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Hi, {profile?.full_name?.split(' ')[0] || "there"} 👋
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl leading-relaxed">
            Welcome to the IT Helpdesk. Whether you need software installed, hardware fixed, or just have a technical question — we've got you covered.
          </p>
          <Link
            href="/employee/submit"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3.5 rounded-xl font-bold transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit a New Request
          </Link>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value={total} icon="cube" />
        <StatCard title="Open" value={open} icon="document" color="blue" />
        <StatCard title="In Progress" value={inProgress} icon="cog" color="amber" />
        <StatCard title="Resolved" value={resolved} icon="check" color="green" />
      </div>

      {/* ─── Recent Tickets Table ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
          {total > 5 && (
            <Link href="/employee/tickets" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              View all →
            </Link>
          )}
        </div>

        {recentTickets.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No requests yet</h3>
            <p className="text-gray-500">When you submit an IT ticket, it will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-50">
              {recentTickets.map((ticket) => (
                <li key={ticket.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4 group">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate text-base mb-1">
                      {ticket.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      Submitted on {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={ticket.status} />
                    <Link
                      href="/employee/tickets"
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatCard({ title, value, icon, color = "gray" }) {
  const colorStyles = {
    gray: "bg-gray-50 text-gray-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
  };

  const icons = {
    cube: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    document: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    cog: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    check: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
      <div className="relative z-10 flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${colorStyles[color]}`}>
          {icons[icon]}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mt-1">{title}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    open: "bg-blue-50 text-blue-600 border border-blue-200",
    in_progress: "bg-amber-50 text-amber-600 border border-amber-200",
    resolved: "bg-green-50 text-green-600 border border-green-200",
  };
  const labels = {
    open: "Open",
    in_progress: "Working",
    resolved: "Resolved"
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
}
