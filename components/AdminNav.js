"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "All Tickets", href: "/admin/tickets", icon: Ticket },
    { name: "IT Staff & Settings", href: "/admin/settings", icon: Users },
  ];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">
        Operations
      </p>
      {navItems.map((item) => {
        // Active detection logic that supports sub-routes
        // Ensure /admin doesn't match everything by exact match, while others use startsWith if appropriate
        let isActive = false;
        
        if (item.href === "/admin") {
          isActive = pathname === "/admin";
        } else {
           isActive = pathname.startsWith(item.href);
        }

        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-indigo-200" : "text-slate-500"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
