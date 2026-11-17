"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import { formatAUD } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Car,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/reports/analytics");
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open("http://127.0.0.1:8000/api/reports/export", "_blank");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none">
        {/* Page Title & Action Buttons matching Reference Image */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              Reports & Analytics
            </h1>
            <p className="font-sans font-medium text-sm text-slate-500 mt-1">
              Track business revenue, instructor earnings and student pass rates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-heading font-bold text-sm shadow-2xs transition-all"
            >
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Stat KPI Cards matching Reference Image */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Lifetime revenue</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {formatAUD(data?.summary?.total_lifetime_revenue || 58450.0)}
            </div>
            <span className="font-sans text-xs font-bold text-emerald-600 mt-1 block">+18.5% YoY</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Completed lessons</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {data?.summary?.total_completed_lessons || 680}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">First-time pass</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {data?.summary?.first_time_pass_rate || 98.4}%
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Cancellation rate</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {data?.summary?.cancellation_rate || 3.8}%
            </div>
          </div>
        </div>

        {/* Filter Pills matching Reference Image */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {["All time", "This month", "This quarter", "Financial year"].map((tab, idx) => {
            const isSelected = idx === 0;
            return (
              <button
                key={tab}
                className={`px-5 py-1.5 rounded-full font-heading font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#0B1528] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="card-premium p-6">
          <h3 className="text-base font-bold text-navy-900 mb-1">Monthly Driving School Revenue (AUD)</h3>
          <p className="text-xs text-textSecondary mb-6">Gross completed lesson billings over last 6 months</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-navy-950 text-white p-3 rounded-xl text-xs space-y-1">
                          <p className="font-bold">{label} Revenue</p>
                          <p className="text-brandYellow-400 font-bold">{formatAUD(payload[0]?.value as number)}</p>
                          <p className="text-slate-300">Bookings: {payload[0]?.payload.bookings}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#07345B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2 Tables: Instructor KPI Performance + Suburb Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructor Performance KPI Table */}
          <div className="card-premium overflow-hidden">
            <div className="p-4 border-b border-borderSubtle bg-slate-50/70">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Instructor Performance & Revenue KPI
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="table-header">
                    <th className="py-2.5 px-4">Instructor</th>
                    <th className="py-2.5 px-4">Rating</th>
                    <th className="py-2.5 px-4">Bookings</th>
                    <th className="py-2.5 px-4">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderSubtle">
                  {(data?.instructors_kpi || []).map((inst: any) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-navy-900">{inst.name}</td>
                      <td className="py-3 px-4 text-amber-500 font-bold">★ {inst.rating}</td>
                      <td className="py-3 px-4">{inst.total_bookings} lessons</td>
                      <td className="py-3 px-4 font-black text-navy-900">
                        {formatAUD(inst.total_revenue_generated)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Location-wise Volume */}
          <div className="card-premium overflow-hidden">
            <div className="p-4 border-b border-borderSubtle bg-slate-50/70">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Suburb & Regional Booking Distribution
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="table-header">
                    <th className="py-2.5 px-4">Suburb</th>
                    <th className="py-2.5 px-4">Region</th>
                    <th className="py-2.5 px-4">Bookings</th>
                    <th className="py-2.5 px-4">Volume (AUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderSubtle">
                  {(data?.location_report || []).slice(0, 7).map((loc: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-navy-900">{loc.suburb}</td>
                      <td className="py-3 px-4 text-textSecondary">{loc.region}</td>
                      <td className="py-3 px-4">{loc.total_bookings}</td>
                      <td className="py-3 px-4 font-black text-navy-900">{formatAUD(loc.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

