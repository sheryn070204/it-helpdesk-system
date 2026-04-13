"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  Copy, 
  ChevronLeft,
  Calendar as CalendarIcon,
  Hash as HashIcon,
  Settings,
  Save,
  User as UserIcon,
  Clock as ClockIcon,
  Activity as ActivityIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StaffTicketDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  // Guard against double fetch
  const hasFetched = useRef(false);

  const fetchData = useCallback(async (id) => {
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          id, title, description, priority, status, created_at, assigned_to, submitted_by,
          profiles!tickets_submitted_by_fkey (full_name, email, avatar_url),
          assignee:profiles!tickets_assigned_to_fkey (full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (ticketError) throw new Error("Ticket not found or unauthorized access.");

      setTicket(ticketData);
      setSelectedStatus(ticketData.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (ticketId && !hasFetched.current) {
      hasFetched.current = true;
      fetchData(ticketId);
    }
  }, [ticketId, fetchData]);

  async function handleSaveChanges() {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const { error: updateError } = await supabase
        .from("tickets")
        .update({ status: selectedStatus })
        .eq("id", ticketId);

      if (updateError) throw updateError;

      toast.success("Changes saved successfully.");

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
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticket?.id);
    toast.info("Ticket ID copied");
  };

  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: "bg-slate-100 text-slate-600 border-slate-200",
      medium: "bg-blue-50 text-blue-700 border-blue-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      urgent: "bg-red-50 text-red-700 border-red-200",
      critical: "bg-red-50 text-red-700 border-red-200"
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colors[priority?.toLowerCase()] || colors.low}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      open: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
      resolved: "bg-green-50 text-green-700 border-green-200",
      closed: "bg-slate-100 text-slate-500 border-slate-200"
    };
    const labelMap = {
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed"
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${configs[status] || configs.open}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="text-slate-500 font-semibold">Loading ticket details...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <Card className="max-w-2xl mx-auto mt-20 border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
            <UserIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-slate-900 font-bold text-2xl mb-2">Notice</h3>
          <p className="text-slate-500 text-base mb-8">{error}</p>
          <Link href="/it-staff/tickets">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-8 h-11 rounded-xl font-semibold">
              Back to Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const submitterName = ticket?.profiles?.full_name || ticket?.profiles?.email || 'Unknown User';
  const assignedStaff = ticket?.assignee;

  const activityLog = [
    { description: "Ticket created by employee", created_at: ticket.created_at },
    ...(ticket.assigned_to ? [{ description: `Ticket assigned to ${ticket.assignee?.full_name}`, created_at: ticket.created_at }] : [])
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-100 min-h-screen max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link href="/it-staff/tickets">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 font-semibold px-0 -ml-2">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Tickets
          </Button>
        </Link>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono text-xs px-3 py-1.5 rounded-lg">
             Ticket Ref: {ticket.id.slice(0, 8).toUpperCase()}
           </Badge>
           <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-9 w-9 text-slate-400 hover:text-blue-600 rounded-lg">
             <Copy className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <PriorityBadge priority={ticket?.priority} />
              <StatusBadge status={ticket?.status} />
              <span className="text-sm text-slate-400 flex items-center gap-1.5 ml-auto">
                <CalendarIcon className="h-4 w-4" />
                {new Date(ticket?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{ticket?.title}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Submitted By</p>
                  <p className="text-base font-semibold text-slate-900">{submitterName}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <HashIcon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Ticket ID</p>
                  <p className="text-base font-semibold text-slate-700 font-mono">{ticket?.id?.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Description</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket?.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center"><ClockIcon className="h-5 w-5 text-slate-500" /></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Activity Log</h3>
                <p className="text-sm text-slate-500">History of updates on this ticket</p>
              </div>
            </div>
            <div className="space-y-3">
              {activityLog.map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5"><ActivityIcon className="h-4 w-4 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-slate-700 font-medium">{log.description}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center"><Settings className="h-5 w-5 text-blue-600" /></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ticket Actions</h3>
                <p className="text-sm text-slate-500">Manage this ticket</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Update Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 text-base border-slate-200 rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Assigned To</label>
              {assignedStaff ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignedStaff?.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">{getInitials(assignedStaff?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900 truncate">{assignedStaff?.full_name}</p>
                    <p className="text-sm text-slate-500">IT Staff</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center"><p className="text-sm text-slate-400">Not yet assigned</p></div>
              )}
            </div>
            <Button onClick={handleSaveChanges} disabled={saving} className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition">
              {saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span> : <span className="flex items-center gap-2"><Save className="h-4 w-4" />Save Changes</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
