import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import ITStaffNav from "@/components/ITStaffNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Monitor, 
  LogOut
} from "lucide-react";

export default async function ITStaffLayout({ children }) {
  const supabase = await createClient();

  // 1. Auth Guard - Use getUser for server-side security as recommended
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

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 sticky top-0">
        
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-black text-xl tracking-tight leading-none mb-1">HelpDesk</h1>
              <p className="text-blue-400 text-xs uppercase font-bold tracking-widest leading-none">IT Staff</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <p className="px-6 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </p>
          <ITStaffNav />
        </div>

        {/* Bottom User Card */}
        <div className="px-3 py-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer group">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white truncate leading-none mb-1">
                {profile?.full_name || user?.email}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                IT Staff
              </p>
            </div>
            <form action={handleSignOut}>
              <button type="submit" className="flex items-center justify-center p-1">
                <LogOut className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            IT Support Dashboard
          </p>
          <div className="flex items-center gap-2">
            <NotificationBell role="it_staff" theme="light" />
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
