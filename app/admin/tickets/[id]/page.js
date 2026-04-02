"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

/**
 * TicketDetailPage — full view of a single ticket for IT admins.
 * ENHANCED UI
 */
export default function TicketDetailPage({ params }) {
  const router = useRouter();
  const [ticketId, setTicketId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [itStaff, setItStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form state for editable fields
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setTicketId(resolvedParams.id);
    });
  }, [params]);

  // Fetch ticket details and list of IT Staff
  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError("");

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

    // ONLY fetch 'it_staff' members for assignment
    const { data: staffData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", ["it_staff", "it-staff"]);

    setItStaff(staffData ?? []);
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

    // Get current Admin session for notifications
    const { data: { user } } = await supabase.auth.getUser();
    let currentAdminName = "IT Admin";
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profileData?.full_name) {
        currentAdminName = profileData.full_name;
      }
    }

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
      setSaving(false);
      return;
    }

    setSuccessMessage(`Changes saved at ${new Date().toLocaleTimeString()}`);

    // ==========================================
    // NOTIFICATIONS ENGINE
    // ==========================================

    // 1. Assignment changed
    if (selectedAssignee && selectedAssignee !== (ticket?.assigned_to ?? "")) {
      const staffMember = itStaff.find((s) => s.id === selectedAssignee);
      const staffName = staffMember ? staffMember.full_name : "IT Staff";

      // Notify the IT staff member
      await createNotification(
        selectedAssignee,
        ticketId,
        "ticket_assigned",
        `You have been assigned ticket #${ticketId.slice(0, 8)}: ${ticket.title} Priority: ${ticket.priority} | Submitted by: ${ticket?.submitter?.full_name || "Unknown"}`
      );

      // Notify the admin who assigned it
      if (user) {
        await createNotification(
          user.id,
          ticketId,
          "ticket_assigned",
          `You assigned ticket #${ticketId.slice(0, 8)}: ${ticket.title} to ${staffName}`
        );
      }
    }

    // 2. Status changed
    if (selectedStatus !== ticket?.status) {
      // Notify the Employee (Submitter)
      if (selectedStatus === "in_progress") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_updated",
          `Your ticket '${ticket.title}' is now being worked on by our IT team.`
        );
      } else if (selectedStatus === "resolved") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_resolved",
          `Great news! Your ticket '${ticket.title}' has been resolved. Please verify and let us know if you need further assistance.`
        );
      }

      // Notify Admin
      if (user) {
        await createNotification(
          user.id,
          ticketId,
          "ticket_updated",
          `Ticket '${ticket.title}' status updated to ${selectedStatus} by ${currentAdminName}`
        );
      }
    }

    // Refresh ticket data to reflect changes
    fetchData(ticketId);
    setSaving(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          ACCESSING DATABANKS...
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error && !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm max-w-2xl mx-auto mt-10">
        <div className="flex items-start gap-4">
           <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           <div>
              <h3 className="text-red-800 font-bold">Access Denied</h3>
              <p className="text-red-700 font-mono text-sm mt-1">{error}</p>
              <Link href="/admin/tickets" className="text-red-600 text-sm mt-4 font-bold inline-block hover:underline">
                &larr; Return to Master List
              </Link>
           </div>
        </div>
      </div>
    );
  }

  const hasChanges =
    selectedStatus !== ticket?.status ||
    selectedAssignee !== (ticket?.assigned_to ?? "");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
        <Link href="/admin" className="hover:text-indigo-600 transition-colors">OpCenter</Link>
        <span>/</span>
        <Link href="/admin/tickets" className="hover:text-indigo-600 transition-colors">Tickets</Link>
        <span>/</span>
        <span className="text-slate-900 border-b border-slate-900">ID-{ticket?.id?.slice(0, 8)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── LEFT: TICKET DOSSIER ─── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
             {/* Decorative severity ribbon */}
             <div className={`absolute top-0 left-0 w-2 h-full ${
                ticket?.priority === 'critical' ? 'bg-red-500' :
                ticket?.priority === 'high' ? 'bg-orange-500' :
                ticket?.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
             }`} />
             
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <PriorityBadge priority={ticket?.priority} />
                  <span className="text-xs font-mono text-slate-400 px-3 py-1 bg-slate-50 border border-slate-100 rounded-md">
                     ID: #{ticket?.id}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight mb-2">
                  {ticket?.title}
                </h1>
                <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Reported by <span className="text-slate-900 font-bold">{ticket?.submitter?.full_name ?? "Unknown"}</span>
                  <span className="text-slate-300 mx-1">•</span>
                  {new Date(ticket?.created_at).toLocaleString()}
                </p>
              </div>
              <div className="shrink-0">
                  <StatusBadge status={ticket?.status} />
              </div>
            </div>

            {/* Description Area */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Full Description Log
              </h3>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {ticket?.description}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: CONTROL PANEL ─── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Command & Control
            </h2>

            <div className="space-y-5">
               {/* Assignee Update */}
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                   Assigned IT Engineer
                 </label>
                 <select
                   value={selectedAssignee}
                   onChange={(e) => setSelectedAssignee(e.target.value)}
                   className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 appearance-none shadow-sm cursor-pointer"
                 >
                   <option value="">— Unassigned Queue —</option>
                   {itStaff.map((staff) => (
                     <option key={staff.id} value={staff.id}>
                       {staff.full_name}
                     </option>
                   ))}
                 </select>
               </div>

               {/* Status Update */}
               <div className="pt-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                   Task Stage
                 </label>
                 <select
                   value={selectedStatus}
                   onChange={(e) => setSelectedStatus(e.target.value)}
                   className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900 appearance-none shadow-sm cursor-pointer"
                 >
                   <option value="open">Open</option>
                   <option value="in_progress">In Progress</option>
                   <option value="resolved">Resolved</option>
                 </select>
               </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-slate-100">
               <button
                 onClick={handleSave}
                 disabled={saving || !hasChanges}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 text-white text-sm font-black tracking-wide uppercase rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-sm hover:shadow-md hover:-translate-y-0.5"
               >
                 {saving ? (
                   <>
                     <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                     </svg>
                     EXECUTING...
                   </>
                 ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                     </svg>
                     DEPLOY CHANGES
                   </>
                 )}
               </button>
               
               {/* Feedback Messages */}
               <div className="mt-4 min-h-[40px]">
                 {successMessage && (
                   <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2.5 text-emerald-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                     </svg>
                     <span className="text-xs font-bold leading-tight">{successMessage}</span>
                   </div>
                 )}
                 {!hasChanges && !successMessage && (
                   <p className="text-xs font-bold tracking-widest text-slate-400 text-center uppercase">System in Sync</p>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function PriorityBadge({ priority }) {
  const styles = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high:     "bg-orange-100 text-orange-700 border-orange-200",
    medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
    low:      "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md border text-xs font-black uppercase tracking-widest ${styles[priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const labels = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
  const styles = {
    open:        "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-amber-100 text-amber-700 border-amber-200",
    resolved:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  
  return (
    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border font-bold text-sm ${styles[status]}`}>
      {status === 'in_progress' && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
      )}
      {status === 'open' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>}
      {status === 'resolved' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>}
      {labels[status]}
    </div>
  );
}
