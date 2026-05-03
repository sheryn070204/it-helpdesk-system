// Tell the computer this code runs in the browser
"use client";

// Import tools from React and other files
import { useState } from "react"; // To remember if the menu is open
import { Menu, X, LogOut } from "lucide-react"; // Icons for the menu
import { Button } from "@/components/ui/button"; // A nice button
import { UserAvatar } from "@/components/UserAvatar"; // User's profile picture
import Link from "next/link"; // For clickable links
import NotificationBell from "@/components/NotificationBell"; // The alert bell

// This function builds the header and menu for mobile phones
export default function MobileHeader({ 
  profile, // User's name and picture
  role = "employee", // If they are staff, admin, or employee
  theme = "light", // If the app looks light or dark
  children, // The links inside the menu
  signOutAction // What happens when they log out
}) {
  // Remember if the side menu is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Check if we should use the dark colors
  const isDark = theme === "dark";

  return (
    <>
      {/* This is the top bar you see on your phone */}
      <header className={`lg:hidden h-16 flex items-center justify-between px-4 sticky top-0 z-50 border-b ${
        isDark ? 'bg-[#09090b] border-white/5' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          {/* This button opens the side menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(true)}
            className={isDark ? 'text-slate-400' : 'text-slate-600'}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Show the alert bell */}
          <NotificationBell role={role} theme={theme} />
          {/* Link to the user's profile page */}
          <Link href={`/${role}/profile`} className="flex items-center gap-3 hover:bg-white/5 p-1 rounded-xl transition-all group">
            <div className="hidden sm:block text-right">
              {/* Show only the first name of the user */}
              <p className={`text-xs font-bold leading-none mb-0.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                {profile.full_name.split(' ')[0]}
              </p>
            </div>
            {/* Show the user's profile picture */}
            <UserAvatar 
              avatarUrl={profile.avatar_url} 
              fullName={profile.full_name} 
              size="sm" 
              className={isDark ? 'border-white/10' : 'border-slate-200'}
            />
          </Link>
        </div>
      </header>

      {/* This makes the screen dark when the menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* This is the actual menu that slides out from the left */}
      <aside className={`fixed inset-y-0 left-0 w-72 z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDark ? 'bg-[#09090b] border-r border-white/5' : 'bg-white border-r border-slate-200'}`}>
        <div className="flex flex-col h-full">
          {/* Top of the side menu with the name and a close button */}
          <div className={`h-16 px-6 flex items-center justify-between border-b ${
            isDark ? 'border-white/5' : 'border-slate-100'
          }`}>
            <span className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              HelpDesk
            </span>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </Button>
          </div>

          {/* This part contains the links (Dashboard, Tickets, etc.) */}
          <div className="flex-1 py-6 overflow-y-auto" onClick={() => setIsOpen(false)}>
            {children}
          </div>

          {/* Bottom part with the Log Out button */}
          <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                className={`w-full flex items-center justify-start gap-3 h-12 px-4 rounded-xl transition-colors ${
                  isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-950/20' : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-base font-bold">Log out</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
