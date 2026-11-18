"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { Modal } from "@/components/common/Modal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiFetch } from "@/lib/api";
import {
  MOCK_CALENDAR_LESSONS,
  CalendarLessonItem,
} from "@/lib/mockCalendar";
import {
  Calendar as CalendarIcon,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Car,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Edit,
  Trash2,
  RotateCcw,
  Clock,
  CalendarCheck,
  CalendarDays,
} from "lucide-react";

export default function CalendarPage() {
  const [lessons, setLessons] = useState<CalendarLessonItem[]>(MOCK_CALENDAR_LESSONS);

  // Selected Day & Selected Lesson for the Side Window Details
  // Starts with Day 7 selected to match Reference Image
  const [selectedDay, setSelectedDay] = useState<number | null>(7);
  const [selectedLesson, setSelectedLesson] = useState<CalendarLessonItem | null>(null);
  const [isSideWindowOpen, setIsSideWindowOpen] = useState<boolean>(true);

  // View state: Month (default) | Week | Day
  const [view, setView] = useState<"Month" | "Week" | "Day">("Month");

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("All Instructors");
  const [selectedStudent, setSelectedStudent] = useState<string>("All Students");
  const [instructorsList, setInstructorsList] = useState<string[]>(["All Instructors"]);
  const [studentsList, setStudentsList] = useState<string[]>(["All Students"]);

  // Date Navigation State (November 2026 as per reference image)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(10); // 10 = November

  // Fetch dynamic instructor and student filter options from MySQL
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicFilters() {
      try {
        const [instRes, stuRes] = await Promise.all([
          apiFetch("/api/instructors?limit=100"),
          apiFetch("/api/students?limit=100"),
        ]);
        if (isMounted) {
          if (instRes?.data && Array.isArray(instRes.data)) {
            const names: string[] = instRes.data.map((i: any) => i.name).filter(Boolean);
            setInstructorsList(["All Instructors", ...Array.from(new Set(names))]);
          }
          if (stuRes?.data && Array.isArray(stuRes.data)) {
            const names: string[] = stuRes.data.map((s: any) => s.name).filter(Boolean);
            setStudentsList(["All Students", ...Array.from(new Set(names))]);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic filter lists", err);
      }
    }
    loadDynamicFilters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch live real calendar events from MySQL Backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchDatabaseEvents() {
      try {
        const res = await apiFetch("/api/calendar/events");
        if (res?.data && Array.isArray(res.data) && res.data.length > 0 && isMounted) {
          const dbEvents: CalendarLessonItem[] = res.data.map((ev: any) => {
            const dayNum = parseInt((ev.lesson_date || "2026-11-07").split("-")[2], 10) || 7;
            const transmission = ev.transmission === "automatic" ? "Automatic" : "Manual";
            let color: CalendarLessonItem["color_scheme"] = transmission === "Manual" ? "blue" : "yellow";
            if (ev.booking_status === "completed") color = "green";
            if (ev.booking_status === "cancelled") color = "red";
            if (dayNum === 12 || dayNum === 21) color = "purple";

            const rawTime = ev.start_time || "14:00";
            const [hoursStr, minutesStr] = rawTime.split(":");
            const hoursInt = parseInt(hoursStr, 10);
            const period = hoursInt >= 12 ? "PM" : "AM";
            const formattedHour = hoursInt % 12 === 0 ? 12 : hoursInt % 12;
            const formattedTime = `${String(formattedHour).padStart(2, "0")}:${minutesStr || "00"} ${period}`;

            return {
              id: String(ev.id),
              booking_id: ev.booking_code || `BK-${ev.id}`,
              booking_date: `${String(dayNum).padStart(2, "0")} Nov ${currentYear}`,
              date: ev.lesson_date || `2026-11-${String(dayNum).padStart(2, "0")}`,
              day_number: dayNum,
              start_time: formattedTime,
              time_24: rawTime,
              duration_minutes: ev.duration_minutes || 60,
              status: ev.booking_status === "completed" ? "completed" : ev.booking_status === "cancelled" ? "cancelled" : "confirmed",
              lesson_type: transmission,
              lesson_package: ev.service_name || "5 Lesson Package",
              pickup_location: ev.pickup_address || "123 Main St, Sydney NSW",
              dropoff_location: ev.dropoff_address || "456 George St, Sydney NSW",
              color_scheme: color,
              student_name: ev.student?.name || "Student",
              student_email: ev.student?.email || "sneha@gmail.com",
              student_phone: ev.student?.phone || "+91 87654 32109",
              student_licence: "Learner Licence",
              student_avatar: ev.student?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
              instructor_name: ev.instructor?.name || "Rohan Mehta",
              instructor_code: ev.instructor?.code || "INS-2588",
              instructor_phone: ev.instructor?.phone || "+91 87654 32109",
              instructor_vehicle: ev.instructor?.vehicle_rego || "Toyota Corolla (Manual)",
              instructor_avatar: ev.instructor?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
              total_amount: parseFloat(ev.amount_aud) || 250.0,
              discount: 0.0,
              final_amount: parseFloat(ev.amount_aud) || 250.0,
              payment_status: ev.payment_status === "paid" ? "Paid" : "Pending",
              transaction_id: `TXN-${78400 + ev.id}`,
              student_notes: ev.student_notes || "Please be on time.",
              special_requirements: ev.special_requirements || "None",
            };
          });

          setLessons(dbEvents);

          // Find Day 7 to select by default
          const defaultDay7 = dbEvents.find((l) => l.day_number === 7) || dbEvents[0];
          if (defaultDay7) {
            setSelectedLesson(defaultDay7);
            setSelectedDay(defaultDay7.day_number);
            setIsSideWindowOpen(true);
          }
        }
      } catch (err) {
        console.warn("Could not fetch database calendar events:", err);
      }
    }
    fetchDatabaseEvents();
    return () => { isMounted = false; };
  }, [currentYear]);

  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const MONTH_FULL_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [cancelLessonModal, setCancelLessonModal] = useState<CalendarLessonItem | null>(null);

  // Feedback toast
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Create Form State
  const [createForm, setCreateForm] = useState({
    student_name: "Sneha Patel",
    student_email: "sneha@gmail.com",
    student_phone: "+91 87654 32109",
    instructor_name: "Rohan Mehta",
    date: "2026-11-07",
    day_number: 7,
    start_time: "02:00 PM",
    lesson_type: "Manual" as "Manual" | "Automatic",
    lesson_package: "5 Lesson Package",
    duration_minutes: 60,
    pickup_location: "123 Main St, Sydney NSW",
    dropoff_location: "456 George St, Sydney NSW",
    notes: "",
  });

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState<string>("2026-11-08");
  const [rescheduleTime, setRescheduleTime] = useState<string>("10:00 AM");

  // Filtered Lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        !searchQuery ||
        lesson.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.booking_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesInstructor =
        selectedInstructor === "All Instructors" ||
        lesson.instructor_name.toLowerCase().includes(selectedInstructor.toLowerCase());

      const matchesStudent =
        selectedStudent === "All Students" ||
        lesson.student_name.toLowerCase().includes(selectedStudent.toLowerCase());

      return matchesSearch && matchesInstructor && matchesStudent;
    });
  }, [lessons, searchQuery, selectedInstructor, selectedStudent]);

  // Lessons map by day number
  const lessonsByDay = useMemo(() => {
    const map = new Map<number, CalendarLessonItem[]>();
    filteredLessons.forEach((lesson) => {
      const existing = map.get(lesson.day_number) || [];
      existing.push(lesson);
      map.set(lesson.day_number, existing);
    });
    return map;
  }, [filteredLessons]);

  // Lessons on the currently selected day
  const activeDayLessons = useMemo(() => {
    if (selectedDay === null) return [];
    return lessonsByDay.get(selectedDay) || [];
  }, [selectedDay, lessonsByDay]);

  // Handle clicking a specific date cell
  const handleDateClick = (dayNumber: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDay(dayNumber);

    const dayLessons = lessonsByDay.get(dayNumber) || [];
    if (dayLessons.length > 0) {
      setSelectedLesson(dayLessons[0]);
    } else {
      setSelectedLesson(null);
    }
    setIsSideWindowOpen(true);
  };

  // Handle clicking a lesson card directly
  const handleLessonClick = (e: React.MouseEvent, lesson: CalendarLessonItem) => {
    e.stopPropagation();
    setSelectedDay(lesson.day_number);
    setSelectedLesson(lesson);
    setIsSideWindowOpen(true);
  };

  // Open Create Modal for a specific date
  const handleOpenCreateForDate = (day: number) => {
    const formattedDate = `${currentYear}-11-${String(day).padStart(2, "0")}`;
    setCreateForm((prev) => ({
      ...prev,
      date: formattedDate,
      day_number: day,
    }));
    setIsCreateModalOpen(true);
  };

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentYear(2026);
    setCurrentMonthIndex(10); // November
    setSelectedDay(7);
    const lesson7 = lessons.find((l) => l.day_number === 7);
    if (lesson7) {
      setSelectedLesson(lesson7);
    } else {
      setSelectedLesson(null);
    }
    setIsSideWindowOpen(true);
  };

  // Action: Mark Selected Lesson as Completed
  const handleMarkCompleted = () => {
    if (!selectedLesson) return;
    setLessons((prev) =>
      prev.map((l) =>
        l.id === selectedLesson.id
          ? { ...l, status: "completed", color_scheme: "green" }
          : l
      )
    );
    setSelectedLesson((prev) =>
      prev ? { ...prev, status: "completed", color_scheme: "green" } : null
    );
    showToast(`Lesson for ${selectedLesson.student_name} marked as Completed.`);
  };

  // Action: Save Edit Lesson
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;
    setLessons((prev) =>
      prev.map((l) => (l.id === selectedLesson.id ? selectedLesson : l))
    );
    setIsEditModalOpen(false);
    showToast(`Schedule ${selectedLesson.booking_id} updated successfully.`);
  };

  // Action: Save Reschedule
  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;

    const newDayNum = parseInt(rescheduleDate.split("-")[2], 10) || selectedLesson.day_number;
    const updated: CalendarLessonItem = {
      ...selectedLesson,
      date: rescheduleDate,
      day_number: newDayNum,
      start_time: rescheduleTime,
      booking_date: `${String(newDayNum).padStart(2, "0")} Nov ${currentYear}`,
    };

    setLessons((prev) =>
      prev.map((l) => (l.id === selectedLesson.id ? updated : l))
    );
    setSelectedLesson(updated);
    setSelectedDay(newDayNum);
    setIsRescheduleModalOpen(false);
    showToast(`Lesson rescheduled to ${rescheduleDate} at ${rescheduleTime}.`);
  };

  // Action: Confirm Cancel
  const handleConfirmCancel = () => {
    if (!cancelLessonModal) return;
    setLessons((prev) =>
      prev.map((l) =>
        l.id === cancelLessonModal.id
          ? { ...l, status: "cancelled", color_scheme: "red" }
          : l
      )
    );
    if (selectedLesson && selectedLesson.id === cancelLessonModal.id) {
      setSelectedLesson((prev) =>
        prev ? { ...prev, status: "cancelled", color_scheme: "red" } : null
      );
    }
    setCancelLessonModal(null);
    showToast(`Booking ${cancelLessonModal.booking_id} cancelled.`, "warning");
  };

  // Action: Create New Schedule
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = String(Date.now());
    const dayNum = parseInt(createForm.date.split("-")[2], 10) || createForm.day_number;

    const newLesson: CalendarLessonItem = {
      id: newId,
      booking_id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      booking_date: `${String(dayNum).padStart(2, "0")} Nov ${currentYear}`,
      date: createForm.date,
      day_number: dayNum,
      start_time: createForm.start_time,
      time_24: "14:00",
      duration_minutes: createForm.duration_minutes,
      status: "confirmed",
      lesson_type: createForm.lesson_type,
      lesson_package: createForm.lesson_package,
      pickup_location: createForm.pickup_location,
      dropoff_location: createForm.dropoff_location,
      color_scheme: createForm.lesson_type === "Manual" ? "blue" : "yellow",
      student_name: createForm.student_name,
      student_email: createForm.student_email,
      student_phone: createForm.student_phone,
      student_licence: "Learner Licence",
      student_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      instructor_name: createForm.instructor_name,
      instructor_code: "INS-2588",
      instructor_phone: "+91 87654 32109",
      instructor_vehicle: `Toyota Corolla (${createForm.lesson_type})`,
      instructor_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      total_amount: 250.0,
      discount: 0.0,
      final_amount: 250.0,
      payment_status: "Paid",
      transaction_id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      student_notes: createForm.notes || "Please be on time.",
      special_requirements: "None",
    };

    setLessons((prev) => [...prev, newLesson]);
    setSelectedDay(dayNum);
    setSelectedLesson(newLesson);
    setIsSideWindowOpen(true);
    setIsCreateModalOpen(false);
    showToast(`Schedule created for ${newLesson.student_name} on ${newLesson.booking_date}!`);
  };

  // 35 Day Matrix strictly matching November 2026 reference image
  const CALENDAR_MATRIX = [
    { day: 26, isCurrentMonth: false },
    { day: 27, isCurrentMonth: false },
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false },
    { day: 5, isCurrentMonth: false },
    { day: 6, isCurrentMonth: false },
  ];

  const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AdminLayout>
      <div className="space-y-5 w-full min-w-0 pb-16 select-none">
        {/* Toast Notification */}
        {feedbackToast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 text-sm font-semibold ${
              feedbackToast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : feedbackToast.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {feedbackToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : feedbackToast.type === "warning" ? (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span>{feedbackToast.message}</span>
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-slate-400 hover:text-slate-700 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. Page Header with Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={CalendarClock}
          title="Schedule & Calendar"
          subtitle="Manage driving lesson slots, working hours, and instructor timetables"
          badge="Live Timetable"
          actions={
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#152544] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FAB10B]" />
              <span>Create Schedule</span>
            </button>
          }
        />

        {/* 2. Controls & Toolbar matching reference screenshot */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          {/* Left Controls: View Switcher & Dropdown Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* View Switch: Month | Week | Day */}
            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/80 gap-1">
              <button
                onClick={() => setView("Month")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  view === "Month"
                    ? "bg-[#0B1528] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>

              <button
                onClick={() => setView("Week")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  view === "Week"
                    ? "bg-[#0B1528] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Week</span>
              </button>

              <button
                onClick={() => setView("Day")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  view === "Day"
                    ? "bg-[#0B1528] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Day</span>
              </button>
            </div>

            {/* Instructor Dropdown Filter */}
            <div className="relative">
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="appearance-none bg-white border border-slate-200/80 rounded-xl px-3 pr-8 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors cursor-pointer"
              >
                {instructorsList.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Student Dropdown Filter */}
            <div className="relative">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="appearance-none bg-white border border-slate-200/80 rounded-xl px-3 pr-8 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-colors cursor-pointer"
              >
                {studentsList.map((stu) => (
                  <option key={stu} value={stu}>
                    {stu}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by student or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] focus:border-[#0B1528] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: Month Navigation & Today Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2.5 py-1 text-xs font-bold text-slate-800 flex items-center gap-1 select-none">
                <span>
                  {MONTH_NAMES[currentMonthIndex]} {currentYear}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Today Yellow Button matching reference #FAB10B */}
            <button
              onClick={handleTodayClick}
              className="px-4 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs shadow-xs transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* 3. Main Container: Calendar Grid + Side Window side-by-side matching Reference Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Calendar Viewport (takes 8 cols when side window is open, 12 cols when closed) */}
          <div
            className={`${
              isSideWindowOpen ? "lg:col-span-8" : "lg:col-span-12"
            } w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-3 sm:p-5 overflow-hidden transition-all duration-300`}
          >
            {/* MONTH VIEW */}
            {view === "Month" && (
              <div>
                {/* Day Headers: Sun, Mon, Tue, Wed, Thu, Fri, Sat */}
                <div className="grid grid-cols-7 pb-3 border-b border-slate-100 text-center">
                  {DAYS_OF_WEEK.map((d) => (
                    <div
                      key={d}
                      className="text-xs sm:text-sm font-bold text-slate-700 tracking-tight"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* 7 Columns x 6 Rows Grid */}
                <div className="grid grid-cols-7 border-l border-t border-slate-100 divide-x divide-y divide-slate-100">
                  {CALENDAR_MATRIX.map((cell, idx) => {
                    const dayLessons = cell.isCurrentMonth
                      ? lessonsByDay.get(cell.day) || []
                      : [];
                    const isSelected = cell.isCurrentMonth && cell.day === selectedDay;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleDateClick(cell.day, cell.isCurrentMonth)}
                        className={`min-h-[105px] sm:min-h-[115px] p-1.5 sm:p-2 flex flex-col justify-between transition-all border-r border-b border-slate-100 ${
                          !cell.isCurrentMonth
                            ? "bg-slate-50/40 cursor-default opacity-40"
                            : "hover:bg-blue-50/30 cursor-pointer"
                        } ${isSelected ? "bg-blue-50/50 ring-2 ring-inset ring-[#0B1528]" : ""}`}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between mb-1">
                          {cell.isCurrentMonth ? (
                            isSelected ? (
                              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B1528] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                {cell.day}
                              </span>
                            ) : (
                              <span className="font-bold text-xs text-slate-800 ml-0.5">
                                {cell.day}
                              </span>
                            )
                          ) : (
                            <span className="text-xs font-medium text-slate-400 ml-0.5">
                              {cell.day}
                            </span>
                          )}

                          {cell.isCurrentMonth && dayLessons.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                              {dayLessons.length}
                            </span>
                          )}
                        </div>

                        {/* Scheduled Lessons Cards for this Date */}
                        <div className="space-y-1 flex-1">
                          {dayLessons.map((lesson) => {
                            const isLessonActive =
                              selectedLesson?.booking_id === lesson.booking_id;

                            // Color styling strictly matching reference image
                            let cardBg = "bg-[#E6F4FE] border-[#BFDBFE] text-blue-900";
                            let dotBg = "bg-blue-600";

                            if (lesson.color_scheme === "yellow") {
                              cardBg = "bg-[#FEF9C3] border-[#FDE047] text-amber-900";
                              dotBg = "bg-amber-500";
                            } else if (lesson.color_scheme === "green") {
                              cardBg = "bg-[#DCFCE7] border-[#86EFAC] text-emerald-900";
                              dotBg = "bg-emerald-600";
                            } else if (lesson.color_scheme === "purple") {
                              cardBg = "bg-[#F3E8FF] border-[#D8B4FE] text-purple-900";
                              dotBg = "bg-purple-600";
                            } else if (lesson.color_scheme === "red") {
                              cardBg = "bg-[#FEE2E2] border-[#FCA5A5] text-rose-900";
                              dotBg = "bg-rose-600";
                            }

                            return (
                              <div
                                key={lesson.id}
                                onClick={(e) => handleLessonClick(e, lesson)}
                                className={`rounded-lg p-1 sm:p-1.5 border transition-all text-left cursor-pointer ${cardBg} ${
                                  isLessonActive ? "ring-2 ring-[#0B1528] shadow-xs" : ""
                                }`}
                              >
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${dotBg} shrink-0`}
                                  />
                                  <span className="truncate">{lesson.start_time}</span>
                                </div>
                                <p className="text-[10.5px] font-bold text-slate-900 truncate mt-0.5 leading-tight">
                                  {lesson.student_name}
                                </p>
                                <p className="text-[9.5px] text-slate-600 font-medium truncate">
                                  ({lesson.lesson_type})
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Legend Row strictly matching reference */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Manual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Automatic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {view === "Week" && (
              <div className="space-y-4">
                <div className="grid grid-cols-7 pb-3 border-b border-slate-100 text-center">
                  {DAYS_OF_WEEK.map((d, i) => {
                    const dayNum = 2 + i; // Nov 2 - Nov 8
                    const dayLessons = lessonsByDay.get(dayNum) || [];
                    return (
                      <div
                        key={d}
                        onClick={() => handleDateClick(dayNum, true)}
                        className={`p-2.5 rounded-2xl cursor-pointer transition-colors ${
                          selectedDay === dayNum ? "bg-[#0B1528] text-white" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <p className={`text-xs font-bold uppercase ${selectedDay === dayNum ? "text-slate-300" : "text-slate-400"}`}>
                          {d}
                        </p>
                        <p className={`text-xl font-heading font-black mt-0.5 ${selectedDay === dayNum ? "text-white" : "text-slate-900"}`}>
                          {dayNum}
                        </p>
                        <span className="text-[10px] opacity-80 block mt-0.5">
                          {dayLessons.length} lessons
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="divide-y divide-slate-100">
                  {["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM"].map(
                    (slot) => (
                      <div
                        key={slot}
                        className="py-3.5 grid grid-cols-1 sm:grid-cols-7 gap-3 items-center"
                      >
                        <div className="text-xs font-mono font-bold text-slate-400">{slot}</div>
                        <div className="sm:col-span-6 flex flex-wrap gap-2">
                          {filteredLessons
                            .filter(
                              (l) =>
                                l.start_time.includes(slot.substring(0, 5)) ||
                                (slot === "02:00 PM" && l.day_number === 7)
                            )
                            .map((l) => (
                              <button
                                key={l.id}
                                onClick={(e) => handleLessonClick(e, l)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2 hover:shadow-xs hover:border-[#0B1528] transition-all"
                              >
                                <span>● {l.student_name}</span>
                                <span className="text-[11px] text-blue-700 font-semibold">({l.lesson_type})</span>
                                <span className="text-[10px] bg-blue-200/60 px-1.5 py-0.5 rounded text-blue-950 font-mono">
                                  Nov {l.day_number}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {view === "Day" && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-base">
                      {selectedDay || 7} {MONTH_FULL_NAMES[currentMonthIndex]} {currentYear}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Showing scheduled driving sessions for this day
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenCreateForDate(selectedDay || 7)}
                    className="btn-white text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lesson</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(lessonsByDay.get(selectedDay || 7) || []).length > 0 ? (
                    lessonsByDay.get(selectedDay || 7)!.map((l) => (
                      <div
                        key={l.id}
                        onClick={(e) => handleLessonClick(e, l)}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B1528] cursor-pointer transition-all flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={l.student_avatar}
                            alt={l.student_name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{l.student_name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {l.start_time} · {l.instructor_name} ({l.lesson_type})
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              📍 {l.pickup_location}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full capitalize">
                          {l.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-14 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <CalendarCheck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-800 text-sm">
                        No lessons scheduled for {selectedDay || 7} {MONTH_FULL_NAMES[currentMonthIndex]}.
                      </p>
                      <button
                        onClick={() => handleOpenCreateForDate(selectedDay || 7)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1528] text-white text-xs font-bold hover:bg-[#152544] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule a lesson now</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 4. SIDE WINDOW ("Lesson Details") matching Reference Image */}
          {/* Appears side-by-side with calendar, exactly matching layout */}
          {/* ======================================================== */}
          {isSideWindowOpen && (
            <div className="lg:col-span-4 w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-3 duration-300 sticky top-5">
              {/* Dark Navy Header #0B1528 matching user reference image */}
              <div className="bg-[#0B1528] px-5 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-5 h-5 text-white" />
                  <span className="text-base font-heading font-bold text-white tracking-tight">
                    Lesson Details
                  </span>
                </div>

                <button
                  onClick={() => setIsSideWindowOpen(false)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close side window"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Details Body - ALL DETAILS SHOWN TOGETHER WITHOUT TABS */}
              <div className="p-5 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
                {selectedLesson ? (
                  <>
                    {/* Status Badge + Booking ID + Booking Date */}
                    <div className="border-b border-slate-100 pb-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200/80">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span className="capitalize">{selectedLesson.status}</span>
                        </span>

                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {selectedLesson.booking_date}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Booking Date
                          </p>
                        </div>
                      </div>

                      <div className="mt-1">
                        <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">
                          {selectedLesson.booking_id}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          Booking ID
                        </p>
                      </div>
                    </div>

                    {/* Section 1: Student Information */}
                    <div className="border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>Student Information</span>
                      </div>

                      <div className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                        <img
                          src={selectedLesson.student_avatar}
                          alt={selectedLesson.student_name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {selectedLesson.student_name}
                          </p>
                          <p className="text-slate-600 flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{selectedLesson.student_email}</span>
                          </p>
                          <p className="text-slate-600 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{selectedLesson.student_phone}</span>
                          </p>
                          <div className="pt-0.5">
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                              {selectedLesson.student_licence}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Lesson Information */}
                    <div className="border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                        <Car className="w-3.5 h-3.5 text-slate-700" />
                        <span>Lesson Information</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500 font-medium">Lesson Type</span>
                          <span className="font-bold text-slate-800">{selectedLesson.lesson_type}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500 font-medium">Lesson Package</span>
                          <span className="font-bold text-slate-800">{selectedLesson.lesson_package}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500 font-medium">Lesson Duration</span>
                          <span className="font-bold text-slate-800">{selectedLesson.duration_minutes} mins</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500 font-medium">Pickup Location</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[190px] truncate">{selectedLesson.pickup_location}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500 font-medium">Drop-off Location</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[190px] truncate">{selectedLesson.dropoff_location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Instructor Information */}
                    <div className="border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        <span>Instructor Information</span>
                      </div>

                      <div className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                        <img
                          src={selectedLesson.instructor_avatar}
                          alt={selectedLesson.instructor_name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900 text-sm">
                              {selectedLesson.instructor_name}
                            </p>
                            <span className="text-[11px] font-bold text-slate-500 font-mono">
                              {selectedLesson.instructor_code}
                            </span>
                          </div>
                          <p className="text-slate-600 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{selectedLesson.instructor_phone}</span>
                          </p>
                          <p className="text-slate-600 flex items-center gap-1.5 pt-0.5">
                            <Car className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{selectedLesson.instructor_vehicle}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Payment Information */}
                    <div className="border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                        <span>Payment Information</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Total Amount</span>
                            <span className="font-semibold text-slate-800">${Number(selectedLesson.total_amount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Discount</span>
                            <span className="font-semibold text-slate-800">${Number(selectedLesson.discount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                            <span className="text-slate-900">Final Amount</span>
                            <span className="text-slate-900">${Number(selectedLesson.final_amount || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>{selectedLesson.payment_status}</span>
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {selectedLesson.transaction_id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Additional Information */}
                    <div className="pb-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                        <FileText className="w-3.5 h-3.5 text-slate-700" />
                        <span>Additional Information</span>
                      </div>

                      <div className="space-y-1 text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        <p>
                          <strong className="text-slate-900 font-semibold">Student Notes:</strong> {selectedLesson.student_notes}
                        </p>
                        <p>
                          <strong className="text-slate-900 font-semibold">Special Requirements:</strong> {selectedLesson.special_requirements}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons strictly matching reference */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-[#0B1528] hover:bg-[#152544] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setIsRescheduleModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-[#0B1528] hover:bg-[#152544] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => setCancelLessonModal(selectedLesson)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>

                      <button
                        onClick={handleMarkCompleted}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark Completed</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Date with No Lessons */
                  <div className="py-12 text-center space-y-3">
                    <CalendarDays className="w-10 h-10 text-amber-500 mx-auto" />
                    <h3 className="text-base font-heading font-black text-slate-900">
                      No Lessons Scheduled
                    </h3>
                    <p className="text-xs text-slate-500">
                      There are no driving lessons booked on {selectedDay} {MONTH_FULL_NAMES[currentMonthIndex]} {currentYear}.
                    </p>
                    <button
                      onClick={() => handleOpenCreateForDate(selectedDay || 7)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B1528] text-white text-xs font-bold hover:bg-[#152544]"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Schedule Lesson</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CREATE SCHEDULE MODAL */}
        {/* ======================================================== */}
        {isCreateModalOpen && (
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create Schedule & Lesson"
            maxWidth="lg"
          >
            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={createForm.student_name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, student_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Instructor</label>
                  <select
                    value={createForm.instructor_name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, instructor_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Rohan Mehta">Rohan Mehta (INS-2588)</option>
                    <option value="Sneha Patel">Sneha Patel</option>
                    <option value="Daniel Cooper">Daniel Cooper</option>
                    <option value="Aisha Khan">Aisha Khan</option>
                    <option value="Kevin O'Connor">Kevin O'Connor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="02:00 PM"
                    required
                    value={createForm.start_time}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, start_time: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Transmission</label>
                  <select
                    value={createForm.lesson_type}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        lesson_type: e.target.value as "Manual" | "Automatic",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package</label>
                  <input
                    type="text"
                    value={createForm.lesson_package}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lesson_package: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Pickup Address</label>
                <input
                  type="text"
                  value={createForm.pickup_location}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, pickup_location: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Drop-off Address</label>
                <input
                  type="text"
                  value={createForm.dropoff_location}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, dropoff_location: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold hover:bg-[#152544]"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* EDIT MODAL */}
        {isEditModalOpen && selectedLesson && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title={`Edit Lesson ${selectedLesson.booking_id}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={selectedLesson.pickup_location}
                  onChange={(e) =>
                    setSelectedLesson({ ...selectedLesson, pickup_location: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Drop-off Location</label>
                <input
                  type="text"
                  value={selectedLesson.dropoff_location}
                  onChange={(e) =>
                    setSelectedLesson({ ...selectedLesson, dropoff_location: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Student Notes</label>
                <textarea
                  rows={2}
                  value={selectedLesson.student_notes}
                  onChange={(e) =>
                    setSelectedLesson({ ...selectedLesson, student_notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold hover:bg-[#152544]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* RESCHEDULE MODAL */}
        {isRescheduleModalOpen && selectedLesson && (
          <Modal
            isOpen={isRescheduleModalOpen}
            onClose={() => setIsRescheduleModalOpen(false)}
            title={`Reschedule Lesson ${selectedLesson.booking_id}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-bold mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Time</label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B1528] text-white font-bold hover:bg-[#152544]"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* CANCEL MODAL */}
        {cancelLessonModal && (
          <ConfirmModal
            isOpen={!!cancelLessonModal}
            onClose={() => setCancelLessonModal(null)}
            onConfirm={handleConfirmCancel}
            title="Cancel Booking"
            message={`Are you sure you want to cancel booking ${cancelLessonModal.booking_id} for ${cancelLessonModal.student_name}?`}
            confirmLabel="Yes, Cancel Booking"
            variant="danger"
          />
        )}
      </div>
    </AdminLayout>
  );
}
