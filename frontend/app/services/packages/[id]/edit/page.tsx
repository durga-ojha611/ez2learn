"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  X,
  ChevronDown,
  Calendar,
  Eye,
  UploadCloud,
  Sparkles,
} from "lucide-react";

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    package_type: "Lesson Package",
    description: "",
    lesson_count: 5,
    duration_per_lesson: 60,
    price_aud: 350.0,
    validity: "3 Months",
    image_url: "",
    is_active: 1,
    features: [] as string[],
    newFeatureText: "",
  });

  useEffect(() => {
    loadPackage();
  }, [packageId]);

  const loadPackage = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/services");
      if (res.success && Array.isArray(res.data?.packages)) {
        const found = res.data.packages.find(
          (p: any) => String(p.id) === String(packageId)
        );
        if (found) {
          setForm({
            name: found.name,
            package_type: found.package_type || "Lesson Package",
            description: found.description || "",
            lesson_count: found.lesson_count || 5,
            duration_per_lesson: found.duration_per_lesson || 60,
            price_aud: Number(found.price_aud) || 350.0,
            validity: found.validity || "3 Months",
            image_url: found.image_url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80",
            is_active: found.is_active,
            features: Array.isArray(found.features) && found.features.length > 0
              ? found.features
              : ["5 Driving Lessons", "Progress Tracking", "Certificate of Completion"],
            newFeatureText: "",
          });
        } else {
          setErrorMsg("Package not found");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load package");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (!form.newFeatureText.trim()) return;
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, prev.newFeatureText.trim()],
      newFeatureText: "",
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg("Please enter a package name");
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    try {
      await apiFetch(`/api/packages/${packageId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.name.trim(),
          package_type: form.package_type,
          description: form.description,
          lesson_count: form.lesson_count,
          duration_per_lesson: form.duration_per_lesson,
          price_aud: form.price_aud,
          validity: form.validity,
          image_url: form.image_url,
          features: form.features,
          is_active: form.is_active,
        }),
      });
      router.push("/services?tab=packages");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update package");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-slate-500 font-bold">
          Loading package details...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-7xl pb-20 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/services?tab=packages"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Services & Packages</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Edit Package #{packageId} • Dedicated Page
          </span>
        </div>

        {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = LIVE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: CTA FORM DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
              <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white">
                <div>
                  <h1 className="text-xl font-heading font-black text-white tracking-tight">
                    Edit Package #{packageId}
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Update package lessons, duration, validity, pricing, and features
                  </p>
                </div>
                <Link
                  href="/services?tab=packages"
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

                {/* Top Section: Left Image + Right Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-4">
                    <label className="block text-slate-800 font-bold mb-2">
                      Package Cover Image
                    </label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-center bg-slate-50/50 flex flex-col items-center justify-center transition-colors min-h-[200px] overflow-hidden">
                      {form.image_url ? (
                        <img
                          src={form.image_url}
                          alt="Preview"
                          className="w-full h-28 object-cover rounded-xl mb-2"
                        />
                      ) : (
                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                      )}
                      <p className="font-bold text-slate-800 text-xs">Package Image</p>
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        className="mt-2 w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1.5">
                          Package Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1.5">
                          Package Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={form.package_type}
                            onChange={(e) =>
                              setForm({ ...form, package_type: e.target.value })
                            }
                            className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                          >
                            <option value="Lesson Package">Lesson Package</option>
                            <option value="Test Preparation">Test Preparation</option>
                            <option value="Comprehensive">Comprehensive</option>
                            <option value="Refresher">Refresher</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Description <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Lesson Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Number of Lessons <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={form.lesson_count}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          lesson_count: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Price ($ AUD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.price_aud}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price_aud: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Valid For
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.validity}
                        onChange={(e) => setForm({ ...form, validity: e.target.value })}
                        placeholder="e.g. 3 Months"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Features & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2 border-t border-slate-100 items-start">
                  <div className="sm:col-span-8 space-y-2">
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Features Checklist
                    </label>
                    <div className="space-y-1.5">
                      {form.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="text-slate-400 hover:text-rose-500 ml-2"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add package feature..."
                        value={form.newFeatureText}
                        onChange={(e) =>
                          setForm({ ...form, newFeatureText: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shrink-0"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4 space-y-2">
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Status
                    </label>
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, is_active: form.is_active === 1 ? 0 : 1 })
                        }
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          form.is_active === 1 ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            form.is_active === 1 ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="font-bold text-xs text-slate-700">
                        {form.is_active === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href="/services?tab=packages"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs shadow-xs transition-colors disabled:opacity-75"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Update Package"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE PACKAGE PREVIEW CARD */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
                <span>Live Package Card Preview</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Sync
              </span>
            </div>

            {/* Package Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 relative">
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt={form.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : null}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#0B1528] text-white shadow-xs">
                    {form.package_type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      form.is_active === 1
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-400 text-white"
                    }`}
                  >
                    {form.is_active === 1 ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-xs border border-white/50 text-right">
                  <span className="font-heading font-black text-slate-900 text-base">
                    ${Number(form.price_aud || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block -mt-0.5">
                    AUD Total
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-heading font-black text-lg text-slate-900 leading-tight">
                  {form.name || "Package Title Placeholder"}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-[#0B1528]">{form.lesson_count} Lessons</span>
                  <span>•</span>
                  <span>Valid {form.validity}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {form.description || "Enter package description on the left to see live preview here."}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Included Package Features:
                </span>
                {form.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Helper Note */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Package Bundle Benefit</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed font-medium">
                Lesson packages automatically grant students lesson credits upon checkout and enable progress milestone tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
