"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CreditCard,
  FileText,
  Check,
  X,
  ChevronDown,
  Eye,
  Sparkles,
} from "lucide-react";

export default function CreateBookingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reference data
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);

  const [form, setForm] = useState({
    studentMode: "existing" as "existing" | "new",
    studentId: "",
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    licenceStage: "learner",

    serviceId: "",
    serviceName: "Standard Driving Lesson",
    transmission: "automatic" as "automatic" | "manual",
    durationMinutes: 60,

    lessonDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "09:00",
    instructorId: "",

    pickupAddress: "",
    pickupSuburb: "Parramatta",
    pickupPostcode: "2150",
    dropoffSameAsPickup: true,
    dropoffAddress: "",

    amountAud: 85,
    discountAud: 0,
    paymentStatus: "paid" as "paid" | "unpaid",
    paymentMethod: "Credit Card",

    studentNotes: "",
    specialRequirements: "Dual-control vehicle requested",
    adminNotes: "Created via Admin Panel",
  });

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      const [instRes, stuRes, srvRes] = await Promise.all([
        apiFetch("/api/instructors?limit=100"),
        apiFetch("/api/students?limit=100"),
        apiFetch("/api/services"),
      ]);

      if (instRes.success && Array.isArray(instRes.data)) {
        setInstructorsList(instRes.data);
        if (instRes.data.length > 0) {
          setForm((prev) => ({ ...prev, instructorId: String(instRes.data[0].id) }));
        }
      }

      if (stuRes.success && Array.isArray(stuRes.data)) {
        setStudentsList(stuRes.data);
        if (stuRes.data.length > 0) {
          const s = stuRes.data[0];
          setForm((prev) => ({
            ...prev,
            studentId: String(s.id),
            studentName: s.name,
            studentEmail: s.email,
            studentPhone: s.phone || "",
            licenceStage: s.licence_stage || "learner",
          }));
        }
      }

      if (srvRes.success && Array.isArray(srvRes.data?.services)) {
        setServicesList(srvRes.data.services);
        if (srvRes.data.services.length > 0) {
          const srv = srvRes.data.services[0];
          setForm((prev) => ({
            ...prev,
            serviceId: String(srv.id),
            serviceName: srv.name,
            durationMinutes: srv.duration_minutes || 60,
            amountAud: Number(srv.price_aud) || 85,
          }));
        }
      }
    } catch (err) {
      console.warn("Could not load reference lists", err);
    }
  };

  const handleStudentSelect = (idStr: string) => {
    const s = studentsList.find((item) => String(item.id) === idStr);
    if (s) {
      setForm((prev) => ({
        ...prev,
        studentId: idStr,
        studentName: s.name,
        studentEmail: s.email,
        studentPhone: s.phone || "",
        licenceStage: s.licence_stage || "learner",
      }));
    }
  };

  const handleServiceSelect = (srvIdStr: string) => {
    const srv = servicesList.find((item) => String(item.id) === srvIdStr);
    if (srv) {
      setForm((prev) => ({
        ...prev,
        serviceId: srvIdStr,
        serviceName: srv.name,
        durationMinutes: srv.duration_minutes || 60,
        amountAud: Number(srv.price_aud) || 85,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.studentMode === "existing" && !form.studentId) {
      setErrorMsg("Please select an existing student.");
      return;
    }
    if (form.studentMode === "new" && (!form.studentName.trim() || !form.studentEmail.trim())) {
      setErrorMsg("Please provide student name and email.");
      return;
    }
    if (!form.pickupAddress.trim()) {
      setErrorMsg("Please enter a pickup address.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      student_id: form.studentMode === "existing" ? Number(form.studentId) : null,
      student_name: form.studentName.trim(),
      student_email: form.studentEmail.trim(),
      student_phone: form.studentPhone.trim(),
      licence_stage: form.licenceStage,
      instructor_id: form.instructorId ? Number(form.instructorId) : null,
      service_id: form.serviceId ? Number(form.serviceId) : null,
      transmission: form.transmission,
      lesson_package: form.serviceName,
      lesson_date: form.lessonDate,
      start_time: form.startTime,
      duration_minutes: Number(form.durationMinutes),
      pickup_address: form.pickupAddress.trim(),
      pickup_suburb: form.pickupSuburb.trim(),
      pickup_postcode: form.pickupPostcode.trim(),
      dropoff_address: form.dropoffSameAsPickup
        ? form.pickupAddress.trim()
        : form.dropoffAddress.trim() || form.pickupAddress.trim(),
      amount_aud: Number(form.amountAud),
      discount_aud: Number(form.discountAud || 0),
      final_amount_aud: Math.max(0, Number(form.amountAud) - Number(form.discountAud || 0)),
      payment_status: form.paymentStatus,
      payment_method: form.paymentMethod,
      student_notes: form.studentNotes.trim(),
      special_requirements: form.specialRequirements.trim(),
      admin_notes: form.adminNotes.trim() || "Created by Admin via Dedicated Booking Page",
    };

    try {
      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        router.push("/bookings");
      } else {
        setErrorMsg(res?.message || "Failed to create booking.");
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create booking.");
      setSubmitting(false);
    }
  };

  const finalAmount = Math.max(0, Number(form.amountAud) - Number(form.discountAud || 0));

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-7xl pb-20 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Bookings</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Booking Dispatch • Dedicated Page
          </span>
        </div>

        {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = LIVE TICKET PREVIEW */}
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
                      Create New Booking
                    </h1>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Schedule a driving lesson, assign an instructor, and record payments
                    </p>
                  </div>
                </div>
                <Link
                  href="/bookings"
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

            {/* SECTION 1: Student Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>1. Student Selection</span>
                </h3>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, studentMode: "existing" })}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      form.studentMode === "existing"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Existing Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, studentMode: "new" })}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      form.studentMode === "new"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + New Student
                  </button>
                </div>
              </div>

              {form.studentMode === "existing" ? (
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Select Student <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.studentId}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                    >
                      {studentsList.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.name} ({stu.student_code || `STU-${stu.id}`}) — {stu.phone}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jessica Taylor"
                      value={form.studentName}
                      onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jessica@example.com"
                      value={form.studentEmail}
                      onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+61 400 000 000"
                      value={form.studentPhone}
                      onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Lesson & Instructor */}
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span>2. Lesson & Schedule</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Service / Package <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.serviceId}
                      onChange={(e) => handleServiceSelect(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                    >
                      {servicesList.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} (${srv.price_aud})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Transmission <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, transmission: "automatic" })}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors border ${
                        form.transmission === "automatic"
                          ? "bg-[#0B1528] text-white border-[#0B1528]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Automatic
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, transmission: "manual" })}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors border ${
                        form.transmission === "manual"
                          ? "bg-[#0B1528] text-white border-[#0B1528]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Assigned Instructor <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.instructorId}
                      onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                    >
                      {instructorsList.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.transmission})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Lesson Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.lessonDate}
                    onChange={(e) => setForm({ ...form, lessonDate: e.target.value })}
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
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Locations */}
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>3. Pickup & Drop-off Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Pickup Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Church Street"
                    value={form.pickupAddress}
                    onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Suburb & Postcode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Parramatta"
                      value={form.pickupSuburb}
                      onChange={(e) => setForm({ ...form, pickupSuburb: e.target.value })}
                      className="w-2/3 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="2150"
                      value={form.pickupPostcode}
                      onChange={(e) => setForm({ ...form, pickupPostcode: e.target.value })}
                      className="w-1/3 px-2 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Pricing & Payment */}
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>4. Payment & Fees</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Amount ($ AUD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amountAud}
                    onChange={(e) =>
                      setForm({ ...form, amountAud: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Discount ($ AUD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.discountAud}
                    onChange={(e) =>
                      setForm({ ...form, discountAud: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Payment Status
                  </label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Final Total
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 font-black text-slate-900 text-sm">
                    ${finalAmount.toFixed(2)} AUD
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/bookings"
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
                <span>{submitting ? "Creating..." : "Confirm & Create Booking"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: LIVE BOOKING CONFIRMATION & TICKET PREVIEW */}
      <div className="lg:col-span-4 sticky top-6 space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
            <span>Live Booking Dispatch Card</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Live Sync
          </span>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Lesson Package
              </span>
              <h3 className="font-heading font-black text-slate-900 text-sm">
                {form.serviceName}
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                form.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {form.paymentStatus === "paid" ? "✓ PAID" : "⏳ UNPAID"}
            </span>
          </div>

          {/* Student Preview */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Learner Student:
            </span>
            <p className="font-heading font-bold text-slate-900 text-sm">
              {form.studentName || "Select or enter student"}
            </p>
            <p className="text-[11px] text-slate-500">
              {form.studentEmail || "Email"} • {form.studentPhone || "Phone"}
            </p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 capitalize">
              {form.licenceStage} Licence
            </span>
          </div>

          {/* Schedule Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date:</span>
              </span>
              <strong className="text-slate-900">{form.lessonDate}</strong>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time & Duration:</span>
              </span>
              <strong className="text-slate-900">
                {form.startTime} ({form.durationMinutes} mins)
              </strong>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span>Transmission:</span>
              </span>
              <strong className="text-slate-900 capitalize">{form.transmission}</strong>
            </div>

            <div className="flex items-start justify-between text-slate-600 pt-1">
              <span className="flex items-center gap-1.5 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Pickup:</span>
              </span>
              <span className="text-right text-slate-800 font-medium line-clamp-2 max-w-[180px]">
                {form.pickupAddress
                  ? `${form.pickupAddress}, ${form.pickupSuburb} ${form.pickupPostcode}`
                  : "Enter address on left"}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="p-3.5 rounded-2xl bg-[#0B1528] text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-300 font-medium block">Total Payable:</span>
              <span className="font-heading font-black text-lg text-[#FAB10B]">
                ${finalAmount.toFixed(2)} AUD
              </span>
            </div>
            <span className="text-xs font-bold text-slate-300">
              via {form.paymentMethod}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</AdminLayout>
  );
}
