"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Ticket } from "lucide-react";

export default function EmployeeNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/employee", icon: LayoutDashboard },
    { name: "Submit Ticket", href: "/employee/submit", icon: Plus },
    { name: "My Tickets", href: "/employee/tickets", icon: Ticket },
  ];

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
