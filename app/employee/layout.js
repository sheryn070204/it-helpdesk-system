import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import NotificationBell from "@/components/NotificationBell";
import EmployeeNav from "@/components/EmployeeNav";
import { LogOut, LifeBuoy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default async function EmployeeLayout({ children }) {
  const supabase = await createClient();

  // Verify the user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Guard routing
  if (!profile || profile.role !== "employee") {
    if (profile?.role === "admin") redirect("/admin");
    if (profile?.role === "it_staff" || profile?.role === "it-staff") redirect("/it-staff");
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  // Calculate initials like "JD" from "John Doe"
  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "ME";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex-shrink-0">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand/Logo Area */}
          <Link href="/employee" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <LifeBuoy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">IT Helpdesk</span>
          </Link>

          {/* Right Side Tools */}
          <div className="flex items-center gap-4 lg:gap-6">
            <NotificationBell role="employee" theme="light" />
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-900 leading-none">{profile.full_name}</p>
                <p className="text-xs text-slate-500 mt-1">Staff Member</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-blue-100 shadow-sm">
                <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <form action={handleSignOut}>
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon"
                  title="Sign Out"
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full w-10 h-10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout Block */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:block flex-shrink-0">
          <EmployeeNav />
        </aside>

        {/* Page Content area */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
