"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Drawer } from "@/components/common/Drawer";
import { Modal } from "@/components/common/Modal";
import { apiFetch } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";
import { DEFAULT_BOOKINGS, BookingRowItem } from "@/lib/mockBookings";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  CreditCard,
  RotateCcw,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  ShieldCheck,
  User,
  AlertTriangle,
  MessageSquare,
  Send,
  Smartphone,
  Bell,
  MapPin,
  Mail,
  Phone,
  Edit,
  UserCheck,
  Download,
  Receipt,
  Sparkles,
  Package,
  Layers,
  Settings,
  Sliders,
  Zap,
  RotateCw,
  X,
  Check,
} from "lucide-react";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;

  const [booking, setBooking] = useState<BookingRowItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [rescheduleDrawerOpen, setRescheduleDrawerOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    lesson_date: "",
    start_time: "",
    duration_minutes: 60,
    pickup_location: "",
    dropoff_location: "",
    lesson_type: "Automatic" as "Manual" | "Automatic",
    status: "upcoming",
    student_notes: "",
    admin_notes: "",
  });

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Cancel Form State
  const [cancellationReason, setCancellationReason] = useState("");

  // Refund Form State
  const [refundAmount, setRefundAmount] = useState<number>(85);
  const [refundReason, setRefundReason] = useState("Customer requested cancellation");
  const [processingRefund, setProcessingRefund] = useState(false);

  useEffect(() => {
    loadBookingFromApi();
  }, [rawId]);

  const loadBookingFromApi = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/bookings/${rawId}`);
      if (res.success && res.data) {
        const d = res.data;
        const mappedBooking: BookingRowItem = {
          id: d.id,
          booking_code: d.booking_code || `BK-${d.id + 1000}`,
          student_name: d.student_name || "Aman Verma",
          student_id_str: d.student_code || `STU-${String(d.student_id || 1047).padStart(4, "0")}`,
          student_email: d.student_email || "aman.v@gmail.com",
          student_phone: d.student_phone || "+91 93456 78901",
          student_avatar:
            d.student_avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
          student_licence_type: d.licence_stage?.replace("_", " ") || "Learner",
          student_licence_status: d.licence_status || "Valid",
          instructor_name: d.instructor_name || "Rohan Mehta",
          instructor_code: d.instructor_code || "INS-2588",
          instructor_phone: d.instructor_phone || "+91 87654 32109",
          instructor_avatar:
            d.instructor_avatar ||
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
          assigned_vehicle: `${d.vehicle_make || "Toyota"} ${d.vehicle_model || "Corolla"}`,
          transmission:
            d.transmission === "manual" ? "Manual" : "Automatic",
          lesson_type:
            d.transmission === "manual" ? "Manual" : "Automatic",
          lesson_package: d.package_name || "Driving Lessons",
          lesson_category: d.service_name || "Standard Driving",
          number_of_lessons: d.number_of_lessons || 1,
          pickup_location:
            d.pickup_address || "123 Main St, Sydney NSW",
          dropoff_location:
            d.dropoff_address || "456 George St, Sydney NSW",
          booking_date: d.created_at ? formatDate(d.created_at) : "01 Nov 2026",
          lesson_date: d.lesson_date || "2026-11-27",
          formatted_datetime: `${formatDate(d.lesson_date || "2026-11-27")}, ${formatTime(d.start_time || "11:30:00")}`,
          start_time: d.start_time || "11:30:00",
          duration_minutes: d.duration_minutes || 60,
          amount_aud: Number(d.amount_aud) || 85,
          discount_aud: Number(d.discount_aud) || 0,
          final_amount_aud: Number(d.final_amount_aud || d.amount_aud) || 85,
          payment_method: d.payment_method || "Credit Card",
          payment_status:
            d.payment_status === "paid"
              ? "paid"
              : d.payment_status === "refunded"
              ? "refunded"
              : "unpaid",
          transaction_id: d.transaction_id || "TXN-35",
          invoice_number: `INV-${d.booking_code || "BK-1027"}-2026`,
          student_notes: d.student_notes || d.special_notes || "None provided.",
          special_requirements: d.special_requirements || "Dual control pedals required",
          admin_notes: d.admin_notes || "Standard lesson confirmed with student.",
          rescheduling_history: d.rescheduling_history || "None recorded.",
          status:
            d.booking_status === "completed"
              ? "completed"
              : d.booking_status === "cancelled"
              ? "cancelled"
              : d.booking_status === "pending"
              ? "pending"
              : "upcoming",
        };
        setBooking(mappedBooking);
        setRefundAmount(mappedBooking.final_amount_aud);
        setEditForm({
          lesson_date: mappedBooking.lesson_date,
          start_time: mappedBooking.start_time,
          duration_minutes: mappedBooking.duration_minutes,
          pickup_location: mappedBooking.pickup_location,
          dropoff_location: mappedBooking.dropoff_location,
          lesson_type: mappedBooking.lesson_type,
          status: mappedBooking.status,
          student_notes: mappedBooking.student_notes,
          admin_notes: mappedBooking.admin_notes,
        });
      }
    } catch (err) {
      console.warn("Could not load from API, falling back to mock or default record", err);
      // Fallback: match by ID from mock data or create default
      const fallback = DEFAULT_BOOKINGS.find((b) => String(b.id) === rawId) || {
        ...DEFAULT_BOOKINGS[0],
        booking_code: "BK-1027",
        student_name: "Aman Verma",
        student_id_str: "STU-1047",
        student_email: "aman.v@gmail.com",
        student_phone: "+91 93456 78901",
        student_licence_type: "Learner",
        student_licence_status: "Valid",
        instructor_name: "Rohan Mehta",
        instructor_code: "INS-2588",
        instructor_phone: "+91 87654 32109",
        assigned_vehicle: "Toyota Corolla",
        transmission: "Automatic",
        lesson_type: "Automatic",
        lesson_package: "Driving Lessons",
        lesson_category: "Standard Driving",
        pickup_location: "123 Main St, Sydney NSW",
        dropoff_location: "456 George St, Sydney NSW",
        booking_date: "01 Nov 2026",
        lesson_date: "2026-11-27",
        start_time: "11:30:00",
        amount_aud: 85,
        discount_aud: 0,
        final_amount_aud: 85,
        payment_method: "Credit Card",
        payment_status: "paid",
        transaction_id: "TXN-35",
        status: "upcoming",
      };
      setBooking(fallback as any);
      setRefundAmount((fallback as any).final_amount_aud || 85);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleOpenEdit = () => {
    if (!booking) return;
    setEditDrawerOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    try {
      await apiFetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        body: JSON.stringify({
          lesson_date: editForm.lesson_date,
          start_time: editForm.start_time,
          duration_minutes: editForm.duration_minutes,
          pickup_address: editForm.pickup_location,
          dropoff_address: editForm.dropoff_location,
          booking_status: editForm.status === "upcoming" ? "confirmed" : editForm.status,
          special_notes: editForm.student_notes,
          admin_notes: editForm.admin_notes,
        }),
      });
      loadBookingFromApi();
      setEditDrawerOpen(false);
      alert(`Booking #${booking.booking_code} details updated successfully!`);
    } catch (err: any) {
      alert(err.message || "Failed to update booking");
    }
  };

  const handleOpenReschedule = () => {
    if (!booking) return;
    setRescheduleDate(booking.lesson_date);
    setRescheduleTime(booking.start_time);
    setRescheduleReason("");
    setRescheduleDrawerOpen(true);
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    try {
      await apiFetch(`/api/bookings/${booking.id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({
          new_date: rescheduleDate,
          new_start_time: rescheduleTime,
          reason: rescheduleReason || "Admin reschedule",
        }),
      });
      loadBookingFromApi();
      setRescheduleDrawerOpen(false);
      alert(`Booking #${booking.booking_code} rescheduled to ${formatDate(rescheduleDate)} at ${formatTime(rescheduleTime)}!`);
    } catch (err: any) {
      alert(err.message || "Failed to reschedule booking");
    }
  };

  const handleMarkCompleted = async () => {
    if (!booking) return;
    if (!confirm(`Mark booking #${booking.booking_code} as COMPLETED? This will verify NSW logbook hours.`)) return;
    try {
      await apiFetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed", comment: "Marked completed by admin" }),
      });
      loadBookingFromApi();
      alert(`Booking #${booking.booking_code} marked as COMPLETED!`);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking) return;
    try {
      await apiFetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "cancelled",
          comment: cancellationReason || "Admin cancellation",
        }),
      });
      loadBookingFromApi();
      setCancelModalOpen(false);
      alert(`Booking #${booking.booking_code} marked as CANCELLED.`);
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking");
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setProcessingRefund(true);
    try {
      await apiFetch(`/api/bookings/${booking.id}/refund`, {
        method: "POST",
        body: JSON.stringify({
          refund_amount: refundAmount,
          reason: refundReason,
        }),
      });
      loadBookingFromApi();
      setRefundModalOpen(false);
      alert(`Refund of $${Number(refundAmount).toFixed(2)} processed successfully for #${booking.booking_code}!`);
    } catch (err: any) {
      alert(err.message || "Failed to process refund");
    } finally {
      setProcessingRefund(false);
    }
  };

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-slate-500 font-medium">
          Loading booking details...
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-rose-600 font-bold">
          Booking record not found.
        </div>
      </AdminLayout>
    );
  }

  const isConfirmed = booking.status === "upcoming" || booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  return (
    <AdminLayout>
      <div className="w-full max-w-4xl mx-auto space-y-4 select-none pb-20 pt-2">
        {/* ================= 1. TOP HEADER ROW ================= */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/bookings"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Back to Bookings"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </Link>
            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-none">
                Booking Details
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Complete information about this booking
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs sm:text-sm border shadow-2xs flex items-center gap-2 ${
              isConfirmed
                ? "bg-[#E8F8EE] text-[#0E8A38] border-[#B6EAC4]"
                : isCompleted
                ? "bg-[#EBF5FF] text-[#1E40AF] border-[#BFDBFE]"
                : isCancelled
                ? "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
                : "bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConfirmed
                  ? "bg-[#0E8A38]"
                  : isCompleted
                  ? "bg-[#1E40AF]"
                  : isCancelled
                  ? "bg-[#991B1B]"
                  : "bg-[#854D0E]"
              }`}
            ></span>
            <span className="capitalize">
              {isConfirmed ? "Confirmed" : booking.status}
            </span>
          </div>
        </div>

        {/* ================= 2. BOOKING ID & BOOKED ON BANNER ================= */}
        <div className="w-full bg-[#EDF5FD] border border-[#D5E6F7] rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          {/* Booking ID */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#BFDBFE] text-[#07345B] flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block leading-tight">
                Booking ID
              </span>
              <span className="font-heading font-black text-xl text-[#07345B] tracking-tight leading-snug">
                {booking.booking_code}
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-9 w-px bg-[#C8DEF5]"></div>

          {/* Booked On */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#BFDBFE] text-[#07345B] flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block leading-tight">
                Booked On
              </span>
              <span className="font-heading font-black text-base sm:text-lg text-[#07345B] leading-snug">
                {booking.booking_date} • 10:00 AM
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. TWO COLUMNS: STUDENT & INSTRUCTOR INFORMATION ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* STUDENT INFORMATION CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header Ribbon */}
              <div className="bg-[#07345B] text-white px-5 py-2.5 rounded-br-2xl inline-flex items-center gap-2 font-heading font-bold text-xs sm:text-sm select-none">
                <User className="w-4 h-4" />
                <span>Student Information</span>
              </div>

              {/* Profile Details */}
              <div className="p-5 pt-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      booking.student_avatar ||
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
                    }
                    alt={booking.student_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading font-black text-xl text-slate-900 truncate">
                        {booking.student_name}
                      </h2>
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EDF5FD] text-[#07345B] font-mono text-xs font-bold border border-[#D5E6F7]">
                        {booking.student_id_str}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate pt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{booking.student_email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{booking.student_phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Licence Box */}
            <div className="p-4 pt-0">
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 grid grid-cols-2 gap-4 border border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Licence Type</span>
                  </div>
                  <div className="font-heading font-bold text-sm text-slate-900 mt-1 capitalize">
                    {booking.student_licence_type}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Licence Status</span>
                  </div>
                  <div className="font-heading font-bold text-xs sm:text-sm text-emerald-700 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>{booking.student_licence_status || "Valid"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INSTRUCTOR INFORMATION CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              {/* Header Ribbon */}
              <div className="bg-[#07345B] text-white px-5 py-2.5 rounded-br-2xl inline-flex items-center gap-2 font-heading font-bold text-xs sm:text-sm select-none">
                <Car className="w-4 h-4" />
                <span>Instructor Information</span>
              </div>

              {/* Profile Details */}
              <div className="p-5 pt-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      booking.instructor_avatar ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
                    }
                    alt={booking.instructor_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading font-black text-xl text-slate-900 truncate">
                        {booking.instructor_name}
                      </h2>
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#EDF5FD] text-[#07345B] font-mono text-xs font-bold border border-[#D5E6F7]">
                        {booking.instructor_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{booking.instructor_phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Vehicle Box */}
            <div className="p-4 pt-0">
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 grid grid-cols-2 gap-4 border border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vehicle</span>
                  </div>
                  <div className="font-heading font-bold text-sm text-slate-900 mt-1 truncate">
                    {booking.assigned_vehicle}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transmission</span>
                  </div>
                  <div className="font-heading font-bold text-sm text-slate-900 mt-1 capitalize">
                    {booking.transmission}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. LESSON & BOOKING INFORMATION CARD ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-slate-900 font-heading font-black text-base">
            <span className="text-xl">📅</span>
            <span>Lesson & Booking Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pt-1">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Car className="w-4 h-4 text-slate-400" />
                  <span>Lesson Type</span>
                </span>
                <span className="font-heading font-bold text-slate-900 capitalize">
                  {booking.lesson_type}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>Package</span>
                </span>
                <span className="font-heading font-bold text-slate-900">
                  {booking.lesson_package}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Category</span>
                </span>
                <span className="font-heading font-bold text-slate-900">
                  {booking.lesson_category}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Pickup</span>
                </span>
                <span className="font-heading font-bold text-slate-900 text-right max-w-[240px] truncate">
                  {booking.pickup_location}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Drop-off</span>
                </span>
                <span className="font-heading font-bold text-slate-900 text-right max-w-[240px] truncate">
                  {booking.dropoff_location}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3 md:border-l md:border-slate-100 md:pl-10">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Booking Date</span>
                </span>
                <span className="font-heading font-bold text-slate-900">
                  {booking.booking_date}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Lesson Date</span>
                </span>
                <span className="font-heading font-bold text-slate-900">
                  {formatDate(booking.lesson_date)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Lesson Time</span>
                </span>
                <span className="font-heading font-bold text-slate-900">
                  {formatTime(booking.start_time)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Status</span>
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#E8F8EE] text-[#0E8A38] border border-[#B6EAC4] capitalize">
                  {isConfirmed ? "Confirmed" : booking.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 5. PAYMENT INFORMATION CARD ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-slate-900 font-heading font-black text-base">
            <CreditCard className="w-5 h-5 text-[#07345B]" />
            <span>Payment Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-1">
            {/* Left Sub-section: Amounts & Yellow Final Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-heading font-black text-slate-900 text-base">
                  ${booking.amount_aud.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Discount</span>
                <span className="font-heading font-medium text-slate-600">
                  ${booking.discount_aud.toFixed(2)}
                </span>
              </div>

              {/* Final Amount Highlight Yellow Box */}
              <div className="bg-[#FFF2B2] border border-[#FDE047]/60 rounded-xl p-4 flex items-center justify-between shadow-2xs">
                <span className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                  Final Amount
                </span>
                <span className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  ${booking.final_amount_aud.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Right Sub-section: Method, Status, Txn & View Invoice CTA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Payment Method</span>
                <span className="font-heading font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <span>{booking.payment_method}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <span
                  className={`flex items-center gap-1.5 font-bold text-xs sm:text-sm ${
                    booking.payment_status === "paid"
                      ? "text-emerald-700"
                      : booking.payment_status === "refunded"
                      ? "text-rose-600"
                      : "text-amber-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      booking.payment_status === "paid"
                        ? "bg-emerald-600"
                        : booking.payment_status === "refunded"
                        ? "bg-rose-600"
                        : "bg-amber-500"
                    }`}
                  ></span>
                  <span className="capitalize">{booking.payment_status}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Transaction ID</span>
                <span className="font-mono font-bold text-slate-900">
                  {booking.transaction_id}
                </span>
              </div>

              {/* View Invoice CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#07345B] hover:bg-[#052642] text-white font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>View Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 6. ADMIN ACTIONS CARD ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-slate-900 font-heading font-black text-base">
            <Zap className="w-5 h-5 text-[#FAB10B] fill-[#FAB10B]" />
            <span>Admin Actions</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Row 1: 3 Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Edit Booking */}
              <button
                type="button"
                onClick={handleOpenEdit}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-[#07345B] hover:bg-[#052642] text-white font-heading font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Booking</span>
              </button>

              {/* Reschedule */}
              <button
                type="button"
                onClick={handleOpenReschedule}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-white border-2 border-[#1E6091] text-[#1E6091] hover:bg-blue-50/50 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Reschedule</span>
              </button>

              {/* Cancel Booking */}
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                disabled={isCancelled}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-white border-2 border-[#E63946] text-[#E63946] hover:bg-rose-50/50 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Booking</span>
              </button>
            </div>

            {/* Row 2: 2 Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mark Completed */}
              <button
                type="button"
                onClick={handleMarkCompleted}
                disabled={isCompleted || isCancelled}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-white border-2 border-[#2A9D8F] text-[#1B6F64] hover:bg-emerald-50/50 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Mark Completed</span>
              </button>

              {/* Process Refund */}
              <button
                type="button"
                onClick={() => setRefundModalOpen(true)}
                disabled={booking.payment_status === "refunded"}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-white border-2 border-[#264653] text-[#264653] hover:bg-slate-50 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Process Refund</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= MODAL: AUSTRALIAN TAX INVOICE ================= */}
        <Modal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          title={`Australian Tax Invoice · ${booking.invoice_number}`}
        >
          <div className="space-y-6 text-slate-800">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="font-heading font-black text-xl text-[#07345B]">
                  EZY 2 LEARN DRIVING SCHOOL
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  ABN: 45 612 890 123 · RMS NSW Accredited
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Suite 4, 120 Church St, Parramatta NSW 2150
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  TAX INVOICE · PAID
                </span>
                <div className="font-mono text-xs text-slate-600 mt-2">
                  Invoice #: {booking.invoice_number}
                </div>
                <div className="text-xs text-slate-500">
                  Date: {booking.booking_date}
                </div>
              </div>
            </div>

            {/* Billed To / Lesson Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Billed To (Student):
                </span>
                <div className="font-heading font-bold text-sm text-slate-900">
                  {booking.student_name}
                </div>
                <div className="text-slate-600">{booking.student_email}</div>
                <div className="text-slate-600">{booking.student_phone}</div>
                <div className="text-slate-500 mt-1">
                  Pickup: {booking.pickup_location}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Assigned Instructor:
                </span>
                <div className="font-heading font-bold text-sm text-slate-900">
                  {booking.instructor_name} ({booking.instructor_code})
                </div>
                <div className="text-slate-600">
                  Vehicle: {booking.assigned_vehicle} ({booking.transmission})
                </div>
                <div className="text-slate-500 mt-1">
                  Lesson Date: {formatDate(booking.lesson_date)} @ {formatTime(booking.start_time)}
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty / Duration</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Amount (AUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">
                        {booking.lesson_package} - {booking.lesson_category}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {booking.transmission} Dual-Control Vehicle · Transport for NSW Approved
                      </div>
                    </td>
                    <td className="p-3 text-center font-medium">
                      {booking.duration_minutes} mins
                    </td>
                    <td className="p-3 text-right font-medium">
                      ${booking.amount_aud.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ${booking.amount_aud.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end text-xs space-y-1">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Subtotal (excl. GST):</span>
                  <span>${(booking.final_amount_aud / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>GST (10% Australian Tax):</span>
                  <span>
                    ${(booking.final_amount_aud - booking.final_amount_aud / 1.1).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-300 text-sm font-heading font-black text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-[#07345B]">
                    ${booking.final_amount_aud.toFixed(2)} AUD
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  Payment Method: {booking.payment_method} · Txn #{booking.transaction_id}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintInvoice}
                className="px-5 py-2 rounded-xl bg-[#07345B] hover:bg-[#052642] text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* ================= MODAL: PROCESS REFUND ================= */}
        <Modal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          title={`Process Refund for Booking #${booking.booking_code}`}
        >
          <form onSubmit={handleProcessRefund} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              This will update the payment record to <strong>Refunded</strong> and mark the booking status as <strong>Cancelled</strong>.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Refund Amount ($ AUD)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-heading font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Refund
              </label>
              <textarea
                rows={3}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Learner cancelled > 24 hours prior or illness..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingRefund}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-heading font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {processingRefund ? "Processing..." : "Confirm & Issue Refund"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ================= DRAWER: EDIT BOOKING ================= */}
        <Drawer
          isOpen={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
          title={`Edit Booking #${booking.booking_code}`}
          subtitle={`Update schedule, locations, or transmission`}
          size="md"
          icon={<Edit className="w-5 h-5 text-blue-600" />}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lesson Date
                </label>
                <input
                  type="date"
                  required
                  value={editForm.lesson_date}
                  onChange={(e) => setEditForm({ ...editForm, lesson_date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={editForm.start_time}
                  onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  value={editForm.duration_minutes}
                  onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) || 60 })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Transmission
                </label>
                <select
                  value={editForm.lesson_type}
                  onChange={(e) => setEditForm({ ...editForm, lesson_type: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Address
              </label>
              <input
                type="text"
                value={editForm.pickup_location}
                onChange={(e) => setEditForm({ ...editForm, pickup_location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Drop-off Address
              </label>
              <input
                type="text"
                value={editForm.dropoff_location}
                onChange={(e) => setEditForm({ ...editForm, dropoff_location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={editForm.admin_notes}
                onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#07345B] text-white font-bold text-xs hover:bg-[#052642] shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Drawer>

        {/* ================= DRAWER: RESCHEDULE ================= */}
        <Drawer
          isOpen={rescheduleDrawerOpen}
          onClose={() => setRescheduleDrawerOpen(false)}
          title={`Reschedule Booking #${booking.booking_code}`}
          subtitle={`Current schedule: ${booking.formatted_datetime}`}
          size="md"
          icon={<RotateCcw className="w-5 h-5 text-blue-600" />}
        >
          <form onSubmit={handleSaveReschedule} className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900">
              Instructor: <span className="font-bold">{booking.instructor_name}</span> · Student: <span className="font-bold">{booking.student_name}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Lesson Date
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Start Time
                </label>
                <input
                  type="time"
                  required
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Rescheduling
              </label>
              <textarea
                rows={3}
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g. Student requested slot change due to timetable conflict..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#07345B] text-white font-bold text-xs hover:bg-[#052642] shadow-xs cursor-pointer"
              >
                Save Reschedule
              </button>
            </div>
          </form>
        </Drawer>

        {/* ================= MODAL: CANCEL BOOKING ================= */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Booking #${booking.booking_code}`}
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to cancel the booking for{" "}
              <span className="font-bold text-slate-900">{booking.student_name}</span>?
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cancellation Reason
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Student illness or weather conditions..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
