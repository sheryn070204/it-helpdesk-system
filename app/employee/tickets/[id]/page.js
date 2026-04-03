"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  ChevronLeft, 
  Calendar, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Activity, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  User,
  ShieldAlert
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { getStatusBadge, getPriorityBadge } from "@/lib/badgeHelpers";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function TicketDetailPage({ params }) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError("");

    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select(`
        id, title, description, priority, status, created_at,
        assignee:profiles!tickets_assigned_to_fkey (full_name, avatar_url)
      `)
      .eq("id", id)
      .single();

    if (ticketError) {
      setError("Incident data unreachable or record non-existent.");
      setLoading(false);
      return;
    }

    setTicket(ticketData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ticketId) {
      fetchData(ticketId);
    }
  }, [ticketId, fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-6" />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Decrypting Record...</p>
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
          <h3 className="text-slate-900 font-black text-2xl mb-2 tracking-tight">Access Blocked</h3>
          <p className="text-slate-500 text-sm mb-8 font-medium">{error}</p>
          <Link href="/employee">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-all px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              Return to Console
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* ─── PRO HEADER ─── */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/employee/tickets">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest px-4 h-10 rounded-xl group transition-all">
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Registry
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm">
             REF: {ticket.id.slice(0, 12)}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div className="lg:col-span-8 space-y-10">
          
          <Card className={`bg-white border-none shadow-2xl rounded-[40px] overflow-hidden relative group transition-all hover:shadow-indigo-600/5 ${
            ticket.priority === 'critical' ? 'border-t-4 border-t-red-500' : ''
          }`}>
            <CardContent className="p-10 sm:p-14 relative z-10">
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

              <div className="space-y-6">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Incident Payload
                </Label>
                <div className="bg-slate-50 border border-slate-100 p-10 rounded-[32px] shadow-inner text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-medium border-l-[6px] border-l-indigo-600">
                  {ticket.description}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timeline */}
          <Card className="bg-white border-none shadow-2xl rounded-[40px] overflow-hidden border-slate-100">
            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
               <div className="flex items-center gap-4 text-slate-900">
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <History className="w-6 h-6" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-widest">Protocol Timeline</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lifecycle transition events</CardDescription>
                 </div>
               </div>
            </CardHeader>
            <CardContent className="p-10 sm:p-14">
               <div className="space-y-12 relative text-slate-900">
                 <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />
                 
                 <div className="flex items-start gap-10 relative">
                    <div className="mt-2 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow-[0_0_15px_rgba(79,70,229,0.3)] z-10 shrink-0" />
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-black text-slate-900 tracking-tight">Incident Initialized</p>
                        <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-base text-slate-500 font-medium leading-relaxed">System recorded protocol. Current classification: <span className="text-indigo-600 font-black uppercase text-[11px] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-50">{ticket.priority}</span>.</p>
                    </div>
                 </div>

                 {ticket.status === 'resolved' && (
                    <div className="flex items-start gap-10 relative text-slate-900">
                       <div className="mt-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10 shrink-0" />
                       <div className="space-y-3">
                          <div className="flex items-center gap-4">
                             <p className="text-lg font-black text-slate-900 tracking-tight">Resolution Reached</p>
                             <span className="text-[10px] font-bold text-emerald-500 font-mono uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                               SUCCESS
                             </span>
                          </div>
                          <p className="text-base text-slate-500 font-medium leading-relaxed">Issue resolved by IT Engineer. Request state shifted to resolved.</p>
                       </div>
                    </div>
                 )}
               </div>
            </CardContent>
          </Card>

        </div>

        {/* ─── RIGHT: STATUS PANEL (4 cols) ─── */}
        <div className="lg:col-span-4 space-y-10 sticky top-28">
          
          <Card className="bg-white border-none shadow-2xl rounded-[40px] overflow-hidden text-slate-900 border-slate-100">
            <CardHeader className="p-10 border-b border-slate-50 bg-indigo-600/[0.02]">
               <div className="flex items-center gap-4 text-indigo-600">
                 <ShieldCheck className="w-6 h-6" />
                 <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Personnel Assignment</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
               <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 flex flex-col items-center text-center shadow-inner group">
                  <div className="relative mb-6">
                    <UserAvatar 
                      avatarUrl={ticket.assignee?.avatar_url} 
                      fullName={ticket.assignee?.full_name} 
                      size="xl"
                      className="ring-8 ring-white shadow-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center">
                       <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1.5 leading-none">Support Engineer</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                    {ticket.assignee?.full_name || "Queued Node"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Dedicated personnel assigned <br /> to your protocol.</p>
               </div>

               <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between px-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active State</p>
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-4 px-6 shadow-xl shadow-slate-900/10">
                     <Activity className="w-5 h-5 text-indigo-400" />
                     <span className="font-black uppercase tracking-[0.15em] text-xs">Live Monitoring Active</span>
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className="bg-indigo-600 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <ShieldAlert className="w-32 h-32" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" /> Global Registry
             </p>
             <h4 className="text-2xl font-black tracking-tight mb-4 leading-tight">Secure Infrastructure Protection</h4>
             <p className="text-sm text-indigo-100/70 font-medium leading-relaxed">This record is part of a protected ecosystem. Access is restricted to authorized personnel. </p>
          </div>
        </div>
      </div>
    </div>
  );
}
