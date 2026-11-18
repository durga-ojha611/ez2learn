"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { ConfirmModal } from "@/components/common/ConfirmModal";
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
  Trash2,
  MessageSquare,
  ExternalLink,
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

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    suburb: "",
    lesson_type: "Automatic Driving Lessons",
    message: "",
    preferred_date: "",
    preferred_time: "",
    status: "new" as "new" | "contacted" | "converted" | "closed",
    assigned_to: "Kevin O'Connor",
    notes: "",
    created_at: "",
  });

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  useEffect(() => {
    if (id) {
      loadInquiry();
    }
  }, [id]);

  const loadInquiry = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/inquiries/${id}`);
      if (res.success && res.data) {
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          suburb: res.data.suburb || "",
          lesson_type: res.data.lesson_type || "Automatic Driving Lessons",
          message: res.data.message || "",
          preferred_date: res.data.preferred_date || "",
          preferred_time: res.data.preferred_time || "",
          status: res.data.status || "new",
          assigned_to: res.data.assigned_to || "Kevin O'Connor",
          notes: res.data.notes || "",
          created_at: res.data.created_at || "",
        });
      } else {
        setErrorMsg("Inquiry not found.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load inquiry details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setErrorMsg("Student name, email, and phone are required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await apiFetch(`/api/inquiries/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      if (res.success) {
        showSuccess("Inquiry details updated successfully.");
      } else {
        setErrorMsg(res.message || "Failed to update inquiry.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update inquiry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/inquiries/${id}`, { method: "DELETE" });
      router.push("/inquiries");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete inquiry.");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="w-full py-20 text-center font-heading font-bold text-slate-500">
          Loading inquiry details...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 pb-24 select-none">
        {/* Full-Width Rectangle Header Banner */}
        <PageHeading
          icon={Inbox}
          title={`Inquiry Details — ${form.name}`}
          subtitle={`Received on ${formatDate(form.created_at)} • Managing lead status & communication notes`}
          badge={form.status.toUpperCase()}
          actions={
            <div className="flex items-center gap-2.5">
              <Link
                href="/inquiries"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>All Inquiries</span>
              </Link>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          }
        />

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = STUDENT PROFILE & CONVERSION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: INQUIRY FORM DETAILS (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            {/* CARD 1: Student Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                  <User className="w-4 h-4 text-[#008770]" />
                  <span>1. Student Contact Information</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Personal Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pickup Suburb / Area
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={form.suburb}
                      onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Service & Schedule Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900">
                  <Car className="w-4 h-4 text-[#008770]" />
                  <span>2. Requested Lesson & Timing</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Lesson Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Requested Service Type
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={form.preferred_date ? form.preferred_date.slice(0, 10) : ""}
                      onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Time & Availability
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={form.preferred_time}
                      onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Customer Message (Full Content) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-[#008770]" />
                <span>3. Customer Inquiry Message</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Original Student Request / Message
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 transition-all"
                />
              </div>
            </div>

            {/* CARD 4: Lead Status & Assignment */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
                <UserCheck className="w-4 h-4 text-[#008770]" />
                <span>4. Lead Status & Follow-Up Assignment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assigned Instructor / Staff
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Internal Follow-Up Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Record notes on student availability, pricing quoted, logbook hours completed, or follow-up attempts..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
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
                Back to Inquiries
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-75"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: STUDENT PROFILE, QUICK ACTIONS & CONVERSION (4 COLS) */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            {/* Student Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500">
                  Student Lead Profile
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    form.status === "new"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : form.status === "contacted"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : form.status === "converted"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {form.status.toUpperCase()}
                </span>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center font-black text-xl shadow-2xs">
                  {form.name ? form.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base leading-tight">
                    {form.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{form.suburb || "Parramatta NSW"}</span>
                  </div>
                </div>
              </div>

              {/* One-Click Direct Communication Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${form.phone}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Student</span>
                </a>

                <a
                  href={`mailto:${form.email}?subject=Driving%20Lesson%20Inquiry%20-%20EZY%202%20LEARN`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#07345B]" />
                  <span>Email Student</span>
                </a>
              </div>

              {/* BIG CTA: Convert into Official Booking */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={`/bookings/create?student_name=${encodeURIComponent(
                    form.name
                  )}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(
                    form.phone
                  )}&suburb=${encodeURIComponent(form.suburb)}&service=${encodeURIComponent(
                    form.lesson_type
                  )}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs shadow-xs transition-all text-center"
                >
                  <span>✓ Convert into Official Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[10px] text-slate-400 text-center font-medium mt-2">
                  Pre-fills student name, contact, suburb & package in booking studio
                </p>
              </div>
            </div>

            {/* Quick Metadata Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Inquiry ID:</span>
                <span className="font-mono font-bold text-slate-800">INQ-#{id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Received Date:</span>
                <span className="font-medium text-slate-800">{formatDate(form.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Handler:</span>
                <span className="font-bold text-slate-800">{form.assigned_to}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Delete Inquiry"
          message={`Are you sure you want to permanently delete the inquiry from "${form.name}"? This cannot be undone.`}
          confirmLabel="Yes, Delete Inquiry"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setDeleteModalOpen(false)}
        />

        {/* Success Toast */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0B1528] text-white font-heading font-bold text-xs px-5 py-3 rounded-2xl shadow-xl border border-[#FAB10B]/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#FAB10B]" />
            <span>{successToast}</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
