"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { apiFetch } from "@/lib/api";
import { DEFAULT_STUDENTS, StudentRowItem } from "@/lib/mockStudents";
import {
  Users,
  CheckCircle,
  CheckCircle2,
  Clock,
  Star,
  Search,
  Filter,
  Plus,
  MoreVertical,
  X,
  UserCheck,
  UserX,
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
  GraduationCap,
  BookOpen,
  CreditCard,
  RotateCcw,
} from "lucide-react";

export default function StudentsPage() {
  const router = useRouter();

  const [students, setStudents] = useState<StudentRowItem[]>(DEFAULT_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentRowItem | null>(null);
  const [isSideWindowOpen, setIsSideWindowOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "inactive" | "learner" | "provisional"
  >("all");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [licenceFilter, setLicenceFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");

  // Dropdown action menu
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  // Fetch live students from MySQL Backend API
  const loadStudents = async () => {
    try {
      const res = await apiFetch("/api/students");
      if (res?.data && Array.isArray(res.data)) {
        const dbItems: StudentRowItem[] = res.data.map((s: any) => {
          const dayHrs = Math.max(0, Math.round((parseFloat(s.nsw_logbook_hours) || 20) * 0.8));
          const nightHrs = Math.max(0, Math.round((parseFloat(s.nsw_logbook_hours) || 20) * 0.2));
          const emergStr = s.emergency_contact_name 
            ? `${s.emergency_contact_name} (${s.emergency_contact_phone || ""})`
            : "Family Contact (+61 412 999 111)";

          return {
            id: s.id,
            student_code: s.student_code || `STU-${s.id}`,
            name: s.name,
            first_name: s.first_name || (s.name ? s.name.split(" ")[0] : "Student"),
            last_name: s.last_name || (s.name && s.name.split(" ").length > 1 ? s.name.split(" ").slice(1).join(" ") : ""),
            email: s.email,
            phone: s.phone,
            date_of_birth: s.date_of_birth || "18 May 2004 (20 yrs)",
            address: s.address || "10 Bridge Street",
            location: `${s.suburb || "Sydney"}, NSW`,
            suburb: s.suburb || "Sydney",
            postcode: s.postcode || "2000",
            emergency_contact: emergStr,
            licence_type: s.licence_stage === "learner" ? "Learner" : s.licence_stage === "full_licence" ? "Full" : "Provisional",
            licence_stage_detail: s.licence_stage === "learner" ? "NSW Learner Licence (Class C)" : "NSW Provisional P1 Licence",
            licence_status: s.licence_status === "Expired" ? "Expired" : "Valid",
            licence_number: s.licence_number || `NSW-L${s.id}0912`,
            licence_expiry: "2027-05-18",
            preferred_transmission: s.preferred_transmission === "automatic" ? "Automatic" : "Manual",
            logbook_hours_day: dayHrs,
            logbook_hours_night: nightHrs,
            logbook_total_required: 120,
            driving_experience: `${s.nsw_logbook_hours || (dayHrs + nightHrs)} logbook hours logged`,
            instructor_name: s.preferred_instructor_name || "Rohan Mehta",
            instructor_code: "INS-2587",
            instructor_phone: "+61 411 223 344",
            assigned_vehicle: "Toyota Corolla (Dual Controls)",
            package_name: s.package_name || "10-Lesson Comprehensive Pack",
            lessons: parseInt(s.completed_lessons) || parseInt(s.completed_lessons_count) || 6,
            remaining_lessons: parseInt(s.remaining_lessons) || 4,
            next_lesson_datetime: "Tomorrow, 10:00 AM",
            pickup_address: s.address || `${s.suburb || "Sydney"} NSW`,
            dropoff_address: `${s.suburb || "Sydney"} Service NSW Centre`,
            status: s.status === "inactive" ? "inactive" : "active",
            total_paid: parseFloat(s.total_spent) || parseFloat(s.total_paid) || 480,
            payment_status: "paid",
            avatar_url: s.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            initials: (s.name || "ST").substring(0, 2).toUpperCase(),
            joined_date: s.created_at ? new Date(s.created_at).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }) : "14 Oct 2026",
            learning_notes: s.learning_objective || "Student is confident with parking and dual carriageway driving.",
            special_requirements: s.special_requirements || "None",
            competencies: [
              { skill: "Cabin Setup & Controls", status: "Mastered" },
              { skill: "Steering & Lane Positioning", status: "Mastered" },
              { skill: "Three-Point Turns & Reversing", status: "In Progress" },
              { skill: "Roundabouts & Intersections", status: "In Progress" },
              { skill: "Reverse Parallel Parking", status: "In Progress" },
              { skill: "Speed & Hazard Perception", status: "Needs Practice" },
            ],
          };
        });
        setStudents(dbItems);
      }
    } catch (err) {
      console.warn("Could not fetch database students:", err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookLessonModal, setShowBookLessonModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    location: "Parramatta, NSW",
    licence_type: "Learner" as "Learner" | "Provisional" | "Full",
    instructor_name: "Daniel Okafor",
    preferred_transmission: "Manual" as "Manual" | "Automatic",
    status: "active" as "active" | "inactive",
    learning_notes: "",
  });

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    location: "Sydney, NSW",
    suburb: "Sydney",
    postcode: "2000",
    licence_type: "Learner" as "Learner" | "Provisional" | "Full",
    instructor_name: "Daniel Okafor",
    preferred_transmission: "Manual" as "Manual" | "Automatic",
    package_name: "Starter 10 Lesson Pack",
  });

  const [bookLessonDate, setBookLessonDate] = useState("");
  const [bookLessonTime, setBookLessonTime] = useState("10:00 AM");
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
    const total = students.length;
    const active = students.filter((s) => s.status === "active").length;
    const inactive = students.filter((s) => s.status === "inactive").length;
    const learners = students.filter((s) => s.licence_type === "Learner").length;
    return { total, active, inactive, learners };
  }, [students]);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Tab filter
      if (activeTab === "active" && s.status !== "active") return false;
      if (activeTab === "inactive" && s.status !== "inactive") return false;
      if (activeTab === "learner" && s.licence_type !== "Learner") return false;
      if (activeTab === "provisional" && s.licence_type !== "Provisional") return false;

      // Status dropdown
      if (statusFilter !== "all" && s.status !== statusFilter) return false;

      // Licence dropdown
      if (
        licenceFilter !== "all" &&
        s.licence_type.toLowerCase() !== licenceFilter.toLowerCase()
      )
        return false;

      // Instructor dropdown
      if (
        instructorFilter !== "all" &&
        !s.instructor_name.toLowerCase().includes(instructorFilter.toLowerCase())
      )
        return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          s.name.toLowerCase().includes(q) ||
          s.student_code.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.instructor_name.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    students,
    activeTab,
    statusFilter,
    licenceFilter,
    instructorFilter,
    searchQuery,
  ]);

  // Click on any element in the table to open side window with deep details
  const handleSelectStudent = (item: StudentRowItem) => {
    setSelectedStudent(item);
    setIsSideWindowOpen(true);
  };

  const handleCloseSideWindow = () => {
    setIsSideWindowOpen(false);
  };

  const handleToggleStatus = async (studentId: number) => {
    const s = students.find((item) => item.id === studentId);
    if (!s) return;
    const newStatus = s.status === "active" ? "inactive" : "active";
    try {
      await apiFetch(`/api/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      loadStudents();
      showToast(`Status updated to ${newStatus} for ${s.name}!`);
    } catch (err: any) {
      showToast(err.message || "Failed to update status");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await apiFetch(`/api/students/${selectedStudent.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          licence_stage: editForm.licence_type.toLowerCase(),
          preferred_transmission: editForm.preferred_transmission.toLowerCase(),
          status: editForm.status,
          learning_objective: editForm.learning_notes,
        }),
      });
      loadStudents();
      setShowEditModal(false);
      showToast(`Student details updated successfully in database!`);
    } catch (err: any) {
      showToast(err.message || "Failed to update student");
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/students", {
        method: "POST",
        body: JSON.stringify({
          name: addForm.name,
          email: addForm.email,
          phone: addForm.phone,
          address: addForm.address || "14 Bridge Street",
          suburb: addForm.suburb || "Sydney",
          postcode: addForm.postcode || "2000",
          licence_stage: addForm.licence_type.toLowerCase(),
          preferred_transmission: addForm.preferred_transmission.toLowerCase(),
          learning_objective: "Pass practical driving test on first attempt",
        }),
      });

      if (res.success) {
        loadStudents();
        setShowAddModal(false);
        showToast(`New student ${addForm.name} registered to database!`);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create student");
    }
  };

  const handleBookNextLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookLessonDate) {
      alert("Please choose a date for the lesson.");
      return;
    }
    if (!selectedStudent) return;
    const formatted = `${bookLessonDate} at ${bookLessonTime}`;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              next_lesson_datetime: formatted,
              lessons: s.lessons + 1,
              remaining_lessons: Math.max(0, s.remaining_lessons - 1),
            }
          : s
      )
    );
    setSelectedStudent((prev) =>
      prev
        ? {
            ...prev,
            next_lesson_datetime: formatted,
            lessons: prev.lessons + 1,
            remaining_lessons: Math.max(0, prev.remaining_lessons - 1),
          }
        : null
    );
    setShowBookLessonModal(false);
    showToast(`Next lesson booked for ${selectedStudent.name} on ${formatted}!`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setShowMessageModal(false);
    setMessageText("");
    showToast(`Message sent to ${selectedStudent?.name} via ${messageChannel.toUpperCase()}!`);
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
          icon={Users}
          title="Customers Directory"
          subtitle="Manage registered learner drivers, licences, and lesson balances"
          badge={`${kpiStats.total || students.length} Students`}
          actions={
            <button
              onClick={() => router.push("/students/create")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FAB10B] stroke-[2.5]" />
              <span>Add Student</span>
            </button>
          }
        />

        {/* 4 Overview Statistics Cards matching Reference Mockup */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Students */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{kpiStats.total}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Total Students
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

          {/* Card 3: Inactive */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <UserX className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{kpiStats.inactive}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Inactive
              </div>
            </div>
          </div>

          {/* Card 4: Learners */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#FEF08A] flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5 text-amber-900 stroke-[2.4]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{kpiStats.learners}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                New This Month
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
              placeholder="Search by name or student ID..."
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
            <option value="inactive">Inactive</option>
          </select>

          {/* Licence Type Dropdown */}
          <select
            value={licenceFilter}
            onChange={(e) => setLicenceFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">All Licence Type</option>
            <option value="learner">Learner</option>
            <option value="provisional">Provisional</option>
            <option value="full">Full</option>
          </select>

          {/* Instructor Dropdown */}
          <select
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">All Instructor</option>
            <option value="Daniel Okafor">Daniel Okafor</option>
            <option value="Priya Nair">Priya Nair</option>
            <option value="Marcus Bell">Marcus Bell</option>
            <option value="Sofia Reyes">Sofia Reyes</option>
            <option value="Rohan Mehta">Rohan Mehta</option>
            <option value="Sneha Patel">Sneha Patel</option>
            <option value="Karan Singh">Karan Singh</option>
          </select>

          {/* Yellow Filter Button */}
          <button
            onClick={() => showToast("Student filters applied!")}
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
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "inactive"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Inactive ({kpiStats.inactive})
          </button>
          <button
            onClick={() => setActiveTab("learner")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "learner"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Learners (820)
          </button>
          <button
            onClick={() => setActiveTab("provisional")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "provisional"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Provisional (428)
          </button>
        </div>

        {/* Main Students Table (Full Width, clicking any element opens side window) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5">Student</th>
                  <th className="py-3 px-3.5">Student ID</th>
                  <th className="py-3 px-3.5">Contact</th>
                  <th className="py-3 px-3.5">Location</th>
                  <th className="py-3 px-3.5">Licence Type</th>
                  <th className="py-3 px-3.5">Instructor</th>
                  <th className="py-3 px-3.5">Lessons</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected =
                      isSideWindowOpen && selectedStudent?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectStudent(s)}
                        title="Click to view deep student details"
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-amber-50/60 font-medium"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Student (Avatar + Name) */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {s.avatar_url ? (
                              <img
                                src={s.avatar_url}
                                alt={s.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                {s.initials}
                              </div>
                            )}
                            <span
                              className={`font-semibold transition-colors ${
                                isSelected
                                  ? "text-[#0B1528] underline underline-offset-4 decoration-[#FAB10B] decoration-2"
                                  : "text-slate-900 group-hover:text-blue-900"
                              }`}
                            >
                              {s.name}
                            </span>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                          {s.student_code}
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600 font-medium">
                          {s.email}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700">
                          {s.location}
                        </td>

                        {/* Licence Type */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-800 font-medium">
                          {s.licence_type}
                        </td>

                        {/* Instructor */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                          {s.instructor_name}
                        </td>

                        {/* Lessons */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap font-bold text-slate-900 text-center">
                          {s.lessons}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          {s.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
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
                              onClick={() => handleSelectStudent(s)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                            >
                              View
                            </button>

                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenActionMenuId(
                                    openActionMenuId === s.id ? null : s.id
                                  )
                                }
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openActionMenuId === s.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-30 text-left">
                                  <button
                                    onClick={() => {
                                      handleSelectStudent(s);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Deep Details</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      router.push(`/students/${s.id}/edit`);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit Student</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(s);
                                      setMessageText(
                                        `Hi ${s.name}, this is EZY 2 LEARN driving school regarding your upcoming driving lesson.`
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
                                      setSelectedStudent(s);
                                      setShowBookLessonModal(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Book Next Lesson</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleStatus(s.id);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Toggle Active/Inactive</span>
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
              Showing 1 to {filteredStudents.length} of 1,248 students
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
              <span className="text-slate-400 px-1">...</span>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center justify-center">
                280
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SIDE WINDOW: Shows deep detail information when clicking any student */}
        {/* ============================================================ */}
        {isSideWindowOpen && selectedStudent && (
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
                      <GraduationCap className="w-5 h-5 text-[#FAB10B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-black text-base sm:text-lg tracking-wide text-white">
                          Student Details
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAB10B] text-slate-900 font-mono font-bold text-xs">
                          {selectedStudent.student_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Deep overview, RMS logbook progress & driving curriculum
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/students/${selectedStudent.id}`}
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
                      {selectedStudent.name}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      Enrolled on: {selectedStudent.joined_date} • {selectedStudent.licence_stage_detail}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedStudent.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Student
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
                      <span className="text-[11px] text-slate-500 block font-medium">Lessons Completed</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        {selectedStudent.lessons} Lessons
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Remaining</span>
                      <span className="text-sm font-black text-amber-600 mt-0.5 block">
                        {selectedStudent.remaining_lessons} Lessons
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Logbook Progress</span>
                      <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                        {Number(selectedStudent.logbook_hours_day || 0) + Number(selectedStudent.logbook_hours_night || 0)} / {selectedStudent.logbook_total_required || 120} hrs
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 text-center shadow-xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Total Invested</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        ${selectedStudent.total_paid} AUD
                      </span>
                    </div>
                  </div>

                  {/* Logbook Progress Bar Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>NSW Official Driver Logbook Completion</span>
                      </span>
                      <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {Math.round(
                          ((selectedStudent.logbook_hours_day + selectedStudent.logbook_hours_night) /
                            selectedStudent.logbook_total_required) *
                            100
                        )}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((selectedStudent.logbook_hours_day + selectedStudent.logbook_hours_night) /
                              selectedStudent.logbook_total_required) *
                              100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-600 pt-0.5 font-medium">
                      <span>Daytime: <strong className="text-slate-900 font-bold">{selectedStudent.logbook_hours_day} hrs</strong></span>
                      <span>Night: <strong className="text-slate-900 font-bold">{selectedStudent.logbook_hours_night} hrs</strong></span>
                      <span>Remaining: <strong className="text-amber-700 font-bold">{Math.max(0, selectedStudent.logbook_total_required - (selectedStudent.logbook_hours_day + selectedStudent.logbook_hours_night))} hrs</strong></span>
                    </div>
                  </div>

                  {/* Two Column Grid: Student Information & Instructor Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Student Personal Info */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                      <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="tracking-tight">Personal Information</span>
                        <span className="text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md font-mono text-slate-700 font-bold">
                          {selectedStudent.student_code}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {selectedStudent.avatar_url ? (
                          <img
                            src={selectedStudent.avatar_url}
                            alt={selectedStudent.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#0B1528] text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {selectedStudent.initials}
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {selectedStudent.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-slate-500 block">
                            {selectedStudent.student_code}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700 truncate font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{selectedStudent.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedStudent.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{selectedStudent.address}, {selectedStudent.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 font-semibold pt-1">
                          <span className="text-slate-500 font-normal">Emergency:</span>
                          <span className="font-bold text-slate-900">
                            {typeof selectedStudent.emergency_contact === "object"
                              ? (selectedStudent.emergency_contact as any)?.name || JSON.stringify(selectedStudent.emergency_contact)
                              : String(selectedStudent.emergency_contact || "Emergency Contact (+61 412 999 111)")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 font-semibold">
                          <span className="text-slate-500 font-normal">Transmission:</span>
                          <span className="font-bold text-slate-900">{selectedStudent.preferred_transmission} Preferred</span>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Instructor & Vehicle Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                      <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="tracking-tight">Assigned Instructor & Car</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                          Active Pair
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-700">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Primary Instructor:</span>
                          <strong className="text-sm font-black text-slate-900 block mt-0.5">
                            {selectedStudent.instructor_name} ({selectedStudent.instructor_code})
                          </strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Instructor Phone:</span>
                          <strong className="text-slate-900 font-bold">{selectedStudent.instructor_phone}</strong>
                        </div>
                        <div className="pt-1 border-t border-slate-100">
                          <span className="text-slate-500 block text-[11px]">Assigned Vehicle:</span>
                          <strong className="text-slate-900 font-bold">{selectedStudent.assigned_vehicle}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] pt-1 border-t border-slate-100">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Dual Control Pedals Installed</span>
                        </div>
                        <div className="pt-1 text-[11px] text-slate-600">
                          Next Scheduled Lesson:{" "}
                          <strong className="text-indigo-700 font-black block mt-0.5">{selectedStudent.next_lesson_datetime}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Curriculum Competencies Evaluated Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                    <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>Curriculum Competencies Evaluated</span>
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono font-bold">
                        {selectedStudent.licence_number} (Exp: {selectedStudent.licence_expiry})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedStudent.competencies.map((comp, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {comp.status === "Mastered" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : comp.status === "In Progress" ? (
                              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900">{comp.skill}</span>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              comp.status === "Mastered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : comp.status === "In Progress"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {comp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Package & Lesson Allocation Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                    <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>Package & Lesson Allocation</span>
                      </div>
                      <span className="text-xs text-slate-900 font-bold">
                        {selectedStudent.package_name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Package Type:</span>
                          <strong className="text-slate-900 font-bold">{selectedStudent.package_name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Lessons Completed:</span>
                          <strong className="text-slate-900 font-bold">{selectedStudent.lessons} Lessons</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Lessons Remaining:</span>
                          <strong className="text-amber-700 font-bold">{selectedStudent.remaining_lessons} Lessons</strong>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700">
                            <strong className="text-slate-900">Default Pickup:</strong> {selectedStudent.pickup_address}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700">
                            <strong className="text-slate-900">Default Drop-off:</strong> {selectedStudent.dropoff_address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Billing Summary Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                    <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Financial & Billing Summary</span>
                      </div>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedStudent.payment_status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Package Amount:</span>
                          <strong className="text-slate-900 font-bold">${selectedStudent.total_paid}.00 AUD</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Cost per Lesson:</span>
                          <strong className="text-slate-900 font-bold">
                            ${Math.round(selectedStudent.total_paid / Math.max(1, selectedStudent.lessons + selectedStudent.remaining_lessons))}.00 / hr
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment Status:</span>
                          <strong className="text-emerald-700 font-bold capitalize">{selectedStudent.payment_status}</strong>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1 font-medium">
                        <span className="text-slate-500 block text-[11px] font-semibold">Learning Notes:</span>
                        <p className="text-slate-900">{selectedStudent.learning_notes}</p>
                        {selectedStudent.special_requirements && (
                          <p className="text-[11px] text-amber-800 pt-1 font-bold">
                            Req: {selectedStudent.special_requirements}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowStatementModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                      <span>Download Student Statement & Invoices</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Pinned Admin Actions Bar */}
                <div className="p-4 bg-slate-50/95 border-t border-slate-200/90 shrink-0 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Admin Quick Actions</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ID: {selectedStudent.student_code}
                    </span>
                  </div>

                  {/* Row 1: 3 buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        router.push(`/students/${selectedStudent.id}/edit`);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Edit Student</span>
                    </button>

                    <button
                      onClick={() => {
                        setMessageText(
                          `Hi ${selectedStudent.name}, this is EZY 2 LEARN driving school regarding your lessons.`
                        );
                        setShowMessageModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Send Message</span>
                    </button>

                    <button
                      onClick={() => setShowBookLessonModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Book Next Lesson</span>
                    </button>
                  </div>

                  {/* Row 2: 2 buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push("/calendar")}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Driving Calendar</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(selectedStudent.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-200 shadow-2xs transition-colors cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-500" />
                      <span>Toggle Active/Inactive</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Edit Student Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 flex items-center justify-center">
                    <Edit className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Edit Student #{selectedStudent.student_code}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedStudent.name}</p>
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
                      Email Address
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
                      Location / Suburb
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Licence Stage
                    </label>
                    <select
                      value={editForm.licence_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          licence_type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                    >
                      <option value="Learner">Learner</option>
                      <option value="Provisional">Provisional</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Preferred Transmission
                    </label>
                    <select
                      value={editForm.preferred_transmission}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          preferred_transmission: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Learning Notes & Instructor Observations
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.learning_notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, learning_notes: e.target.value })
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
        {showMessageModal && selectedStudent && (
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
                      To: {selectedStudent.name} ({selectedStudent.student_code})
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
                      <span>SMS ({selectedStudent.phone})</span>
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
                      <span>Email ({selectedStudent.email})</span>
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

        {/* Modal 3: Book Next Lesson Modal */}
        {showBookLessonModal && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Book Next Lesson
                    </h3>
                    <p className="text-xs text-slate-500">
                      For: {selectedStudent.name} with {selectedStudent.instructor_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookLessonModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookNextLesson} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Lesson Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookLessonDate}
                    onChange={(e) => setBookLessonDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Time Slot
                  </label>
                  <select
                    value={bookLessonTime}
                    onChange={(e) => setBookLessonTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                  >
                    <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:30 AM">11:30 AM - 12:30 PM</option>
                    <option value="01:00 PM">01:00 PM - 02:00 PM</option>
                    <option value="02:30 PM">02:30 PM - 03:30 PM</option>
                    <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedStudent.pickup_address}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookLessonModal(false)}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Confirm Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Add Student Modal */}
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
                      Register New Student
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enroll a learner driver into EZY 2 LEARN
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
                      placeholder="e.g. Leo Matthews"
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
                      placeholder="leo@gmail.com"
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
                      Suburb / Location
                    </label>
                    <input
                      type="text"
                      placeholder="Parramatta, NSW"
                      value={addForm.location}
                      onChange={(e) =>
                        setAddForm({ ...addForm, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Licence Stage
                    </label>
                    <select
                      value={addForm.licence_type}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          licence_type: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                    >
                      <option value="Learner">Learner</option>
                      <option value="Provisional">Provisional</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Assign Instructor
                    </label>
                    <select
                      value={addForm.instructor_name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, instructor_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                    >
                      <option value="Daniel Okafor">Daniel Okafor (Manual)</option>
                      <option value="Priya Nair">Priya Nair (Automatic)</option>
                      <option value="Marcus Bell">Marcus Bell (Manual)</option>
                      <option value="Sofia Reyes">Sofia Reyes (Automatic)</option>
                      <option value="Rohan Mehta">Rohan Mehta (Manual)</option>
                      <option value="Sneha Patel">Sneha Patel (Automatic)</option>
                      <option value="Karan Singh">Karan Singh (Manual)</option>
                    </select>
                  </div>
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
                    Complete Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 5: Student Statement Modal */}
        {showStatementModal && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Student Billing Statement
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedStudent.name} ({selectedStudent.student_code})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Enrolled Package:</span>
                  <strong className="text-slate-900">{selectedStudent.package_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Driving Instructor:</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.instructor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Lessons Enrolled:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.lessons + selectedStudent.remaining_lessons} Lessons
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivered to Date:</span>
                  <span className="text-emerald-700 font-bold">{selectedStudent.lessons} Lessons</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Paid (AUD):</span>
                  <span>${selectedStudent.total_paid}.00 AUD</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    showToast("Student statement downloaded!");
                    setShowStatementModal(false);
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
      </div>
    </AdminLayout>
  );
}
