import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { LayoutDashboard, Plus, Ticket, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPriorityBadge, getStatusBadge } from "@/lib/badgeHelpers";

export default async function EmployeeDashboard() {
  const supabase = await createClient();

  // 1. Get current logged-in employee
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Handled by layout redirect

  // 2. Fetch full name for greeting
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // 3. Fetch all their tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, title, status, priority, created_at")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  // 4. Calculate Stats
  const total = tickets?.length || 0;
  const open = tickets?.filter((t) => t.status === "open").length || 0;
  const inProgress = tickets?.filter((t) => t.status === "in_progress").length || 0;
  const resolved = tickets?.filter((t) => t.status === "resolved").length || 0;

  // 5. Get 5 most recent tickets for list
  const recentTickets = tickets?.slice(0, 5) || [];

  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Date formatted nicely
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ─── Top Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {profile?.full_name?.split(' ')[0] || "there"}!
          </h1>
          <p className="text-slate-500 font-medium mt-1">{currentDate}</p>
        </div>
        
        <Link href="/employee/submit">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 px-5 py-6 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            Submit New Ticket
          </Button>
        </Link>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tickets" value={total} icon={Ticket} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Open" value={open} icon={Clock} color="text-blue-500" bg="bg-blue-50" />
        <StatCard title="In Progress" value={inProgress} icon={Loader2} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Resolved" value={resolved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* ─── Recent Tickets Section ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Recent Tickets</h2>
          {total > 0 && (
            <Link href="/employee/tickets">
              <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0 font-semibold h-auto">
                View All
              </Button>
            </Link>
          )}
        </div>

        {recentTickets.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No tickets yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              You haven't submitted any IT tickets. If you need assistance with your hardware or software, submit your first ticket!
            </p>
            <Link href="/employee/submit" className="mt-6">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Submit a Request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-500">Title</TableHead>
                  <TableHead className="font-semibold text-slate-500">Priority</TableHead>
                  <TableHead className="font-semibold text-slate-500">Status</TableHead>
                  <TableHead className="font-semibold text-slate-500">Date Submitted</TableHead>
                  <TableHead className="font-semibold text-slate-500 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.map(ticket => (
                  <TableRow key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="font-bold text-slate-900 border-b border-slate-100">
                      {ticket.title.length > 40 ? ticket.title.substring(0, 40) + '...' : ticket.title}
                    </TableCell>
                    <TableCell className="border-b border-slate-100">
                      {getPriorityBadge(ticket.priority)}
                    </TableCell>
                    <TableCell className="border-b border-slate-100">
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell className="text-slate-500 border-b border-slate-100">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right border-b border-slate-100">
                      <Link href="/employee/tickets">
                        <Button variant="outline" size="sm" className="font-semibold text-slate-600 hover:text-slate-900">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

    </div>
  );
}

// Sub-component for Stats
function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        <div className={`p-2 rounded-xl ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
