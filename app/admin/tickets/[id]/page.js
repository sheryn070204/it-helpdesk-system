"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/**
 * TicketDetailPage — full view of a single ticket for IT admins.
 *
 * Features:
 * - Displays all ticket details (title, description, priority, status, submitter)
 * - Dropdown to update ticket STATUS (open → in_progress → resolved)
 * - Dropdown to ASSIGN ticket to an IT staff member
 * - Save Changes button that writes updates to Supabase
 * - Shows a "last updated" timestamp when changes are saved
 */
export default function TicketDetailPage({ params }) {
  const router = useRouter();
  const [ticketId, setTicketId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form state for editable fields
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  // Resolve params (async in Next.js App Router)
  useEffect(() => {
    params.then((resolvedParams) => {
      setTicketId(resolvedParams.id);
    });
  }, [params]);

  // Fetch ticket details and list of admin users
  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError("");

    // Fetch the specific ticket with submitter and assignee names
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(`
        id,
        title,
        description,
        priority,
        status,
        created_at,
        assigned_to,
        submitted_by,
        submitter:profiles!tickets_submitted_by_fkey (full_name),
        assignee:profiles!tickets_assigned_to_fkey (full_name)
      `)
      .eq("id", id)
      .single();

    if (ticketError) {
      setError("Ticket not found or you do not have permission to view it.");
      setLoading(false);
      return;
    }

    setTicket(ticketData);
    setSelectedStatus(ticketData.status);
    setSelectedAssignee(ticketData.assigned_to ?? "");

    // Fetch all admin/IT staff for the assignee dropdown
    const { data: adminData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "admin");

    setAdmins(adminData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ticketId) {
      fetchData(ticketId);
    }
  }, [ticketId, fetchData]);

  // Handle saving changes
  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    const updatePayload = {
      status: selectedStatus,
      assigned_to: selectedAssignee || null,
    };

    const { error: updateError } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccessMessage(`Changes saved at ${new Date().toLocaleTimeString()}`);
      // Refresh ticket data to reflect changes
      fetchData(ticketId);
    }

    setSaving(false);
  }

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading ticket...
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error && !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-mono text-sm">{error}</p>
        <Link href="/admin/tickets" className="text-indigo-600 text-sm mt-3 inline-block hover:underline">
          ← Back to all tickets
        </Link>
      </div>
    );
  }

  const hasChanges =
    selectedStatus !== ticket?.status ||
    selectedAssignee !== (ticket?.assigned_to ?? "");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
        <Link href="/admin" className="hover:text-indigo-500 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/tickets" className="hover:text-indigo-500 transition-colors">Tickets</Link>
        <span>/</span>
        <span className="text-slate-600">#{ticket?.id?.slice(0, 8)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left: Ticket Details ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Priority */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{ticket?.title}</h1>
              <PriorityBadge priority={ticket?.priority} />
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>ID: #{ticket?.id?.slice(0, 8)}</span>
              <span>·</span>
              <span>
                Submitted:{" "}
                {new Date(ticket?.created_at).toLocaleDateString("en-US", {
                  weekday: "short", year: "numeric", month: "short", day: "numeric",
                })}
              </span>
              <span>·</span>
              <span>By: <strong className="text-slate-600">{ticket?.submitter?.full_name ?? "Unknown"}</strong></span>
            </div>

            {/* Description */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Problem Description
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {ticket?.description}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right: Actions Panel ─── */}
        <div className="space-y-4">
          {/* Current Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
              Ticket Management
            </h2>

            {/* Status Update */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={ticket?.status} size="sm" />
                {ticket?.status !== selectedStatus && (
                  <span className="text-xs text-slate-400">→</span>
                )}
                {ticket?.status !== selectedStatus && (
                  <StatusBadge status={selectedStatus} size="sm" />
                )}
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Assignee Update */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Assigned To
              </label>
              <div className="text-xs text-slate-400 mb-2 font-mono">
                Currently: {ticket?.assignee?.full_name ?? "Unassigned"}
              </div>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
              >
                <option value="">— Unassigned —</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-mono">
                ERROR: {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-xs text-green-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successMessage}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>

            {!hasChanges && !successMessage && (
              <p className="text-xs text-slate-400 text-center">No changes to save</p>
            )}
          </div>

          {/* Quick Info Card */}
          <div className="bg-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Info</h3>
            <div className="space-y-2.5">
              <InfoRow label="Priority" value={<PriorityBadge priority={ticket?.priority} />} />
              <InfoRow label="Status" value={<StatusBadge status={ticket?.status} />} />
              <InfoRow
                label="Ticket ID"
                value={<span className="font-mono text-xs text-indigo-400">#{ticket?.id}</span>}
              />
              <InfoRow
                label="Created"
                value={
                  <span className="text-slate-300 text-xs">
                    {new Date(ticket?.created_at).toLocaleDateString()}
                  </span>
                }
              />
            </div>
          </div>

          {/* Back link */}
          <Link
            href="/admin/tickets"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all tickets
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <div>{value}</div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    critical: "bg-red-500 text-white",
    high:     "bg-orange-100 text-orange-700",
    medium:   "bg-yellow-100 text-yellow-700",
    low:      "bg-green-100 text-green-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${styles[priority] ?? "bg-slate-100 text-slate-600"}`}>
      {priority?.toUpperCase()}
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
