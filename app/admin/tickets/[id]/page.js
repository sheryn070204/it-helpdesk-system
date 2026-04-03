"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { toast } from "sonner";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { Loader2, Copy, Shield, Settings, History, AlertTriangle, UserCheck } from "lucide-react";

export default function TicketDetailPage({ params }) {
  const router = useRouter();
  const [ticketId, setTicketId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [itStaff, setItStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setTicketId(resolvedParams.id);
    });
  }, [params]);

  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError("");

    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(`
        id, title, description, priority, status, created_at, assigned_to, submitted_by,
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
    setSelectedAssignee(ticketData.assigned_to ?? "unassigned");

    const { data: staffData, error: staffError } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["it_staff", "it-staff"])
      .order("full_name", { ascending: true });
      
    if (staffError) {
      console.error("Staff fetch error:", staffError);
    } else {
      setItStaff(staffData || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ticketId) {
      fetchData(ticketId);
    }
  }, [ticketId, fetchData]);

  async function handleSave() {
    setSaving(true);
    setError("");

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

    const newAssigneeId = selectedAssignee === "unassigned" ? null : selectedAssignee;

    const updatePayload = {
      status: selectedStatus,
      assigned_to: newAssigneeId,
    };

    const { error: updateError } = await supabase
      .from("tickets")
      .update(updatePayload)
      .eq("id", ticketId);

    if (updateError) {
      toast.error(updateError.message);
      setSaving(false);
      return;
    }

    toast.success("Ticket details saved successfully.");

    // NOTIFICATIONS ENGINE ── Preserved EXACTLY
    // 1. Assignment changed
    if (newAssigneeId && newAssigneeId !== (ticket?.assigned_to ?? null)) {
      const staffMember = itStaff.find((s) => s.id === newAssigneeId);
      const staffName = staffMember ? staffMember.full_name : "IT Staff";

      await createNotification(
        newAssigneeId,
        ticketId,
        "ticket_assigned",
        `🎫 New ticket assigned to you: '${ticket.title}'\nPriority: ${ticket.priority.toUpperCase()}\nFrom: ${ticket?.submitter?.full_name || "Unknown"}`
      );

      if (user) {
        await createNotification(
          user.id,
          ticketId,
          "ticket_assigned",
          `✅ You assigned '${ticket.title}' to ${staffName}`
        );
      }
    }

    // 2. Status changed
    if (selectedStatus !== ticket?.status) {
      if (selectedStatus === "in_progress") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_updated",
          `🔄 Your ticket '${ticket.title}' status changed to In Progress.\nOur IT team is working on it.`
        );
      } else if (selectedStatus === "resolved") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_resolved",
          `✅ Great news! Your ticket '${ticket.title}' has been resolved.\nPlease verify the fix and reopen if needed.`
        );
      }

      if (user) {
        await createNotification(
          user.id,
          ticketId,
          "ticket_updated",
          `Ticket '${ticket.title}' status updated to ${selectedStatus} by ${currentAdminName}`
        );
      }
    }

    fetchData(ticketId);
    setSaving(false);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticket?.id);
    toast.info("Ticket ID copied to clipboard");
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mb-4" />
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Querying Systems...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <Card className="max-w-2xl mx-auto mt-10 border-red-900 shadow-sm bg-red-950/20">
        <CardContent className="p-8 flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-red-500 font-bold text-lg mb-1">System Error</h3>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Link href="/admin/tickets">
              <Button variant="outline" className="border-red-900 bg-[#09090b] text-red-400 hover:text-red-300 hover:bg-red-950/50">
                &larr; Return to Master List
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* ─── Breadcrumbs ─── */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-6 bg-[#18181b] px-4 py-2 rounded-xl border border-slate-800 inline-flex">
        <Link href="/admin" className="hover:text-indigo-400 transition-colors">OpCenter</Link>
        <span>/</span>
        <Link href="/admin/tickets" className="hover:text-indigo-400 transition-colors">Tickets</Link>
        <span>/</span>
        <span className="text-indigo-400 border-b border-indigo-400">ID-{ticket?.id?.slice(0, 8)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── LEFT: TICKET INFO ─── */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`bg-[#18181b] shadow-sm border-slate-800 overflow-hidden relative ${
            ticket.priority === 'critical' ? 'border-t-4 border-t-red-500' : ''
          }`}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 px-3 py-1.5 bg-[#09090b] border border-slate-800 rounded-md font-medium uppercase group flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors" onClick={copyToClipboard}>
                     {ticket.id.slice(0, 8)}
                     <Copy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-6">
                {ticket.title}
              </h1>

              <div className="bg-[#09090b] border border-slate-800 rounded-xl p-4 flex items-center gap-4 mb-8">
                <Avatar className="w-10 h-10 border border-slate-700 bg-slate-800">
                  <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-xs">
                    {getInitials(ticket.submitter?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Submitted By</p>
                  <p className="text-sm font-semibold text-slate-200">{ticket.submitter?.full_name ?? "Unknown"}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Date</p>
                  <p className="text-sm font-medium text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Full Description</Label>
                <div className="prose prose-sm max-w-none text-slate-300 bg-[#09090b] border border-slate-800 p-6 rounded-xl shadow-sm leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timeleine / Activity - Static layout per prompt */}
          <Card className="shadow-sm border-slate-800 bg-[#18181b]">
            <CardHeader className="pb-3 border-b border-slate-800">
               <div className="flex items-center gap-2">
                 <History className="w-4 h-4 text-slate-500" />
                 <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest">Activity Log</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-6">
               <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">Ticket Created by <span className="font-bold text-white">{ticket.submitter?.full_name}</span></p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{new Date(ticket.created_at).toLocaleString()}</p>
                    </div>
                 </div>
               </div>
            </CardContent>
          </Card>

        </div>

        {/* ─── RIGHT: CONTROL PANEL (Sticky) ─── */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <CardTitle className="text-xs font-bold text-white uppercase tracking-[0.2em]">Ticket Controls</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* 1. Status Update */}
                 <div className="space-y-2.5">
                   <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Update Status</Label>
                   <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                     <SelectTrigger className="w-full h-11 bg-[#09090b] text-slate-200 border-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-700 transition-all rounded-lg">
                       <SelectValue placeholder="Select status" />
                     </SelectTrigger>
                     <SelectContent className="bg-[#18181b] border-slate-700 text-slate-200 shadow-2xl rounded-xl">
                       <SelectItem className="hover:bg-slate-800/50 py-3" value="open">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            Open Ticket
                         </div>
                       </SelectItem>
                       <SelectItem className="hover:bg-slate-800/50 py-3" value="in_progress">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            In Progress
                         </div>
                       </SelectItem>
                       <SelectItem className="hover:bg-slate-800/50 py-3" value="resolved">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            Resolved
                         </div>
                       </SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                
                <Separator className="bg-slate-800" />

                {/* 2. Assignment */}
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assign to IT Staff</Label>
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger className="w-full h-11 bg-[#09090b] text-slate-200 border-slate-700 font-semibold focus:ring-indigo-500">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-slate-700 text-slate-200">
                      <SelectItem className="hover:bg-slate-800/50" value="unassigned">— Unassigned Queue —</SelectItem>
                      {itStaff.map((staff) => (
                        <SelectItem className="hover:bg-slate-800/50" key={staff.id} value={staff.id}>
                          {staff.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Current Assignee Banner */}
                  <div className="mt-4 bg-[#09090b] border border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
                       <UserCheck className="w-12 h-12 text-indigo-500 -mr-4 -mt-4 rotate-12" />
                    </div>
                    <Avatar className="w-12 h-12 rounded-xl border-2 border-indigo-500/20 shadow-md bg-[#18181b] ring-4 ring-indigo-500/5">
                      <AvatarFallback className="bg-indigo-600/10 text-indigo-400 text-sm font-black">
                        {selectedAssignee === "unassigned" ? "?" : getInitials(itStaff.find(s => s.id === selectedAssignee)?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="relative z-10">
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-0.5">Primary Resolver</p>
                       <p className="text-base font-extrabold text-slate-100 tracking-tight">
                         {selectedAssignee === "unassigned" ? "Awaiting Assignment" : itStaff.find(s => s.id === selectedAssignee)?.full_name}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.4)] text-sm transition-all active:scale-95 group relative overflow-hidden rounded-xl border border-indigo-400/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {saving ? (
                      <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> EXECUTING...</>
                    ) : (
                      <><Shield className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" /> Commit Changes</>
                    )}
                  </Button>
                </div>

                <Separator className="bg-slate-800" />

                {/* 3. Meta info */}
                <div className="space-y-2 text-xs font-medium text-slate-500">
                   <div className="flex justify-between">
                     <span>Created:</span>
                     <span className="text-slate-300">{new Date(ticket.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Priority Matrix:</span>
                     <span className="text-slate-300 uppercase font-bold">{ticket.priority}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>System ID:</span>
                     <span className="text-slate-300 font-mono">{ticket.id.slice(0, 12)}...</span>
                   </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
