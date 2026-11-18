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
  Calendar,
  Newspaper,
  ExternalLink,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";

export interface BlogItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  image_url: string;
  description: string;
  body: string;
  publisher_name: string;
  seo_title?: string;
  seo_description?: string;
  status: "published" | "draft" | "archived";
  views_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export default function BlogsPage() {
  const router = useRouter();

  // State
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Date Filter State
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Modals & Feedback
  const [previewBlog, setPreviewBlog] = useState<BlogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogItem | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/blogs");
      if (res.success && res.data) {
        setBlogs(res.data.blogs || []);
      }
    } catch (err) {
      console.warn("Could not load blogs from backend API:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    showToast("Date filter applied");
  };

  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
    setAppliedFromDate("");
    setAppliedToDate("");
    showToast("Filter reset");
  };

  const handleDeleteBlog = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/blogs/${deleteTarget.id}`, { method: "DELETE" });
      setBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast("Article deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete article", "error");
    }
  };

  const formatBlogDate = (dateStr?: string) => {
    if (!dateStr) return "16 Oct 2026";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    let result = [...blogs];

    if (appliedFromDate) {
      result = result.filter((b) => {
        const itemDate = (b.published_at || b.created_at).slice(0, 10);
        return itemDate >= appliedFromDate;
      });
    }

    if (appliedToDate) {
      result = result.filter((b) => {
        const itemDate = (b.published_at || b.created_at).slice(0, 10);
        return itemDate <= appliedToDate;
      });
    }

    return result;
  }, [blogs, appliedFromDate, appliedToDate]);

  // Formatted current date e.g. "Wed, 18 Nov 2026"
  const formattedToday = new Date().toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 select-none pb-24">
        {/* TOP HEADER: Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={Newspaper}
          title="Blog Management"
          subtitle="Author and manage driving tutorials, RMS test advice, and educational articles"
          badge={`${blogs.length} Articles`}
          actions={
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <Link
                href="https://ezy2learn.com.au"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0B1528] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Site</span>
              </Link>

              <span className="text-slate-300">|</span>

              <span className="text-slate-600">{formattedToday}</span>

              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          }
        />

        {/* TOP CARD: Filter by date added (EXACT STRUCTURE FROM USER SCREENSHOT, THEMED TO NAVY/WEBSITE) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <label className="block text-xs font-medium text-slate-500">
            Filter by date added
          </label>

          <div className="flex flex-wrap items-end gap-3.5">
            <div>
              <span className="block text-xs text-slate-600 font-medium mb-1">
                From
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="dd-mm-yyyy"
                  className="w-44 sm:w-48 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                />
              </div>
            </div>

            <div>
              <span className="block text-xs text-slate-600 font-medium mb-1">
                To
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="dd-mm-yyyy"
                  className="w-44 sm:w-48 px-3.5 py-2 rounded-xl border border-[#0B1528]/40 bg-white text-xs font-medium text-slate-700 ring-2 ring-[#0B1528]/10 focus:outline-none focus:border-[#0B1528] transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyFilter}
              className="px-5 py-2 rounded-xl bg-[#008770] hover:bg-[#00705d] text-white font-heading font-bold text-xs shadow-xs transition-colors h-[38px] cursor-pointer"
            >
              Apply
            </button>

            <button
              type="button"
              onClick={handleResetFilter}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-bold text-xs transition-colors h-[38px] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* MAIN CARD: Articles & Guides Table (EXACT STRUCTURE FROM USER SCREENSHOT, THEMED TO NAVY/GOLD) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Card Header with Title & + Add New Blog button */}
          <div className="p-5 sm:px-6 flex items-center justify-between border-b border-slate-100">
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900">
              Articles & Guides
            </h2>

            <Link
              href="/blogs/create"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#008770] hover:bg-[#00705d] text-white font-heading font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer group"
            >
              <Plus className="w-4 h-4 text-white transition-transform group-hover:scale-110" />
              <span>+ Add New Blog</span>
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-2/5">TITLE</th>
                  <th className="py-4 px-5">CATEGORY</th>
                  <th className="py-4 px-5">AUTHOR</th>
                  <th className="py-4 px-5">PUBLISHED DATE</th>
                  <th className="py-4 px-5">STATUS</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      Loading articles from database...
                    </td>
                  </tr>
                ) : filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No blog articles found matching the selected dates.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* TITLE */}
                      <td className="py-4 px-6">
                        <span
                          onClick={() => setPreviewBlog(blog)}
                          className="font-bold text-slate-900 text-sm hover:text-[#07345B] transition-colors cursor-pointer block leading-snug"
                        >
                          {blog.title}
                        </span>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-4 px-5">
                        <span className="inline-block bg-[#e8f7f4] text-[#008770] px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                          {blog.category}
                        </span>
                      </td>

                      {/* AUTHOR */}
                      <td className="py-4 px-5 text-slate-600 font-medium whitespace-nowrap">
                        {blog.publisher_name || "Kevin O'Connor"}
                      </td>

                      {/* PUBLISHED DATE */}
                      <td className="py-4 px-5 text-slate-600 font-medium whitespace-nowrap">
                        {formatBlogDate(blog.published_at || blog.created_at)}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            blog.status === "published"
                              ? "bg-[#e8f7f4] text-[#008770]"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {blog.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* ACTIONS: Edit | Delete */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <Link
                            href={`/blogs/${blog.id}/edit`}
                            className="bg-slate-100 hover:bg-[#0B1528] hover:text-white text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-block"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(blog)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs hover:underline transition-colors cursor-pointer"
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

        {/* PREVIEW ARTICLE MODAL */}
        {previewBlog && (
          <Modal
            isOpen={!!previewBlog}
            onClose={() => setPreviewBlog(null)}
            title="Article Preview"
            maxWidth="3xl"
          >
            <div className="space-y-5 p-2 font-sans text-slate-800">
              {previewBlog.image_url && (
                <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={previewBlog.image_url}
                    alt={previewBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#07345B]/10 text-[#07345B] border border-[#07345B]/20 px-3 py-1 rounded-full text-xs font-bold">
                    {previewBlog.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Published on {formatBlogDate(previewBlog.published_at || previewBlog.created_at)} by{" "}
                    <strong>{previewBlog.publisher_name}</strong>
                  </span>
                </div>

                <h2 className="font-heading font-black text-2xl text-slate-900 leading-tight">
                  {previewBlog.title}
                </h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {previewBlog.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed space-y-3">
                {previewBlog.body}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <Link
                  href={`/blogs/${previewBlog.id}/edit`}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                >
                  Edit This Post
                </Link>

                <button
                  onClick={() => setPreviewBlog(null)}
                  className="px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-[#FAB10B] font-bold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Article"
          message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel="Yes, Delete Article"
          variant="danger"
          onConfirm={handleDeleteBlog}
          onClose={() => setDeleteTarget(null)}
        />

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 font-heading font-bold text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              toast.type === "error" ? "bg-rose-600 text-white" : "bg-[#0B1528] text-white border border-[#FAB10B]/30"
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
