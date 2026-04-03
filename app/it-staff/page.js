import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Inbox, Loader2 } from "lucide-react";

export default async function ITStaffDashboard() {
  const supabase = await createClient();

  // 1. Get User Profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // 2. Fetch Tickets assigned to this user
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      id, title, priority, status, created_at, description,
      submitter:profiles!tickets_submitted_by_fkey (full_name)
    `)
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false });

  // 3. Calculate Stats
  const assigned = tickets?.length || 0;
  const inProgress = tickets?.filter(t => t.status === "in_progress").length || 0;
  const resolved = tickets?.filter(t => t.status === "resolved").length || 0;

  // 4. Sort tickets by priority (for the "My Queue")
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  
  // create a sorted copy to show only non-resolved in the queue
  const queue = (tickets || [])
    .filter(t => t.status !== "resolved")
    .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  // Priority color borders
  const priorityBorderColors = {
    critical: "border-l-red-500 bg-red-950/20",
    high: "border-l-orange-500 bg-orange-950/20",
    medium: "border-l-amber-500 bg-amber-950/20",
    low: "border-l-emerald-500 bg-emerald-950/20",
  };

  const getUnresolvedCount = () => queue.length;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hello {profile?.full_name?.split(" ")[0]}, <span className="font-medium text-slate-500">IT Support</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Here is your active engineering queue.</p>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Assigned Queue" value={assigned} icon={Inbox} color="text-indigo-400" bg="bg-indigo-950/50" />
        <StatCard title="In Progress" value={inProgress} icon={Loader2} color="text-amber-400" bg="bg-amber-950/50" />
        <StatCard title="Total Resolved" value={resolved} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-950/50" />
      </div>

      {/* ─── My Queue Section ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            My Actionable Queue
          </h2>
          {getUnresolvedCount() > 0 && (
            <span className="bg-red-950/50 text-red-400 border border-red-900 font-bold px-3 py-1 rounded-full text-xs box-content">
              {getUnresolvedCount()} Items
            </span>
          )}
        </div>

        {queue.length === 0 ? (
          <Card className="shadow-sm border-slate-800 bg-[#18181b] border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 bg-[#09090b] border border-slate-700/50 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your queue is clear!</h3>
              <p className="text-slate-400 max-w-sm mx-auto text-sm">
                You don't have any open tickets assigned to you right now. Excellent work!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {queue.map((ticket) => (
              <Card 
                key={ticket.id} 
                className={`overflow-hidden shadow-md max-w-none border-t border-r border-b border-slate-800 transition-all hover:shadow-lg border-l-4 ${priorityBorderColors[ticket.priority] || "border-l-slate-700 bg-[#18181b]"}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Ticket Content */}
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Flex Header */}
                      <div className="flex items-center gap-3">
                        {getPriorityBadge(ticket.priority)}
                        <span className="text-xs font-mono text-slate-500">#{ticket.id.slice(0, 8)}</span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 ml-auto md:ml-0">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{ticket.title}</h3>
                        <p className="text-sm font-medium text-slate-400 line-clamp-1">{ticket.description}</p>
                      </div>
                      
                      {/* Submitter */}
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 bg-slate-700 rounded-full" />
                        Submitted by <span className="font-bold text-slate-300">{ticket.submitter?.full_name}</span>
                      </p>
                    </div>

                    {/* Actions panel */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:pl-6 md:border-l md:border-slate-800 shrink-0">
                      <div>  
                        {getStatusBadge(ticket.status)}
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full mt-auto">
                        <Link href={`/it-staff/tickets/${ticket.id}`} className="w-full">
                          <Button variant={ticket.status === 'open' ? "outline" : "default"} className={`w-full font-bold shadow-sm ${ticket.status === 'open' ? 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-950/50 bg-[#09090b]' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                            {ticket.status === 'open' ? 'View Details' : 'Manage Ticket'}
                          </Button>
                        </Link>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component
function StatCard({ title, value, color, bg, icon: Icon }) {
  return (
    <Card className="border-slate-800 bg-[#18181b] shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-6 flex items-center gap-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-black text-white tracking-tight leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
