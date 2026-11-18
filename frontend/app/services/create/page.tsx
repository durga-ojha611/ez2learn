"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Check,
  UploadCloud,
  CheckSquare,
  X,
  ChevronDown,
  Eye,
  Clock,
  Sparkles,
  Car,
} from "lucide-react";

export default function CreateServicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    subtitle: "Manual & Automatic",
    category: "Lessons",
    duration_minutes: 60,
    price_aud: 80.0,
    is_active: 1,
    description: "",
    image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&auto=format&fit=crop&q=80",
    features: [
      "Professional instructors",
      "Modern vehicles",
      "Flexible scheduling",
    ],
    newFeatureText: "",
  });

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
      setErrorMsg("Please enter a service name");
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    try {
      await apiFetch("/api/services", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          subtitle: form.subtitle,
          category: form.category,
          duration_minutes: form.duration_minutes,
          price_aud: form.price_aud,
          description: form.description,
          image_url: form.image_url,
          included_features: form.features,
          is_active: form.is_active,
        }),
      });
      router.push("/services");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create service");
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-7xl pb-20 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Services & Packages</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Catalog Management • Dedicated Page
          </span>
        </div>

        {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = LIVE WEBPAGE PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: CTA FORM DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
              <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white">
                <div>
                  <h1 className="text-xl font-heading font-black text-white tracking-tight">
                    Create Service
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Add a new driving lesson or training service to your school catalog
                  </p>
                </div>
                <Link
                  href="/services"
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

                {/* Top Grid: Left Image Upload + Right Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Image Upload Box */}
                  <div className="md:col-span-4">
                    <label className="block text-slate-800 font-bold mb-2">
                      Service Image
                    </label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-center bg-slate-50/50 flex flex-col items-center justify-center transition-colors min-h-[200px] overflow-hidden relative group">
                      {form.image_url ? (
                        <img
                          src={form.image_url}
                          alt="Preview"
                          className="w-full h-28 object-cover rounded-xl mb-2"
                        />
                      ) : (
                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                      )}
                      <p className="font-bold text-slate-800 text-xs">Service Cover Photo</p>
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        className="mt-2 w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Middle & Right Columns */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Row 1: Service Name + Status Toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                      <div className="sm:col-span-8">
                        <label className="block text-slate-800 font-bold mb-1.5">
                          Service Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter service name (e.g. Standard Driving Lesson)"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                        />
                      </div>

                      <div className="sm:col-span-4">
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

                    {/* Row 2: Category + Duration + Pricing */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1.5">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                          >
                            <option value="Lessons">Lessons</option>
                            <option value="Courses">Courses</option>
                            <option value="Training">Training</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1.5">
                          Duration (mins) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 60"
                          value={form.duration_minutes}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              duration_minutes: parseInt(e.target.value, 10) || 60,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1.5">
                          Pricing ($ AUD) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="e.g. 80.00"
                          value={form.price_aud}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              price_aud: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                        />
                      </div>
                    </div>

                    {/* Row 3: Key Features Checklist */}
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Key Features
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

                      {/* Add Feature input */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add custom feature..."
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
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter detailed description of the service..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] resize-none"
                  />
                </div>

                {/* Form Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href="/services"
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
                    <span>{saving ? "Creating..." : "Create Service"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE CATALOG PREVIEW CARD */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
                <span>Live Webpage Card Preview</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Sync
              </span>
            </div>

            {/* Visual Card */}
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
                    {form.category}
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
                    AUD / {form.duration_minutes}m
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-heading font-black text-lg text-slate-900 leading-tight">
                  {form.name || "Service Title Placeholder"}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {form.subtitle || "Manual & Automatic"}
                </p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {form.description || "Enter service description on the left to see live preview here."}
                </p>
              </div>

              {/* Feature Pills */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Included Features:
                </span>
                {form.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-heading font-bold text-xs text-center cursor-not-allowed"
                >
                  Student Booking Button Preview
                </button>
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Website Catalog Sync</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed font-medium">
                Changes saved on the left will immediately reflect across your public booking system and service selection forms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
