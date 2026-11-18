"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  CalendarCheck2,
  Inbox,
  UserCheck,
  GraduationCap,
  CalendarClock,
  Layers,
  CreditCard,
  MapPin,
  Star,
  Newspaper,
  Globe,
  Bell,
  Settings,
  Sparkles,
  KeyRound,
  RotateCw,
  Clock,
  ExternalLink,
} from "lucide-react";

export interface SectionDefinition {
  key: string;
  name: string;
  icon: string;
  description: string;
  group: string;
}

export interface SubAdminUser {
  id: number;
  role_id: number;
  name: string;
  email: string;
  phone?: string;
  status: "active" | "suspended" | "inactive";
  accessible_sections: string[];
  last_login_at?: string;
  created_at: string;
  role_name: string;
  role_display_name: string;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  bookings: CalendarCheck2,
  inquiries: Inbox,
  instructors: UserCheck,
  students: GraduationCap,
  calendar: CalendarClock,
  services: Layers,
  payments: CreditCard,
  locations: MapPin,
  reviews: Star,
  blogs: Newspaper,
  website_content: Globe,
  notifications: Bell,
  settings: Settings,
};

const DEFAULT_SECTIONS: SectionDefinition[] = [
  {
    key: "dashboard",
    name: "Dashboard Overview",
    icon: "LayoutDashboard",
    description: "Real-time KPIs, revenue stats, today schedule & system alerts",
    group: "OVERVIEW",
  },
  {
    key: "bookings",
    name: "Bookings Management",
    icon: "CalendarCheck2",
    description: "Create, reschedule, cancel lessons, and assign instructors",
    group: "MANAGEMENT",
  },
  {
    key: "inquiries",
    name: "Inquiries & Student Leads",
    icon: "Inbox",
    description: "Manage incoming student quotes, leads, and booking conversions",
    group: "MANAGEMENT",
  },
  {
    key: "instructors",
    name: "Instructors Directory",
    icon: "UserCheck",
    description: "Instructor profiles, dual-control cars, working hours & RMS licences",
    group: "MANAGEMENT",
  },
  {
    key: "students",
    name: "Customers / Students Directory",
    icon: "GraduationCap",
    description: "Learner profiles, lesson balance records, logbooks & emergency contacts",
    group: "MANAGEMENT",
  },
  {
    key: "calendar",
    name: "Schedule & Calendar",
    icon: "CalendarClock",
    description: "Weekly and monthly timetable slots, driving tests & car availability",
    group: "MANAGEMENT",
  },
  {
    key: "services",
    name: "Services & Packages",
    icon: "Layers",
    description: "Lesson pricing, beginner multi-packs & RMS test packages",
    group: "BUSINESS",
  },
  {
    key: "payments",
    name: "Payments & Invoices",
    icon: "CreditCard",
    description: "Australian Tax Invoices, Stripe transactions & bank remittances",
    group: "BUSINESS",
  },
  {
    key: "locations",
    name: "Locations & Suburbs",
    icon: "MapPin",
    description: "Operating service regions, pickup postcodes & RMS test centers",
    group: "BUSINESS",
  },
  {
    key: "reviews",
    name: "Reviews & Ratings",
    icon: "Star",
    description: "Student testimonials, star ratings & public approval moderation",
    group: "BUSINESS",
  },
  {
    key: "blogs",
    name: "Blog Management",
    icon: "Newspaper",
    description: "Publish and edit student driving guides, RMS road rules & articles",
    group: "WEBSITE MANAGEMENT",
  },
  {
    key: "website_content",
    name: "Website Content & CMS",
    icon: "Globe",
    description: "Edit marketing pages, FAQs, student pass gallery & school policies",
    group: "WEBSITE MANAGEMENT",
  },
  {
    key: "notifications",
    name: "System Notifications",
    icon: "Bell",
    description: "Operational system alerts, booking changes and instructor licence renewals",
    group: "SYSTEM",
  },
  {
    key: "settings",
    name: "Settings & Business Profile",
    icon: "Settings",
    description: "Australian school details, ABN, banking PayID, SMTP emails & Sub-Admin management",
    group: "SYSTEM",
  },
];

export const SubAdminManager: React.FC = () => {
  const [subadmins, setSubadmins] = useState<SubAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableSections, setAvailableSections] = useState<SectionDefinition[]>(DEFAULT_SECTIONS);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubAdminUser | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    status: "active" as "active" | "suspended",
    accessible_sections: ["dashboard", "bookings", "calendar", "students", "inquiries"] as string[],
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadSubadmins();
  }, []);

  const loadSubadmins = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/subadmins");
      if (res.success && res.data) {
        setSubadmins(res.data.subadmins || []);
        if (res.data.available_sections) {
          setAvailableSections(res.data.available_sections);
        }
      }
    } catch (err: any) {
      console.warn("Could not load sub-admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      password: "password123",
      status: "active",
      accessible_sections: ["dashboard", "bookings", "calendar", "students", "inquiries"],
    });
    setShowPassword(false);
    setShowForm(true);
  };

  const handleOpenEdit = (user: SubAdminUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // blank means don't change
      status: user.status === "suspended" ? "suspended" : "active",
      accessible_sections: user.accessible_sections || [],
    });
    setShowPassword(false);
    setShowForm(true);
  };

  const handleToggleSection = (sectionKey: string) => {
    setForm((prev) => {
      const exists = prev.accessible_sections.includes(sectionKey);
      if (exists) {
        // Remove
        return {
          ...prev,
          accessible_sections: prev.accessible_sections.filter((k) => k !== sectionKey),
        };
      } else {
        // Add
        return {
          ...prev,
          accessible_sections: [...prev.accessible_sections, sectionKey],
        };
      }
    });
  };

  const handleSelectAll = () => {
    setForm((prev) => ({
      ...prev,
      accessible_sections: availableSections.map((s) => s.key),
    }));
  };

  const handleClearAll = () => {
    setForm((prev) => ({
      ...prev,
      accessible_sections: ["dashboard"],
    }));
  };

  const handleApplyPreset = (preset: "operations" | "finance" | "marketing") => {
    if (preset === "operations") {
      setForm((prev) => ({
        ...prev,
        accessible_sections: ["dashboard", "bookings", "inquiries", "students", "calendar"],
      }));
    } else if (preset === "finance") {
      setForm((prev) => ({
        ...prev,
        accessible_sections: ["dashboard", "payments", "reviews"],
      }));
    } else if (preset === "marketing") {
      setForm((prev) => ({
        ...prev,
        accessible_sections: ["dashboard", "blogs", "website_content", "reviews"],
      }));
    }
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
    showToast("Strong password generated");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast("Please enter sub-admin name", "error");
      return;
    }
    if (!form.email.trim()) {
      showToast("Please enter sub-admin email", "error");
      return;
    }

    if (!editingId && (!form.password || form.password.length < 6)) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (form.accessible_sections.length === 0) {
      showToast("Please tick at least one accessible sidebar section", "error");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        // Update
        const payload: any = {
          name: form.name,
          email: form.email,
          status: form.status,
          accessible_sections: form.accessible_sections,
        };
        if (form.password) {
          payload.password = form.password;
        }

        const res = await apiFetch(`/api/subadmins/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (res.success) {
          showToast(`Sub-admin "${form.name}" updated successfully`);
          setShowForm(false);
          loadSubadmins();
        } else {
          showToast(res.message || "Failed to update sub-admin", "error");
        }
      } else {
        // Create
        const res = await apiFetch("/api/subadmins", {
          method: "POST",
          body: JSON.stringify(form),
        });

        if (res.success) {
          showToast(`New Sub-Admin account created for ${form.email}`);
          setShowForm(false);
          loadSubadmins();
        } else {
          showToast(res.message || "Failed to create sub-admin", "error");
        }
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: SubAdminUser) => {
    if (user.id === 1) {
      showToast("Super Admin cannot be suspended", "error");
      return;
    }

    const nextStatus = user.status === "active" ? "suspended" : "active";
    try {
      const res = await apiFetch(`/api/subadmins/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.success) {
        showToast(
          `Sub-Admin ${user.name} is now ${nextStatus === "active" ? "Activated" : "Suspended"}`
        );
        loadSubadmins();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to toggle status", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiFetch(`/api/subadmins/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast(`Sub-admin ${deleteTarget.name} deleted`);
        setDeleteTarget(null);
        loadSubadmins();
      } else {
        showToast(res.message || "Failed to delete sub-admin", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete sub-admin", "error");
    }
  };

  const formatLoginDate = (dateStr?: string) => {
    if (!dateStr) return "Never logged in";
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

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & KPI STATS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008770] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl text-slate-900 tracking-tight">
                  Sub-Admins & Role Permissions
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Access Control
                </span>
              </div>
              <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                Create sub-administrator accounts with unique emails & passwords, and tick the exact sidebar options each sub-admin can view.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FAB10B]" />
            <span>+ Create Sub-Admin</span>
          </button>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-medium block">Total Admin Accounts</span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                {subadmins.length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold">
              👥
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between">
            <div>
              <span className="text-emerald-700 font-medium block">Active Sub-Admins</span>
              <span className="text-2xl font-black text-emerald-800 mt-0.5 block">
                {subadmins.filter((u) => u.status === "active").length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
            <div>
              <span className="text-amber-800 font-medium block">Suspended / Inactive</span>
              <span className="text-2xl font-black text-amber-900 mt-0.5 block">
                {subadmins.filter((u) => u.status === "suspended").length}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              ⏸
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-ADMIN CREATOR & EDITOR CARD (CTA Form on Left, Live Interface Preview on Right) */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#008770]" />
                <span>{editingId ? `Edit Sub-Admin Permissions — ${form.name}` : "Create New Sub-Admin Account"}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Set credentials and tick the exact sidebar sections this person will see upon logging in.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 2-COLUMN SPLIT: FORM ON LEFT (7 COLS), LIVE MOCK SIDEBAR ON RIGHT (5 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT SIDE: CREDENTIALS & PERMISSIONS CHECKBOXES (7 COLS) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Account Credentials */}
                <div className="p-4.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700 block">
                    1. Account Credentials & Login Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sarah Jenkins"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Login Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. sarah.j@ezy2learn.com.au"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          {editingId ? "New Password (Leave blank to keep)" : "Password"} <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-[10px] font-bold text-teal-700 hover:underline cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={editingId ? "••••••••" : "Minimum 6 characters"}
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Account Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 cursor-pointer"
                      >
                        <option value="active">Active (Permitted to Log In)</option>
                        <option value="suspended">Suspended (Access Blocked)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. SIDEBAR OPTIONS IN THE FORM OF CHECKBOXES */}
                <div className="p-4.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <span>2. Permitted Sidebar Sections (Checkbox Checklist)</span>
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Tick the sections this sub-admin can see. Unticked options will be completely hidden from their interface.
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("operations")}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 transition-colors cursor-pointer"
                        title="Bookings + Calendar + Students + Inquiries"
                      >
                        Operations
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset("finance")}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors cursor-pointer"
                        title="Payments + Reviews"
                      >
                        Finance
                      </button>
                    </div>
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {availableSections.map((sec) => {
                      const isChecked = form.accessible_sections.includes(sec.key);
                      const Icon = SECTION_ICONS[sec.key] || LayoutDashboard;

                      return (
                        <div
                          key={sec.key}
                          onClick={() => handleToggleSection(sec.key)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                            isChecked
                              ? "bg-white border-[#0B1528] ring-1 ring-[#0B1528]/20 shadow-2xs"
                              : "bg-white/60 border-slate-200 hover:bg-white text-slate-500"
                          }`}
                        >
                          {/* Checkbox Box */}
                          <div
                            className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isChecked
                                ? "bg-[#0B1528] text-white"
                                : "border border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          {/* Icon & Label */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isChecked ? "text-[#008770]" : "text-slate-400"
                                }`}
                              />
                              <span
                                className={`text-xs font-bold truncate ${
                                  isChecked ? "text-slate-900" : "text-slate-600"
                                }`}
                              >
                                {sec.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                              {sec.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-75"
                  >
                    {saving ? "Saving..." : editingId ? "Save Permissions" : "Create Sub-Admin Account"}
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: LIVE MOCK SIDEBAR PREVIEW (5 COLS) */}
              <div className="lg:col-span-5 bg-[#0B1528] rounded-2xl p-4.5 text-white shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FAB10B]" />
                    <span className="font-heading font-black text-xs text-white uppercase tracking-wider">
                      Sub-Admin Live View Simulation
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-blue-200 border border-white/20">
                    {form.accessible_sections.length} / {availableSections.length} Sections
                  </span>
                </div>

                <div className="text-[11px] text-blue-200/80 font-medium">
                  When <strong>{form.email || "this sub-admin"}</strong> logs in, only these permitted options will appear on their screen:
                </div>

                {/* Simulated Mini Sidebar */}
                <div className="bg-[#07345B] rounded-xl p-3 space-y-1.5 border border-white/10 max-h-[400px] overflow-y-auto no-scrollbar">
                  {form.accessible_sections.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      No sections selected. Tick checkboxes on the left.
                    </div>
                  ) : (
                    availableSections
                      .filter((s) => form.accessible_sections.includes(s.key))
                      .map((sec, idx) => {
                        const Icon = SECTION_ICONS[sec.key] || LayoutDashboard;
                        return (
                          <div
                            key={sec.key}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                              idx === 0 ? "bg-white/15 text-white" : "text-slate-300"
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="truncate">{sec.name}</span>
                          </div>
                        );
                      })
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FAB10B]" />
                    <span>Automatic Route Enforcement Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                    If this user attempts to access unticked modules directly via URL, they will be automatically blocked and redirected to permitted sections.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. ACTIVE SUB-ADMINS DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900">
              Admin & Sub-Admin Accounts Directory
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review who has access to the panel, their permitted sections, and their last login activity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSubadmins}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh directory"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">ADMIN / SUB-ADMIN</th>
                <th className="py-3.5 px-4">ROLE</th>
                <th className="py-3.5 px-4 w-1/3">PERMITTED SECTIONS</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">LAST LOGIN</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    Loading sub-admin accounts...
                  </td>
                </tr>
              ) : subadmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    No sub-admin accounts found. Click "+ Create Sub-Admin" above.
                  </td>
                </tr>
              ) : (
                subadmins.map((u) => {
                  const isSuper = u.role_name === "super_admin" || u.id === 1;
                  const sections = u.accessible_sections || [];

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSuper
                                ? "bg-[#0B1528] text-[#FAB10B]"
                                : "bg-teal-50 text-[#008770] border border-teal-200"
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {u.name}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isSuper
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isSuper ? "Super Administrator" : u.role_display_name || "Sub-Admin"}
                        </span>
                      </td>

                      {/* Permitted Sections */}
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <span>✓ Full Access (All 14 Sections)</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {sections.slice(0, 4).map((secKey) => {
                              const found = availableSections.find((s) => s.key === secKey);
                              return (
                                <span
                                  key={secKey}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {found ? found.name.split(" ")[0] : secKey}
                                </span>
                              );
                            })}
                            {sections.length > 4 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                                +{sections.length - 4} more
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium self-center ml-1">
                              ({sections.length} of {availableSections.length})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSuper}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                          } ${isSuper ? "cursor-default opacity-85" : ""}`}
                          title={isSuper ? "Super admin cannot be toggled" : "Click to toggle status"}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span>{u.status === "active" ? "Active" : "Suspended"}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatLoginDate(u.last_login_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Edit
                          </button>

                          {!isSuper && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              className="text-rose-500 hover:text-rose-700 font-bold text-xs hover:underline transition-colors cursor-pointer p-1"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MAIN ADMIN AUDIT & LOGIN ACTIVITY CARD */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#008770]" />
            <span>Login Audit Trail & Security Overview</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Live record of which admin accounts accessed the panel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {subadmins
            .filter((u) => u.last_login_at)
            .slice(0, 4)
            .map((u) => (
              <div
                key={u.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{u.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    ID #{u.id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{u.email}</div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Last session:</span>
                  <span className="font-bold text-slate-700">{formatLoginDate(u.last_login_at)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-black text-lg text-slate-900">
                Delete Sub-Admin Account?
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.email})? This user will no longer be able to log in to the admin panel.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 font-heading font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-[#0B1528] text-white border border-[#FAB10B]/30"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#FAB10B]" />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};
