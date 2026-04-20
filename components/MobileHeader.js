"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

export default function MobileHeader({ 
  profile, 
  role = "employee", 
  theme = "light", 
  children,
  signOutAction 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <>
      <header className={`lg:hidden h-16 flex items-center justify-between px-4 sticky top-0 z-50 border-b ${
        isDark ? 'bg-[#09090b] border-white/5' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
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
          <NotificationBell role={role} theme={theme} />
          <Link href={`/${role}/profile`} className="flex items-center gap-3 hover:bg-white/5 p-1 rounded-xl transition-all group">
            <div className="hidden sm:block text-right">
              <p className={`text-xs font-bold leading-none mb-0.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                {profile.full_name.split(' ')[0]}
              </p>
            </div>
            <UserAvatar 
              avatarUrl={profile.avatar_url} 
              fullName={profile.full_name} 
              size="sm" 
              className={isDark ? 'border-white/10' : 'border-slate-200'}
            />
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDark ? 'bg-[#09090b] border-r border-white/5' : 'bg-white border-r border-slate-200'}`}>
        <div className="flex flex-col h-full">
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

          <div className="flex-1 py-6 overflow-y-auto" onClick={() => setIsOpen(false)}>
            {children}
          </div>

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
