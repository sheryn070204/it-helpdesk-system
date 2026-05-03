// Import tools from Next.js and our local files
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer"; // Server-side database tool
import { UserAvatar } from "@/components/UserAvatar"; // User's profile picture component
import NotificationBell from "@/components/NotificationBell"; // Alert bell component
import EmployeeNav from "@/components/EmployeeNav"; // Navigation links for employees
import MobileHeader from "@/components/MobileHeader"; // Header for phone users
// Import icons for the dashboard
import { 
  LifeBuoy, 
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button"; // A nice button component

// This function builds the main layout for every page in the Employee section
export default async function EmployeeLayout({ children }) {
  // Connect to the database
  const supabase = await createClient();

  // 1. Security Check: Make sure the user is actually logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If NOT logged in, send them back to the login page
  if (!user) {
    redirect("/login");
  }

  // 2. Get the user's name and details from their profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If there is no profile, something is wrong, so send them to login
  if (!profile) {
    redirect("/login");
  }

  // This function runs when the user clicks "Log out"
  async function handleSignOut() {
    "use server"; // This tells the computer to run this on the server
    const supabase = await createClient();
    await supabase.auth.signOut(); // Log out from Supabase
    redirect("/login"); // Go back to the login page
  }

  return (
    // The main container for the whole screen
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      
      {/* Show this header only on mobile phones */}
      <MobileHeader 
        profile={profile} 
        role="employee" 
        theme="light"
        signOutAction={handleSignOut}
      >
        <EmployeeNav />
      </MobileHeader>

      {/* ─── SIDEBAR (This is the menu on the left for big computer screens) ─── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-slate-200 flex-col min-h-screen sticky top-0">
        {/* Brand Name and Logo at the top of the sidebar */}
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

        {/* This part contains the navigation links (Home, My Requests, etc.) */}
        <div className="flex-1 py-6">
          <EmployeeNav />
        </div>

        {/* Log Out button at the bottom of the sidebar */}
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

      {/* ─── MAIN CONTENT AREA (This is where the actual pages are shown) ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header (Visible only on big computer screens) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee Portal</p>
           </div>
          
          <div className="flex items-center gap-6">
            {/* The alert bell */}
            <NotificationBell role="employee" theme="light" />
            
            {/* User Profile section in the top right corner */}
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

        {/* The actual content of the page goes here */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
