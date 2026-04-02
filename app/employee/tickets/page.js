import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function EmployeeTicketsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, title, priority, status, created_at, description")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  const isEmpty = !tickets || tickets.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Requests</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Track the status of all IT tickets you've submitted.
            </p>
          </div>
        </div>
        <Link
          href="/employee/submit"
          className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Link>
      </div>

      {/* ─── Tickets List ─── */}
      {isEmpty ? (
        <div className="bg-white border text-center p-16 rounded-[3rem] border-dashed border-gray-200">
          <span className="text-4xl block mb-4">📭</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            You haven't submitted any IT tickets yet. If you need assistance, creating a request takes just a minute!
          </p>
          <Link
            href="/employee/submit"
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            Create Your First Request &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ticket Card Component ───
function TicketCard({ ticket }) {
  const priorityStyles = {
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-green-50 text-green-700 border-green-200",
  };

  const statusStyles = {
    open: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-700",
    resolved: "bg-green-50 text-green-700",
  };

  const statusLabels = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved"
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-lg border ${priorityStyles[ticket.priority]}`}>
              {ticket.priority} priority
            </span>
            <span className="text-sm font-medium text-gray-400">
              Submitted {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {ticket.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
            {ticket.description}
          </p>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 gap-4">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm ${statusStyles[ticket.status]}`}>
            {ticket.status === 'in_progress' && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
            {ticket.status === 'open' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>}
            {ticket.status === 'resolved' && <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>}
            {statusLabels[ticket.status] || ticket.status}
          </div>
          
          <span className="text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            ID: {ticket.id.slice(0, 8)}
          </span>
        </div>
      </div>
    </div>
  );
}
