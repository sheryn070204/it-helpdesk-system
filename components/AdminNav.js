// Tell the computer this code runs in the browser
"use client";

// Import tools to handle links and check which page we are on
import Link from "next/link";
import { usePathname } from "next/navigation";
// Import icons for the menu
import { LayoutDashboard, Ticket, Users, UserCircle } from "lucide-react";

// This function builds the navigation menu for the Admin
export default function AdminNav() {
  // Get the name of the current page
  const pathname = usePathname();

  // This is a list of all the pages the Admin can go to
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "All Tickets", href: "/admin/tickets", icon: Ticket },
    { name: "IT Staff", href: "/admin/settings", icon: Users },
    { name: "Employees", href: "/admin/employees", icon: Users },
  ];

  return (
    <nav className="flex-1 px-3 space-y-1">
      {/* Title for the menu section */}
      <div className="px-3 mb-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">MENU</p>
      </div>
      {/* Loop through each menu item and show it on the screen */}
      {navItems.map((item) => {
        // Check if this menu item is the current page we are looking at
        const isActive = pathname === item.href;
        const Icon = item.icon; // Get the icon for this item
        
        return (
          <Link
            key={item.name} // Give each link a unique name
            href={item.href} // Set where the link goes
            // Style the link differently if it is the "Active" page
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold transition-all duration-200 group ${
              isActive
                ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]" // Blue background if active
                : "text-slate-400 hover:text-white hover:bg-white/5" // Grey background if not
            }`}
          >
            {/* Show the icon next to the name */}
            <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
