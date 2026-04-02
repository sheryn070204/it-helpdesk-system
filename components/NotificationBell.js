"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NotificationBell({ role = "employee" }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const dropdownRef = useRef(null);

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

    // Close dropdown if clicked outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    e.stopPropagation();
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
  async function handleNotificationClick(event, notif) {
    event.preventDefault();
    
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
    } else if (role === "it_staff") {
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

  // 6. Dynamic bell styling based on the portal
  const bellStyles = {
    employee: "text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100",
    admin: "text-gray-300 hover:text-white bg-slate-800 hover:bg-slate-700",
    it_staff: "text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
  };

  const currentBellStyle = bellStyles[role] || bellStyles.employee;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${currentBellStyle}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={(e) => handleNotificationClick(e, notif)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !notif.is_read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <p className={`text-sm ${!notif.is_read ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(notif.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
