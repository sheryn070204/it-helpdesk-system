"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { toast } from "sonner";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { ArrowLeft, Loader2, ShieldCheck, Wrench } from "lucide-react";

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

    if (!error && ticketData) {
      setTicket(ticketData);
      setSelectedStatus(ticketData.status);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ticketId) fetchData(ticketId);
  }, [ticketId, fetchData]);

  async function handleStatusUpdate() {
    if (selectedStatus === ticket.status) {
      toast.info("Status is already set to " + selectedStatus);
      return;
    }

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
      .update({ status: selectedStatus })
      .eq("id", ticketId);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    // ─────────────────────────────────────────────
    // NOTIFICATIONS ENGINE PRESV - DO NOT TOUCH
    // ─────────────────────────────────────────────
    // 1. Notify Employee
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

    // 2. Notify ALL Admins automatically
    const { data: allAdmins } = await supabase.from("profiles").select("id").eq("role", "admin");
    if (allAdmins) {
      for (const admin of allAdmins) {
        await createNotification(
          admin.id,
          ticketId,
          "ticket_updated",
          `Ticket '${ticket.title}' status updated to ${selectedStatus} by ${currentStaffName}`
        );
      }
    }
    
    toast.success("Task updated successfully!");
    fetchData(ticketId);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mb-4" />
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Loading Task...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10">
        <Card className="border-red-900 bg-red-950/20 shadow-sm">
          <CardContent className="p-8 text-center text-red-500 font-bold">
            Access denied or ticket not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      <Link href="/it-staff">
        <Button variant="ghost" className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 font-bold px-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Queue
        </Button>
      </Link>

      <Card className={`bg-[#18181b] shadow-xl border-slate-800 overflow-hidden ${
        ticket.priority === 'critical' ? 'border-t-4 border-t-red-500' : ''
      }`}>
        <CardContent className="p-0">
          
          {/* Header Block */}
          <div className="p-6 sm:p-8 bg-[#09090b]/50 border-b border-slate-800 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket.status)}
              </div>
              <span className="text-xs font-mono text-slate-500 bg-[#18181b] border border-slate-800 px-3 py-1.5 rounded-md shadow-sm">
                 ID: #{ticket.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              {ticket.title}
            </h1>
          </div>

          {/* Info Grid */}
          <div className="p-6 sm:p-8 border-b border-slate-800">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#09090b] rounded-2xl p-6 border border-slate-800">
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Reported By</p>
                 <div className="flex items-center gap-3">
                   <Avatar className="w-8 h-8 border border-slate-700 bg-[#18181b] shadow-sm">
                     <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-xs">
                       {getInitials(ticket.submitter?.full_name)}
                     </AvatarFallback>
                   </Avatar>
                   <span className="text-sm font-bold text-slate-200">{ticket.submitter?.full_name}</span>
                 </div>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Date Submitted</p>
                 <p className="text-sm font-semibold text-slate-400">{new Date(ticket.created_at).toLocaleString()}</p>
               </div>
               <div className="sm:mt-2">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Escalation Priority</p>
                 {getPriorityBadge(ticket.priority)}
               </div>
               <div className="sm:mt-2">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Status</p>
                 {getStatusBadge(ticket.status)}
               </div>
             </div>
          </div>

          {/* Description Block */}
          <div className="p-6 sm:p-8">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">
              Problem Description Details
            </Label>
            <div className="bg-[#09090b] border border-slate-800 rounded-xl p-6 shadow-sm">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {ticket.description}
              </p>
            </div>
          </div>
        </CardContent>

        <Separator className="bg-slate-800" />

        {/* Action Panel */}
        <CardFooter className="flex flex-col bg-[#0c0d12] p-6 sm:p-8 items-start">
           <div className="w-full">
             <div className="flex items-center gap-2 mb-6">
               <Wrench className="w-5 h-5 text-indigo-500" />
               <h3 className="font-bold text-white text-lg">Update Status</h3>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
               <div className="sm:col-span-2 space-y-2.5">
                 <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Stage</Label>
                 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                   <SelectTrigger className="w-full h-12 bg-[#18181b] border-slate-700 shadow-sm focus:ring-indigo-500 font-bold text-slate-200">
                     <SelectValue placeholder="Select status" />
                   </SelectTrigger>
                   <SelectContent className="bg-[#18181b] border-slate-700 text-slate-200">
                     <SelectItem className="hover:bg-slate-800/50 cursor-pointer" value="open">Open (Awaiting Triage)</SelectItem>
                     <SelectItem className="hover:bg-slate-800/50 cursor-pointer" value="in_progress">In Progress (Working)</SelectItem>
                     <SelectItem className="hover:bg-slate-800/50 cursor-pointer" value="resolved">Resolved (Completed)</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="sm:col-span-1">
                 <Button 
                   onClick={handleStatusUpdate} 
                   disabled={saving || selectedStatus === ticket.status} 
                   className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
                 >
                   {saving ? (
                     <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                   ) : (
                     <><ShieldCheck className="w-4 h-4 mr-2" /> Commit</>
                   )}
                 </Button>
               </div>
             </div>
             
             <p className="text-xs text-indigo-300 font-medium mt-5 flex items-center gap-1.5 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
               <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
               System Note: Updating internal status will automatically trigger live UI notifications globally.
             </p>
           </div>
        </CardFooter>
      </Card>
    </div>
  );
}
