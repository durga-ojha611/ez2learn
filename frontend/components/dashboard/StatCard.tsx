"use client";

import React from "react";
import { Sparkline } from "@/components/common/Sparkline";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive?: boolean;
  comparisonText?: string;
  icon: LucideIcon;
  sparklineData?: number[];
  sparklineColor?: string;
  isSelected?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  comparisonText = "vs last month",
  icon: Icon,
  sparklineData = [10, 14, 18, 16, 22, 26, 30],
  sparklineColor = "#07345B",
  isSelected = false,
}) => {
  return (
    <div
      className={`card-clean p-5 flex flex-col justify-between transition-all group ${
        isSelected
          ? "border-navy-900 ring-1 ring-navy-900/10 shadow-card"
          : "hover:border-borderHover hover:shadow-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brandYellow-500 shrink-0" />
            <span className="text-[13px] font-semibold text-textSecondary uppercase tracking-wider">
              {title}
            </span>
          </div>
          <h3 className="font-heading text-stat-number text-navy-900 tracking-tight leading-none">
            {value}
          </h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center shrink-0 border border-borderSubtle group-hover:bg-navy-900 group-hover:text-white transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-5 pt-3 border-t border-borderSubtle">
        <div className="flex items-center gap-1.5 text-[13px]">
          <span
            className={`font-semibold px-1.5 py-0.5 rounded text-xs ${
              isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-rose-50 text-rose-700 border border-rose-200/60"
            }`}
          >
            {change}
          </span>
          <span className="text-textSecondary font-normal">{comparisonText}</span>
        </div>
        <div>
          <Sparkline
            data={sparklineData}
            color={sparklineColor || "#07345B"}
            width={76}
            height={26}
          />
        </div>
      </div>
    </div>
  );
};


