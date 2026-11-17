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
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  GraduationCap,
  Calendar,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  Award,
  CreditCard,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Filter,
  MessageSquare,
  Send,
  Smartphone,
  Bell,
  Check,
  Users,
} from "lucide-react";

interface StudentRowItem {
  id: number;
  student_code: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  address?: string;
  location: string;
  suburb: string;
  postcode: string;
  licence_type: "Learner" | "Provisional" | "Full";
  licence_status: "Valid" | "Expired" | "Pending";
  licence_number?: string;
  preferred_transmission: "Automatic" | "Manual";
  driving_experience?: string;
  instructor_name: string;
  lessons: number;
  remaining_lessons: number;
  status: "active" | "inactive";
  total_paid: number;
  avatar_url?: string;
  initials: string;
}

const DEFAULT_STUDENTS: StudentRowItem[] = [
  {
    id: 1,
    student_code: "STU-001",
    name: "John Smith",
    first_name: "John",
    last_name: "Smith",
    email: "john@mail.com",
    phone: "+61 412 111 222",
    date_of_birth: "2004-05-18",
    address: "10 Bridge Street",
    location: "Sydney, NSW",
    suburb: "Sydney",
    postcode: "2000",
    licence_type: "Learner",
    licence_status: "Valid",
    licence_number: "NSW-L901234",
    preferred_transmission: "Manual",
    driving_experience: "Beginner · 18 logbook hours",
    instructor_name: "Daniel Okafor",
    lessons: 8,
    remaining_lessons: 2,
    status: "active",
    total_paid: 680,
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    initials: "JS",
  },
  {
    id: 2,
    student_code: "STU-002",
    name: "Sarah Wilson",
    first_name: "Sarah",
    last_name: "Wilson",
    email: "sarah@mail.com",
    phone: "+61 413 222 333",
    date_of_birth: "2003-09-24",
    address: "45 Church Street",
    location: "Parramatta, NSW",
    suburb: "Parramatta",
    postcode: "2150",
    licence_type: "Provisional",
    licence_status: "Valid",
    licence_number: "NSW-P881230",
    preferred_transmission: "Automatic",
    driving_experience: "Intermediate · 55 logbook hours",
    instructor_name: "Priya Nair",
    lessons: 6,
    remaining_lessons: 4,
    status: "active",
    total_paid: 510,
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    initials: "SW",
  },
  {
    id: 3,
    student_code: "STU-003",
    name: "Michael Brown",
    first_name: "Michael",
    last_name: "Brown",
    email: "michael@mail.com",
    phone: "+61 414 333 444",
    date_of_birth: "2005-02-11",
    address: "88 Victoria Avenue",
    location: "Chatswood, NSW",
    suburb: "Chatswood",
    postcode: "2067",
    licence_type: "Learner",
    licence_status: "Valid",
    licence_number: "NSW-L945671",
    preferred_transmission: "Manual",
    driving_experience: "Beginner · 8 logbook hours",
    instructor_name: "Marcus Bell",
    lessons: 4,
    remaining_lessons: 6,
    status: "active",
    total_paid: 340,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "MB",
  },
  {
    id: 4,
    student_code: "STU-004",
    name: "Emma Davis",
    first_name: "Emma",
    last_name: "Davis",
    email: "emma@mail.com",
    phone: "+61 415 444 555",
    date_of_birth: "2001-11-30",
    address: "14 George Street",
    location: "Liverpool, NSW",
    suburb: "Liverpool",
    postcode: "2170",
    licence_type: "Full",
    licence_status: "Valid",
    licence_number: "NSW-F102938",
    preferred_transmission: "Automatic",
    driving_experience: "Overseas Conversion · 4 years overseas",
    instructor_name: "Sofia Reyes",
    lessons: 10,
    remaining_lessons: 0,
    status: "active",
    total_paid: 850,
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    initials: "ED",
  },
  {
    id: 5,
    student_code: "STU-005",
    name: "Daniel Clark",
    first_name: "Daniel",
    last_name: "Clark",
    email: "daniel@mail.com",
    phone: "+61 416 555 666",
    date_of_birth: "2004-07-04",
    address: "22 Flushcombe Road",
    location: "Blacktown, NSW",
    suburb: "Blacktown",
    postcode: "2148",
    licence_type: "Learner",
    licence_status: "Valid",
    licence_number: "NSW-L772819",
    preferred_transmission: "Manual",
    driving_experience: "Beginner · 12 logbook hours",
    instructor_name: "Daniel Okafor",
    lessons: 3,
    remaining_lessons: 7,
    status: "active",
    total_paid: 255,
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    initials: "DC",
  },
];

export default function StudentsPage() {
  const router = useRouter();

  // 4 Overview Statistics Cards matching Reference Mockup
  const [stats, setStats] = useState({
    total_students: "1,248",
    active: "1,212",
    inactive: 36,
    new_this_month: 124,
  });

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [licenceFilter, setLicenceFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Students List
  const [students, setStudents] = useState<StudentRowItem[]>(DEFAULT_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentRowItem>(DEFAULT_STUDENTS[0]);

  // Drawers
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  // Edit / Add Form State
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "Sydney, NSW",
    suburb: "Sydney",
    postcode: "2000",
    licence_type: "Learner" as "Learner" | "Provisional" | "Full",
    instructor_name: "Daniel Okafor",
    preferred_transmission: "Manual" as "Manual" | "Automatic",
    status: "active" as "active" | "inactive",
    lessons: 8,
  });

  // Message Form State
  const [messageChannel, setMessageChannel] = useState<"sms" | "email">("sms");
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Open Edit Drawer
  const handleOpenEdit = (stu: StudentRowItem) => {
    setSelectedStudent(stu);
    setStudentForm({
      name: stu.name,
      email: stu.email,
      phone: stu.phone,
      location: stu.location,
      suburb: stu.suburb,
      postcode: stu.postcode,
      licence_type: stu.licence_type,
      instructor_name: stu.instructor_name,
      preferred_transmission: stu.preferred_transmission,
      status: stu.status,
      lessons: stu.lessons,
    });
    setOpenMenuId(null);
    setEditDrawerOpen(true);
  };

  // Open Message Drawer
  const handleOpenMessage = (stu: StudentRowItem) => {
    setSelectedStudent(stu);
    setMessageText(
      `Hi ${stu.name}, this is EZY 2 LEARN driving school. How are your preparation and logbook hours progressing with ${stu.instructor_name}?`
    );
    setOpenMenuId(null);
    setMessageDrawerOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              ...studentForm,
            }
          : s
      )
    );
    setEditDrawerOpen(false);
    alert(`Student ${studentForm.name} updated successfully!`);
  };

  // Save Add Student
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `STU-${String(students.length + 1).padStart(3, "0")}`;
    const initials = studentForm.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const newStu: StudentRowItem = {
      id: Date.now(),
      student_code: newCode,
      name: studentForm.name,
      first_name: studentForm.name.split(" ")[0],
      last_name: studentForm.name.split(" ")[1] || "",
      email: studentForm.email,
      phone: studentForm.phone,
      location: studentForm.location,
      suburb: studentForm.suburb,
      postcode: studentForm.postcode,
      licence_type: studentForm.licence_type,
      licence_status: "Valid",
      preferred_transmission: studentForm.preferred_transmission,
      instructor_name: studentForm.instructor_name,
      lessons: 0,
      remaining_lessons: 10,
      status: studentForm.status,
      total_paid: 740,
      initials,
    };

    setStudents((prev) => [newStu, ...prev]);
    setAddDrawerOpen(false);
    alert(`New student ${studentForm.name} added with ID ${newCode}!`);
  };

  // Dispatch Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMsg(true);
    setTimeout(() => {
      setSendingMsg(false);
      setMessageDrawerOpen(false);
      alert(`Message dispatched via ${messageChannel.toUpperCase()} to ${selectedStudent.name}!`);
    }, 600);
  };

  // Filter logic
  const filteredStudents = students.filter((stu) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        stu.name.toLowerCase().includes(q) ||
        stu.student_code.toLowerCase().includes(q) ||
        stu.email.toLowerCase().includes(q) ||
        stu.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "all" && stu.status !== statusFilter) return false;
    if (licenceFilter !== "all" && stu.licence_type.toLowerCase() !== licenceFilter.toLowerCase()) return false;
    if (instructorFilter !== "all" && stu.instructor_name.toLowerCase() !== instructorFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-12">
        {/* Top Header Bar matching Reference Mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Students
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
              Manage registered students
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setStudentForm({
                  name: "",
                  email: "",
                  phone: "",
                  location: "Sydney, NSW",
                  suburb: "Sydney",
                  postcode: "2000",
                  licence_type: "Learner",
                  instructor_name: "Daniel Okafor",
                  preferred_transmission: "Manual",
                  status: "active",
                  lessons: 0,
                });
                setAddDrawerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0B1528] hover:bg-[#07345B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* 4 Overview Statistics Cards matching Reference Mockup */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Students */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Students</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.total_students}
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

          {/* Card 3: Inactive */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <UserX className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">Inactive</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.inactive}
              </h3>
            </div>
          </div>

          {/* Card 4: New This Month */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 block">New This Month</span>
              <h3 className="font-heading font-black text-2xl text-slate-900 leading-none mt-1">
                {stats.new_this_month}
              </h3>
            </div>
          </div>
        </div>

        {/* Filters Row matching Reference Mockup */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search by name or student ID */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or student ID..."
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
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Licence Type Dropdown */}
            <div className="relative">
              <select
                value={licenceFilter}
                onChange={(e) => setLicenceFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="all">All Licence Type</option>
                <option value="learner">Learner</option>
                <option value="provisional">Provisional</option>
                <option value="full">Full</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Instructor Dropdown */}
            <div className="relative">
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="all">All Instructor</option>
                <option value="daniel okafor">Daniel Okafor</option>
                <option value="priya nair">Priya Nair</option>
                <option value="marcus bell">Marcus Bell</option>
                <option value="sofia reyes">Sofia Reyes</option>
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

        {/* Main Students Table Card matching Reference Mockup */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Licence Type</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4 text-center">Lessons</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student (Avatar + Name) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {stu.avatar_url ? (
                          <img
                            src={stu.avatar_url}
                            alt={stu.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {stu.initials}
                          </div>
                        )}
                        <Link
                          href={`/students/${stu.id}`}
                          className="font-semibold text-slate-900 hover:underline text-left"
                        >
                          {stu.name}
                        </Link>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {stu.student_code}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {stu.email}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {stu.location}
                    </td>

                    {/* Licence Type */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {stu.licence_type}
                    </td>

                    {/* Instructor */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {stu.instructor_name}
                    </td>

                    {/* Lessons Count */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {stu.lessons}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {stu.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
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
                          onClick={() => setOpenMenuId(openMenuId === stu.id ? null : stu.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu */}
                        {openMenuId === stu.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-xs">
                            <Link
                              href={`/students/${stu.id}`}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Profile
                            </Link>
                            <button
                              onClick={() => handleOpenEdit(stu)}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-400" />
                              Edit Student
                            </button>
                            <button
                              onClick={() => handleOpenMessage(stu)}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                              Message
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => {
                                setStudents((prev) =>
                                  prev.map((s) =>
                                    s.id === stu.id
                                      ? { ...s, status: s.status === "active" ? "inactive" : "active" }
                                      : s
                                  )
                                );
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                              Toggle Status
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
              Showing 1-5 of 1,248 students
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
              <span className="text-xs text-slate-400 px-1">...</span>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                280
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* 1. EDIT / ADD STUDENT DRAWER */}
        <Drawer
          isOpen={editDrawerOpen || addDrawerOpen}
          onClose={() => {
            setEditDrawerOpen(false);
            setAddDrawerOpen(false);
          }}
          title={addDrawerOpen ? "Add New Student" : `Edit Student: ${selectedStudent.name}`}
          subtitle="Learner enrolment details, contact and instructor allocation"
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
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
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
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location (Display)
                </label>
                <input
                  type="text"
                  value={studentForm.location}
                  onChange={(e) => setStudentForm({ ...studentForm, location: e.target.value })}
                  placeholder="e.g. Parramatta, NSW"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Licence Type
                </label>
                <select
                  value={studentForm.licence_type}
                  onChange={(e) => setStudentForm({ ...studentForm, licence_type: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                >
                  <option value="Learner">Learner</option>
                  <option value="Provisional">Provisional</option>
                  <option value="Full">Full</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Instructor
                </label>
                <select
                  value={studentForm.instructor_name}
                  onChange={(e) => setStudentForm({ ...studentForm, instructor_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                >
                  <option value="Daniel Okafor">Daniel Okafor</option>
                  <option value="Priya Nair">Priya Nair</option>
                  <option value="Marcus Bell">Marcus Bell</option>
                  <option value="Sofia Reyes">Sofia Reyes</option>
                  <option value="David Kim">David Kim</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Status
                </label>
                <select
                  value={studentForm.status}
                  onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
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
                {addDrawerOpen ? "Create Student" : "Save Changes"}
              </button>
            </div>
          </form>
        </Drawer>

        {/* 2. MESSAGE STUDENT DRAWER */}
        <Drawer
          isOpen={messageDrawerOpen}
          onClose={() => setMessageDrawerOpen(false)}
          title={`Message ${selectedStudent.name}`}
          subtitle={`Send notification to ${selectedStudent.phone}`}
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
