import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { UserAvatar } from "@/components/UserAvatar";
import NotificationBell from "@/components/NotificationBell";
import EmployeeNav from "@/components/EmployeeNav";
import MobileHeader from "@/components/MobileHeader";
import { 
  LifeBuoy, 
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function EmployeeLayout({ children }) {
  const supabase = await createClient();

  // 1. Auth Guard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Profile for Layout
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      
      {/* Mobile Header & Sidebar */}
      <MobileHeader 
        profile={profile} 
        role="employee" 
        theme="light"
        signOutAction={handleSignOut}
      >
        <EmployeeNav />
      </MobileHeader>

      {/* ─── SIDEBAR (Desktop) ─── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-slate-200 flex-col min-h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-100">
          <Link href="/employee" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-xl tracking-tight leading-none mb-1">HelpDesk</p>
              <p className="text-indigo-600 text-xs uppercase font-bold tracking-widest leading-none">Employee</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <EmployeeNav />
        </div>

        {/* Log Out at Bottom */}
        <div className="p-4 border-t border-slate-100">
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full flex items-center justify-start gap-3 h-12 px-4 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors group rounded-xl"
            >
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="text-base font-bold">Log out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header (Desktop) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee Portal</p>
           </div>
          
          <div className="flex items-center gap-6">
            <NotificationBell role="employee" theme="light" />
            
            {/* Clickable Profile in Header */}
            <Link href="/employee/profile" className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-2xl transition-all group">
              <UserAvatar 
                avatarUrl={profile.avatar_url} 
                fullName={profile.full_name} 
                size="md"
                className="border border-slate-200 group-hover:border-indigo-600 transition-colors"
              />
              <div className="text-left">
                <p className="text-base font-bold text-slate-900 leading-none mb-1">{profile.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Verified Employee</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
