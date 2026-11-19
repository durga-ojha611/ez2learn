"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeadingProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: string;
  iconBg?: string;
  iconColor?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  iconBg = "bg-teal-50",
  iconColor = "text-teal-700",
  actions,
  children,
  className = "",
}) => {
  return (
    <div
      className={`w-full rounded-2xl bg-white border border-slate-200/90 shadow-xs p-5 sm:px-7 sm:py-5.5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 select-none transition-all duration-200 ${className}`}
    >
      {/* Left Block: Icon + Titles & Badge */}
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        <div
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-2xs border border-teal-100/70`}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="font-heading font-semibold text-2xl sm:text-[26px] text-slate-900 tracking-tight leading-snug">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-heading font-bold bg-[#EDF5FD] text-[#07345B] border border-[#D5E6F7] shadow-2xs">
                {badge}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="font-sans text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Block: Action Buttons & Controls */}
      {(actions || children) && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap self-end sm:self-center">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
};
