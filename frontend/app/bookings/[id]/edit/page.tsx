"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  CalendarCheck2,
  Calendar,
  Clock,
  Car,
  User,
  MapPin,
  Check,
  X,
  ChevronDown,
  Eye,
} from "lucide-react";

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [instructorsList, setInstructorsList] = useState<any[]>([]);

  const [form, setForm] = useState({
    booking_code: "",
    student_name: "",
    student_email: "",
    student_phone: "",
    instructor_id: "",
    instructor_name: "",
    lesson_date: "",
    start_time: "09:00",
    duration_minutes: 60,
    pickup_location: "",
    dropoff_location: "",
    status: "upcoming" as "upcoming" | "confirmed" | "pending" | "completed" | "cancelled",
    student_notes: "",
    admin_notes: "",
  });

  useEffect(() => {
    loadBooking();
    loadInstructors();
  }, [bookingId]);

  const loadInstructors = async () => {
    try {
      const res = await apiFetch("/api/instructors?limit=100");
      if (res.success && Array.isArray(res.data)) {
        setInstructorsList(res.data);
      }
    } catch (err) {
      console.warn("Could not load instructors", err);
    }
  };

  const loadBooking = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/bookings/${bookingId}`);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          booking_code: d.booking_code || `BK-${d.id}`,
          student_name: d.student_name || "",
          student_email: d.student_email || "",
          student_phone: d.student_phone || "",
          instructor_id: String(d.instructor_id || ""),
          instructor_name: d.instructor_name || "",
          lesson_date: d.lesson_date || "",
          start_time: d.start_time || "09:00",
          duration_minutes: Number(d.duration_minutes) || 60,
          pickup_location: d.pickup_address || "",
          dropoff_location: d.dropoff_address || d.pickup_address || "",
          status: d.booking_status || "upcoming",
          student_notes: d.special_notes || "",
          admin_notes: d.admin_notes || "",
        });
      } else {
        setErrorMsg("Booking not found");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await apiFetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        body: JSON.stringify({
          instructor_id: form.instructor_id ? Number(form.instructor_id) : undefined,
          lesson_date: form.lesson_date,
          start_time: form.start_time,
          duration_minutes: form.duration_minutes,
          pickup_address: form.pickup_location,
          dropoff_address: form.dropoff_location,
          booking_status: form.status === "upcoming" ? "confirmed" : form.status,
          special_notes: form.student_notes,
          admin_notes: form.admin_notes,
        }),
      });
      router.push(`/bookings/${bookingId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update booking");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-slate-500 font-bold">
          Loading booking details...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-7xl pb-20 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Booking Details</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Edit Booking #{form.booking_code} • Dedicated Page
          </span>
        </div>

        {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = LIVE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: CTA FORM DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
              <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <CalendarCheck2 className="w-5 h-5 text-[#FAB10B]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-black text-white tracking-tight">
                      Edit Booking #{form.booking_code}
                    </h1>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Update scheduled date, time, pickup addresses, or assigned instructor
                    </p>
                  </div>
                </div>
                <Link
                  href={`/bookings/${bookingId}`}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Link>
              </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                {errorMsg}
              </div>
            )}

            {/* Student Info Card (Read only student info) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student</span>
                <span className="font-heading font-black text-sm text-slate-900">{form.student_name}</span>
                <span className="text-xs text-slate-500 block">{form.student_email} • {form.student_phone}</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {form.status}
              </span>
            </div>

            {/* Schedule Details */}
            <div className="space-y-4">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                1. Schedule & Instructor
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Lesson Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.lesson_date}
                    onChange={(e) => setForm({ ...form, lesson_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value, 10) || 60 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Assigned Instructor
                </label>
                <div className="relative">
                  <select
                    value={form.instructor_id}
                    onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="">Keep current instructor ({form.instructor_name})</option>
                    {instructorsList.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.transmission}) — {inst.vehicle_make} {inst.vehicle_model}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                2. Pickup & Drop-off Locations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Pickup Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.pickup_location}
                    onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Drop-off Address
                  </label>
                  <input
                    type="text"
                    value={form.dropoff_location}
                    onChange={(e) => setForm({ ...form, dropoff_location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                3. Status & Notes
              </h3>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Booking Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Special Notes
                </label>
                <textarea
                  rows={3}
                  value={form.student_notes}
                  onChange={(e) => setForm({ ...form, student_notes: e.target.value })}
                  placeholder="Special instructions from student or admin..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                href={`/bookings/${bookingId}`}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-75"
              >
                <Check className="w-4 h-4 text-[#FAB10B]" />
                <span>{submitting ? "Updating..." : "Update Booking"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: LIVE BOOKING SUMMARY PREVIEW */}
      <div className="lg:col-span-4 sticky top-6 space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
            <span>Live Booking Summary</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Live Preview
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Booking Reference
              </span>
              <h3 className="font-heading font-black text-slate-900 text-base">
                #{form.booking_code}
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize border border-slate-200">
              {form.status}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Student Information:
            </span>
            <p className="font-heading font-bold text-slate-900 text-sm">
              {form.student_name}
            </p>
            <p className="text-[11px] text-slate-500">
              {form.student_email} • {form.student_phone}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Scheduled Date:</span>
              </span>
              <strong className="text-slate-900">{form.lesson_date || "Not set"}</strong>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time:</span>
              </span>
              <strong className="text-slate-900">
                {form.start_time} ({form.duration_minutes}m)
              </strong>
            </div>

            <div className="flex items-start justify-between text-slate-600 pt-1">
              <span className="flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Pickup:</span>
              </span>
              <span className="text-right text-slate-800 font-medium line-clamp-2 max-w-[180px]">
                {form.pickup_location || "No pickup set"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</AdminLayout>
  );
}
