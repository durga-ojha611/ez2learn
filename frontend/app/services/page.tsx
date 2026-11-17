"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Modal } from "@/components/common/Modal";
import { Plus, Check, ArrowUpDown } from "lucide-react";

interface LessonService {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  online: boolean;
}

interface BundlePackage {
  id: string;
  name: string;
  price: string;
  lessons: number;
  durationPerLesson: string;
  validity: string;
  transmission: "Automatic" | "Manual" | "Both";
  includes: string[];
  features: string[];
  isPopular?: boolean;
  showOnWebsite: boolean;
}

export default function ServicesPage() {
  // Services List
  const [services, setServices] = useState<LessonService[]>([
    {
      id: "srv-1",
      name: "Learner lesson",
      description: "Standard one-on-one lesson",
      duration: "60 min",
      price: "$85",
      online: true,
    },
    {
      id: "srv-2",
      name: "Extended lesson",
      description: "Extra time for test routes",
      duration: "90 min",
      price: "$125",
      online: true,
    },
    {
      id: "srv-3",
      name: "Driving test package",
      description: "Warm-up lesson + test car hire",
      duration: "2 h",
      price: "$210",
      online: true,
    },
    {
      id: "srv-4",
      name: "Refresher lesson",
      description: "For licensed drivers",
      duration: "60 min",
      price: "$85",
      online: true,
    },
    {
      id: "srv-5",
      name: "Overseas licence conversion",
      description: "Assessment-focused session",
      duration: "90 min",
      price: "$130",
      online: true,
    },
  ]);

  // Packages List
  const [packages, setPackages] = useState<BundlePackage[]>([
    {
      id: "pkg-1",
      name: "Starter",
      price: "$395",
      lessons: 5,
      durationPerLesson: "60 min",
      validity: "3 months",
      transmission: "Both",
      includes: ["Instructor of your choice", "Auto or manual car"],
      features: ["5 lessons · 60 min", "Valid 3 months", "Auto or manual"],
      showOnWebsite: true,
    },
    {
      id: "pkg-2",
      name: "Confidence 10",
      price: "$740",
      lessons: 10,
      durationPerLesson: "60 min",
      validity: "6 months",
      transmission: "Automatic",
      includes: ["Instructor of your choice", "Free rescheduling (24 h notice)"],
      features: ["10 lessons · 60 min", "Valid 6 months", "Instructor of your choice"],
      isPopular: true,
      showOnWebsite: true,
    },
    {
      id: "pkg-3",
      name: "Test-ready 15",
      price: "$1,090",
      lessons: 15,
      durationPerLesson: "60 min",
      validity: "9 months",
      transmission: "Both",
      includes: ["Instructor of your choice", "Free rescheduling (24 h notice)", "Test-day car hire", "Mock test included"],
      features: ["15 lessons + test car", "Valid 9 months", "Mock test included"],
      showOnWebsite: true,
    },
  ]);

  // Selected package for right edit panel
  const [selectedPkgId, setSelectedPkgId] = useState<string>("pkg-2");
  const activePackage = packages.find((p) => p.id === selectedPkgId) || packages[1];

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: activePackage.name,
    lessons: activePackage.lessons,
    price: activePackage.price,
    validity: activePackage.validity,
    transmission: activePackage.transmission,
    showOnWebsite: activePackage.showOnWebsite,
    instructorChoice: activePackage.includes.includes("Instructor of your choice"),
    freeRescheduling: activePackage.includes.includes("Free rescheduling (24 h notice)"),
    testDayCarHire: activePackage.includes.includes("Test-day car hire"),
  });

  // When package selected, sync form
  const handleSelectPackage = (pkg: BundlePackage) => {
    setSelectedPkgId(pkg.id);
    setEditForm({
      name: pkg.name,
      lessons: pkg.lessons,
      price: pkg.price,
      validity: pkg.validity,
      transmission: pkg.transmission,
      showOnWebsite: pkg.showOnWebsite,
      instructorChoice: pkg.includes.includes("Instructor of your choice"),
      freeRescheduling: pkg.includes.includes("Free rescheduling (24 h notice)"),
      testDayCarHire: pkg.includes.includes("Test-day car hire"),
    });
  };

  // Save changes
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedIncludes: string[] = [];
    if (editForm.instructorChoice) updatedIncludes.push("Instructor of your choice");
    if (editForm.freeRescheduling) updatedIncludes.push("Free rescheduling (24 h notice)");
    if (editForm.testDayCarHire) updatedIncludes.push("Test-day car hire");

    setPackages((prev) =>
      prev.map((p) =>
        p.id === selectedPkgId
          ? {
              ...p,
              name: editForm.name,
              lessons: Number(editForm.lessons),
              price: editForm.price.startsWith("$") ? editForm.price : `$${editForm.price}`,
              validity: editForm.validity,
              transmission: editForm.transmission,
              showOnWebsite: editForm.showOnWebsite,
              includes: updatedIncludes,
            }
          : p
      )
    );
    alert(`Saved changes for ${editForm.name}!`);
  };

  const handleDuplicate = () => {
    const newPkg: BundlePackage = {
      ...activePackage,
      id: `pkg-${Date.now()}`,
      name: `${activePackage.name} (Copy)`,
      isPopular: false,
    };
    setPackages((prev) => [...prev, newPkg]);
    setSelectedPkgId(newPkg.id);
    setEditForm((prev) => ({ ...prev, name: `${activePackage.name} (Copy)` }));
  };

  // Toggle Service Online
  const toggleServiceOnline = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, online: !s.online } : s))
    );
  };

  // New Service Modal
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    name: "",
    description: "",
    duration: "60 min",
    price: "$85",
  });

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name.trim()) return;
    setServices((prev) => [
      ...prev,
      {
        id: `srv-${Date.now()}`,
        name: newServiceForm.name,
        description: newServiceForm.description || "Custom lesson session",
        duration: newServiceForm.duration,
        price: newServiceForm.price.startsWith("$") ? newServiceForm.price : `$${newServiceForm.price}`,
        online: true,
      },
    ]);
    setNewServiceModalOpen(false);
    setNewServiceForm({ name: "", description: "", duration: "60 min", price: "$85" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-12">
        {/* Top Header Bar matching reference image */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Services &amp; Packages
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
              Lesson types, bundles and what shows on the booking page
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert("Reorder mode enabled: drag items to reorder.")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-sm transition-all"
            >
              Reorder
            </button>
            <button
              onClick={() => setNewServiceModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New service
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0B1528] text-white flex items-center justify-center text-xs font-bold shadow-sm ml-1">
              AD
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Lesson services table + Bundled Packages grid */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Lesson services Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="font-heading font-black text-slate-900 text-lg mb-4">
                Lesson services
              </h2>

              {/* Table Header */}
              <div className="grid grid-cols-12 text-[11px] font-bold tracking-wider text-slate-400 uppercase pb-2.5 border-b border-slate-100">
                <div className="col-span-6">SERVICE</div>
                <div className="col-span-2 text-center">DURATION</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-2 text-right">ONLINE</div>
              </div>

              {/* Table Rows matching reference */}
              <div className="divide-y divide-slate-100">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="grid grid-cols-12 items-center py-3.5 hover:bg-slate-50/50 rounded-xl px-1.5 transition-colors"
                  >
                    {/* Service Name & Subtitle */}
                    <div className="col-span-6 min-w-0 pr-2">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {srv.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                        {srv.description}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 text-center font-medium text-xs sm:text-sm text-slate-600">
                      {srv.duration}
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center font-bold text-xs sm:text-sm text-slate-900">
                      {srv.price}
                    </div>

                    {/* Online Toggle Switch */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleServiceOnline(srv.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
                          srv.online ? "bg-[#10B981]" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            srv.online ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bundled Packages Cards Grid (3 side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg)}
                    className={`rounded-3xl p-5 cursor-pointer transition-all bg-white shadow-sm flex flex-col justify-between ${
                      isSelected
                        ? "border-2 border-[#FAB10B] ring-4 ring-[#FAB10B]/10"
                        : "border border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Title & Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 text-sm">{pkg.name}</h3>
                        {pkg.isPopular && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A]">
                            Most popular
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="font-heading font-black text-2xl sm:text-3xl text-slate-900 my-2">
                        {pkg.price}
                      </div>

                      {/* Features */}
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
                        {pkg.features.map((f, i) => (
                          <p key={i} className="text-xs text-slate-500">
                            {f}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Edit Package Card */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between gap-2 mb-5">
              <h2 className="font-heading font-black text-slate-900 text-lg">Edit package</h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5]">
                {editForm.name}
              </span>
            </div>

            <form onSubmit={handleSaveChanges} className="space-y-4">
              {/* Package name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Package name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
                />
              </div>

              {/* Lessons & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lessons
                  </label>
                  <input
                    type="number"
                    value={editForm.lessons}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lessons: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price
                  </label>
                  <input
                    type="text"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
                  />
                </div>
              </div>

              {/* Validity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Validity
                </label>
                <input
                  type="text"
                  value={editForm.validity}
                  onChange={(e) => setEditForm({ ...editForm, validity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
                />
              </div>

              {/* Transmission Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transmission
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, transmission: "Automatic" })}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      editForm.transmission === "Automatic"
                        ? "bg-[#0B1528] text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Automatic
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, transmission: "Manual" })}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      editForm.transmission === "Manual"
                        ? "bg-[#0B1528] text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {/* Includes Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Includes
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.instructorChoice}
                      onChange={(e) =>
                        setEditForm({ ...editForm, instructorChoice: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#0B1528] focus:ring-0 cursor-pointer"
                    />
                    <span>Instructor of your choice</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.freeRescheduling}
                      onChange={(e) =>
                        setEditForm({ ...editForm, freeRescheduling: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#0B1528] focus:ring-0 cursor-pointer"
                    />
                    <span>Free rescheduling (24 h notice)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.testDayCarHire}
                      onChange={(e) =>
                        setEditForm({ ...editForm, testDayCarHire: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#0B1528] focus:ring-0 cursor-pointer"
                    />
                    <span>Test-day car hire</span>
                  </label>
                </div>
              </div>

              {/* Show on website Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-700">Show on website</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditForm({ ...editForm, showOnWebsite: !editForm.showOnWebsite })
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
                    editForm.showOnWebsite ? "bg-[#10B981]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      editForm.showOnWebsite ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 text-xs font-bold shadow-sm transition-all text-center"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all text-center"
                >
                  Duplicate
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal: New Service */}
        <Modal
          isOpen={newServiceModalOpen}
          onClose={() => setNewServiceModalOpen(false)}
          title="Create New Service"
        >
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Service Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Night Driving Masterclass"
                value={newServiceForm.name}
                onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Focus on low-visibility conditions"
                value={newServiceForm.description}
                onChange={(e) =>
                  setNewServiceForm({ ...newServiceForm, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 60 min, 90 min, 2 h"
                  value={newServiceForm.duration}
                  onChange={(e) =>
                    setNewServiceForm({ ...newServiceForm, duration: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Price
                </label>
                <input
                  type="text"
                  placeholder="e.g. $95"
                  value={newServiceForm.price}
                  onChange={(e) =>
                    setNewServiceForm({ ...newServiceForm, price: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FAB10B]/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 text-xs font-bold shadow-sm"
              >
                Create service
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
