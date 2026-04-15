import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import AdminNav from "@/components/AdminNav";
import { UserAvatar } from "@/components/UserAvatar";
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
  const { //Check who log in 
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) { //check if there is a  user 
    redirect("/login"); //if no, back to log in page
  }

  // 2. Role Guard
  const { data: profile, error: profileError } = await supabase //check role of user
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Layout: Profile query failed.", profileError);
  }

  // Handle unauthorized access or missing profile
  if (!profile || (profile.role !== "admin" && profile.role !== "it_staff")) { 
    if (profile?.role === "employee") {
       redirect("/employee");
    }
    // If we can't find a valid role, fallback to login
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#09090b] text-slate-200">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-56 flex-shrink-0 bg-[#09090b] border-r border-white/5 flex flex-col min-h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight leading-none mb-1">HelpDesk</p>
              <p className="text-indigo-400 text-xs uppercase font-bold tracking-widest leading-none">Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <AdminNav />
        </div>

        {/* User Info + Log Out */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-2">
            <UserAvatar
              avatarUrl={profile.avatar_url}
              fullName={profile.full_name}
              size="sm"
              className="border border-slate-700"
            />
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-200 truncate leading-none mb-1">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Administrator</p>
            </div>
          </div>
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 h-9 px-2 text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors group"
            >
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
              <span className="text-xs font-medium">Log out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#09090b] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex-1 max-w-md hidden sm:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-500" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-9 h-9 bg-[#111113] border-slate-800 text-slate-300 focus-visible:ring-indigo-500 w-full rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell role="admin" theme="dark" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-[1400px] mx-auto text-slate-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
