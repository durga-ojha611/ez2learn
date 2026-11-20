"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { DrivingLessonsSection } from "@/components/landing/DrivingLessonsSection";
import { apiFetch } from "@/lib/api";
import {
  Car,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Send,
  ChevronRight,
  ArrowRight,
  Sliders,
  Sparkles,
  Users,
  Check,
  Lock,
  ThumbsUp,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function LandingHomePage() {
  // CMS Content State
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [loadingCms, setLoadingCms] = useState(true);

  // Quote Calculator State
  const [calcTransmission, setCalcTransmission] = useState("Automatic");
  const [calcSuburb, setCalcSuburb] = useState("Parramatta");
  const [calcPackage, setCalcPackage] = useState("10lessons");

  // Lead Inquiry Form State
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquirySuburb, setInquirySuburb] = useState("Parramatta");
  const [inquiryLessonType, setInquiryLessonType] = useState("Automatic Driving Lessons");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  useEffect(() => {
    loadCmsData();
  }, []);

  const loadCmsData = async () => {
    try {
      const res = await apiFetch("/api/content/page/homepage");
      if (res.success && res.data?.sections) {
        setCmsContent(res.data.sections);
      }
    } catch {
      // Fallback to default copy if backend is starting
    } finally {
      setLoadingCms(false);
    }
  };

  const handlePackageSelect = (pkgName: string, type: string) => {
    setInquiryLessonType(type);
    setInquiryMessage(`Hi, I would like to book the "${pkgName}" package.`);
    const el = document.querySelector("#inquiry");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError("");
    setSubmittingInquiry(true);

    try {
      const res = await apiFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone,
          suburb: inquirySuburb,
          lesson_type: inquiryLessonType,
          subject: `${inquiryLessonType} - ${inquirySuburb}`,
          message: inquiryMessage || "Interested in booking driving lessons.",
          status: "new",
        }),
      });

      if (res.success) {
        setInquirySubmitted(true);
      } else {
        setInquiryError(res.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err: any) {
      setInquiryError(err.message || "Network error. Please try again.");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Content Helpers (from CMS with defaults)
  const hero = cmsContent?.hero || {
    title: "Drive with Confidence",
    subtitle: "Professional Driving Lessons for a Safer Tomorrow",
    button_text: "Book a Lesson",
    badge: "⭐ 98% First Time Pass Rate across Greater Sydney",
  };

  const services = cmsContent?.services?.items || [
    {
      title: "Automatic Driving Lessons",
      desc: "Smooth, stress-free modern automatic vehicle training with dual controls.",
      icon: "Car",
    },
    {
      title: "Manual Driving Lessons",
      desc: "Master clutch control, hill starts, and gear sequencing with certified instructors.",
      icon: "Settings",
    },
    {
      title: "RMS Driving Test Warm-Up",
      desc: "60-min warm-up plus test car hire at your local Sydney RMS service centre.",
      icon: "Award",
    },
    {
      title: "Overseas Licence Conversion",
      desc: "Fast-track transition to a full NSW unrestricted driver licence safely.",
      icon: "Globe",
    },
  ];

  const packages = cmsContent?.packages?.items || [
    {
      name: "First Timer Trial Lesson",
      hours: "1 Hour (3 Logbook Hrs)",
      price: "$70.00",
      tag: "Introductory",
      features: [
        "1-on-1 Certified Instructor",
        "Dual Control Vehicle",
        "Driving Skills Assessment",
        "NSW Logbook Guidance",
      ],
      popular: false,
    },
    {
      name: "Complete Beginner Pack",
      hours: "10 Lessons (30 Logbook Hrs)",
      price: "$650.00",
      tag: "Best Value",
      features: [
        "10 Hours Structured Training",
        "Counts as 30 NSW Logbook Hours",
        "Free Door-to-Door Pickups",
        "Reverse Parallel & Bay Parking",
        "Mock RMS Practical Driving Test",
      ],
      popular: true,
    },
    {
      name: "RMS Practical Test Day",
      hours: "2.5 Hours + Test Car Hire",
      price: "$220.00",
      tag: "Test Ready",
      features: [
        "60-min Pre-test Route Warm-Up",
        "RMS Test Car Hire with Dual Controls",
        "Instructor Accompaniment",
        "Pick-up and Drop-off Included",
      ],
      popular: false,
    },
  ];

  const testimonials = cmsContent?.testimonials?.items || [
    {
      name: "Sarah Jenkins",
      suburb: "Castle Hill",
      stars: 5,
      quote:
        "Passed my test on the first go! Kevin made me feel so confident with reverse parallel parking and roundabouts.",
    },
    {
      name: "David Chen",
      suburb: "Parramatta",
      stars: 5,
      quote:
        "The mock test routes around Silverwater were 100% accurate. Highly recommended driving school in Western Sydney!",
    },
    {
      name: "Priya Patel",
      suburb: "Blacktown",
      stars: 5,
      quote:
        "Converted my overseas licence without any hassles. Patient instructors, clean dual-control cars, and great value packages.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#FAB10B] selection:text-[#07345B]">
      {/* 1. NAVBAR */}
      <LandingNavbar
        phone={cmsContent?.footer?.phone || "1300 399 532"}
        logoText={cmsContent?.navbar?.logo_text || "EZY 2 LEARN"}
        tagline={cmsContent?.navbar?.tagline || "Driving School Sydney"}
      />

      {/* 2. HERO SECTION */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-[#07345B] via-[#093c68] to-[#042038] text-white pt-12 pb-20 sm:pt-20 sm:pb-32"
      >
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&auto=format&fit=crop&q=80')`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Gold Accent Bar + Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#FAB10B] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
                <span>{hero.badge}</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading font-semibold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
                {hero.title}
              </h1>

              {/* Yellow Decorative Sub-bar */}
              <div className="w-20 h-1.5 bg-[#FAB10B] rounded-full mx-auto lg:mx-0"></div>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {hero.subtitle} RMS accredited instructors, modern 5-star ANCAP dual-control cars, and 3-for-1 bonus NSW logbook hours across Greater Sydney.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/book"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#FAB10B] hover:bg-[#e2a008] text-[#07345B] font-heading font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <span>{hero.button_text}</span>
                  <ArrowRight className="w-4 h-4 text-[#07345B] transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#packages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-heading font-semibold text-sm sm:text-base backdrop-blur-md transition-all cursor-pointer"
                >
                  <span>View Lesson Packages</span>
                </a>
              </div>

              {/* Feature Highlights Strip */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-xl mx-auto lg:mx-0 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 text-[#FAB10B] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-xs text-white">Dual Control</p>
                    <p className="text-[10px] text-slate-300">Certified Fleet</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 text-[#FAB10B] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-xs text-white">3-for-1 Hours</p>
                    <p className="text-[10px] text-slate-300">NSW Logbook</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 text-[#FAB10B] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-xs text-white">98% Pass</p>
                    <p className="text-[10px] text-slate-300">1st Attempt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-slate-800 group">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop&q=80"
                  alt="EZY 2 LEARN Driving School Car"
                  className="w-full h-80 sm:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07345B] via-transparent to-transparent opacity-90"></div>

                {/* Floating Overlay Badge on Car */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 shadow-lg border border-white/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8F8EE] text-[#0E8A38] flex items-center justify-center font-bold text-sm shrink-0">
                      ✓
                    </div>
                    <div>
                      <p className="font-heading font-bold text-xs text-slate-900">
                        NSW Test Ready Guarantee
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Instructors with 15+ years Sydney experience
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#07345B] bg-[#EDF5FD] px-2.5 py-1 rounded-md shrink-0">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK QUOTE & BOOKING STRIP */}
      <section className="relative -mt-8 z-20 max-w-6xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-5 sm:p-7">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Transmission Selector */}
            <div className="flex-1 space-y-1">
              <label className="text-xs font-heading font-bold text-slate-600 uppercase tracking-wider">
                Transmission
              </label>
              <select
                value={calcTransmission}
                onChange={(e) => setCalcTransmission(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/15"
              >
                <option value="Automatic">Automatic (Dual Control)</option>
                <option value="Manual">Manual (Clutch & Gears)</option>
              </select>
            </div>

            {/* Suburb Selector */}
            <div className="flex-1 space-y-1">
              <label className="text-xs font-heading font-bold text-slate-600 uppercase tracking-wider">
                Your Sydney Suburb
              </label>
              <select
                value={calcSuburb}
                onChange={(e) => setCalcSuburb(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/15"
              >
                <option value="Parramatta">Parramatta & Westmead</option>
                <option value="Blacktown">Blacktown & Seven Hills</option>
                <option value="Castle Hill">Castle Hill & Hills District</option>
                <option value="Silverwater">Silverwater & Auburn</option>
                <option value="Sydney CBD">Sydney CBD & City</option>
                <option value="Liverpool">Liverpool & Fairfield</option>
                <option value="Penrith">Penrith & St Marys</option>
              </select>
            </div>

            {/* Package Selector */}
            <div className="flex-1 space-y-1">
              <label className="text-xs font-heading font-bold text-slate-600 uppercase tracking-wider">
                Lesson Goal
              </label>
              <select
                value={calcPackage}
                onChange={(e) => setCalcPackage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/15"
              >
                <option value="trial">1st Timer Trial ($70)</option>
                <option value="10lessons">10 Lessons Pack ($650 - 30 Logbook Hrs)</option>
                <option value="testday">RMS Driving Test Day ($220)</option>
              </select>
            </div>

            {/* CTA Button */}
            <div className="self-end md:self-auto pt-2 md:pt-5">
              <button
                type="button"
                onClick={() => {
                  setInquiryLessonType(`${calcTransmission} Driving Lessons`);
                  setInquirySuburb(calcSuburb);
                  setInquiryMessage(
                    `Hi, I want to book ${calcTransmission} lessons in ${calcSuburb} (${calcPackage === "10lessons" ? "10 Lessons Pack" : calcPackage === "testday" ? "RMS Test Day" : "Trial Lesson"}).`
                  );
                  const el = document.querySelector("#inquiry");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-[#07345B] hover:bg-[#0b1528] text-white font-heading font-bold text-sm shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                Check Availability →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DRIVING LESSONS SECTION (ALL 14 LESSONS) */}
      <div id="services" />
      <DrivingLessonsSection id="driving-lessons" />

      {/* 5. PACKAGES & PRICING SECTION */}
      <section id="packages" className="py-20 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-heading font-bold tracking-widest uppercase text-[#FAB10B] bg-[#07345B] px-3.5 py-1 rounded-full">
              Transparent Pricing
            </span>
            <h2 className="font-heading font-semibold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Popular Driving Lesson Packages
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              No hidden fees. Free pickup and drop-off included with every package across Greater Sydney.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg: any, idx: number) => {
              const isPopular = pkg.popular || pkg.tag === "Best Value";
              return (
                <div
                  key={idx}
                  className={`rounded-2xl bg-white p-7 flex flex-col justify-between transition-all relative ${
                    isPopular
                      ? "border-2 border-[#FAB10B] shadow-xl md:-translate-y-2"
                      : "border border-slate-200/90 shadow-2xs hover:shadow-md"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FAB10B] text-[#07345B] font-heading font-bold text-xs uppercase tracking-wider shadow-xs">
                      ★ Most Popular Choice
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {pkg.tag}
                      </span>
                      <h3 className="font-heading font-semibold text-xl text-slate-900 mt-1">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{pkg.hours}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline gap-1">
                      <span className="font-heading font-bold text-3xl sm:text-4xl text-[#07345B]">
                        {pkg.price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ package</span>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-heading font-bold text-slate-700 uppercase tracking-wider">
                        What&apos;s Included:
                      </p>
                      {(pkg.features || [
                        "1-on-1 Certified Instructor",
                        "Dual Control Vehicle",
                        "NSW Logbook Verification",
                        "Free Door-to-Door Pickup",
                      ]).map((feat: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-[#0E8A38] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handlePackageSelect(pkg.name, pkg.name)}
                      className={`w-full py-3 rounded-xl font-heading font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer ${
                        isPopular
                          ? "bg-[#FAB10B] hover:bg-[#e2a008] text-[#07345B]"
                          : "bg-[#07345B] hover:bg-[#0b1528] text-white"
                      }`}
                    >
                      Book This Package →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US SECTION */}
      <section id="why-choose-us" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-heading font-bold tracking-widest uppercase text-[#07345B] bg-[#EDF5FD] px-3 py-1 rounded-full border border-[#D5E6F7]">
              Why EZY 2 LEARN
            </span>
            <h2 className="font-heading font-semibold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-snug">
              Why Thousands of Sydney Learners Trust Us to Pass
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Learning to drive is one of life&apos;s most important milestones. We make it calm, enjoyable, and safe from your first turn of the wheel to receiving your P-plates.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] text-[#0E8A38] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-base text-slate-900">
                    98% First-Time Pass Rate
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our structured mock tests and route familiarity prepare students to pass on their first attempt at Sydney RMS centres.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EDF5FD] text-[#07345B] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-base text-slate-900">
                    3-for-1 Bonus Logbook Hours
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every 1 hour of professional instruction with our accredited instructors records as 3 hours in your official NSW logbook (up to 30 hours).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-base text-slate-900">
                    Dual-Control 5-Star Safety Fleet
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Modern Toyota Corolla and Hyundai sedans equipped with dual brake pedals, dash cams, and certified insurance for complete safety.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#07345B] text-white p-6 rounded-2xl space-y-2 shadow-md">
                <p className="font-heading font-bold text-3xl sm:text-4xl text-[#FAB10B]">12,500+</p>
                <p className="text-xs font-semibold text-slate-200">Sydney Students Passed</p>
              </div>

              <div className="bg-slate-100 p-6 rounded-2xl space-y-2 border border-slate-200">
                <p className="font-heading font-bold text-3xl sm:text-4xl text-[#07345B]">15+ Years</p>
                <p className="text-xs font-semibold text-slate-600">Instructional Excellence</p>
              </div>

              <div className="bg-slate-100 p-6 rounded-2xl space-y-2 border border-slate-200">
                <p className="font-heading font-bold text-3xl sm:text-4xl text-[#07345B]">30+ Suburbs</p>
                <p className="text-xs font-semibold text-slate-600">Western Sydney Coverage</p>
              </div>

              <div className="bg-[#FAB10B] text-[#07345B] p-6 rounded-2xl space-y-2 shadow-md">
                <p className="font-heading font-bold text-3xl sm:text-4xl">4.9 / 5.0</p>
                <p className="text-xs font-semibold text-[#07345B]/80">Google Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STUDENT REVIEWS / TESTIMONIALS */}
      <section id="reviews" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-heading font-bold tracking-widest uppercase text-[#07345B] bg-[#EDF5FD] px-3 py-1 rounded-full border border-[#D5E6F7]">
              Student Stories
            </span>
            <h2 className="font-heading font-semibold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Real Reviews from Confident Drivers
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Read how our patient, structured lessons have helped everyday Sydneysiders achieve their driving independence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#FAB10B]">
                    {[...Array(t.stars || 5)].map((_, sIdx) => (
                      <Star key={sIdx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#07345B] text-white flex items-center justify-center font-heading font-bold text-xs">
                    {t.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-500">{t.suburb}, Sydney</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LEAD INQUIRY & CONTACT FORM SECTION */}
      <section id="inquiry" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#07345B] rounded-3xl text-white p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#FAB10B]/10 blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-heading font-bold tracking-widest uppercase text-[#FAB10B] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Quick Lesson Inquiry
              </span>
              <h2 className="font-heading font-semibold text-3xl sm:text-4xl text-white tracking-tight leading-snug">
                Ready to Start Driving? Send an Inquiry Today
              </h2>
              <p className="text-slate-200 text-sm leading-relaxed">
                Fill out the quick form and Kevin or our senior instructor will reach out within 2 hours to confirm your lesson slot.
              </p>

              <div className="space-y-3.5 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#FAB10B]" />
                  <span>Call: {cmsContent?.footer?.phone || "1300 399 532"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#FAB10B]" />
                  <span>Email: {cmsContent?.footer?.email || "info@ezy2learn.com.au"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#FAB10B]" />
                  <span>Suite 4, 32-36 Church Street, Parramatta NSW 2150</span>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl">
              {inquirySubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#E8F8EE] text-[#0E8A38] mx-auto flex items-center justify-center font-bold text-2xl">
                    ✓
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-slate-900">
                    Thank You, {inquiryName}!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your inquiry has been received by EZY 2 LEARN Driving School. Our team will contact you at <strong>{inquiryPhone}</strong> shortly to book your first session.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setInquirySubmitted(false);
                      setInquiryName("");
                      setInquiryEmail("");
                      setInquiryPhone("");
                      setInquiryMessage("");
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-[#07345B] text-white font-heading font-bold text-xs"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-heading font-bold text-slate-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-heading font-bold text-slate-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="e.g. 0412 345 678"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-heading font-bold text-slate-700">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="e.g. priya@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-heading font-bold text-slate-700">
                        Pickup Suburb *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquirySuburb}
                        onChange={(e) => setInquirySuburb(e.target.value)}
                        placeholder="e.g. Parramatta, Castle Hill"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">
                      Lesson Preference
                    </label>
                    <select
                      value={inquiryLessonType}
                      onChange={(e) => setInquiryLessonType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                    >
                      <option value="Automatic Driving Lessons">Automatic Driving Lessons</option>
                      <option value="Manual Driving Lessons">Manual Driving Lessons</option>
                      <option value="10 Lessons Package (30 Logbook Hrs)">10 Lessons Complete Package</option>
                      <option value="RMS Driving Test Car Hire">RMS Driving Test Car Hire & Warm-Up</option>
                      <option value="Overseas Licence Conversion">Overseas Licence Conversion</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-slate-700">
                      Your Questions / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Can you please share details about availability on weekends?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                    ></textarea>
                  </div>

                  {inquiryError && (
                    <p className="text-xs text-red-600 font-medium">{inquiryError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full py-3.5 rounded-xl bg-[#07345B] hover:bg-[#0b1528] text-white font-heading font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingInquiry ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#FAB10B]" />
                        <span>Send Booking Inquiry Now</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Col */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAB10B] text-[#07345B] flex items-center justify-center font-bold">
                  <Car className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="font-heading font-bold text-xl text-white">EZY 2 LEARN</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Greater Sydney&apos;s trusted driving school. RMS accredited instructors, dual-control cars, and structured test preparation for guaranteed confidence.
              </p>
              <p className="text-[11px] text-slate-500 font-medium">ABN: 84 928 319 402</p>
            </div>

            {/* Suburbs Col */}
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">
                Suburbs We Serve
              </h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>Parramatta & Westmead</li>
                <li>Blacktown & Seven Hills</li>
                <li>Castle Hill & Hills District</li>
                <li>Silverwater & Auburn</li>
                <li>Sydney CBD & Inner West</li>
                <li>Liverpool & Fairfield</li>
              </ul>
            </div>

            {/* Quick Links Col */}
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li><a href="#services" className="hover:text-white transition-colors">Lesson Services</a></li>
                <li><a href="#packages" className="hover:text-white transition-colors">Pricing & Packages</a></li>
                <li><a href="#why-choose-us" className="hover:text-white transition-colors">Why Choose Us</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Student Testimonials</a></li>
                <li><a href="#inquiry" className="hover:text-white transition-colors">Book a Lesson</a></li>
                <li><Link href="/dashboard" className="text-[#FAB10B] hover:underline">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Contact Col */}
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider">
                Contact Office
              </h4>
              <div className="text-xs text-slate-400 space-y-2.5">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FAB10B]" />
                  <span>1300 399 532</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#FAB10B]" />
                  <span>info@ezy2learn.com.au</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FAB10B] shrink-0 mt-0.5" />
                  <span>Suite 4, 32-36 Church Street, Parramatta NSW 2150</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 EZY 2 LEARN Driving School. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
                Admin Portal
              </Link>
              <span>•</span>
              <Link href="/cms" className="hover:text-slate-300 transition-colors">
                CMS Studio
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
