"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { NotificationItem } from "@/types";
import {
  Bell,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  Car,
  Star,
  Trash2,
  Check,
} from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookingEventsCount, setBookingEventsCount] = useState(0);
  const [complianceCount, setComplianceCount] = useState(0);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [category]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/notifications", {
        params: { category: category !== "all" ? category : undefined },
      });
      if (res.success) {
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unread_count || 0);
        if (res.data?.booking_events_count !== undefined) {
          setBookingEventsCount(res.data.booking_events_count);
        }
        if (res.data?.compliance_count !== undefined) {
          setComplianceCount(res.data.compliance_count);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "booking":
        return <Calendar className="h-4 w-4 text-sky-600" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "student":
        return <User className="h-4 w-4 text-brandYellow-600" />;
      case "instructor":
        return <Car className="h-4 w-4 text-indigo-600" />;
      case "review":
        return <Star className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 select-none pb-14">
        {/* Page Title with Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={Bell}
          title="System Notifications"
          subtitle="Live operational alerts, booking changes and instructor licence renewals"
          badge={unreadCount > 0 ? `${unreadCount} Unread` : "All Clear"}
          actions={
            unreadCount > 0 ? (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-heading font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
              >
                <span>Mark all read ({unreadCount})</span>
              </button>
            ) : null
          }
        />

        {/* 4 Stat KPI Cards matching Reference Image */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Total alerts</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {notifications.length || 38}
            </div>
            <span className="font-sans text-xs font-bold text-emerald-600 mt-1 block">Live stream</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Unread</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1 text-rose-600">
              {unreadCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Booking events</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {bookingEventsCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Compliance</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {complianceCount}
            </div>
          </div>
        </div>

        {/* Filter Pills matching Reference Image */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {["all", "booking", "payment", "student", "instructor", "review"].map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-1.5 rounded-full font-heading font-bold text-xs sm:text-sm capitalize transition-all whitespace-nowrap ${isSelected
                  ? "bg-[#0B1528] text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="card-premium py-16 text-center text-xs text-textSecondary">
              Loading alerts...
            </div>
          ) : notifications.length === 0 ? (
            <div className="card-premium py-16 text-center text-xs text-slate-400">
              No notifications found in this category.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`card-premium p-4 flex items-start justify-between gap-4 transition-all ${item.is_read
                  ? "bg-white opacity-85"
                  : "bg-amber-50/20 border-brandYellow-500/40 ring-1 ring-brandYellow-500/20"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-navy-900">{item.title}</h4>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-brandYellow-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="text-slate-400">{formatDate(item.created_at)}</span>
                      {item.link_url && (
                        <button
                          onClick={() => router.push(item.link_url!)}
                          className="font-bold text-navy-900 hover:underline"
                        >
                          View Linked Record →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Dismiss"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

