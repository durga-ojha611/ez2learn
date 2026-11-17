"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Drawer } from "@/components/common/Drawer";
import { Modal } from "@/components/common/Modal";
import { formatDate, formatTime } from "@/lib/utils";
import { DEFAULT_BOOKINGS, BookingRowItem } from "@/lib/mockBookings";
import {
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Mail,
  User,
  MoreVertical,
  Download,
  Filter,
  Hourglass,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Edit,
  MessageSquare,
  Eye,
  Send,
  Smartphone,
  Bell,
} from "lucide-react";

function BookingsListContent() {
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingRowItem[]>(DEFAULT_BOOKINGS);
  const [total] = useState(482);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Overview Statistics matching Reference Mockup
  const [stats] = useState({
    total_bookings: 482,
    upcoming: 128,
    pending: 36,
    completed: 312,
  });

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSearch =
        b.booking_code.toLowerCase().includes(q) ||
        b.student_name.toLowerCase().includes(q) ||
        b.instructor_name.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  const handleNavigateToDetails = (id: number) => {
    router.push(`/bookings/${id}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-12 max-w-[1600px] mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Bookings
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage all driving lesson bookings
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert("Exporting bookings summary...")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Statistics Cards matching Reference Mockup */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Bookings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Bookings</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.total_bookings}
              </h3>
            </div>
          </div>

          {/* Card 2: Upcoming */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Upcoming</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.upcoming}
              </h3>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Hourglass className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Pending</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.pending}
              </h3>
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <MessageCircle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Completed</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.completed}
              </h3>
            </div>
          </div>
        </div>

        {/* Search & Filters Row matching Reference Mockup */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs flex flex-wrap items-center gap-3">
          {/* Search by student or booking ID */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1528] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* All Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1528] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* All Date Range Dropdown */}
          <div className="relative">
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1528] cursor-pointer"
            >
              <option value="all">All Date Range</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="next_30">Next 30 Days</option>
            </select>
          </div>

          {/* Yellow Filter Button */}
          <button
            onClick={() => {}}
            className="px-5 py-2.5 bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Filter className="w-4 h-4 fill-slate-950" />
            <span>Filter</span>
          </button>
        </div>

        {/* Full-Width Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold text-xs">
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Lesson Type</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => handleNavigateToDetails(b.id)}
                    className="hover:bg-amber-50/30 transition-all cursor-pointer group"
                  >
                    {/* Booking ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {b.booking_code}
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            b.student_avatar ||
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                          }
                          alt={b.student_name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <span className="group-hover:underline">{b.student_name}</span>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {b.instructor_name}
                    </td>

                    {/* Lesson Type */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          b.lesson_type === "Manual"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}
                      >
                        {b.lesson_type}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {b.formatted_datetime}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.status === "upcoming" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Upcoming
                        </span>
                      )}
                      {b.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      )}
                      {b.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Completed
                        </span>
                      )}
                      {b.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions: View Details Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleNavigateToDetails(b.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
                        >
                          View Details
                        </button>

                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === b.id ? null : b.id)
                            }
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === b.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 text-xs">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleNavigateToDetails(b.id);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                View Booking Details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-slate-100 gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Showing 1-5 of {total} bookings
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 text-xs disabled:opacity-50"
              >
                &lt;
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0B1528] text-white text-xs font-bold shadow-xs">
                1
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                2
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                3
              </button>
              <span className="text-xs text-slate-400 px-1">...</span>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                97
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading bookings...</div>}>
      <BookingsListContent />
    </Suspense>
  );
}
