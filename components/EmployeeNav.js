"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Ticket, UserCircle } from "lucide-react";

export default function EmployeeNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Support Hub", href: "/employee", icon: LayoutDashboard },
    { name: "New Ticket", href: "/employee/submit", icon: Plus },
    { name: "My Archive", href: "/employee/tickets", icon: Ticket },
    { name: "My Profile", href: "/employee/profile", icon: UserCircle },
  ];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-2">
        Self Service
      </p>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-indigo-200" : "text-slate-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
