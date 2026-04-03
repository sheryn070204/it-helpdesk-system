import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import ITStaffNav from "@/components/ITStaffNav";
import { Wrench, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default async function ITStaffLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "it_staff" && profile.role !== "it-staff")) {
    if (profile?.role === "admin") redirect("/admin");
    redirect("/employee");
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "IT";

  return (
    <div className="min-h-screen flex bg-[#0f1117]">
      {/* ─── Dark Sidebar ─── */}
      <aside className="w-[220px] flex-shrink-0 bg-[#0c0d12] border-r border-slate-800 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center">
          <Link href="/it-staff" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">IT Support</p>
              <p className="text-indigo-400 text-[10px] uppercase tracking-widest font-mono mt-0.5">Engineer Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ITStaffNav />

        {/* User Info + Log Out */}
        <div className="px-4 py-4 border-t border-slate-800 bg-[#0c0d12]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <Avatar className="w-9 h-9 border border-indigo-900 shadow-sm">
              <AvatarFallback className="bg-indigo-900 text-indigo-100 font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-200 truncate">{profile.full_name}</p>
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mt-0.5">IT Support Eng</p>
            </div>
          </div>
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 h-9 px-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors group"
            >
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
              <span className="text-sm font-semibold">Log Out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#0c0d12] border-b border-slate-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:block">Active Workspace</p>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell role="it_staff" theme="dark" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
          <div className="w-full text-slate-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
