// Tell the computer this code runs in the browser
"use client";

// Import tools from React and Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For moving to different pages
import { supabase } from "@/lib/supabase"; // Connection to our database
import { Bell, Inbox } from "lucide-react"; // Icons for the bell and empty inbox
import { Button } from "@/components/ui/button"; // A nice button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // Tools to show a popup menu

// This function builds the alert bell you see at the top of the page
export default function NotificationBell({ role = "employee", theme = "light" }) {
  const router = useRouter(); // Tool to change pages
  const [notifications, setNotifications] = useState([]); // List of alerts to show
  const [userId, setUserId] = useState(null); // ID of the logged-in user
  const [isOpen, setIsOpen] = useState(false); // If the menu is open or not

  // This part runs when the page first loads
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      // Get the currently logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user && isMounted) {
        setUserId(user.id); // Remember their ID
        fetchNotifications(user.id); // Get their alerts from the database
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // This part checks for new alerts every 30 seconds
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchNotifications(userId);
    }, 30000);
    return () => clearInterval(interval); // Stop checking if the user leaves the page
  }, [userId]);

  // This function gets the latest 10 alerts from the database
  async function fetchNotifications(uid) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid) // Only get alerts for THIS user
      .order("created_at", { ascending: false }) // Show newest first
      .limit(10);
      
    if (!error && data) {
      setNotifications(data); // Put the alerts on the screen
    }
  }

  // This function marks all alerts as "read" so the red number goes away
  async function markAllAsRead(e) {
    if (e) e.stopPropagation(); // Stop the menu from closing immediately
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
      
    // Update the screen to show they are all read
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  }

  // This function runs when you click on a single alert
  async function handleNotificationClick(notif) {
    if (!notif.is_read) {
      // Mark this specific alert as read in the database
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
        
      // Update the screen
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
    
    setIsOpen(false); // Close the menu
    
    // Decide which page to go to based on the user's role
    let route = "/employee/tickets"; 
    if (role === "admin") {
      route = `/admin/tickets/${notif.ticket_id}`;
    } else if (role === "it-staff") {
      route = `/it-staff/tickets/${notif.ticket_id}`;
    }
    router.push(route); // Go to the ticket page
  }

  // This function calculates how long ago the alert happened
  function timeAgo(dateString) {
    const msMinute = 60 * 1000;
    const msHour = msMinute * 60;
    const msDay = msHour * 24;
    const now = new Date();
    const past = new Date(dateString);
    const diff = now - past;
    
    if (diff < msMinute) return "Just now";
    if (diff < msHour) return Math.floor(diff / msMinute) + " mins ago";
    if (diff < msDay) return Math.floor(diff / msHour) + " hours ago";
    return Math.floor(diff / msDay) + " days ago";
  }

  // Count how many alerts have not been read yet
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const isDark = theme === "dark"; // Check if we are using dark mode

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* The Bell Icon button */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-12 w-12 rounded-xl transition-all duration-200 ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
          }`}
        >
          <Bell className={`h-7 w-7 transition-colors ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`} />
          {/* Show the red number if there are unread alerts */}
          {unreadCount > 0 && (
            <div className={`absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 ${
              isDark ? (role === 'admin' ? 'border-[#1A1F2E]' : 'border-[#1E2430]') : 'border-white'
            }`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* The Popup Menu content */}
      <DropdownMenuContent 
        align="end" 
        className={`w-96 p-0 overflow-hidden rounded-2xl shadow-2xl border ${
          isDark 
            ? 'bg-[#1E2538] border-[#2D3548]' 
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Header of the alert menu */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#2D3548]' : 'border-slate-100'
        }`}>
          <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Notifications
          </span>
          {/* Button to mark everything as read */}
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className={`text-xs font-medium transition-colors ${
                isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-blue-600 hover:underline'
              }`}
            >
              Mark all read
            </button>
          )}
        </div>
        
        {/* The list of alerts */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            // Show this if there are NO alerts
            <div className="py-12 text-center">
              <Bell className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No notifications yet
              </p>
            </div>
          ) : (
            // Show each alert in a list
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  // Change the background color if it is not read yet
                  className={`w-full text-left px-5 py-4 border-b last:border-0 transition-colors flex gap-4 items-start ${
                    isDark 
                      ? (notif.is_read ? 'hover:bg-[#252B3B]' : 'bg-indigo-900/30 hover:bg-indigo-900/50')
                      : (notif.is_read ? 'hover:bg-slate-50' : 'bg-blue-50 hover:bg-blue-100/70')
                  } ${isDark ? 'border-[#2D3548]' : 'border-slate-50'}`}
                >
                  {/* Small dot next to the alert */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    notif.is_read 
                      ? (isDark ? 'bg-slate-600' : 'bg-slate-300') 
                      : (isDark ? 'bg-indigo-400' : 'bg-blue-500')
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    {/* The alert message */}
                    <p className={`text-[15px] leading-snug mb-1 ${
                      isDark 
                        ? (notif.is_read ? 'text-slate-400' : 'text-slate-100')
                        : (notif.is_read ? 'text-slate-600' : 'text-slate-800 font-medium')
                    }`}>
                      {notif.message}
                    </p>
                    {/* How long ago it happened */}
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

