"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  className,
}) => {
  const normalized = (status || "").toLowerCase().replace(/[\s-]/g, "_");

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-500";
  let label = status;

  switch (normalized) {
    // Bookings & Instructors Active / Confirmed
    case "confirmed":
    case "active":
    case "paid":
    case "completed":
    case "approved":
    case "published":
    case "verified":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
      break;

    // Assigned / In Transit
    case "assigned":
    case "learner":
    case "both":
      colorClasses = "bg-sky-50 text-sky-700 border-sky-200";
      dotColor = "bg-sky-500";
      break;

    // Pending / New Request / Warning
    case "pending":
    case "new_request":
    case "pending_approval":
    case "rescheduled":
    case "provisional_p1":
    case "draft":
      colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
      dotColor = "bg-amber-500";
      break;

    // Cancelled / Failed / Suspended / Danger
    case "cancelled":
    case "failed":
    case "refunded":
    case "suspended":
    case "rejected":
    case "inactive":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
      dotColor = "bg-rose-500";
      break;

    // Manual / Automatic Transmission Pills
    case "automatic":
      colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200";
      dotColor = "bg-indigo-500";
      break;
    case "manual":
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
      dotColor = "bg-purple-500";
      break;
  }

  // Format label for display
  label = status
    ? status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        colorClasses,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      {label}
    </span>
  );
};

