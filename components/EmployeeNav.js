// Tell the computer this code runs in the browser
"use client";

// Import tools from React and Next.js
import { useState } from "react";
import Link from "next/link"; // For clickable links
import { usePathname } from "next/navigation"; // To see which page we are on
// Import icons for the menu
import { LayoutDashboard, Plus, Ticket, UserCircle } from "lucide-react";

// This function builds the navigation menu for Employees
export default function EmployeeNav() {
  // Get the name of the current page
  const pathname = usePathname();

  // List of pages an employee can visit
  const navItems = [
    { name: "Home", href: "/employee", icon: LayoutDashboard },
    { name: "Submit a Request", href: "/employee/submit", icon: Plus },
    { name: "My Requests", href: "/employee/tickets", icon: Ticket },
  ];

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {/* Label for the menu */}
      <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">
        Menu
      </p>
      {/* Loop through the links and show them */}
      {navItems.map((item) => {
        // Check if the link matches the current page
        const isActive = pathname === item.href;
        const Icon = item.icon; // Get the icon for the link
        
        return (
          <Link
            key={item.name} // Give the link a name
            href={item.href} // Tell the link where to go
            // Change colors if the link is active
            className={`flex items-center gap-4 px-3 py-3 rounded-xl text-base font-bold transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" // Blue if active
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100" // Grey if not
            }`}
          >
            {/* Show the icon next to the text */}
            <Icon className={`w-5 h-5 ${isActive ? "text-indigo-200" : "text-slate-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
