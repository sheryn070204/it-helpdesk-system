"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/**
 * AllTicketsPage — a filterable, searchable table of ALL tickets in the system.
 *
 * Features:
 * - Filter by status: all / open / in_progress / resolved
 * - Filter by priority: all / critical / high / medium / low
 * - Live search by title or description
 * - Each row links to the ticket detail page
 * - Data fetched on the client-side so filters are fully reactive
 */
export default function AllTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all tickets (with submitter and assignee names) on mount
  const fetchTickets = useCallback(async () => {
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("tickets")
      .select(`
        id,
        title,
        description,
        priority,
        status,
        created_at,
        submitted_by,
        assigned_to,
        submitter:profiles!tickets_submitted_by_fkey (full_name),
        assignee:profiles!tickets_assigned_to_fkey (full_name)
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTickets(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Apply all active filters to the tickets array
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      ticket.title.toLowerCase().includes(searchLower) ||
      ticket.description.toLowerCase().includes(searchLower);
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
        <p className="text-slate-500 text-sm mt-1 font-mono">
          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""} shown
          {tickets.length !== filteredTickets.length && ` (${tickets.length} total)`}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Status:</span>
          <FilterGroup
            options={["all", "open", "in_progress", "resolved"]}
            labels={{ all: "All", open: "Open", in_progress: "In Progress", resolved: "Resolved" }}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Priority:</span>
          <FilterGroup
            options={["all", "critical", "high", "medium", "low"]}
            labels={{ all: "All", critical: "Critical", high: "High", medium: "Medium", low: "Low" }}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-mono text-sm">
          ERROR: {error}
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center gap-2 text-slate-400 font-mono text-sm">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading tickets...
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 font-mono text-sm">
            No tickets match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      ticket.priority === "critical" ? "border-l-2 border-l-red-500" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">{ticket.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{ticket.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {ticket.submitter?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {ticket.assignee?.full_name ?? (
                        <span className="text-slate-300 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline whitespace-nowrap"
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

// ─── Filter Button Group ───
function FilterGroup({ options, labels, value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            value === option
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}

// ─── Badges ───
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
  const labels = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
  const styles = {
    open:        "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved:    "bg-green-100 text-green-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
