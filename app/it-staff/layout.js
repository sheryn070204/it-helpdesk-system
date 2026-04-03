import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import ITStaffNav from "@/components/ITStaffNav";
import { UserAvatar } from "@/components/UserAvatar";
import { 
  Wrench, 
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

  if (!profile || (profile.role !== "it_staff" && profile.role !== "it-staff" && profile.role !== "admin")) {
    redirect("/employee");
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
          <Link href="/it-staff" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight leading-none mb-0.5">HelpDesk</p>
              <p className="text-indigo-400 text-[9px] uppercase font-bold tracking-widest leading-none">IT Staff</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <ITStaffNav />
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
              <p className="text-sm font-semibold text-slate-200 truncate leading-none mb-1">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Support Staff</p>
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

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {/* Top Header */}
        <header className="h-16 bg-[#09090b] border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <div className="w-1 h-5 bg-indigo-500 rounded-full" />
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
               IT Support Dashboard
             </div>
           </div>
          
          <div className="flex items-center gap-6">
            <NotificationBell role="it-staff" theme="dark" />
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
