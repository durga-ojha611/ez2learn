"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { Drawer } from "@/components/common/Drawer";
import { Modal } from "@/components/common/Modal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Inbox,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Reply,
  MoreVertical,
  Send,
  RotateCw,
  Check,
  UserCheck,
  CalendarCheck2,
} from "lucide-react";

export interface InquiryItem {
  id: number;
  name: string;
  subject?: string;
  email: string;
  phone: string;
  suburb: string;
  lesson_type: string;
  message: string;
  status: "new" | "replied" | "contacted" | "converted" | "closed";
  preferred_date?: string;
  preferred_time?: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

// Avatar color generator based on name
const AVATAR_COLORS = [
  { bg: "bg-[#2563EB]", text: "text-white" }, // Blue (like PS)
  { bg: "bg-[#1E40AF]", text: "text-white" }, // Steel Blue (like RK)
  { bg: "bg-[#16A34A]", text: "text-white" }, // Green (like SN)
  { bg: "bg-[#EA580C]", text: "text-white" }, // Orange (like AM)
  { bg: "bg-[#0F172A]", text: "text-white" }, // Navy (like DK)
  { bg: "bg-[#7C3AED]", text: "text-white" }, // Purple
  { bg: "bg-[#D97706]", text: "text-white" }, // Amber
  { bg: "bg-[#0891B2]", text: "text-white" }, // Cyan
];

function getInitials(name: string): string {
  if (!name) return "IN";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function InquiriesPage() {
  const router = useRouter();

  // Data State
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 24,
    new: 12,
    replied: 8,
    contacted: 2,
    converted: 1,
    closed: 1,
  });

  // Filter & Search State (matching Image 1)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Side Window State (matching Image 2)
  const [sideWindowOpen, setSideWindowOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);

  // Reply Form inside Side Window
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Quick Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InquiryItem | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // New Inquiry Form State
  const [newForm, setNewForm] = useState({
    name: "",
    subject: "Driving Lesson Query",
    email: "",
    phone: "",
    suburb: "Parramatta",
    lesson_type: "Automatic Driving Lessons",
    message: "",
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
      const res = await apiFetch("/api/inquiries?limit=100");
      if (res.success && res.data) {
        const list = res.data.inquiries || [];
        setInquiries(list);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn("Could not load inquiries from API", err);
    } finally {
      setLoading(false);
    }
  };

  // Open side window for an inquiry
  const handleOpenSideWindow = (inq: InquiryItem) => {
    setSelectedInquiry(inq);
    setSideWindowOpen(true);
    setReplyMode(false);
    setReplyText("");
    setActiveMenuId(null);
  };

  const handleCloseSideWindow = () => {
    setSideWindowOpen(false);
    setReplyMode(false);
  };

  // Quick Status change
  const handleQuickStatusChange = async (
    id: number,
    newStatus: "new" | "replied" | "contacted" | "converted" | "closed"
  ) => {
    try {
      await apiFetch(`/api/inquiries/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Inquiry status updated to ${newStatus}`);
      loadInquiries();
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Send Reply from side window
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await apiFetch(`/api/inquiries/${selectedInquiry.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply_message: replyText }),
      });
      if (res.success) {
        showToast(`Reply sent to ${selectedInquiry.name} (${selectedInquiry.email})!`);
        setReplyMode(false);
        setReplyText("");
        loadInquiries();
        if (selectedInquiry) {
          setSelectedInquiry({
            ...selectedInquiry,
            status: "replied",
            notes: (selectedInquiry.notes ? selectedInquiry.notes + "\n\n" : "") + `[Replied]: ${replyText}`,
          });
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to send reply", "error");
    } finally {
      setSendingReply(false);
    }
  };

  // Delete
  const handleDeleteInquiry = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/inquiries/${deleteTarget.id}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      if (selectedInquiry?.id === deleteTarget.id) {
        setSideWindowOpen(false);
      }
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
      showToast("Please fill in customer name, email, and phone.", "error");
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
          subject: "Driving Lesson Query",
          email: "",
          phone: "",
          suburb: "Parramatta",
          lesson_type: "Automatic Driving Lessons",
          message: "",
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
        (inq.subject && inq.subject.toLowerCase().includes(q)) ||
        inq.phone.toLowerCase().includes(q) ||
        (inq.message && inq.message.toLowerCase().includes(q));

      const normFilter = statusFilter.toLowerCase();
      const matchesStatus =
        normFilter === "all status" || inq.status.toLowerCase() === normFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  // Pagination Slice
  const totalItems = filteredInquiries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInquiries.slice(start, start + itemsPerPage);
  }, [filteredInquiries, currentPage, itemsPerPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 pb-24 select-none">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* TOP HEADER: Full-Width Unified Rectangle Block */}
        <PageHeading
          icon={Inbox}
          title="Inquiries & Student Leads"
          subtitle="Manage incoming driving lesson inquiries, quotes, and website leads"
          badge={`${stats.total || inquiries.length} Inquiries`}
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadInquiries}
                className="w-11 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Refresh inquiries"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-black text-xs sm:text-sm shadow-xs transition-colors cursor-pointer group"
              >
                <Plus className="w-4 h-4 text-[#FAB10B] transition-transform group-hover:scale-110" />
                <span>+ Log New Inquiry</span>
              </button>
            </div>
          }
        />

        {/* ================= EXACT UI: MAIN INQUIRY CARD ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
          {/* Top Controls Bar matching Image 1 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#07345B]/15"
              />
            </div>

            {/* Right: Dropdown + Filter Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#07345B]/15 shadow-2xs"
                >
                  <option value="All Status">All Status</option>
                  <option value="new">New</option>
                  <option value="replied">Replied</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Filter Button (Yellow/Gold matching Image 1) */}
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("All Status");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-heading font-black text-xs sm:text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Filter className="w-4 h-4 stroke-[2.5]" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Table matching Image 1 */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 font-heading font-black text-xs text-slate-700 tracking-wider">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No customer inquiries match your filter.
                    </td>
                  </tr>
                ) : (
                  paginatedInquiries.map((inq) => {
                    const avatarStyle = getAvatarStyle(inq.name);
                    const initials = getInitials(inq.name);
                    const formattedDate = inq.created_at
                      ? formatDate(inq.created_at)
                      : "16 Nov 2025";
                    const isNew = inq.status === "new";
                    const isReplied = inq.status === "replied";

                    return (
                      <tr
                        key={inq.id}
                        onClick={() => handleOpenSideWindow(inq)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        {/* Customer */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full ${avatarStyle.bg} ${avatarStyle.text} font-heading font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {initials}
                            </div>
                            <span className="font-heading font-bold text-sm text-slate-900 group-hover:text-[#07345B] transition-colors">
                              {inq.name}
                            </span>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-4 px-5 text-slate-800 font-medium text-sm">
                          {inq.subject || inq.lesson_type || "Driving Lesson Query"}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-5 text-slate-600 text-sm whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* Status Badge with Dot */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {isNew ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDF5FD] text-[#1D4ED8] border border-[#BFDBFE]">
                              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]"></span>
                              New
                            </span>
                          ) : isReplied ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8EE] text-[#0E8A38] border border-[#B6EAC4]">
                              <span className="w-2 h-2 rounded-full bg-[#0E8A38]"></span>
                              Replied
                            </span>
                          ) : inq.status === "contacted" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]">
                              <span className="w-2 h-2 rounded-full bg-[#854D0E]"></span>
                              Contacted
                            </span>
                          ) : inq.status === "converted" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
                              <span className="w-2 h-2 rounded-full bg-[#6B21A8]"></span>
                              Converted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                              Closed
                            </span>
                          )}
                        </td>

                        {/* Actions: View + 3 dots */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div
                            className="inline-flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenSideWindow(inq)}
                              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-heading font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                            >
                              View
                            </button>

                            {/* Dropdown 3 dots */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(activeMenuId === inq.id ? null : inq.id)
                                }
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === inq.id && (
                                <div className="absolute right-0 top-8 z-30 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 text-xs font-semibold text-slate-700 animate-fade-in">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenSideWindow(inq);
                                      setReplyMode(true);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Reply className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Reply to Inquiry</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleQuickStatusChange(
                                        inq.id,
                                        inq.status === "replied" ? "new" : "replied"
                                      );
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                      Mark as {inq.status === "replied" ? "New" : "Replied"}
                                    </span>
                                  </button>

                                  <Link
                                    href={`/bookings/create?student_name=${encodeURIComponent(
                                      inq.name
                                    )}&student_email=${encodeURIComponent(
                                      inq.email
                                    )}&student_phone=${encodeURIComponent(inq.phone)}`}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-[#07345B] cursor-pointer"
                                  >
                                    <CalendarCheck2 className="w-3.5 h-3.5 text-[#07345B]" />
                                    <span>Convert to Booking</span>
                                  </Link>

                                  <div className="border-t border-slate-100 my-1"></div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteTarget(inq);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Inquiry</span>
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

          {/* Pagination Footer matching Image 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Showing {startIndex} to {endIndex} of {totalItems} inquiries
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* Prev < */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers: 1 to totalPages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                const isActive = pageNumber === currentPage;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#0B1528] text-white shadow-2xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next > */}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= EXACT UI: SIDE WINDOW DRAWER (Image 2) ================= */}
        <Drawer
          isOpen={sideWindowOpen}
          onClose={handleCloseSideWindow}
          title="Inquiry Details"
          size="md"
          icon={<Mail className="w-5 h-5 text-[#07345B]" />}
        >
          {selectedInquiry && (
            <div className="space-y-6 text-slate-800">
              {/* Customer Profile Section matching Image 2 */}
              <div className="flex items-center gap-4 pb-2">
                <div className="w-16 h-16 rounded-full bg-[#DBEAFE] text-[#1E40AF] font-heading font-black text-xl flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
                  {getInitials(selectedInquiry.name)}
                </div>

                <div className="min-w-0 space-y-1">
                  <h3 className="font-heading font-black text-xl text-slate-900 leading-tight">
                    {selectedInquiry.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="hover:underline hover:text-blue-600 truncate"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="hover:underline hover:text-slate-900"
                    >
                      {selectedInquiry.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Information Items Stack matching Image 2 */}
              <div className="space-y-4">
                {/* 1. Subject */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-heading font-black text-slate-900 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                    <span>Subject</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-1 pl-6">
                    {selectedInquiry.subject || selectedInquiry.lesson_type || "Driving Lesson Query"}
                  </p>
                </div>

                {/* 2. Date */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-heading font-black text-slate-900 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span>Date</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-1 pl-6">
                    {formatDate(selectedInquiry.created_at)} • 10:24 AM
                  </p>
                </div>

                {/* 3. Message Bubble */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-heading font-black text-slate-900 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                    <span>Message</span>
                  </div>
                  <div className="bg-[#F0F4F8] rounded-2xl p-4 border border-slate-200/80 text-slate-800 text-sm leading-relaxed mt-2">
                    {selectedInquiry.message || "Can you please share details about your beginner packages?"}
                  </div>
                </div>

                {/* 4. Status with Quick Status Switcher */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-heading font-black text-slate-900 uppercase tracking-wider">
                      <RotateCw className="w-4 h-4 text-slate-600" />
                      <span>Status</span>
                    </div>

                    {/* Quick status dropdown */}
                    <select
                      value={selectedInquiry.status}
                      onChange={(e) =>
                        handleQuickStatusChange(selectedInquiry.id, e.target.value as any)
                      }
                      className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none cursor-pointer"
                    >
                      <option value="new">Mark as New</option>
                      <option value="replied">Mark as Replied</option>
                      <option value="contacted">Mark as Contacted</option>
                      <option value="converted">Mark as Converted</option>
                      <option value="closed">Mark as Closed</option>
                    </select>
                  </div>

                  <div className="mt-2 pl-6">
                    {selectedInquiry.status === "new" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDF5FD] text-[#1D4ED8] border border-[#BFDBFE]">
                        <span className="w-2 h-2 rounded-full bg-[#1D4ED8]"></span>
                        New
                      </span>
                    ) : selectedInquiry.status === "replied" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8EE] text-[#0E8A38] border border-[#B6EAC4]">
                        <span className="w-2 h-2 rounded-full bg-[#0E8A38]"></span>
                        Replied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                        {selectedInquiry.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reply Composer Section */}
                {replyMode && (
                  <form
                    onSubmit={handleSendReply}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-heading font-black text-slate-900 uppercase tracking-wider">
                        Compose Reply to {selectedInquiry.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyMode(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">Quick templates:</span>
                      {[
                        "Packages Details",
                        "Booking Slots",
                        "Pricing Schedule",
                      ].map((tmpl) => (
                        <button
                          key={tmpl}
                          type="button"
                          onClick={() =>
                            setReplyText(
                              `Hi ${selectedInquiry.name}, thank you for reaching out regarding ${selectedInquiry.subject || "our driving packages"}. We would love to help you get started with our RMS accredited instructors.`
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={4}
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your official reply here... (will be logged and sent to customer)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#07345B]/15"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        disabled={sendingReply}
                        className="px-5 py-2 rounded-xl bg-[#07345B] hover:bg-[#052642] text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingReply ? "Sending..." : "Send Reply"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Previous Notes/Replies */}
                {selectedInquiry.notes && !replyMode && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 whitespace-pre-wrap">
                    <span className="font-bold text-slate-700 block mb-1">
                      Internal Activity & Reply Log:
                    </span>
                    {selectedInquiry.notes}
                  </div>
                )}
              </div>

              {/* Bottom Actions matching Image 2 */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyMode(!replyMode)}
                  className="w-full py-3 px-4 rounded-xl bg-[#07345B] hover:bg-[#052642] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply to Inquiry</span>
                </button>

                <Link
                  href={`/bookings/create?student_name=${encodeURIComponent(
                    selectedInquiry.name
                  )}&student_email=${encodeURIComponent(
                    selectedInquiry.email
                  )}&student_phone=${encodeURIComponent(
                    selectedInquiry.phone
                  )}&pickup_address=${encodeURIComponent(selectedInquiry.suburb || "Parramatta")}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#07345B] font-heading font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CalendarCheck2 className="w-4 h-4 text-[#07345B]" />
                  <span>+ Convert into Official Booking</span>
                </Link>
              </div>
            </div>
          )}
        </Drawer>

        {/* ================= MODAL: ADD NEW INQUIRY ================= */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Log New Customer Inquiry"
        >
          <form onSubmit={handleCreateNewInquiry} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  placeholder="priya@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.phone}
                  onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.subject}
                  onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                  placeholder="e.g. Driving Lesson Query"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Suburb / Location
                </label>
                <input
                  type="text"
                  value={newForm.suburb}
                  onChange={(e) => setNewForm({ ...newForm, suburb: e.target.value })}
                  placeholder="e.g. Parramatta"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Inquiry Message / Concern
              </label>
              <textarea
                rows={3}
                value={newForm.message}
                onChange={(e) => setNewForm({ ...newForm, message: e.target.value })}
                placeholder="Can you please share details about your beginner packages?"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingNew}
                className="px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {submittingNew ? "Saving..." : "Save Inquiry"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ================= MODAL: CONFIRM DELETE ================= */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteInquiry}
          title="Delete Customer Inquiry"
          message={`Are you sure you want to permanently delete the inquiry from ${deleteTarget?.name}? This action cannot be undone.`}
          confirmLabel="Delete Inquiry"
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
}
