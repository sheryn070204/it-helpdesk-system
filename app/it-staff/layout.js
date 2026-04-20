import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import ITStaffNav from "@/components/ITStaffNav";
import { UserAvatar } from "@/components/UserAvatar";
import MobileHeader from "@/components/MobileHeader";
import Link from "next/link";
import { 
  Monitor, 
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ITStaffLayout({ children }) {
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

  if (!profile || (profile.role !== "it_staff" && profile.role !== "admin")) {
    redirect("/employee");
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      
      {/* Mobile Header & Sidebar */}
      <MobileHeader 
        profile={profile} 
        role="it-staff" 
        theme="light"
        signOutAction={handleSignOut}
      >
        <ITStaffNav />
      </MobileHeader>

      {/* ─── SIDEBAR (Desktop) ─── */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 sticky top-0">
        
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800">
          <Link href="/it-staff" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-black text-xl tracking-tight leading-none mb-1">HelpDesk</h1>
              <p className="text-blue-400 text-xs uppercase font-bold tracking-widest leading-none">IT Staff</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <ITStaffNav />
        </div>

        {/* Log Out at Bottom */}
        <div className="px-4 py-4 border-t border-slate-800">
          <form action={handleSignOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-all group font-bold">
              <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header (Desktop) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30 shadow-sm flex-shrink-0">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            IT Support Dashboard
          </p>
          <div className="flex items-center gap-6">
            <NotificationBell role="it_staff" theme="light" />
            
            {/* Clickable Profile in Header */}
            <Link href="/it-staff/profile" className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-2xl transition-all group">
              <UserAvatar 
                avatarUrl={profile?.avatar_url} 
                fullName={profile?.full_name}
                size="md"
                className="border border-slate-200 group-hover:border-blue-600 transition-colors"
              />
              <div className="text-left">
                <p className="text-base font-bold text-slate-900 leading-none mb-1">{profile?.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Support Team</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
