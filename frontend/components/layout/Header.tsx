"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { AdminUser } from "@/types";

interface HeaderProps {
  onToggleSidebar: () => void;
  currentUser: AdminUser | null;
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentUser,
  onLogout,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}) => {
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between border-b border-borderSubtle bg-white px-4 sm:px-7 select-none shadow-subtle">
      {/* Left section: Hamburger (Mobile) + EZY 2 LEARN Brand Logo */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden rounded-xl p-2 text-textSecondary hover:bg-slate-100 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5 text-navy-900" />
        </button>

        <Link href="/dashboard" className="flex items-center shrink-0 group">
          <img
            src="/logo.png"
            alt="EZY 2 LEARN Driving School"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
          />
        </Link>
      </div>

      {/* Middle section: Rounded Search matching Reference Image */}
      <div className="hidden md:flex flex-1 justify-center max-w-md mx-6">
        <div
          onClick={onOpenSearch}
          className="relative w-full cursor-pointer group"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-navy-900 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Search students, instructors, bookings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none cursor-pointer transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Right section: Notification Toggle + Admin Profile Circle */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Toggle with Red Dot Badge matching Reference Image */}
        <button
          onClick={onOpenNotifications}
          className="relative h-10 w-10 rounded-full border border-borderSubtle flex items-center justify-center text-navy-900 hover:bg-slate-50 transition-colors shadow-subtle"
          title="Notification Center"
        >
          <Bell className="h-5 w-5 text-navy-900" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* Admin Profile Circle at the far right end matching Reference Image */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-navy-900/20 transition-all focus:outline-none"
            title="Admin Profile Menu"
          >
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="h-10 w-10 rounded-full object-cover border border-borderSubtle shadow-subtle"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#07345B] text-white font-heading font-black text-sm flex items-center justify-center shadow-subtle">
                {currentUser?.name?.[0] || "D"}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-elevated border border-borderSubtle z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-borderSubtle mb-1">
                  <p className="font-heading text-xs font-bold text-navy-900">
                    {currentUser?.name || "David Miller"}
                  </p>
                  <p className="text-[11px] text-textSecondary truncate">
                    {currentUser?.email || "admin@ezy2learn.com.au"}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-brandYellow-50 text-brandYellow-800 border border-brandYellow-200">
                    {currentUser?.role_display_name || "Super Admin"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    router.push("/settings");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  <span>Admin Settings</span>
                </button>
                <div className="my-1 border-t border-borderSubtle" />
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
