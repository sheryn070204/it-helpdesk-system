"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

export default function ITStaffTicketDetail({ params }) {
  const router = useRouter();
  const [ticketId, setTicketId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    params.then((p) => setTicketId(p.id));
  }, [params]);

  const fetchData = useCallback(async (id) => {
    setLoading(true);
    const { data: ticketData, error } = await supabase
      .from("tickets")
      .select(`
        id, title, description, priority, status, created_at, assigned_to, submitted_by,
        submitter:profiles!tickets_submitted_by_fkey (full_name)
      `)
      .eq("id", id)
      .single();

    if (!error) {
      setTicket(ticketData);
      setSelectedStatus(ticketData.status);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ticketId) fetchData(ticketId);
  }, [ticketId, fetchData]);

  async function handleStatusUpdate(newStatus) {
    setSaving(true);
    
    // Auth user
    const { data: { user } } = await supabase.auth.getUser();
    let currentStaffName = "IT Engineer";
    if (user) {
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (p?.full_name) currentStaffName = p.full_name;
    }

    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (!error && newStatus !== ticket.status) {
      // 1. Notify Employee
      if (newStatus === "in_progress") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_updated",
          `Your ticket '${ticket.title}' is now being worked on by our IT team.`
        );
      } else if (newStatus === "resolved") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_resolved",
          `Great news! Your ticket '${ticket.title}' has been resolved. Please verify and let us know if you need further assistance.`
        );
      }

      // 2. Notify ALL Admins automatically
      const { data: allAdmins } = await supabase.from("profiles").select("id").eq("role", "admin");
      if (allAdmins) {
        for (const admin of allAdmins) {
          await createNotification(
            admin.id,
            ticketId,
            "ticket_updated",
            `Ticket '${ticket.title}' status updated to ${newStatus} by ${currentStaffName}`
          );
        }
      }
      
      setSelectedStatus(newStatus);
      fetchData(ticketId);
    }
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-slate-500 font-mono">Loading task...</div>;
  if (!ticket) return <div className="p-8 text-red-500">Access denied or ticket not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
        <Link href="/it-staff" className="hover:text-indigo-600 transition-colors">My Tasks</Link>
        <span>/</span>
        <span className="text-slate-600">#{ticket.id.slice(0, 8)}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Block */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{ticket.title}</h1>
              <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
                <span className="font-mono text-xs">ID: #{ticket.id.slice(0, 8)}</span>
                <span>•</span>
                <span>From: <strong className="text-slate-700">{ticket.submitter?.full_name}</strong></span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${
                  ticket.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                {ticket.priority}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Details Block */}
        <div className="p-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Problem Description
          </h3>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
        </div>

        {/* IT Staff Action Block */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">Task Actions</h3>
            <p className="text-sm text-slate-500">Update the status to notify the employee.</p>
          </div>

          <div className="flex gap-3">
            {ticket.status !== 'in_progress' && ticket.status !== 'resolved' && (
              <button
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={saving}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                Start Working
              </button>
            )}

            {ticket.status !== 'resolved' && (
              <button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={saving}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
