// Tell the computer this code runs in the browser
"use client";

// Import tools to handle links and check which page we are on
import Link from "next/link";
import { usePathname } from "next/navigation";
// Import icons for the menu
import { 
  LayoutDashboard, 
  CheckCircle2, 
  UserCircle 
} from "lucide-react";

// This function builds the navigation menu for IT Staff
export default function ITStaffNav() {
  // Get the name of the current page
  const pathname = usePathname();

  // List of pages IT Staff can visit
  const navItems = [
    { name: "My Tickets", href: "/it-staff", icon: LayoutDashboard },
    { name: "Resolved",   href: "/it-staff/tickets?status=resolved", icon: CheckCircle2 },
  ];

  return (
    <nav className="px-3 space-y-1">
      {/* Loop through the links and show them */}
      {navItems.map((item) => {
        // Check if the link matches the current page
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name} // Unique name for the link
            href={item.href} // Where the link goes
            // Change colors if the link is active
            className={`
              w-full flex items-center gap-3
              h-11 px-3 rounded-xl text-left
              text-base font-medium transition-all
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' // Blue if active
                : 'text-slate-400 hover:bg-slate-800 hover:text-white' // Grey if not
              }
            `}
          >
            {/* Show the icon next to the name */}
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
