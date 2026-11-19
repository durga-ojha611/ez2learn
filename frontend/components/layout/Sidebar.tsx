"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  UserCheck,
  GraduationCap,
  CalendarClock,
  Layers,
  CreditCard,
  MapPin,
  Star,
  Globe,
  Newspaper,
  Inbox,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUser } from "@/types";

interface SidebarProps {
  currentUser: AdminUser | null;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState<string>(pathname);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const navGroups = [
    {
      group: "OVERVIEW",
      items: [
        { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "MANAGEMENT",
      items: [
        { key: "bookings", label: "Bookings", href: "/bookings", icon: CalendarCheck2 },
        { key: "inquiries", label: "Inquiries", href: "/inquiries", icon: Inbox },
        { key: "instructors", label: "Instructors", href: "/instructors", icon: UserCheck },
        { key: "students", label: "Students", href: "/students", icon: GraduationCap },
        { key: "calendar", label: "Schedule & Calendar", href: "/calendar", icon: CalendarClock },
      ],
    },
    {
      group: "BUSINESS",
      items: [
        { key: "services", label: "Services & Packages", href: "/services", icon: Layers },
        { key: "payments", label: "Payments", href: "/payments", icon: CreditCard },
        { key: "locations", label: "Locations & Suburbs", href: "/locations", icon: MapPin },
        { key: "reviews", label: "Reviews & Ratings", href: "/reviews", icon: Star },
      ],
    },
    {
      group: "WEBSITE MANAGEMENT",
      items: [
        { key: "blogs", label: "Blog Posts", href: "/blogs", icon: Newspaper },
        { key: "website_content", label: "CMS Studio", href: "/cms", icon: Globe },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { key: "notifications", label: "Notifications", href: "/notifications", icon: Bell },
        { key: "settings", label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  // RBAC Filter: Sub-Admins only see sidebar sections permitted by Main Admin
  const isSuperAdmin =
    currentUser?.role_name === "super_admin" ||
    currentUser?.email === "admin@ezy2learn.com.au";

  const userSections = currentUser?.accessible_sections || [];

  const filteredNavGroups = navGroups
    .map((grp) => {
      const visibleItems = grp.items.filter((item) => {
        if (isSuperAdmin || userSections.includes("*")) return true;
        // If sub-admin has custom sections, only show those explicitly ticked
        return userSections.includes(item.key);
      });
      return { ...grp, items: visibleItems };
    })
    .filter((grp) => grp.items.length > 0);

  const checkIsActive = (href: string) => {
    if (href === "/dashboard") return activePath === "/dashboard" || activePath === "/";
    return activePath.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#07345B] text-white select-none overflow-y-auto no-scrollbar rounded-tr-[28px] rounded-br-[28px]">
      {/* NAVIGATION GROUPS & ITEMS */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto no-scrollbar pt-4">
        {filteredNavGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            {/* Group Header - Clean label without count or chevron */}
            <div className="px-3 pt-2 pb-1 text-[11px] font-heading font-black tracking-wider text-blue-200/80 uppercase select-none">
              {grp.group}
            </div>

            {/* Group Items */}
            <div className="space-y-1">
              {grp.items.map((item) => {
                const isActive = checkIsActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setActivePath(item.href);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={cn(
                      "flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-[14px] transition-colors duration-150 group relative select-none",
                      isActive
                        ? "bg-white/10 text-white font-heading font-bold shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.05] font-heading font-medium"
                    )}
                  >
                    {/* Circular Icon Container */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150 relative",
                        isActive
                          ? "bg-white/15 text-white border border-white/40"
                          : "bg-transparent text-slate-300 border border-white/20 group-hover:border-white/40 group-hover:bg-white/[0.06] group-hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5",
                          isActive
                            ? "text-white stroke-[2.2]"
                            : "text-slate-300 group-hover:text-white stroke-[1.8]"
                        )}
                      />
                    </div>

                    <span className="truncate tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM USER PROFILE & LOGOUT SECTION */}
      <div className="p-3.5 border-t border-white/10 mt-auto bg-[#052642]/90 backdrop-blur-xs shrink-0">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={
                currentUser?.avatar_url ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              }
              alt="David Miller"
              className="h-9 w-9 rounded-full object-cover border border-white/20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-heading font-bold text-white truncate">
                {currentUser?.name || "David Miller"}
              </p>
              <p className="text-[10px] text-blue-200/70 truncate">
                {currentUser?.role_display_name || "Super Administrator"}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-blue-200/80 hover:text-rose-300 hover:bg-white/10 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Blue background, w-72, rounded-r-[28px]) */}
      <aside className="hidden lg:block fixed top-[72px] bottom-0 left-0 z-20 w-72 border-r border-t border-[#052846]/50 bg-[#07345B] shadow-md rounded-tr-[28px] rounded-br-[28px] overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Off-canvas Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-elevated z-10 animate-in slide-in-from-left duration-200 bg-[#07345B] rounded-r-[28px] overflow-hidden">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
