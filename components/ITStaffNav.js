"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  UserCircle 
} from "lucide-react";

export default function ITStaffNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "My Tickets", href: "/it-staff", icon: LayoutDashboard },
    { name: "Resolved",   href: "/it-staff/tickets?status=resolved", icon: CheckCircle2 },
  ];

  return (
    <nav className="px-3 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              w-full flex items-center gap-3
              h-11 px-3 rounded-xl text-left
              text-base font-medium transition-all
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }
            `}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
