"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminTicketsMasterList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("tickets")
      .select(`
        id, title, description, priority, status, created_at,
        submitter:profiles!tickets_submitted_by_fkey (full_name),
        assignee:profiles!tickets_assigned_to_fkey (full_name)
      `);

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc"); // default new field to desc
    }
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    // 1. Filter
    let result = tickets.filter((ticket) => {
      const matchStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        ticket.title.toLowerCase().includes(q) ||
        ticket.id.toLowerCase().includes(q) ||
        (ticket.submitter?.full_name || "").toLowerCase().includes(q);
      return matchStatus && matchPriority && matchSearch;
    });

    // 2. Sort
    result.sort((a, b) => {
      let valA, valB;

      if (sortField === "created_at") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortField === "priority") {
        const order = { critical: 4, high: 3, medium: 2, low: 1 };
        valA = order[a.priority] || 0;
        valB = order[b.priority] || 0;
      } else if (sortField === "status") {
        const order = { open: 3, in_progress: 2, resolved: 1 };
        valA = order[a.status] || 0;
        valB = order[b.status] || 0;
      } else {
        valA = a[sortField] || "";
        valB = b[sortField] || "";
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [tickets, statusFilter, priorityFilter, searchQuery, sortField, sortDir]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header & Controls ─── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Ticket Database</h1>
            <p className="text-sm font-mono text-slate-500 uppercase tracking-widest mt-1">
              {filteredAndSorted.length} Records Found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search ID, Title, User..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-shadow outline-none bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* ─── Bulk Filters ─── */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Stage</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['all', 'open', 'in_progress', 'resolved'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${statusFilter === opt ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {opt === 'all' ? 'Any' : opt.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Threat Level</span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['all', 'critical', 'high', 'medium', 'low'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setPriorityFilter(opt)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${priorityFilter === opt ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Data Table ─── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-20 text-center text-slate-400 font-mono text-sm flex items-center justify-center gap-2">
             <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            Syncing Database...
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="px-6 py-20 text-center text-slate-500">
            No records found for the current query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortableHeader label="TICKET ID" field="id" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="PRIORITY" field="priority" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="TITLE & ISSUE" field="title" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="STATUS" field="status" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                  <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-default">SUBMITTER</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-default">ASSIGNED TO</th>
                  <SortableHeader label="CREATED" field="created_at" currentSort={sortField} currentDir={sortDir} onSort={handleSort} />
                  <th className="px-5 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSorted.map(ticket => (
                  <tr key={ticket.id} className={`hover:bg-slate-50/70 transition-colors group ${ticket.priority === 'critical' && ticket.status !== 'resolved' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border ${
                        ticket.priority === 'critical' ? 'bg-red-100/50 text-red-700 border-red-200' :
                        ticket.priority === 'high' ? 'bg-orange-100/50 text-orange-700 border-orange-200' :
                        ticket.priority === 'medium' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-200' :
                        'bg-green-100/50 text-green-700 border-green-200'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 min-w-[200px] max-w-[300px]">
                      <p className="font-semibold text-slate-900 truncate">{ticket.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        ticket.status === 'open' ? 'bg-blue-50 text-blue-700' :
                        ticket.status === 'in_progress' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {ticket.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {ticket.submitter?.full_name || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {ticket.assignee ? (
                        <span className="text-slate-600 font-medium">{ticket.assignee.full_name}</span>
                      ) : (
                        <span className="text-slate-400 italic font-mono text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                       <Link 
                         href={`/admin/tickets/${ticket.id}`}
                         className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                       >
                         Manage
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

function SortableHeader({ label, field, currentSort, currentDir, onSort }) {
  const isSorted = currentSort === field;
  return (
    <th 
      className="px-5 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors group select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={`text-[10px] ${isSorted ? 'text-indigo-500' : 'text-transparent group-hover:text-slate-300'}`}>
          {isSorted && currentDir === 'desc' ? '▼' : '▲'}
        </span>
      </div>
    </th>
  );
}
