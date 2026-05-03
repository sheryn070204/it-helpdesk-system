// Import tools from Next.js and our local library files
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer"; // Server-side database tool
import NotificationBell from "@/components/NotificationBell"; // Alert bell component
import AdminNav from "@/components/AdminNav"; // Sidebar menu for admins
import { UserAvatar } from "@/components/UserAvatar"; // Profile picture component
import MobileHeader from "@/components/MobileHeader"; // Header for mobile phone users
// Import icons for the layout
import {
  LogOut,
  Terminal,
  Search
} from "lucide-react";
// Import UI components (buttons, inputs, etc.)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// This function builds the main layout for every page in the Admin section
export default async function AdminLayout({ children }) {
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

  // 2. Job Title Check: Make sure only Admins or Staff can see this part
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If they are just an "employee", send them to their own dashboard instead
  if (!profile || (profile.role !== "admin" && profile.role !== "it-staff")) { 
    if (profile?.role === "employee") {
       redirect("/employee");
    }
    // If we don't know who they are, send them to login
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
    // The main container for the screen (uses a cool dark theme)
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#09090b] text-slate-200">
      
      {/* Mobile Header (Visible only on phone screens) */}
      <MobileHeader 
        profile={profile} 
        role="admin" 
        theme="dark"
        signOutAction={handleSignOut}
      >
        <AdminNav />
      </MobileHeader>

      {/* ─── SIDEBAR (The menu on the left for big computer screens) ─── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#09090b] border-r border-white/5 flex-col min-h-screen sticky top-0">
        {/* Brand Logo and Name at the top of the sidebar */}
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

        {/* This part contains the navigation links (Home, All Tickets, etc.) */}
        <div className="flex-1 py-6">
          <AdminNav />
        </div>

        {/* Log Out button at the bottom of the sidebar */}
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

      {/* ─── Main Content Area (Where the actual dashboard pages are shown) ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        {/* Top Header Bar (Visible only on big computer screens) */}
        <header className="hidden lg:flex h-16 bg-[#09090b] border-b border-slate-800 px-8 items-center justify-between sticky top-0 z-10 shrink-0">
          {/* Search bar in the top header */}
          <div className="flex-1 max-w-md flex items-center relative">
            <Search className="w-4 h-4 absolute left-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-11 h-11 bg-[#111113] border-slate-800 text-slate-300 focus-visible:ring-indigo-500 w-full rounded-xl text-sm"
            />
          </div>

          <div className="flex items-center gap-6 ml-auto">
            {/* The alert bell */}
            <NotificationBell role="admin" theme="dark" />
            
            {/* Admin's Profile section in the top right corner */}
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

        {/* The actual content of the page goes here */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto text-slate-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
