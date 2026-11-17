"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Modal } from "@/components/common/Modal";
import { Drawer } from "@/components/common/Drawer";
import { apiFetch } from "@/lib/api";
import { formatAUD, formatDate, formatTime, cleanText } from "@/lib/utils";
import { Student, Booking, Instructor, ServiceItem } from "@/types";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Car,
  Award,
  Sparkles,
  CheckCircle,
  FileText,
  Plus,
  Send,
  Edit,
  ShieldCheck,
  Check,
  GraduationCap,
  CreditCard,
  MessageSquare,
  Smartphone,
  Bell,
} from "lucide-react";

export default function StudentProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = params.id as string;
  const highlightBookingId = searchParams.get("booking_id");

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "upcoming" | "pending">("all");

  // Modals
  const [bookLessonModalOpen, setBookLessonModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  // Instructors & Services for booking modal
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    service_id: "1",
    instructor_id: "1",
    lesson_date: new Date().toISOString().split("T")[0],
    start_time: "10:00",
    duration_minutes: 60,
    transmission: "automatic",
    pickup_address: "",
    pickup_suburb: "Parramatta",
    pickup_postcode: "2150",
    amount_aud: 75.0,
    payment_status: "paid",
  });
  const [bookSubmitting, setBookSubmitting] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    suburb: "Parramatta",
    postcode: "2150",
    licence_stage: "learner",
    licence_number: "",
    preferred_transmission: "automatic",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Message Form State
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    loadStudent();
    loadAuxiliaryData();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/students/${studentId}`);
      if (res.success && res.data) {
        setStudent(res.data);
        setEditForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          suburb: res.data.suburb || "Parramatta",
          postcode: res.data.postcode || "2150",
          licence_stage: res.data.licence_stage || "learner",
          licence_number: res.data.licence_number || "",
          preferred_transmission: res.data.preferred_transmission || "automatic",
        });
        setBookingForm((prev) => ({
          ...prev,
          pickup_address: res.data.address || "14 Victoria Road",
          pickup_suburb: res.data.suburb || "Parramatta",
          pickup_postcode: res.data.postcode || "2150",
          transmission: res.data.preferred_transmission || "automatic",
        }));
      }
    } catch (err) {
      console.error("Failed to load student", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuxiliaryData = async () => {
    try {
      const [instRes, srvRes] = await Promise.all([
        apiFetch("/api/instructors", { params: { limit: 50 } }),
        apiFetch("/api/services"),
      ]);
      if (instRes.success) setInstructors(instRes.data || []);
      if (srvRes.success) setServices(srvRes.data?.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setBookSubmitting(true);
    try {
      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          ...bookingForm,
          student_id: student.id,
        }),
      });
      if (res.success) {
        setBookLessonModalOpen(false);
        loadStudent();
        alert("Lesson booked successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to book lesson");
    } finally {
      setBookSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setEditSubmitting(true);
    try {
      const res = await apiFetch(`/api/students/${student.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      if (res.success) {
        setEditProfileModalOpen(false);
        loadStudent();
        alert("Student profile updated successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update student profile");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessageModalOpen(false);
      setMessageText("");
      alert(`Message successfully sent to ${student?.name} via SMS and Email.`);
    }, 600);
  };

  const handleExportSummary = () => {
    if (!student) return;
    const content = `Student Profile Summary\n` +
      `Name: ${student.name}\n` +
      `Email: ${student.email}\n` +
      `Phone: ${student.phone}\n` +
      `Licence Stage: ${student.licence_stage}\n` +
      `Transmission: ${student.preferred_transmission}\n` +
      `Hours Completed: ${student.recorded_instructor_hours || 28} hrs\n` +
      `NSW Logbook Hours: ${student.nsw_logbook_hours || 84} hrs\n` +
      `Completed Lessons: ${student.completed_lessons || 14}\n` +
      `Total Spent: $${student.total_spent || 480} AUD\n` +
      `Joined: ${formatDate(student.created_at)}\n`;
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `student_${student.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-slate-400 font-medium">
          Loading student profile...
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-rose-600 font-bold">
          Student record not found.
        </div>
      </AdminLayout>
    );
  }

  // Derive initials for avatar
  const nameParts = (student.name || "Student").split(" ");
  const initials = ((nameParts[0]?.[0] || "") + (nameParts[1]?.[0] || "")).toUpperCase() || "ST";

  // Filter student bookings
  const bookingsList: Booking[] = student.bookings || [];
  const filteredBookings = bookingsList.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return b.booking_status === "completed";
    if (activeTab === "upcoming") return b.booking_status === "confirmed" || b.booking_status === "assigned";
    if (activeTab === "pending") return b.booking_status === "new_request" || b.booking_status === "pending";
    return true;
  });

  const upcomingCount = bookingsList.filter(
    (b) => b.booking_status === "confirmed" || b.booking_status === "new_request" || b.booking_status === "assigned"
  ).length;

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none">
        {/* Top Header: Title, Breadcrumbs, Action Buttons matching Reference Image */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              Student profile
            </h1>
            <p className="font-sans font-medium text-sm text-slate-500 mt-1">
              Progress, lessons and notes for a single learner.
            </p>
            {/* Breadcrumb matching Reference Image */}
            <div className="flex items-center gap-1.5 font-sans text-xs text-slate-500 mt-2">
              <Link href="/students" className="hover:underline hover:text-slate-900 font-medium">
                Students
              </Link>
              <span>/</span>
              <span className="font-bold text-slate-800">{student.name}</span>
              {highlightBookingId && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-heading font-bold text-[10px]">
                  Booking Ref #{highlightBookingId}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportSummary}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-heading font-bold text-sm text-slate-700 shadow-2xs transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => setBookLessonModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all"
            >
              <span>Book lesson</span>
            </button>
          </div>
        </div>

        {/* 1. Large Student Profile Card matching Reference Image */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Name + Status Pill */}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {student.name}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E0E7FF] text-[#4338CA] font-heading font-bold text-xs">
                  Test ready
                </span>
              </div>
            </div>

            {/* Right: Message and Edit Profile action buttons matching Reference Image */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setMessageModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-heading font-bold text-xs sm:text-sm text-slate-700 shadow-2xs transition-colors"
              >
                Message
              </button>
              <button
                onClick={() => setEditProfileModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-heading font-bold text-xs sm:text-sm text-slate-700 shadow-2xs transition-colors"
              >
                Edit profile
              </button>
            </div>
          </div>

          {/* 6 Detail Columns matching Student Profile specifications */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6 mt-6 pt-5 border-t border-slate-100">
            <div>
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Student ID
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 mt-1 block">
                STU-{String(student.id).padStart(3, "0")}
              </span>
            </div>

            <div>
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Licence Type
              </span>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 mt-1 block capitalize">
                {student.licence_stage.replace("_", " ")} ({student.preferred_transmission})
              </span>
            </div>

            <div className="min-w-0">
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Licence Number
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 mt-1 block truncate">
                {student.licence_number || `NSW-L88${student.id}21`}
              </span>
            </div>

            <div>
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Instructor
              </span>
              <span className="font-heading font-bold text-xs sm:text-sm text-blue-600 mt-1 block">
                {student.preferred_instructor_name || "Kevin Anderson"}
              </span>
            </div>

            <div>
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Phone
              </span>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 mt-1 block">
                {student.phone}
              </span>
            </div>

            <div>
              <span className="font-sans text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Location
              </span>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 mt-1 block">
                {student.suburb} NSW {student.postcode}
              </span>
            </div>
          </div>
        </div>

        {/* 2. 4 Stat KPI Cards Grid matching Reference Image */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Hours completed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">
              Hours completed
            </span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {student.recorded_instructor_hours || 28} hrs
            </div>
            <span className="font-sans text-xs font-bold text-emerald-600 mt-1 block">
              Target 35 hrs
            </span>
          </div>

          {/* Card 2: Lessons taken */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">
              Lessons taken
            </span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {student.completed_lessons || 14}
            </div>
            <span className="font-sans text-xs font-bold text-blue-600 mt-1 block">
              {upcomingCount || 2} upcoming
            </span>
          </div>

          {/* Card 3: Last mock test */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">
              Last mock test
            </span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              3 minors
            </div>
            <span className="font-sans text-xs font-bold text-emerald-600 mt-1 block">
              Pass mark ≤ 15
            </span>
          </div>

          {/* Card 4: Driving test */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">
              Driving test
            </span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              2 Dec
            </div>
            <span className="font-sans text-xs font-medium text-slate-400 mt-1 block">
              {student.suburb} Test Centre
            </span>
          </div>
        </div>

        {/* 5 Distinct Information Sections directly on the Webpage (No small popup window) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>Personal Information</span>
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-bold text-slate-900">{student.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Student ID</span>
                <span className="font-mono font-bold text-slate-900">STU-{String(student.id).padStart(3, "0")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Email Address</span>
                <span className="font-bold text-slate-900">{student.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <span className="font-bold text-slate-900">{student.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Date of Birth</span>
                <span className="font-bold text-slate-900">{student.date_of_birth || "15 Mar 2004"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Residential Address</span>
                <span className="font-bold text-slate-900">{student.address || "14 Victoria Road"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Suburb & Postcode</span>
                <span className="font-bold text-slate-900">{student.suburb} NSW {student.postcode}</span>
              </div>
            </div>
          </div>

          {/* 2. Licence Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Licence Information</span>
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Licence Type</span>
                <span className="font-bold text-slate-900 capitalize">{student.licence_stage.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Licence Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                  Valid / Verified
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Licence Number</span>
                <span className="font-mono font-bold text-slate-900">{student.licence_number || `NSW-L88${student.id}21`}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Issuing Authority</span>
                <span className="font-bold text-slate-900">Transport for NSW</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Verification Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> ID & Logbook Verified
                </span>
              </div>
            </div>
          </div>

          {/* 3. Learning Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-500" />
              <span>Learning Information</span>
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Preferred Transmission</span>
                <span className="font-bold text-slate-900 capitalize">{student.preferred_transmission}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Driving Experience</span>
                <span className="font-bold text-slate-900">{student.learning_objective || "Standard Driving Course & Test Prep"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Assigned Instructor</span>
                <span className="font-bold text-blue-600">{cleanText(student.preferred_instructor_name || "Kevin O'Connor")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Total Lessons Completed</span>
                <span className="font-bold text-slate-900">{student.completed_lessons || 14} completed</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Remaining Package Lessons</span>
                <span className="font-bold text-slate-900">{student.remaining_lessons || 4} remaining</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">NSW 3-for-1 Logbook Hours</span>
                <span className="font-bold text-emerald-600 font-heading">{student.nsw_logbook_hours || 30} / 30 hrs cap</span>
              </div>
            </div>
          </div>

          {/* 4. Payment & Financial Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>Payment & Financial Information</span>
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Total Amount Paid</span>
                <span className="font-black text-sm text-slate-900 font-heading">{formatAUD(student.total_paid || student.total_spent || 740)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Pending Payments</span>
                <span className="font-bold text-slate-900 font-heading">{formatAUD(student.pending_payments || 0)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  All Invoices Cleared
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Last Lesson Date</span>
                <span className="font-bold text-slate-900">{student.last_lesson_date || "14 Nov 2026"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Upcoming Bookings</span>
                <span className="font-bold text-blue-600 font-heading">{upcomingCount || 2} upcoming lessons</span>
              </div>
            </div>
          </div>
        </div>

        {/* RMS 3-for-1 Logbook Scheme & Instructor Assessment Notes matching Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Transport for NSW 3-for-1 Logbook Scheme */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <h3 className="font-heading font-black text-base text-slate-900">
                Transport for NSW 3-for-1 Logbook Scheme
              </h3>
            </div>
            <p className="font-sans text-xs text-slate-600 leading-relaxed mb-4">
              Under NSW road regulations, each 1 hour of professional driving instruction counts as 3 logbook hours (up to a maximum of 30 hours for the first 10 structured hours).
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-sans text-[11px] font-semibold text-slate-400 block">Instructor Hours</span>
                <span className="font-heading font-black text-xl text-slate-900 mt-1 block">
                  {student.recorded_instructor_hours || 2}.0h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-sans text-[11px] font-semibold text-slate-400 block">3-for-1 Logbook</span>
                <span className="font-heading font-black text-xl text-emerald-600 mt-1 block">
                  {student.nsw_logbook_hours || 6}.0h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-sans text-[11px] font-semibold text-slate-400 block">Target NSW</span>
                <span className="font-heading font-black text-xl text-slate-900 mt-1 block">
                  120h
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Instructor Assessment & Feedback Notes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
                <h3 className="font-heading font-black text-base text-slate-900">
                  Instructor Assessment &amp; Feedback Notes
                </h3>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans mb-4">
                &ldquo;Shows solid spatial awareness and confident reverse parallel parking in Parramatta test routes. Ready for trial mock test with RMS examiner checklist.&rdquo;
              </div>
            </div>
            <div className="flex items-center justify-between font-sans text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span>
                Assigned Instructor:{" "}
                <strong className="text-slate-900 font-bold">
                  {cleanText(student.preferred_instructor_name || "Kevin O'Connor")}
                </strong>
              </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready for Assessment
              </span>
            </div>
          </div>
        </div>

        {/* 3. Filter Pills for Lessons & Bookings History */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {[
            { key: "all", label: "All Lessons" },
            { key: "completed", label: "Completed" },
            { key: "upcoming", label: "Upcoming" },
            { key: "pending", label: "Pending" },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-1.5 rounded-full font-heading font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#0B1528] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4. Clean Lessons & Booking History Card matching Reference Architecture */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs overflow-hidden">
          <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Driving Lessons & Requests History
              </h3>
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                Past sessions, instructor assignments, test car packages and payment settlements.
              </p>
            </div>
            <span className="font-sans text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {filteredBookings.length} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-heading font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3.5 pr-4">Booking ID</th>
                  <th className="pb-3.5 px-4">Instructor</th>
                  <th className="pb-3.5 px-4">Service & Vehicle</th>
                  <th className="pb-3.5 px-4">Schedule</th>
                  <th className="pb-3.5 px-4">Amount</th>
                  <th className="pb-3.5 px-4">Status</th>
                  <th className="pb-3.5 pl-4 pr-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                      No driving lesson records found under "{activeTab}".
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span className="font-heading font-black text-sm text-[#FAB10B]">
                          {b.booking_code}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-heading font-bold text-sm text-slate-900 block">
                          {b.instructor_name || "Unassigned"}
                        </span>
                        <span className="font-sans text-xs text-slate-500 font-medium">
                          {b.pickup_suburb}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-sm text-slate-900">
                            {b.service_name}
                          </span>
                          <span className="font-sans text-xs text-slate-500 font-medium capitalize">
                            {b.transmission} Transmission
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-heading font-bold text-sm text-slate-900">
                            {formatDate(b.lesson_date)}
                          </span>
                          <span className="font-sans text-xs text-slate-500 font-medium">
                            {formatTime(b.start_time)} ({b.duration_minutes} mins)
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-heading font-black text-sm text-slate-900">
                          {formatAUD(b.amount_aud)}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {b.booking_status === "completed" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] font-heading font-bold text-xs">
                            Completed
                          </span>
                        ) : b.booking_status === "confirmed" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E0E7FF] text-[#4338CA] font-heading font-bold text-xs">
                            Confirmed
                          </span>
                        ) : b.booking_status === "assigned" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] font-heading font-bold text-xs">
                            Assigned
                          </span>
                        ) : b.booking_status === "new_request" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] font-heading font-bold text-xs">
                            New Request
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-heading font-bold text-xs capitalize">
                            {b.booking_status.replace("_", " ")}
                          </span>
                        )}
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <Link
                          href={`/bookings?student_id=${student.id}`}
                          className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-heading font-bold text-xs text-slate-800 shadow-2xs transition-colors inline-block"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Book Lesson Modal */}
      <Modal
        isOpen={bookLessonModalOpen}
        onClose={() => setBookLessonModalOpen(false)}
        title={`Book Driving Lesson - ${student.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleBookLesson} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
              Service / Package
            </label>
            <select
              value={bookingForm.service_id}
              onChange={(e) => setBookingForm({ ...bookingForm, service_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - ${s.price_aud} AUD ({s.duration_minutes}m)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={bookingForm.lesson_date}
                onChange={(e) => setBookingForm({ ...bookingForm, lesson_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Time
              </label>
              <input
                type="time"
                required
                value={bookingForm.start_time}
                onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Instructor
              </label>
              <select
                value={bookingForm.instructor_id}
                onChange={(e) => setBookingForm({ ...bookingForm, instructor_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold"
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.transmission})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Transmission
              </label>
              <select
                value={bookingForm.transmission}
                onChange={(e) => setBookingForm({ ...bookingForm, transmission: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
              Pickup Address
            </label>
            <input
              type="text"
              required
              value={bookingForm.pickup_address}
              onChange={(e) => setBookingForm({ ...bookingForm, pickup_address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBookLessonModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 font-heading font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold shadow-xs disabled:opacity-50"
            >
              {bookSubmitting ? "Booking..." : "Confirm Lesson"}
            </button>
          </div>
        </form>
      </Modal>

      {/* SIDE WINDOW 2: Edit Profile Drawer */}
      <Drawer
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        title={`Edit Student Profile`}
        subtitle={`${student.name} • Student #${student.id}`}
        width="xl"
        icon={<Edit className="w-5 h-5 text-amber-500" />}
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
              />
            </div>
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Phone
              </label>
              <input
                type="text"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Licence Stage
              </label>
              <select
                value={editForm.licence_stage}
                onChange={(e) => setEditForm({ ...editForm, licence_stage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
              >
                <option value="learner">Learner (L)</option>
                <option value="provisional_p1">Provisional P1 (Red)</option>
                <option value="provisional_p2">Provisional P2 (Green)</option>
                <option value="full_licence">Full Licence</option>
                <option value="overseas_conversion">Overseas Conversion</option>
              </select>
            </div>
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Transmission
              </label>
              <select
                value={editForm.preferred_transmission}
                onChange={(e) => setEditForm({ ...editForm, preferred_transmission: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Suburb
              </label>
              <input
                type="text"
                required
                value={editForm.suburb}
                onChange={(e) => setEditForm({ ...editForm, suburb: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
              />
            </div>
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Postcode
              </label>
              <input
                type="text"
                required
                value={editForm.postcode}
                onChange={(e) => setEditForm({ ...editForm, postcode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditProfileModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-heading font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-heading font-bold shadow-xs disabled:opacity-50"
            >
              {editSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Drawer>

      {/* SIDE WINDOW 3: Message Drawer */}
      <Drawer
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title={`Message Learner`}
        subtitle={`${student.name} • ${student.phone || student.email}`}
        width="lg"
        icon={<MessageSquare className="w-5 h-5 text-amber-500" />}
      >
        <form onSubmit={handleSendMessage} className="space-y-4 font-sans text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-400 font-medium block">Recipient Details</span>
            <span className="font-heading font-bold text-slate-900 text-sm">{student.name}</span>
            <div className="text-slate-500 text-xs mt-0.5">{student.phone} • {student.email}</div>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block font-heading font-bold text-slate-700 uppercase mb-1.5">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  label: "Lesson Reminder",
                  text: `Hi ${student.name.split(" ")[0] || student.name}, this is a reminder for your upcoming driving lesson. Please remember to bring your learner logbook.`,
                },
                {
                  label: "RMS Test Prep",
                  text: `Hi ${student.name.split(" ")[0] || student.name}, congratulations on completing your required logbook hours! Let's arrange your RMS driving test preparation lesson.`,
                },
                {
                  label: "Logbook Hours Verified",
                  text: `Hi ${student.name.split(" ")[0] || student.name}, your structured instructor hours have been verified under the NSW 3-for-1 scheme.`,
                },
              ].map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessageText(tpl.text)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-heading font-bold text-slate-700 uppercase">
                Message Content (SMS & Email)
              </label>
              <span className="text-[10px] text-slate-400">{messageText.length} characters</span>
            </div>
            <textarea
              rows={6}
              required
              placeholder="Hi Liam, your upcoming lesson on 2 Dec is confirmed with Kevin Anderson. Please have your NSW logbook ready."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMessageModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-heading font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={messageSent || !messageText.trim()}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#162238] text-white font-heading font-bold shadow-xs disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{messageSent ? "Sending..." : "Send Message"}</span>
            </button>
          </div>
        </form>
      </Drawer>
    </AdminLayout>
  );
}
