import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import AdminNav from "@/components/AdminNav";
import { UserAvatar } from "@/components/UserAvatar";
import MobileHeader from "@/components/MobileHeader";
import {
  LogOut,
  Terminal,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();

  // 1. Auth Guard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Role Guard
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "it_staff")) { 
    if (profile?.role === "employee") {
       redirect("/employee");
    }
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#09090b] text-slate-200">
      
      {/* Mobile Header & Sidebar */}
      <MobileHeader 
        profile={profile} 
        role="admin" 
        theme="dark"
        signOutAction={handleSignOut}
      >
        <AdminNav />
      </MobileHeader>

      {/* ─── SIDEBAR (Desktop) ─── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#09090b] border-r border-white/5 flex-col min-h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight leading-none mb-1">HelpDesk</p>
              <p className="text-indigo-400 text-[10px] uppercase font-bold tracking-widest leading-none">Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <AdminNav />
        </div>

        {/* Log Out at Bottom */}
        <div className="p-4 border-t border-white/5">
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full flex items-center justify-start gap-3 h-12 px-4 text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors group rounded-xl"
            >
              <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
              <span className="text-base font-bold">Log out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {/* Top Header Bar (Desktop) */}
        <header className="hidden lg:flex h-16 bg-[#09090b] border-b border-slate-800 px-8 items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex-1 max-w-md flex items-center relative">
            <Search className="w-4 h-4 absolute left-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-11 h-11 bg-[#111113] border-slate-800 text-slate-300 focus-visible:ring-indigo-500 w-full rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <NotificationBell role="admin" theme="dark" />
            
            {/* Clickable Profile in Header */}
            <Link href="/admin/profile" className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-2xl transition-all group">
              <UserAvatar
                avatarUrl={profile.avatar_url}
                fullName={profile.full_name}
                size="md"
                className="border border-white/10 group-hover:border-indigo-500 transition-colors"
              />
              <div className="hidden xl:block text-left">
                <p className="text-base font-bold text-slate-200 leading-none mb-1">{profile.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Administrator</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto text-slate-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
