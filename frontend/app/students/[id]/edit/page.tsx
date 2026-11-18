"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  GraduationCap,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string;

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/students/${studentId}`);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          name: d.name || "",
          email: d.email || "",
          phone: d.phone || "",
          licence_number: d.licence_number || "",
          licence_stage: d.licence_stage || "learner",
          suburb: d.suburb || "Parramatta",
          postcode: d.postcode || "2150",
          preferred_transmission: d.preferred_transmission || "automatic",
          status: d.status || "active",
        });
      } else {
        setErrorMsg("Student not found");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load student");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Please provide student name and email.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch(`/api/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (res.success) {
        router.push("/students");
      } else {
        setErrorMsg(res?.message || "Failed to update student");
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update student");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-slate-500 font-bold">
          Loading student details...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl mx-auto pb-20 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/students"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Students</span>
          </Link>
        </div>

        {/* Main Card with Navy Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
          <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#FAB10B]" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-black text-white tracking-tight">
                  Edit Student Details
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Update student profile, licence stage, address, and status
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

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                1. Student Profile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Preferred Transmission
                  </label>
                  <select
                    value={form.preferred_transmission}
                    onChange={(e) => setForm({ ...form, preferred_transmission: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Licence Details */}
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                2. Licence & Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Licence Stage
                  </label>
                  <select
                    value={form.licence_stage}
                    onChange={(e) => setForm({ ...form, licence_stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="learner">Learner (L Plates)</option>
                    <option value="provisional_p1">Provisional P1 (Red P)</option>
                    <option value="provisional_p2">Provisional P2 (Green P)</option>
                    <option value="full">Full Licence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    NSW Licence Number
                  </label>
                  <input
                    type="text"
                    value={form.licence_number}
                    onChange={(e) => setForm({ ...form, licence_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Home Suburb
                  </label>
                  <input
                    type="text"
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
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-800 font-bold mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
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
                <span>{submitting ? "Updating..." : "Update Student"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
