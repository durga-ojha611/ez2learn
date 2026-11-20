"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { apiFetch } from "@/lib/api";
import {
  Car,
  ShieldCheck,
  Award,
  Clock,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Phone,
  Mail,
  Check,
  UserCheck,
  CalendarDays,
  Sparkles,
  Info,
  ExternalLink,
} from "lucide-react";

export default function InstructorAvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const idNum = parseInt(rawId, 10) || 1;

  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Wednesday");

  useEffect(() => {
    loadInstructor();
  }, [rawId]);

  const loadInstructor = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/instructors/${rawId}`);
      if (res.success && res.data) {
        setInstructor(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const isKevin = idNum === 1 || instructor?.name?.toLowerCase().includes("kevin");
  const insName = instructor?.name || (isKevin ? "Kevin Kabir" : "Professional Instructor");

  // Schedule Days
  const daysOfWeek = [
    { name: "Monday", date: "24 Nov", slotsAvailable: 4 },
    { name: "Tuesday", date: "25 Nov", slotsAvailable: 5 },
    { name: "Wednesday", date: "26 Nov", slotsAvailable: 3 },
    { name: "Thursday", date: "27 Nov", slotsAvailable: 4 },
    { name: "Friday", date: "28 Nov", slotsAvailable: 2 },
    { name: "Saturday", date: "29 Nov", slotsAvailable: 5 },
    { name: "Sunday", date: "30 Nov", slotsAvailable: 3 },
  ];

  // Daily Schedule Slots mapping
  const dayScheduleMap: Record<
    string,
    { time: string; status: "available" | "booked" | "test_warmup"; type: string }[]
  > = {
    Monday: [
      { time: "07:30 AM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "09:00 AM", status: "booked", type: "Student Logbook Session" },
      { time: "10:30 AM", status: "available", type: "Dual Control or Student Car" },
      { time: "01:00 PM", status: "test_warmup", type: "Silverwater RMS Test Hire" },
      { time: "02:30 PM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "04:00 PM", status: "available", type: "Afternoon Highway Session" },
      { time: "05:30 PM", status: "booked", type: "Night Driving Hours" },
    ],
    Tuesday: [
      { time: "07:30 AM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "09:00 AM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "10:30 AM", status: "booked", type: "Student Logbook Session" },
      { time: "01:00 PM", status: "available", type: "Dual Control or Student Car" },
      { time: "02:30 PM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "04:00 PM", status: "available", type: "Afternoon Peak Hour Prep" },
      { time: "05:30 PM", status: "test_warmup", type: "Castle Hill RMS Test Hire" },
    ],
    Wednesday: [
      { time: "07:30 AM", status: "booked", type: "Student Logbook Session" },
      { time: "09:00 AM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "10:30 AM", status: "available", type: "Dual Control or Student Car" },
      { time: "01:00 PM", status: "test_warmup", type: "Silverwater RMS Test Hire" },
      { time: "02:30 PM", status: "booked", type: "Mock Test Assessment" },
      { time: "04:00 PM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "05:30 PM", status: "booked", type: "Night Driving Session" },
    ],
    Thursday: [
      { time: "07:30 AM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "09:00 AM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "10:30 AM", status: "booked", type: "Student Logbook Session" },
      { time: "01:00 PM", status: "available", type: "Dual Control or Student Car" },
      { time: "02:30 PM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "04:00 PM", status: "booked", type: "Mock Test Practice" },
      { time: "05:30 PM", status: "available", type: "Night Driving Hours" },
    ],
    Friday: [
      { time: "07:30 AM", status: "booked", type: "Student Logbook Session" },
      { time: "09:00 AM", status: "test_warmup", type: "Blacktown RMS Test Hire" },
      { time: "10:30 AM", status: "available", type: "Standard Lesson (Dual Control)" },
      { time: "01:00 PM", status: "booked", type: "Reverse Parallel Parking Clinic" },
      { time: "02:30 PM", status: "available", type: "Dual Control or Student Car" },
      { time: "04:00 PM", status: "booked", type: "Student Logbook Session" },
      { time: "05:30 PM", status: "booked", type: "Night Driving Session" },
    ],
    Saturday: [
      { time: "07:30 AM", status: "available", type: "Early Bird Weekend Slot" },
      { time: "09:00 AM", status: "available", type: "Dual Control Lesson" },
      { time: "10:30 AM", status: "available", type: "Dual Control Lesson" },
      { time: "01:00 PM", status: "booked", type: "Student Logbook Session" },
      { time: "02:30 PM", status: "available", type: "Standard Lesson" },
      { time: "04:00 PM", status: "available", type: "Dual Control or Student Car" },
      { time: "05:30 PM", status: "booked", type: "Weekend Evening Session" },
    ],
    Sunday: [
      { time: "08:00 AM", status: "available", type: "Sunday Morning Special" },
      { time: "09:30 AM", status: "available", type: "Standard Lesson" },
      { time: "11:00 AM", status: "booked", type: "Student Logbook Session" },
      { time: "01:30 PM", status: "available", type: "Dual Control Lesson" },
      { time: "03:00 PM", status: "booked", type: "Weekend Intensive" },
      { time: "04:30 PM", status: "booked", type: "Student Logbook Session" },
    ],
  };

  const currentSlots = dayScheduleMap[selectedDay] || dayScheduleMap["Wednesday"];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#FAB10B] selection:text-[#07345B]">
      {/* 1. NAVBAR */}
      <LandingNavbar />

      {/* 2. BREADCRUMB & HEADER */}
      <div className="bg-slate-50 border-b border-slate-200/80 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/our-instructors" className="hover:text-slate-900 transition-colors">
              Our Instructors
            </Link>
            <span>/</span>
            <Link
              href={`/our-instructors/${rawId}`}
              className="hover:text-slate-900 transition-colors"
            >
              {insName}
            </Link>
            <span>/</span>
            <span className="text-[#07345B] font-bold">Availability</span>
          </div>

          <Link
            href={`/our-instructors/${rawId}`}
            className="inline-flex items-center gap-1 font-semibold text-[#07345B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </Link>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {insName}&apos;s Weekly Schedule & Availability
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              7 Days a Week • Sydney Western Suburbs & Sydney CBD • Book any available slot with 1 click
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/our-instructors/${rawId}/book`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#e2a008] text-[#07345B] font-heading font-bold text-xs sm:text-sm shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Lesson</span>
            </Link>
            <Link
              href={`/our-instructors/${rawId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-heading font-semibold text-xs sm:text-sm transition-all"
            >
              <span>View Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MAIN SCHEDULE MATRIX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* DAY SELECTOR TABS */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.name}
                type="button"
                onClick={() => setSelectedDay(day.name)}
                className={`p-3.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  selectedDay === day.name
                    ? "bg-[#07345B] text-white shadow-md ring-2 ring-[#07345B]/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span className="font-heading font-semibold text-xs sm:text-sm">
                  {day.name}
                </span>
                <span
                  className={`text-[11px] ${
                    selectedDay === day.name ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {day.date}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                    selectedDay === day.name
                      ? "bg-[#FAB10B] text-[#07345B]"
                      : "bg-[#E8F8EE] text-[#0E8A38]"
                  }`}
                >
                  {day.slotsAvailable} open
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TIME SLOTS LIST FOR SELECTED DAY */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="font-heading font-semibold text-xl text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#07345B]" />
                <span>Available Sessions for {selectedDay}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an open time slot below to proceed directly to instant online booking.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E8A38]"></span>
                Available
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FAB10B]"></span>
                Test Warm-up
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                Booked
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSlots.map((slot, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  slot.status === "available"
                    ? "border-[#B6EAC4] bg-[#F4FCF7] shadow-2xs hover:shadow-xs"
                    : slot.status === "test_warmup"
                    ? "border-[#FEF08A] bg-[#FFFDF5]"
                    : "border-slate-200 bg-slate-50 opacity-60"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-base text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{slot.time}</span>
                    </span>

                    {slot.status === "available" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8F8EE] text-[#0E8A38] font-heading font-bold text-[10px] uppercase">
                        Available
                      </span>
                    ) : slot.status === "test_warmup" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] font-heading font-bold text-[10px] uppercase">
                        Test Warm-up
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-heading font-bold text-[10px] uppercase">
                        Booked
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    {slot.type}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Dual Control Car
                  </span>

                  {slot.status === "available" ? (
                    <Link
                      href={`/our-instructors/${rawId}/book?time=${encodeURIComponent(
                        slot.time
                      )}&day=${selectedDay}`}
                      className="px-3 py-1.5 rounded-lg bg-[#07345B] hover:bg-[#0b1528] text-white font-heading font-bold text-xs transition-colors"
                    >
                      Reserve Slot →
                    </Link>
                  ) : slot.status === "test_warmup" ? (
                    <Link
                      href={`/our-instructors/${rawId}/book?time=${encodeURIComponent(
                        slot.time
                      )}&day=${selectedDay}`}
                      className="px-3 py-1.5 rounded-lg bg-[#FAB10B] hover:bg-[#e2a008] text-[#07345B] font-heading font-bold text-xs transition-colors"
                    >
                      Book Warm-up →
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Slot Taken
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TEST CENTRES & COVERAGE SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <h3 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#07345B]" />
              <span>RMS Driving Test Route Availability</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {insName} conducts pre-test route warm-ups and vehicle hires at the following Sydney test centres:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Silverwater Service NSW</span>
                <span className="text-[#0E8A38] font-bold">Mon – Sat</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Castle Hill Service NSW</span>
                <span className="text-[#0E8A38] font-bold">Mon – Fri</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800">Blacktown Service NSW</span>
                <span className="text-[#0E8A38] font-bold">Mon – Sat</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <h3 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#FAB10B]" />
              <span>Need a Custom or Weekend Time Slot?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your desired lesson slot is not listed above or you have an upcoming RMS driving test date that requires urgent booking, contact our operations desk.
            </p>
            <div className="pt-2">
              <a
                href="tel:1300399532"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#07345B] text-white font-heading font-bold text-xs shadow-xs hover:bg-[#0b1528] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#FAB10B]" />
                <span>Call Coordination Desk (1300 399 532)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-10 px-4 sm:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EZY 2 LEARN Driving School. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>•</span>
            <Link href="/our-instructors" className="hover:text-white">Our Instructors</Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-white">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
