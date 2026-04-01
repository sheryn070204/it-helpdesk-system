import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

/**
 * MyTicketsPage — shows all tickets submitted by the current employee.
 *
 * - Sorted newest first
 * - Each row shows: title, priority badge, status badge, and date
 * - Shows a success banner when redirected from the submit page (?submitted=true)
 * - RLS in Supabase ensures employees can ONLY see their own tickets
 */
export default async function MyTicketsPage({ searchParams }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all tickets for this user, newest first
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("id, title, description, priority, status, created_at")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        Failed to load tickets: {error.message}
      </div>
    );
  }

  // Check if user was just redirected here after submitting a ticket
  const justSubmitted = (await searchParams)?.submitted === "true";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-500 mt-1">All IT requests you have submitted.</p>
      </div>

      {/* Success Banner — shown after a ticket is submitted */}
      {justSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800">Ticket submitted successfully!</p>
            <p className="text-sm text-green-600">Our IT team has been notified and will get back to you soon.</p>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="font-semibold text-gray-700">No tickets yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            When you submit an IT request, it will appear here.
          </p>
          <Link
            href="/employee/submit"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Submit Your First Ticket
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <div className="col-span-5">Title</div>
            <div className="col-span-2 text-center">Priority</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-3 text-right">Submitted</div>
          </div>

          {/* Table Rows */}
          <ul className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center">
                  {/* Title */}
                  <div className="col-span-5 min-w-0 mb-2 sm:mb-0">
                    <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate sm:hidden">
                      {new Date(ticket.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Priority */}
                  <div className="col-span-2 flex sm:justify-center mb-2 sm:mb-0">
                    <PriorityBadge priority={ticket.priority} />
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex sm:justify-center mb-2 sm:mb-0">
                    <StatusBadge status={ticket.status} />
                  </div>

                  {/* Date */}
                  <div className="col-span-3 hidden sm:block text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Short description preview */}
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {ticket.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Badge Components ───

function PriorityBadge({ priority }) {
  const styles = {
    critical: "bg-red-100 text-red-700 ring-1 ring-red-200",
    high:     "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
    medium:   "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200",
    low:      "bg-green-100 text-green-700 ring-1 ring-green-200",
  };
  const labels = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[priority] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[priority] ?? priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    open:        "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    in_progress: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    resolved:    "bg-green-100 text-green-700 ring-1 ring-green-200",
  };
  const labels = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
