"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell, Inbox } from "lucide-react";
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

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user && isMounted) {
        setUserId(user.id);
        fetchNotifications(user.id);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

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

  async function handleNotificationClick(notif) {
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
    
    let route = "/employee/tickets"; 
    if (role === "admin") {
      route = `/admin/tickets/${notif.ticket_id}`;
    } else if (role === "it_staff") {
      route = `/it-staff/tickets/${notif.ticket_id}`;
    }
    router.push(route);
  }

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
  const isDark = theme === "dark";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
          {unreadCount > 0 && (
            <div className={`absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 ${
              isDark ? (role === 'admin' ? 'border-[#1A1F2E]' : 'border-[#1E2430]') : 'border-white'
            }`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className={`w-96 p-0 overflow-hidden rounded-2xl shadow-2xl border ${
          isDark 
            ? 'bg-[#1E2538] border-[#2D3548]' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#2D3548]' : 'border-slate-100'
        }`}>
          <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Notifications
          </span>
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
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-5 py-4 border-b last:border-0 transition-colors flex gap-4 items-start ${
                    isDark 
                      ? (notif.is_read ? 'hover:bg-[#252B3B]' : 'bg-indigo-900/30 hover:bg-indigo-900/50')
                      : (notif.is_read ? 'hover:bg-slate-50' : 'bg-blue-50 hover:bg-blue-100/70')
                  } ${isDark ? 'border-[#2D3548]' : 'border-slate-50'}`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    notif.is_read 
                      ? (isDark ? 'bg-slate-600' : 'bg-slate-300') 
                      : (isDark ? 'bg-indigo-400' : 'bg-blue-500')
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] leading-snug mb-1 ${
                      isDark 
                        ? (notif.is_read ? 'text-slate-400' : 'text-slate-100')
                        : (notif.is_read ? 'text-slate-600' : 'text-slate-800 font-medium')
                    }`}>
                      {notif.message}
                    </p>
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

