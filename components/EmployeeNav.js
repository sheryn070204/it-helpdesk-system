"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Ticket, UserCircle } from "lucide-react";

export default function EmployeeNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/employee", icon: LayoutDashboard },
    { name: "Submit a Request", href: "/employee/submit", icon: Plus },
    { name: "My Requests", href: "/employee/tickets", icon: Ticket },
  ];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {/* Menu Label - Simplified */}
      <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">
        Menu
      </p>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl text-base font-bold transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-indigo-200" : "text-slate-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
