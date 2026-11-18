"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { ReviewItem } from "@/types";
import {
  Star,
  Trash2,
  Filter,
  MessageSquare,
  Calendar,
  Ticket,
  Car,
  Mail,
  Phone,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Sparkles,
} from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Statistics (dynamically populated from MySQL API)
  const [stats, setStats] = useState({
    total_reviews: 0,
    average_rating: 0,
    five_star_reviews: 0,
    stars_5: 0,
    stars_4: 0,
    stars_3: 0,
    stars_2: 0,
    stars_1: 0,
  });

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");

  useEffect(() => {
    loadReviews();
  }, [page, activeTab, instructorFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);

      // Determine rating filter based on activeTab
      let ratingParam = "all";
      if (activeTab === "5") ratingParam = "5";
      else if (activeTab === "4") ratingParam = "4";
      else if (activeTab === "3") ratingParam = "3";
      else if (activeTab === "2") ratingParam = "2";
      else if (activeTab === "1") ratingParam = "1";

      const res = await apiFetch("/api/reviews", {
        params: {
          page,
          limit,
          search: searchQuery,
          rating: ratingParam,
          instructor_id: instructorFilter,
        },
      });

      if (res.success) {
        const fetchedReviews = res.data || [];
        setReviews(fetchedReviews);
        if (res.stats) {
          setStats((prev) => ({
            ...prev,
            ...res.stats,
          }));
        }
        setTotal(res.pagination?.total || fetchedReviews.length);

        // Pre-select first review if none selected or keep current
        if (fetchedReviews.length > 0) {
          setSelectedReview((curr) => {
            if (!curr) return fetchedReviews[0];
            const updated = fetchedReviews.find((r: ReviewItem) => r.id === curr.id);
            return updated || fetchedReviews[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    loadReviews();
  };

  const handleSelectReview = (rev: ReviewItem) => {
    setSelectedReview(rev);
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await apiFetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });

      if (res.success) {
        if (selectedReview?.id === id) {
          setSelectedReview(null);
        }
        loadReviews();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete review");
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await apiFetch(`/api/reviews/${id}/feature`, { method: "PATCH" });
      loadReviews();
    } catch (err: any) {
      alert(err.message || "Failed to toggle featured status");
    }
  };

  // Helper to render golden stars
  const renderStars = (rating: number, size = "w-4 h-4") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating
              ? "text-[#FAB10B] fill-[#FAB10B]"
              : "text-slate-200 fill-slate-200"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 select-none pb-16">
        {/* Page Title with Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={Star}
          title="Customer Reviews & Ratings"
          subtitle="Manage student feedback, rating scores, and public testimonials"
          badge="Verified Students"
        />

        {/* 1. Overview Statistics (3 Clean Cards without Response Card) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Reviews */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
                {stats.total_reviews}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Total Reviews
              </div>
            </div>
          </div>

          {/* Card 2: Average Rating */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAB10B]/15 text-[#FAB10B] flex items-center justify-center shrink-0">
              <Star className="w-7 h-7 text-[#FAB10B] fill-[#FAB10B]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
                {stats.average_rating.toFixed(1)}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                Average Rating
              </div>
            </div>
          </div>

          {/* Card 3: 5-Star Reviews */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
                {stats.five_star_reviews}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                5-Star Reviews
              </div>
            </div>
          </div>
        </div>

        {/* 2. Review Status Tabs (Star Ratings Only - No Responded/Not Responded) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full transition-all shrink-0 cursor-pointer ${activeTab === "all"
              ? "bg-[#0B1528] text-white shadow-xs font-bold"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
          >
            All Reviews ({stats.total_reviews})
          </button>

          <button
            onClick={() => {
              setActiveTab("5");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "5"
              ? "bg-[#0B1528] text-white shadow-xs font-bold"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
          >
            <Star className="w-3.5 h-3.5 fill-[#FAB10B] text-[#FAB10B]" />
            5 Stars ({stats.stars_5})
          </button>

          <button
            onClick={() => {
              setActiveTab("4");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "4"
              ? "bg-[#0B1528] text-white shadow-xs font-bold"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
          >
            <Star className="w-3.5 h-3.5 fill-[#FAB10B] text-[#FAB10B]" />
            4 Stars ({stats.stars_4})
          </button>

          <button
            onClick={() => {
              setActiveTab("3");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "3"
              ? "bg-[#0B1528] text-white shadow-xs font-bold"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
          >
            <Star className="w-3.5 h-3.5 fill-[#FAB10B] text-[#FAB10B]" />
            3 Stars ({stats.stars_3})
          </button>

          <button
            onClick={() => {
              setActiveTab("2");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "2"
              ? "bg-[#0B1528] text-white shadow-xs font-bold"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
          >
            <Star className="w-3.5 h-3.5 fill-[#FAB10B] text-[#FAB10B]" />
            2 Stars ({stats.stars_2})
          </button>

          <button
            onClick={() => {
              setActiveTab("1");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "1"
              ? "bg-[#0B1528] text-white shadow-xs font-bold"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
              }`}
          >
            <Star className="w-3.5 h-3.5 fill-[#FAB10B] text-[#FAB10B]" />
            1 Star ({stats.stars_1})
          </button>
        </div>

        {/* 3. Search and Filters Row */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[260px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student, instructor or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1528] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1528] cursor-pointer"
            >
              <option value="all">Select Date Range</option>
              <option value="today">Today</option>
              <option value="last_7">Last 7 Days</option>
              <option value="last_30">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="all_time">All Time</option>
            </select>
          </div>

          {/* All Instructors Dropdown */}
          <div className="relative">
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1528] cursor-pointer"
            >
              <option value="all">All Instructors</option>
              <option value="Rahul Sinha">Rahul Sinha</option>
              <option value="Priya Nair">Priya Nair</option>
              <option value="Daniel Okafor">Daniel Okafor</option>
              <option value="Sofia Reyes">Sofia Reyes</option>
              <option value="David Kim">David Kim</option>
              <option value="Marcus Bell">Marcus Bell</option>
            </select>
          </div>

          {/* Yellow Filter Button */}
          <button
            onClick={handleApplyFilter}
            className="bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 text-xs sm:text-sm cursor-pointer ml-auto sm:ml-0"
          >
            <Filter className="w-4 h-4 fill-slate-950" />
            <span>Filter</span>
          </button>
        </div>

        {/* 4. Main Section: Split Layout (Table on left, Review Details Drawer/Panel on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Reviews Table */}
          <div
            className={`transition-all duration-200 ${selectedReview ? "lg:col-span-8" : "lg:col-span-12"
              }`}
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold text-xs">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-3">Instructor</th>
                      <th className="py-3.5 px-3">Booking ID</th>
                      <th className="py-3.5 px-3">Rating</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Review Preview</th>
                      <th className="py-3.5 px-3">Date</th>
                      <th className="py-3.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-[#FAB10B] border-t-transparent rounded-full animate-spin" />
                            <span>Loading student reviews...</span>
                          </div>
                        </td>
                      </tr>
                    ) : reviews.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No reviews found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      reviews.map((rev) => {
                        const isSelected = selectedReview?.id === rev.id;

                        return (
                          <tr
                            key={rev.id}
                            onClick={() => handleSelectReview(rev)}
                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? "bg-amber-50/40" : ""
                              }`}
                          >
                            {/* Student: Avatar + Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={
                                    rev.student_avatar ||
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                                  }
                                  alt={rev.student_name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <span className="font-heading font-bold text-slate-900 truncate">
                                  {rev.student_name}
                                </span>
                              </div>
                            </td>

                            {/* Instructor: Avatar + Tooltip */}
                            <td className="py-3 px-3">
                              <div
                                className="flex items-center gap-2"
                                title={rev.instructor_name}
                              >
                                <img
                                  src={
                                    rev.instructor_avatar ||
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                                  }
                                  alt={rev.instructor_name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              </div>
                            </td>

                            {/* Booking ID */}
                            <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-600">
                              {rev.booking_ref || rev.booking_code || `INS-${2580 + rev.id}`}
                            </td>

                            {/* Rating (Golden Stars) */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              {renderStars(rev.rating)}
                            </td>

                            {/* Review Preview */}
                            <td className="py-3 px-4 text-slate-600 max-w-[260px]">
                              <p className="truncate text-xs font-medium">
                                {rev.review_text}
                              </p>
                            </td>

                            {/* Date */}
                            <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap font-medium">
                              {formatDate(rev.submitted_at)}
                            </td>

                            {/* Actions: View button + More menu */}
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <div
                                className="flex items-center justify-end gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleSelectReview(rev)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${isSelected
                                    ? "bg-[#0B1528] text-white border-[#0B1528]"
                                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
                                    }`}
                                >
                                  View
                                </button>

                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setOpenMenuId(
                                        openMenuId === rev.id ? null : rev.id
                                      )
                                    }
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {openMenuId === rev.id && (
                                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30">
                                      <button
                                        onClick={() => {
                                          handleSelectReview(rev);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                        View Details
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleToggleFeatured(rev.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                        Toggle Featured
                                      </button>
                                      <div className="my-1 border-t border-slate-100" />
                                      <button
                                        onClick={() => {
                                          handleDeleteReview(rev.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Review
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

              {/* Table Footer: Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <div>
                  Showing {reviews.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
                  {Math.min(page * limit, total)} of {total} reviews
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === num
                        ? "bg-[#0B1528] text-white"
                        : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                    >
                      {num}
                    </button>
                  ))}

                  <span className="px-1 text-slate-400">...</span>

                  <button
                    onClick={() => setPage(18)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${page === 18
                      ? "bg-[#0B1528] text-white"
                      : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    18
                  </button>

                  <button
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right-Side Drawer: Review Details (Clean - without Admin Response section) */}
          {selectedReview && (
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 sticky top-24">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FAB10B] fill-[#FAB10B]" />
                  <h3 className="text-base sm:text-lg font-heading font-black text-slate-900">
                    Review Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close review details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Student Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student Information
                </h4>
                <div className="flex items-start gap-3.5">
                  <img
                    src={
                      selectedReview.student_avatar ||
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    }
                    alt={selectedReview.student_name}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-heading font-black text-slate-900 text-sm">
                      {selectedReview.student_name}
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-500">
                      {selectedReview.student_code || "STU-1045"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {selectedReview.student_email || "priya@gmail.com"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {selectedReview.student_phone || "+91 98765 43210"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Instructor Information */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Instructor Information
                </h4>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedReview.instructor_avatar ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                    }
                    alt={selectedReview.instructor_name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="font-heading font-black text-slate-900 text-sm">
                      {selectedReview.instructor_name}
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-500">
                      {selectedReview.instructor_code || "INS-2587"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Review Information */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Review Information
                </h4>

                {/* Golden Stars */}
                <div>{renderStars(selectedReview.rating, "w-5 h-5")}</div>

                {/* Feedback Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans shadow-2xs">
                  {selectedReview.review_text}
                </div>

                {/* Meta details */}
                <div className="space-y-2 text-xs font-medium text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formatDate(selectedReview.submitted_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-slate-400" />
                    <span>
                      Booking ID:{" "}
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedReview.booking_code || "BK-7892"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-400" />
                    <span>
                      Lesson Type:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedReview.lesson_type || "Manual"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer in Drawer */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleToggleFeatured(selectedReview.id)}
                  className="w-full bg-[#0B1528] hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FAB10B]" />
                  <span>Toggle Featured Review</span>
                </button>

                <button
                  onClick={() => handleDeleteReview(selectedReview.id)}
                  className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Review</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
