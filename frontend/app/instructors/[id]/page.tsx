"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Drawer } from "@/components/common/Drawer";
import { apiFetch } from "@/lib/api";
import { formatAUD, formatDate } from "@/lib/utils";
import { Instructor } from "@/types";
import {
  ArrowLeft,
  Car,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle,
  Users,
  Edit,
  MessageSquare,
  Send,
  Smartphone,
  Bell,
} from "lucide-react";

export default function InstructorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const instructorId = params.id as string;

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  // Drawers
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    accreditation_number: "",
    hourly_rate: 75,
    transmission: "automatic" as "automatic" | "manual" | "both",
    status: "active" as "active" | "inactive" | "pending_approval" | "suspended" | "on_leave" | "onboarding",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Message Form State
  const [msgChannel, setMsgChannel] = useState<"sms" | "email" | "in_app">("sms");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [selectedTpl, setSelectedTpl] = useState<string | null>(null);

  useEffect(() => {
    loadInstructor();
  }, [instructorId]);

  useEffect(() => {
    if (instructor) {
      setEditForm({
        name: instructor.name || "",
        email: instructor.email || "",
        phone: instructor.phone || "",
        address: instructor.address || "Parramatta NSW 2150",
        accreditation_number: instructor.accreditation_number || "",
        hourly_rate: instructor.hourly_rate || 75,
        transmission: (instructor.transmission as any) || "automatic",
        status: instructor.status || "active",
      });
      setMsgSubject("Notice from EZY 2 LEARN Driving School");
      setMsgBody(`Hi ${instructor.name}, `);
    }
  }, [instructor]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    await new Promise((r) => setTimeout(r, 600));
    if (instructor) {
      setInstructor({
        ...instructor,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        accreditation_number: editForm.accreditation_number,
        hourly_rate: editForm.hourly_rate,
        transmission: editForm.transmission,
        status: editForm.status,
      });
    }
    alert("Instructor details updated successfully!");
    setSavingEdit(false);
    setEditDrawerOpen(false);
  };

  const handleApplyTpl = (tplKey: string) => {
    if (!instructor) return;
    setSelectedTpl(tplKey);
    if (tplKey === "roster") {
      setMsgBody(`Hi ${instructor.name}, your updated lesson schedule for this week is active. Please review your scheduled students.`);
    } else if (tplKey === "inspection") {
      setMsgBody(`Hi ${instructor.name}, friendly reminder that dual-control vehicle inspection is due this month. Please submit your documentation.`);
    } else if (tplKey === "accreditation") {
      setMsgBody(`Hi ${instructor.name}, reminder: your RMS driving instructor accreditation requires renewal. Please upload renewed documents to maintain active teaching status.`);
    }
  };

  const handleSendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgBody.trim() || !instructor) return;
    setMsgSending(true);
    await new Promise((r) => setTimeout(r, 600));
    alert(`Message delivered to ${instructor.name} via ${msgChannel.toUpperCase()}!`);
    setMsgSending(false);
    setMessageDrawerOpen(false);
  };

  const loadInstructor = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/instructors/${instructorId}`);
      if (res.success) {
        setInstructor(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await apiFetch(`/api/instructors/${instructorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      alert(`Instructor status changed to ${status}`);
      loadInstructor();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-xs text-slate-400">Loading instructor profile...</div>
      </AdminLayout>
    );
  }

  if (!instructor) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-xs text-rose-600">Instructor record not found.</div>
      </AdminLayout>
    );
  }

  const initials = instructor.name
    ? instructor.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "IN";

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/instructors"
            className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Instructors</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMessageDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Message</span>
            </button>
            <button
              onClick={() => setEditDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>

            {instructor.status !== "active" ? (
              <button
                onClick={() => handleStatusChange("active")}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Approve &amp; Activate
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("suspended")}
                className="px-4 py-2 rounded-xl border border-rose-200 text-[#DC2626] font-bold text-xs hover:bg-rose-50 transition-colors"
              >
                Put On Leave
              </button>
            )}

            <button
              onClick={() => router.push(`/calendar?instructor_id=${instructor.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 stroke-[2.5]" />
              <span>Live Roster</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0B1528] text-white flex items-center justify-center text-xs font-bold shadow-sm ml-1">
              AD
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center font-heading font-black text-xl flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {instructor.name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    instructor.status === "active"
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : "bg-[#FEF3C7] text-[#D97706]"
                  }`}
                >
                  {instructor.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                RMS Accreditation: <span className="font-mono font-semibold text-slate-800">{instructor.accreditation_number}</span> · {instructor.experience_years} Years Experience
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                <span>{instructor.email}</span>
                <span>•</span>
                <span>{instructor.phone}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {instructor.rating} ({instructor.total_reviews} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate</span>
              <span className="font-heading font-black text-lg text-slate-900">
                {formatAUD(instructor.hourly_rate)}/hr
              </span>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lessons</span>
              <span className="font-heading font-black text-lg text-slate-900">
                {instructor.stats?.completed_count || 120}
              </span>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pass Rate</span>
              <span className="font-heading font-black text-lg text-emerald-600">
                94%
              </span>
            </div>
          </div>
        </div>

        {/* 4. Instructor Profile 5 Information Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Group 1: Personal Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3">
            <h3 className="font-heading font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              1. Personal Information
            </h3>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Full Name</span>
              <span className="font-bold text-slate-900">{instructor.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Instructor ID</span>
              <span className="font-mono font-bold text-slate-900">#INST-00{instructor.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Email Address</span>
              <span className="font-medium text-slate-800">{instructor.email}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-medium text-slate-800">{instructor.phone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Address</span>
              <span className="font-medium text-slate-800 text-right">
                {instructor.address || "Parramatta, Sydney NSW"}
              </span>
            </div>
          </div>

          {/* Group 2: Professional Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3">
            <h3 className="font-heading font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              2. Professional Information
            </h3>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Licence / Accreditation</span>
              <span className="font-mono font-bold text-slate-900">
                {instructor.accreditation_number}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Licence Expiry Date</span>
              <span className="font-medium text-slate-800">30 Nov 2027</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Years of Experience</span>
              <span className="font-bold text-slate-900">
                {instructor.experience_years} Years Teaching
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Speciality</span>
              <span className="font-bold text-slate-900 capitalize">
                {instructor.transmission} Transmission
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span className="font-bold capitalize text-emerald-600">{instructor.status}</span>
            </div>
          </div>

          {/* Group 3: Vehicle Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3">
            <h3 className="font-heading font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              3. Vehicle Information
            </h3>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Vehicle Make &amp; Model</span>
              <span className="font-bold text-slate-900">
                {instructor.vehicle_year} {instructor.vehicle_make} {instructor.vehicle_model}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Registration Number</span>
              <span className="font-mono font-bold text-slate-900">{instructor.vehicle_rego}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Transmission Type</span>
              <span className="font-semibold text-slate-800 capitalize">
                {instructor.transmission}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Vehicle Type</span>
              <span className="font-semibold text-emerald-600">
                {instructor.ancap_safety_rating}-Star ANCAP · Dual-Control
              </span>
            </div>
          </div>

          {/* Group 4: Working Information */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3">
            <h3 className="font-heading font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              4. Working Information
            </h3>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Service Areas</span>
              <span className="font-semibold text-slate-800 text-right">
                Parramatta, Westmead, Ryde
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Working Days</span>
              <span className="font-medium text-slate-800">Mon, Tue, Wed, Thu, Fri</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Working Hours</span>
              <span className="font-medium text-slate-800">07:00 AM - 06:00 PM</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Active Students</span>
              <span className="font-bold text-slate-900">38 Learners</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Lessons Completed</span>
              <span className="font-bold text-slate-900">
                {instructor.stats?.completed_count || 120} Sessions
              </span>
            </div>
          </div>

          {/* Group 5: Performance & Student Feedback */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-3 md:col-span-2">
            <h3 className="font-heading font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
              5. Performance &amp; Student Feedback
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Rating
                </span>
                <span className="font-heading font-black text-xl text-slate-900 mt-1 flex items-center justify-center gap-1">
                  ★ {instructor.rating}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Reviews
                </span>
                <span className="font-heading font-black text-xl text-slate-900 mt-1 block">
                  {instructor.total_reviews}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Pass Rate
                </span>
                <span className="font-heading font-black text-xl text-emerald-600 mt-1 block">
                  94%
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <p className="text-slate-700 italic">
                "{instructor.teaching_approach ||
                  "Patient and structured driving coach with strong expertise in Sydney RMS test routes and reverse parallel parking."}"
              </p>
            </div>
          </div>
        </div>

        {/* SIDE WINDOW 1: Edit Profile Drawer */}
        <Drawer
          isOpen={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
          title="Edit Instructor Profile"
          subtitle={`${instructor.name} • RMS: ${instructor.accreditation_number}`}
          width="xl"
          icon={<Edit className="w-5 h-5 text-amber-500" />}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  DIA / RMS Accreditation
                </label>
                <input
                  type="text"
                  required
                  value={editForm.accreditation_number}
                  onChange={(e) => setEditForm({ ...editForm, accreditation_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Transmission Endorsement
                </label>
                <select
                  value={editForm.transmission}
                  onChange={(e) => setEditForm({ ...editForm, transmission: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="both">Both (Manual &amp; Automatic)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Hourly Rate ($ AUD)
                </label>
                <input
                  type="number"
                  min={50}
                  max={200}
                  value={editForm.hourly_rate}
                  onChange={(e) => setEditForm({ ...editForm, hourly_rate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditDrawerOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-heading font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-6 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-heading font-bold shadow-xs disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Drawer>

        {/* SIDE WINDOW 2: Message Instructor Drawer */}
        <Drawer
          isOpen={messageDrawerOpen}
          onClose={() => setMessageDrawerOpen(false)}
          title="Message Instructor"
          subtitle={`${instructor.name} • ${instructor.phone} • ${instructor.email}`}
          width="lg"
          icon={<MessageSquare className="w-5 h-5 text-amber-500" />}
        >
          <form onSubmit={handleSendMsg} className="space-y-4 font-sans text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-400 font-medium block">Recipient Instructor</span>
              <span className="font-heading font-bold text-slate-900 text-sm">{instructor.name}</span>
              <div className="text-slate-500 text-xs mt-0.5">{instructor.phone} • {instructor.email}</div>
            </div>

            {/* Communication Channel */}
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1.5">
                Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMsgChannel("sms")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    msgChannel === "sms"
                      ? "bg-[#0B1528] text-white border-[#0B1528] shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setMsgChannel("email")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    msgChannel === "email"
                      ? "bg-[#0B1528] text-white border-[#0B1528] shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setMsgChannel("in_app")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    msgChannel === "in_app"
                      ? "bg-[#0B1528] text-white border-[#0B1528] shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  Notification
                </button>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1.5">
                Quick Operational Templates
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Weekly Schedule", key: "roster" },
                  { label: "Vehicle Inspection", key: "inspection" },
                  { label: "RMS Accreditation", key: "accreditation" },
                ].map((tpl) => (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => handleApplyTpl(tpl.key)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                      selectedTpl === tpl.key
                        ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject (for Email) */}
            {msgChannel === "email" && (
              <div>
                <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none"
                />
              </div>
            )}

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-heading font-bold text-slate-700 uppercase">
                  Message Content *
                </label>
                <span className="text-[10px] text-slate-400">{msgBody.length} characters</span>
              </div>
              <textarea
                rows={6}
                required
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Write your message to instructor..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-[#0B1528]/10 focus:border-[#0B1528] outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMessageDrawerOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-heading font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={msgSending || !msgBody.trim()}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#162238] text-white font-heading font-bold shadow-xs disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{msgSending ? "Sending..." : "Send Message"}</span>
              </button>
            </div>
          </form>
        </Drawer>
      </div>
    </AdminLayout>
  );
}
