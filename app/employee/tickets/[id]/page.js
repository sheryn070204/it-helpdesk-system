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
  Info
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
      setError("This ticket doesn't exist or you don't have permission to view it.");
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
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-6" />
        <p className="text-slate-500 font-bold text-sm tracking-wide">Loading ticket details...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <Card className="max-w-2xl mx-auto mt-20 border-slate-200 shadow-xl bg-white rounded-[2rem]">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-slate-900 font-bold text-2xl mb-2 tracking-tight">Ticket Not Found</h3>
          <p className="text-slate-500 text-base mb-8 font-medium">{error}</p>
          <Link href="/employee">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-all px-8 h-12 rounded-xl font-bold">
              Back to My Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/employee/tickets">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold text-sm px-4 h-10 rounded-xl group transition-all">
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to My Tickets
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-semibold px-4 py-2 rounded-xl shadow-sm">
             Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div className="lg:col-span-8 space-y-10">
          
          <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden relative group transition-all">
            <CardContent className="p-10 sm:p-14 relative z-10">
              <div className="flex flex-wrap items-center gap-4 mb-10">
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket.status)}
                <div className="h-4 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {new Date(ticket.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-12">
                {ticket.title}
              </h1>

              <div className="space-y-6">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Problem Description
                </Label>
                <div className="bg-slate-50 border border-slate-100 p-10 rounded-[2rem] text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {ticket.description}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Timeline */}
          <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
               <div className="flex items-center gap-4 text-slate-900">
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <History className="w-6 h-6" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Status History</CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-400 mt-1">Updates on your support request.</CardDescription>
                 </div>
               </div>
            </CardHeader>
            <CardContent className="p-10 sm:p-14">
               <div className="space-y-12 relative text-slate-900">
                 <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />
                 
                 <div className="flex items-start gap-10 relative">
                    <div className="mt-2 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-lg z-10 shrink-0" />
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-slate-900 tracking-tight">Ticket Created</p>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-base text-slate-500 font-medium leading-relaxed">We received your request. Priority marked as <span className="text-blue-600 font-bold uppercase text-xs px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">{ticket.priority}</span>.</p>
                    </div>
                 </div>

                 {ticket.status === 'resolved' && (
                    <div className="flex items-start gap-10 relative text-slate-900">
                       <div className="mt-2 w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-lg z-10 shrink-0" />
                       <div className="space-y-3">
                          <div className="flex items-center gap-4">
                             <p className="text-lg font-bold text-slate-900 tracking-tight">Ticket Resolved</p>
                             <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                COMPLETED
                             </span>
                          </div>
                          <p className="text-base text-slate-500 font-medium leading-relaxed">The issue has been resolved by our IT staff. Your request is now complete.</p>
                       </div>
                    </div>
                 )}
               </div>
            </CardContent>
          </Card>

        </div>

        {/* ─── RIGHT: STATUS PANEL ─── */}
        <div className="lg:col-span-4 space-y-10 sticky top-28">
          
          <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50 bg-blue-50/30">
               <div className="flex items-center gap-4 text-blue-600">
                 <ShieldCheck className="w-6 h-6" />
                 <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Assigned Support</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
               <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-inner group">
                  <div className="relative mb-6">
                    <UserAvatar 
                      avatarUrl={ticket.assignee?.avatar_url} 
                      fullName={ticket.assignee?.full_name} 
                      size="xl"
                      className="ring-8 ring-white shadow-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                       <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 leading-none">IT Engineer</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-4">
                    {ticket.assignee?.full_name || "Awaiting Assignment"}
                  </p>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">A specialized technician will handle your request.</p>
               </div>

               <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between px-2">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest tracking-widest">Status Tracking</p>
                     <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="h-16 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center gap-4 px-6 shadow-xl shadow-slate-900/10">
                     <Activity className="w-5 h-5 text-blue-400" />
                     <span className="font-bold uppercase tracking-widest text-xs">Helpdesk Monitoring Active</span>
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className="bg-blue-600 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Info className="w-32 h-32" />
             </div>
             <p className="text-xs font-bold uppercase tracking-widest mb-4 text-white/60 flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" /> Official Support Request
             </p>
             <h4 className="text-2xl font-bold tracking-tight mb-4 leading-tight">Your request is safe with us.</h4>
             <p className="text-sm text-blue-50/80 font-medium leading-relaxed">This ticket is visible only to you and our IT support staff. Your data is handled securely. </p>
          </div>
        </div>
      </div>
    </div>
  );
}
