"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  UserCheck,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

export default function EditInstructorPage() {
  const router = useRouter();
  const params = useParams();
  const instructorId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    transmission: "automatic",
    hourly_rate_aud: 75.0,
    vehicle_make: "Toyota",
    vehicle_model: "Corolla",
    vehicle_year: 2024,
    vehicle_rego: "EZY-2024",
    vehicle_transmission: "automatic",
    bio: "",
    status: "active",
  });

  useEffect(() => {
    loadInstructor();
  }, [instructorId]);

  const loadInstructor = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/instructors/${instructorId}`);
      if (res.success && res.data) {
        const d = res.data;
        setForm({
          name: d.name || "",
          email: d.email || "",
          phone: d.phone || "",
          gender: d.gender || "male",
          transmission: d.transmission || "automatic",
          hourly_rate_aud: Number(d.hourly_rate_aud) || 75.0,
          vehicle_make: d.vehicle_make || "Toyota",
          vehicle_model: d.vehicle_model || "Corolla",
          vehicle_year: Number(d.vehicle_year) || 2024,
          vehicle_rego: d.vehicle_rego || "EZY-2024",
          vehicle_transmission: d.transmission || "automatic",
          bio: d.bio || "",
          status: d.status || "active",
        });
      } else {
        setErrorMsg("Instructor not found");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load instructor");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Please provide instructor name and email.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch(`/api/instructors/${instructorId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (res.success) {
        router.push("/instructors");
      } else {
        setErrorMsg(res?.message || "Failed to update instructor");
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update instructor");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-slate-500 font-bold">
          Loading instructor details...
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
            href="/instructors"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Instructors</span>
          </Link>
        </div>

        {/* Main Card with Navy Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
          <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[#FAB10B]" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-black text-white tracking-tight">
                  Edit Instructor Details
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Update contact information, rates, vehicle details, and active status
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

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                1. Instructor Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    Transmission
                  </label>
                  <select
                    value={form.transmission}
                    onChange={(e) => setForm({ ...form, transmission: e.target.value, vehicle_transmission: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Hourly Rate ($ AUD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.hourly_rate_aud}
                    onChange={(e) => setForm({ ...form, hourly_rate_aud: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4 pt-2">
              <h3 className="font-heading font-black text-sm text-slate-900 pb-2 border-b border-slate-100">
                2. Assigned Training Vehicle
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Make
                  </label>
                  <input
                    type="text"
                    value={form.vehicle_make}
                    onChange={(e) => setForm({ ...form, vehicle_make: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={form.vehicle_model}
                    onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Rego Plate
                  </label>
                  <input
                    type="text"
                    value={form.vehicle_rego}
                    onChange={(e) => setForm({ ...form, vehicle_rego: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-800 font-bold mb-1.5">
                Instructor Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
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
                <span>{submitting ? "Updating..." : "Update Instructor"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
