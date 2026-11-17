"use client";

import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Modal } from "@/components/common/Modal";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { AdminUser } from "@/types";
import {
  Upload,
  Plus,
  Trash2,
  Lock,
  Check,
  Clock,
  CreditCard,
  ShieldCheck,
  Bell,
  Globe,
  Sliders,
  Calendar,
  Layers,
  Key,
  Users,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "business_hours" | "lessons" | "notifications" | "payments" | "integrations" | "security"
  >("general");

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State strictly matching Reference Image
  const [formData, setFormData] = useState({
    // Business Profile
    school_name: "Apex Driving School",
    contact_email: "contact@apexdriving.com.au",
    phone: "+61 411 987 654",
    website: "https://apexdriving.com.au",
    logo_url: "",

    // Lessons & Bookings
    default_lesson_length: "1 hour",
    buffer_between_lessons: "None",
    free_cancellation_window: "24 hours",
    booking_horizon: "4 weeks",
    require_approval_new_students: false,
    allow_students_reschedule_online: true,

    // Notifications
    booking_confirmations: true,
    lesson_reminders: true,
    new_review_alerts: true,
    weekly_summary: false,

    // Business Hours
    monday_hours: "08:00 - 18:00",
    tuesday_hours: "08:00 - 18:00",
    wednesday_hours: "08:00 - 18:00",
    thursday_hours: "08:00 - 18:00",
    friday_hours: "08:00 - 18:00",
    saturday_hours: "09:00 - 15:00",
    sunday_hours: "Closed",

    // Payments
    currency: "AUD",
    gst_percentage: "10",
    stripe_enabled: true,
    payid_enabled: true,
    cash_enabled: true,
  });

  // Keep backup copy for discard
  const [initialData, setInitialData] = useState({ ...formData });

  // Admin Users for Security tab
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 2,
    phone: "",
    status: "active",
  });

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await apiFetch("/api/settings");
      if (res.success && res.data) {
        const loaded = {
          ...formData,
          school_name: res.data.school_name || res.data.business_name || "Apex Driving School",
          contact_email: res.data.contact_email || res.data.business_email || "contact@apexdriving.com.au",
          phone: res.data.phone || res.data.business_phone || "+61 411 987 654",
          website: res.data.website || "https://apexdriving.com.au",
          logo_url: res.data.logo_url || "",
          default_lesson_length: res.data.default_lesson_length || "1 hour",
          buffer_between_lessons: res.data.buffer_between_lessons || "None",
          free_cancellation_window: res.data.free_cancellation_window || "24 hours",
          booking_horizon: res.data.booking_horizon || "4 weeks",
          require_approval_new_students: res.data.require_approval_new_students === "1" || res.data.require_approval_new_students === true,
          allow_students_reschedule_online: res.data.allow_students_reschedule_online !== "0" && res.data.allow_students_reschedule_online !== false,
          booking_confirmations: res.data.booking_confirmations !== "0" && res.data.booking_confirmations !== false,
          lesson_reminders: res.data.lesson_reminders !== "0" && res.data.lesson_reminders !== false,
          new_review_alerts: res.data.new_review_alerts !== "0" && res.data.new_review_alerts !== false,
          weekly_summary: res.data.weekly_summary === "1" || res.data.weekly_summary === true,
        };
        setFormData(loaded);
        setInitialData(loaded);
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await apiFetch("/api/settings/users");
      if (res.success) {
        setUsers(res.data?.users || []);
        setRoles(res.data?.roles || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleDiscard = () => {
    setFormData({ ...initialData });
    setHasChanges(false);
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        ...formData,
        require_approval_new_students: formData.require_approval_new_students ? "1" : "0",
        allow_students_reschedule_online: formData.allow_students_reschedule_online ? "1" : "0",
        booking_confirmations: formData.booking_confirmations ? "1" : "0",
        lesson_reminders: formData.lesson_reminders ? "1" : "0",
        new_review_alerts: formData.new_review_alerts ? "1" : "0",
        weekly_summary: formData.weekly_summary ? "1" : "0",
      };

      await apiFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setInitialData({ ...formData });
      setHasChanges(false);
      alert("Settings and rules updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apex_settings_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          handleChange("logo_url", uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/settings/users", {
        method: "POST",
        body: JSON.stringify(userForm),
      });
      setUserModalOpen(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Delete this admin user?")) return;
    try {
      await apiFetch(`/api/settings/users/${id}`, { method: "DELETE" });
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  // Sleek Pill Toggle Switch Component matching Reference Image
  const ToggleSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative shrink-0 p-0.5 focus:outline-none ${
        checked ? "bg-[#0B1528]" : "bg-slate-300"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-24">
        {/* Page Title & Top Actions matching Reference Image */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              Settings
            </h1>
            <p className="font-sans font-medium text-sm text-slate-500 mt-1">
              Manage your school's profile, rules and notifications.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-heading font-bold text-sm shadow-2xs transition-all"
            >
              <span>Export</span>
            </button>

            <button
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all disabled:opacity-75"
            >
              <span>{saving ? "Saving..." : "Save changes"}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout matching Reference Image */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* LEFT SIDEBAR: Vertical Tab Card matching Reference Image */}
          <div className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-2xs space-y-1">
            {[
              { key: "general", label: "General" },
              { key: "business_hours", label: "Business hours" },
              { key: "lessons", label: "Lessons & bookings" },
              { key: "notifications", label: "Notifications" },
              { key: "payments", label: "Payments" },
              { key: "integrations", label: "Integrations" },
              { key: "security", label: "Security" },
            ].map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full text-left font-heading font-bold text-sm px-4 py-2.5 rounded-xl transition-all block ${
                    isSelected
                      ? "bg-[#0B1528] text-white shadow-2xs"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* RIGHT / MAIN CONTENT AREA */}
          <div className="flex-1 w-full space-y-6">
            {/* TAB 1: GENERAL (Contains all 3 Cards exactly as shown in Reference Image) */}
            {(activeTab === "general" || activeTab === "lessons" || activeTab === "notifications") && (
              <>
                {/* CARD 1: Business Profile strictly matching Reference Image */}
                {activeTab === "general" && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                    <div>
                      <h2 className="font-heading font-black text-lg text-slate-900">
                        Business profile
                      </h2>
                      <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                        This information appears on invoices and booking emails.
                      </p>
                    </div>

                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                      {/* Logo Box */}
                      <div className="w-14 h-14 rounded-2xl bg-[#0B1528] flex items-center justify-center text-[#FAB10B] shrink-0 font-heading font-black text-2xl shadow-2xs overflow-hidden">
                        {formData.logo_url ? (
                          <img
                            src={formData.logo_url}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>a</span>
                        )}
                      </div>

                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900">
                          Logo
                        </div>
                        <div className="font-sans text-xs text-slate-400 font-medium mt-0.5">
                          PNG or SVG, at least 256 × 256 px.
                        </div>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-heading font-bold text-xs text-slate-700 shadow-2xs transition-colors"
                        >
                          <Upload className="h-3.5 w-3.5 text-slate-400" />
                          <span>Upload new</span>
                        </button>
                      </div>
                    </div>

                    {/* 2x2 Form Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          School name
                        </label>
                        <input
                          type="text"
                          value={formData.school_name}
                          onChange={(e) => handleChange("school_name", e.target.value)}
                          placeholder="Apex Driving School"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Contact email
                        </label>
                        <input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleChange("contact_email", e.target.value)}
                          placeholder="[contact email]"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="[phone number]"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Website
                        </label>
                        <input
                          type="text"
                          value={formData.website}
                          onChange={(e) => handleChange("website", e.target.value)}
                          placeholder="[website url]"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD 2: Lessons & Bookings strictly matching Reference Image */}
                {(activeTab === "general" || activeTab === "lessons") && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                    <div>
                      <h2 className="font-heading font-black text-lg text-slate-900">
                        Lessons & bookings
                      </h2>
                      <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                        Defaults applied to every new booking.
                      </p>
                    </div>

                    {/* 2x2 Dropdown Select Grid with Hints */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Default lesson length
                        </label>
                        <select
                          value={formData.default_lesson_length}
                          onChange={(e) => handleChange("default_lesson_length", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        >
                          <option value="45 minutes">45 minutes</option>
                          <option value="1 hour">1 hour</option>
                          <option value="1.5 hours">1.5 hours</option>
                          <option value="2 hours">2 hours</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Buffer between lessons
                        </label>
                        <select
                          value={formData.buffer_between_lessons}
                          onChange={(e) => handleChange("buffer_between_lessons", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        >
                          <option value="None">None</option>
                          <option value="15 minutes">15 minutes</option>
                          <option value="30 minutes">30 minutes</option>
                          <option value="45 minutes">45 minutes</option>
                        </select>
                        <span className="font-sans text-xs text-slate-400 font-medium mt-1 block">
                          Travel time for instructors.
                        </span>
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Free cancellation window
                        </label>
                        <select
                          value={formData.free_cancellation_window}
                          onChange={(e) => handleChange("free_cancellation_window", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        >
                          <option value="12 hours">12 hours</option>
                          <option value="24 hours">24 hours</option>
                          <option value="48 hours">48 hours</option>
                          <option value="72 hours">72 hours</option>
                        </select>
                        <span className="font-sans text-xs text-slate-400 font-medium mt-1 block">
                          Later cancellations may be charged.
                        </span>
                      </div>

                      <div>
                        <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                          Booking horizon
                        </label>
                        <select
                          value={formData.booking_horizon}
                          onChange={(e) => handleChange("booking_horizon", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10 focus:border-[#07345B] transition-all"
                        >
                          <option value="2 weeks">2 weeks</option>
                          <option value="4 weeks">4 weeks</option>
                          <option value="8 weeks">8 weeks</option>
                          <option value="12 weeks">12 weeks</option>
                        </select>
                        <span className="font-sans text-xs text-slate-400 font-medium mt-1 block">
                          How far ahead students can book.
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switches strictly matching Reference Image */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                            Require approval for new students
                          </span>
                          <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                            A scheduler confirms the first lesson.
                          </span>
                        </div>
                        <ToggleSwitch
                          checked={formData.require_approval_new_students}
                          onChange={(val) => handleChange("require_approval_new_students", val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                            Allow students to reschedule online
                          </span>
                          <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                            Within the free cancellation window.
                          </span>
                        </div>
                        <ToggleSwitch
                          checked={formData.allow_students_reschedule_online}
                          onChange={(val) => handleChange("allow_students_reschedule_online", val)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CARD 3: Notifications strictly matching Reference Image */}
                {(activeTab === "general" || activeTab === "notifications") && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
                    <div>
                      <h2 className="font-heading font-black text-lg text-slate-900">
                        Notifications
                      </h2>
                      <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                        Choose when your team and students are contacted.
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                            Booking confirmations
                          </span>
                          <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                            Email students as soon as a lesson is booked.
                          </span>
                        </div>
                        <ToggleSwitch
                          checked={formData.booking_confirmations}
                          onChange={(val) => handleChange("booking_confirmations", val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                            Lesson reminders
                          </span>
                          <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                            Send a reminder 24 hours before each lesson.
                          </span>
                        </div>
                        <ToggleSwitch
                          checked={formData.lesson_reminders}
                          onChange={(val) => handleChange("lesson_reminders", val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                            New review alerts
                          </span>
                          <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                            Notify admins when a review is submitted.
                          </span>
                        </div>
                        <ToggleSwitch
                          checked={formData.new_review_alerts}
                          onChange={(val) => handleChange("new_review_alerts", val)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                            Weekly summary
                          </span>
                          <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                            A Monday email with bookings, revenue and reviews.
                          </span>
                        </div>
                        <ToggleSwitch
                          checked={formData.weekly_summary}
                          onChange={(val) => handleChange("weekly_summary", val)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB: BUSINESS HOURS */}
            {activeTab === "business_hours" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                <div>
                  <h2 className="font-heading font-black text-lg text-slate-900">
                    Business operating hours
                  </h2>
                  <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                    Configure dispatch times and instructor availability windows across NSW.
                  </p>
                </div>

                <div className="space-y-3 font-sans text-sm">
                  {[
                    { day: "Monday", field: "monday_hours" },
                    { day: "Tuesday", field: "tuesday_hours" },
                    { day: "Wednesday", field: "wednesday_hours" },
                    { day: "Thursday", field: "thursday_hours" },
                    { day: "Friday", field: "friday_hours" },
                    { day: "Saturday", field: "saturday_hours" },
                    { day: "Sunday", field: "sunday_hours" },
                  ].map(({ day, field }) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <span className="font-heading font-bold text-sm text-slate-900 w-32">
                        {day}
                      </span>
                      <input
                        type="text"
                        value={(formData as any)[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === "payments" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                <div>
                  <h2 className="font-heading font-black text-lg text-slate-900">
                    Payments & invoicing
                  </h2>
                  <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                    Configure payment gateways, tax calculation, and Australian merchant accounts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                      Currency
                    </label>
                    <input
                      type="text"
                      disabled
                      value="AUD ($ Australian Dollar)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block font-heading font-bold text-xs text-slate-700 mb-1.5">
                      GST Percentage (%)
                    </label>
                    <input
                      type="text"
                      value={formData.gst_percentage}
                      onChange={(e) => handleChange("gst_percentage", e.target.value)}
                      placeholder="10"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#07345B]/10"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                        Stripe Credit / Debit Card Gateway
                      </span>
                      <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                        Allow online card payments with 3D Secure verification.
                      </span>
                    </div>
                    <ToggleSwitch
                      checked={formData.stripe_enabled}
                      onChange={(val) => handleChange("stripe_enabled", val)}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="font-heading font-bold text-sm text-slate-900 block leading-tight">
                        PayID & Direct Bank Transfer
                      </span>
                      <span className="font-sans text-xs text-slate-400 font-medium mt-0.5 block">
                        Provide bank BSB and Account Number on invoices.
                      </span>
                    </div>
                    <ToggleSwitch
                      checked={formData.payid_enabled}
                      onChange={(val) => handleChange("payid_enabled", val)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTEGRATIONS */}
            {activeTab === "integrations" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                <div>
                  <h2 className="font-heading font-black text-lg text-slate-900">
                    Connected integrations
                  </h2>
                  <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                    Sync student bookings with external calendars and regulatory systems.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 flex items-start justify-between">
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900">
                        Google Calendar
                      </div>
                      <div className="font-sans text-xs text-slate-400 font-medium mt-0.5">
                        2-way sync with instructor schedules.
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-heading font-bold text-xs">
                      Connected
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 flex items-start justify-between">
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900">
                        Transport for NSW Logbook
                      </div>
                      <div className="font-sans text-xs text-slate-400 font-medium mt-0.5">
                        RMS 3-for-1 structured hours verification.
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-heading font-bold text-xs">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY & ADMIN USERS */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-heading font-black text-lg text-slate-900">
                        Admin accounts & access
                      </h2>
                      <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                        Manage privileged users, credentials, and role permissions.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserForm({
                          name: "",
                          email: "",
                          password: "password123",
                          role_id: 2,
                          phone: "+61 400 000 000",
                          status: "active",
                        });
                        setUserModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0B1528] text-white font-heading font-bold text-xs hover:bg-[#07345B] transition-colors shadow-2xs"
                    >
                      + Add admin user
                    </button>
                  </div>

                  {/* Clean Admin Users Table strictly matching Reference Image */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-heading font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3.5 pr-4 pl-2">Admin User</th>
                          <th className="pb-3.5 px-4">Status</th>
                          <th className="pb-3.5 px-4">Role</th>
                          <th className="pb-3.5 px-4">Phone</th>
                          <th className="pb-3.5 pl-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 pr-4 pl-2 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-[#0B1528] text-white font-heading font-black text-xs flex items-center justify-center shrink-0">
                                  {u.name?.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-heading font-black text-sm text-slate-900 block leading-tight">
                                    {u.name}
                                  </span>
                                  <span className="font-sans text-xs text-slate-500 font-medium block mt-0.5">
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              {u.status === "active" ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] font-heading font-bold text-xs">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-heading font-bold text-xs">
                                  Inactive
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="font-heading font-bold text-xs text-slate-800">
                                {u.role_display_name || u.role_name}
                              </span>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="font-sans text-xs text-slate-600">
                                {u.phone || "—"}
                              </span>
                            </td>

                            <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* FLOATING / STICKY BOTTOM BAR strictly matching Reference Image */}
            <div className="bg-[#0B1528] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800/80">
              <span className="font-heading font-bold text-sm text-white">
                You have unsaved changes
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-4 py-2 rounded-xl text-white hover:text-slate-300 font-heading font-bold text-sm transition-colors"
                >
                  Discard
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#E5A10A] text-slate-950 font-heading font-black text-sm transition-colors shadow-2xs disabled:opacity-75"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Admin User Modal */}
        <Modal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          title="Add New Admin Staff Account"
          subtitle="Provision staff access with role-based permissions."
          maxWidth="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="e.g. Kevin Zhao"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="kevin@apexdriving.com.au"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-heading font-bold text-slate-700 uppercase mb-1">
                  Assigned Role
                </label>
                <select
                  value={userForm.role_id}
                  onChange={(e) => setUserForm({ ...userForm, role_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold hover:bg-[#07345B]"
              >
                Create Account
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
