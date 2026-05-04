"use client";

// Import tools from React and Next.js
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation"; // For moving between pages
import Link from "next/link"; // For clickable links
import { supabase } from "@/lib/supabase"; // Connection to our database
import { createNotification } from "@/lib/notifications"; // Tool to send alerts to users
import { toast } from "sonner"; // Small popup messages

// Import UI components (boxes, buttons, labels, dropdowns)
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
// Import helpers to show colored labels for status and priority
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
// Import icons for the design
import { 
  Loader2, 
  Copy, 
  Shield, 
  Settings, 
  History, 
  AlertTriangle, 
  UserCheck,
  ChevronLeft,
  Calendar,
  Hash,
  Activity,
  MessageSquare,
  CheckCircle2,
  ImageIcon,
  FileText
} from "lucide-react";

// This is the Admin Ticket Detail page (where admins manage one ticket)
export default function TicketDetailPage({ params }) {
  const router = useRouter();
  // Get the special ID of this ticket from the URL
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  // These "states" remember the ticket data and if we are loading
  const [ticket, setTicket] = useState(null);
  const [itStaff, setItStaff] = useState([]); // List of all IT people
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // If we are busy saving changes
  const [error, setError] = useState("");

  // These "states" remember what the admin selects in the dropdowns
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  // Function to get the ticket data and the list of IT staff from the database
  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError("");

    // 1. Get the ticket data without joins
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
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

    // Get all users who are "it-staff" so the admin can assign them
    const { data: staffData, error: staffError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "it-staff")
      .order("full_name", { ascending: true });
      
    if (staffError) {
      console.error("Staff fetch error:", staffError);
    } else {
      setItStaff(staffData || []);
    }
    setLoading(false);
  }, []);

  // Run this when the page opens
  useEffect(() => {
    if (ticketId) {
      fetchData(ticketId);
    }
  }, [ticketId, fetchData]);

  // This function saves the changes (like new status or assignee)
  async function handleSave() {
    setSaving(true);
    setError("");

    // Get the current admin's name
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

    // Prepare the update for the database
    const newAssigneeId = selectedAssignee === "unassigned" ? null : selectedAssignee;

    const updatePayload = {
      status: selectedStatus,
      assigned_to: newAssigneeId,
    };

    // Send the update to Supabase
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

    // ─── SEND NOTIFICATIONS (Preserved logic) ───
    
    // If a new person was assigned, notify them and the admin
    if (newAssigneeId && newAssigneeId !== (ticket?.assigned_to ?? null)) {
      const staffMember = itStaff.find((s) => s.id === newAssigneeId);
      const staffName = staffMember ? staffMember.full_name : "IT Staff";

      // Notify the IT staff member
      await createNotification(
        newAssigneeId,
        ticketId,
        "ticket_assigned",
        `🎫 New ticket assigned to you: '${ticket.title}'\nPriority: ${ticket.priority.toUpperCase()}\nFrom: ${ticket?.submitter?.full_name || "Unknown"}`
      );

      // Log the action for the admin
      if (user) {
        await createNotification(
          user.id,
          ticketId,
          "ticket_assigned",
          `✅ You assigned '${ticket.title}' to ${staffName}`
        );
      }
    }

    // If the status changed, notify the employee who submitted the ticket
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

      // Log the change for the admin
      if (user) {
        await createNotification(
          user.id,
          ticketId,
          "ticket_updated",
          `Ticket '${ticket.title}' status updated to ${selectedStatus} by ${currentAdminName}`
        );
      }
    }

    fetchData(ticketId); // Refresh the page data
    setSaving(false);
  }

  // Helper to copy the ticket ID to the computer's clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticket?.id);
    toast.info("Ticket ID copied to clipboard");
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-6" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Loading ticket details...</p>
      </div>
    );
  }

  // If there's an error, show a message
  if (error && !ticket) {
    return (
      <Card className="max-w-2xl mx-auto mt-10 border-red-900 shadow-2xl bg-red-950/20 rounded-[32px]">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-white font-black text-2xl mb-2 tracking-tight">Notice</h3>
          <p className="text-red-400/70 text-sm mb-8 font-medium">{error}</p>
          <Link href="/admin/tickets">
            <Button variant="outline" className="border-red-900 bg-[#09090b] text-red-400 hover:text-white hover:bg-red-900 transition-all px-8 h-12 rounded-2xl">
              Back to Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    // Main container with dark mode and animation
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">
      
      {/* ─── TOP BAR (Back button and ID) ─── */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/admin/tickets">
          <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest px-4 h-10 rounded-xl group">
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Tickets
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-[#111113] border-white/5 text-slate-500 font-mono text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
             Ticket Ref: {ticket.id.slice(0, 12)}
           </Badge>
           <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-slate-600 hover:text-indigo-400 rounded-xl">
             <Copy className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Main Ticket Info) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Card with title and description */}
          <Card className={`bg-[#111113] border-white/5 shadow-2xl rounded-[32px] overflow-hidden relative ${
            ticket.priority === 'critical' ? 'border-t-4 border-t-red-600' : ''
          }`}>
            <CardContent className="p-8 sm:p-12">
              {/* Badges for priority, status and date */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket.status)}
                <div className="h-4 w-px bg-white/5 mx-2" />
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500/50" />
                  {new Date(ticket.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>

              {/* Ticket Title */}
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tighter mb-10">
                {ticket.title}
              </h1>

              {/* Submitter Info and ID Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <div className="bg-[#09090b] border border-white/5 rounded-2xl p-6 flex items-center gap-5">
                  <UserAvatar 
                    avatarUrl={ticket.submitter?.avatar_url} 
                    fullName={ticket.submitter?.full_name} 
                    size="lg"
                    className="ring-4 ring-white/5"
                  />
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Submitted By</p>
                    <p className="text-lg font-black text-white tracking-tight">{ticket.submitter?.full_name || "Unknown User"}</p>
                  </div>
                </div>
                
                <div className="bg-[#09090b] border border-white/5 rounded-2xl p-6 flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400">
                    <Hash className="w-8 h-8 opacity-50" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Ticket ID</p>
                    <p className="text-lg font-black text-slate-300 font-mono tracking-tighter">{ticket.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Description Content */}
              <div className="space-y-4">
                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Description
                </Label>
                <div className="bg-[#09090b] border border-white/5 p-8 rounded-[24px] shadow-inner text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-medium border-l-4 border-l-indigo-600/50">
                  {ticket.description}
                </div>
              </div>

              {/* ─── RESOLUTION AUDIT (Visible if staff finished the work) ─── */}
              {(ticket.resolution_notes || ticket.proof_url) && (
                <div className="mt-12 pt-12 border-t border-white/5 space-y-10">
                   <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600/10 border border-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-400">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-widest">Resolution Audit</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Proof of work and staff comments</p>
                    </div>
                  </div>

                  {/* Show notes written by the IT engineer */}
                  {ticket.resolution_notes && (
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Staff Notes
                      </Label>
                      <div className="bg-[#09090b] border border-white/5 p-8 rounded-[24px] text-slate-300 text-lg leading-relaxed font-medium border-l-4 border-l-emerald-600/50">
                        {ticket.resolution_notes}
                      </div>
                    </div>
                  )}

                  {/* Show picture proof uploaded by the IT engineer */}
                  {ticket.proof_url && (
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        Visual Proof
                      </Label>
                      <div className="relative group overflow-hidden rounded-[32px] border border-white/5 bg-[#09090b] p-4 shadow-2xl">
                        <img 
                          src={ticket.proof_url} 
                          alt="Resolution Proof" 
                          className="w-full h-auto max-h-[600px] object-contain rounded-[20px] transition-transform duration-700 group-hover:scale-[1.01]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* ─── ACTIVITY LOG (History of what happened) ─── */}
          <Card className="bg-[#111113] border-white/5 shadow-2xl rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <History className="w-5 h-5" />
                 </div>
                 <CardTitle className="text-lg font-black text-white uppercase tracking-widest">Activity Log</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-10">
               <div className="space-y-10 relative">
                 {/* Vertical line for the timeline */}
                 <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/5" />
                 
                 {/* "Ticket Created" Step */}
                 <div className="flex items-start gap-8 relative">
                    <div className="mt-2 w-5 h-5 rounded-full bg-indigo-600 border-4 border-[#111113] shadow-[0_0_15px_rgba(79,70,229,0.5)] z-10 shrink-0" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <p className="text-base font-black text-white tracking-tight">Ticket created</p>
                        <span className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Ticket submitted via Employee Portal. System priority auto-detected as <span className="text-indigo-400 font-black uppercase text-[10px]">{ticket.priority}</span>.</p>
                    </div>
                 </div>
               </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Ticket Management Panel) */}
        <div className="lg:col-span-4 space-y-8 sticky top-28">
          
          <Card className="bg-[#111113] border-white/5 shadow-2xl rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 bg-indigo-600/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Settings className="w-5 h-5 rotate-90" />
                </div>
                <CardTitle className="text-lg font-black text-white uppercase tracking-widest">Ticket Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              
               {/* Dropdown to change the status (Open, In Progress, Resolved) */}
               <div className="space-y-4">
                 <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Update Status</Label>
                 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                   <SelectTrigger className="w-full h-16 bg-[#09090b] text-white border-white/5 rounded-2xl font-black text-sm uppercase tracking-widest focus:ring-0 focus:border-indigo-500 transition-all shadow-inner">
                     <SelectValue placeholder="STATUS" />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1E2538] border-white/10 text-white rounded-2xl p-2 shadow-2xl">
                     <SelectItem className="rounded-xl py-4 focus:bg-indigo-600" value="open">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          <span className="font-black tracking-widest uppercase text-xs">Open</span>
                       </div>
                     </SelectItem>
                     <SelectItem className="rounded-xl py-4 focus:bg-indigo-600" value="in_progress">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                          <span className="font-black tracking-widest uppercase text-xs">In Progress</span>
                       </div>
                     </SelectItem>
                     <SelectItem className="rounded-xl py-4 focus:bg-indigo-600" value="resolved">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          <span className="font-black tracking-widest uppercase text-xs">Resolved</span>
                       </div>
                     </SelectItem>
                   </SelectContent>
                 </Select>
               </div>
              
               <Separator className="bg-white/5" />

               {/* Dropdown to pick which IT staff member should fix this ticket */}
               <div className="space-y-4">
                 <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Assigned To</Label>
                 <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                   <SelectTrigger className="w-full h-16 bg-[#09090b] text-white border-white/5 rounded-2xl font-black text-sm uppercase tracking-widest focus:ring-0 focus:border-indigo-500 transition-all shadow-inner">
                     <SelectValue placeholder="UNASSIGNED" />
                   </SelectTrigger>
                   <SelectContent className="bg-[#1E2538] border-white/10 text-white rounded-2xl p-2">
                     <SelectItem className="rounded-xl py-4 focus:bg-indigo-600" value="unassigned">Unassigned</SelectItem>
                     {itStaff.map((staff) => (
                       <SelectItem className="rounded-xl py-4 focus:bg-indigo-600" key={staff.id} value={staff.id}>
                         <div className="flex items-center gap-3">
                            <UserAvatar avatarUrl={staff.avatar_url} fullName={staff.full_name} size="sm" />
                            <span className="font-black uppercase tracking-widest text-xs">{staff.full_name}</span>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 
                 {/* Visual box showing who is currently selected */}
                 <div className="mt-8 bg-[#09090b] border border-white/5 rounded-[24px] p-6 flex items-center gap-5 shadow-inner">
                   <UserAvatar 
                     avatarUrl={itStaff.find(s => s.id === selectedAssignee)?.avatar_url} 
                     fullName={selectedAssignee === "unassigned" ? "Queue" : itStaff.find(s => s.id === selectedAssignee)?.full_name} 
                     size="lg"
                     className="ring-4 ring-indigo-500/10"
                   />
                   <div>
                     <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Assigned Staff</p>
                     <p className="text-lg font-black text-white tracking-tight">
                       {selectedAssignee === "unassigned" ? "Unassigned" : itStaff.find(s => s.id === selectedAssignee)?.full_name}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Large button to save the status and assignee changes */}
               <div className="pt-6">
                 <Button 
                   onClick={handleSave} 
                   disabled={saving} 
                   className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(79,70,229,0.4)] text-xs transition-all active:scale-95 group relative overflow-hidden rounded-[20px] border border-white/10"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                   {saving ? (
                     <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving...</>
                   ) : (
                     <><Shield className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" /> Save Changes</>
                   )}
                 </Button>
               </div>

            </CardContent>
          </Card>
          
          {/* Small decorative status boxes */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#111113] border border-white/5 p-6 rounded-[24px] text-center">
               <Activity className="w-5 h-5 text-indigo-500 mx-auto mb-3" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Load</p>
               <p className="text-xl font-black text-white">NORMAL</p>
             </div>
             <div className="bg-[#111113] border border-white/5 p-6 rounded-[24px] text-center">
               <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-3" />
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Uptime</p>
               <p className="text-xl font-black text-white">99.9%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
