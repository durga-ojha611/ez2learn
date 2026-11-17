"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { BookingStatusDonut } from "@/components/dashboard/BookingStatusDonut";
import { RecentBookingsTable } from "@/components/dashboard/RecentBookingsTable";
import { apiFetch } from "@/lib/api";
import { formatAUD, formatDate } from "@/lib/utils";
import {
  CalendarDays,
  DollarSign,
  Car,
  GraduationCap,
  Download,
  Plus,
  Star,
  Clock,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/dashboard/overview");
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.open("http://127.0.0.1:8000/api/reports/export", "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none">
        {/* Page Title & Action Buttons matching Reference Image */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              Dashboard
            </h1>
            <p className="font-sans font-medium text-sm text-slate-500 mt-1">
              Overview of driving lessons, instructors and daily operations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-heading font-bold text-sm shadow-2xs transition-all"
            >
              <span>Export</span>
            </button>

            <button
              onClick={() => router.push("/bookings?create=true")}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all"
            >
              <span>+ Quick booking</span>
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards matching Reference Image */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Total instructors</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              24
            </div>
            <span className="font-sans text-xs font-bold text-emerald-600 mt-1 block">Live count</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Active this week</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              18
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Avg. rating</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              4.9
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Lessons this month</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              342
            </div>
          </div>
        </div>

        {/* Charts Row: Revenue & Orders Trend (2/3) + Donut Distribution (1/3) matching Reference Image 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueTrendChart
              weeklyData={data?.revenue_trend?.weekly}
              monthlyData={data?.revenue_trend?.monthly}
            />
          </div>
          <div className="lg:col-span-1">
            <BookingStatusDonut statusData={data?.status_distribution} />
          </div>
        </div>

        {/* Mid-Row: Top Certified Instructors + Business Insights Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Instructors Ranking */}
          <div className="card-clean p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-card-heading text-navy-900">Top Certified Instructors</h3>
                <button
                  onClick={() => router.push("/instructors")}
                  className="text-xs font-semibold text-navy-900 hover:underline"
                >
                  View All
                </button>
              </div>
              <p className="text-[13px] text-textSecondary mb-4">
                Highest rated instructors across Greater Sydney
              </p>

              <div className="space-y-3">
                {(data?.top_instructors || []).map((inst: any, idx: number) => (
                  <div
                    key={inst.id}
                    onClick={() => router.push(`/instructors/${inst.id}`)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-navy-50/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-navy-50 text-navy-900 font-bold text-xs flex items-center justify-center shrink-0 border border-borderSubtle">
                        {idx + 1}
                      </span>
                      <img
                        src={inst.avatar_url}
                        alt={inst.name}
                        className="h-9 w-9 rounded-full object-cover border border-borderSubtle"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-navy-900">{inst.name}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-textSecondary">
                          <span className="capitalize">{inst.transmission}</span>
                          <span>•</span>
                          <span className="text-navy-900 font-semibold flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-brandYellow-500 text-brandYellow-500" /> {inst.rating} ({inst.total_reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-navy-900">
                      {inst.total_assigned_lessons} lessons
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-borderSubtle flex items-center justify-between text-xs text-textSecondary">
              <span>RMS Compliance: 100% verified</span>
              <span className="text-emerald-700 font-semibold">Active</span>
            </div>
          </div>

          {/* Upcoming Lessons */}
          <div className="card-clean p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-card-heading text-navy-900">Upcoming Lessons</h3>
                <button
                  onClick={() => router.push("/calendar")}
                  className="text-xs font-semibold text-navy-900 hover:underline"
                >
                  Calendar
                </button>
              </div>
              <p className="text-[13px] text-textSecondary mb-4">
                Scheduled sessions for today & upcoming days
              </p>

              <div className="space-y-2.5">
                {(data?.upcoming_lessons || []).slice(0, 4).map((lesson: any) => (
                  <div
                    key={lesson.id}
                    onClick={() => router.push(`/bookings/${lesson.id}`)}
                    className="p-3 rounded-xl border border-borderSubtle bg-white hover:bg-navy-50/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-navy-900 truncate">
                        {lesson.student_name}
                      </span>
                      <span className="text-[11px] font-semibold text-navy-900 bg-navy-50 px-2 py-0.5 rounded-full border border-borderSubtle shrink-0">
                        {formatDate(lesson.lesson_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-textSecondary">
                      <span className="truncate">{lesson.service_name}</span>
                      <span className="font-semibold text-navy-900 shrink-0">
                        {lesson.start_time?.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-textSecondary mt-1">
                      <MapPin className="h-3 w-3 text-textSecondary" />
                      <span>{lesson.pickup_suburb}</span>
                      <span>•</span>
                      <span>Instructor: {lesson.instructor_name || "Pending"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push("/instructor-matching")}
              className="btn-white mt-4 w-full py-2 px-3 text-xs shadow-subtle text-center"
            >
              Match Unassigned Bookings
            </button>
          </div>

          {/* Business Insights */}
          <div className="card-clean p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-brandYellow-500" />
                <h3 className="font-heading text-card-heading text-navy-900">Driving School Insights</h3>
              </div>
              <p className="text-[13px] text-textSecondary mb-4">
                Operational metrics for Greater Sydney
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white border border-borderSubtle">
                  <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider">
                    Most Popular Service
                  </span>
                  <p className="text-xs font-bold text-navy-900 mt-0.5">
                    {data?.insights?.top_service || "Automatic Driving Lesson (60 mins)"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-borderSubtle">
                  <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider">
                    Peak Booking Window
                  </span>
                  <p className="text-xs font-bold text-navy-900 mt-0.5">
                    {data?.insights?.peak_hours || "9:00 AM - 11:30 AM & 3:30 PM - 5:30 PM"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-borderSubtle">
                  <span className="text-[11px] text-textSecondary font-semibold uppercase tracking-wider">
                    NSW 3-for-1 Bonus Hours Status
                  </span>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    Active (10 instructor hrs = 30 logbook hrs)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-navy-900 text-white text-xs flex items-center justify-between shadow-subtle">
              <div>
                <p className="font-bold text-brandYellow-400">First-Time Test Pass Rate</p>
                <p className="text-[11px] text-slate-300">Greater Sydney testing centres</p>
              </div>
              <span className="font-heading text-lg font-bold text-white">98.4%</span>
            </div>
          </div>
        </div>

        {/* Recent Driving Bookings Table matching Reference Image 2 */}
        <RecentBookingsTable bookings={data?.recent_bookings || []} />
      </div>
    </AdminLayout>
  );
}

