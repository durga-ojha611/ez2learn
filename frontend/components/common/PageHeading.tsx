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
      className={`w-full rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-4.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${className}`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
        >
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            {badge && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {(actions || children) && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
          {children}
        </div>
      )}
    </div>
  );
};

