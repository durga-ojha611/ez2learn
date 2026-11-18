"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { Modal } from "@/components/common/Modal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { formatAUD } from "@/lib/utils";
import {
  Layers,
  Car,
  Package,
  Plus,
  Check,
  Search,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  X,
  Clock,
  DollarSign,
  Calendar,
  Award,
  UploadCloud,
  CheckCircle2,
  PauseCircle,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  FileText,
  CheckSquare,
  Square,
  Navigation,
  Compass,
  GraduationCap,
  Star,
  Tag,
  MapPin,
  Users,
} from "lucide-react";

export interface ServiceItem {
  id: number;
  name: string;
  subtitle?: string;
  slug: string;
  category: string;
  transmission: "automatic" | "manual" | "both";
  duration_minutes: number;
  price_aud: number | string;
  description?: string;
  image_url?: string;
  included_features: string[];
  is_featured: number;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  booking_count?: number;
}

export interface PackageItem {
  id: number;
  name: string;
  package_type: string;
  slug: string;
  lesson_count: number;
  duration_per_lesson: number;
  validity: string;
  price_aud: number | string;
  discount_amount?: number | string;
  popular_badge: number;
  description?: string;
  image_url?: string;
  features: string[];
  is_active: number;
  created_at?: string;
  updated_at?: string;
  booking_count?: number;
}

export default function ServicesPage() {
  const router = useRouter();
  // Tabs: Services (default) | Packages
  const [activeTab, setActiveTab] = useState<"services" | "packages">("services");

  // Live Data State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [packageTypeFilter, setPackageTypeFilter] = useState("all");

  // Dropdown 3-dots menus
  const [openServiceMenuId, setOpenServiceMenuId] = useState<number | null>(null);
  const [openPackageMenuId, setOpenPackageMenuId] = useState<number | null>(null);

  // Modals state
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [isCreatePackageOpen, setIsCreatePackageOpen] = useState(false);
  const [isEditPackageOpen, setIsEditPackageOpen] = useState(false);
  const [viewDetailModal, setViewDetailModal] = useState<{
    type: "service" | "package";
    data: any;
  } | null>(null);

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "service" | "package";
    id: number;
    name: string;
  } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State for Service (Matching Image 2)
  const [serviceForm, setServiceForm] = useState({
    id: 0,
    name: "",
    subtitle: "",
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

  // Form State for Package (Matching Image 3)
  const [packageForm, setPackageForm] = useState({
    id: 0,
    name: "",
    package_type: "Lesson Package",
    description: "",
    lesson_count: 5,
    duration_per_lesson: 60,
    price_aud: 350.0,
    validity: "3 Months",
    image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80",
    is_active: 1,
    features: [
      "5 Driving Lessons",
      "Progress Tracking",
      "Certificate of Completion",
    ],
    newFeatureText: "",
  });

  // Load live data from MySQL Backend API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/services");
      if (res.success && res.data) {
        setServices(res.data.services || []);
        setPackages(res.data.packages || []);
      }
    } catch (err) {
      console.warn("Could not load services/packages from backend API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.subtitle || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q);

      // Status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.is_active === 1) ||
        (statusFilter === "inactive" && s.is_active === 0);

      // Category
      const matchesCat =
        categoryFilter === "all" ||
        s.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [services, searchQuery, statusFilter, categoryFilter]);

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);

      // Status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.is_active === 1) ||
        (statusFilter === "inactive" && p.is_active === 0);

      // Type
      const matchesType =
        packageTypeFilter === "all" ||
        p.package_type.toLowerCase().includes(packageTypeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [packages, searchQuery, statusFilter, packageTypeFilter]);

  // Dynamic KPI Stats for Services
  const serviceStats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.is_active === 1).length;
    const inactive = services.filter((s) => s.is_active === 0).length;
    return { total, active, inactive };
  }, [services]);

  // Dynamic KPI Stats for Packages
  const packageStats = useMemo(() => {
    const total = packages.length;
    const active = packages.filter((p) => p.is_active === 1).length;
    const popular = packages.filter((p) => p.popular_badge === 1).length;
    return { total, active, popular };
  }, [packages]);

  // Service Helper: Category Badge Styling
  const getCategoryBadgeClass = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("lesson")) return "bg-[#E6F4FE] text-[#1D4ED8] border-[#BFDBFE]";
    if (c.includes("course")) return "bg-[#FEF9C3] text-[#A16207] border-[#FDE047]";
    if (c.includes("training") || c.includes("prep")) return "bg-[#F3E8FF] text-[#7E22CE] border-[#D8B4FE]";
    if (c.includes("advanced")) return "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Service Helper: Icon based on name
  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("refresher")) return <Compass className="w-5 h-5 text-slate-700" />;
    if (n.includes("defensive")) return <ShieldCheck className="w-5 h-5 text-slate-700" />;
    if (n.includes("test")) return <GraduationCap className="w-5 h-5 text-slate-700" />;
    if (n.includes("advanced")) return <Star className="w-5 h-5 text-slate-700" />;
    return <Car className="w-5 h-5 text-slate-700" />;
  };

  // Format date helper
  const formatNiceDate = (dateStr?: string) => {
    if (!dateStr) return "15 Nov 2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // --- Handlers: Service Form & CRUD ---
  const handleOpenCreateService = () => {
    router.push("/services/create");
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setOpenServiceMenuId(null);
    router.push(`/services/${service.id}/edit`);
  };

  const handleAddServiceFeature = () => {
    if (!serviceForm.newFeatureText.trim()) return;
    setServiceForm((prev) => ({
      ...prev,
      features: [...prev.features, prev.newFeatureText.trim()],
      newFeatureText: "",
    }));
  };

  const handleRemoveServiceFeature = (index: number) => {
    setServiceForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = serviceForm.id > 0;
    const payload = {
      name: serviceForm.name,
      subtitle: serviceForm.subtitle,
      category: serviceForm.category,
      duration_minutes: serviceForm.duration_minutes,
      price_aud: serviceForm.price_aud,
      description: serviceForm.description,
      image_url: serviceForm.image_url,
      included_features: serviceForm.features,
      is_active: serviceForm.is_active,
    };

    try {
      if (isEdit) {
        await apiFetch(`/api/services/${serviceForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(`Service "${serviceForm.name}" updated successfully.`);
      } else {
        await apiFetch("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(`Service "${serviceForm.name}" created successfully.`);
      }
      setIsCreateServiceOpen(false);
      setIsEditServiceOpen(false);
      await loadData();
    } catch (err: any) {
      console.warn("Save service error:", err);
      showToast(`Error saving service: ${err.message || "Failed"}`, "error" as any);
    }
  };

  const handleToggleServiceStatus = async (service: ServiceItem) => {
    const newStatus = service.is_active === 1 ? 0 : 1;
    try {
      await apiFetch(`/api/services/${service.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: newStatus }),
      });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: newStatus } : s))
      );
      showToast(`Service status updated to ${newStatus === 1 ? "Active" : "Inactive"}.`);
    } catch (err) {
      console.warn("Toggle service status error:", err);
    }
    setOpenServiceMenuId(null);
  };

  // --- Handlers: Package Form & CRUD ---
  const handleOpenCreatePackage = () => {
    router.push("/services/packages/create");
  };

  const handleOpenEditPackage = (pkg: PackageItem) => {
    setOpenPackageMenuId(null);
    router.push(`/services/packages/${pkg.id}/edit`);
  };

  const handleAddPackageFeature = () => {
    if (!packageForm.newFeatureText.trim()) return;
    setPackageForm((prev) => ({
      ...prev,
      features: [...prev.features, prev.newFeatureText.trim()],
      newFeatureText: "",
    }));
  };

  const handleRemovePackageFeature = (index: number) => {
    setPackageForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = packageForm.id > 0;
    const payload = {
      name: packageForm.name,
      package_type: packageForm.package_type,
      description: packageForm.description,
      lesson_count: packageForm.lesson_count,
      duration_per_lesson: packageForm.duration_per_lesson,
      price_aud: packageForm.price_aud,
      validity: packageForm.validity,
      image_url: packageForm.image_url,
      features: packageForm.features,
      is_active: packageForm.is_active,
    };

    try {
      if (isEdit) {
        await apiFetch(`/api/packages/${packageForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        showToast(`Package "${packageForm.name}" updated successfully.`);
      } else {
        await apiFetch("/api/packages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        showToast(`Package "${packageForm.name}" created successfully.`);
      }
      setIsCreatePackageOpen(false);
      setIsEditPackageOpen(false);
      await loadData();
    } catch (err: any) {
      console.warn("Save package error:", err);
      showToast(`Error saving package: ${err.message || "Failed"}`, "error" as any);
    }
  };

  const handleTogglePackageStatus = async (pkg: PackageItem) => {
    const newStatus = pkg.is_active === 1 ? 0 : 1;
    try {
      await apiFetch(`/api/packages/${pkg.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: newStatus }),
      });
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_active: newStatus } : p))
      );
      showToast(`Package status updated to ${newStatus === 1 ? "Active" : "Inactive"}.`);
    } catch (err) {
      console.warn("Toggle package status error:", err);
    }
    setOpenPackageMenuId(null);
  };

  // --- Handlers: Delete Action ---
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "service") {
        await apiFetch(`/api/services/${deleteTarget.id}`, { method: "DELETE" });
        setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        showToast(`Service "${deleteTarget.name}" deleted.`);
      } else {
        await apiFetch(`/api/packages/${deleteTarget.id}`, { method: "DELETE" });
        setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        showToast(`Package "${deleteTarget.name}" deleted.`);
      }
    } catch (err: any) {
      console.warn("Delete error:", err);
      showToast(`Could not delete: ${err.message || "Failed"}`, "error" as any);
    }
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 pb-16 select-none">
        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${toastMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage.msg}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-700 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Header with Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={Layers}
          title="Services & Packages"
          subtitle="Manage driving lessons, test packages, and service offerings"
          badge={`${services.length} Services`}
          actions={
            activeTab === "services" ? (
              <button
                onClick={handleOpenCreateService}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#152544] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FAB10B] stroke-[2.5]" />
                <span>Create Service</span>
              </button>
            ) : (
              <button
                onClick={handleOpenCreatePackage}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#152544] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FAB10B] stroke-[2.5]" />
                <span>Create Package</span>
              </button>
            )
          }
        />

        {/* Tabs Bar: Services | Packages */}
        <div className="flex items-center gap-8 border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab("services");
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 transition-all relative ${activeTab === "services"
              ? "text-[#0B1528]"
              : "text-slate-400 hover:text-slate-700"
              }`}
          >
            <Car className="w-4 h-4" />
            <span>Services</span>
            {activeTab === "services" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1528] rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("packages");
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className={`pb-3 font-bold text-sm sm:text-base flex items-center gap-2 transition-all relative ${activeTab === "packages"
              ? "text-[#0B1528]"
              : "text-slate-400 hover:text-slate-700"
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Packages</span>
            {activeTab === "packages" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1528] rounded-full" />
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SERVICES TAB VIEW (Matching Image 1)                               */}
        {/* ========================================================================= */}
        {activeTab === "services" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* 3 Overview Stat Cards matching reference image */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Services */}
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-slate-800" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">
                    {serviceStats.total}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    Total Services
                  </div>
                </div>
              </div>

              {/* Card 2: Active Services */}
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 text-white stroke-[3]" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">
                    {serviceStats.active}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    Active Services
                  </div>
                </div>
              </div>

              {/* Card 3: Inactive Services */}
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <PauseCircle className="w-6 h-6 text-white stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">
                    {serviceStats.inactive}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    Inactive Services
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Toolbar matching reference image */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Lessons">Lessons</option>
                    <option value="Courses">Courses</option>
                    <option value="Training">Training</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Services Management Table strictly matching Image 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-5">Service</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Updated</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          Loading driving services...
                        </td>
                      </tr>
                    ) : filteredServices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                          No services found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredServices.map((service) => (
                        <tr
                          key={service.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Service Icon + Title + Subtitle */}
                          <td className="py-3.5 px-4 sm:px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                {getServiceIcon(service.name)}
                              </div>
                              <div>
                                <p className="font-heading font-black text-slate-900 text-sm">
                                  {service.name}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                  {service.subtitle || "Manual & Automatic"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge Pill */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(
                                service.category
                              )}`}
                            >
                              {service.category}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {service.is_active === 1 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-rose-200/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-4 font-semibold text-slate-600">
                            {formatNiceDate(service.updated_at || service.created_at)}
                          </td>

                          {/* Actions: View button + 3-dots */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setViewDetailModal({ type: "service", data: service })
                                }
                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all"
                              >
                                View
                              </button>

                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenServiceMenuId(
                                      openServiceMenuId === service.id ? null : service.id
                                    );
                                  }}
                                  className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openServiceMenuId === service.id && (
                                  <div
                                    className="absolute right-0 mt-1 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in text-left text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => handleOpenEditService(service)}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Edit Service</span>
                                    </button>

                                    <button
                                      onClick={() => handleToggleServiceStatus(service)}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                                      <span>
                                        {service.is_active === 1
                                          ? "Deactivate"
                                          : "Activate"}
                                      </span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100" />

                                    <button
                                      onClick={() => {
                                        setDeleteTarget({
                                          type: "service",
                                          id: service.id,
                                          name: service.name,
                                        });
                                        setOpenServiceMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Delete Service</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom footer pagination */}
              <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>
                  Showing 1 to {filteredServices.length} of {services.length} services
                </span>
                <span className="text-[11px] text-slate-400">EZY 2 LEARN Services Directory</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PACKAGES TAB VIEW (Matching Specifications & Image 3)              */}
        {/* ========================================================================= */}
        {activeTab === "packages" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* 3 Overview Stat Cards for Packages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Packages */}
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-slate-800" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">
                    {packageStats.total}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    Total Packages
                  </div>
                </div>
              </div>

              {/* Card 2: Active Packages */}
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 text-white stroke-[3]" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">
                    {packageStats.active}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    Active Packages
                  </div>
                </div>
              </div>

              {/* Card 3: Popular Bundles */}
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#FEF08A] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-900" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-tight">
                    {packageStats.popular}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    Featured Bundles
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Toolbar for Packages */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Package Type Dropdown */}
                <div className="relative">
                  <select
                    value={packageTypeFilter}
                    onChange={(e) => setPackageTypeFilter(e.target.value)}
                    className="appearance-none bg-white border border-slate-200/80 rounded-xl px-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors cursor-pointer"
                  >
                    <option value="all">All Package Types</option>
                    <option value="Lesson Package">Lesson Package</option>
                    <option value="Test Prep">Test Preparation</option>
                    <option value="Intensive">Intensive Course</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Packages Management Table strictly matching Section 3 in user request */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-5">Package Name</th>
                      <th className="py-3 px-4">Package Type</th>
                      <th className="py-3 px-4">Lessons</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Validity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                          Loading lesson packages...
                        </td>
                      </tr>
                    ) : filteredPackages.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                          No packages found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPackages.map((pkg) => (
                        <tr
                          key={pkg.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Package Name + Thumbnail */}
                          <td className="py-3.5 px-4 sm:px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  pkg.image_url ||
                                  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500"
                                }
                                alt={pkg.name}
                                className="w-12 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-heading font-black text-slate-900 text-sm">
                                    {pkg.name}
                                  </p>
                                  {pkg.popular_badge === 1 && (
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1 max-w-xs">
                                  {pkg.description || "Comprehensive driving lesson bundle."}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Package Type */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {pkg.package_type || "Lesson Package"}
                            </span>
                          </td>

                          {/* Lessons */}
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {pkg.lesson_count} Lessons
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {pkg.duration_per_lesson} Minutes
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 font-heading font-black text-slate-900 text-sm">
                            ${Number(pkg.price_aud || 0).toFixed(2)}
                          </td>

                          {/* Validity */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{pkg.validity || "3 Months"}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {pkg.is_active === 1 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-rose-200/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions: View / Edit button */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setViewDetailModal({ type: "package", data: pkg })
                                }
                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all"
                              >
                                View
                              </button>

                              <button
                                onClick={() => handleOpenEditPackage(pkg)}
                                className="px-3 py-1.5 rounded-xl bg-[#0B1528] hover:bg-[#152544] text-white font-bold text-xs shadow-2xs transition-all"
                              >
                                Edit
                              </button>

                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPackageMenuId(
                                      openPackageMenuId === pkg.id ? null : pkg.id
                                    );
                                  }}
                                  className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openPackageMenuId === pkg.id && (
                                  <div
                                    className="absolute right-0 mt-1 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in text-left text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => handleTogglePackageStatus(pkg)}
                                      className="w-full px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                                      <span>
                                        {pkg.is_active === 1
                                          ? "Deactivate"
                                          : "Activate"}
                                      </span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100" />

                                    <button
                                      onClick={() => {
                                        setDeleteTarget({
                                          type: "package",
                                          id: pkg.id,
                                          name: pkg.name,
                                        });
                                        setOpenPackageMenuId(null);
                                      }}
                                      className="w-full px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Delete Package</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom footer pagination */}
              <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>
                  Showing 1 to {filteredPackages.length} of {packages.length} packages
                </span>
                <span className="text-[11px] text-slate-400">NSW Driving Packages Catalog</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: CREATE SERVICE / EDIT SERVICE (Strictly matching Image 2)        */}
        {/* ========================================================================= */}
        {(isCreateServiceOpen || isEditServiceOpen) && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#0B1528]/50 backdrop-blur-xs transition-opacity"
              onClick={() => {
                setIsCreateServiceOpen(false);
                setIsEditServiceOpen(false);
              }}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 border border-slate-100">
              {/* Dark Navy Header matching Image 2 */}
              <div className="bg-[#0B1528] px-6 py-4 flex items-center justify-between text-white shrink-0">
                <h3 className="text-base font-heading font-bold text-white tracking-tight">
                  {isEditServiceOpen ? "Edit Service" : "Create Service"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreateServiceOpen(false);
                    setIsEditServiceOpen(false);
                  }}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body matching Image 2 structure */}
              <form onSubmit={handleSaveService} className="p-6 space-y-5 text-xs font-sans">
                {/* Top Section: Upload Box + Middle (Name, Category, Duration, Price) + Right (Status, Features) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left: Upload Image Box */}
                  <div className="md:col-span-3">
                    <label className="block text-slate-700 font-bold mb-1 opacity-0 pointer-events-none">
                      Image
                    </label>
                    <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-slate-800 text-[11px]">Upload Image</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">or drag and drop</p>
                      <p className="text-[9px] text-slate-400 mt-1">PNG, JPG (Max 2MB)</p>
                    </div>
                  </div>

                  {/* Middle: Service Name, Category, Duration, Pricing */}
                  <div className="md:col-span-5 space-y-3">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1">
                        Service Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter service name"
                        value={serviceForm.name}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={serviceForm.category}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, category: e.target.value })
                          }
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">
                          Duration <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 60"
                          value={serviceForm.duration_minutes}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              duration_minutes: parseInt(e.target.value, 10) || 60,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">
                          Pricing ($) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="e.g. 80.00"
                          value={serviceForm.price_aud}
                          onChange={(e) =>
                            setServiceForm({
                              ...serviceForm,
                              price_aud: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Switch + Key Features */}
                  <div className="md:col-span-4 space-y-3">
                    {/* Status Toggle Switch matching Image 2 */}
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Status
                      </label>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setServiceForm({
                              ...serviceForm,
                              is_active: serviceForm.is_active === 1 ? 0 : 1,
                            })
                          }
                          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${serviceForm.is_active === 1 ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${serviceForm.is_active === 1 ? "translate-x-6" : "translate-x-0"
                              }`}
                          />
                        </button>
                        <span className="font-bold text-xs text-slate-700">
                          {serviceForm.is_active === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Key Features List matching Image 2 */}
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Key Features
                      </label>
                      <div className="space-y-1.5">
                        {serviceForm.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-[11px] text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveServiceFeature(idx)}
                              className="text-slate-400 hover:text-rose-500 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Feature input */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="New feature..."
                          value={serviceForm.newFeatureText}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, newFeatureText: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddServiceFeature();
                            }
                          }}
                          className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddServiceFeature}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 shrink-0"
                        >
                          + Add Feature
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Description matching Image 2 */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter detailed description of the service..."
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] resize-none"
                  />
                </div>

                {/* Modal Footer matching Image 2 */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateServiceOpen(false);
                      setIsEditServiceOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs shadow-xs transition-colors"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isEditServiceOpen ? "Update Service" : "Create Service"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: EDIT PACKAGE / CREATE PACKAGE (Strictly matching Image 3)        */}
        {/* ========================================================================= */}
        {(isCreatePackageOpen || isEditPackageOpen) && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#0B1528]/50 backdrop-blur-xs transition-opacity"
              onClick={() => {
                setIsCreatePackageOpen(false);
                setIsEditPackageOpen(false);
              }}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 border border-slate-100">
              {/* Dark Navy Header matching Image 3 */}
              <div className="bg-[#0B1528] px-6 py-4 flex items-center justify-between text-white shrink-0">
                <h3 className="text-base font-heading font-bold text-white tracking-tight">
                  {isEditPackageOpen ? "Edit Package" : "Create Package"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreatePackageOpen(false);
                    setIsEditPackageOpen(false);
                  }}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body matching Image 3 structure */}
              <form onSubmit={handleSavePackage} className="p-6 space-y-4 text-xs font-sans">
                {/* Top Section: Vehicle Thumbnail + Package Name & Type */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Vehicle Thumbnail */}
                  <div className="w-36 h-28 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                    <img
                      src={
                        packageForm.image_url ||
                        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500"
                      }
                      alt={packageForm.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">
                          Package Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Beginner Package"
                          value={packageForm.name}
                          onChange={(e) =>
                            setPackageForm({ ...packageForm, name: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-1">
                          Package Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={packageForm.package_type}
                            onChange={(e) =>
                              setPackageForm({ ...packageForm, package_type: e.target.value })
                            }
                            className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528] cursor-pointer"
                          >
                            <option value="Lesson Package">Lesson Package</option>
                            <option value="Beginner">Beginner Package</option>
                            <option value="Intermediate">Intermediate Package</option>
                            <option value="Test Preparation">Test Preparation</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Description matching Image 3 */}
                    <div>
                      <label className="block text-slate-800 font-bold mb-1">
                        Description <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Perfect for new drivers. Includes 5 professional driving lessons."
                        value={packageForm.description}
                        onChange={(e) =>
                          setPackageForm({ ...packageForm, description: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Metrics Row: Number of Lessons, Price, Valid For matching Image 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Number of Lessons <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="5"
                      value={packageForm.lesson_count}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          lesson_count: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Price <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="350.00"
                      value={packageForm.price_aud}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          price_aud: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Valid For
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="3 Months"
                        value={packageForm.validity}
                        onChange={(e) =>
                          setPackageForm({
                            ...packageForm,
                            validity: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                      />
                    </div>
                  </div>
                </div>

                {/* Features Checklist & Status Toggle Row matching Image 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
                  {/* Left: Features */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Features
                    </label>
                    <div className="space-y-1.5">
                      {packageForm.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePackageFeature(idx)}
                            className="text-slate-400 hover:text-rose-500 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add feature..."
                        value={packageForm.newFeatureText}
                        onChange={(e) =>
                          setPackageForm({ ...packageForm, newFeatureText: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPackageFeature();
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddPackageFeature}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 shrink-0"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>

                  {/* Right: Status Toggle Switch matching Image 3 */}
                  <div className="sm:pl-4">
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Status
                    </label>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPackageForm({
                            ...packageForm,
                            is_active: packageForm.is_active === 1 ? 0 : 1,
                          })
                        }
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${packageForm.is_active === 1 ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${packageForm.is_active === 1 ? "translate-x-6" : "translate-x-0"
                            }`}
                        />
                      </button>
                      <span className="font-bold text-xs text-slate-700">
                        {packageForm.is_active === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer matching Image 3 */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatePackageOpen(false);
                      setIsEditPackageOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs shadow-xs transition-colors"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isEditPackageOpen ? "Update Package" : "Create Package"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: VIEW DETAILS (Side Window / Modal for Service or Package)        */}
        {/* ========================================================================= */}
        {viewDetailModal && (
          <Modal
            isOpen={!!viewDetailModal}
            onClose={() => setViewDetailModal(null)}
            title={
              viewDetailModal.type === "service"
                ? `Service: ${viewDetailModal.data.name}`
                : `Package: ${viewDetailModal.data.name}`
            }
            maxWidth="md"
          >
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border flex items-center justify-center shrink-0">
                  {viewDetailModal.type === "service" ? (
                    getServiceIcon(viewDetailModal.data.name)
                  ) : (
                    <Package className="w-6 h-6 text-slate-700" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">
                    {viewDetailModal.data.name}
                  </h3>
                  <p className="text-slate-500">
                    {viewDetailModal.type === "service"
                      ? viewDetailModal.data.subtitle || "Manual & Automatic"
                      : viewDetailModal.data.package_type || "Lesson Package"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Price
                  </span>
                  <span className="text-lg font-heading font-black text-slate-900">
                    ${Number(viewDetailModal.data.price_aud || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Duration
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {viewDetailModal.type === "service"
                      ? `${viewDetailModal.data.duration_minutes} Minutes`
                      : `${viewDetailModal.data.lesson_count} Lessons (${viewDetailModal.data.duration_per_lesson}m each)`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Status
                  </span>
                  <span className="font-bold text-emerald-700">
                    {viewDetailModal.data.is_active === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Bookings Associated
                  </span>
                  <span className="font-bold text-slate-800">
                    {viewDetailModal.data.booking_count || 0} Bookings
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-700 block font-bold mb-1">Description</span>
                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {viewDetailModal.data.description || "No description provided."}
                </p>
              </div>

              <div>
                <span className="text-slate-700 block font-bold mb-1.5">Included Features</span>
                <div className="space-y-1">
                  {(
                    (viewDetailModal.type === "service"
                      ? viewDetailModal.data.included_features
                      : viewDetailModal.data.features) || []
                  ).map((f: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setViewDetailModal(null)}
                  className="px-4 py-2 rounded-xl border text-slate-700 font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = viewDetailModal.data;
                    const type = viewDetailModal.type;
                    setViewDetailModal(null);
                    if (type === "service") handleOpenEditService(item);
                    else handleOpenEditPackage(item);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0B1528] text-white font-bold hover:bg-[#152544]"
                >
                  Edit {viewDetailModal.type === "service" ? "Service" : "Package"}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <ConfirmModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            title={`Delete ${deleteTarget.type === "service" ? "Service" : "Package"}`}
            message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            variant="danger"
          />
        )}
      </div>
    </AdminLayout>
  );
}
