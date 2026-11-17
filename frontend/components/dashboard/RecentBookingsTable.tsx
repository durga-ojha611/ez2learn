"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatAUD, formatDate, formatTime } from "@/lib/utils";
import { MapPin, ChevronRight, Eye, MoreVertical } from "lucide-react";

interface RecentBookingsTableProps {
  bookings: any[];
}

export const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({
  bookings = [],
}) => {
  const router = useRouter();

  return (
    <div className="card-clean overflow-hidden">
      {/* Table Header Controls matching Reference Image 2 & 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-borderSubtle bg-white">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold text-sm border border-borderSubtle">
            📋
          </div>
          <div>
            <h3 className="font-heading text-card-heading text-navy-900">Recent Driving Bookings</h3>
            <p className="text-[13px] text-textSecondary mt-0.5">
              Latest lesson requests and assigned sessions across Greater Sydney
            </p>
          </div>
        </div>

        <Link
          href="/bookings"
          className="btn-white inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold shadow-subtle"
        >
          <span>View All Bookings</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-borderSubtle text-[13px] font-semibold text-textSecondary uppercase tracking-wider">
              <th className="py-3 px-5">Booking ID</th>
              <th className="py-3 px-5">Student</th>
              <th className="py-3 px-5">Location</th>
              <th className="py-3 px-5">Instructor</th>
              <th className="py-3 px-5">Lesson / Type</th>
              <th className="py-3 px-5">Amount</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderSubtle text-[14px]">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-textSecondary">
                  No recent bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-navy-50/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/bookings/${b.id}`)}
                >
                  {/* Booking ID */}
                  <td className="py-3.5 px-5 font-bold text-navy-900 group-hover:text-brandYellow-600 transition-colors whitespace-nowrap">
                    {b.booking_code}
                  </td>

                  {/* Student */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {b.student_avatar ? (
                        <img
                          src={b.student_avatar}
                          alt={b.student_name}
                          className="h-7 w-7 rounded-full object-cover border border-borderSubtle"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-navy-50 text-navy-900 font-bold text-[10px] flex items-center justify-center border border-borderSubtle">
                          {b.student_name?.[0] || "S"}
                        </div>
                      )}
                      <span className="font-medium text-navy-900">{b.student_name}</span>
                    </div>
                  </td>

                  {/* Suburb location with pin icon */}
                  <td className="py-3.5 px-5 text-textSecondary whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-textSecondary shrink-0" />
                      <span>{b.pickup_suburb}</span>
                    </div>
                  </td>

                  {/* Instructor */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    {b.instructor_name ? (
                      <span className="font-medium text-navy-900">{b.instructor_name}</span>
                    ) : (
                      <span className="text-textSecondary italic">Unassigned</span>
                    )}
                  </td>

                  {/* Lesson Service & Transmission */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-navy-900">{b.service_name}</span>
                      <span className="text-[12px] text-textSecondary capitalize">
                        {b.transmission} • {b.duration_minutes}m • {formatDate(b.lesson_date)}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-5 font-bold text-navy-900 whitespace-nowrap">
                    {formatAUD(b.amount_aud)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <StatusBadge status={b.booking_status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/bookings/${b.id}`}
                      className="p-1.5 rounded-lg text-textSecondary hover:text-navy-900 hover:bg-navy-50 inline-flex items-center border border-transparent hover:border-borderSubtle"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

