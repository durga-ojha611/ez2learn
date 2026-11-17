"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface BookingStatusDonutProps {
  statusData?: { booking_status: string; count: number }[];
}

export const BookingStatusDonut: React.FC<BookingStatusDonutProps> = ({
  statusData = [],
}) => {
  const statusColorMap: Record<string, string> = {
    confirmed: "#16A36A",
    assigned: "#0284C7",
    completed: "#07345B",
    pending: "#FAB10B",
    new_request: "#F59E0B",
    rescheduled: "#8B5CF6",
    cancelled: "#DC5656",
  };

  const chartData = statusData.map((item) => ({
    name: item.booking_status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    value: Number(item.count),
    color: statusColorMap[item.booking_status] || "#94A3B8",
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="card-clean p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading text-card-heading text-navy-900">Booking Distribution</h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-900 border border-borderSubtle">
            Active Term
          </span>
        </div>
        <p className="text-[13px] text-textSecondary mb-4">
          Status allocation of driving lessons
        </p>

        {/* Donut with center total */}
        <div className="relative h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-navy-900 text-white p-2.5 rounded-xl shadow-card text-xs space-y-1 border border-borderSubtle">
                        <p className="font-bold">{data.name}</p>
                        <p>
                          {data.value} bookings (
                          {total > 0 ? Math.round((data.value / total) * 100) : 0}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-heading text-stat-number text-navy-900 leading-none">{total}</span>
            <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend Breakdown List */}
        <div className="space-y-2 mt-4 pt-3 border-t border-borderSubtle">
          {chartData.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-navy-900">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-textSecondary">{item.value} lessons</span>
                  <span className="font-semibold text-navy-900 w-8 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Category Highlight Banner matching Reference Image 1 */}
      <div className="mt-5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs flex items-center gap-2 text-amber-900">
        <span className="font-black text-brandYellow-600 text-sm">👑</span>
        <div>
          <span className="font-bold">Top Status: </span>
          <span>Most lessons currently in Confirmed & Assigned state</span>
        </div>
      </div>
    </div>
  );
};

