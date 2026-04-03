import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function ITStaffAssignedTickets() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id,
      title,
      priority,
      status,
      created_at,
      submitter:profiles!tickets_submitted_by_fkey (full_name)
    `)
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false });

  // Reusable styling for status and priority
  const priorityStyles = {
    critical: "bg-red-500/10 text-red-400 border border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };

  const statusStyles = {
    open: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    resolved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  };

  const statusLabels = {
    open: "Open",
    in_progress: "Working",
    resolved: "Resolved"
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assigned Tickets</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete history of all tasks ever assigned to you.
          </p>
        </div>
      </div>

      <div className="bg-[#18181b] rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0c0d12] border-b border-slate-800 text-slate-500 uppercase tracking-wider font-semibold text-xs text-left">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {tickets?.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-200">{ticket.title}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">#{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {ticket.submitter?.full_name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${priorityStyles[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[ticket.status]}`}>
                      {statusLabels[ticket.status] ?? ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/it-staff/tickets/${ticket.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {(!tickets || tickets.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 italic">
                    No tickets have been assigned to you yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
