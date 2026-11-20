"use client";

import React from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { DrivingLessonsSection } from "@/components/landing/DrivingLessonsSection";
import {
  Car,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Phone,
  HelpCircle,
} from "lucide-react";

export default function DrivingLessonsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#FAB10B] selection:text-[#07345B]">
      {/* 1. NAVBAR */}
      <LandingNavbar />

      {/* 2. HERO BANNER */}
      <section className="bg-gradient-to-br from-[#07345B] via-[#093c68] to-[#042038] text-white pt-12 pb-16 sm:pt-16 sm:pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#FAB10B]">
            <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
            <span>Sydney Accredited Driving Instruction</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight">
            Driving Lessons & Course Catalog
          </h1>

          <div className="w-20 h-1.5 bg-[#FAB10B] rounded-full mx-auto" />

          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            From your very first lesson to passing your practical driving test at Service NSW on the first attempt.
            Accredited RMS instructors, 5-Star ANCAP dual-control cars, and 3-for-1 bonus logbook hours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#FAB10B] hover:bg-[#e2a008] text-[#07345B] font-heading font-bold text-sm shadow-md"
            >
              <span>Book Online Now</span>
              <ArrowRight className="w-4 h-4 text-[#07345B]" />
            </Link>
            <a
              href="tel:1300399532"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-heading font-semibold text-sm"
            >
              <Phone className="w-4 h-4 text-[#FAB10B]" />
              <span>Call 1300 399 532</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. ALL 14 DRIVING LESSONS SECTION */}
      <DrivingLessonsSection id="lessons-list" />

      {/* 4. FAQ ACCORDION STRIP */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about our driving lessons across Sydney.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#07345B] shrink-0" />
              How do the 3-for-1 logbook hours work?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In NSW, every 1 hour of driving with an accredited instructor counts as 3 hours in your official logbook,
              up to a maximum of 10 structured hours (which equals 30 logbook hours).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#07345B] shrink-0" />
              What is included in the Driving Test Car Hire?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              It includes home pickup, a 45-minute warm-up drive right before your test, use of our certified dual-control
              vehicle for the test with the RMS examiner, and return drop-off.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#07345B] shrink-0" />
              Do you do pickup and drop-off from home?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes! Free door-to-door pickup and drop-off from your home, school, university, or workplace is included
              with all lessons across our Sydney service areas.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#07345B] shrink-0" />
              How does the First Go Guarantee work?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              With our First Go Guaranteed package, you receive full structured training and 2 mock exams. If you don&apos;t
              pass your Service NSW test on the first try, we provide free car hire for your second attempt!
            </p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#07345B] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-heading font-black text-lg text-white">EZY 2 LEARN DRIVING SCHOOL</p>
            <p className="text-xs text-slate-300">Greater Sydney Accredited Driving Instruction</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/our-instructors" className="hover:text-white">Our Instructors</Link>
            <Link href="/book" className="hover:text-[#FAB10B] font-bold">Book a Lesson</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
