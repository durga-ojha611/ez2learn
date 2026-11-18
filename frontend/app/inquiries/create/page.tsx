"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { apiFetch } from "@/lib/api";
import {
  Inbox,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Car,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

const LESSON_TYPES = [
  "Automatic Driving Lessons",
  "Manual Driving Lessons",
  "Complete Beginner Package (10 Lessons)",
  "RMS Practical Test Package (Car Hire & Warm-up)",
  "Overseas Licence Conversion",
  "Defensive Driving & Motorway Confidence",
  "Refresher Driving Course",
  "Elderly Driver Assessment Preparation",
];

const INSTRUCTORS = [
  "Kevin O'Connor",
  "Aisha Khan",
  "Michael Zhang",
  "Sarah Jenkins",
  "Office Reception",
];

const SUBURBS = [
  "Parramatta",
  "Blacktown",
  "Castle Hill",
  "Ryde",
  "Liverpool",
  "Westmead",
  "Penrith",
  "Hornsby",
  "Epping",
  "Merrylands",
  "Auburn",
];

export default function CreateInquiryPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    suburb: "Parramatta",
    lesson_type: "Automatic Driving Lessons",
    message: "",
    preferred_date: "",
    preferred_time: "Morning 9:00 AM",
    status: "new" as "new" | "contacted" | "converted" | "closed",
    assigned_to: "Kevin O'Connor",
    notes: "",
  });

  const handleSubmit = async (andConvert = false) => {
    if (!form.name.trim()) {
      setErrorMsg("Student full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setErrorMsg("Student email address is required.");
      return;
    }
    if (!form.phone.trim()) {
      setErrorMsg("Student Australian phone number is required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await apiFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (res.success) {
        if (andConvert) {
          router.push(
            `/bookings/create?student_name=${encodeURIComponent(
              form.name
            )}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(
              form.phone
            )}&suburb=${encodeURIComponent(form.suburb)}&service=${encodeURIComponent(
              form.lesson_type
            )}`
          );
        } else {
          router.push("/inquiries");
        }
      } else {
        setErrorMsg(res.message || "Failed to create inquiry.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 pb-24 select-none">
        {/* Full-Width Rectangle Header Banner */}
        <PageHeading
          icon={Inbox}
          title="Log New Customer Inquiry"
          subtitle="Record incoming student inquiries from phone calls, web contact forms, or office walk-ins"
          badge="New Lead"
          actions={
            <Link
              href="/inquiries"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Inquiries</span>
            </Link>
          }
        />

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = LEAD INTELLIGENCE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: INQUIRY FORM DETAILS (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            {/* CARD 1: Student Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                  <User className="w-4 h-4 text-[#008770]" />
                  <span>1. Student Contact Information</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Wilson"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. liam.wilson@sydneyuni.edu.au"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Australian Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0435 902 441"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                    />
                  </div>
                </div>

                {/* Suburb / Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pickup Suburb / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Parramatta, Castle Hill, Blacktown"
                      value={form.suburb}
                      onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                    />
                  </div>
                  {/* Quick Suburb Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {SUBURBS.slice(0, 5).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setForm({ ...form, suburb: sub })}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          form.suburb === sub
                            ? "bg-[#0B1528] text-white border-[#0B1528] font-bold"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Lesson Requirements */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                  <Car className="w-4 h-4 text-[#008770]" />
                  <span>2. Lesson & Schedule Requirements</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Step 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lesson Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Requested Lesson Package <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.lesson_type}
                      onChange={(e) => setForm({ ...form, lesson_type: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 cursor-pointer"
                    >
                      {LESSON_TYPES.map((lt) => (
                        <option key={lt} value={lt}>
                          {lt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Start Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={form.preferred_date}
                      onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                </div>

                {/* Preferred Time Slot */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Time & Availability
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Saturday Mornings 9:00 AM, Weekday Afternoons after 4 PM"
                      value={form.preferred_time}
                      onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                  {/* Quick Timing Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      "Weekend Mornings",
                      "Weekday Afternoons (4 PM - 6 PM)",
                      "Saturday 10:00 AM",
                      "Flexible / Anytime",
                      "Urgent Test Prep",
                    ].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setForm({ ...form, preferred_time: time })}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          form.preferred_time === time
                            ? "bg-[#0B1528] text-white border-[#0B1528] font-bold"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Customer Inquiry Message */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-[#008770]" />
                <span>3. Customer Inquiry Message & Requirements</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detailed Message / Notes from Student
                </label>
                <textarea
                  rows={4}
                  placeholder="Record student's current licence status (L-plates, overseas licence, demerits), RMS test booking date, or specific areas of difficulty (parallel parking, motorway merges, roundabouts)..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                />
              </div>
            </div>

            {/* CARD 4: Administrative Assignment & Follow-Up */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
                <UserCheck className="w-4 h-4 text-[#008770]" />
                <span>4. Lead Status & Instructor Assignment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Lead Status
                  </label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 cursor-pointer"
                    >
                      <option value="new">New (Awaiting Reply)</option>
                      <option value="contacted">Contacted / Follow-up in progress</option>
                      <option value="converted">Converted to Booking</option>
                      <option value="closed">Closed / Archived</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Assigned Instructor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assigned Instructor / Handler
                  </label>
                  <div className="relative">
                    <select
                      value={form.assigned_to}
                      onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 cursor-pointer"
                    >
                      {INSTRUCTORS.map((ins) => (
                        <option key={ins} value={ins}>
                          {ins}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Internal Admin Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Internal Follow-Up Notes (Staff Eyes Only)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Record quoted price, callback schedule, or package details discussed..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Link
                href="/inquiries"
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs text-center transition-colors"
              >
                Cancel & Return
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-75"
                >
                  {submitting ? "Saving..." : "Save & Log Inquiry"}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-75"
                >
                  <span>Save & Convert Directly to Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE LEAD INTELLIGENCE PREVIEW (4 COLS) */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            {/* Live Lead Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
                  <span>Live Lead Card Preview</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {form.status.toUpperCase()}
                </span>
              </div>

              {/* Student Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0B1528] text-white flex items-center justify-center font-black text-base shadow-2xs">
                  {form.name ? form.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm">
                    {form.name || "Student Full Name"}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{form.suburb || "Parramatta NSW"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Snapshot */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-slate-400">Phone:</span>
                  <span className="font-bold text-slate-800">{form.phone || "04XX XXX XXX"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-slate-400">Email:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">
                    {form.email || "student@example.com"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-slate-400">Service:</span>
                  <span className="font-bold text-slate-800">{form.lesson_type}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium text-slate-400">Preferred Slot:</span>
                  <span className="font-bold text-slate-800">{form.preferred_time}</span>
                </div>
              </div>

              {/* Follow-up Guidelines */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lead Response Best Practice</span>
                </span>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  Leads contacted within 15 minutes convert 3x faster into confirmed lesson bookings. Verify dual-control vehicle preference when calling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
