"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, CheckCircle2, User } from "lucide-react";

export default function ITStaffNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "My Queue", href: "/it-staff", icon: Ticket },
    { name: "Resolved", href: "/it-staff/tickets", icon: CheckCircle2 },
    { name: "Profile", href: "/it-staff/profile", icon: User },
  ];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">
        Workspace
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
                : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
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
