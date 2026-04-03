"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users, UserCircle } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "All Tickets", href: "/admin/tickets", icon: Ticket },
    { name: "IT Staff", href: "/admin/settings", icon: Users },
    { name: "My Profile", href: "/admin/profile", icon: UserCircle },
  ];

  return (
    <nav className="flex-1 px-3 space-y-1">
      <div className="px-3 mb-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">MENU</p>
      </div>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.item}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
              isActive
                ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
