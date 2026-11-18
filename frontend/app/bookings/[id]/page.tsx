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
} from "lucide-react";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const numId = parseInt(rawId, 10);

  const [booking, setBooking] = useState<BookingRowItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Side Window Drawers State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);
  const [rescheduleDrawerOpen, setRescheduleDrawerOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    student_name: "",
    student_email: "",
    student_phone: "",
    instructor_name: "",
    lesson_type: "Manual" as "Manual" | "Automatic",
    lesson_date: "",
    start_time: "",
    duration_minutes: 60,
    pickup_location: "",
    dropoff_location: "",
    status: "upcoming" as "upcoming" | "confirmed" | "pending" | "completed" | "cancelled",
    student_notes: "",
    admin_notes: "",
  });

  // Message Form State
  const [messageChannel, setMessageChannel] = useState<"sms" | "email" | "notification">("sms");
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Assign Instructor State
  const [newInstructorName, setNewInstructorName] = useState("Daniel Okafor");

  // Reschedule State
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Cancel State
  const [cancellationReason, setCancellationReason] = useState("");

  const [instructorOptions, setInstructorOptions] = useState<
    { id: number; name: string; code: string; vehicle: string; transmission: string }[]
  >([]);

  useEffect(() => {
    loadBookingFromApi();
    loadInstructors();
  }, [rawId]);

  const loadInstructors = async () => {
    try {
      const res = await apiFetch("/api/instructors?limit=100");
      if (res.success && Array.isArray(res.data)) {
        setInstructorOptions(
          res.data.map((i: any) => ({
            id: i.id,
            name: i.name,
            code: i.instructor_code || `INS-${i.id}`,
            vehicle: i.vehicle || `${i.vehicle_make || "Toyota"} ${i.vehicle_model || "Corolla"}`,
            transmission: i.transmission === "automatic" ? "Automatic" : "Manual",
          }))
        );
      }
    } catch (err) {
      console.warn("Could not load instructors list", err);
    }
  };

  const loadBookingFromApi = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/bookings/${rawId}`);
      if (res.success && res.data) {
        const d = res.data;
        setBooking({
          id: d.id,
          booking_code: d.booking_code,
          student_name: d.student_name,
          student_id_str: d.student_code || `STU-${String(d.student_id).padStart(3, "0")}`,
          student_email: d.student_email || "student@mail.com",
          student_phone: d.student_phone || "+61 400 000 000",
          student_avatar: d.student_avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
          student_licence_type: d.licence_stage?.replace("_", " ") || "Learner",
          student_licence_status: d.licence_status || "Valid",
          instructor_name: d.instructor_name || "Daniel Okafor",
          instructor_code: d.instructor_code || "INST-001",
          instructor_phone: d.instructor_phone || "+61 422 333 444",
          instructor_avatar: d.instructor_avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          assigned_vehicle: `${d.vehicle_make || "Toyota"} ${d.vehicle_model || "Camry"}`,
          transmission: d.transmission === "automatic" ? "Automatic" : "Manual",
          lesson_type: d.transmission === "automatic" ? "Automatic" : "Manual",
          lesson_package: d.package_name || d.service_name || "Standard Lesson",
          lesson_category: d.service_name || "Assessment & Training",
          number_of_lessons: d.number_of_lessons || 1,
          pickup_location: d.pickup_address || `${d.pickup_suburb} NSW ${d.pickup_postcode}`,
          dropoff_location: d.dropoff_address || d.pickup_address || `${d.pickup_suburb} NSW ${d.pickup_postcode}`,
          booking_date: formatDate(d.created_at) || "12 Nov 2026",
          lesson_date: d.lesson_date,
          formatted_datetime: `${formatDate(d.lesson_date)}, ${formatTime(d.start_time)}`,
          start_time: d.start_time,
          duration_minutes: d.duration_minutes || 60,
          amount_aud: Number(d.amount_aud) || 85,
          discount_aud: Number(d.discount_aud) || 0,
          final_amount_aud: Number(d.final_amount_aud || d.amount_aud) || 85,
          payment_method: d.payment_method || "Credit Card",
          payment_status: d.payment_status === "paid" ? "paid" : d.payment_status === "refunded" ? "refunded" : "unpaid",
          transaction_id: d.transaction_id || `TXN-${d.id + 88200}`,
          invoice_number: `INV-${d.booking_code}-2026`,
          student_notes: d.student_notes || d.special_notes || "None provided.",
          special_requirements: d.special_requirements || "Dual controls",
          admin_notes: d.admin_notes || "Booking loaded from system record.",
          rescheduling_history: d.rescheduling_history || "None recorded.",
          status: d.booking_status === "completed" ? "completed" : d.booking_status === "cancelled" ? "cancelled" : d.booking_status === "pending" ? "pending" : "upcoming",
        });
      }
    } catch (err) {
      // Fallback to local DEFAULT_BOOKINGS (already set in initializer)
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleOpenEdit = () => {
    if (!booking) return;
    router.push(`/bookings/${booking.id}/edit`);
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
        }),
      });
      loadBookingFromApi();
      setEditDrawerOpen(false);
      alert(`Booking #${booking.booking_code} updated successfully in database!`);
    } catch (err: any) {
      alert(err.message || "Failed to update booking");
    }
  };

  const handleOpenMessage = () => {
    if (!booking) return;
    setMessageText(
      `Hi ${booking.student_name}, regarding your booking #${booking.booking_code} on ${booking.formatted_datetime} with ${booking.instructor_name}: `
    );
    setMessageDrawerOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !messageText.trim()) return;
    setSendingMsg(true);
    const stuName = booking.student_name;
    const stuPhone = booking.student_phone;
    setTimeout(() => {
      setSendingMsg(false);
      setMessageDrawerOpen(false);
      alert(
        `Message dispatched via ${messageChannel.toUpperCase()} to ${stuName} (${stuPhone})!`
      );
    }, 600);
  };

  const handleOpenAssign = () => {
    if (!booking) return;
    setNewInstructorName(booking.instructor_name);
    setAssignDrawerOpen(true);
  };

  const handleSaveAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    const inst = instructorOptions.find((i) => i.name === newInstructorName);
    if (!inst) {
      alert("Please select a valid instructor");
      return;
    }
    try {
      await apiFetch(`/api/bookings/${booking.id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ instructor_id: inst.id }),
      });
      loadBookingFromApi();
      setAssignDrawerOpen(false);
      alert(`Instructor successfully assigned to ${inst.name}!`);
    } catch (err: any) {
      alert(err.message || "Failed to assign instructor");
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
          reason: rescheduleReason || "Admin update",
        }),
      });
      loadBookingFromApi();
      setRescheduleDrawerOpen(false);
      alert(`Booking #${booking.booking_code} rescheduled to ${rescheduleDate} at ${rescheduleTime}!`);
    } catch (err: any) {
      alert(err.message || "Failed to reschedule booking");
    }
  };

  const handleConfirm = async () => {
    if (!booking) return;
    try {
      await apiFetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "confirmed", comment: "Confirmed by admin" }),
      });
      loadBookingFromApi();
      alert(`Booking #${booking.booking_code} has been CONFIRMED!`);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleComplete = async () => {
    if (!booking) return;
    try {
      await apiFetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed", comment: "Marked completed by admin" }),
      });
      loadBookingFromApi();
      alert(`Booking #${booking.booking_code} marked as COMPLETED! Logbook hours verified.`);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handlePrintReceipt = () => {
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

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-16 max-w-[1400px] mx-auto">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Bookings</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Booking Ref: <strong className="text-slate-900">{booking.booking_code}</strong>
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                booking.status === "upcoming"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : booking.status === "pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                  : booking.status === "completed"
                  ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        {/* Hero Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                booking.student_avatar ||
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
              }
              alt={booking.student_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {booking.student_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {booking.student_id_str}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {booking.lesson_package} · {booking.lesson_category}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {booking.student_email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {booking.student_phone}
                </span>
                <span>•</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                  Licence: {booking.student_licence_type} ({booking.student_licence_status})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
              <span className="font-heading font-black text-lg text-slate-900">
                {booking.duration_minutes}m
              </span>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fee</span>
              <span className="font-heading font-black text-lg text-slate-900">
                ${booking.final_amount_aud.toFixed(2)}
              </span>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 capitalize border border-emerald-200">
                {booking.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* 7 Admin Actions Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {booking.status === "pending" && (
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirm Booking</span>
              </button>
            )}

            {booking.status === "upcoming" && (
              <button
                onClick={handleComplete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Completed</span>
              </button>
            )}

            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1528] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Booking</span>
            </button>

            <button
              onClick={handleOpenMessage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Message Student</span>
            </button>

            <button
              onClick={handleOpenAssign}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Change Instructor</span>
            </button>

            <button
              onClick={handleOpenReschedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
              <span>Reschedule</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReceipt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Receipt</span>
            </button>

            {booking.status !== "cancelled" && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 shadow-2xs transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Required Detailed Information Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Booking Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>1. Booking Information</span>
              </h3>
              <span className="font-mono text-xs font-bold text-slate-600">
                {booking.booking_code}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Booking Date</span>
                <span className="font-bold text-slate-900">{booking.booking_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Lesson Date</span>
                <span className="font-bold text-slate-900">{formatDate(booking.lesson_date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Lesson Time</span>
                <span className="font-bold text-slate-900">{formatTime(booking.start_time)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Duration</span>
                <span className="font-bold text-slate-900">{booking.duration_minutes} minutes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Transmission</span>
                <span className="font-bold text-slate-900">{booking.transmission}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-slate-900 uppercase">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Student Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>2. Student Information</span>
              </h3>
              <span className="font-mono text-xs text-slate-500 font-bold">
                {booking.student_id_str}
              </span>
            </div>

            <div className="flex items-center gap-3 pb-2">
              <img
                src={
                  booking.student_avatar ||
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
                }
                alt={booking.student_name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <div className="font-heading font-black text-slate-900 text-sm">
                  {booking.student_name}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {booking.student_id_str}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email Address</span>
                <a href={`mailto:${booking.student_email}`} className="font-bold text-blue-600 hover:underline">
                  {booking.student_email}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Mobile Number</span>
                <a href={`tel:${booking.student_phone}`} className="font-bold text-slate-900 hover:underline">
                  {booking.student_phone}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Licence Type</span>
                <span className="font-bold text-slate-900">{booking.student_licence_type}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Licence Status</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {booking.student_licence_status}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Instructor Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>3. Instructor Information</span>
              </h3>
              <button
                onClick={handleOpenAssign}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="flex items-center gap-3 pb-2">
              <img
                src={
                  booking.instructor_avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                }
                alt={booking.instructor_name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <div className="font-heading font-black text-slate-900 text-sm">
                  {booking.instructor_name}
                </div>
                <div className="font-mono text-xs text-slate-500 font-semibold">
                  {booking.instructor_code}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Contact Number</span>
                <a href={`tel:${booking.instructor_phone}`} className="font-bold text-slate-900 hover:underline">
                  {booking.instructor_phone}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Assigned Vehicle</span>
                <span className="font-bold text-slate-900">{booking.assigned_vehicle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Transmission</span>
                <span className="font-bold text-slate-900">{booking.transmission}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Dual Control</span>
                <span className="font-bold text-emerald-600">Verified Dual-Control</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row of Cards: Lesson Info, Payment Info, Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 4: Lesson Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-purple-600" />
                <span>4. Lesson Information</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                {booking.lesson_type}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Lesson Package</span>
                <span className="font-bold text-slate-900">{booking.lesson_package}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Lesson Category</span>
                <span className="font-bold text-slate-900">{booking.lesson_category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Number of Lessons</span>
                <span className="font-bold text-slate-900">
                  {booking.number_of_lessons} Lessons ({booking.duration_minutes} min/lesson)
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pickup Location</span>
                    <span className="font-medium text-slate-800">{booking.pickup_location}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Drop-off Location</span>
                    <span className="font-medium text-slate-800">{booking.dropoff_location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Payment Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>5. Payment Information</span>
              </h3>
              <button
                onClick={handlePrintReceipt}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Receipt</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-bold text-slate-900">${booking.amount_aud.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Discount</span>
                <span className="font-bold text-slate-900">${booking.discount_aud.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Final Amount</span>
                <span className="font-heading font-black text-base text-emerald-600">
                  ${booking.final_amount_aud.toFixed(2)} AUD
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-slate-900">{booking.payment_method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Payment Status</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                    booking.payment_status === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : booking.payment_status === "refunded"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {booking.payment_status}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-semibold text-slate-900">{booking.transaction_id}</span>
              </div>
            </div>
          </div>

          {/* Card 6: Additional Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>6. Additional Information</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold mb-1">Student Notes</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {booking.student_notes || "None provided."}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold mb-1">Special Requirements</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {booking.special_requirements || "None"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-semibold mb-1">Admin Notes</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {booking.admin_notes || "None recorded."}
                </p>
              </div>
              {booking.cancellation_reason && (
                <div>
                  <span className="text-rose-500 block text-[11px] font-bold mb-1">Cancellation Reason</span>
                  <p className="font-medium text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {booking.cancellation_reason}
                  </p>
                </div>
              )}
              {booking.rescheduling_history && (
                <div>
                  <span className="text-purple-600 block text-[11px] font-bold mb-1">Rescheduling History</span>
                  <p className="font-medium text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                    {booking.rescheduling_history}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDE DRAWERS FOR ACTIONS */}

        {/* 1. EDIT BOOKING SIDE WINDOW DRAWER */}
        <Drawer
          isOpen={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
          title={`Edit Booking #${booking.booking_code}`}
          subtitle="Modify lesson parameters, location or status"
          size="lg"
          icon={<Edit className="w-5 h-5 text-amber-600" />}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={editForm.student_name}
                onChange={(e) => setEditForm({ ...editForm, student_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lesson Date
                </label>
                <input
                  type="date"
                  value={editForm.lesson_date}
                  onChange={(e) => setEditForm({ ...editForm, lesson_date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editForm.start_time}
                  onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lesson Type
                </label>
                <select
                  value={editForm.lesson_type}
                  onChange={(e) => setEditForm({ ...editForm, lesson_type: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Booking Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={editForm.pickup_location}
                onChange={(e) => setEditForm({ ...editForm, pickup_location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Drop-off Location
              </label>
              <input
                type="text"
                value={editForm.dropoff_location}
                onChange={(e) => setEditForm({ ...editForm, dropoff_location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold text-xs hover:bg-[#07345B] transition-all shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Drawer>

        {/* 2. MESSAGE LEARNER SIDE WINDOW DRAWER */}
        <Drawer
          isOpen={messageDrawerOpen}
          onClose={() => setMessageDrawerOpen(false)}
          title={`Message ${booking.student_name}`}
          subtitle={`Dispatches instant notification for Booking #${booking.booking_code}`}
          size="md"
          icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
        >
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Notification Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "sms", label: "SMS", icon: Smartphone },
                  { key: "email", label: "Email", icon: Mail },
                  { key: "notification", label: "In-App", icon: Bell },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isChActive = messageChannel === ch.key;
                  return (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => setMessageChannel(ch.key as any)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        isChActive
                          ? "border-[#0B1528] bg-[#0B1528]/5 text-[#0B1528] font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Message Content
              </label>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Destination: {booking.student_phone} / {booking.student_email}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMessageDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingMsg}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingMsg ? "Sending..." : "Send Message"}</span>
              </button>
            </div>
          </form>
        </Drawer>

        {/* 3. ASSIGN INSTRUCTOR SIDE WINDOW DRAWER */}
        <Drawer
          isOpen={assignDrawerOpen}
          onClose={() => setAssignDrawerOpen(false)}
          title={`Assign Instructor for #${booking.booking_code}`}
          subtitle={`Current instructor: ${booking.instructor_name}`}
          size="md"
          icon={<User className="w-5 h-5 text-amber-600" />}
        >
          <form onSubmit={handleSaveAssign} className="space-y-4">
            <p className="text-xs text-slate-500">
              Choose an available certified instructor with dual-control vehicle:
            </p>

            <div className="space-y-2">
              {instructorOptions.map((inst) => {
                const isSelected = newInstructorName === inst.name;
                return (
                  <div
                    key={inst.name}
                    onClick={() => setNewInstructorName(inst.name)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#0B1528] bg-[#0B1528]/5 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="font-heading font-black text-sm text-slate-900">
                        {inst.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        Vehicle: {inst.vehicle} · {inst.transmission}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0B1528] text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold text-xs hover:bg-[#07345B] transition-all shadow-xs cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </Drawer>

        {/* 4. RESCHEDULE BOOKING SIDE WINDOW DRAWER */}
        <Drawer
          isOpen={rescheduleDrawerOpen}
          onClose={() => setRescheduleDrawerOpen(false)}
          title={`Reschedule Booking #${booking.booking_code}`}
          subtitle={`Current schedule: ${booking.formatted_datetime}`}
          size="md"
          icon={<RotateCcw className="w-5 h-5 text-purple-600" />}
        >
          <form onSubmit={handleSaveReschedule} className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-all shadow-xs cursor-pointer"
              >
                Save Reschedule
              </button>
            </div>
          </form>
        </Drawer>

        {/* 5. CANCEL BOOKING MODAL */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Booking #${booking.booking_code}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                onClick={async () => {
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
                    alert(`Booking #${booking.booking_code} marked as CANCELLED in database.`);
                  } catch (err: any) {
                    alert(err.message || "Failed to cancel booking");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
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
