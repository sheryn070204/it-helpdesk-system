// Import tools from Next.js and our local library files
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer"; // Server-side database tool
import NotificationBell from "@/components/NotificationBell"; // Alert bell component
import ITStaffNav from "@/components/ITStaffNav"; // Sidebar menu for IT staff
import { UserAvatar } from "@/components/UserAvatar"; // Profile picture component
import MobileHeader from "@/components/MobileHeader"; // Header for mobile phone users
import Link from "next/link";
// Import icons for the layout
import { 
  Monitor, 
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

// This function builds the main layout for every page in the IT Staff section
export default async function ITStaffLayout({ children }) {
  // Connect to the database
  const supabase = await createClient();

  // 1. Security Check: Make sure the user is actually logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If NOT logged in, send them to the login page
  if (!user) {
    redirect("/login");
  }

  // 2. Job Title Check: Make sure only IT Staff (or Admins) can see this part
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If they are just an "employee", send them to the employee dashboard instead
  if (!profile || (profile.role !== "it-staff" && profile.role !== "admin")) {
    redirect("/employee");
  }

  // This function runs when the user clicks "Log out"
  async function handleSignOut() {
    "use server"; // This tells the computer to run this on the server
    const supabase = await createClient();
    await supabase.auth.signOut(); // Log out from Supabase
    redirect("/login"); // Go back to the login page
  }

  return (
    // The main container for the screen
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      
      {/* Mobile Header (Visible only on phone screens) */}
      <MobileHeader 
        profile={profile} 
        role="it-staff" 
        theme="light"
        signOutAction={handleSignOut}
      >
        <ITStaffNav />
      </MobileHeader>

      {/* ─── SIDEBAR (The menu on the left for big computer screens) ─── */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 sticky top-0">
        
        {/* Brand Logo and Name at the top of the sidebar */}
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

        {/* This part contains the navigation links (Assigned, All, Profile) */}
        <div className="flex-1 py-6">
          <ITStaffNav />
        </div>

        {/* Log Out button at the bottom of the sidebar */}
        <div className="px-4 py-4 border-t border-slate-800">
          <form action={handleSignOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-all group font-bold">
              <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA (Where the actual dashboard pages are shown) ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar (Visible only on big computer screens) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30 shadow-sm flex-shrink-0">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            IT Support Dashboard
          </p>
          <div className="flex items-center gap-6">
            {/* The alert bell */}
            <NotificationBell role="it-staff" theme="light" />
            
            {/* IT Staff's Profile section in the top right corner */}
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

        {/* The actual content of the page goes here */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
