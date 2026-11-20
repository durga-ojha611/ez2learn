"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  Gift,
  Moon,
  Compass,
  FileCheck,
  Check,
  Info,
} from "lucide-react";

export interface DrivingLessonItem {
  id: number;
  name: string;
  subtitle: string;
  slug: string;
  category: "Beginner" | "Test Prep" | "Specialized" | "Weekend" | "Conversions" | "NDIS" | "Vouchers" | "Guarantee";
  transmission: "automatic" | "both";
  duration_minutes: number;
  price_aud: number;
  description: string;
  image_url: string;
  included_features: string[];
  is_featured?: boolean;
  badge?: string;
}

export const DRIVING_LESSONS_DATA: DrivingLessonItem[] = [
  {
    id: 1,
    name: "First Introductory Lesson Auto (New Learners Only)",
    subtitle: "Special introductory trial lesson for brand new learner drivers",
    slug: "first-introductory-lesson-auto",
    category: "Beginner",
    transmission: "automatic",
    duration_minutes: 60,
    price_aud: 65,
    description: "Ideal for total beginners. Includes vehicle familiarisation, cockpit drill, steering and smooth pedal controls, plus your personalised Sydney learning roadmap.",
    image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "1-on-1 Patient RMS Accredited Instructor",
      "Modern 5-Star ANCAP Dual-Control Car",
      "Initial Skills Assessment & Learning Plan",
      "Recorded as 3 NSW Logbook Hours"
    ],
    is_featured: true,
    badge: "Intro Special"
  },
  {
    id: 2,
    name: "Auto Lesson [Mon-Fri]",
    subtitle: "Standard weekday automatic driving lesson (Morning to Evening)",
    slug: "auto-lesson-mon-fri",
    category: "Beginner",
    transmission: "automatic",
    duration_minutes: 60,
    price_aud: 70,
    description: "Tailored weekday instruction focusing on suburban navigation, roundabouts, lane positioning, speed control, and progressive NSW logbook completion.",
    image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Free Home / School / Work Pickup",
      "Roundabout & Intersection Confidence",
      "Safe Following Distances & Braking",
      "Flexible Monday to Friday Time Slots"
    ],
    is_featured: true,
    badge: "Most Popular"
  },
  {
    id: 3,
    name: "Prepare for Driving Test [Auto]",
    subtitle: "Realistic simulation exam on actual Service NSW testing routes",
    slug: "prepare-for-driving-test-auto",
    category: "Test Prep",
    transmission: "automatic",
    duration_minutes: 90,
    price_aud: 110,
    description: "Full practice exam evaluated against official RMS testing criteria. Identify and eliminate critical fail items, speed margin errors, and blind spot check oversights.",
    image_url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Actual Sydney RMS Centre Test Routes",
      "Realistic Mock Test Score Sheet",
      "Kerbside & Hill Start Evaluation",
      "Instant Detailed Examiner Feedback"
    ],
    is_featured: true,
    badge: "Test Ready"
  },
  {
    id: 4,
    name: "Driving Test Car Hire (Auto)",
    subtitle: "45-min pre-test warm-up + dual-control car hire at RMS centre",
    slug: "driving-test-car-hire-auto",
    category: "Test Prep",
    transmission: "automatic",
    duration_minutes: 150,
    price_aud: 190,
    description: "Complete test day peace of mind. We pick you up, conduct a 45-minute warm-up drive to calm pre-test jitters, accompany you into the centre, and provide our certified car.",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "45-Min Pre-Test Warm-Up Lesson",
      "RMS Compliant Dual-Control Vehicle",
      "Instructor Accompaniment at Service NSW",
      "Door-to-Door Return Trip Included"
    ],
    is_featured: true,
    badge: "Essential"
  },
  {
    id: 5,
    name: "Parking Lesson Practice",
    subtitle: "Reverse parallel, 90° bay, and angle parking precision drills",
    slug: "parking-lesson-practice",
    category: "Specialized",
    transmission: "both",
    duration_minutes: 60,
    price_aud: 75,
    description: "Master Sydney parking without the sweat. Learn fail-safe reference points for reverse parallel parking, shopping centre bays, multi-storey carparks, and kerb distance.",
    image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Easy 3-Step Reverse Parallel Formula",
      "Shopping Centre 90° & 45° Bay Parking",
      "Mirror Reference Points & Kerb Safety",
      "Real-World Repetition Practice"
    ],
    badge: "Specialized"
  },
  {
    id: 6,
    name: "Weekend Lesson Auto [Saturday-Sunday]",
    subtitle: "Convenient weekend lessons tailored for busy workers and students",
    slug: "weekend-lesson-auto",
    category: "Weekend",
    transmission: "automatic",
    duration_minutes: 60,
    price_aud: 75,
    description: "Keep your training moving without taking time off work or school. Learn to navigate busy weekend traffic, shopping precincts, and dynamic driving conditions comfortably.",
    image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Available Both Saturday & Sunday",
      "Door-to-Door Home Pickup",
      "Weekend Congestion Navigation",
      "Same 3-for-1 Logbook Hour Credit"
    ],
    badge: "Weekend"
  },
  {
    id: 7,
    name: "Refresher & Overseas Conversions Lesson",
    subtitle: "Polish your driving skills or transition safely to NSW road regulations",
    slug: "refresher-overseas-conversions-lesson",
    category: "Conversions",
    transmission: "both",
    duration_minutes: 90,
    price_aud: 110,
    description: "Perfect for drivers who hold an overseas licence or haven't driven in a while. Review right-of-way rules, roundabouts, traffic lights, lane changing, and rebuild full confidence.",
    image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Australian Road Rules & Signage Audit",
      "Roundabouts & Traffic Filter Turns",
      "Confidence Rebuilding Drills",
      "Right-Hand Drive Orientation"
    ],
    badge: "Confidence"
  },
  {
    id: 8,
    name: "CBD & Freeway Driving Lesson",
    subtitle: "Master high-speed motorways, lane merging, and dense city grids",
    slug: "cbd-freeway-driving-lesson",
    category: "Specialized",
    transmission: "both",
    duration_minutes: 90,
    price_aud: 115,
    description: "Eliminate highway anxiety! Experience merging at 100km/h on the M2, M4, or M7 motorways, managing safe following distances, toll roads, and navigating Sydney CBD streets.",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Motorway On-Ramp & High-Speed Merging",
      "Tunnel Driving & GPS Navigation",
      "Sydney CBD Complex One-Way Streets",
      "Defensive Space Cushion Techniques"
    ],
    badge: "Highway"
  },
  {
    id: 9,
    name: "NDIS Self-Managed Funding",
    subtitle: "Supportive, patient driving lessons for NDIS participants",
    slug: "ndis-self-managed-funding",
    category: "NDIS",
    transmission: "automatic",
    duration_minutes: 60,
    price_aud: 85,
    description: "Tailored driving lessons designed for participants managing their NDIS funding. We focus on sensory comfort, reduced stress, and provide formal invoices for plan claims.",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Itemised NDIS Tax Invoices Provided",
      "Patient, Anxiety-Sensitive Instruction",
      "Custom Pace & Frequent Rest Stops",
      "5-Star ANCAP Safety Equipped Fleet"
    ],
    is_featured: true,
    badge: "NDIS Friendly"
  },
  {
    id: 10,
    name: "Overseas Licence Conversion",
    subtitle: "Direct pathway to converting your foreign licence to a NSW full licence",
    slug: "overseas-licence-conversion",
    category: "Conversions",
    transmission: "both",
    duration_minutes: 60,
    price_aud: 75,
    description: "Designed specifically for permanent residents and visa holders who need to pass the NSW practical driving test to convert an international licence without unnecessary re-tests.",
    image_url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "RMS Conversion Requirements Focus",
      "Elimination of Overseas Habit Faults",
      "Pedestrian Crossings & Give-Way Rules",
      "Booking Assistance for Service NSW"
    ],
    badge: "Conversions"
  },
  {
    id: 11,
    name: "Driving Test Preparation",
    subtitle: "Intensive 60-min skills polish prior to your practical test appointment",
    slug: "driving-test-preparation",
    category: "Test Prep",
    transmission: "both",
    duration_minutes: 60,
    price_aud: 75,
    description: "A focused 1-hour coaching session zeroing in on your specific areas of improvement: head checks, speed tolerance, stopping distances, and examiner question preparation.",
    image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Observation & Head Check Auditing",
      "Speed Regulation & Sign Recognition",
      "Kerbside Maneuver Precision Check",
      "Personalised Pre-Test Action Plan"
    ],
    badge: "Test Tune-up"
  },
  {
    id: 12,
    name: "Digital Gift Card",
    subtitle: "The gift of safe driving independence for birthdays, teens & family",
    slug: "digital-gift-card",
    category: "Vouchers",
    transmission: "both",
    duration_minutes: 60,
    price_aud: 70,
    description: "Surprise someone with driving lessons! Digital gift cards delivered instantly via email with your custom message. Redeemable across all lesson packages with 3 years validity.",
    image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Instant Email Voucher Delivery",
      "Valid for All Lesson Types & Cars",
      "Flexible Amounts ($70 to $500+)",
      "3 Years Legal Validity Window"
    ],
    badge: "Gift Card"
  },
  {
    id: 13,
    name: "Night Driving",
    subtitle: "Satisfy your mandatory NSW 20-hour night driving requirement safely",
    slug: "night-driving",
    category: "Specialized",
    transmission: "both",
    duration_minutes: 60,
    price_aud: 80,
    description: "NSW learner drivers under 25 must log 20 hours of night driving. Learn headlight management, dealing with high-beam glare, identifying unlit hazards, and dark wet-weather braking.",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Counts Toward Mandatory 20 Night Hrs",
      "High-Beam & Oncoming Glare Control",
      "Night Pedestrian & Hazard Detection",
      "Dual-Control Night Safety Fleet"
    ],
    badge: "Night Logbook"
  },
  {
    id: 14,
    name: "First Go Guaranteed",
    subtitle: "Pass your driving test on your 1st attempt or free test day car hire!",
    slug: "first-go-guaranteed",
    category: "Guarantee",
    transmission: "automatic",
    duration_minutes: 600,
    price_aud: 590,
    description: "Our comprehensive pass guarantee program. Includes structured comprehensive lessons, 2 full mock exams, and test day car hire. If you don't pass, we provide free car hire for your re-test!",
    image_url: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=600&auto=format&fit=crop&q=80",
    included_features: [
      "Complete Structured Lesson Curriculum",
      "2 Full Route RMS Mock Examinations",
      "Test Day Car Hire & Warm-Up Included",
      "Free Re-Test Car Hire If You Don't Pass"
    ],
    is_featured: true,
    badge: "Pass Guarantee"
  }
];

export const DrivingLessonsSection: React.FC<{ id?: string }> = ({ id = "driving-lessons" }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLessonModal, setSelectedLessonModal] = useState<DrivingLessonItem | null>(null);

  const categories = [
    { label: "All Lessons", value: "All", count: 14 },
    { label: "Beginner & Auto", value: "Beginner", count: 3 },
    { label: "Test Preparation", value: "Test Prep", count: 3 },
    { label: "Specialized & Parking", value: "Specialized", count: 3 },
    { label: "Conversions & NDIS", value: "Conversions", count: 3 },
    { label: "Guarantee & Gifts", value: "Guarantee", count: 2 },
  ];

  const filteredLessons = useMemo(() => {
    return DRIVING_LESSONS_DATA.filter((lesson) => {
      // Category Match
      let matchesCategory = true;
      if (selectedCategory === "Beginner") {
        matchesCategory = lesson.category === "Beginner" || lesson.category === "Weekend";
      } else if (selectedCategory === "Test Prep") {
        matchesCategory = lesson.category === "Test Prep";
      } else if (selectedCategory === "Specialized") {
        matchesCategory = lesson.category === "Specialized";
      } else if (selectedCategory === "Conversions") {
        matchesCategory = lesson.category === "Conversions" || lesson.category === "NDIS";
      } else if (selectedCategory === "Guarantee") {
        matchesCategory = lesson.category === "Guarantee" || lesson.category === "Vouchers";
      }

      // Search Match
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        matchesSearch =
          lesson.name.toLowerCase().includes(query) ||
          lesson.subtitle.toLowerCase().includes(query) ||
          lesson.description.toLowerCase().includes(query) ||
          lesson.category.toLowerCase().includes(query);
      }

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id={id} className="py-20 bg-slate-50/70 border-t border-slate-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-heading font-bold tracking-widest uppercase text-[#07345B] bg-[#EDF5FD] px-3.5 py-1 rounded-full border border-[#D5E6F7]">
            Sydney Accredited Training
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Our Driving Lessons & Packages
          </h2>
          <div className="w-16 h-1 bg-[#FAB10B] rounded-full mx-auto" />
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose from our complete range of 14 tailored driving lessons. From total beginners to test-day car hire,
            parking mastery, freeway training, and overseas conversions.
          </p>
        </div>

        {/* Filter Controls: Category Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? "bg-[#07345B] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons (e.g. Parking, Test)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
            />
          </div>
        </div>

        {/* Lessons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`rounded-2xl bg-white p-6 sm:p-7 border transition-all flex flex-col justify-between hover:shadow-md group relative ${
                lesson.is_featured
                  ? "border-[#07345B]/40 shadow-2xs ring-1 ring-[#07345B]/10"
                  : "border-slate-200/90 shadow-2xs hover:border-[#07345B]/30"
              }`}
            >
              {/* Badge & Transmission Strip */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className={`text-[11px] font-heading font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    lesson.badge === "Pass Guarantee"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : lesson.badge === "Intro Special" || lesson.badge === "Most Popular"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-[#EDF5FD] text-[#07345B] border border-[#D5E6F7]"
                  }`}
                >
                  {lesson.badge || lesson.category}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {lesson.duration_minutes >= 600
                      ? "Package"
                      : `${lesson.duration_minutes} mins`}
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2 mb-5">
                <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-[#07345B] transition-colors leading-snug">
                  {lesson.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {lesson.subtitle}
                </p>
              </div>

              {/* Price Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between mb-5">
                <div>
                  <span className="font-heading font-black text-2xl sm:text-3xl text-[#07345B]">
                    ${lesson.price_aud.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    {lesson.category === "Guarantee" ? "/ full pack" : "/ lesson"}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  3 Logbook Hrs
                </span>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 mb-6 flex-1">
                {lesson.included_features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/book?service=${encodeURIComponent(lesson.slug)}&title=${encodeURIComponent(lesson.name)}`}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#07345B] hover:bg-[#0b1528] text-white font-heading font-bold text-xs sm:text-sm text-center shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Book This Lesson</span>
                  <ChevronRight className="w-4 h-4 text-[#FAB10B]" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedLessonModal(lesson)}
                  className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-semibold text-xs transition-colors cursor-pointer"
                  title="View details"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if filter yields no result */}
        {filteredLessons.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-heading font-bold text-lg text-slate-800">No matching lessons found</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or switch back to &quot;All Lessons&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#07345B] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Trust & Feature Highlights Strip */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] text-[#0E8A38] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                First Go Guarantee
              </p>
              <p className="text-[11px] text-slate-500">98% First time pass rate</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDF5FD] text-[#07345B] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                3-for-1 Logbook Hours
              </p>
              <p className="text-[11px] text-slate-500">10 hrs = 30 NSW logbook hrs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                Dual-Control Fleet
              </p>
              <p className="text-[11px] text-slate-500">5-Star ANCAP rated safety</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                NDIS Invoices Provided
              </p>
              <p className="text-[11px] text-slate-500">Self-managed plan friendly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Details Modal */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EDF5FD] text-[#07345B]">
                  {selectedLessonModal.category}
                </span>
                <h3 className="font-heading font-bold text-xl text-slate-900 mt-1">
                  {selectedLessonModal.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedLessonModal.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLessonModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedLessonModal.description}
            </p>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                What&apos;s Included:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedLessonModal.included_features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Lesson Price</p>
                <p className="font-heading font-black text-2xl text-[#07345B]">
                  ${selectedLessonModal.price_aud.toFixed(2)}
                </p>
              </div>
              <Link
                href={`/book?service=${encodeURIComponent(selectedLessonModal.slug)}&title=${encodeURIComponent(selectedLessonModal.name)}`}
                onClick={() => setSelectedLessonModal(null)}
                className="px-6 py-2.5 rounded-xl bg-[#07345B] hover:bg-[#0b1528] text-white font-heading font-bold text-xs shadow-xs"
              >
                Book Now →
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
