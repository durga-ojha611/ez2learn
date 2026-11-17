"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatAUD } from "@/lib/utils";

interface RevenueTrendChartProps {
  weeklyData?: any[];
  monthlyData?: any[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  weeklyData = [],
  monthlyData = [],
}) => {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const activeData = period === "week" ? weeklyData : monthlyData;
  const xKey = period === "week" ? "period" : "month";

  return (
    <div className="card-clean p-6 flex flex-col justify-between">
      {/* Header with Period Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-card-heading text-navy-900">Revenue & Bookings Trend</h3>
          <p className="text-[13px] text-textSecondary mt-0.5">
            Driving lesson earnings and completed session volume
          </p>
        </div>

        {/* Period Selector Buttons adhering strictly to prompt */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              period === "week"
                ? "bg-navy-900 text-white shadow-xs"
                : "bg-white text-navy-900 border border-borderSubtle hover:bg-navy-50"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              period === "month"
                ? "bg-navy-900 text-white shadow-xs"
                : "bg-white text-navy-900 border border-borderSubtle hover:bg-navy-50"
            }`}
          >
            Last 6 Months
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#07345B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#07345B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FAB10B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FAB10B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-navy-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-navy-800">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="font-semibold text-brandYellow-400">
                        Revenue: {formatAUD(payload[0]?.value as number)}
                      </p>
                      <p className="font-semibold text-slate-200">
                        Bookings: {payload[1]?.value} lessons
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#07345B"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
            <Area
              type="monotone"
              dataKey="bookings"
              stroke="#FAB10B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#bookingsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-borderSubtle">
        <div>
          <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Today's Revenue</span>
          <p className="font-heading text-sm font-bold text-navy-900 mt-0.5">$920.00 AUD</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Today's Lessons</span>
          <p className="font-heading text-sm font-bold text-navy-900 mt-0.5">11 Sessions</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Peak Hours</span>
          <p className="font-heading text-sm font-bold text-navy-900 mt-0.5">9:00 - 11:00 AM</p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider">Pass Rate</span>
          <p className="font-heading text-sm font-bold text-emerald-600 mt-0.5">98.4% First-Try</p>
        </div>
      </div>
    </div>
  );
};

