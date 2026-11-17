"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Modal } from "@/components/common/Modal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiFetch } from "@/lib/api";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Car,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  RotateCcw,
  Trash2,
  ChevronDown,
  Info,
} from "lucide-react";

export interface CalendarLesson {
  id: string;
  booking_code: string;
  student_name: string;
  student_id?: number;
  instructor_name: string;
  instructor_id?: number;
  lesson_type: "Automatic" | "Manual";
  date: string; // YYYY-MM-DD
  start_time: string; // "09:00"
  duration_minutes: number; // 60, 90, 120
  pickup_location: string;
  notes?: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  color_scheme: "blue" | "green" | "yellow" | "purple" | "indigo";
}

const INSTRUCTORS_LIST = [
  { id: 1, name: "Kevin Anderson", vehicle: "Toyota Corolla Hybrid", transmission: "Manual" },
  { id: 2, name: "Priya Nair", vehicle: "Kia Picanto GT", transmission: "Automatic" },
  { id: 3, name: "Dan Mitchell", vehicle: "Hyundai i30 Active", transmission: "Manual" },
  { id: 4, name: "Lee Tran", vehicle: "Toyota Yaris Cross", transmission: "Automatic" },
  { id: 5, name: "Sam Kapoor", vehicle: "Mazda 2 Pure", transmission: "Automatic" },
];

const STUDENTS_LIST = [
  { id: 1, name: "Aisha Khan", suburb: "Parramatta", transmission: "Automatic" },
  { id: 2, name: "Liam O'Connor", suburb: "Westmead", transmission: "Automatic" },
  { id: 3, name: "Maya Rao", suburb: "Parramatta", transmission: "Automatic" },
  { id: 4, name: "Jack Robinson", suburb: "Blacktown", transmission: "Manual" },
  { id: 5, name: "Ella Singh", suburb: "Strathfield", transmission: "Automatic" },
  { id: 6, name: "Noah Bennett", suburb: "Burwood", transmission: "Manual" },
  { id: 7, name: "Chen Wei", suburb: "Penrith", transmission: "Manual" },
  { id: 8, name: "Zara Patel", suburb: "Ashfield", transmission: "Automatic" },
];

const INITIAL_LESSONS: CalendarLesson[] = [
  // Monday 16 Nov
  {
    id: "les-1",
    booking_code: "BK-8821",
    student_name: "Liam O'Connor",
    student_id: 2,
    instructor_name: "Sam Kapoor",
    instructor_id: 5,
    lesson_type: "Automatic",
    date: "2026-11-16",
    start_time: "09:00",
    duration_minutes: 60,
    pickup_location: "45 Station Road, Westmead NSW",
    notes: "Focus on 3-point turns and parallel parking.",
    status: "confirmed",
    color_scheme: "blue",
  },
  {
    id: "les-2",
    booking_code: "BK-8822",
    student_name: "Maya Rao",
    student_id: 3,
    instructor_name: "Priya Nair",
    instructor_id: 2,
    lesson_type: "Automatic",
    date: "2026-11-16",
    start_time: "12:00",
    duration_minutes: 60,
    pickup_location: "Parramatta Station Pickup Bay",
    notes: "Silverwater RMS test route orientation.",
    status: "confirmed",
    color_scheme: "green",
  },

  // Tuesday 17 Nov
  {
    id: "les-3",
    booking_code: "BK-8823",
    student_name: "Aisha Khan",
    student_id: 1,
    instructor_name: "Priya Nair",
    instructor_id: 2,
    lesson_type: "Automatic",
    date: "2026-11-17",
    start_time: "08:00",
    duration_minutes: 60,
    pickup_location: "12 Marsden Street, Parramatta",
    notes: "Pre-test readiness mock inspection.",
    status: "confirmed",
    color_scheme: "green",
  },
  {
    id: "les-4",
    booking_code: "BK-8824",
    student_name: "Noah Bennett",
    student_id: 6,
    instructor_name: "Kevin Anderson",
    instructor_id: 1,
    lesson_type: "Manual",
    date: "2026-11-17",
    start_time: "10:00",
    duration_minutes: 120,
    pickup_location: "5 Railway Parade, Burwood",
    notes: "Test prep warm-up + mock examiner checklist.",
    status: "confirmed",
    color_scheme: "indigo",
  },
  {
    id: "les-5",
    booking_code: "BK-8825",
    student_name: "Chen Wei",
    student_id: 7,
    instructor_name: "Dan Mitchell",
    instructor_id: 3,
    lesson_type: "Manual",
    date: "2026-11-17",
    start_time: "14:00",
    duration_minutes: 60,
    pickup_location: "102 High Street, Penrith",
    notes: "Overseas conversion hill start technique.",
    status: "confirmed",
    color_scheme: "yellow",
  },

  // Wednesday 18 Nov
  {
    id: "les-6",
    booking_code: "BK-8826",
    student_name: "Zara Patel",
    student_id: 8,
    instructor_name: "Lee Tran",
    instructor_id: 4,
    lesson_type: "Automatic",
    date: "2026-11-18",
    start_time: "09:00",
    duration_minutes: 60,
    pickup_location: "33 Liverpool Road, Ashfield",
    notes: "Roundabout navigation and lane positioning.",
    status: "confirmed",
    color_scheme: "purple",
  },
  {
    id: "les-7",
    booking_code: "BK-8827",
    student_name: "Omar Hassan",
    student_id: 9,
    instructor_name: "Sam Kapoor",
    instructor_id: 5,
    lesson_type: "Automatic",
    date: "2026-11-18",
    start_time: "11:00",
    duration_minutes: 60,
    pickup_location: "Blacktown Westpoint Entrance",
    notes: "Speed management on M4 motorway.",
    status: "pending",
    color_scheme: "blue",
  },
  {
    id: "les-8",
    booking_code: "BK-8828",
    student_name: "Ella Singh",
    student_id: 5,
    instructor_name: "Priya Nair",
    instructor_id: 2,
    lesson_type: "Automatic",
    date: "2026-11-18",
    start_time: "13:00",
    duration_minutes: 60,
    pickup_location: "73 Crown Street, Strathfield",
    notes: "First drive after kerbside briefing.",
    status: "confirmed",
    color_scheme: "green",
  },

  // Thursday 19 Nov
  {
    id: "les-9",
    booking_code: "BK-8829",
    student_name: "Jack Robinson",
    student_id: 4,
    instructor_name: "Dan Mitchell",
    instructor_id: 3,
    lesson_type: "Manual",
    date: "2026-11-19",
    start_time: "08:00",
    duration_minutes: 60,
    pickup_location: "19 Flushcombe Road, Blacktown",
    notes: "Clutch biting point in heavy traffic.",
    status: "confirmed",
    color_scheme: "yellow",
  },
  {
    id: "les-10",
    booking_code: "BK-8830",
    student_name: "Mia Lin",
    student_id: 10,
    instructor_name: "Priya Nair",
    instructor_id: 2,
    lesson_type: "Automatic",
    date: "2026-11-19",
    start_time: "10:00",
    duration_minutes: 60,
    pickup_location: "Ryde Central Plaza",
    notes: "Lane changing in multi-lane urban roads.",
    status: "confirmed",
    color_scheme: "green",
  },
  {
    id: "les-11",
    booking_code: "BK-8831",
    student_name: "Tom Allen",
    student_id: 11,
    instructor_name: "Dan Mitchell",
    instructor_id: 3,
    lesson_type: "Manual",
    date: "2026-11-19",
    start_time: "12:00",
    duration_minutes: 60,
    pickup_location: "Penrith Station North Side",
    notes: "Kerb approach and parking safety check.",
    status: "confirmed",
    color_scheme: "yellow",
  },

  // Friday 20 Nov
  {
    id: "les-12",
    booking_code: "BK-8832",
    student_name: "Zara Patel",
    student_id: 8,
    instructor_name: "Lee Tran",
    instructor_id: 4,
    lesson_type: "Automatic",
    date: "2026-11-20",
    start_time: "09:00",
    duration_minutes: 120,
    pickup_location: "Silverwater Test Centre",
    notes: "Driving test package with warm-up lesson.",
    status: "confirmed",
    color_scheme: "purple",
  },

  // Saturday 21 Nov
  {
    id: "les-13",
    booking_code: "BK-8833",
    student_name: "Nina Kapoor",
    student_id: 12,
    instructor_name: "Sam Kapoor",
    instructor_id: 5,
    lesson_type: "Automatic",
    date: "2026-11-21",
    start_time: "08:00",
    duration_minutes: 60,
    pickup_location: "Parramatta Westfield Gate 4",
    notes: "Weekend pedestrian hazard scanning.",
    status: "confirmed",
    color_scheme: "blue",
  },
  {
    id: "les-14",
    booking_code: "BK-8834",
    student_name: "Ben Cooper",
    student_id: 13,
    instructor_name: "Priya Nair",
    instructor_id: 2,
    lesson_type: "Automatic",
    date: "2026-11-21",
    start_time: "09:00",
    duration_minutes: 60,
    pickup_location: "Westmead Hospital Main Entry",
    notes: "Emergency stopping technique.",
    status: "confirmed",
    color_scheme: "green",
  },
  {
    id: "les-15",
    booking_code: "BK-8835",
    student_name: "Sara Mitchell",
    student_id: 14,
    instructor_name: "Lee Tran",
    instructor_id: 4,
    lesson_type: "Automatic",
    date: "2026-11-21",
    start_time: "10:00",
    duration_minutes: 60,
    pickup_location: "Burwood Park Memorial",
    notes: "Night driving preparation & headlight usage.",
    status: "confirmed",
    color_scheme: "purple",
  },
  {
    id: "les-16",
    booking_code: "BK-8836",
    student_name: "Ravi Sharma",
    student_id: 15,
    instructor_name: "Sam Kapoor",
    instructor_id: 5,
    lesson_type: "Automatic",
    date: "2026-11-21",
    start_time: "15:00",
    duration_minutes: 60,
    pickup_location: "Strathfield Plaza Taxi Rank",
    notes: "NSW logbook sign-off verification.",
    status: "confirmed",
    color_scheme: "blue",
  },
];

// Time slots from 8am to 5pm
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function CalendarPage() {
  // Calendar View mode
  const [view, setView] = useState<"Day" | "Week" | "Month">("Week");

  // Date Navigation State: base date representing Monday of current week
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date(2026, 10, 16)); // 16 Nov 2026

  // Filters
  const [instructorFilter, setInstructorFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Lessons State
  const [lessons, setLessons] = useState<CalendarLesson[]>(INITIAL_LESSONS);

  // Modals & Drawers
  const [selectedLesson, setSelectedLesson] = useState<CalendarLesson | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const [cancelModalLesson, setCancelModalLesson] = useState<CalendarLesson | null>(null);

  // Create / Edit Form State
  const [formData, setFormData] = useState({
    student_name: "Aisha Khan",
    instructor_name: "Priya Nair",
    lesson_type: "Automatic" as "Automatic" | "Manual",
    date: "2026-11-16",
    start_time: "09:00",
    duration_minutes: 60,
    pickup_location: "Parramatta",
    notes: "",
  });

  // Conflict warning state for Create / Edit Form
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Reschedule Form State
  const [rescheduleData, setRescheduleData] = useState({
    date: "2026-11-16",
    start_time: "10:00",
  });

  // Unscheduled lessons matching Attachment 8 & 9 reference
  const [unscheduledLessons, setUnscheduledLessons] = useState([
    { id: "u-1", studentName: "Liam O'Connor", details: "Lesson 2 of 10 · Sam K.", studentId: 2, instructorName: "Sam Kapoor" },
    { id: "u-2", studentName: "Maya Rao", details: "Lesson 1 of 5 · Priya N.", studentId: 3, instructorName: "Priya Nair" },
    { id: "u-3", studentName: "Ella Singh", details: "Lesson 4 of 10 · Priya N.", studentId: 5, instructorName: "Priya Nair" },
  ]);
  const [conflictResolved, setConflictResolved] = useState(false);

  // Load real bookings from backend if available
  useEffect(() => {
    const loadBackendBookings = async () => {
      try {
        const res = await apiFetch("/api/bookings", { params: { limit: 100 } });
        if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: CalendarLesson[] = res.data.map((b: any) => {
            const colors: ("blue" | "green" | "yellow" | "purple" | "indigo")[] = [
              "blue",
              "green",
              "yellow",
              "purple",
              "indigo",
            ];
            const color = colors[(b.instructor_id || 1) % colors.length];

            return {
              id: `bk-${b.id}`,
              booking_code: b.booking_code || `BK-${b.id}`,
              student_name: b.student_name || "Student",
              student_id: b.student_id,
              instructor_name: b.instructor_name || "Priya Nair",
              instructor_id: b.instructor_id,
              lesson_type: (b.transmission === "manual" ? "Manual" : "Automatic") as any,
              date: b.lesson_date || "2026-11-16",
              start_time: (b.start_time || "09:00").substring(0, 5),
              duration_minutes: Number(b.duration_minutes || 60),
              pickup_location: b.pickup_address
                ? `${b.pickup_address}, ${b.pickup_suburb}`
                : "Sydney CBD",
              notes: b.student_notes || b.notes || "",
              status: (b.booking_status === "cancelled"
                ? "cancelled"
                : b.booking_status === "completed"
                ? "completed"
                : b.booking_status === "new_request"
                ? "pending"
                : "confirmed") as any,
              color_scheme: color,
            };
          });

          // Merge without overriding initial demo dates if backend dates are far off
          if (mapped.length > 0) {
            setLessons((prev) => {
              const combined = [...mapped];
              prev.forEach((p) => {
                if (!combined.some((c) => c.id === p.id || c.booking_code === p.booking_code)) {
                  combined.push(p);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn("Using sample calendar data:", err);
      }
    };
    loadBackendBookings();
  }, []);

  // Compute days for Week View (Mon - Sun)
  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = dayNames[d.getDay()];
    const dayNumber = d.getDate();
    const isToday =
      d.getDate() === 17 && d.getMonth() === 10 && d.getFullYear() === 2026; // Highlight Tue 17 Nov
    return { date: dateStr, dayName, dayNumber, isToday, fullDate: d };
  });

  // Month and Year label
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const headerDateLabel = `‹ ${monthNames[currentWeekStart.getMonth()]} ${currentWeekStart.getFullYear()} ›`;

  // Week navigation
  const handlePrev = () => {
    const prev = new Date(currentWeekStart);
    if (view === "Day") {
      prev.setDate(prev.getDate() - 1);
    } else if (view === "Month") {
      prev.setMonth(prev.getMonth() - 1);
    } else {
      prev.setDate(prev.getDate() - 7);
    }
    setCurrentWeekStart(prev);
  };

  const handleNext = () => {
    const next = new Date(currentWeekStart);
    if (view === "Day") {
      next.setDate(next.getDate() + 1);
    } else if (view === "Month") {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentWeekStart(next);
  };

  const handleToday = () => {
    setCurrentWeekStart(new Date(2026, 10, 16));
  };

  // Check double-booking / overlap conflict helper
  const checkConflict = (
    instructorName: string,
    studentName: string,
    date: string,
    time: string,
    duration: number,
    excludeId?: string
  ) => {
    const [startH, startM] = time.split(":").map(Number);
    const startMins = startH * 60 + startM;
    const endMins = startMins + duration;

    for (const l of lessons) {
      if (excludeId && l.id === excludeId) continue;
      if (l.status === "cancelled") continue;
      if (l.date !== date) continue;

      const [otherH, otherM] = l.start_time.split(":").map(Number);
      const otherStart = otherH * 60 + otherM;
      const otherEnd = otherStart + l.duration_minutes;

      // Check time overlap: (startA < endB) && (endA > startB)
      const hasOverlap = startMins < otherEnd && endMins > otherStart;

      if (hasOverlap) {
        if (l.instructor_name === instructorName) {
          return `⚠️ Conflict Detected: Instructor ${instructorName} already has a scheduled lesson with ${l.student_name} on ${date} at ${l.start_time}.`;
        }
        if (l.student_name === studentName) {
          return `⚠️ Conflict Detected: Student ${studentName} already has another lesson scheduled on ${date} at ${l.start_time}.`;
        }
      }
    }
    return null;
  };

  // Open Create Modal
  const handleOpenCreateModal = (defaultDate?: string, defaultTime?: string) => {
    setFormData({
      student_name: STUDENTS_LIST[0].name,
      instructor_name: INSTRUCTORS_LIST[1].name,
      lesson_type: "Automatic",
      date: defaultDate || weekDays[0].date,
      start_time: defaultTime || "09:00",
      duration_minutes: 60,
      pickup_location: "Parramatta",
      notes: "",
    });
    setConflictWarning(null);
    setCreateModalOpen(true);
  };

  // Form field changes with live conflict check
  const handleFormFieldChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    const warning = checkConflict(
      updated.instructor_name,
      updated.student_name,
      updated.date,
      updated.start_time,
      Number(updated.duration_minutes)
    );
    setConflictWarning(warning);
  };

  // Save Schedule (Create)
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify conflicts
    const conflict = checkConflict(
      formData.instructor_name,
      formData.student_name,
      formData.date,
      formData.start_time,
      Number(formData.duration_minutes)
    );
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const newId = `les-${Date.now()}`;
    const newCode = `BK-${Math.floor(8800 + Math.random() * 200)}`;

    const colors: ("blue" | "green" | "yellow" | "purple" | "indigo")[] = [
      "blue",
      "green",
      "yellow",
      "purple",
      "indigo",
    ];
    const instIdx = INSTRUCTORS_LIST.findIndex((i) => i.name === formData.instructor_name);
    const color = colors[instIdx >= 0 ? instIdx % colors.length : 0];

    const newLesson: CalendarLesson = {
      id: newId,
      booking_code: newCode,
      student_name: formData.student_name,
      instructor_name: formData.instructor_name,
      lesson_type: formData.lesson_type,
      date: formData.date,
      start_time: formData.start_time,
      duration_minutes: Number(formData.duration_minutes),
      pickup_location: formData.pickup_location,
      notes: formData.notes,
      status: "confirmed",
      color_scheme: color,
    };

    setLessons((prev) => [newLesson, ...prev]);
    setCreateModalOpen(false);
  };

  // Open Edit Schedule Modal
  const handleOpenEditModal = (lesson: CalendarLesson) => {
    setSelectedLesson(lesson);
    setFormData({
      student_name: lesson.student_name,
      instructor_name: lesson.instructor_name,
      lesson_type: lesson.lesson_type,
      date: lesson.date,
      start_time: lesson.start_time,
      duration_minutes: lesson.duration_minutes,
      pickup_location: lesson.pickup_location,
      notes: lesson.notes || "",
    });
    setConflictWarning(null);
    setEditModalOpen(true);
  };

  // Save Edited Schedule
  const handleSaveEditedSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;

    const conflict = checkConflict(
      formData.instructor_name,
      formData.student_name,
      formData.date,
      formData.start_time,
      Number(formData.duration_minutes),
      selectedLesson.id
    );
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    setLessons((prev) =>
      prev.map((l) =>
        l.id === selectedLesson.id
          ? {
              ...l,
              student_name: formData.student_name,
              instructor_name: formData.instructor_name,
              lesson_type: formData.lesson_type,
              date: formData.date,
              start_time: formData.start_time,
              duration_minutes: Number(formData.duration_minutes),
              pickup_location: formData.pickup_location,
              notes: formData.notes,
            }
          : l
      )
    );

    setSelectedLesson(null);
    setEditModalOpen(false);
  };

  // Open Reschedule Modal
  const handleOpenRescheduleModal = (lesson: CalendarLesson) => {
    setSelectedLesson(lesson);
    setRescheduleData({
      date: lesson.date,
      start_time: lesson.start_time,
    });
    setConflictWarning(null);
    setRescheduleModalOpen(true);
  };

  // Confirm Reschedule
  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;

    const conflict = checkConflict(
      selectedLesson.instructor_name,
      selectedLesson.student_name,
      rescheduleData.date,
      rescheduleData.start_time,
      selectedLesson.duration_minutes,
      selectedLesson.id
    );
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    setLessons((prev) =>
      prev.map((l) =>
        l.id === selectedLesson.id
          ? {
              ...l,
              date: rescheduleData.date,
              start_time: rescheduleData.start_time,
            }
          : l
      )
    );

    setSelectedLesson(null);
    setRescheduleModalOpen(false);
  };

  // Cancel Schedule
  const handleConfirmCancel = () => {
    if (!cancelModalLesson) return;
    setLessons((prev) =>
      prev.map((l) => (l.id === cancelModalLesson.id ? { ...l, status: "cancelled" } : l))
    );
    if (selectedLesson?.id === cancelModalLesson.id) {
      setSelectedLesson(null);
    }
    setCancelModalLesson(null);
  };

  // Filter lessons based on instructorFilter and searchQuery
  const filteredLessons = lessons.filter((l) => {
    if (l.status === "cancelled") return false; // don't clutter active calendar with cancelled
    if (instructorFilter !== "all" && l.instructor_name !== instructorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = l.student_name.toLowerCase().includes(q);
      const matchInstructor = l.instructor_name.toLowerCase().includes(q);
      const matchBooking = l.booking_code.toLowerCase().includes(q);
      if (!matchStudent && !matchInstructor && !matchBooking) return false;
    }
    return true;
  });

  // Color map for lesson pill blocks
  const colorMap = {
    blue: "bg-[#EBF3FF] border-[#BFDBFE] text-[#1E40AF] hover:bg-[#DBEAFE]",
    green: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5]",
    yellow: "bg-[#FEFCE8] border-[#FEF08A] text-[#854D0E] hover:bg-[#FEF9C3]",
    purple: "bg-[#FAF5FF] border-[#E9D5FF] text-[#6B21A8] hover:bg-[#F3E8FF]",
    indigo: "bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3] hover:bg-[#E0E7FF]",
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-12">
        {/* 1. Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              Schedule & Calendar
            </h1>
            <p className="font-sans font-medium text-xs sm:text-sm text-slate-500 mt-1">
              Week of {weekDays[0].dayNumber} {monthNames[currentWeekStart.getMonth()]} –{" "}
              {weekDays[6].dayNumber} {monthNames[currentWeekStart.getMonth()]}{" "}
              {currentWeekStart.getFullYear()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Previous & Next Navigation + Today Button */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 rounded-lg text-xs font-heading font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Current Month display */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm font-heading font-bold text-slate-800 shadow-2xs">
              {headerDateLabel}
            </div>

            {/* + Create Schedule Button */}
            <button
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-heading font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Create Schedule</span>
            </button>
          </div>
        </div>

        {/* 2. Calendar Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Day, Week, Month View Tabs */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-full w-fit">
            {(["Day", "Week", "Month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold transition-all ${
                  view === v
                    ? "bg-[#0B1528] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Student / Instructor */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/10"
              />
            </div>

            {/* Instructor Filter Dropdown (Instructor ▼) */}
            <div className="relative">
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">Instructor: All</option>
                {INSTRUCTORS_LIST.map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.name} ({inst.transmission})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3. Main Calendar Layout strictly matching Reference Image Attachment 8 & 9 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Calendar Timetable */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-4 sm:p-6 overflow-hidden">
          {view === "Week" && (
            <div className="overflow-x-auto">
              <div className="min-w-[840px]">
                {/* Day Headers Row */}
                <div className="grid grid-cols-8 pb-4 border-b border-slate-100 items-end">
                  {/* Empty cell for time labels */}
                  <div className="text-[11px] font-bold text-slate-400 pl-2">TIME</div>

                  {weekDays.map((d, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[11px] font-heading font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {d.dayName}
                      </p>
                      {d.isToday ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0B1528] text-white text-xs font-heading font-black shadow-xs">
                          {d.dayNumber}
                        </span>
                      ) : (
                        <span className="text-sm font-heading font-bold text-slate-700">
                          {d.dayNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Timetable Rows */}
                <div className="divide-y divide-slate-100 font-sans">
                  {TIME_SLOTS.map((timeSlot) => (
                    <div key={timeSlot} className="grid grid-cols-8 py-2 min-h-[72px] items-start">
                      {/* Time Label Column */}
                      <div className="text-xs font-mono font-medium text-slate-400 pt-1.5 pl-2">
                        {timeSlot}
                      </div>

                      {/* 7 Days Columns */}
                      {weekDays.map((d) => {
                        // Find lessons scheduled on this day at this start time
                        const slotLessons = filteredLessons.filter(
                          (l) => l.date === d.date && l.start_time === timeSlot
                        );

                        return (
                          <div
                            key={d.date}
                            onClick={() => {
                              if (slotLessons.length === 0) {
                                handleOpenCreateModal(d.date, timeSlot);
                              }
                            }}
                            className="px-1.5 min-h-[64px] border-l border-slate-100/70 hover:bg-slate-50/50 rounded-lg transition-colors cursor-pointer group"
                            title={
                              slotLessons.length === 0
                                ? `Click to schedule lesson on ${d.dayName} at ${timeSlot}`
                                : undefined
                            }
                          >
                            {slotLessons.map((les) => (
                              <div
                                key={les.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLesson(les);
                                }}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm mb-1.5 ${
                                  colorMap[les.color_scheme] || colorMap.blue
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-heading font-black text-xs leading-snug line-clamp-1">
                                    {les.student_name}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/70">
                                    {les.duration_minutes}m
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] opacity-90 mt-1 font-medium">
                                  <span className="truncate">{les.instructor_name}</span>
                                  <span className="text-[10px] font-bold uppercase shrink-0">
                                    {les.lesson_type === "Manual" ? "Man" : "Auto"}
                                  </span>
                                </div>
                              </div>
                            ))}

                            {slotLessons.length === 0 && (
                              <div className="h-full w-full min-h-[48px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3.5 h-3.5 text-slate-300" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "Day" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-heading font-black text-sm text-slate-800">
                  {weekDays[1].dayName}, {weekDays[1].dayNumber} {monthNames[currentWeekStart.getMonth()]} 2026
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {filteredLessons.filter((l) => l.date === weekDays[1].date).length} scheduled lessons today
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {TIME_SLOTS.map((slot) => {
                  const dayLessons = filteredLessons.filter(
                    (l) => l.date === weekDays[1].date && l.start_time === slot
                  );
                  return (
                    <div key={slot} className="py-3 flex items-start gap-4">
                      <div className="w-16 font-mono font-bold text-xs text-slate-500 pt-1">
                        {slot}
                      </div>
                      <div className="flex-1">
                        {dayLessons.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {dayLessons.map((les) => (
                              <div
                                key={les.id}
                                onClick={() => setSelectedLesson(les)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                                  colorMap[les.color_scheme] || colorMap.blue
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-heading font-black text-sm">
                                    {les.student_name}
                                  </span>
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80">
                                    {les.duration_minutes} min
                                  </span>
                                </div>
                                <div className="text-xs mt-1.5 opacity-90 flex items-center gap-3">
                                  <span>Instructor: {les.instructor_name}</span>
                                  <span>•</span>
                                  <span>{les.lesson_type}</span>
                                </div>
                                <div className="text-[11px] opacity-75 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{les.pickup_location}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            onClick={() => handleOpenCreateModal(weekDays[1].date, slot)}
                            className="p-3 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs text-slate-400 cursor-pointer flex items-center gap-2 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Available slot. Click to schedule.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "Month" && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 text-center font-heading font-bold text-xs text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayDate = `2026-11-${String(dayNum).padStart(2, "0")}`;
                  const dayLessons = filteredLessons.filter((l) => l.date === dayDate);
                  return (
                    <div
                      key={dayNum}
                      onClick={() => handleOpenCreateModal(dayDate, "09:00")}
                      className={`min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer ${
                        dayNum === 17
                          ? "bg-amber-50/40 border-amber-300"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`text-xs font-heading font-bold block mb-1 ${
                          dayNum === 17 ? "text-amber-800" : "text-slate-700"
                        }`}
                      >
                        {dayNum}
                      </span>
                      <div className="space-y-1">
                        {dayLessons.slice(0, 2).map((les) => (
                          <div
                            key={les.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLesson(les);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-heading font-bold truncate border ${
                              colorMap[les.color_scheme] || colorMap.blue
                            }`}
                          >
                            {les.start_time} {les.student_name}
                          </div>
                        ))}
                        {dayLessons.length > 2 && (
                          <span className="text-[9px] font-bold text-slate-400 block text-right">
                            +{dayLessons.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </div>

          {/* Right Sidebar: Unscheduled Lessons, Instructors Legend & Conflict Alert strictly matching Attachment 8 & 9 */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-5">
            {/* 1. Unscheduled lessons card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <h3 className="font-heading font-black text-sm text-slate-900 mb-3 flex items-center justify-between">
                <span>Unscheduled lessons</span>
                <span className="text-xs font-bold text-slate-400">· {unscheduledLessons.length}</span>
              </h3>
              <div className="space-y-3">
                {unscheduledLessons.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
                    <div>
                      <span className="font-heading font-black text-xs text-slate-900 block leading-tight">
                        {u.studentName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {u.details}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          student_name: u.studentName,
                          instructor_name: u.instructorName,
                        });
                        setCreateModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shrink-0"
                    >
                      Drag in
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Instructors Legend */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <h3 className="font-heading font-black text-sm text-slate-900 mb-3">
                Instructors
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="font-medium text-slate-800">Sam Kapoor</span>
                  </div>
                  <span className="font-semibold text-slate-500">9 lessons</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">Priya Nair</span>
                  </div>
                  <span className="font-semibold text-slate-500">8 lessons</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-medium text-slate-800">Dan Mitchell</span>
                  </div>
                  <span className="font-semibold text-slate-500">5 lessons</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <span className="font-medium text-slate-800">Lee Tran</span>
                  </div>
                  <span className="font-semibold text-slate-500">5 lessons</span>
                </div>
              </div>
            </div>

            {/* 3. Conflict Alert Card */}
            {!conflictResolved ? (
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-rose-900 font-heading font-black text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>1 conflict</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed mt-1">
                  Sam K. is double-booked on Tue 4 pm with a vehicle service.
                </p>
                <button
                  onClick={() => {
                    alert("Vehicle service scheduled for Sam K. has been rescheduled to Tue 5:30 pm. Schedule conflict resolved!");
                    setConflictResolved(true);
                  }}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold shadow-2xs transition-all"
                >
                  Resolve
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-2xs text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">All schedule conflicts resolved.</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. CREATE SCHEDULE (FORM MODAL) */}
        {createModalOpen && (
          <Modal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            title="Create Schedule"
            maxWidth="md"
          >
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              {/* Conflict warning banner */}
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Student *
                </label>
                <select
                  value={formData.student_name}
                  onChange={(e) => handleFormFieldChange("student_name", e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                >
                  {STUDENTS_LIST.map((stud) => (
                    <option key={stud.id} value={stud.name}>
                      {stud.name} ({stud.suburb} · {stud.transmission})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Instructor & Lesson Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Instructor *
                  </label>
                  <select
                    value={formData.instructor_name}
                    onChange={(e) => handleFormFieldChange("instructor_name", e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    {INSTRUCTORS_LIST.map((inst) => (
                      <option key={inst.id} value={inst.name}>
                        {inst.name} ({inst.transmission})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lesson Type *
                  </label>
                  <select
                    value={formData.lesson_type}
                    onChange={(e) => handleFormFieldChange("lesson_type", e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              {/* Select Date, Start Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleFormFieldChange("date", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <select
                    value={formData.start_time}
                    onChange={(e) => handleFormFieldChange("start_time", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration *
                  </label>
                  <select
                    value={formData.duration_minutes}
                    onChange={(e) => handleFormFieldChange("duration_minutes", Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    <option value={60}>60 min (1 hr)</option>
                    <option value={90}>90 min (1.5 hr)</option>
                    <option value={120}>120 min (2 hr)</option>
                  </select>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                  placeholder="e.g. Parramatta Station, 14 Victoria Road"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              {/* Additional Notes (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Reverse parallel parking focus, student first session..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-heading font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-heading font-bold text-xs sm:text-sm shadow-xs transition-colors"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* 5. ON CLICKING A SCHEDULED LESSON (DETAIL DRAWER / MODAL) */}
        {selectedLesson && (
          <Modal
            isOpen={!!selectedLesson}
            onClose={() => setSelectedLesson(null)}
            title="Scheduled Lesson Details"
            maxWidth="md"
          >
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-[#0B1528] bg-slate-200/70 px-2 py-0.5 rounded-md">
                    {selectedLesson.booking_code}
                  </span>
                  <h3 className="font-heading font-black text-lg text-slate-900 mt-1">
                    {selectedLesson.student_name}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full font-heading font-bold text-xs capitalize ${
                    selectedLesson.status === "confirmed"
                      ? "bg-[#DCFCE7] text-[#15803D]"
                      : selectedLesson.status === "completed"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {selectedLesson.status}
                </span>
              </div>

              {/* Details List strictly matching requirements */}
              <div className="space-y-2.5 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Student Name</span>
                  <span className="font-heading font-bold text-slate-900">
                    {selectedLesson.student_name}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Instructor Name</span>
                  <span className="font-heading font-bold text-blue-600">
                    {selectedLesson.instructor_name}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Lesson Type</span>
                  <span className="font-bold text-slate-900">
                    {selectedLesson.lesson_type} Driving Lesson ({selectedLesson.duration_minutes} min)
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <span className="font-bold text-slate-900">
                    {selectedLesson.date} at {selectedLesson.start_time}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Pickup Location</span>
                  <span className="font-bold text-slate-900 text-right max-w-[260px]">
                    {selectedLesson.pickup_location}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Booking Status</span>
                  <span className="font-bold capitalize text-slate-900">
                    {selectedLesson.status}
                  </span>
                </div>

                {selectedLesson.notes && (
                  <div className="py-2">
                    <span className="text-slate-500 font-medium block mb-1">Additional Notes</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans">
                      {selectedLesson.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* 3 ACTIONS strictly matching requirement: Edit Schedule, Reschedule, Cancel Schedule */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const current = selectedLesson;
                    setSelectedLesson(null);
                    setCancelModalLesson(current);
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 font-heading font-bold text-xs hover:bg-rose-50 transition-colors"
                >
                  Cancel Schedule
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = selectedLesson;
                      setSelectedLesson(null);
                      handleOpenRescheduleModal(cur);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-heading font-bold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = selectedLesson;
                      setSelectedLesson(null);
                      handleOpenEditModal(cur);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B1528] text-white font-heading font-bold text-xs hover:bg-[#07345B] transition-colors"
                  >
                    Edit Schedule
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* EDIT SCHEDULE MODAL */}
        {editModalOpen && (
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title="Edit Schedule"
            maxWidth="md"
          >
            <form onSubmit={handleSaveEditedSchedule} className="space-y-4">
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructor</label>
                  <select
                    value={formData.instructor_name}
                    onChange={(e) => handleFormFieldChange("instructor_name", e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    {INSTRUCTORS_LIST.map((inst) => (
                      <option key={inst.id} value={inst.name}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Type</label>
                  <select
                    value={formData.lesson_type}
                    onChange={(e) => setFormData({ ...formData, lesson_type: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleFormFieldChange("date", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <select
                    value={formData.start_time}
                    onChange={(e) => handleFormFieldChange("start_time", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <select
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  >
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Location</label>
                <input
                  type="text"
                  required
                  value={formData.pickup_location}
                  onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-heading font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-heading font-bold text-xs shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* RESCHEDULE MODAL */}
        {rescheduleModalOpen && (
          <Modal
            isOpen={rescheduleModalOpen}
            onClose={() => setRescheduleModalOpen(false)}
            title="Reschedule Lesson"
            maxWidth="sm"
          >
            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              {conflictWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time Slot</label>
                <select
                  value={rescheduleData.start_time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, start_time: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-heading font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-heading font-bold text-xs transition-colors"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* CANCEL CONFIRMATION MODAL */}
        {cancelModalLesson && (
          <ConfirmModal
            isOpen={!!cancelModalLesson}
            onClose={() => setCancelModalLesson(null)}
            onConfirm={handleConfirmCancel}
            title="Cancel Scheduled Lesson"
            message={`Are you sure you want to cancel the scheduled lesson for ${cancelModalLesson.student_name} on ${cancelModalLesson.date} at ${cancelModalLesson.start_time}?`}
            confirmLabel="Yes, Cancel Schedule"
            variant="danger"
          />
        )}
      </div>
    </AdminLayout>
  );
}
