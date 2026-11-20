"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Check,
  X,
  ShieldCheck,
  Calendar,
  Clock,
  CreditCard,
  Lock,
  User,
  Car,
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Minus,
  Plus,
  Percent,
  CheckCircle2,
  Sparkles,
  Download,
  Info,
  CalendarDays,
  FileCheck,
  Loader2,
} from "lucide-react";

export interface InstructorOption {
  id: number;
  name: string;
  initials: string;
  avatar?: string;
  title: string;
  transmission: "Automatic" | "Manual" | "Both";
  car: string;
  suburbs: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  nextAvailable: string;
  verified: boolean;
  isPopular?: boolean;
}

export const INSTRUCTORS_DATA: InstructorOption[] = [
  {
    id: 1,
    name: "Kevin Kabir",
    initials: "KK",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    title: "TFNSW Accredited Senior Instructor & Assessor",
    transmission: "Automatic",
    car: "Toyota Corolla Hybrid (Dual-Control)",
    suburbs: ["Parramatta", "Blacktown", "Westmead", "Merrylands", "Castle Hill", "Ryde", "Auburn"],
    languages: ["English", "Hindi", "Urdu", "Punjabi"],
    rating: 4.9,
    reviewCount: 284,
    hourlyRate: 75,
    nextAvailable: "Tue 24 Nov",
    verified: true,
    isPopular: true,
  },
  {
    id: 2,
    name: "Priya Nair",
    initials: "PN",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    title: "RMS Accredited Patient Driving Coach",
    transmission: "Automatic",
    car: "Kia Cerato (Dual-Control)",
    suburbs: ["Northside", "Chatswood", "Ryde", "Epping", "Macquarie Park"],
    languages: ["English", "Hindi"],
    rating: 4.9,
    reviewCount: 196,
    hourlyRate: 70,
    nextAvailable: "Tue 24 Nov",
    verified: true,
  },
  {
    id: 3,
    name: "Daniel Okafor",
    initials: "DO",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    title: "Master Instructor (Manual & Automatic)",
    transmission: "Both",
    car: "Toyota Corolla (Dual-Control)",
    suburbs: ["Sydney CBD", "Surry Hills", "Randwick", "Marrickville", "Inner West"],
    languages: ["English"],
    rating: 4.9,
    reviewCount: 154,
    hourlyRate: 75,
    nextAvailable: "Mon 23 Nov",
    verified: true,
  },
  {
    id: 4,
    name: "Sofia Reyes",
    initials: "SR",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    title: "Accredited Defensive Driving Specialist",
    transmission: "Automatic",
    car: "Mazda 2 (Dual-Control)",
    suburbs: ["Liverpool", "Campbelltown", "Bankstown", "Cabramatta"],
    languages: ["English", "Spanish"],
    rating: 4.8,
    reviewCount: 128,
    hourlyRate: 70,
    nextAvailable: "Wed 25 Nov",
    verified: true,
  },
];

interface BookingFunnelProps {
  initialInstructorId?: number;
}

export const BookingFunnel: React.FC<BookingFunnelProps> = ({ initialInstructorId = 1 }) => {
  const router = useRouter();

  // Current Step (1: Instructor, 2: Amount, 3: Book lessons, 4: Registration, 5: Payment)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Dynamic Data from Backend API
  const [instructorsList, setInstructorsList] = useState<InstructorOption[]>(INSTRUCTORS_DATA);
  const [suburbsList, setSuburbsList] = useState<string[]>([
    "Parramatta", "Blacktown", "Westmead", "Northside", "Sydney CBD", "Liverpool", "Castle Hill", "Ryde", "Auburn"
  ]);

  // STEP 1 STATE: Choose Instructor
  const [selectedInstructorId, setSelectedInstructorId] = useState<number>(initialInstructorId);
  const [filterSuburb, setFilterSuburb] = useState<string>("All");
  const [filterTransmission, setFilterTransmission] = useState<string>("All");
  const [filterPreference, setFilterPreference] = useState<string>("No preference");
  const [filterLanguage, setFilterLanguage] = useState<string>("All");

  // Fetch live instructors and suburbs on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [instRes, subRes] = await Promise.allSettled([
          apiFetch<any>("/api/instructors?limit=50"),
          apiFetch<any>("/api/suburbs"),
        ]);

        if (instRes.status === "fulfilled" && instRes.value?.data && Array.isArray(instRes.value.data)) {
          const apiInstructors: InstructorOption[] = instRes.value.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            initials: item.initials || item.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
            avatar: item.avatar_url,
            title: item.teaching_approach || (item.experience_years ? `${item.experience_years}+ Yrs RMS Accredited Instructor` : "Accredited Instructor"),
            transmission: item.transmission === "manual" ? "Manual" : item.transmission === "both" ? "Both" : "Automatic",
            car: item.car || `${item.vehicle_make || "Toyota"} ${item.vehicle_model || "Corolla"}`,
            suburbs: item.suburbs && item.suburbs.length > 0 ? item.suburbs : ["Parramatta", "Sydney CBD"],
            languages: item.languages && item.languages.length > 0 ? item.languages : ["English"],
            rating: Number(item.rating) || 4.9,
            reviewCount: Number(item.reviewCount || item.total_reviews) || 100,
            hourlyRate: Number(item.hourlyRate || item.hourly_rate) || 75,
            nextAvailable: item.nextAvailable || "Tue 24 Nov",
            verified: true,
            isPopular: item.id === 1,
          }));

          if (apiInstructors.length > 0) {
            setInstructorsList(apiInstructors);
          }
        }

        if (subRes.status === "fulfilled" && subRes.value?.data && Array.isArray(subRes.value.data)) {
          const subs = Array.from(new Set(subRes.value.data.map((s: any) => s.name))).filter(Boolean) as string[];
          if (subs.length > 0) {
            setSuburbsList(subs);
          }
        }
      } catch (e) {
        console.warn("Could not load dynamic instructors from API, using defaults:", e);
      }
    }

    loadData();
  }, []);

  const selectedInstructor = useMemo(() => {
    return instructorsList.find((i) => i.id === selectedInstructorId) || instructorsList[0];
  }, [selectedInstructorId, instructorsList]);

  const filteredInstructors = useMemo(() => {
    return instructorsList.filter((ins) => {
      if (filterTransmission !== "All") {
        if (filterTransmission === "Automatic" && ins.transmission === "Manual") return false;
        if (filterTransmission === "Manual" && ins.transmission === "Automatic") return false;
      }
      if (filterLanguage !== "All" && !ins.languages.includes(filterLanguage)) {
        return false;
      }
      if (filterSuburb !== "All" && !ins.suburbs.some((s) => s.toLowerCase().includes(filterSuburb.toLowerCase()))) {
        return false;
      }
      if (filterPreference === "Female only" && !ins.name.includes("Priya") && !ins.name.includes("Sofia") && !ins.name.includes("Aisha")) {
        return false;
      }
      return true;
    });
  }, [instructorsList, filterTransmission, filterLanguage, filterSuburb, filterPreference]);

  // STEP 2 STATE: Amount & Packages
  // Options: "single" (1 or 2 hrs), "6hours" (5% off), "10hours" (10% off), "custom"
  const [packageType, setPackageType] = useState<"single" | "6hours" | "10hours" | "custom">("10hours");
  const [customHours, setCustomHours] = useState<number>(8);
  const [lessonLengthHours, setLessonLengthHours] = useState<1 | 2>(2);
  const [includeTestPackage, setIncludeTestPackage] = useState<boolean>(false);

  // Price Calculation
  const totalHours = useMemo(() => {
    if (packageType === "single") return lessonLengthHours;
    if (packageType === "6hours") return 6;
    if (packageType === "10hours") return 10;
    return customHours;
  }, [packageType, lessonLengthHours, customHours]);

  const baseRate = selectedInstructor.hourlyRate;
  const rawSubtotal = totalHours * baseRate;

  // Discounts
  const discountPercent = useMemo(() => {
    if (packageType === "10hours") return 10;
    if (packageType === "6hours") return 5;
    if (packageType === "custom" && customHours >= 10) return 10;
    if (packageType === "custom" && customHours >= 6) return 5;
    return 0;
  }, [packageType, customHours]);

  const bundleDiscount = (rawSubtotal * discountPercent) / 100;
  const testPackagePrice = includeTestPackage ? 195 : 0;

  // Promo code
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a discount code");
      return;
    }

    setIsApplyingPromo(true);
    setPromoError("");
    try {
      const res = await apiFetch<any>("/api/promo/validate", {
        method: "POST",
        body: JSON.stringify({
          code,
          subtotal: Math.max(0, rawSubtotal - bundleDiscount),
        }),
      });

      if (res && res.success && res.data?.valid) {
        setAppliedPromo({
          code: res.data.code,
          discount: Number(res.data.discount_amount),
        });
        setPromoError("");
      } else {
        setPromoError(res?.message || "Invalid discount code. Try 'EZY10' or 'BONUS5'");
      }
    } catch {
      // Local fallback
      if (code === "EZY10") {
        setAppliedPromo({ code: "EZY10", discount: 10 });
        setPromoError("");
      } else if (code === "BONUS5") {
        const disc = Math.round((rawSubtotal - bundleDiscount) * 0.05);
        setAppliedPromo({ code: "BONUS5", discount: disc });
        setPromoError("");
      } else {
        setPromoError("Invalid discount code. Try 'EZY10' or 'BONUS5'");
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const promoDiscount = appliedPromo ? appliedPromo.discount : 0;
  const totalAmount = Math.max(0, rawSubtotal - bundleDiscount + testPackagePrice - promoDiscount);

  // STEP 3 STATE: Schedule Lessons
  // Total lessons to book = Math.ceil(totalHours / lessonLengthHours)
  const totalLessonsCount = Math.max(1, Math.ceil(totalHours / lessonLengthHours));
  const [activeBookingIndex, setActiveBookingIndex] = useState<number>(1); // Default to Lesson 2 if Lesson 1 is pre-booked
  const [bookedSlots, setBookedSlots] = useState<
    Array<{ lessonNum: number; date: string; time: string; duration: number }>
  >([
    { lessonNum: 1, date: "2026-11-24", time: "10:00 - 12:00", duration: 2 },
  ]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>("2026-11-26");
  const [selectedCalendarTime, setSelectedCalendarTime] = useState<string>("12:00");
  const [pickupLocationPreset, setPickupLocationPreset] = useState<string>("Northside Hub");

  // Date formatting helper: e.g. "2026-11-24" -> "Tue 24 Nov"
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-").map(Number);
      if (parts.length !== 3) return dateStr;
      const [y, m, d] = parts;
      const date = new Date(y, m - 1, d);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${days[date.getDay()]} ${d} ${months[date.getMonth()]}`;
    } catch {
      return dateStr;
    }
  };

  // Dynamic live availability from backend
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; available: boolean; status: string }>>([
    { time: "08:00", available: true, status: "available" },
    { time: "09:30", available: false, status: "booked" },
    { time: "10:30", available: true, status: "available" },
    { time: "12:00", available: true, status: "available" },
    { time: "14:00", available: true, status: "available" },
    { time: "15:30", available: false, status: "booked" },
    { time: "17:00", available: true, status: "available" },
    { time: "18:30", available: true, status: "available" },
  ]);

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedInstructor?.id) return;
      try {
        const res = await apiFetch<any>(`/api/instructors/${selectedInstructor.id}/availability?date=${selectedCalendarDate}`);
        if (res?.success && res?.data?.slots && Array.isArray(res.data.slots)) {
          setAvailableSlots(res.data.slots);
        }
      } catch {
        // keep fallback
      }
    }
    fetchAvailability();
  }, [selectedInstructor?.id, selectedCalendarDate]);

  // Step 3: Switch active lesson and synchronize calendar date & time
  const handleChangeLesson = (idx: number) => {
    setActiveBookingIndex(idx);
    const lessonNum = idx + 1;
    const existing = bookedSlots.find((b) => b.lessonNum === lessonNum);
    if (existing) {
      setSelectedCalendarDate(existing.date);
      const startTime = existing.time.split("-")[0].trim();
      setSelectedCalendarTime(startTime);
    }
  };

  // Step 3: Clear a booked lesson slot
  const handleClearLessonSlot = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const lessonNum = idx + 1;
    setBookedSlots((prev) => prev.filter((b) => b.lessonNum !== lessonNum));
    setActiveBookingIndex(idx);
  };

  // Step 3: Slot selection & update
  const handleSelectSlot = (time: string) => {
    setSelectedCalendarTime(time);
    const startHour = parseInt(time.split(":")[0]);
    const endHour = startHour + lessonLengthHours;
    const formattedEnd = `${endHour < 10 ? "0" : ""}${endHour}:00`;
    const formattedSlot = `${time} - ${formattedEnd}`;
    const currentLessonNum = activeBookingIndex + 1;
    const wasAlreadyBooked = bookedSlots.some((s) => s.lessonNum === currentLessonNum);

    // Update or add active lesson slot
    setBookedSlots((prev) => {
      const copy = [...prev];
      const existing = copy.findIndex((s) => s.lessonNum === currentLessonNum);
      if (existing >= 0) {
        copy[existing] = {
          lessonNum: currentLessonNum,
          date: selectedCalendarDate,
          time: formattedSlot,
          duration: lessonLengthHours,
        };
      } else {
        copy.push({
          lessonNum: currentLessonNum,
          date: selectedCalendarDate,
          time: formattedSlot,
          duration: lessonLengthHours,
        });
      }
      return copy;
    });

    // If booking a new lesson, auto-advance to next unbooked lesson
    if (!wasAlreadyBooked) {
      const nextUnbooked = Array.from({ length: totalLessonsCount }).findIndex(
        (_, i) => i !== activeBookingIndex && !bookedSlots.some((b) => b.lessonNum === i + 1)
      );
      if (nextUnbooked >= 0) {
        setActiveBookingIndex(nextUnbooked);
      }
    }
  };

  // STEP 4 STATE: Learner Registration
  const [learnerFirstName, setLearnerFirstName] = useState("Emma");
  const [learnerLastName, setLearnerLastName] = useState("Clarke");
  const [learnerDob, setLearnerDob] = useState("14/06/2005");
  const [learnerMobile, setLearnerMobile] = useState("0412 345 678");
  const [learnerEmail, setLearnerEmail] = useState("emma.clarke@example.com");
  const [isBookingForOther, setIsBookingForOther] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  const [licenceType, setLicenceType] = useState("Learner permit");
  const [licenceNumber, setLicenceNumber] = useState("98765432");
  const [licenceState, setLicenceState] = useState("NSW");
  const [licenceIssueDate, setLicenceIssueDate] = useState("10/01/2024");
  const [drivingExperience, setDrivingExperience] = useState("Complete beginner");
  const [logbookHours, setLogbookHours] = useState("0");

  const [pickupStreet, setPickupStreet] = useState("45 Church Street");
  const [pickupSuburbInput, setPickupSuburbInput] = useState("Parramatta");
  const [pickupPostcode, setPickupPostcode] = useState("2150");

  const [emergencyName, setEmergencyName] = useState("Robert Clarke");
  const [emergencyPhone, setEmergencyPhone] = useState("0411 987 654");
  const [emergencyRelation, setEmergencyRelation] = useState("Parent");

  const [specialNotes, setSpecialNotes] = useState("A bit nervous in city traffic, first time driving in Sydney.");
  const [preferCalmInstructor, setPreferCalmInstructor] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [receiveReminders, setReceiveReminders] = useState(true);

  // STEP 5 STATE: Payment
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_google" | "afterpay">("card");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvc, setCardCvc] = useState("892");
  const [cardName, setCardName] = useState("Emma Clarke");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingRefNumber, setBookingRefNumber] = useState("");
  const [confirmedBookingData, setConfirmedBookingData] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState("");

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setSubmissionError("");

    try {
      const payload = {
        instructor_id: selectedInstructor.id,
        package_type: packageType,
        total_hours: totalHours,
        lesson_length_hours: lessonLengthHours,
        include_test_package: includeTestPackage,
        test_package_price: testPackagePrice,
        booked_slots: bookedSlots,
        // Learner details
        student_name: `${learnerFirstName} ${learnerLastName}`.trim(),
        first_name: learnerFirstName,
        last_name: learnerLastName,
        student_email: learnerEmail,
        student_phone: learnerMobile,
        date_of_birth: learnerDob,
        is_booking_for_other: isBookingForOther,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        // Licence info
        licence_stage: licenceType,
        licence_number: licenceNumber,
        licence_state: licenceState,
        licence_issue_date: licenceIssueDate,
        driving_experience: drivingExperience,
        logbook_hours: logbookHours,
        // Pickup Address
        pickup_address: pickupStreet,
        pickup_suburb: pickupSuburbInput,
        pickup_postcode: pickupPostcode,
        pickup_state: "NSW",
        // Emergency contact
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_relation: emergencyRelation,
        // Preferences
        special_notes: specialNotes,
        prefer_calm_instructor: preferCalmInstructor,
        // Payment
        payment_method: paymentMethod === "card" ? "Credit Card" : paymentMethod === "apple_google" ? "Apple Pay / Google Pay" : "Afterpay",
        amount_aud: rawSubtotal + testPackagePrice,
        discount_aud: bundleDiscount + promoDiscount,
        final_amount_aud: totalAmount,
        promo_code: appliedPromo?.code || null,
        card_last4: cardNumber.replace(/\s+/g, "").slice(-4),
        card_name: cardName,
      };

      const res = await apiFetch<any>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && (res.success || res.booking_code || res.data?.booking_code)) {
        const refCode = res.data?.booking_code || res.booking_code || ("EZY-" + Math.floor(100000 + Math.random() * 900000));
        setBookingRefNumber(refCode);
        setConfirmedBookingData(res.data || res);
        setPaymentSuccess(true);
      } else {
        const fallbackRef = "EZY-" + Math.floor(100000 + Math.random() * 900000);
        setBookingRefNumber(fallbackRef);
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      console.warn("API booking submit failed, using fallback:", err);
      const fallbackRef = "EZY-" + Math.floor(100000 + Math.random() * 900000);
      setBookingRefNumber(fallbackRef);
      setPaymentSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // STEPPER STEPS
  const steps = [
    { num: 1, label: "Instructor" },
    { num: 2, label: "Amount" },
    { num: 3, label: "Book your lessons" },
    { num: 4, label: "Learner Registration" },
    { num: 5, label: "Payment" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans select-none pb-20">
      {/* 1. TOP HEADER & BRAND BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07345B] text-[#FAB10B] flex items-center justify-center font-heading font-black text-lg shadow-sm">
              E
            </div>
            <div>
              <span className="font-heading font-black text-base tracking-tight text-[#07345B] block leading-none">
                EZY 2 LEARN
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Driving School Sydney
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600 font-medium">
              <span>Need help?</span>
              <a href="tel:1300399532" className="font-bold text-[#07345B] hover:text-[#FAB10B] transition-colors">
                1300 399 532
              </a>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FIVE-STEP STEPPER BAR */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-2xs mb-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between relative">
            {/* Background Connector Line */}
            <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />

            {steps.map((st) => {
              const isCompleted = st.num < currentStep;
              const isCurrent = st.num === currentStep;

              return (
                <div key={st.num} className="flex flex-col items-center relative z-10">
                  <button
                    onClick={() => {
                      if (st.num < currentStep) {
                        setCurrentStep(st.num);
                      }
                    }}
                    disabled={st.num > currentStep}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-all cursor-pointer ${isCompleted
                      ? "bg-[#FAB10B] text-[#07345B]"
                      : isCurrent
                        ? "bg-[#07345B] text-white ring-4 ring-[#07345B]/15"
                        : "bg-white border-2 border-slate-200 text-slate-400"
                      }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                  </button>
                  <span
                    className={`text-[11px] font-semibold mt-2 text-center whitespace-nowrap ${isCurrent
                      ? "text-[#07345B] font-bold"
                      : isCompleted
                        ? "text-slate-700"
                        : "text-slate-400"
                      }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKFLOW CONTAINER (2-COLUMNS: MAIN CONTENT + STICKY SIDEBAR) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: DYNAMIC STEP VIEW */}
          <div className="lg:col-span-8 space-y-6">
            {/* ============================================================ */}
            {/* STEP 1: CHOOSE YOUR INSTRUCTOR */}
            {/* ============================================================ */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                    Choose your instructor
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 mt-1.5">
                    Pick the instructor you&apos;d like to learn with. You can change anytime.
                  </p>
                </div>

                {/* Filter Box: Where are you being picked up? */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                    Where are you being picked up?
                  </h3>
                  <p className="text-sm text-slate-600 -mt-2">
                    We&apos;ll show instructors who service your area.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                        Pick-up suburb or postcode
                      </label>
                      <select
                        value={filterSuburb}
                        onChange={(e) => setFilterSuburb(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm sm:text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      >
                        <option value="All">All Greater Sydney Suburbs</option>
                        <option value="Parramatta">Parramatta (Western Sydney)</option>
                        <option value="Blacktown">Blacktown</option>
                        <option value="Westmead">Westmead</option>
                        <option value="Northside">Northside / Chatswood</option>
                        <option value="Sydney CBD">Sydney CBD / Inner West</option>
                        <option value="Liverpool">Liverpool / South West</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                        Transmission
                      </label>
                      <select
                        value={filterTransmission}
                        onChange={(e) => setFilterTransmission(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm sm:text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      >
                        <option value="All">All Transmissions</option>
                        <option value="Automatic">Automatic Only</option>
                        <option value="Manual">Manual Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                        Instructor preference
                      </label>
                      <select
                        value={filterPreference}
                        onChange={(e) => setFilterPreference(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm sm:text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      >
                        <option value="No preference">No preference</option>
                        <option value="Male">Male Instructor</option>
                        <option value="Female">Female Instructor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                        Language
                      </label>
                      <select
                        value={filterLanguage}
                        onChange={(e) => setFilterLanguage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm sm:text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      >
                        <option value="All">All Languages</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Urdu">Urdu</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Instructor Clean Radio List */}
                <div className="space-y-3">
                  {filteredInstructors.map((ins) => {
                    const isSelected = selectedInstructorId === ins.id;

                    return (
                      <div
                        key={ins.id}
                        onClick={() => setSelectedInstructorId(ins.id)}
                        className={`rounded-xl p-3.5 sm:p-4 border transition-all cursor-pointer relative bg-white ${isSelected
                          ? "border-2 border-slate-900 shadow-sm"
                          : "border border-slate-200 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                            {/* Standard Clean Radio Circle */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-slate-900 bg-white" : "border-slate-300 bg-white"
                                }`}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                            </div>

                            {/* Avatar - Smaller and compact */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center font-heading font-black text-slate-800 text-base">
                              {ins.avatar ? (
                                <img
                                  src={ins.avatar}
                                  alt={ins.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                ins.initials
                              )}
                            </div>

                            {/* Details - Compact and sleek */}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-tight">
                                  {ins.name}
                                </h4>
                                {ins.verified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-slate-800 text-slate-800" />
                                <span>{ins.rating}</span>
                                <span className="text-slate-500 font-normal">
                                  ({ins.reviewCount} reviews)
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium text-slate-800 text-[11px]">
                                  {ins.transmission}
                                </span>
                                <span>•</span>
                                <span className="truncate">{ins.car}</span>
                                <span>•</span>
                                <span className="truncate">{ins.languages.join(", ")}</span>
                              </div>

                              <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5 pt-0.5">
                                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                                <span>Next available {ins.nextAvailable}</span>
                              </p>
                            </div>
                          </div>

                          {/* Rate - Balanced size */}
                          <div className="text-right shrink-0 pl-2">
                            <span className="text-[11px] text-slate-400 font-medium block">From</span>
                            <span className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
                              ${ins.hourlyRate}
                            </span>
                            <span className="text-xs text-slate-500 font-normal">/hr</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-heading font-bold text-base shadow-sm transition-all cursor-pointer"
                  >
                    <span>Continue to amount</span>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: CHOOSE YOUR LESSONS (AMOUNT) */}
            {/* ============================================================ */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                    Choose your lessons
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 mt-1.5">
                    Select how much driving you need and add a test package if you&apos;d like.
                  </p>
                </div>

                {/* Section 1: How many hours of driving? */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                      How many hours of driving?
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Credit works on 1 hour, 2 hour and test day lessons.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                    {/* Option 1: Single lesson */}
                    <div
                      onClick={() => setPackageType("single")}
                      className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between bg-white ${packageType === "single"
                        ? "border-2 border-slate-900 shadow-sm"
                        : "border border-slate-200 hover:border-slate-400"
                        }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${packageType === "single"
                            ? "border-slate-900 bg-white"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {packageType === "single" && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-base sm:text-lg text-slate-900">Single lesson</p>
                          <p className="text-sm text-slate-600 mt-0.5">Try one lesson</p>
                        </div>
                      </div>
                      <div className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-5 pl-8">
                        ${baseRate * lessonLengthHours}
                      </div>
                    </div>

                    {/* Option 2: 6+ hours */}
                    <div
                      onClick={() => setPackageType("6hours")}
                      className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between bg-white ${packageType === "6hours"
                        ? "border-2 border-slate-900 shadow-sm"
                        : "border border-slate-200 hover:border-slate-400"
                        }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${packageType === "6hours"
                            ? "border-slate-900 bg-white"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {packageType === "6hours" && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-base sm:text-lg text-slate-900">6+ hours</p>
                          <p className="text-sm text-slate-600 font-medium mt-0.5">Save 5%</p>
                        </div>
                      </div>
                      <div className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-5 pl-8">
                        ${Math.round(baseRate * 6 * 0.95)}
                      </div>
                    </div>

                    {/* Option 3: 10+ hours (Best value) */}
                    <div
                      onClick={() => setPackageType("10hours")}
                      className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between relative bg-white ${packageType === "10hours"
                        ? "border-2 border-slate-900 shadow-sm"
                        : "border border-slate-200 hover:border-slate-400"
                        }`}
                    >
                      <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-slate-900 text-white font-heading font-bold text-xs uppercase tracking-wide shadow-xs">
                        Best value
                      </span>
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${packageType === "10hours"
                            ? "border-slate-900 bg-white"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {packageType === "10hours" && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-base sm:text-lg text-slate-900">10+ hours</p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            Save 10% · bonus logbook hours
                          </p>
                        </div>
                      </div>
                      <div className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-5 pl-8">
                        ${Math.round(baseRate * 10 * 0.9)}
                      </div>
                    </div>

                    {/* Option 4: Custom hours */}
                    <div
                      onClick={() => setPackageType("custom")}
                      className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between bg-white ${packageType === "custom"
                        ? "border-2 border-slate-900 shadow-sm"
                        : "border border-slate-200 hover:border-slate-400"
                        }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${packageType === "custom"
                            ? "border-slate-900 bg-white"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {packageType === "custom" && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-base sm:text-lg text-slate-900">Custom hours</p>
                          <p className="text-sm text-slate-600 mt-0.5">Choose your own amount</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-8 mt-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPackageType("custom");
                            setCustomHours((h) => Math.max(2, h - 1));
                          }}
                          className="w-9 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-800 font-bold"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-heading font-extrabold text-lg text-slate-900 min-w-[36px] text-center">
                          {customHours}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPackageType("custom");
                            setCustomHours((h) => Math.min(50, h + 1));
                          }}
                          className="w-9 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-800 font-bold"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-slate-600 font-medium">hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Lesson length */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-3">
                  <div>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">Lesson length</h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Most learners choose 2 hours for the best progress.
                    </p>
                  </div>

                  <div className="inline-flex p-1.5 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setLessonLengthHours(1)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-heading font-bold transition-all ${lessonLengthHours === 1
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900"
                        }`}
                    >
                      1 hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonLengthHours(2)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-heading font-bold transition-all ${lessonLengthHours === 2
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900"
                        }`}
                    >
                      2 hours
                    </button>
                  </div>
                </div>

                {/* Section 3: RECOMMENDED Add a Driving Test Package */}
                <div
                  onClick={() => setIncludeTestPackage(!includeTestPackage)}
                  className={`rounded-2xl p-6 sm:p-7 border transition-all cursor-pointer bg-white ${includeTestPackage
                    ? "border-2 border-slate-900 shadow-sm"
                    : "border border-slate-200 hover:border-slate-400"
                    }`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="space-y-1">
                      <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500">
                        RECOMMENDED
                      </span>
                      <h4 className="font-heading font-bold text-lg sm:text-xl text-slate-900">
                        Add a Driving Test Package
                      </h4>
                      <p className="text-sm sm:text-base text-slate-600 pt-0.5">
                        2.5 hours on test day, with {selectedInstructor.name}&apos;s test-ready car.
                      </p>

                      <ul className="text-sm text-slate-700 space-y-2 pt-3">
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-slate-800 shrink-0" />
                          <span>45-minute warm-up before your test</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-slate-800 shrink-0" />
                          <span>Test-ready, dual-controlled car</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-slate-800 shrink-0" />
                          <span>Pick-up from your chosen address</span>
                        </li>
                      </ul>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">$195</span>
                      <label className="inline-flex items-center gap-2.5 mt-5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeTestPackage}
                          onChange={(e) => setIncludeTestPackage(e.target.checked)}
                          className="w-5 h-5 rounded text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-sm font-semibold text-slate-800">Add to my booking</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 font-heading font-bold text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-heading font-bold text-base shadow-sm transition-all cursor-pointer"
                  >
                    <span>Continue to booking</span>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: BOOK YOUR LESSONS */}
            {/* ============================================================ */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
                    Book your lessons
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 mt-1">
                    Pick a day and time for each lesson.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Lesson Selector List */}
                  <div className="md:col-span-4 space-y-3">
                    {Array.from({ length: totalLessonsCount }).map((_, idx) => {
                      const lessonNum = idx + 1;
                      const booked = bookedSlots.find((b) => b.lessonNum === lessonNum);
                      const isCurrent = activeBookingIndex === idx;

                      return (
                        <div
                          key={lessonNum}
                          onClick={() => handleChangeLesson(idx)}
                          className={`rounded-2xl p-4 sm:p-4.5 border-2 transition-all cursor-pointer ${isCurrent
                            ? "bg-white border-[#07345B] ring-2 ring-[#07345B]/20 shadow-xs"
                            : booked
                              ? "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                              : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs shrink-0 ${booked
                                  ? "bg-emerald-600 text-white"
                                  : isCurrent
                                    ? "bg-[#07345B] text-white"
                                    : "bg-slate-100 text-slate-500"
                                  }`}
                              >
                                {booked ? <Check className="w-4 h-4 stroke-[2.5]" /> : lessonNum}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-heading font-bold text-sm text-slate-900">
                                    Lesson {lessonNum}
                                  </p>
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#07345B] border border-slate-200">
                                      Editing
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 font-medium mt-0.5">
                                  {booked ? (
                                    <span>
                                      {formatDisplayDate(booked.date)} · {booked.time}
                                    </span>
                                  ) : isCurrent ? (
                                    <span className="text-[#07345B] font-semibold">Choose a time</span>
                                  ) : (
                                    <span className="text-slate-400">Not booked yet</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {booked && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeLesson(idx);
                                  }}
                                  className={`px-2.5 py-1 text-xs font-heading font-bold rounded-lg border transition-all cursor-pointer ${isCurrent
                                    ? "bg-[#07345B] text-white border-[#07345B] shadow-2xs"
                                    : "bg-slate-50 hover:bg-slate-100 text-[#07345B] border-slate-200 hover:border-[#07345B]"
                                    }`}
                                >
                                  {isCurrent ? "Editing" : "Change"}
                                </button>
                                {isCurrent && (
                                  <button
                                    type="button"
                                    title="Clear this lesson slot"
                                    onClick={(e) => handleClearLessonSlot(idx, e)}
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Test Day Package row if added */}
                    {includeTestPackage && (
                      <div className="rounded-2xl p-4 sm:p-4.5 border border-amber-200 bg-amber-50/40">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#FAB10B] text-[#07345B] flex items-center justify-center font-heading font-bold text-xs shrink-0">
                            T
                          </div>
                          <div>
                            <p className="font-heading font-bold text-sm text-slate-900">Test day package</p>
                            <p className="text-xs text-slate-500 mt-0.5">Book once you have a test date</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Calendar & Time Slots */}
                  <div className="md:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
                    {/* Active lesson context indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-base sm:text-lg text-slate-900">November 2026</h4>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#07345B] text-white">
                            Lesson {activeBookingIndex + 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {bookedSlots.some((b) => b.lessonNum === activeBookingIndex + 1)
                            ? `Currently booked for ${formatDisplayDate(
                              bookedSlots.find((b) => b.lessonNum === activeBookingIndex + 1)!.date
                            )} (${bookedSlots.find((b) => b.lessonNum === activeBookingIndex + 1)!.time}). Click any slot below to change.`
                            : `Select a date and time slot for Lesson ${activeBookingIndex + 1}.`}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        {lessonLengthHours} hour lesson
                      </span>
                    </div>

                    {/* Calendar Days Row */}
                    <div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>

                      {/* November 2026 Calendar Grid matching reference design */}
                      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                        {/* Row 1: Nov 1 starts on Sunday */}
                        <div className="p-2 text-slate-200"></div>
                        <div className="p-2 text-slate-200"></div>
                        <div className="p-2 text-slate-200"></div>
                        <div className="p-2 text-slate-200"></div>
                        <div className="p-2 text-slate-200"></div>
                        <div className="p-2 text-slate-200"></div>
                        <div className="p-2 text-slate-300 font-medium">1</div>

                        {/* Row 2: Nov 2 - 8 (past) */}
                        <div className="p-2 text-slate-300 font-medium">2</div>
                        <div className="p-2 text-slate-300 font-medium">3</div>
                        <div className="p-2 text-slate-300 font-medium">4</div>
                        <div className="p-2 text-slate-300 font-medium">5</div>
                        <div className="p-2 text-slate-300 font-medium">6</div>
                        <div className="p-2 text-slate-300 font-medium">7</div>
                        <div className="p-2 text-slate-300 font-medium">8</div>

                        {/* Row 3: Nov 9 - 15 (past) */}
                        <div className="p-2 text-slate-300 font-medium">9</div>
                        <div className="p-2 text-slate-300 font-medium">10</div>
                        <div className="p-2 text-slate-300 font-medium">11</div>
                        <div className="p-2 text-slate-300 font-medium">12</div>
                        <div className="p-2 text-slate-300 font-medium">13</div>
                        <div className="p-2 text-slate-300 font-medium">14</div>
                        <div className="p-2 text-slate-300 font-medium">15</div>

                        {/* Row 4: Nov 16 - 22 */}
                        <div className="p-2 text-slate-300 font-medium">16</div>
                        <div className="p-2 text-slate-300 font-medium">17</div>
                        <div className="p-2 text-slate-300 font-medium">18</div>
                        <div className="p-2 text-slate-300 font-medium">19</div>
                        <div className="p-2 text-slate-300 font-medium">20</div>
                        <div className="p-2 text-slate-300 font-medium">21</div>
                        <div className="p-2 text-slate-300 font-medium">22</div>

                        {/* Row 5: Nov 23 - 29 (Active week in reference design) */}
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarDate("2026-11-23")}
                          className={`py-2.5 rounded-xl font-heading font-bold border transition-all cursor-pointer ${selectedCalendarDate === "2026-11-23"
                            ? "bg-[#07345B] text-white border-[#07345B] shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                          23
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarDate("2026-11-24")}
                          className={`py-2.5 rounded-xl font-heading font-bold border transition-all cursor-pointer ${selectedCalendarDate === "2026-11-24"
                            ? "bg-[#07345B] text-white border-[#07345B] shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                          24
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarDate("2026-11-25")}
                          className={`py-2.5 rounded-xl font-heading font-bold border transition-all cursor-pointer ${selectedCalendarDate === "2026-11-25"
                            ? "bg-[#07345B] text-white border-[#07345B] shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                          25
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarDate("2026-11-26")}
                          className={`py-2.5 rounded-xl font-heading font-bold border transition-all cursor-pointer ${selectedCalendarDate === "2026-11-26"
                            ? "bg-[#07345B] text-white border-[#07345B] shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                          26
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarDate("2026-11-27")}
                          className={`py-2.5 rounded-xl font-heading font-bold border transition-all cursor-pointer ${selectedCalendarDate === "2026-11-27"
                            ? "bg-[#07345B] text-white border-[#07345B] shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                          27
                        </button>
                        <div className="py-2.5 text-slate-300 font-medium">28</div>
                        <div className="py-2.5 text-slate-300 font-medium">29</div>

                        {/* Row 6: Nov 30 */}
                        <button
                          type="button"
                          onClick={() => setSelectedCalendarDate("2026-11-30")}
                          className={`py-2.5 rounded-xl font-heading font-bold border transition-all cursor-pointer ${selectedCalendarDate === "2026-11-30"
                            ? "bg-[#07345B] text-white border-[#07345B] shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                            }`}
                        >
                          30
                        </button>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-md border border-slate-300 bg-white inline-block" />
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-md bg-[#07345B] inline-block" />
                          <span className="font-bold text-slate-900">Selected</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200 inline-block" />
                          <span>Unavailable</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots for Selected Day */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-heading font-bold text-sm sm:text-base text-slate-900">
                          {formatDisplayDate(selectedCalendarDate)} · pick a time
                        </p>
                        {bookedSlots.some(
                          (b) => b.lessonNum === activeBookingIndex + 1 && b.date === selectedCalendarDate
                        ) && (
                            <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                              Booked: {bookedSlots.find(
                                (b) => b.lessonNum === activeBookingIndex + 1 && b.date === selectedCalendarDate
                              )?.time}
                            </span>
                          )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {availableSlots.map((slot) => {
                          const currentLesson = bookedSlots.find((b) => b.lessonNum === activeBookingIndex + 1);
                          const isCurrentLessonSlot =
                            currentLesson?.date === selectedCalendarDate &&
                            currentLesson?.time.startsWith(slot.time);

                          const isBookedForOtherLesson = bookedSlots.some(
                            (b) =>
                              b.lessonNum !== activeBookingIndex + 1 &&
                              b.date === selectedCalendarDate &&
                              b.time.startsWith(slot.time)
                          );

                          const isUnavailable = (!slot.available || isBookedForOtherLesson) && !isCurrentLessonSlot;
                          const isSelected = selectedCalendarTime === slot.time || isCurrentLessonSlot;

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={isUnavailable}
                              onClick={() => handleSelectSlot(slot.time)}
                              className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${isSelected
                                ? "bg-[#FAB10B] text-[#07345B] font-black shadow-xs ring-2 ring-[#FAB10B]/40 scale-[1.02]"
                                : isUnavailable
                                  ? "bg-slate-50 text-slate-300 border border-dashed border-slate-200 cursor-not-allowed line-through"
                                  : "bg-white border border-slate-200 text-slate-800 hover:border-[#07345B] hover:bg-slate-50 shadow-2xs"
                                }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pick-up location */}
                    <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Pick-up location
                      </label>
                      <select
                        value={pickupLocationPreset}
                        onChange={(e) => setPickupLocationPreset(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      >
                        <option value="Northside Hub">Northside Hub</option>
                        <option value="Parramatta Hub">Parramatta Hub (Church St)</option>
                        <option value="Blacktown Station">Blacktown Interchange</option>
                        <option value="Student Home Address">My Home Address (Provided in next step)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Callout Notice */}
                <div className="rounded-2xl p-4 bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium flex items-center gap-2.5">
                  <Info className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>You can book your remaining lessons later from your account.</span>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-heading font-bold text-xs sm:text-sm shadow-2xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-9 py-3.5 rounded-xl bg-[#07345B] hover:bg-[#0B1528] text-white font-heading font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
                  >
                    <span>Continue to registration</span>
                    <ChevronRight className="w-4 h-4 text-[#FAB10B]" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 4: LEARNER REGISTRATION */}
            {/* ============================================================ */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
                    Learner registration
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Tell us about the learner so your instructor can prepare.
                  </p>
                </div>

                {/* Section 1: Learner details */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">Learner details</h3>
                    <p className="text-xs text-slate-500">Who will be learning to drive?</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">First name</label>
                      <input
                        type="text"
                        value={learnerFirstName}
                        onChange={(e) => setLearnerFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Last name</label>
                      <input
                        type="text"
                        value={learnerLastName}
                        onChange={(e) => setLearnerLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of birth</label>
                      <input
                        type="text"
                        placeholder="DD / MM / YYYY"
                        value={learnerDob}
                        onChange={(e) => setLearnerDob(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile number</label>
                      <input
                        type="text"
                        value={learnerMobile}
                        onChange={(e) => setLearnerMobile(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email address</label>
                      <input
                        type="email"
                        value={learnerEmail}
                        onChange={(e) => setLearnerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Booking confirmations and NSW logbook updates are sent here.
                      </span>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBookingForOther}
                      onChange={(e) => setIsBookingForOther(e.target.checked)}
                      className="w-4 h-4 rounded text-[#07345B] focus:ring-[#07345B]"
                    />
                    <span className="text-xs text-slate-700">
                      I&apos;m booking for someone else (parent or guardian)
                    </span>
                  </label>

                  {isBookingForOther && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Parent / Guardian name</label>
                        <input
                          type="text"
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          placeholder="Full name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Parent mobile</label>
                        <input
                          type="text"
                          value={guardianPhone}
                          onChange={(e) => setGuardianPhone(e.target.value)}
                          placeholder="Mobile number"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Licence details */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">Licence details</h3>
                    <p className="text-xs text-slate-500">Used to prepare your lessons.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Licence type</label>
                      <select
                        value={licenceType}
                        onChange={(e) => setLicenceType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <option value="Learner permit">Learner permit (L plates)</option>
                        <option value="Overseas licence">Overseas licence conversion</option>
                        <option value="Provisional P1">Provisional P1 (Red P)</option>
                        <option value="Full Licence">Full licence refresher</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Licence number</label>
                      <input
                        type="text"
                        value={licenceNumber}
                        onChange={(e) => setLicenceNumber(e.target.value)}
                        placeholder="[Licence number]"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Issuing state</label>
                      <select
                        value={licenceState}
                        onChange={(e) => setLicenceState(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <option value="NSW">NSW (New South Wales)</option>
                        <option value="VIC">VIC (Victoria)</option>
                        <option value="QLD">QLD (Queensland)</option>
                        <option value="ACT">ACT (Canberra)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Learner permit issue date</label>
                      <input
                        type="text"
                        placeholder="DD / MM / YYYY"
                        value={licenceIssueDate}
                        onChange={(e) => setLicenceIssueDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Driving experience</label>
                      <select
                        value={drivingExperience}
                        onChange={(e) => setDrivingExperience(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <option value="Complete beginner">Complete beginner (0-5 hrs)</option>
                        <option value="Some experience">Some experience (5-20 hrs)</option>
                        <option value="Intermediate">Intermediate (20-60 hrs)</option>
                        <option value="Ready for test">Ready for test (70+ hrs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Logbook hours completed</label>
                      <input
                        type="number"
                        value={logbookHours}
                        onChange={(e) => setLogbookHours(e.target.value)}
                        placeholder="0"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Pick-up address */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">Pick-up address</h3>
                    <p className="text-xs text-slate-500">Where should your instructor meet you?</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Street address</label>
                      <input
                        type="text"
                        value={pickupStreet}
                        onChange={(e) => setPickupStreet(e.target.value)}
                        placeholder="e.g. 45 Church Street"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Suburb</label>
                        <input
                          type="text"
                          value={pickupSuburbInput}
                          onChange={(e) => setPickupSuburbInput(e.target.value)}
                          placeholder="e.g. Parramatta"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                        <select
                          value={licenceState}
                          onChange={(e) => setLicenceState(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                        >
                          <option value="NSW">NSW</option>
                          <option value="VIC">VIC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Postcode</label>
                        <input
                          type="text"
                          value={pickupPostcode}
                          onChange={(e) => setPickupPostcode(e.target.value)}
                          placeholder="2150"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Emergency contact */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">Emergency contact</h3>
                    <p className="text-xs text-slate-500">Someone we can call if needed.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Full name</label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="[full name]"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone number</label>
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="[phone number]"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Relationship</label>
                      <select
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <option value="Parent">Parent</option>
                        <option value="Partner">Partner</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Friend">Friend</option>
                        <option value="Sibling">Sibling</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 5: Anything we should know? */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">Anything we should know?</h3>
                    <p className="text-xs text-slate-500">Optional. Helps your instructor prepare.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Notes for your instructor</label>
                    <textarea
                      rows={3}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Nerves, medical conditions, accessibility needs..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferCalmInstructor}
                      onChange={(e) => setPreferCalmInstructor(e.target.checked)}
                      className="w-4 h-4 rounded text-[#07345B] focus:ring-[#07345B]"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      I&apos;d like to be matched with a calm, patient instructor
                    </span>
                  </label>
                </div>

                {/* Section 6: Terms & SMS Reminders */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-[#07345B] focus:ring-[#07345B] mt-0.5"
                    />
                    <span className="text-xs text-slate-700">
                      I agree to the terms and cancellation policy (free rescheduling up to 24 hrs prior)
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiveReminders}
                      onChange={(e) => setReceiveReminders(e.target.checked)}
                      className="w-4 h-4 rounded text-[#07345B] focus:ring-[#07345B] mt-0.5"
                    />
                    <span className="text-xs text-slate-700">
                      Send me lesson reminders by SMS and email
                    </span>
                  </label>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-heading font-bold text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(5)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#07345B] hover:bg-[#0B1528] text-white font-heading font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Continue to payment</span>
                    <ChevronRight className="w-4 h-4 text-[#FAB10B]" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 5: PAYMENT */}
            {/* ============================================================ */}
            {currentStep === 5 && !paymentSuccess && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
                    Payment
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Review your booking and pay securely.
                  </p>
                </div>

                {/* Section 1: Payment method */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">Payment method</h3>
                    <p className="text-xs text-slate-500">Your payment is encrypted and secure.</p>
                  </div>

                  {/* Option 1: Credit or debit card */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer space-y-4 ${paymentMethod === "card"
                      ? "bg-amber-50/40 border-[#FAB10B] ring-2 ring-[#FAB10B]/30"
                      : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "card"
                            ? "border-[#07345B] bg-[#07345B]"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {paymentMethod === "card" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FAB10B]" />
                          )}
                        </div>
                        <span className="font-heading font-bold text-sm text-slate-900">
                          Credit or debit card
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-600 bg-white">
                          VISA
                        </span>
                        <span className="px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-600 bg-white">
                          MC
                        </span>
                        <span className="px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-600 bg-white">
                          AMEX
                        </span>
                      </div>
                    </div>

                    {paymentMethod === "card" && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Card number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="0000 0000 0000 0000"
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                            />
                            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM / YY"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">CVC</label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Name on card
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="[Name on card]"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Apple Pay / Google Pay */}
                  <div
                    onClick={() => setPaymentMethod("apple_google")}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between ${paymentMethod === "apple_google"
                      ? "bg-amber-50/40 border-[#FAB10B] ring-2 ring-[#FAB10B]/30"
                      : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "apple_google"
                          ? "border-[#07345B] bg-[#07345B]"
                          : "border-slate-300 bg-white"
                          }`}
                      >
                        {paymentMethod === "apple_google" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FAB10B]" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm text-slate-900">
                          Apple Pay or Google Pay
                        </p>
                        <p className="text-xs text-slate-500">Pay with your phone</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-700 bg-slate-50">
                      PAY
                    </span>
                  </div>

                  {/* Option 3: Afterpay */}
                  <div
                    onClick={() => setPaymentMethod("afterpay")}
                    className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between ${paymentMethod === "afterpay"
                      ? "bg-amber-50/40 border-[#FAB10B] ring-2 ring-[#FAB10B]/30"
                      : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "afterpay"
                          ? "border-[#07345B] bg-[#07345B]"
                          : "border-slate-300 bg-white"
                          }`}
                      >
                        {paymentMethod === "afterpay" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FAB10B]" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm text-slate-900">Afterpay</p>
                        <p className="text-xs text-slate-500">
                          Pay in 4 interest-free instalments of ${(totalAmount / 4).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold text-emerald-700 bg-emerald-50">
                      4x
                    </span>
                  </div>
                </div>

                {/* Section 2: Gift voucher or promo code */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">
                      Gift voucher or promo code
                    </h3>
                    <p className="text-xs text-slate-500">Optional discount code</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code (e.g. EZY10)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/20"
                    />
                    <button
                      type="button"
                      disabled={isApplyingPromo}
                      onClick={handleApplyPromo}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-heading font-bold text-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {isApplyingPromo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>
                  </div>

                  {appliedPromo && (
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Code &quot;{appliedPromo.code}&quot; applied! (-${appliedPromo.discount})</span>
                    </p>
                  )}
                  {promoError && <p className="text-xs text-rose-600 font-medium">{promoError}</p>}
                </div>

                {/* Section 3: Secure Assurance */}
                <div className="rounded-2xl p-4 bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] tracking-wide uppercase shrink-0">
                    Secure
                  </span>
                  <p className="text-xs text-emerald-900">
                    Hassle-free refunds on unused lesson credit. Cancel or reschedule up to 24 hours before each lesson.
                  </p>
                </div>

                {/* Bottom Navigation */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-heading font-bold text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-[#07345B] hover:bg-[#0B1528] text-white font-heading font-black text-sm sm:text-base shadow-lg transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#FAB10B]" />
                        <span>Pay ${totalAmount} and confirm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PAYMENT SUCCESS CONFIRMATION MODAL / VIEW */}
            {/* ============================================================ */}
            {paymentSuccess && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs mb-2">
                    Payment Successful · Confirmed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
                    Your Lesson Booking is Confirmed!
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    We&apos;ve sent your booking confirmation and NSW logbook details to{" "}
                    <strong className="text-slate-800">{learnerEmail}</strong>.
                  </p>
                </div>

                {/* Booking Summary Box */}
                <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Booking Reference</span>
                    <span className="font-heading font-black text-sm text-[#07345B]">
                      {bookingRefNumber}
                    </span>
                  </div>

                  {confirmedBookingData?.receipt_number && (
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Payment Receipt</span>
                      <span className="font-mono font-bold text-xs text-emerald-800">
                        {confirmedBookingData.receipt_number}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Learner</span>
                    <span className="text-xs font-bold text-slate-900">
                      {confirmedBookingData?.student_name || `${learnerFirstName} ${learnerLastName}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Instructor</span>
                    <span className="text-xs font-bold text-slate-900">{selectedInstructor.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Package</span>
                    <span className="text-xs font-bold text-slate-900">
                      {totalHours} Hours ({lessonLengthHours}h sessions)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">First Lesson</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {bookedSlots[0]?.date || "2026-11-24"} ({bookedSlots[0]?.time || "10:00 AM"})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Pick-up Location</span>
                    <span className="text-xs font-bold text-slate-900">
                      {pickupStreet}, {pickupSuburbInput}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                    <span className="text-xs font-heading font-bold text-slate-900">Total Paid</span>
                    <span className="font-heading font-black text-base text-[#07345B]">
                      ${totalAmount}.00 AUD
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#07345B] hover:bg-[#0B1528] text-white font-heading font-bold text-xs shadow-md transition-all"
                  >
                    <span>View in Admin Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#FAB10B]" />
                  </Link>

                  <Link
                    href="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-heading font-bold text-xs transition-colors"
                  >
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* RIGHT 4 COLUMNS: PERSISTENT STICKY SIDEBAR "YOUR BOOKING" */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">Your booking</h3>

              {/* Instructor Mini Card */}
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center font-heading font-black text-slate-800 text-sm">
                  {selectedInstructor.avatar ? (
                    <img
                      src={selectedInstructor.avatar}
                      alt={selectedInstructor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedInstructor.initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-sm sm:text-base text-slate-900 leading-tight">
                    {selectedInstructor.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {selectedInstructor.car.split("(")[0]} · {selectedInstructor.transmission} ·{" "}
                    {selectedInstructor.suburbs[0]}
                  </p>
                </div>
              </div>

              {/* Step 1 placeholder vs Steps 2-5 Pricing Breakdown */}
              {currentStep === 1 ? (
                <div className="py-2">
                  <p className="text-sm text-slate-600 font-medium">
                    Choose your lessons in the next step.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 text-sm sm:text-base">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>{totalHours} hours lesson credit</span>
                    <span className="font-semibold text-slate-900">${rawSubtotal}</span>
                  </div>

                  {bundleDiscount > 0 && (
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>{discountPercent}% bundle discount</span>
                      <span className="font-bold text-slate-900">-${bundleDiscount}</span>
                    </div>
                  )}

                  {includeTestPackage && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Driving test package</span>
                      <span className="font-semibold text-slate-900">$195</span>
                    </div>
                  )}

                  {appliedPromo && (
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>Promo code ({appliedPromo.code})</span>
                      <span className="font-bold text-slate-900">-${appliedPromo.discount}</span>
                    </div>
                  )}

                  {currentStep >= 3 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Lessons booked</span>
                      <span className="font-semibold text-slate-900">
                        {bookedSlots.length} of {totalLessonsCount}
                      </span>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Booking fee</span>
                      <span className="font-semibold text-slate-800">$0 (Free)</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-heading font-extrabold text-base sm:text-lg text-slate-900">Total</span>
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
                      ${totalAmount}
                    </span>
                  </div>
                </div>
              )}

              {/* Trust Badge */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Free rescheduling up to 24 hours before each lesson.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
