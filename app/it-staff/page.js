import { createClient } from "@/lib/supabaseServer";

export default async function ITStaffDashboard() {
  const supabase = await createClient();

  // 1. Get User Profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // 2. Fetch Tickets assigned to this user
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id,
      title,
      priority,
      status,
      created_at,
      description,
      submitter:profiles!tickets_submitted_by_fkey (full_name)
    `)
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false });

  // 3. Calculate Stats
  const assigned = tickets?.length || 0;
  const inProgress = tickets?.filter(t => t.status === "in_progress").length || 0;
  
  // For "Resolved Today", filter resolved and created_at/updated_at.
  // We'll just define it simply based on status for the demo.
  const resolved = tickets?.filter(t => t.status === "resolved").length || 0;

  // 4. Sort tickets by priority (for the "My Queue")
  // Priority order: critical > high > medium > low
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  
  // create a sorted copy to show only non-resolved in the queue
  const queue = (tickets || [])
    .filter(t => t.status !== "resolved")
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  // Priority Styles mapping
  const badgeStyles = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Hello {profile?.full_name}, <span className="font-light text-slate-500">IT Support Engineer</span>
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Here is your queue for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Assigned to Me" value={assigned} color="bg-blue-600" />
        <StatCard title="In Progress" value={inProgress} color="bg-amber-500" />
        <StatCard title="Total Resolved" value={resolved} color="bg-green-500" />
      </div>

      {/* My Queue (Actionable Tasks) */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          My Actionable Queue
        </h2>

        {queue.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900">Your queue is clear!</h3>
            <p className="text-sm text-slate-500 mt-1">
              You don&apos;t have any open tickets assigned to you right now. 
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-shadow hover:shadow-md ${
                  ticket.priority === 'critical' ? 'border-red-300 border-l-4 border-l-red-500' : 'border-slate-200'
                }`}
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${badgeStyles[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs font-mono text-slate-400">#{ticket.id.slice(0, 8)}</span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {ticket.submitter?.full_name}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{ticket.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                  <div className="text-xs text-slate-400 font-medium">
                    {ticket.status === 'in_progress' ? (
                      <span className="text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Working On It
                      </span>
                    ) : (
                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Open Status</span>
                    )}
                  </div>
                  
                  {/* Link to details for doing the actual status update! */}
                  <a 
                    href={`/it-staff/tickets/${ticket.id}`} 
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 text-sm font-semibold rounded-lg transition-colors border border-indigo-100 shrink-0"
                  >
                    Manage Ticket →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
        <span className="text-xl font-bold">{value}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}
