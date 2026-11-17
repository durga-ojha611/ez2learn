"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Drawer } from "@/components/common/Drawer";
import { Modal } from "@/components/common/Modal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiFetch } from "@/lib/api";
import {
  Plus,
  Search,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Car,
  Clock,
  ShieldCheck,
  Calendar,
  CheckCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  UserCheck,
  PauseCircle,
  PlayCircle,
  Trash2,
  Users,
  BookOpen,
  Filter,
  MessageSquare,
  Send,
  Smartphone,
  Bell,
  Mail,
  Phone,
  MapPin,
  Check,
} from "lucide-react";

interface InstructorItem {
  id: number;
  instructor_code: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  status: "active" | "on_leave" | "onboarding" | "inactive";
  speciality: "Manual" | "Automatic" | "Both";
  vehicle: string;
  vehicle_rego: string;
  vehicle_year?: number;
  service_areas: string;
  rating: number;
  total_reviews: number;
  active_learners: number;
  total_lessons: number;
  accreditation_number: string;
  accreditation_expiry?: string;
  experience_years: number;
  working_days: string[];
  working_hours: string;
  avatar_url?: string;
  initials: string;
}

const DEFAULT_INSTRUCTORS: InstructorItem[] = [
  {
    id: 1,
    instructor_code: "INST-001",
    name: "Daniel Okafor",
    email: "daniel@ezy2learn.com",
    phone: "+61 412 111 222",
    address: "14 Victoria Road, Parramatta NSW 2150",
    status: "active",
    speciality: "Manual",
    vehicle: "Toyota Camry",
    vehicle_rego: "NSW-CAM901",
    vehicle_year: 2023,
    service_areas: "Parramatta, Harris Park, Rosehill, Westmead",
    rating: 4.9,
    total_reviews: 142,
    active_learners: 18,
    total_lessons: 384,
    accreditation_number: "RMS-DI-88219",
    accreditation_expiry: "2028-06-30",
    experience_years: 9,
    working_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    working_hours: "08:00 - 18:00",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "DO",
  },
  {
    id: 2,
    instructor_code: "INST-002",
    name: "Priya Nair",
    email: "priya@ezy2learn.com",
    phone: "+61 423 222 333",
    address: "28 Station Road, Westmead NSW 2145",
    status: "active",
    speciality: "Automatic",
    vehicle: "Honda Civic",
    vehicle_rego: "NSW-CIV410",
    vehicle_year: 2024,
    service_areas: "Westmead, Wentworthville, Blacktown, Seven Hills",
    rating: 4.8,
    total_reviews: 118,
    active_learners: 15,
    total_lessons: 312,
    accreditation_number: "RMS-DI-88220",
    accreditation_expiry: "2027-11-15",
    experience_years: 7,
    working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    working_hours: "08:30 - 17:30",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    initials: "PN",
  },
  {
    id: 3,
    instructor_code: "INST-003",
    name: "Marcus Bell",
    email: "marcus@ezy2learn.com",
    phone: "+61 434 333 444",
    address: "88 Flushcombe Road, Blacktown NSW 2148",
    status: "active",
    speciality: "Manual",
    vehicle: "Toyota Corolla",
    vehicle_rego: "NSW-COR772",
    vehicle_year: 2022,
    service_areas: "Blacktown, Doonside, Marayong, Prospect",
    rating: 4.7,
    total_reviews: 96,
    active_learners: 12,
    total_lessons: 260,
    accreditation_number: "RMS-DI-88221",
    accreditation_expiry: "2028-01-20",
    experience_years: 6,
    working_days: ["Mon", "Wed", "Thu", "Fri", "Sat"],
    working_hours: "09:00 - 18:00",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    initials: "MB",
  },
  {
    id: 4,
    instructor_code: "INST-004",
    name: "Sofia Reyes",
    email: "sofia@ezy2learn.com",
    phone: "+61 445 444 555",
    address: "12 Macquarie Street, Liverpool NSW 2170",
    status: "on_leave",
    speciality: "Automatic",
    vehicle: "Hyundai i30",
    vehicle_rego: "NSW-HYU305",
    vehicle_year: 2023,
    service_areas: "Liverpool, Casula, Moorebank, Cabramatta",
    rating: 4.8,
    total_reviews: 104,
    active_learners: 14,
    total_lessons: 295,
    accreditation_number: "RMS-DI-88222",
    accreditation_expiry: "2029-04-10",
    experience_years: 8,
    working_days: ["Mon", "Tue", "Thu", "Fri", "Sat"],
    working_hours: "08:00 - 17:00",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    initials: "SR",
  },
  {
    id: 5,
    instructor_code: "INST-005",
    name: "David Kim",
    email: "david@ezy2learn.com",
    phone: "+61 456 555 666",
    address: "5 Railway Street, Chatswood NSW 2067",
    status: "active",
    speciality: "Manual",
    vehicle: "Mazda 3",
    vehicle_rego: "NSW-MAZ318",
    vehicle_year: 2024,
    service_areas: "Chatswood, Artarmon, Roseville, Willoughby",
    rating: 4.9,
    total_reviews: 130,
    active_learners: 16,
    total_lessons: 340,
    accreditation_number: "RMS-DI-88223",
    accreditation_expiry: "2028-09-12",
    experience_years: 10,
    working_days: ["Tue", "Wed", "Thu", "Fri", "Sat"],
    working_hours: "08:00 - 18:30",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    initials: "DK",
  },
];

export default function InstructorsPage() {
  const router = useRouter();

  // 4 Overview Statistics Cards matching Reference Mockup
  const [stats, setStats] = useState({
    total_instructors: 24,
    active: 22,
    on_leave: 2,
    avg_rating: 4.8,
  });

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialityFilter, setSpecialityFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Instructors List
  const [instructors, setInstructors] = useState<InstructorItem[]>(DEFAULT_INSTRUCTORS);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorItem>(DEFAULT_INSTRUCTORS[0]);

  // Drawers
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  // Edit / Add Form State
  const [instructorForm, setInstructorForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active" as "active" | "on_leave" | "onboarding" | "inactive",
    speciality: "Manual" as "Manual" | "Automatic" | "Both",
    vehicle: "Toyota Camry",
    vehicle_rego: "NSW-REG999",
    service_areas: "Parramatta, Westmead",
    experience_years: 5,
    accreditation_number: "RMS-DI-88999",
  });

  // Message Form State
  const [messageChannel, setMessageChannel] = useState<"sms" | "email">("sms");
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Open Edit Drawer
  const handleOpenEdit = (inst: InstructorItem) => {
    setSelectedInstructor(inst);
    setInstructorForm({
      name: inst.name,
      email: inst.email,
      phone: inst.phone,
      address: inst.address || "",
      status: inst.status,
      speciality: inst.speciality,
      vehicle: inst.vehicle,
      vehicle_rego: inst.vehicle_rego,
      service_areas: inst.service_areas,
      experience_years: inst.experience_years,
      accreditation_number: inst.accreditation_number,
    });
    setOpenMenuId(null);
    setEditDrawerOpen(true);
  };

  // Open Message Drawer
  const handleOpenMessage = (inst: InstructorItem) => {
    setSelectedInstructor(inst);
    setMessageText(
      `Hi ${inst.name}, this is EZY 2 LEARN admin. Please review your updated student lesson schedule for this week.`
    );
    setOpenMenuId(null);
    setMessageDrawerOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setInstructors((prev) =>
      prev.map((inst) =>
        inst.id === selectedInstructor.id
          ? {
              ...inst,
              ...instructorForm,
            }
          : inst
      )
    );
    setEditDrawerOpen(false);
    alert(`Instructor ${instructorForm.name} updated successfully!`);
  };

  // Save New Instructor
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `INST-${String(instructors.length + 1).padStart(3, "0")}`;
    const initials = instructorForm.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const newInst: InstructorItem = {
      id: Date.now(),
      instructor_code: newCode,
      name: instructorForm.name,
      email: instructorForm.email,
      phone: instructorForm.phone,
      address: instructorForm.address,
      status: instructorForm.status,
      speciality: instructorForm.speciality,
      vehicle: instructorForm.vehicle,
      vehicle_rego: instructorForm.vehicle_rego,
      service_areas: instructorForm.service_areas,
      rating: 5.0,
      total_reviews: 0,
      active_learners: 0,
      total_lessons: 0,
      accreditation_number: instructorForm.accreditation_number,
      experience_years: instructorForm.experience_years,
      working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      working_hours: "08:00 - 18:00",
      initials,
    };

    setInstructors((prev) => [newInst, ...prev]);
    setStats((prev) => ({ ...prev, total_instructors: prev.total_instructors + 1, active: prev.active + 1 }));
    setAddDrawerOpen(false);
    alert(`New instructor ${instructorForm.name} onboarded with ID ${newCode}!`);
  };

  // Dispatch Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMsg(true);
    setTimeout(() => {
      setSendingMsg(false);
      setMessageDrawerOpen(false);
      alert(`Message sent via ${messageChannel.toUpperCase()} to ${selectedInstructor.name}!`);
    }, 600);
  };

  // Filter logic
  const filteredInstructors = instructors.filter((inst) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        inst.name.toLowerCase().includes(q) ||
        inst.instructor_code.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "all" && inst.status !== statusFilter) return false;
    if (specialityFilter !== "all" && inst.speciality.toLowerCase() !== specialityFilter.toLowerCase()) return false;
    if (vehicleFilter !== "all" && !inst.vehicle.toLowerCase().includes(vehicleFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-12">
        {/* Top Header Bar matching Reference Mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Instructors
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
              Manage your driving instructors
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setInstructorForm({
                  name: "",
                  email: "",
                  phone: "",
                  address: "",
                  status: "active",
                  speciality: "Manual",
                  vehicle: "Toyota Camry",
                  vehicle_rego: "NSW-NEW001",
                  service_areas: "Parramatta, Sydney West",
                  experience_years: 5,
                  accreditation_number: "RMS-DI-88500",
                });
                setAddDrawerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0B1528] hover:bg-[#07345B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Instructor</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Statistics Cards matching Reference Mockup */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Instructors */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Instructors</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.total_instructors}
              </h3>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Active</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.active}
              </h3>
            </div>
          </div>

          {/* Card 3: On Leave */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">On Leave</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.on_leave}
              </h3>
            </div>
          </div>

          {/* Card 4: Avg Rating */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Avg Rating</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.avg_rating}
              </h3>
            </div>
          </div>
        </div>

        {/* Filters Row matching Reference Mockup */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search by name or ID */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10 transition-all shadow-xs"
            />
          </div>

          {/* Dropdown Filters & Filter Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Speciality Dropdown */}
            <div className="relative">
              <select
                value={specialityFilter}
                onChange={(e) => setSpecialityFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="all">All Speciality</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Vehicles Dropdown */}
            <div className="relative">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="all">All Vehicles</option>
                <option value="camry">Toyota Camry</option>
                <option value="civic">Honda Civic</option>
                <option value="corolla">Toyota Corolla</option>
                <option value="i30">Hyundai i30</option>
                <option value="mazda">Mazda 3</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Main Instructors Table Card matching Reference Mockup */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Speciality</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredInstructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Instructor (Avatar + Name) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {inst.avatar_url ? (
                          <img
                            src={inst.avatar_url}
                            alt={inst.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {inst.initials}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setSelectedInstructor(inst);
                            setViewDrawerOpen(true);
                          }}
                          className="font-semibold text-slate-900 hover:underline text-left"
                        >
                          {inst.name}
                        </button>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inst.instructor_code}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {inst.email}
                    </td>

                    {/* Speciality */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {inst.speciality}
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {inst.vehicle}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{inst.rating.toFixed(1)}</span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {inst.status === "active" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                      {inst.status === "on_leave" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          On Leave
                        </span>
                      )}
                      {inst.status === "inactive" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === inst.id ? null : inst.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu */}
                        {openMenuId === inst.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-xs">
                            <button
                              onClick={() => {
                                setSelectedInstructor(inst);
                                setOpenMenuId(null);
                                setViewDrawerOpen(true);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Profile
                            </button>
                            <button
                              onClick={() => handleOpenEdit(inst)}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-400" />
                              Edit Instructor
                            </button>
                            <button
                              onClick={() => handleOpenMessage(inst)}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                              Message
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => {
                                setInstructors((prev) =>
                                  prev.map((i) =>
                                    i.id === inst.id
                                      ? { ...i, status: i.status === "active" ? "on_leave" : "active" }
                                      : i
                                  )
                                );
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              Toggle Leave Status
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Bar matching Reference Mockup */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-slate-100 gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Showing 1-5 of 24 instructors
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 text-xs disabled:opacity-50"
              >
                &lt;
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0B1528] text-white text-xs font-bold shadow-xs">
                1
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                2
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                3
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                4
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                5
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* 1. VIEW INSTRUCTOR DRAWER */}
        <Drawer
          isOpen={viewDrawerOpen}
          onClose={() => setViewDrawerOpen(false)}
          title={`Instructor Profile: ${selectedInstructor.name}`}
          subtitle={`ID #${selectedInstructor.instructor_code} · ${selectedInstructor.speciality} Specialist`}
          size="xl"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        >
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              {selectedInstructor.avatar_url ? (
                <img
                  src={selectedInstructor.avatar_url}
                  alt={selectedInstructor.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center font-heading font-black text-xl shrink-0">
                  {selectedInstructor.initials}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    {selectedInstructor.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                    {selectedInstructor.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedInstructor.email} · {selectedInstructor.phone}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-700">
                  <span className="flex items-center gap-1 font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {selectedInstructor.rating} ({selectedInstructor.total_reviews} reviews)
                  </span>
                  <span>·</span>
                  <span>{selectedInstructor.active_learners} Active Learners</span>
                  <span>·</span>
                  <span>{selectedInstructor.total_lessons} Lessons Completed</span>
                </div>
              </div>
            </div>

            {/* Professional & Vehicle Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Professional Credentials
                </h4>
                <div>
                  <span className="text-slate-500 block">Accreditation Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInstructor.accreditation_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Licence Expiry</span>
                  <span className="font-bold text-slate-900">{selectedInstructor.accreditation_expiry || "2028-06-30"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Years of Experience</span>
                  <span className="font-bold text-slate-900">{selectedInstructor.experience_years} years</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Transmission Speciality</span>
                  <span className="font-bold text-slate-900">{selectedInstructor.speciality}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Vehicle Details
                </h4>
                <div>
                  <span className="text-slate-500 block">Make &amp; Model</span>
                  <span className="font-bold text-slate-900">{selectedInstructor.vehicle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Registration (RMS)</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInstructor.vehicle_rego}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vehicle Year</span>
                  <span className="font-bold text-slate-900">{selectedInstructor.vehicle_year || 2023}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Dual Controls Fitted</span>
                  <span className="font-bold text-emerald-600">Yes (RMS Certified)</span>
                </div>
              </div>
            </div>

            {/* Service Areas & Availability */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2 text-xs">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-400 mb-2">
                Service Areas &amp; Working Hours
              </h4>
              <div>
                <span className="text-slate-500 block">Assigned Service Areas</span>
                <span className="font-medium text-slate-900">{selectedInstructor.service_areas}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-500 block">Working Days</span>
                  <span className="font-bold text-slate-900">{selectedInstructor.working_days.join(", ")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Daily Hours</span>
                  <span className="font-bold text-slate-900">{selectedInstructor.working_hours}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer inside Drawer */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setViewDrawerOpen(false);
                  handleOpenEdit(selectedInstructor);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0B1528] text-white font-bold text-xs hover:bg-[#07345B] transition-all text-center"
              >
                Edit Instructor
              </button>
              <button
                onClick={() => {
                  setViewDrawerOpen(false);
                  handleOpenMessage(selectedInstructor);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Message
              </button>
            </div>
          </div>
        </Drawer>

        {/* 2. EDIT / ADD INSTRUCTOR DRAWER */}
        <Drawer
          isOpen={editDrawerOpen || addDrawerOpen}
          onClose={() => {
            setEditDrawerOpen(false);
            setAddDrawerOpen(false);
          }}
          title={addDrawerOpen ? "Add New Driving Instructor" : `Edit Instructor: ${selectedInstructor.name}`}
          subtitle="Accreditation, vehicle details and working schedule"
          size="lg"
          icon={<Edit className="w-5 h-5 text-amber-600" />}
        >
          <form onSubmit={addDrawerOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={instructorForm.name}
                onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={instructorForm.email}
                  onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={instructorForm.phone}
                  onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Speciality
                </label>
                <select
                  value={instructorForm.speciality}
                  onChange={(e) => setInstructorForm({ ...instructorForm, speciality: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Both">Both (Manual &amp; Automatic)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={instructorForm.status}
                  onChange={(e) => setInstructorForm({ ...instructorForm, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Vehicle
                </label>
                <input
                  type="text"
                  required
                  value={instructorForm.vehicle}
                  onChange={(e) => setInstructorForm({ ...instructorForm, vehicle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Rego
                </label>
                <input
                  type="text"
                  value={instructorForm.vehicle_rego}
                  onChange={(e) => setInstructorForm({ ...instructorForm, vehicle_rego: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Service Areas (Suburbs covered)
              </label>
              <input
                type="text"
                value={instructorForm.service_areas}
                onChange={(e) => setInstructorForm({ ...instructorForm, service_areas: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditDrawerOpen(false);
                  setAddDrawerOpen(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold text-xs hover:bg-[#07345B] transition-all shadow-xs"
              >
                {addDrawerOpen ? "Create Instructor" : "Save Changes"}
              </button>
            </div>
          </form>
        </Drawer>

        {/* 3. MESSAGE INSTRUCTOR DRAWER */}
        <Drawer
          isOpen={messageDrawerOpen}
          onClose={() => setMessageDrawerOpen(false)}
          title={`Message ${selectedInstructor.name}`}
          subtitle={`Dispatches operational notice to ${selectedInstructor.phone}`}
          size="md"
          icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
        >
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "sms", label: "SMS Text", icon: Smartphone },
                  { key: "email", label: "Email", icon: Mail },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isSel = messageChannel === ch.key;
                  return (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => setMessageChannel(ch.key as any)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        isSel
                          ? "border-[#0B1528] bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Message Body
              </label>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMessageDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingMsg}
                className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold text-xs hover:bg-[#07345B] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingMsg ? "Sending..." : "Send Message"}</span>
              </button>
            </div>
          </form>
        </Drawer>
      </div>
    </AdminLayout>
  );
}
