"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  GraduationCap,
  Check,
  X,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function CreateStudentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    licence_number: "",
    licence_stage: "learner",
    suburb: "Parramatta",
    postcode: "2150",
    preferred_transmission: "automatic",
    status: "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Please provide student name and email.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch("/api/students", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.success) {
        router.push("/students");
      } else {
        setErrorMsg(res?.message || "Failed to create student");
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create student");
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-7xl pb-20 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/students"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Students</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Student Enrolment • Dedicated Page
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
                    <GraduationCap className="w-5 h-5 text-[#FAB10B]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-black text-white tracking-tight">
                      Add New Student
                    </h1>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Register a learner driver, contact details, and licence status
                    </p>
                  </div>
                </div>
                <Link
                  href="/students"
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
                    Personal Information
                  </h3>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Smith"
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
                        placeholder="jordan.smith@gmail.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Mobile Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+61 400 123 456"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Licence Information */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Licence & Training Stage
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Licence Number
                      </label>
                      <input
                        type="text"
                        placeholder="98765432"
                        value={form.licence_number}
                        onChange={(e) => setForm({ ...form, licence_number: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Licence Stage
                      </label>
                      <div className="relative">
                        <select
                          value={form.licence_stage}
                          onChange={(e) => setForm({ ...form, licence_stage: e.target.value })}
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                        >
                          <option value="learner">L - Learner</option>
                          <option value="p1">P1 - Red P Plate</option>
                          <option value="p2">P2 - Green P Plate</option>
                          <option value="full">Full Licence</option>
                          <option value="international">Overseas Conversion</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Preferred Transmission
                      </label>
                      <div className="relative">
                        <select
                          value={form.preferred_transmission}
                          onChange={(e) =>
                            setForm({ ...form, preferred_transmission: e.target.value })
                          }
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                        >
                          <option value="automatic">Automatic</option>
                          <option value="manual">Manual</option>
                          <option value="both">Both</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Location & Suburb
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Suburb
                      </label>
                      <input
                        type="text"
                        placeholder="Parramatta"
                        value={form.suburb}
                        onChange={(e) => setForm({ ...form, suburb: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Postcode
                      </label>
                      <input
                        type="text"
                        placeholder="2150"
                        value={form.postcode}
                        onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href="/students"
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
                    <span>{submitting ? "Saving..." : "Add Student"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE STUDENT PROFILE PREVIEW */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
                <span>Live Student Card Preview</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Preview
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 border-2 border-[#FAB10B] flex items-center justify-center font-heading font-black text-2xl text-[#0B1528]">
                {form.name ? form.name.charAt(0).toUpperCase() : "S"}
              </div>

              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  {form.name || "Student Name Placeholder"}
                </h3>
                <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#0B1528] text-[#FAB10B] capitalize">
                  {form.licence_stage} Licence
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{form.email || "email@example.com"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{form.phone || "+61 400 000 000"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{form.suburb} NSW {form.postcode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
