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
  BookOpen,
  ThumbsUp,
  FileCheck,
  DollarSign,
  GraduationCap,
} from "lucide-react";

export default function InstructorProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const idNum = parseInt(rawId, 10) || 1;

  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  const insTitle = isKevin
    ? "TFNSW Accredited Professional Driving Instructor"
    : instructor?.title || "RMS Accredited Driving Instructor";

  const insBio = isKevin
    ? `After discovering a passion for teaching while helping my family and friends, I decided to pursue a career as a professional driving instructor. Since then, I’ve built over a decade of experience helping learners become safe, confident, and capable drivers.

One of my greatest strengths as an instructor is creating a calm, relaxed, and stress-free learning environment. I understand that every student learns differently, which is why I tailor each lesson to the individual’s needs, confidence level, and goals. By teaching at the right pace and focusing on areas that require extra attention or challenge, I help students develop strong driving skills and confidence behind the wheel.

My extensive knowledge of Sydney’s diverse road conditions — from busy city streets to suburban roads — ensures students gain practical experience in a wide range of driving environments. This personalised approach and commitment to quality instruction have helped make EZY 2 LEARN Driving School one of Sydney’s most trusted & Award-winning driving schools.

Outside of instructing, I enjoy spending quality time with my family, including my four children — two of whom I’ve proudly taught to drive myself.`
    : instructor?.bio ||
      "Dedicated professional instructor focusing on patient instruction, defensive driving, and high first-time pass rates.";

  const lessonOffering = isKevin
    ? "I offer automatic driving lessons: Automatic lessons available in my vehicle or yours"
    : "Automatic and manual lessons available in dual-control vehicle or student vehicle";

  const qualificationsList: string[] = isKevin
    ? [
        "RMS accredited Licensed Driving Instructor",
        "Trainer and Assessor for New Driving Instructors",
        "Certificate IV in Driving Instruction",
        "Certificate IV in Training & Assessment",
        "Keys2Drive Accredited Instructor",
        "Safer Drivers Course Facilitator",
        "Safer Driver Course Coach",
        "Advanced diploma of leadership and management, and excellent customer service skills",
        "Frontline Management",
        "Special capability to teach nervous and anxious learners",
      ]
    : [
        "RMS accredited Licensed Driving Instructor",
        "Certificate IV in Transport & Logistics (Road Transport)",
        "Keys2Drive Accredited",
        "Working With Children Check (WWCC) Cleared",
        "Special capability to teach nervous and anxious learners",
      ];

  const serviceSuburbs = isKevin
    ? [
        "Parramatta",
        "Westmead",
        "Blacktown",
        "Castle Hill",
        "Silverwater",
        "Auburn",
        "Sydney CBD",
        "Merrylands",
        "Seven Hills",
      ]
    : ["Parramatta", "Blacktown", "Castle Hill", "Silverwater"];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#FAB10B] selection:text-[#07345B]">
      {/* 1. NAVBAR */}
      <LandingNavbar />

      {/* 2. BREADCRUMB */}
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
            <span className="text-[#07345B] font-bold">{insName}</span>
          </div>

          <Link
            href="/our-instructors"
            className="inline-flex items-center gap-1 font-semibold text-[#07345B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Instructors</span>
          </Link>
        </div>
      </div>

      {/* 3. PROFILE HERO SECTION - CLEAN WHITE BACKGROUND & HIGH CONTRAST */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar + Details */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={
                    instructor?.avatar_url ||
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
                  }
                  alt={insName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                  ✓
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    {insName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-heading font-semibold border border-slate-200">
                    TFNSW Accredited
                  </span>
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-600">
                  {insTitle}
                </p>

                {/* Clear Stats Badges */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 pt-0.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                    <span className="font-heading font-bold text-slate-900 text-sm">4.95</span>
                    <span className="text-slate-500 font-normal">(148 reviews)</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="font-medium text-slate-800">
                    <strong>3,450+</strong> Lessons Completed
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-medium text-slate-800">
                    <strong>12+</strong> Years Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Big CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
              <Link
                href={`/our-instructors/${rawId}/book`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-heading font-bold text-base shadow-sm transition-all text-center"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Book a Lesson</span>
              </Link>

              <Link
                href={`/our-instructors/${rawId}/availability`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-heading font-bold text-base transition-colors text-center"
              >
                <Clock className="w-4 h-4 text-slate-600" />
                <span>Availability</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT 8 COLUMNS: Bio & Qualifications */}
          <div className="lg:col-span-8 space-y-10">
            {/* Story & Philosophy */}
            <section className="bg-white rounded-3xl border border-slate-200 p-7 sm:p-9 space-y-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-slate-800" />
                  <span>Instructor Biography & Teaching Philosophy</span>
                </h2>
              </div>

              {/* Bio Prose - High readability */}
              <div className="text-slate-800 text-base sm:text-lg leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {insBio}
              </div>

              {/* Lesson Offering Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 mt-5">
                <p className="font-heading font-bold text-base text-slate-900 flex items-center gap-2.5">
                  <Car className="w-5 h-5 text-slate-700" />
                  <span>Lesson Format & Vehicle Options:</span>
                </p>
                <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                  {lessonOffering}
                </p>
              </div>
            </section>

            {/* Accreditations & Qualifications - CRYSTAL CLEAR DISPLAY */}
            <section className="bg-white rounded-3xl border border-slate-200 p-7 sm:p-9 space-y-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 flex items-center gap-3">
                  <Award className="w-6 h-6 text-slate-800" />
                  <span>Accreditations & Qualifications</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-500 mt-1">
                  Officially verified accreditations, certifications, and specialised capabilities
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {qualificationsList.map((qual, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-slate-900 leading-snug">
                      {qual}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Verified Student Feedback */}
            <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-semibold text-xl text-slate-900 flex items-center gap-2.5">
                    <ThumbsUp className="w-5 h-5 text-[#07345B]" />
                    <span>Verified Student Feedback</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recent first-time test pass reviews from Sydney learners
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[#FAB10B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-slate-900 text-sm">
                      Aman Verma • Silverwater Test Centre
                    </span>
                    <span className="text-[#0E8A38] font-bold">Passed 1st Go</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;Kevin is the calmest instructor I’ve ever met! I used to have severe anxiety around roundabouts, but his step-by-step guidance made everything effortless. Passed on my first attempt!&rdquo;
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-slate-900 text-sm">
                      Priya Sharma • Castle Hill RMS
                    </span>
                    <span className="text-[#0E8A38] font-bold">Overseas Licence Conversion</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;Converted my overseas licence without stress. Kevin explained NSW road rules clearly and helped me master reverse parallel parking in just 2 lessons.&rdquo;
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: Quick Info Cards */}
          <div className="lg:col-span-4 space-y-6">
            {/* CTA Box */}
            <div className="bg-white rounded-2xl border-2 border-[#FAB10B] p-6 shadow-md space-y-4">
              <span className="text-[10px] font-heading font-bold tracking-widest uppercase text-[#07345B] bg-[#EDF5FD] px-2.5 py-1 rounded-full border border-[#D5E6F7]">
                Instant Booking
              </span>
              <h3 className="font-heading font-semibold text-xl text-slate-900">
                Book with {insName}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your lesson package, date, and time slot directly online with instant confirmation.
              </p>

              <div className="space-y-2.5 pt-2">
                <Link
                  href={`/our-instructors/${rawId}/book`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FAB10B] hover:bg-[#e2a008] text-[#07345B] font-heading font-bold text-xs shadow-xs transition-all text-center"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book a Lesson</span>
                </Link>

                <Link
                  href={`/our-instructors/${rawId}/availability`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-heading font-semibold text-xs transition-all text-center"
                >
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Availability</span>
                </Link>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <h3 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-[#07345B]" />
                <span>Training Vehicle & Safety</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Vehicle</span>
                  <span className="font-bold text-slate-900">Toyota Corolla Hybrid (2024)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Transmission</span>
                  <span className="font-bold text-slate-900">Automatic</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Safety Rating</span>
                  <span className="font-bold text-[#0E8A38]">5-Star ANCAP Safety</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Dual Controls</span>
                  <span className="font-bold text-[#0E8A38]">Certified Dual Brakes</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Student Car Option</span>
                  <span className="font-bold text-slate-900">Available on request</span>
                </div>
              </div>
            </div>

            {/* Suburbs Covered */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-3">
              <h3 className="font-heading font-semibold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#07345B]" />
                <span>Service Areas Covered</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Free door-to-door pickups from home, work, or school in:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {serviceSuburbs.map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EZY 2 LEARN Driving School. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>•</span>
            <Link href="/our-instructors" className="hover:text-slate-900 font-semibold text-[#07345B]">Our Instructors</Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-slate-900">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
