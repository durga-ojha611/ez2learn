"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { apiFetch } from "@/lib/api";
import { DEFAULT_BOOKINGS, BookingRowItem } from "@/lib/mockBookings";
import {
  Calendar,
  CalendarCheck2,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  X,
  User,
  Mail,
  Phone,
  Car,
  FileText,
  MapPin,
  CreditCard,
  RotateCcw,
  Edit,
  Trash2,
  Download,
  Package,
  Target,
  Sparkles,
  Check,
  AlertCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Send,
  Smartphone,
  ExternalLink,
  BookOpen,
  Award,
  DollarSign,
  Receipt,
  UserCheck,
  Plus,
} from "lucide-react";

// Safe mapper from DB/API response to BookingRowItem
function mapDbBookingToRowItem(b: any): BookingRowItem {
  const amount = parseFloat(b.amount_aud) || 120.0;
  const discount = parseFloat(b.discount_aud) || 0.0;
  const finalAmount = parseFloat(b.final_amount_aud) || Math.max(0, amount - discount);
  const statusStr = b.booking_status || b.status;
  const status =
    statusStr === "confirmed" || statusStr === "upcoming"
      ? "confirmed"
      : statusStr === "completed"
      ? "completed"
      : statusStr === "cancelled"
      ? "cancelled"
      : "pending";

  const paymentStatus =
    b.payment_status === "paid"
      ? "paid"
      : b.payment_status === "refunded"
      ? "refunded"
      : "pending";

  return {
    id: b.id,
    booking_code: b.booking_code || `BK-${b.id}`,
    student_name: b.student_name || "Unknown Student",
    student_id_str: b.student_code || `STU-${b.student_id}`,
    student_email: b.student_email || "student@ezy2learn.com.au",
    student_phone: b.student_phone || "+61 411 987 654",
    student_address: b.pickup_address,
    student_emergency_contact: b.emergency_contact_name
      ? `${b.emergency_contact_name} (${b.emergency_contact_phone || ""})`
      : "Parent / Guardian",
    student_avatar:
      b.student_avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    student_licence_type:
      b.licence_stage === "learner"
        ? "Learner"
        : b.licence_stage === "full_licence"
        ? "Full"
        : "Provisional",
    student_licence_number: b.licence_number || "NSW-L891023",
    student_licence_status: b.licence_status || "Valid",
    student_logbook_hours: `${b.nsw_logbook_hours || 24} hrs logged`,
    instructor_name: b.instructor_name || "Unassigned",
    instructor_code: b.instructor_code || `INS-${b.instructor_id || "000"}`,
    instructor_phone: b.instructor_phone || "+61 411 223 344",
    instructor_email: b.instructor_email || "instructor@ezy2learn.com.au",
    instructor_avatar:
      b.instructor_avatar ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    instructor_accreditation: b.instructor_accreditation || "RMS-DI-88219",
    assigned_vehicle: `${b.vehicle_make || "Toyota"} ${b.vehicle_model || "Corolla"}`,
    vehicle_rego: b.vehicle_rego || "NSW-REG901",
    transmission: (b.transmission === "manual" || b.transmission === "Manual") ? "Manual" : "Automatic",
    dual_controls_certified: true,
    lesson_type: (b.transmission === "manual" || b.transmission === "Manual") ? "Manual" : "Automatic",
    lesson_package: b.lesson_package || b.service_name || "Standard Lesson",
    lesson_category: b.lesson_category || "Standard Driving",
    number_of_lessons: b.number_of_lessons || 1,
    duration_minutes: b.duration_minutes || 60,
    pickup_location: `${b.pickup_address || "123 Main St"}, ${b.pickup_suburb || "Sydney"} NSW`,
    dropoff_location: b.dropoff_address || (b.pickup_address ? `${b.pickup_address}, ${b.pickup_suburb || "Sydney"} NSW` : "Sydney CBD, NSW"),
    booking_date: b.created_at
      ? new Date(b.created_at).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
      : b.booking_date || "12 Sep 2025",
    booking_time: b.created_at
      ? new Date(b.created_at).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
      : "09:45 AM",
    lesson_date: b.lesson_date
      ? new Date(b.lesson_date).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
      : "15 Sep 2025",
    lesson_time: b.start_time ? b.start_time.substring(0, 5) : "10:00 AM",
    formatted_datetime: `${b.lesson_date || "15 Sep 2025"} · ${b.start_time || "10:00 AM"}`,
    start_time: b.start_time || "10:00 AM",
    status,
    payment_status: paymentStatus,
    payment_method: b.payment_method || "Card",
    amount_aud: amount,
    discount_aud: discount,
    final_amount_aud: finalAmount,
    tax_aud: finalAmount / 11,
    transaction_id: b.transaction_id || `TXN-${b.id}`,
    invoice_number: `INV-2025-${b.id}`,
    invoice_url: `/invoices/INV-2025-${b.id}.pdf`,
    student_notes: b.student_notes || b.special_notes || "Please be on time.",
    special_requirements: b.special_requirements || "None",
    admin_notes: b.admin_notes || "Verified by admin.",
    rescheduling_history: b.rescheduling_history || "0 times",
    initials: (b.student_name || "ST").substring(0, 2).toUpperCase(),
  };
}

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingRowItem[]>(DEFAULT_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<BookingRowItem | null>(null);
  const [isSideWindowOpen, setIsSideWindowOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "upcoming" | "pending" | "completed" | "cancelled"
  >("all");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [lessonTypeFilter, setLessonTypeFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // Dropdown action menus
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  // Reference data for creation modal
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);

  // Create Booking Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const defaultCreateForm = {
    studentMode: "existing" as "existing" | "new",
    studentId: "" as number | "",
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    licenceStage: "learner",
    instructorId: "" as number | "",
    serviceId: 1 as number | "",
    serviceName: "Automatic Driving Lesson",
    transmission: "automatic" as "automatic" | "manual",
    lessonDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    startTime: "10:00",
    durationMinutes: 60,
    pickupAddress: "123 George St",
    pickupSuburb: "Parramatta",
    pickupPostcode: "2150",
    dropoffAddress: "",
    dropoffSameAsPickup: true,
    amountAud: 75.0,
    discountAud: 0.0,
    paymentStatus: "paid" as "paid" | "pending",
    paymentMethod: "Credit Card",
    studentNotes: "",
    specialRequirements: "",
    adminNotes: "",
  };

  const [createForm, setCreateForm] = useState(defaultCreateForm);

  // Fetch live bookings from MySQL Backend API
  const loadBookings = async () => {
    try {
      const res = await apiFetch("/api/bookings");
      if (res?.data && Array.isArray(res.data)) {
        const dbItems: BookingRowItem[] = res.data.map(mapDbBookingToRowItem);
        setBookings(dbItems);
      }
    } catch (err) {
      console.warn("Could not fetch database bookings:", err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Fetch reference lists (instructors, students, services) for Create Booking
  useEffect(() => {
    let isMounted = true;
    async function loadReferenceData() {
      try {
        const [instRes, stuRes, srvRes] = await Promise.all([
          apiFetch("/api/instructors?limit=100"),
          apiFetch("/api/students?limit=100"),
          apiFetch("/api/services"),
        ]);
        if (isMounted) {
          if (instRes?.data && Array.isArray(instRes.data)) {
            setInstructorsList(instRes.data);
          }
          if (stuRes?.data && Array.isArray(stuRes.data)) {
            setStudentsList(stuRes.data);
            if (stuRes.data.length > 0) {
              const firstStu = stuRes.data[0];
              setCreateForm((prev) => ({
                ...prev,
                studentId: firstStu.id,
                studentName: firstStu.name,
                studentEmail: firstStu.email,
                studentPhone: firstStu.phone,
                pickupAddress: firstStu.address || prev.pickupAddress,
                pickupSuburb: firstStu.suburb || prev.pickupSuburb,
                pickupPostcode: firstStu.postcode || prev.pickupPostcode,
                transmission: firstStu.preferred_transmission === "manual" ? "manual" : "automatic",
              }));
            }
          }
          if (srvRes?.data?.services && Array.isArray(srvRes.data.services)) {
            setServicesList(srvRes.data.services);
          }
        }
      } catch (err) {
        console.warn("Could not load instructors/students for booking creation:", err);
      }
    }
    loadReferenceData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStudentSelect = (idStr: string) => {
    const sId = Number(idStr);
    const stu = studentsList.find((s) => s.id === sId);
    if (stu) {
      setCreateForm((prev) => ({
        ...prev,
        studentId: sId,
        studentName: stu.name,
        studentEmail: stu.email,
        studentPhone: stu.phone,
        pickupAddress: stu.address || prev.pickupAddress,
        pickupSuburb: stu.suburb || prev.pickupSuburb,
        pickupPostcode: stu.postcode || prev.pickupPostcode,
        transmission: stu.preferred_transmission === "manual" ? "manual" : "automatic",
      }));
    } else {
      setCreateForm((prev) => ({ ...prev, studentId: sId }));
    }
  };

  const handleServiceSelect = (idStr: string) => {
    const srvId = Number(idStr);
    const srv = servicesList.find((s) => s.id === srvId);
    if (srv) {
      const transmission = srv.transmission === "manual" ? "manual" : "automatic";
      setCreateForm((prev) => ({
        ...prev,
        serviceId: srvId,
        serviceName: srv.name,
        durationMinutes: srv.duration_minutes || 60,
        amountAud: parseFloat(srv.price_aud) || 75.0,
        transmission: srv.transmission === "both" ? prev.transmission : transmission,
      }));
    }
  };

  const handleInstructorSelect = (idStr: string) => {
    const instId = idStr ? Number(idStr) : "";
    const inst = instructorsList.find((i) => i.id === instId);
    setCreateForm((prev) => ({
      ...prev,
      instructorId: instId,
      transmission:
        inst?.transmission === "manual"
          ? "manual"
          : inst?.transmission === "automatic"
          ? "automatic"
          : prev.transmission,
    }));
  };

  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      if (createForm.studentMode === "existing" && !createForm.studentId) {
        showToast("Please select a student from the list.");
        setCreateSubmitting(false);
        return;
      }
      if (createForm.studentMode === "new") {
        if (!createForm.studentName.trim() || !createForm.studentEmail.trim()) {
          showToast("Please enter learner name and email.");
          setCreateSubmitting(false);
          return;
        }
      }
      if (!createForm.pickupAddress.trim() || !createForm.pickupSuburb.trim()) {
        showToast("Please provide pickup address and suburb.");
        setCreateSubmitting(false);
        return;
      }

      const payload = {
        student_id: createForm.studentMode === "existing" ? Number(createForm.studentId) : null,
        student_name: createForm.studentName.trim(),
        student_email: createForm.studentEmail.trim(),
        student_phone: createForm.studentPhone.trim(),
        licence_stage: createForm.licenceStage,
        instructor_id: createForm.instructorId ? Number(createForm.instructorId) : null,
        service_id: createForm.serviceId ? Number(createForm.serviceId) : null,
        transmission: createForm.transmission,
        lesson_package: createForm.serviceName,
        lesson_date: createForm.lessonDate,
        start_time: createForm.startTime,
        duration_minutes: Number(createForm.durationMinutes),
        pickup_address: createForm.pickupAddress.trim(),
        pickup_suburb: createForm.pickupSuburb.trim(),
        pickup_postcode: createForm.pickupPostcode.trim(),
        dropoff_address: createForm.dropoffSameAsPickup
          ? createForm.pickupAddress.trim()
          : createForm.dropoffAddress.trim() || createForm.pickupAddress.trim(),
        amount_aud: Number(createForm.amountAud),
        discount_aud: Number(createForm.discountAud || 0),
        final_amount_aud: Math.max(0, Number(createForm.amountAud) - Number(createForm.discountAud || 0)),
        payment_status: createForm.paymentStatus,
        payment_method: createForm.paymentMethod,
        student_notes: createForm.studentNotes.trim(),
        special_requirements: createForm.specialRequirements.trim(),
        admin_notes: createForm.adminNotes.trim() || "Created by Admin via Bookings Dashboard",
      };

      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res?.success && res.data) {
        const newBooking = mapDbBookingToRowItem(res.data);
        setBookings((prev) => [newBooking, ...prev]);
        setSelectedBooking(newBooking);
        setIsSideWindowOpen(true);
        setShowCreateModal(false);
        showToast(`Booking ${newBooking.booking_code} created successfully!`);
        setCreateForm(defaultCreateForm);
      } else {
        showToast(res?.message || "Failed to create booking.");
      }
    } catch (err: any) {
      console.error("Create booking error:", err);
      showToast(err?.message || "Failed to create booking. Please try again.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Form states for modals
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPickup, setEditPickup] = useState("");
  const [messageChannel, setMessageChannel] = useState<"sms" | "email">("sms");
  const [messageText, setMessageText] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic KPI Stats from live bookings state
  const kpiStats = useMemo(() => {
    return {
      total: bookings.length,
      upcoming: bookings.filter((b) => b.status === "confirmed" || b.status === "upcoming").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  // Filter Bookings logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (activeTab === "upcoming" && b.status !== "confirmed" && b.status !== "upcoming")
        return false;
      if (activeTab === "pending" && b.status !== "pending") return false;
      if (activeTab === "completed" && b.status !== "completed") return false;
      if (activeTab === "cancelled" && b.status !== "cancelled") return false;

      // Dropdown Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "confirmed" && b.status !== "confirmed" && b.status !== "upcoming")
          return false;
        if (statusFilter !== "confirmed" && b.status !== statusFilter) return false;
      }

      // Payment Status filter
      if (paymentFilter !== "all" && b.payment_status !== paymentFilter) return false;

      // Lesson Type filter
      if (lessonTypeFilter !== "all" && b.lesson_type.toLowerCase() !== lessonTypeFilter.toLowerCase())
        return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          b.booking_code.toLowerCase().includes(q) ||
          b.student_name.toLowerCase().includes(q) ||
          b.instructor_name.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    bookings,
    activeTab,
    statusFilter,
    paymentFilter,
    lessonTypeFilter,
    searchQuery,
  ]);

  // Click handler on any element/row in the booking list
  const handleSelectBooking = (item: BookingRowItem) => {
    setSelectedBooking(item);
    setIsSideWindowOpen(true);
  };

  const handleCloseSideWindow = () => {
    setIsSideWindowOpen(false);
  };

  const handleMarkCompleted = async (bId: number) => {
    try {
      await apiFetch(`/api/bookings/${bId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed", comment: "Marked completed by admin" }),
      });
      loadBookings();
      showToast(`Booking marked as Completed!`);
    } catch (err: any) {
      showToast(err.message || "Failed to complete booking");
    }
  };

  const handleProcessRefund = async (bId: number) => {
    try {
      await apiFetch(`/api/bookings/${bId}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason: "Admin requested refund" }),
      });
      loadBookings();
      showToast(`Refund processed for Booking!`);
    } catch (err: any) {
      showToast(err.message || "Failed to process refund");
    }
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      alert("Please select both a date and time to reschedule.");
      return;
    }
    if (!selectedBooking) return;
    try {
      await apiFetch(`/api/bookings/${selectedBooking.id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify({
          new_date: rescheduleDate,
          new_start_time: rescheduleTime,
          reason: "Admin rescheduled",
        }),
      });
      loadBookings();
      setShowRescheduleModal(false);
      showToast(`Lesson rescheduled to ${rescheduleDate} at ${rescheduleTime}!`);
    } catch (err: any) {
      showToast(err.message || "Failed to reschedule booking");
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      await apiFetch(`/api/bookings/${selectedBooking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "cancelled",
          comment: cancelReason || "Cancelled by admin request",
        }),
      });
      loadBookings();
      setShowCancelModal(false);
      setCancelReason("");
      showToast(`Booking #${selectedBooking.booking_code} cancelled in database.`);
    } catch (err: any) {
      showToast(err.message || "Failed to cancel booking");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedBooking) return;
    try {
      await apiFetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PUT",
        body: JSON.stringify({
          pickup_address: editPickup || selectedBooking.pickup_location,
          special_notes: editNotes || selectedBooking.student_notes,
        }),
      });
      loadBookings();
      setShowEditModal(false);
      showToast("Booking details updated successfully in database!");
    } catch (err: any) {
      showToast(err.message || "Failed to update booking");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setShowMessageModal(false);
    setMessageText("");
    showToast(`Message sent to ${selectedBooking?.student_name} via ${messageChannel.toUpperCase()}!`);
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
          icon={CalendarCheck2}
          title="Bookings Management"
          subtitle="Manage scheduled lessons, practical test packages, and student attendances"
          badge={`${kpiStats.total || bookings.length} Bookings`}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/bookings/create")}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0B1528] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#FAB10B]" />
                <span>Create Booking</span>
              </button>
            </div>
          }
        />

        {/* 5 KPI Cards matching Reference Mockup */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Bookings */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {kpiStats.total}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Total Bookings
              </div>
            </div>
          </div>

          {/* Card 2: Upcoming */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#FEF08A] flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-5 h-5 text-amber-900 stroke-[2.4]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {kpiStats.upcoming}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Upcoming
              </div>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <Hourglass className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {kpiStats.pending}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Pending
              </div>
            </div>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {kpiStats.completed}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Completed
              </div>
            </div>
          </div>

          {/* Card 5: Cancelled */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 transition-all hover:shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 shadow-2xs">
              <XCircle className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {kpiStats.cancelled}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Cancelled
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
              placeholder="Search by Booking ID or Student Name..."
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
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status Dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Lesson Type Dropdown */}
          <select
            value={lessonTypeFilter}
            onChange={(e) => setLessonTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">All Lesson Type</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>

          {/* Date Range Dropdown */}
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-3 py-2 bg-white text-xs text-slate-700 font-medium rounded-xl border border-slate-200/80 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 outline-hidden cursor-pointer"
          >
            <option value="all">📅 Date Range</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>

          {/* Yellow Filter Button */}
          <button
            onClick={() => showToast("Filters applied successfully!")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAB10B] hover:bg-[#e09e07] active:bg-[#c98e05] text-slate-900 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-900" />
            <span>Filter</span>
          </button>
        </div>

        {/* Status Tabs Pills */}
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
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "upcoming"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Upcoming ({kpiStats.upcoming})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "pending"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Pending ({kpiStats.pending})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Completed ({kpiStats.completed})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "cancelled"
                ? "bg-[#0B1528] text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90"
            }`}
          >
            Cancelled ({kpiStats.cancelled})
          </button>
        </div>

        {/* Main Bookings Table Container (Full width, clicking any element opens side window) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5">Booking ID</th>
                  <th className="py-3 px-3.5">Student</th>
                  <th className="py-3 px-3.5">Instructor</th>
                  <th className="py-3 px-3.5">Lesson Type</th>
                  <th className="py-3 px-3.5">Date & Time</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Payment</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      No bookings found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isSelected =
                      isSideWindowOpen && selectedBooking?.id === b.id;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => handleSelectBooking(b)}
                        title="Click to view deep booking details"
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-amber-50/60 font-medium"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Booking ID */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <span
                            className={`font-bold transition-colors ${
                              isSelected
                                ? "text-[#0B1528] underline underline-offset-4 decoration-[#FAB10B] decoration-2"
                                : "text-slate-900 group-hover:text-blue-900"
                            }`}
                          >
                            {b.booking_code}
                          </span>
                        </td>

                        {/* Student */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                b.student_avatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                              }
                              alt={b.student_name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <span className="font-semibold text-slate-800 truncate">
                              {b.student_name}
                            </span>
                          </div>
                        </td>

                        {/* Instructor */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                b.instructor_avatar ||
                                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                              }
                              alt={b.instructor_name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <span className="font-medium text-slate-800 truncate">
                              {b.instructor_name}
                            </span>
                          </div>
                        </td>

                        {/* Lesson Type */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600 font-medium">
                          {b.lesson_type}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 leading-tight">
                            {b.lesson_date}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {b.lesson_time || b.start_time || "10:00 AM"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          {b.status === "confirmed" || b.status === "upcoming" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Confirmed
                            </span>
                          ) : b.status === "pending" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending
                            </span>
                          ) : b.status === "completed" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Cancelled
                            </span>
                          )}
                        </td>

                        {/* Payment */}
                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          {b.payment_status === "paid" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Paid
                            </span>
                          ) : b.payment_status === "pending" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              Refunded
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
                              onClick={() => handleSelectBooking(b)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                            >
                              View
                            </button>

                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenActionMenuId(
                                    openActionMenuId === b.id ? null : b.id
                                  )
                                }
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openActionMenuId === b.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-30 text-left">
                                  <button
                                    onClick={() => {
                                      handleSelectBooking(b);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Deep Details</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setEditNotes(b.admin_notes);
                                      setEditPickup(b.pickup_location);
                                      setShowEditModal(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit Booking</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setRescheduleDate(b.lesson_date);
                                      setRescheduleTime(b.lesson_time || "10:00 AM");
                                      setShowRescheduleModal(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Reschedule</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleMarkCompleted(b.id);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Mark Completed</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setShowCancelModal(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Cancel Booking</span>
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
              Showing 1 to {filteredBookings.length} of 245 bookings
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
                31
              </button>
              <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SIDE WINDOW: Shows deep detail information when clicking any element */}
        {/* ============================================================ */}
        {isSideWindowOpen && selectedBooking && (
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
                      <CalendarCheck2 className="w-5 h-5 text-[#FAB10B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-black text-base sm:text-lg tracking-wide text-white">
                          Booking Details
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAB10B] text-slate-900 font-mono font-bold text-xs">
                          {selectedBooking.booking_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Deep overview, schedule, student profile & telemetry
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/bookings/${selectedBooking.id}`}
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
                      {selectedBooking.booking_code}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      Booked on: {selectedBooking.booking_date} •{" "}
                      {selectedBooking.booking_time || "09:45 AM"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedBooking.status === "confirmed" ||
                    selectedBooking.status === "upcoming" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Confirmed
                      </span>
                    ) : selectedBooking.status === "pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    ) : selectedBooking.status === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Scrollable Content Body: Bold, Unified Single View (No Sub-Tabs) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Row 1: Student Information & Instructor Information (2-col grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Student Information Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                      <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="tracking-tight">Student Information</span>
                        <span className="text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md font-mono text-slate-700 font-bold">
                          {selectedBooking.student_id_str}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={
                            selectedBooking.student_avatar ||
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                          }
                          alt={selectedBooking.student_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-xs"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {selectedBooking.student_name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-slate-500 block">
                            {selectedBooking.student_id_str}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700 truncate font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{selectedBooking.student_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedBooking.student_phone}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-slate-700 font-semibold">
                          <span className="text-slate-500 font-normal">Licence Type:</span>
                          <span className="font-bold text-slate-900">{selectedBooking.student_licence_type}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 font-semibold">
                          <span className="text-slate-500 font-normal">Licence Status:</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Valid
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instructor Information Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                      <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="tracking-tight">Instructor Information</span>
                        <span className="text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-md font-mono text-slate-700 font-bold">
                          {selectedBooking.instructor_code}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={
                            selectedBooking.instructor_avatar ||
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                          }
                          alt={selectedBooking.instructor_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shrink-0 shadow-xs"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {selectedBooking.instructor_name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-slate-500 block">
                            {selectedBooking.instructor_code}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedBooking.instructor_phone}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-slate-700 font-semibold">
                          <span className="text-slate-500 font-normal">Vehicle:</span>
                          <span className="font-bold text-slate-900">{selectedBooking.assigned_vehicle}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 font-semibold">
                          <span className="text-slate-500 font-normal">Transmission:</span>
                          <span className="font-bold text-slate-900">{selectedBooking.transmission}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Lesson Information & Booking Information (2-col grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Lesson Information Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                      <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>Lesson Information</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-medium">Lesson Type:</span>
                          <span className="font-bold text-slate-900 ml-auto">{selectedBooking.lesson_type}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-800">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-medium">Package:</span>
                          <span className="font-bold text-slate-900 ml-auto">{selectedBooking.lesson_package}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-800">
                          <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-medium">Category:</span>
                          <span className="font-bold text-slate-900 ml-auto">{selectedBooking.lesson_category}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-medium">Number of Lessons:</span>
                          <span className="font-bold text-slate-900 ml-auto">1</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">
                              <strong className="text-slate-900">Pickup:</strong> {selectedBooking.pickup_location}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">
                              <strong className="text-slate-900">Drop-off:</strong> {selectedBooking.dropoff_location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Information Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                      <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FAB10B]" />
                        <span>Booking Information</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-medium">Booking Date:</span>
                          <span className="font-bold text-slate-900 ml-auto">{selectedBooking.booking_date}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-800">
                          <CalendarCheck2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-medium">Lesson Date:</span>
                          <span className="font-bold text-slate-900 ml-auto">{selectedBooking.lesson_date}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-medium">Lesson Time:</span>
                          <span className="font-black text-slate-900 ml-auto">
                            {selectedBooking.lesson_time || selectedBooking.start_time || "10:00 AM"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-slate-500 font-medium">Status:</span>
                          <span className="font-bold text-emerald-600 capitalize ml-auto">
                            {selectedBooking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Payment Information Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                    <div className="text-xs font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#FAB10B]" />
                        <span>Payment Information</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">
                        {selectedBooking.invoice_number}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Left: Financial Amounts */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-700 font-medium">
                          <span className="text-slate-500">Total Amount:</span>
                          <span className="font-bold text-slate-900">${Number(selectedBooking.amount_aud ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-700 font-medium">
                          <span className="text-slate-500">Discount:</span>
                          <span className="text-slate-700 font-semibold">${Number(selectedBooking.discount_aud ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-sm text-slate-900">
                          <span>Final Amount:</span>
                          <span className="text-slate-900">${Number(selectedBooking.final_amount_aud ?? 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Right: Payment Method & Status & Button */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-slate-700">
                          <span className="text-slate-500 font-medium">Payment Method:</span>
                          <strong className="text-slate-900 font-bold">{selectedBooking.payment_method}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Payment Status:</span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Paid
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500">
                          <span>Transaction ID:</span>
                          <span className="font-mono font-bold text-slate-800">{selectedBooking.transaction_id}</span>
                        </div>

                        <button
                          onClick={() => setShowInvoiceModal(true)}
                          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-700" />
                          <span>View Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Additional Information Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                      <FileText className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Additional Information</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium">Student Notes:</span>
                        <span className="font-bold text-slate-900 ml-auto">
                          {selectedBooking.student_notes || "Please be on time."}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium">Special Requirements:</span>
                        <span className="font-bold text-slate-900 ml-auto">
                          {selectedBooking.special_requirements || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium">Admin Notes:</span>
                        <span className="font-bold text-slate-900 ml-auto">
                          {selectedBooking.admin_notes || "Great student!"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-medium">Rescheduling History:</span>
                        <span className="font-bold text-slate-900 ml-auto">
                          {selectedBooking.rescheduling_history || "1 time"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Pinned Admin Actions Bar */}
                <div className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5">
                  <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Admin Actions</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {selectedBooking.booking_code}
                    </span>
                  </div>

                  {/* Row 1: Edit, Reschedule, Cancel */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setEditNotes(selectedBooking.admin_notes);
                        setEditPickup(selectedBooking.pickup_location);
                        setShowEditModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#FAB10B]" />
                      <span>Edit Booking</span>
                    </button>

                    <button
                      onClick={() => {
                        setRescheduleDate(selectedBooking.lesson_date);
                        setRescheduleTime(
                          selectedBooking.lesson_time || "10:00 AM"
                        );
                        setShowRescheduleModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Cancel Booking</span>
                    </button>
                  </div>

                  {/* Row 2: Mark Completed, Process Refund */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleMarkCompleted(selectedBooking.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      <span>Mark Completed</span>
                    </button>

                    <button
                      onClick={() => handleProcessRefund(selectedBooking.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Process Refund</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: View Invoice Modal */}
        {showInvoiceModal && selectedBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Tax Invoice
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedBooking.invoice_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Student:</span>
                  <strong className="text-slate-900">
                    {selectedBooking.student_name} ({selectedBooking.student_id_str})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Booking Code:</span>
                  <strong className="text-slate-900">
                    {selectedBooking.booking_code}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="text-slate-800 font-medium">
                    {selectedBooking.lesson_package}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lesson Date & Time:</span>
                  <span className="text-slate-800">
                    {selectedBooking.lesson_date} at {selectedBooking.lesson_time || "10:00 AM"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="text-slate-800 font-medium">
                    {selectedBooking.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-slate-700">
                    {selectedBooking.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Includes GST (10%):</span>
                  <span>${Number(selectedBooking.tax_aud ?? (Number(selectedBooking.final_amount_aud || 0) / 11)).toFixed(2)} AUD</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span>${Number(selectedBooking.final_amount_aud ?? 0).toFixed(2)} AUD</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => {
                    showToast("Tax invoice downloaded!");
                    setShowInvoiceModal(false);
                  }}
                  className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#FAB10B]" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Reschedule Modal */}
        {showRescheduleModal && selectedBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Reschedule Lesson
                  </h3>
                </div>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select New Time Slot
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-amber-400 bg-white"
                  >
                    <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:30 AM">11:30 AM - 12:30 PM</option>
                    <option value="01:00 PM">01:00 PM - 02:00 PM</option>
                    <option value="02:30 PM">02:30 PM - 03:30 PM</option>
                    <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReschedule}
                  className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Edit Booking Modal */}
        {showEditModal && selectedBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAB10B]/20 flex items-center justify-center">
                    <Edit className="w-4 h-4 text-amber-700" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Edit Booking #{selectedBooking.booking_code}
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Pickup Location Address
                  </label>
                  <input
                    type="text"
                    value={editPickup}
                    onChange={(e) => setEditPickup(e.target.value)}
                    placeholder="e.g. 123 Main St, Sydney"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Admin & Internal Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter any internal instructor or admin notes..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[#0B1528] hover:bg-[#162744] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4: Cancel Booking Confirmation */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Cancel Booking #{selectedBooking.booking_code}?
                  </h3>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to cancel this booking for student{" "}
                <strong>{selectedBooking.student_name}</strong>?
              </p>

              <div className="text-xs">
                <label className="block text-slate-700 font-semibold mb-1">
                  Cancellation Reason
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Student requested cancellation due to personal reasons"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 5: Send Notification Modal */}
        {showMessageModal && selectedBooking && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Send className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Send Notification
                    </h3>
                    <p className="text-xs text-slate-500">
                      To: {selectedBooking.student_name} ({selectedBooking.student_phone})
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
                      <span>SMS</span>
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
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
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
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 6: Create Booking Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1528] flex items-center justify-center text-white shadow-2xs">
                    <Calendar className="w-5 h-5 text-[#FAB10B]" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-lg text-slate-900 tracking-tight">
                      Create New Booking
                    </h2>
                    <p className="text-xs text-slate-500">
                      Schedule a driving lesson and register directly in the database
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleCreateBookingSubmit}
                className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700"
              >
                {/* 1. Student / Learner Selection */}
                <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-slate-200/80 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0B1528] text-[#FAB10B] flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Learner Information
                      </h3>
                    </div>

                    <div className="bg-slate-200/70 p-1 rounded-xl flex items-center self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setCreateForm((prev) => ({
                            ...prev,
                            studentMode: "existing",
                          }))
                        }
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                          createForm.studentMode === "existing"
                            ? "bg-[#0B1528] text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Existing Learner
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCreateForm((prev) => ({
                            ...prev,
                            studentMode: "new",
                            studentId: "",
                          }))
                        }
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                          createForm.studentMode === "new"
                            ? "bg-[#0B1528] text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        + New Learner
                      </button>
                    </div>
                  </div>

                  {createForm.studentMode === "existing" ? (
                    <div className="space-y-2.5">
                      <label className="block text-slate-700 font-bold">
                        Select Registered Student *
                      </label>
                      <select
                        value={createForm.studentId}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 transition cursor-pointer"
                      >
                        <option value="">-- Choose student from database --</option>
                        {studentsList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.student_code || `STU-${s.id}`}) • {s.phone || s.email} • {s.suburb || "Sydney"}
                          </option>
                        ))}
                      </select>

                      {createForm.studentId && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0B1528] text-[#FAB10B] flex items-center justify-center font-bold text-xs">
                              {createForm.studentName.substring(0, 2).toUpperCase() || "ST"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {createForm.studentName}
                              </div>
                              <div className="text-slate-500 text-[11px]">
                                {createForm.studentEmail} • {createForm.studentPhone}
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-amber-100/80 text-amber-900 rounded-lg font-bold text-[10px] uppercase tracking-wide">
                            {createForm.licenceStage.replace("_", " ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={createForm.studentName}
                          onChange={(e) =>
                            setCreateForm((prev) => ({
                              ...prev,
                              studentName: e.target.value,
                            }))
                          }
                          placeholder="e.g. Marcus Vance"
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={createForm.studentEmail}
                          onChange={(e) =>
                            setCreateForm((prev) => ({
                              ...prev,
                              studentEmail: e.target.value,
                            }))
                          }
                          placeholder="marcus.v@example.com"
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={createForm.studentPhone}
                          onChange={(e) =>
                            setCreateForm((prev) => ({
                              ...prev,
                              studentPhone: e.target.value,
                            }))
                          }
                          placeholder="+61 412 345 678"
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Licence Stage
                        </label>
                        <select
                          value={createForm.licenceStage}
                          onChange={(e) =>
                            setCreateForm((prev) => ({
                              ...prev,
                              licenceStage: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 cursor-pointer"
                        >
                          <option value="learner">Learner Licence (L-Plates)</option>
                          <option value="provisional_p1">Provisional P1 (Red P)</option>
                          <option value="provisional_p2">Provisional P2 (Green P)</option>
                          <option value="full_licence">Full Australian Licence</option>
                          <option value="overseas_conversion">Overseas Conversion</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Lesson Package & Transmission */}
                <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B1528] text-[#FAB10B] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Lesson Package & Vehicle
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Service / Lesson Package *
                      </label>
                      <select
                        value={createForm.serviceId}
                        onChange={(e) => handleServiceSelect(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 cursor-pointer"
                      >
                        {servicesList.length > 0 ? (
                          servicesList.map((srv) => (
                            <option key={srv.id} value={srv.id}>
                              {srv.name} ({srv.duration_minutes}m) — ${parseFloat(srv.price_aud).toFixed(2)} AUD
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="1">Automatic Driving Lesson (60 mins) — $75.00</option>
                            <option value="2">Manual Driving Lesson (60 mins) — $85.00</option>
                            <option value="3">Driving Test Preparation & Mock (120 mins) — $150.00</option>
                            <option value="4">Test Day Car Hire Package (150 mins) — $199.00</option>
                            <option value="5">Refresher Driving Lesson (60 mins) — $80.00</option>
                            <option value="6">Overseas Licence Conversion (90 mins) — $120.00</option>
                            <option value="8">Defensive Road Skills (90 mins) — $125.00</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Transmission Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCreateForm((prev) => ({
                              ...prev,
                              transmission: "automatic",
                            }))
                          }
                          className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                            createForm.transmission === "automatic"
                              ? "bg-[#0B1528] text-white border-[#0B1528] shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70"
                          }`}
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>Automatic</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCreateForm((prev) => ({
                              ...prev,
                              transmission: "manual",
                            }))
                          }
                          className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                            createForm.transmission === "manual"
                              ? "bg-[#0B1528] text-white border-[#0B1528] shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70"
                          }`}
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>Manual</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[60, 90, 120, 150].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() =>
                          setCreateForm((prev) => ({
                            ...prev,
                            durationMinutes: dur,
                          }))
                        }
                        className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer ${
                          createForm.durationMinutes === dur
                            ? "bg-[#FAB10B] text-slate-950 border-[#FAB10B] shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/60"
                        }`}
                      >
                        {dur} Minutes
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Schedule & Instructor Assignment */}
                <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B1528] text-[#FAB10B] flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Schedule & Instructor
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Lesson Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={createForm.lessonDate}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            lessonDate: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 cursor-pointer"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={createForm.startTime}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Preset quick time slots */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">
                      Quick Slots:
                    </span>
                    {["08:30", "10:00", "11:30", "13:30", "15:00", "16:30"].map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setCreateForm((prev) => ({ ...prev, startTime: t }))
                          }
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                            createForm.startTime === t
                              ? "bg-[#0B1528] text-[#FAB10B] border-[#0B1528]"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {t}
                        </button>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Assigned Instructor (Optional / Auto-match)
                    </label>
                    <select
                      value={createForm.instructorId}
                      onChange={(e) => handleInstructorSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 cursor-pointer"
                    >
                      <option value="">
                        -- Unassigned / Pending Instructor Assignment --
                      </option>
                      {instructorsList.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} • {inst.transmission.toUpperCase()} • {inst.vehicle_make} {inst.vehicle_model} ({inst.vehicle_rego || "Active"}) • {inst.rating}★
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Pickup & Dropoff Address */}
                <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B1528] text-[#FAB10B] flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Locations
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-slate-700 font-bold mb-1">
                        Pickup Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.pickupAddress}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            pickupAddress: e.target.value,
                          }))
                        }
                        placeholder="e.g. 45 Parramatta Rd"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Suburb *
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.pickupSuburb}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            pickupSuburb: e.target.value,
                          }))
                        }
                        placeholder="Parramatta"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.pickupPostcode}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            pickupPostcode: e.target.value,
                          }))
                        }
                        placeholder="2150"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    </div>
                  </div>

                  <div className="pt-1 space-y-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createForm.dropoffSameAsPickup}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            dropoffSameAsPickup: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded text-[#0B1528] focus:ring-amber-400 border-slate-300"
                      />
                      <span className="font-semibold text-slate-700">
                        Drop-off at the same location as pickup
                      </span>
                    </label>

                    {!createForm.dropoffSameAsPickup && (
                      <input
                        type="text"
                        value={createForm.dropoffAddress}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            dropoffAddress: e.target.value,
                          }))
                        }
                        placeholder="e.g. Parramatta Railway Station, NSW 2150"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    )}
                  </div>
                </div>

                {/* 5. Pricing & Payment */}
                <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B1528] text-[#FAB10B] flex items-center justify-center font-bold text-xs">
                      5
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Pricing & Payment
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Amount ($ AUD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={createForm.amountAud}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            amountAud: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Discount ($ AUD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={createForm.discountAud}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            discountAud: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Payment Status
                      </label>
                      <select
                        value={createForm.paymentStatus}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            paymentStatus: e.target.value as "paid" | "pending",
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 cursor-pointer"
                      >
                        <option value="paid">Paid (Mark Received)</option>
                        <option value="pending">Pending (Unpaid)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Payment Method
                      </label>
                      <select
                        value={createForm.paymentMethod}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30 cursor-pointer"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash to Instructor</option>
                        <option value="Stripe">Stripe Checkout</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 6. Special Requirements & Notes */}
                <div className="bg-slate-50/80 rounded-2xl p-4.5 border border-slate-200/80 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B1528] text-[#FAB10B] flex items-center justify-center font-bold text-xs">
                      6
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Notes & Requirements
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Student / Lesson Notes
                      </label>
                      <textarea
                        rows={2}
                        value={createForm.studentNotes}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            studentNotes: e.target.value,
                          }))
                        }
                        placeholder="e.g. Nervous driver, first time on motorway..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Special Requirements
                      </label>
                      <textarea
                        rows={2}
                        value={createForm.specialRequirements}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            specialRequirements: e.target.value,
                          }))
                        }
                        placeholder="e.g. Dual-control vehicle required, English or Hindi speaker..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer (inside form for native enter submit) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-600">
                    Net Charge:{" "}
                    <span className="font-black text-slate-950 text-sm">
                      ${Math.max(
                        0,
                        Number(createForm.amountAud) -
                          Number(createForm.discountAud || 0)
                      ).toFixed(2)}{" "}
                      AUD
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createSubmitting}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-[#0B1528] hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {createSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Live Booking...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-[#FAB10B]" />
                          <span>Create Booking</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
