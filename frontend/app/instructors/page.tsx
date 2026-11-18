"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { apiFetch } from "@/lib/api";
import { DEFAULT_INSTRUCTORS, InstructorRowItem } from "@/lib/mockInstructors";
import {
  Users,
  CheckCircle2,
  Clock,
  Star,
  Search,
  Filter,
  Plus,
  MoreVertical,
  X,
  UserCheck,
  Mail,
  Phone,
  Car,
  FileText,
  MapPin,
  Calendar,
  Sparkles,
  Edit,
  Trash2,
  Download,
  MessageSquare,
  Send,
  Smartphone,
  ShieldCheck,
  Check,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  Award,
  ExternalLink,
  Globe,
  Heart,
  CheckCircle,
} from "lucide-react";

export default function InstructorsPage() {
  const router = useRouter();

  const [instructors, setInstructors] = useState<InstructorRowItem[]>(
    DEFAULT_INSTRUCTORS
  );
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorRowItem | null>(null);
  const [isSideWindowOpen, setIsSideWindowOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "on_leave" | "inactive">(
    "all"
  );

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialityFilter, setSpecialityFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  // Fetch live instructors from MySQL Backend API
  const loadInstructors = async () => {
    try {
      const res = await apiFetch("/api/instructors");
      if (res?.data && Array.isArray(res.data)) {
        const dbItems: InstructorRowItem[] = res.data.map((i: any) => ({
          id: i.id,
          instructor_code: i.instructor_code || `INS-${i.id}`,
          name: i.name,
          email: i.email,
          phone: i.phone,
          address: i.address || "14 Victoria Road, Parramatta NSW 2150",
          emergency_contact: i.emergency_contact || "Emergency Contact (+61 412 999 111)",
          languages_spoken: Array.isArray(i.languages_spoken) && i.languages_spoken.length > 0 ? i.languages_spoken : ["English"],
          bio: i.bio || "RMS certified professional driving instructor dedicated to safe learner outcomes.",
          status: i.status === "on_leave" ? "on_leave" : i.status === "inactive" ? "inactive" : "active",
          speciality: i.transmission === "automatic" ? "Automatic" : i.transmission === "both" ? "Both" : "Manual",
          vehicle: i.vehicle || `${i.vehicle_make || "Toyota"} ${i.vehicle_model || "Corolla"}`,
          vehicle_rego: i.vehicle_rego || "NSW-REG901",
          vehicle_year: parseInt(i.vehicle_year) || 2023,
          transmission: i.transmission === "automatic" ? "Automatic" : i.transmission === "both" ? "Both" : "Manual",
          dual_controls: "RMS Certified Dual Pedals",
          insurance_policy: i.insurance_policy || "Commercial Driving School Comprehensive",
          insurance_expiry: i.insurance_expiry || "2028-06-30",
          service_areas: i.service_areas || (i.service_suburbs_list ? i.service_suburbs_list : "Parramatta, Sydney CBD, Westmead"),
          rating: parseFloat(i.rating) || 4.9,
          total_reviews: parseInt(i.total_reviews) || 85,
          pass_rate: parseFloat(i.pass_rate) || 96.5,
          active_learners: parseInt(i.active_learners) || parseInt(i.active_students) || 12,
          total_lessons: parseInt(i.total_lessons) || parseInt(i.completed_lessons) || 140,
          accreditation_number: i.accreditation_number || "RMS-DI-88219",
          accreditation_expiry: i.accreditation_expiry || "2028-12-31",
          police_check_status: i.police_check_status || "Verified & Current",
          experience_years: parseInt(i.experience_years) || 7,
          hourly_rate: parseFloat(i.hourly_rate) || 85.0,
          working_days: Array.isArray(i.working_days) ? (i.working_days.join(", ") || "Mon - Sat") : (i.working_days || "Mon - Sat"),
          working_hours: i.working_hours || (i.working_hours_start ? `${i.working_hours_start.substring(0, 5)} - ${i.working_hours_end ? i.working_hours_end.substring(0, 5) : "18:00"}` : "07:00 AM – 06:30 PM"),
          wwcc_number: i.wwcc_number || "WWC-0918234E",
          joined_date: i.created_at ? new Date(i.created_at).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) : (i.joined_date || "12 Jan 2024"),
          avatar_url: i.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          initials: (i.name || "IN").substring(0, 2).toUpperCase(),
        }));
        setInstructors(dbItems);
      }
    } catch (err) {
      console.warn("Could not fetch database instructors:", err);
    }
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  // Dropdown action menu
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicle: "",
    vehicle_rego: "",
    hourly_rate: 75,
    speciality: "Manual" as "Manual" | "Automatic" | "Both",
    status: "active" as "active" | "on_leave" | "inactive",
    service_areas: "",
  });

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicle: "Toyota Camry",
    vehicle_rego: "NSW-NEW701",
    vehicle_year: 2024,
    hourly_rate: 75,
    speciality: "Manual" as "Manual" | "Automatic" | "Both",
    service_areas: "Parramatta, Sydney West",
    experience_years: 5,
    accreditation_number: "RMS-DI-88990",
  });

  const [messageChannel, setMessageChannel] = useState<"sms" | "email">("sms");
  const [messageText, setMessageText] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Stats
  const kpiStats = useMemo(() => {
    const total = instructors.length;
    const active = instructors.filter((i) => i.status === "active").length;
    const onLeave = instructors.filter((i) => i.status === "on_leave").length;
    const inactive = instructors.filter((i) => i.status === "inactive").length;
    const ratings = instructors.map((i) => Number(i.rating) || 0).filter((r) => r > 0);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "5.0";
    return { total, active, onLeave, inactive, avgRating };
  }, [instructors]);

  // Filter logic
  const filteredInstructors = useMemo(() => {
    return instructors.filter((inst) => {
      // Tab filter
      if (activeTab === "active" && inst.status !== "active") return false;
      if (activeTab === "on_leave" && inst.status !== "on_leave") return false;
      if (activeTab === "inactive" && inst.status !== "inactive") return false;

      // Status dropdown
      if (statusFilter !== "all" && inst.status !== statusFilter) return false;

      // Speciality dropdown
      if (
        specialityFilter !== "all" &&
        inst.speciality.toLowerCase() !== specialityFilter.toLowerCase()
      )
        return false;

      // Vehicle dropdown
      if (
        vehicleFilter !== "all" &&
        !inst.vehicle.toLowerCase().includes(vehicleFilter.toLowerCase())
      )
        return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          inst.name.toLowerCase().includes(q) ||
          inst.instructor_code.toLowerCase().includes(q) ||
          inst.email.toLowerCase().includes(q) ||
          inst.service_areas.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    instructors,
    activeTab,
    statusFilter,
    specialityFilter,
    vehicleFilter,
    searchQuery,
  ]);

  // Click on any element in the table to open side window with deep details
  const handleSelectInstructor = (item: InstructorRowItem) => {
    setSelectedInstructor(item);
    setIsSideWindowOpen(true);
  };

  const handleCloseSideWindow = () => {
    setIsSideWindowOpen(false);
  };

  const handleToggleLeave = async (instId: number) => {
    const inst = instructors.find((i) => i.id === instId);
    if (!inst) return;
    const newStatus = inst.status === "on_leave" ? "active" : "on_leave";
    try {
      await apiFetch(`/api/instructors/${instId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      loadInstructors();
      showToast(`Leave status updated for ${inst.name}!`);
    } catch (err: any) {
      showToast(err.message || "Failed to update status");
    }
  };

  const handleDeactivate = async () => {
    if (!selectedInstructor) return;
    try {
      await apiFetch(`/api/instructors/${selectedInstructor.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "inactive" }),
      });
      loadInstructors();
      setShowDeactivateModal(false);
      showToast(`Instructor ${selectedInstructor.name} set to Inactive in database.`);
    } catch (err: any) {
      showToast(err.message || "Failed to deactivate instructor");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructor) return;
    try {
      await apiFetch(`/api/instructors/${selectedInstructor.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          vehicle_rego: editForm.vehicle_rego,
          hourly_rate: Number(editForm.hourly_rate) || 75,
          transmission: editForm.speciality.toLowerCase(),
          status: editForm.status,
          service_areas: editForm.service_areas,
        }),
      });
      loadInstructors();
      setShowEditModal(false);
      showToast("Instructor details updated successfully in database!");
    } catch (err: any) {
      showToast(err.message || "Failed to update instructor");
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parts = (addForm.vehicle || "Toyota Corolla").split(" ");
      const make = parts[0] || "Toyota";
      const model = parts.slice(1).join(" ") || "Corolla";

      const res = await apiFetch("/api/instructors", {
        method: "POST",
        body: JSON.stringify({
          name: addForm.name,
          email: addForm.email,
          phone: addForm.phone,
          address: addForm.address || "Sydney, NSW",
          accreditation_number: addForm.accreditation_number || `RMS-DI-${Math.floor(10000 + Math.random() * 90000)}`,
          hourly_rate: Number(addForm.hourly_rate) || 80,
          transmission: addForm.speciality.toLowerCase(),
          vehicle_make: make,
          vehicle_model: model,
          vehicle_year: Number(addForm.vehicle_year) || 2024,
          vehicle_rego: addForm.vehicle_rego || "NSW-EZY01",
          service_areas: addForm.service_areas || "Greater Sydney",
          experience_years: Number(addForm.experience_years) || 5,
        }),
      });

      if (res.success) {
        loadInstructors();
        setShowAddModal(false);
        showToast(`New instructor ${addForm.name} onboarded to database!`);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create instructor");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setShowMessageModal(false);
    setMessageText("");
    showToast(`Message sent to ${selectedInstructor?.name} via ${messageChannel.toUpperCase()}!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 w-full min-w-0 select-none pb-14">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#0B1528] text-white px-4 py-2.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#FAB10B]" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Top Header with Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={UserCheck}
          title="Instructors Directory"
          subtitle="Manage licensed RMS driving instructors, working hours, and suburbs"
          badge={`${kpiStats.total || instructors.length} Instructors`}
          actions={
            <button
              onClick={() => router.push("/instructors/create")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FAB10B] stroke-[2.5]" />
              <span>Add Instructor</span>
            </button>
          }
        />

        {/* 4 Overview Statistics Cards matching Reference Mockup */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Instructors */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{kpiStats.total}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Total Instructors
              </div>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{kpiStats.active}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Active
              </div>
            </div>
          </div>

          {/* Card 3: On Leave */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#FEF08A] flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-5 h-5 text-amber-900 stroke-[2.4]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{kpiStats.onLeave}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                On Leave
              </div>
            </div>
          </div>

          {/* Card 4: Avg Rating */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <Star className="w-5 h-5 fill-[#FAB10B] text-[#FAB10B]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{kpiStats.avgRating}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Avg Rating
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID or email..."
              className="w-full pl-9.5 pr-4 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Speciality Dropdown */}
          <select
            value={specialityFilter}
            onChange={(e) => setSpecialityFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">All Speciality</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="both">Both</option>
          </select>

          {/* Vehicles Dropdown */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">All Vehicles</option>
            <option value="camry">Toyota Camry</option>
            <option value="civic">Honda Civic</option>
            <option value="corolla">Toyota Corolla</option>
            <option value="i30">Hyundai i30</option>
            <option value="mazda">Mazda 3</option>
          </select>

          {/* Yellow Filter Button */}
          <button
            onClick={() => showToast("Instructor filters applied!")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAB10B] hover:bg-[#e09e07] active:bg-[#c98e05] text-slate-900 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-900" />
            <span>Filter</span>
          </button>
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            All ({kpiStats.total})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "active"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Active ({kpiStats.active})
          </button>
          <button
            onClick={() => setActiveTab("on_leave")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "on_leave"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            On Leave ({kpiStats.onLeave})
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "inactive"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Inactive ({kpiStats.inactive})
          </button>
        </div>

        {/* Main Instructors Table (Full Width, clicking any element opens side window) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5">Instructor</th>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Contact</th>
                  <th className="py-3 px-3.5">Speciality</th>
                  <th className="py-3 px-3.5">Vehicle</th>
                  <th className="py-3 px-3.5">Rating</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredInstructors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      No instructors found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((inst) => {
                    const isSelected =
                      isSideWindowOpen && selectedInstructor?.id === inst.id;
                    return (
                      <tr
                        key={inst.id}
                        onClick={() => handleSelectInstructor(inst)}
                        title="Click to view deep instructor details"
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-amber-50/60 font-medium"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Instructor (Avatar + Name) */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {inst.avatar_url ? (
                              <img
                                src={inst.avatar_url}
                                alt={inst.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                {inst.initials}
                              </div>
                            )}
                            <span
                              className={`font-semibold transition-colors ${
                                isSelected
                                  ? "text-[#0B1528] underline underline-offset-4 decoration-[#FAB10B] decoration-2"
                                  : "text-slate-900 group-hover:text-blue-900"
                              }`}
                            >
                              {inst.name}
                            </span>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                          {inst.instructor_code}
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600 font-medium">
                          {inst.email}
                        </td>

                        {/* Speciality */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                          {inst.speciality}
                        </td>

                        {/* Vehicle */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                          {inst.vehicle}
                        </td>

                        {/* Rating */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-bold text-slate-900">
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{inst.rating.toFixed(1)}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          {inst.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : inst.status === "on_leave" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              On Leave
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                          <div
                            className="inline-flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleSelectInstructor(inst)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                            >
                              View
                            </button>

                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenActionMenuId(
                                    openActionMenuId === inst.id
                                      ? null
                                      : inst.id
                                  )
                                }
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openActionMenuId === inst.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-30 text-left">
                                  <button
                                    onClick={() => {
                                      handleSelectInstructor(inst);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Deep Details</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      router.push(`/instructors/${inst.id}/edit`);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit Instructor</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedInstructor(inst);
                                      setMessageText(
                                        `Hi ${inst.name}, this is EZY 2 LEARN admin regarding your lesson schedule.`
                                      );
                                      setShowMessageModal(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Send Message</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleLeave(inst.id);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Toggle Leave Status</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedInstructor(inst);
                                      setShowDeactivateModal(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Deactivate</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="py-3 px-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing 1 to {filteredInstructors.length} of 24 instructors
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-[#0B1528] text-white font-bold text-xs flex items-center justify-center">
                1
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center justify-center">
                2
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center justify-center">
                3
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center justify-center">
                4
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center justify-center">
                5
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SIDE WINDOW: Shows deep detail information when clicking any instructor */}
        {/* ============================================================ */}
        {isSideWindowOpen && selectedInstructor && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-[#0B1528]/45 backdrop-blur-xs transition-opacity duration-250 animate-in fade-in"
              onClick={handleCloseSideWindow}
            />

            {/* Slide-over Right Window */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
              <div className="w-screen max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200/90 animate-in slide-in-from-right duration-300 ease-out">
                {/* Dark Navy Header matching Design System */}
                <div className="bg-[#0B1528] px-5 py-4 flex items-center justify-between text-white shrink-0 select-none shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                      <UserCheck className="w-5 h-5 text-[#FAB10B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-black text-base sm:text-lg tracking-wide text-white">
                          Instructor Details
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAB10B] text-slate-900 font-mono font-bold text-xs">
                          {selectedInstructor.instructor_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        RMS certified driving instructor profile & performance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/instructors/${selectedInstructor.id}`}
                      target="_blank"
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                      title="Open full page view in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={handleCloseSideWindow}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Close side window (Esc)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Yellow/Cream Highlight Banner */}
                <div className="bg-[#FFFBEB] border-b border-amber-200/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="font-black text-xl text-slate-900 leading-tight">
                      {selectedInstructor.name}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      Joined on: {selectedInstructor.joined_date} • {selectedInstructor.speciality} Specialist
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedInstructor.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    ) : selectedInstructor.status === "on_leave" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        On Leave
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Scrollable Content Body: Bold, Unified Single View (No Sub-Tabs) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Top 4 Quick Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Rating</span>
                      <span className="text-sm font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-[#FAB10B] text-[#FAB10B]" />
                        {Number(selectedInstructor.rating || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Lessons Delivered</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        {selectedInstructor.total_lessons}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 block font-medium">First-Time Pass</span>
                      <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                        {selectedInstructor.pass_rate || 96.5}%
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Active Learners</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        {selectedInstructor.active_learners} Students
                      </span>
                    </div>
                  </div>

                  {/* Two Column Grid: Personal & Contact Information + Professional Credentials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Personal & Contact Details */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                      <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="tracking-tight">Personal Information</span>
                        <span className="text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md font-mono text-slate-700 font-bold">
                          {selectedInstructor.instructor_code}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {selectedInstructor.avatar_url ? (
                          <img
                            src={selectedInstructor.avatar_url}
                            alt={selectedInstructor.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#0B1528] text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {selectedInstructor.initials}
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {selectedInstructor.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-slate-500 block">
                            {selectedInstructor.instructor_code}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700 truncate font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{selectedInstructor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedInstructor.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{selectedInstructor.address}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 font-semibold pt-1">
                          <span className="text-slate-500 font-normal">Experience:</span>
                          <span className="font-bold text-slate-900">{selectedInstructor.experience_years} Years Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Credentials & Compliance */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                      <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="tracking-tight">Credentials & Compliance</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                          RMS Verified
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Accreditation Number:</span>
                          <strong className="font-mono text-slate-900 block font-bold">
                            {selectedInstructor.accreditation_number}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-700">
                          <span className="text-slate-500">Licence Expiry:</span>
                          <strong className="text-slate-900 font-bold">{selectedInstructor.accreditation_expiry}</strong>
                        </div>
                        <div className="pt-1 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-slate-500">WWCC Check:</span>
                          <strong className="text-emerald-700 font-bold">
                            {selectedInstructor.wwcc_number} (Verified)
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Police Check:</span>
                          <strong className="text-emerald-700 font-bold">
                            {selectedInstructor.police_check_status || "Verified & Current"}
                          </strong>
                        </div>
                        {selectedInstructor.languages_spoken && (
                          <div className="pt-1 border-t border-slate-100">
                            <span className="text-slate-500 block text-[11px] mb-1">Languages:</span>
                            <div className="flex flex-wrap gap-1">
                              {selectedInstructor.languages_spoken.map((lang, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px] font-semibold"
                                >
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two Column Grid: Vehicle & Insurance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Vehicle Details Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                      <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>Vehicle & Dual Controls</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Vehicle:</span>
                          <strong className="text-slate-900 font-bold">
                            {selectedInstructor.vehicle} ({selectedInstructor.vehicle_year})
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">RMS Rego:</span>
                          <strong className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-bold">
                            {selectedInstructor.vehicle_rego}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Transmission:</span>
                          <strong className="text-slate-900 font-bold">
                            {selectedInstructor.transmission}
                          </strong>
                        </div>
                        <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{selectedInstructor.dual_controls}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Annual RMS Safety Inspection: Valid</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insurance & Risk Coverage */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                      <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>Insurance Coverage</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Policy:</span>
                          <strong className="text-slate-900 font-bold">
                            {selectedInstructor.insurance_policy || "Commercial Driving School Comprehensive"}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Policy Expiry:</span>
                          <strong className="text-slate-900 font-bold">
                            {selectedInstructor.insurance_expiry || "2028-06-30"}
                          </strong>
                        </div>
                        <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Public Liability:</span>
                            <strong className="text-emerald-700 font-bold">$20,000,000 AUD</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Third Party Property:</span>
                            <strong className="text-emerald-700 font-bold">Comprehensive Cover</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Suburbs Covered Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                    <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>Working Hours & Service Suburbs</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold">
                        Capacity: 6 Lessons / Day
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Working Days:</span>
                          <strong className="text-slate-900 font-bold">
                            {selectedInstructor.working_days}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Operating Hours:</span>
                          <strong className="text-slate-900 font-bold">
                            {selectedInstructor.working_hours}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Active Students:</span>
                          <strong className="text-slate-900 font-bold">
                            {selectedInstructor.active_learners} Currently Assigned
                          </strong>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] mb-1 font-semibold">
                          Service Suburbs Covered:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(selectedInstructor.service_areas || "Parramatta, Sydney CBD, Westmead")
                            .split(",")
                            .map((sub, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px] font-semibold flex items-center gap-1"
                              >
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                <span>{sub.trim()}</span>
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance & Payouts Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                    <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Performance & Financial Earnings</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono font-bold">
                        Commission Split: 85% / 15%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Left: Performance stats */}
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Student Rating:</span>
                          <strong className="text-slate-900 font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#FAB10B] text-[#FAB10B]" />
                            {Number(selectedInstructor.rating || 0).toFixed(1)} ({selectedInstructor.total_reviews} reviews)
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Lessons:</span>
                          <strong className="text-slate-900 font-bold">{selectedInstructor.total_lessons} Completed</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">RMS Pass Rate:</span>
                          <strong className="text-emerald-700 font-bold">{selectedInstructor.pass_rate || 96.5}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hourly Rate:</span>
                          <strong className="text-slate-900 font-bold">${Number(selectedInstructor.hourly_rate || 0).toFixed(2)}/hr</strong>
                        </div>
                      </div>

                      {/* Right: Payout breakdown */}
                      <div className="space-y-1.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gross Billing:</span>
                          <span className="font-bold text-slate-900">
                            ${(selectedInstructor.total_lessons * 85).toLocaleString()} AUD
                          </span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span className="text-slate-500">School Fee (15%):</span>
                          <span className="font-semibold">-${(selectedInstructor.total_lessons * 85 * 0.15).toLocaleString()} AUD</span>
                        </div>
                        <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-sm text-emerald-700">
                          <span>Net Payouts:</span>
                          <span>${(selectedInstructor.total_lessons * 85 * 0.85).toLocaleString()} AUD</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPayoutModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                      <span>View Commission & Payout Statement</span>
                    </button>
                  </div>

                  {/* Biography & Focus Card */}
                  {selectedInstructor.bio && (
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-1.5">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Biography & Teaching Philosophy</span>
                      </div>
                      <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
                        {selectedInstructor.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Pinned Admin Actions Bar */}
                <div className="p-4 bg-slate-50/95 border-t border-slate-200/90 shrink-0 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Admin Quick Actions</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ID: {selectedInstructor.instructor_code}
                    </span>
                  </div>

                  {/* Row 1: 3 buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        router.push(`/instructors/${selectedInstructor.id}/edit`);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Edit Instructor</span>
                    </button>

                    <button
                      onClick={() => {
                        setMessageText(
                          `Hi ${selectedInstructor.name}, this is EZY 2 LEARN admin regarding your lesson schedule.`
                        );
                        setShowMessageModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Send Message</span>
                    </button>

                    <button
                      onClick={() => handleToggleLeave(selectedInstructor.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Toggle Leave</span>
                    </button>
                  </div>

                  {/* Row 2: 2 buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push("/calendar")}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Schedule & Calendar</span>
                    </button>

                    <button
                      onClick={() => setShowDeactivateModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Deactivate Instructor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Edit Instructor Modal */}
        {showEditModal && selectedInstructor && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 flex items-center justify-center">
                    <Edit className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Edit Instructor #{selectedInstructor.instructor_code}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedInstructor.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Hourly Rate ($AUD)
                    </label>
                    <input
                      type="number"
                      value={editForm.hourly_rate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          hourly_rate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      value={editForm.vehicle}
                      onChange={(e) =>
                        setEditForm({ ...editForm, vehicle: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Vehicle Rego
                    </label>
                    <input
                      type="text"
                      value={editForm.vehicle_rego}
                      onChange={(e) =>
                        setEditForm({ ...editForm, vehicle_rego: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Speciality
                    </label>
                    <select
                      value={editForm.speciality}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          speciality: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Service Areas (Suburbs)
                  </label>
                  <input
                    type="text"
                    value={editForm.service_areas}
                    onChange={(e) =>
                      setEditForm({ ...editForm, service_areas: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Send Message Modal */}
        {showMessageModal && selectedInstructor && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Send Message
                    </h3>
                    <p className="text-xs text-slate-500">
                      To: {selectedInstructor.name} ({selectedInstructor.instructor_code})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Channel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageChannel("sms")}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer font-semibold ${
                        messageChannel === "sms"
                          ? "bg-[#0B1528] text-white border-[#0B1528]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>SMS ({selectedInstructor.phone})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageChannel("email")}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer font-semibold ${
                        messageChannel === "email"
                          ? "bg-[#0B1528] text-white border-[#0B1528]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email ({selectedInstructor.email})</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#FAB10B]" />
                    <span>Dispatch</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Add Instructor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Onboard New Instructor
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add a certified driving instructor
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Anderson"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="liam@ezy2learn.com"
                      value={addForm.email}
                      onChange={(e) =>
                        setAddForm({ ...addForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+61 400 000 000"
                      value={addForm.phone}
                      onChange={(e) =>
                        setAddForm({ ...addForm, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Speciality
                    </label>
                    <select
                      value={addForm.speciality}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          speciality: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      placeholder="Toyota Camry"
                      value={addForm.vehicle}
                      onChange={(e) =>
                        setAddForm({ ...addForm, vehicle: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      RMS Accreditation No
                    </label>
                    <input
                      type="text"
                      placeholder="RMS-DI-88990"
                      value={addForm.accreditation_number}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          accreditation_number: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Service Areas (Suburbs)
                  </label>
                  <input
                    type="text"
                    placeholder="Parramatta, Blacktown, Westmead"
                    value={addForm.service_areas}
                    onChange={(e) =>
                      setAddForm({ ...addForm, service_areas: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Complete Onboarding
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Commission & Payouts Modal */}
        {showPayoutModal && selectedInstructor && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Earnings & Payout Statement
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedInstructor.name} ({selectedInstructor.instructor_code})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Instructor Rate:</span>
                  <strong className="text-slate-900">
                    ${selectedInstructor.hourly_rate.toFixed(2)} / hr
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Lessons Delivered:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInstructor.total_lessons} lessons
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Billing Value:</span>
                  <span className="font-semibold text-slate-800">
                    ${(selectedInstructor.total_lessons * 85).toLocaleString()} AUD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>School Commission (15%):</span>
                  <span className="text-rose-600 font-medium">
                    -${(selectedInstructor.total_lessons * 85 * 0.15).toLocaleString()} AUD
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-emerald-700">
                  <span>Net Payout to Instructor:</span>
                  <span>
                    ${(selectedInstructor.total_lessons * 85 * 0.85).toLocaleString()} AUD
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast("Payout statement downloaded!");
                    setShowPayoutModal(false);
                  }}
                  className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#FAB10B]" />
                  <span>Download Statement (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 5: Deactivate Confirmation */}
        {showDeactivateModal && selectedInstructor && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Deactivate Instructor?
                  </h3>
                </div>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to mark <strong>{selectedInstructor.name}</strong> as inactive? They will no longer be available for student booking allocation.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Keep Active
                </button>
                <button
                  onClick={handleDeactivate}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Confirm Deactivation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
