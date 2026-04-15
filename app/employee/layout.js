import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { UserAvatar } from "@/components/UserAvatar";
import NotificationBell from "@/components/NotificationBell";
import EmployeeNav from "@/components/EmployeeNav";
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
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* ─── SIDEBAR (Matched Admin structure, kept Employee colors) ─── */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-screen sticky top-0">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-100">
          <Link href="/employee" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
              <LifeBuoy className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-xl tracking-tight leading-none mb-1">HelpDesk</p>
              <p className="text-indigo-600 text-xs uppercase font-bold tracking-widest leading-none">Employee</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <EmployeeNav />
        </div>

        {/* User Info + Log Out (Matched Admin structure, kept Employee colors) */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-2">
            <UserAvatar 
              avatarUrl={profile.avatar_url} 
              fullName={profile.full_name} 
              size="sm"
              className="border border-slate-200"
            />
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 truncate leading-none mb-1">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Verified User</p>
            </div>
          </div>
          <form action={handleSignOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 h-9 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="text-xs font-medium">Log out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
           </div>
          
          <div className="flex items-center gap-6">
            <NotificationBell role="employee" theme="light" />
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
