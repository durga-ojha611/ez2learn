"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  UserCheck,
  GraduationCap,
  Workflow,
  CalendarClock,
  Layers,
  CreditCard,
  MapPin,
  Star,
  Globe,
  BarChart3,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { AdminUser } from "@/types";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: AdminUser | null;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  currentUser,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [activePath, setActivePath] = React.useState<string>(pathname);

  React.useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const checkIsActive = (href: string) => {
    const current = activePath || pathname;
    if (href === "/dashboard") {
      return current === "/dashboard" || current === "/";
    }
    return current === href || current.startsWith(href);
  };

  const navGroups = [
    {
      group: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "MANAGEMENT",
      items: [
        { label: "Bookings", href: "/bookings", icon: CalendarCheck2 },
        { label: "Instructors", href: "/instructors", icon: UserCheck },
        { label: "Students", href: "/students", icon: GraduationCap },
        { label: "Instructor Matching", href: "/instructor-matching", icon: Workflow },
        { label: "Schedule & Calendar", href: "/calendar", icon: CalendarClock },
      ],
    },
    {
      group: "BUSINESS",
      items: [
        { label: "Services & Packages", href: "/services", icon: Layers },
        { label: "Payments", href: "/payments", icon: CreditCard },
        { label: "Locations", href: "/locations", icon: MapPin },
        { label: "Reviews", href: "/reviews", icon: Star },
      ],
    },
    {
      group: "WEBSITE MANAGEMENT",
      items: [
        { label: "Website Content", href: "/website-content", icon: Globe },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { label: "Settings & Users", href: "/settings", icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#07345B] text-white select-none overflow-y-auto no-scrollbar rounded-tr-[28px] rounded-br-[28px]">
      {/* Navigation Items */}
      <div className="p-3.5 space-y-1.5">
        {navGroups.map((grp, grpIdx) => (
          <div key={grp.group} className="space-y-1.5">
            {/* Divider line instead of text words like MANAGEMENT, BUSINESS per user instruction */}
            {grpIdx > 0 && <div className="my-2.5 border-t border-white/10" />}

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
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-[14px] transition-colors duration-150 group relative select-none",
                    collapsed && "justify-center px-0 w-11 h-11 mx-auto",
                    isActive
                      ? "bg-white/10 text-white font-heading font-bold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.05] font-heading font-medium"
                  )}
                >
                  {/* Clean Circular Icon Container: Flat and sharp */}
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
                        isActive ? "text-white stroke-[2.2]" : "text-slate-300 group-hover:text-white stroke-[1.8]"
                      )}
                    />
                  </div>

                  {!collapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Promo Card matching user mockup */}
        {!collapsed && (
          <div className="mx-2 mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#0B1528] to-[#050C18] border border-white/10 relative overflow-hidden shadow-inner">
            <div className="relative z-10">
              <h4 className="font-heading font-black text-sm text-[#FAB10B] leading-tight">Drive Better.</h4>
              <p className="font-heading font-bold text-xs text-white leading-tight">Learn Smarter.</p>
            </div>
            {/* Curving highway line graphic */}
            <div className="absolute right-0 bottom-0 w-28 h-20 pointer-events-none opacity-90">
              <svg viewBox="0 0 100 70" fill="none" className="w-full h-full">
                <path d="M100,70 C70,60 40,35 15,0 L35,0 C55,28 78,48 100,55 Z" fill="#1e293b" />
                <path d="M100,62 C74,54 48,30 25,0" stroke="#FAB10B" strokeWidth="2.5" strokeDasharray="5 4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Bottom User Profile Section: David Miller / Super Administrator */}
      <div className="p-3.5 border-t border-white/10 mt-auto bg-[#052642]/90 backdrop-blur-xs">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="David Miller"
              className="h-9 w-9 rounded-full object-cover border border-white/20 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-heading font-bold text-xs text-white truncate">
                  {currentUser?.name || "David Miller"}
                </p>
                <p className="font-sans text-[11px] text-blue-200 font-medium truncate">
                  {currentUser?.role_display_name || "Super Administrator"}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-full flex items-center justify-center text-blue-200 hover:text-white bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/30 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 stroke-[1.8]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Blue background, w-72, rounded-r-[28px]) */}
      <aside
        className={cn(
          "hidden lg:block fixed top-[72px] bottom-0 left-0 z-20 transition-all duration-300 ease-in-out border-r border-t border-[#052846]/50 bg-[#07345B] shadow-md rounded-tr-[28px] rounded-br-[28px] overflow-hidden",
          collapsed ? "w-20" : "w-72"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Off-canvas Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-elevated z-10 animate-in slide-in-from-left duration-200 bg-[#07345B] rounded-r-[28px] overflow-hidden">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

