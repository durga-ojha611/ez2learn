"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { Modal } from "@/components/common/Modal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiFetch } from "@/lib/api";
import {
  Inbox,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ExternalLink,
  ChevronDown,
  UserCheck,
  ArrowRight,
  Filter,
  RefreshCw,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export interface InquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  suburb: string;
  lesson_type: string;
  message: string;
  status: "new" | "contacted" | "converted" | "closed";
  preferred_date?: string;
  preferred_time?: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export default function InquiriesPage() {
  const router = useRouter();

  // State
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
    closed: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lessonTypeFilter, setLessonTypeFilter] = useState<string>("all");

  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InquiryItem | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Notes state inside modal
  const [modalNotes, setModalNotes] = useState("");
  const [modalStatus, setModalStatus] = useState<"new" | "contacted" | "converted" | "closed">("new");
  const [modalAssignedTo, setModalAssignedTo] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // New Inquiry Form State
  const [newForm, setNewForm] = useState({
    name: "",
    email: "",
    phone: "",
    suburb: "Parramatta",
    lesson_type: "Automatic Driving Lessons",
    message: "",
    preferred_date: "",
    preferred_time: "Morning 9:00 AM",
    assigned_to: "Kevin O'Connor",
  });
  const [submittingNew, setSubmittingNew] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/inquiries");
      if (res.success && res.data) {
        setInquiries(res.data.inquiries || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn("Could not load inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal and prepopulate
  const handleOpenDetailModal = (inq: InquiryItem) => {
    setSelectedInquiry(inq);
    setModalNotes(inq.notes || "");
    setModalStatus(inq.status);
    setModalAssignedTo(inq.assigned_to || "Kevin O'Connor");
  };

  // Quick Status change from table
  const handleQuickStatusChange = async (
    id: number,
    newStatus: "new" | "contacted" | "converted" | "closed"
  ) => {
    try {
      await apiFetch(`/api/inquiries/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      showToast(`Inquiry status updated to ${newStatus}`);
      loadInquiries();
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Save changes inside modal
  const handleSaveModalDetails = async () => {
    if (!selectedInquiry) return;
    try {
      setSavingNotes(true);
      await apiFetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: modalStatus,
          notes: modalNotes,
          assigned_to: modalAssignedTo,
        }),
      });
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === selectedInquiry.id
            ? {
                ...item,
                status: modalStatus,
                notes: modalNotes,
                assigned_to: modalAssignedTo,
              }
            : item
        )
      );
      showToast("Inquiry details saved successfully");
      setSelectedInquiry(null);
      loadInquiries();
    } catch (err: any) {
      showToast(err.message || "Failed to update inquiry", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  // Delete
  const handleDeleteInquiry = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/inquiries/${deleteTarget.id}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast("Inquiry deleted successfully");
      setDeleteTarget(null);
      loadInquiries();
    } catch (err: any) {
      showToast(err.message || "Failed to delete inquiry", "error");
    }
  };

  // Submit new manual inquiry
  const handleCreateNewInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.email.trim() || !newForm.phone.trim()) {
      showToast("Please fill in student name, email, and phone.", "error");
      return;
    }

    try {
      setSubmittingNew(true);
      const res = await apiFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({ ...newForm, status: "new" }),
      });
      if (res.success) {
        showToast("New inquiry logged successfully");
        setIsAddModalOpen(false);
        setNewForm({
          name: "",
          email: "",
          phone: "",
          suburb: "Parramatta",
          lesson_type: "Automatic Driving Lessons",
          message: "",
          preferred_date: "",
          preferred_time: "Morning 9:00 AM",
          assigned_to: "Kevin O'Connor",
        });
        loadInquiries();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create inquiry", "error");
    } finally {
      setSubmittingNew(false);
    }
  };

  // Filtered List
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        inq.phone.toLowerCase().includes(q) ||
        inq.suburb.toLowerCase().includes(q) ||
        (inq.message && inq.message.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
      const matchesLessonType =
        lessonTypeFilter === "all" || inq.lesson_type === lessonTypeFilter;

      return matchesSearch && matchesStatus && matchesLessonType;
    });
  }, [inquiries, searchQuery, statusFilter, lessonTypeFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 pb-24 select-none">
        {/* TOP HEADER: Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={Inbox}
          title="Inquiries & Student Leads"
          subtitle="Manage incoming driving lesson inquiries, quotes, and website leads"
          badge={`${stats.total || inquiries.length} Leads`}
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadInquiries}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Refresh leads list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <Link
                href="/inquiries/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer group"
              >
                <Plus className="w-4 h-4 text-[#FAB10B] transition-transform group-hover:scale-110" />
                <span>+ Log New Inquiry</span>
              </Link>
            </div>
          }
        />

        {/* 4 OVERVIEW KPI STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Leads */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B1528] flex items-center justify-center shrink-0 text-white shadow-2xs">
              <Inbox className="w-5 h-5 text-[#FAB10B]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {stats.total || inquiries.length}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Total Inquiries
              </div>
            </div>
          </div>

          {/* Card 2: New / Action Required */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 text-white shadow-2xs relative">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 leading-tight">
                {stats.new}
              </div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">
                New (Awaiting Reply)
              </div>
            </div>
          </div>

          {/* Card 3: Contacted */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0 text-white shadow-2xs">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-blue-700 leading-tight">
                {stats.contacted}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Contacted / Follow-up
              </div>
            </div>
          </div>

          {/* Card 4: Converted to Bookings */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 text-white shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 leading-tight">
                {stats.converted}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">
                Converted to Bookings
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, email, phone, suburb, or message text..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All Leads", count: stats.total },
                { id: "new", label: "New", count: stats.new },
                { id: "contacted", label: "Contacted", count: stats.contacted },
                { id: "converted", label: "Converted", count: stats.converted },
                { id: "closed", label: "Closed", count: stats.closed },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    statusFilter === tab.id
                      ? "bg-[#0B1528] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INQUIRIES MANAGEMENT TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 sm:px-6 flex items-center justify-between border-b border-slate-100">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900">
              Customer Inquiries Table
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredInquiries.length} of {inquiries.length} inquiries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">STUDENT LEAD</th>
                  <th className="py-4 px-5">CONTACT INFO</th>
                  <th className="py-4 px-5">LESSON INTEREST</th>
                  <th className="py-4 px-5 w-1/4">MESSAGE</th>
                  <th className="py-4 px-5">STATUS</th>
                  <th className="py-4 px-5">RECEIVED</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      Loading inquiries from database...
                    </td>
                  </tr>
                ) : filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No customer inquiries found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* STUDENT LEAD */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#07345B]/10 text-[#07345B] font-bold flex items-center justify-center shrink-0 text-xs">
                            {inq.name.charAt(0)}
                          </div>
                          <div>
                            <span
                              onClick={() => handleOpenDetailModal(inq)}
                              className="font-bold text-slate-900 hover:text-[#07345B] cursor-pointer block text-sm leading-tight"
                            >
                              {inq.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{inq.suburb}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="space-y-1">
                          <a
                            href={`mailto:${inq.email}`}
                            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#0B1528] font-medium transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inq.email}</span>
                          </a>
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inq.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* LESSON INTEREST */}
                      <td className="py-4 px-5">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#07345B]/10 text-[#07345B] border border-[#07345B]/15 whitespace-nowrap">
                          {inq.lesson_type}
                        </span>
                        {inq.preferred_time && (
                          <div className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{inq.preferred_time}</span>
                          </div>
                        )}
                      </td>

                      {/* MESSAGE */}
                      <td className="py-4 px-5 min-w-[280px] max-w-md">
                        <Link
                          href={`/inquiries/${inq.id}`}
                          className="block p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-100 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
                          title="Click to view full inquiry details"
                        >
                          <p className="text-xs font-normal leading-relaxed line-clamp-3">
                            "{inq.message || "No message provided."}"
                          </p>
                          {inq.notes && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <span className="font-bold text-slate-700">Staff Note:</span>
                              <span className="truncate">{inq.notes}</span>
                            </div>
                          )}
                        </Link>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={inq.status}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                inq.id,
                                e.target.value as "new" | "contacted" | "converted" | "closed"
                              )
                            }
                            className={`appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none ${
                              inq.status === "new"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : inq.status === "contacted"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : inq.status === "converted"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* RECEIVED */}
                      <td className="py-4 px-5 whitespace-nowrap text-slate-500 font-medium">
                        {formatDate(inq.created_at)}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/inquiries/${inq.id}`}
                            className="bg-slate-100 hover:bg-[#0B1528] hover:text-white text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-block cursor-pointer"
                          >
                            View & Notes
                          </Link>

                          <Link
                            href={`/bookings/create?student_name=${encodeURIComponent(
                              inq.name
                            )}&email=${encodeURIComponent(inq.email)}&phone=${encodeURIComponent(
                              inq.phone
                            )}&suburb=${encodeURIComponent(inq.suburb)}&service=${encodeURIComponent(
                              inq.lesson_type
                            )}`}
                            className="bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            title="Convert to official driving booking"
                          >
                            Book →
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(inq)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs hover:underline transition-colors cursor-pointer ml-1"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INQUIRY DETAIL & REPLY MODAL */}
        {selectedInquiry && (
          <Modal
            isOpen={!!selectedInquiry}
            onClose={() => setSelectedInquiry(null)}
            title="Inquiry Details & Student Follow-Up"
            maxWidth="3xl"
          >
            <div className="space-y-6 p-1 text-slate-800">
              {/* Header Profile Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center font-black text-lg">
                    {selectedInquiry.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-slate-900">
                      {selectedInquiry.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{selectedInquiry.suburb}</strong>
                      </span>
                      <span>•</span>
                      <span>Received on {formatDate(selectedInquiry.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Student</span>
                  </a>

                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1528] text-white hover:bg-[#07345B] font-bold text-xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#FAB10B]" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>

              {/* Inquiry Message Box */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-slate-700 block">
                  Customer Message / Request:
                </span>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedInquiry.message || "No message content entered."}
                </div>
              </div>

              {/* Service & Preferred Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-500 font-medium mb-1">
                    Requested Service Type
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedInquiry.lesson_type}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-slate-500 font-medium mb-1">
                    Preferred Time & Availability
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedInquiry.preferred_time || "Flexible"}
                  </span>
                </div>
              </div>

              {/* Status & Instructor Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Lead Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) =>
                      setModalStatus(e.target.value as "new" | "contacted" | "converted" | "closed")
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  >
                    <option value="new">New (Needs Response)</option>
                    <option value="contacted">Contacted (In Progress)</option>
                    <option value="converted">Converted to Booking</option>
                    <option value="closed">Closed / Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Assigned Instructor / Handler
                  </label>
                  <select
                    value={modalAssignedTo}
                    onChange={(e) => setModalAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  >
                    <option value="Kevin O'Connor">Kevin O'Connor (Senior Instructor)</option>
                    <option value="Aisha Khan">Aisha Khan (Manual Specialist)</option>
                    <option value="Michael Zhang">Michael Zhang (Test Route Assessor)</option>
                    <option value="Sarah Jenkins">Sarah Jenkins (Beginner Coach)</option>
                    <option value="Office Reception">Office Reception</option>
                  </select>
                </div>
              </div>

              {/* Internal Notes Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="block font-bold text-slate-800 text-xs">
                  Internal Admin Follow-up Notes:
                </label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Record phone notes, packages discussed, pricing quoted, or follow-up tasks..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Link
                  href={`/bookings/create?student_name=${encodeURIComponent(
                    selectedInquiry.name
                  )}&email=${encodeURIComponent(selectedInquiry.email)}&phone=${encodeURIComponent(
                    selectedInquiry.phone
                  )}&suburb=${encodeURIComponent(selectedInquiry.suburb)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  <span>✓ Convert into Official Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveModalDetails}
                    disabled={savingNotes}
                    className="px-5 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-[#FAB10B] font-bold text-xs shadow-xs transition-colors disabled:opacity-75"
                  >
                    {savingNotes ? "Saving..." : "Save Details & Notes"}
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* ADD MANUAL INQUIRY MODAL */}
        {isAddModalOpen && (
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Log New Customer Inquiry"
            maxWidth="2xl"
          >
            <form onSubmit={handleCreateNewInquiry} className="space-y-4 p-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lucas Miller"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. lucas.miller@gmail.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Australian Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0412 345 678"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Suburb / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Parramatta, Blacktown, Castle Hill"
                    value={newForm.suburb}
                    onChange={(e) => setNewForm({ ...newForm, suburb: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Lesson / Service Requested
                  </label>
                  <select
                    value={newForm.lesson_type}
                    onChange={(e) => setNewForm({ ...newForm, lesson_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  >
                    <option value="Automatic Driving Lessons">Automatic Driving Lessons</option>
                    <option value="Manual Driving Lessons">Manual Driving Lessons</option>
                    <option value="RMS Practical Test Package">RMS Practical Test Package</option>
                    <option value="Complete Beginner Package (10 Lessons)">
                      Complete Beginner Package (10 Lessons)
                    </option>
                    <option value="Overseas Licence Conversion">Overseas Licence Conversion</option>
                    <option value="Defensive Driving & Motorway Confidence">
                      Defensive Driving & Motorway Confidence
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Preferred Time Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weekend Morning, Weekday 4 PM"
                    value={newForm.preferred_time}
                    onChange={(e) => setNewForm({ ...newForm, preferred_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">
                  Inquiry Message / Customer Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of the customer's request or inquiry notes..."
                  value={newForm.message}
                  onChange={(e) => setNewForm({ ...newForm, message: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNew}
                  className="px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold transition-colors disabled:opacity-75"
                >
                  {submittingNew ? "Saving Lead..." : "Save Customer Inquiry"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Inquiry"
          message={`Are you sure you want to delete the inquiry from "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Yes, Delete Inquiry"
          variant="danger"
          onConfirm={handleDeleteInquiry}
          onClose={() => setDeleteTarget(null)}
        />

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 font-heading font-bold text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              toast.type === "error"
                ? "bg-rose-600 text-white"
                : "bg-[#0B1528] text-white border border-[#FAB10B]/30"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-[#FAB10B]" />
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
