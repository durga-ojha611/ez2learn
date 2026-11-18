"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  UserCheck,
  Check,
  X,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  Car,
  Award,
} from "lucide-react";

export default function CreateInstructorPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    rms_instructor_id: "",
    transmission_type: "both",
    vehicle_model: "2024 Toyota Corolla Hybrid (Dual Controls)",
    service_suburbs: "Parramatta, Blacktown, Castle Hill",
    hourly_rate_aud: 80,
    status: "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Please provide instructor name and email.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch("/api/instructors", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.success) {
        router.push("/instructors");
      } else {
        setErrorMsg(res?.message || "Failed to create instructor");
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create instructor");
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-7xl pb-20 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/instructors"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Instructors</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Instructor Onboarding • Dedicated Page
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
                    <UserCheck className="w-5 h-5 text-[#FAB10B]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-black text-white tracking-tight">
                      Add New Instructor
                    </h1>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Onboard an RMS-certified driving instructor and configure vehicle specs
                    </p>
                  </div>
                </div>
                <Link
                  href="/instructors"
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

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Instructor Profile
                  </h3>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Michael Zhang"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="michael.zhang@ezy2learn.com.au"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+61 400 987 654"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Accreditation & Vehicle */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Accreditation & Vehicle Setup
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        RMS Driving Instructor ID / Accreditation
                      </label>
                      <input
                        type="text"
                        placeholder="RMS-NSW-9281"
                        value={form.rms_instructor_id}
                        onChange={(e) => setForm({ ...form, rms_instructor_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Transmission Capability
                      </label>
                      <div className="relative">
                        <select
                          value={form.transmission_type}
                          onChange={(e) =>
                            setForm({ ...form, transmission_type: e.target.value })
                          }
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                        >
                          <option value="both">Both (Manual & Automatic)</option>
                          <option value="automatic">Automatic Only</option>
                          <option value="manual">Manual Only</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Training Vehicle Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2024 Toyota Corolla Hybrid (Dual Controls)"
                      value={form.vehicle_model}
                      onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Service Regions */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Service Areas & Rates
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Service Suburbs (Comma Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Parramatta, Blacktown, Castle Hill"
                        value={form.service_suburbs}
                        onChange={(e) => setForm({ ...form, service_suburbs: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Base Hourly Rate ($ AUD)
                      </label>
                      <input
                        type="number"
                        placeholder="80"
                        value={form.hourly_rate_aud}
                        onChange={(e) =>
                          setForm({ ...form, hourly_rate_aud: parseInt(e.target.value, 10) || 80 })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href="/instructors"
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
                    <span>{submitting ? "Saving..." : "Add Instructor"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE INSTRUCTOR PROFILE PREVIEW */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
                <span>Live Instructor Card Preview</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Preview
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 border-2 border-[#FAB10B] flex items-center justify-center font-heading font-black text-2xl text-[#0B1528]">
                {form.name ? form.name.charAt(0).toUpperCase() : "I"}
              </div>

              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  {form.name || "Instructor Name Placeholder"}
                </h3>
                <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  RMS Certified Trainer
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{form.email || "email@ezy2learn.com.au"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{form.vehicle_model}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>${form.hourly_rate_aud}/hr • {form.transmission_type.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
