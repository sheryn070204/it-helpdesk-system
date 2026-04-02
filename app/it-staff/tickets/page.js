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
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  const statusStyles = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    resolved: "bg-green-100 text-green-800",
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
          <h1 className="text-2xl font-bold text-slate-900">Assigned Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete history of all tasks ever assigned to you.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-xs text-left">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets?.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{ticket.title}</p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">#{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
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
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
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
