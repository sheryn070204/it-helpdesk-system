import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import AdminNav from "@/components/AdminNav";
import { Shield, Search, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminLayout({ children }) {
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

  // Only admins allowed
  if (!profile || profile.role !== "admin") {
    if (profile?.role === "it_staff" || profile?.role === "it-staff") redirect("/it-staff");
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
    .toUpperCase() || "AD";

  return (
    <div className="min-h-screen flex bg-[#09090b]">
      {/* ─── Dark Sidebar ─── */}
      <aside className="w-[240px] flex-shrink-0 bg-[#09090b] border-r border-slate-800 flex flex-col min-h-screen relative z-20">
        {/* Logo */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center">
          <Link href="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 bg-zinc-800 border border-slate-700 rounded-full flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">HelpDesk</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-mono mt-0.5">Admin Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <AdminNav />

        {/* User Info + Log Out */}
        <div className="px-4 py-4 border-t border-slate-800 bg-[#09090b]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <Avatar className="w-9 h-9 border border-slate-700">
              <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{profile.full_name}</p>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 h-9 px-3 text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors group"
            >
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
              <span className="text-sm font-medium">Log out securely</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden bg-[#09090b]">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#09090b] border-b border-slate-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          
          <div className="flex-1 max-w-md hidden sm:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-500" />
            <Input 
              type="text" 
              placeholder="Search all systems..." 
              className="pl-9 h-9 bg-[#18181b] border-slate-800 text-slate-300 focus-visible:ring-slate-500 w-full rounded-lg text-sm placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-5 ml-auto">
            <div className="flex items-center gap-2 hidden lg:flex bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">System Online</span>
            </div>
            
            <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>
            
            <NotificationBell role="admin" theme="dark" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="w-full text-slate-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
