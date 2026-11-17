"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { Drawer } from "@/components/common/Drawer";
import { getStoredUser, clearAuthSession, isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AdminUser, NotificationItem } from "@/types";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const user = getStoredUser();
    setCurrentUser(user);

    // Fetch notifications
    loadNotifications();
  }, [router]);

  const loadNotifications = async () => {
    try {
      const res = await apiFetch("/api/notifications");
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col antialiased selection:bg-[#FAB10B]/30">
      {/* Top Header - Single Box with Logo, Search, Notification Toggle, Admin Profile */}
      <Header
        onToggleSidebar={() => setMobileOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        unreadNotificationsCount={unreadCount}
      />

      {/* Body Area with Sidebar and Edge-to-Edge Content Canvas */}
      <div className="flex-1 flex relative bg-[#F8F9FA]">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          currentUser={currentUser}
          onLogout={handleLogout}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Area - Soft Background, White Cards, Minimal & Elegant */}
        <div
          className={`flex-1 flex flex-col w-full min-w-0 bg-[#F8F9FA] transition-all duration-300 ${
            collapsed ? "lg:pl-20" : "lg:pl-72"
          }`}
        >
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 bg-[#F8F9FA]">
            {children}
          </main>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Notifications Drawer */}
      <Drawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        title="Notifications"
        subtitle={`You have ${unreadCount} unread alert${unreadCount === 1 ? "" : "s"}`}
        width="md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Recent Alerts
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-navy-900 hover:text-navy-700 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  item.is_read
                    ? "bg-slate-50/50 border-borderSubtle opacity-70"
                    : "bg-white border-brandYellow-500/40 shadow-xs ring-1 ring-brandYellow-500/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-navy-900">{item.title}</h4>
                  <span className="text-[10px] text-textSecondary shrink-0">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                  {item.message}
                </p>
                {item.link_url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifDrawerOpen(false);
                      router.push(item.link_url!);
                    }}
                    className="mt-2 text-[11px] font-semibold text-navy-900 hover:underline inline-flex items-center gap-1"
                  >
                    View Record →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

