"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { toast } from "sonner";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { 
  Loader2, 
  Copy, 
  History, 
  AlertTriangle, 
  ChevronLeft,
  Calendar,
  Hash,
  Activity,
  MessageSquare,
  CheckCircle2,
  Settings,
  Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StaffTicketDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError("");

    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(`
        id, title, description, priority, status, created_at, assigned_to, submitted_by,
        submitter:profiles!tickets_submitted_by_fkey (full_name, avatar_url),
        assignee:profiles!tickets_assigned_to_fkey (full_name, avatar_url)
      `)
      .eq("id", id)
      .single();

    if (ticketError) {
      setError("Incident not found or unauthorized access.");
      setLoading(false);
      return;
    }

    setTicket(ticketData);
    setSelectedStatus(ticketData.status);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ticketId) {
      fetchData(ticketId);
    }
  }, [ticketId, fetchData]);

  async function handleUpdateStatus() {
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: selectedStatus })
      .eq("id", ticketId);

    if (updateError) {
      toast.error(updateError.message);
      setSaving(false);
      return;
    }

    toast.success("Operational status synchronized.");

    // NOTIFICATIONS ENGINE ── Preserved EXACTLY
    if (selectedStatus !== ticket?.status) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      const staffName = profile?.full_name || "IT Staff";

      if (selectedStatus === "in_progress") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_updated",
          `🔄 Your ticket '${ticket.title}' is now being handled by ${staffName}.`
        );
      } else if (selectedStatus === "resolved") {
        await createNotification(
          ticket.submitted_by,
          ticketId,
          "ticket_resolved",
          `✅ Resolution reached for '${ticket.title}'. Please verify the fix.`
        );
      }
    }

    fetchData(ticketId);
    setSaving(false);
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticket?.id);
    toast.info("Reference ID copied");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-6" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Decrypting Data Stream...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <Card className="max-w-2xl mx-auto mt-20 border-red-100 shadow-2xl bg-white rounded-[32px]">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-slate-900 font-black text-2xl mb-2 tracking-tight">Security Block</h3>
          <p className="text-slate-500 text-sm mb-8 font-medium">{error}</p>
          <Link href="/it-staff/tickets">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-all px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              Return to Registry
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">
      
      <div className="flex items-center justify-between mb-10">
        <Link href="/it-staff/tickets">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest px-4 h-10 rounded-xl group transition-all">
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Registry
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm">
             REF: {ticket.id.slice(0, 12)}
           </Badge>
           <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-white transition-all shadow-sm">
             <Copy className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div className="lg:col-span-8 space-y-10">
          
          <Card className={`bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden relative group ${
            ticket.priority === 'critical' ? 'border-t-4 border-t-red-500' : ''
          }`}>
            <CardContent className="p-10 sm:p-14">
              <div className="flex flex-wrap items-center gap-4 mb-10">
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket.status)}
                <div className="h-4 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {new Date(ticket.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tighter mb-12 group-hover:text-indigo-600 transition-colors">
                {ticket.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
                <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 flex items-center gap-6 shadow-inner">
                  <UserAvatar 
                    avatarUrl={ticket.submitter?.avatar_url} 
                    fullName={ticket.submitter?.full_name} 
                    size="lg"
                    className="ring-4 ring-white shadow-sm"
                  />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 leading-none">Requester</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{ticket.submitter?.full_name || "Unknown Entity"}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 flex items-center gap-6 shadow-inner">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                    <Hash className="w-8 h-8 opacity-30" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 leading-none">Handle</p>
                    <p className="text-lg font-black text-indigo-600 font-mono tracking-tighter leading-none uppercase">TIC-{ticket.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Incident Payload
                </Label>
                <div className="bg-slate-50 border border-slate-100 p-10 rounded-[28px] shadow-inner text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-medium border-l-[6px] border-l-indigo-500">
                  {ticket.description}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <History className="w-5 h-5" />
                 </div>
                 <div>
                    <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-widest">Transaction Log</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Chronological Incident flow</CardDescription>
                 </div>
               </div>
            </CardHeader>
            <CardContent className="p-10 sm:p-14">
               <div className="space-y-12 relative">
                 <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />
                 
                 <div className="flex items-start gap-10 relative">
                    <div className="mt-2 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow-[0_0_15px_rgba(79,70,229,0.4)] z-10 shrink-0" />
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black text-slate-900 tracking-tight">Core Incident Initialized</p>
                        <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-base text-slate-500 font-medium leading-relaxed">Ticket submitted via Employee Portal. System priority auto-detected as <span className="text-indigo-600 font-black uppercase text-[11px] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{ticket.priority}</span>.</p>
                    </div>
                 </div>

                 {ticket.assigned_to && (
                    <div className="flex items-start gap-10 relative">
                       <div className="mt-2 w-6 h-6 rounded-full bg-slate-200 border-4 border-white z-10 shrink-0" />
                       <div className="space-y-3">
                          <div className="flex items-center gap-4">
                             <p className="text-lg font-black text-slate-900 tracking-tight">Personnel Assigned</p>
                             <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                               SYSTEM LOG
                             </span>
                          </div>
                          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl w-fit">
                             <UserAvatar avatarUrl={ticket.assignee?.avatar_url} fullName={ticket.assignee?.full_name} size="sm" />
                             <p className="text-sm font-black text-slate-700 uppercase tracking-widest">{ticket.assignee?.full_name}</p>
                          </div>
                       </div>
                    </div>
                 )}
               </div>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-4 space-y-10 sticky top-28">
          <Card className="bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden border-none text-slate-900">
            <CardHeader className="p-10 border-b border-slate-100 bg-indigo-600/[0.03]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)]">
                  <Settings className="w-6 h-6 rotate-90" />
                </div>
                <div>
                   <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-widest">Triage Panel</CardTitle>
                   <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Active state management</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              
               <div className="space-y-5">
                 <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Lifecycle State</Label>
                 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                   <SelectTrigger className="w-full h-16 bg-slate-50 text-slate-900 border-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest focus:ring-0 focus:border-indigo-500 transition-all shadow-inner">
                     <SelectValue placeholder="STATUS" />
                   </SelectTrigger>
                   <SelectContent className="bg-white border-slate-100 text-slate-900 rounded-2xl p-2 shadow-2xl overflow-hidden">
                     <SelectItem className="rounded-xl py-4 focus:bg-slate-50 cursor-pointer" value="open">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                          <span className="font-black tracking-widest uppercase text-[11px]">Awaiting Triage</span>
                       </div>
                     </SelectItem>
                     <SelectItem className="rounded-xl py-4 focus:bg-slate-50 cursor-pointer" value="in_progress">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                          <span className="font-black tracking-widest uppercase text-[11px]">Engineer Active</span>
                       </div>
                     </SelectItem>
                     <SelectItem className="rounded-xl py-4 focus:bg-slate-50 cursor-pointer" value="resolved">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                          <span className="font-black tracking-widest uppercase text-[11px]">Terminated</span>
                       </div>
                     </SelectItem>
                   </SelectContent>
                 </Select>
               </div>
              
              <Separator className="bg-slate-100" />

              <div className="space-y-6">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assigned Support</Label>
                <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-8 flex flex-col items-center text-center shadow-inner group">
                   <UserAvatar 
                     avatarUrl={ticket.assignee?.avatar_url} 
                     fullName={ticket.assignee?.full_name} 
                     size="xl"
                     className="ring-4 ring-white shadow-lg mb-4 group-hover:scale-105 transition-transform"
                   />
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1.5 leading-none">Lead Engineer</p>
                   <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                     {ticket.assignee?.full_name || "Unassigned Node"}
                   </p>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={saving} 
                  className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] shadow-2xl text-[11px] transition-all active:scale-95 group relative overflow-hidden rounded-2xl border-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {saving ? (
                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> SYNCHRONIZING...</>
                  ) : (
                    <><Shield className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" /> Commit Changes</>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-white border border-slate-100 p-8 rounded-[32px] text-center shadow-sm">
               <Activity className="w-6 h-6 text-indigo-600 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Load</p>
               <p className="text-xl font-black text-slate-900 tracking-tight">NORMAL</p>
             </div>
             <div className="bg-white border border-slate-100 p-8 rounded-[32px] text-center shadow-sm">
               <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Uptime</p>
               <p className="text-xl font-black text-slate-900 tracking-tight">99.9%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
