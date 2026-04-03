"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function NotificationBell({ role = "employee", theme = "light" }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Fetch current user & notifications on mount
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchNotifications(user.id);
      }
    };
    init();
  }, []);

  // 2. Polling every 30 seconds
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchNotifications(userId);
    }, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  async function fetchNotifications(uid) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (!error && data) {
      setNotifications(data);
    }
  }

  // 3. Mark all as read
  async function markAllAsRead(e) {
    if (e) e.stopPropagation();
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
      
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  }

  // 4. Handle Notification Click
  async function handleNotificationClick(notif) {
    // Mark specifically as read
    if (!notif.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
        
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
    
    setIsOpen(false);
    
    // Navigation logic based on role
    let route = "/employee/tickets"; 
    if (role === "admin") {
      route = `/admin/tickets/${notif.ticket_id}`;
    } else if (role === "it_staff" || role === "it-staff") {
      route = `/it-staff/tickets/${notif.ticket_id}`;
    }
    router.push(route);
  }

  // 5. Time Ago formatter
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Render Theme Maps
  const isDark = theme === "dark";

  // Bell Button Styles
  const bellButtonClasses = isDark
    ? "text-slate-300 hover:text-white"
    : "text-slate-600 hover:text-slate-900";

  // Dropdown Menu container
  const dropdownContentClasses = isDark
    ? "bg-[#1E293B] border border-slate-700 shadow-xl rounded-xl w-80 p-0"
    : "bg-white border border-slate-200 shadow-lg rounded-xl w-80 p-0";

  // Header Title
  const headerTitleClasses = isDark
    ? "text-white font-semibold text-sm"
    : "text-slate-900 font-semibold text-sm";

  // Mark all read button
  const markReadButtonClasses = isDark
    ? "text-indigo-400 text-xs hover:text-indigo-300"
    : "text-blue-600 text-xs hover:underline";

  // Separator
  const separatorClasses = isDark ? "bg-slate-700 m-0" : "bg-slate-100 m-0";

  // Notification Item
  const getItemClasses = (isRead) => {
    if (isDark) {
      return isRead 
        ? "bg-transparent hover:bg-slate-800" 
        : "bg-indigo-950/40 hover:bg-indigo-950/60";
    } else {
      return isRead 
        ? "bg-white hover:bg-slate-50" 
        : "bg-blue-50 hover:bg-blue-100";
    }
  };

  // Dot
  const getDotClasses = (isRead) => {
    if (isDark) {
      return isRead ? "bg-slate-600" : "bg-indigo-400";
    } else {
      return isRead ? "bg-transparent" : "bg-blue-500";
    }
  };

  // Text inside notification
  const getMessageClasses = (isRead) => {
    if (isDark) {
      return isRead ? "text-slate-400 text-sm" : "text-slate-100 text-sm font-medium";
    } else {
      return isRead ? "text-slate-600 text-sm" : "text-slate-800 text-sm font-medium";
    }
  };
  
  const timeClasses = isDark ? "text-slate-500" : "text-slate-400";

  // Empty state text
  const emptyIconClasses = isDark ? "text-slate-600" : "text-slate-300";
  const emptyTextClasses = "text-slate-500 text-sm";
  const viewAllClasses = isDark ? "text-indigo-400" : "text-blue-600";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative rounded-full transition-colors ${bellButtonClasses}`}
        >
          <Bell className="w-5 h-5" />
          {/* Unread Badge overlay */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-transparent">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={dropdownContentClasses}>
        {/* Header */}
        <div className="px-4 py-3 flex flex-row items-center justify-between">
          <div className={headerTitleClasses}>
            Notifications
          </div>
          {unreadCount > 0 && (
            <button 
              className={markReadButtonClasses}
              onClick={markAllAsRead}
            >
              Mark all read
            </button>
          )}
        </div>
        
        <DropdownMenuSeparator className={separatorClasses} />

        {/* List */}
        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 flex flex-col items-center justify-center text-center">
              <Bell className={`w-8 h-8 mb-3 ${emptyIconClasses}`} />
              <p className={emptyTextClasses}>No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-transparent transition-colors flex gap-3 items-start cursor-pointer focus:outline-none ${getItemClasses(notif.is_read)}`}
                >
                  {/* Dot indicator */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getDotClasses(notif.is_read)}`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`leading-snug ${getMessageClasses(notif.is_read)}`}>
                      {notif.message}
                    </p>
                    <p className={`text-xs mt-0.5 ${timeClasses}`}>
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator className={separatorClasses} />
        
        {/* Footer */}
        <div className="p-1">
          <DropdownMenuItem className="w-full justify-center rounded-lg cursor-pointer py-2 focus:outline-none focus:bg-transparent">
            <span className={`text-xs text-center w-full ${viewAllClasses}`}>
              View all notifications
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
