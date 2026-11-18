"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Newspaper,
  Check,
  X,
  UploadCloud,
  ChevronDown,
  Sparkles,
  FileText,
  User,
  Tag,
  Globe,
  Eye,
  Calendar,
  Clock,
  Layers,
  Search,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";

const CATEGORIES = [
  "Driving Lessons & Skills",
  "NSW Test Preparation",
  "Learner Guides (Logbook)",
  "Defensive Driving",
  "Licence Rules & Demerits",
  "Automatic vs Manual",
];

const PRESET_IMAGES = [
  {
    name: "Learner In Vehicle",
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Dual-Control Lesson Car",
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "RMS Test Prep Car",
    url: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80",
  },
  {
    name: "Road Driving Drill",
    url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80",
  },
];

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "Driving Lessons & Skills",
    image_url: "",
    description: "",
    body: "",
    publisher_name: "",
    seo_title: "",
    seo_description: "",
    focus_keywords: "NSW driving test, learner driver, logbook hours",
    status: "published" as "published" | "draft",
    is_featured: true,
    published_date: "",
    views_count: 0,
  });

  useEffect(() => {
    loadBlog();
  }, [blogId]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/blogs/${blogId}`);
      if (res.success && res.data) {
        const b = res.data;
        setForm({
          title: b.title || "",
          category: b.category || "Driving Lessons & Skills",
          image_url: b.image_url || b.featured_image || PRESET_IMAGES[0].url,
          description: b.description || b.summary || "",
          body: b.body || b.content || "",
          publisher_name: b.publisher_name || b.author_name || "Kevin O'Connor",
          seo_title: b.seo_title || "",
          seo_description: b.seo_description || "",
          focus_keywords: "NSW driving test, learner driver, logbook hours",
          status: b.status === "draft" ? "draft" : "published",
          is_featured: true,
          published_date: (b.published_at || b.created_at || "").slice(0, 10),
          views_count: b.views_count || 0,
        });
      } else {
        setErrorMsg("Blog post not found.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load blog.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate live slug
  const slug = useMemo(() => {
    if (!form.title) return "article-headline";
    return form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }, [form.title]);

  // Word count and estimated read time
  const wordCount = useMemo(() => {
    if (!form.body.trim()) return 0;
    return form.body.trim().split(/\s+/).length;
  }, [form.body]);

  const readTimeMin = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Formatting tool helper: insert markdown snippets at body end or cursor
  const handleInsertFormatting = (snippet: string) => {
    setForm((prev) => ({
      ...prev,
      body: prev.body ? `${prev.body}\n${snippet}` : snippet,
    }));
  };

  const handleCopySlug = () => {
    navigator.clipboard.writeText(`https://ezy2learn.com.au/blogs/${slug}`);
  };

  const handleSubmit = async (overrideStatus?: "published" | "draft") => {
    const finalStatus = overrideStatus || form.status;

    if (!form.title.trim()) {
      setErrorMsg("Please enter an article title.");
      return;
    }
    if (!form.description.trim()) {
      setErrorMsg("Please enter a short excerpt / description.");
      return;
    }
    if (!form.body.trim()) {
      setErrorMsg("Please enter the main body content.");
      return;
    }
    if (!form.publisher_name.trim()) {
      setErrorMsg("Please enter the publisher's name.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      title: form.title.trim(),
      category: form.category,
      image_url: form.image_url,
      description: form.description.trim(),
      body: form.body.trim(),
      publisher_name: form.publisher_name.trim(),
      seo_title: form.seo_title.trim() || `${form.title.trim()} | EZY 2 LEARN Driving School`,
      seo_description: form.seo_description.trim() || form.description.trim(),
      status: finalStatus,
    };

    try {
      const res = await apiFetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (res.success) {
        router.push("/blogs");
      } else {
        setErrorMsg(res?.message || "Failed to update article.");
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update article.");
      setSubmitting(false);
    }
  };

  const formattedPublishDate = useMemo(() => {
    if (!form.published_date) return "18 Nov 2026";
    const d = new Date(form.published_date);
    if (isNaN(d.getTime())) return form.published_date;
    return d.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [form.published_date]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-slate-400 font-medium">
          Loading article data...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-7xl pb-28 select-none">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0B1528] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Articles & Guides</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Editing Article #{blogId}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Full Dedicated Page
            </span>
          </div>
        </div>

        {/* 2-COLUMN SPLIT: LEFT SIDE = CTA FORM DETAILS, RIGHT SIDE = LIVE PREVIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: CTA FORM DETAILS (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
              {/* Card Banner Header */}
              <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAB10B] text-slate-950 flex items-center justify-center font-bold shadow-xs">
                    <Newspaper className="w-5 h-5 text-[#0B1528]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-black text-white tracking-tight">
                      Edit Driving Article
                    </h1>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Update article content, SEO metadata, and publication controls
                    </p>
                  </div>
                </div>

                <Link
                  href="/blogs"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Link>
              </div>

              {/* Form Content */}
              <div className="p-6 sm:p-8 space-y-7 text-xs">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. ARTICLE ESSENTIALS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-heading font-black text-sm text-[#0B1528] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FAB10B]" />
                      <span>1. Article Identity & Details</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Step 1 of 4</span>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Article Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Top 10 Reasons Learners Fail the NSW Driving Test"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-bold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                    />

                    {/* Auto Slug Preview */}
                    <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>URL Slug:</span>
                        <span className="font-mono text-slate-700 font-semibold truncate">
                          ezy2learn.com.au/blogs/{slug}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySlug}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-[#0B1528] font-bold shrink-0 ml-2 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Category & Publisher */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] cursor-pointer transition-all"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Quick Chips for Category */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {CATEGORIES.slice(0, 3).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setForm({ ...form, category: cat })}
                            className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                              form.category === cat
                                ? "bg-[#0B1528] text-white border-[#0B1528] font-bold"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                        Author / Publisher Display Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kevin O'Connor (Senior Instructor)"
                        value={form.publisher_name}
                        onChange={(e) => setForm({ ...form, publisher_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                      />

                      {/* Author quick choices */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["Kevin O'Connor", "RMS Senior Assessor", "EZY 2 LEARN Editorial"].map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setForm({ ...form, publisher_name: name })}
                            className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                              form.publisher_name === name
                                ? "bg-[#0B1528] text-white border-[#0B1528] font-bold"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Published Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                        Publication Date
                      </label>
                      <input
                        type="date"
                        value={form.published_date}
                        onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528]"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-medium">Estimated Reading Time:</span>
                        <span className="font-bold text-[#0B1528] bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          ⏱ {readTimeMin} min read ({wordCount} words)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. COVER IMAGE & MEDIA STUDIO */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-heading font-black text-sm text-[#0B1528] flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#FAB10B]" />
                      <span>2. Featured Cover Image</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Step 2 of 4</span>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Cover Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-mono text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528]"
                      />
                      {form.image_url && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image_url: "" })}
                          className="px-3 py-2 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Photo Picker */}
                  <div>
                    <span className="block text-slate-600 font-medium mb-2 text-[11px]">
                      Or choose from Australian driving school presets:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRESET_IMAGES.map((preset) => (
                        <div
                          key={preset.name}
                          onClick={() => setForm({ ...form, image_url: preset.url })}
                          className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-video ${
                            form.image_url === preset.url
                              ? "border-[#FAB10B] ring-2 ring-[#FAB10B]"
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                            <span className="text-[10px] font-bold text-white line-clamp-1">
                              {preset.name}
                            </span>
                          </div>
                          {form.image_url === preset.url && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FAB10B] text-slate-950 flex items-center justify-center font-bold text-[9px]">
                              ✓
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. EXCERPT & RICH BODY STUDIO */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-heading font-black text-sm text-[#0B1528] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FAB10B]" />
                      <span>3. Article Summary & Main Content</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Step 3 of 4</span>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-800 font-bold text-xs">
                        Short Excerpt / Summary <span className="text-rose-500">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-medium ${
                          form.description.length >= 120 && form.description.length <= 160
                            ? "text-emerald-600 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {form.description.length} / 160 chars{" "}
                        {form.description.length >= 120 && form.description.length <= 160
                          ? "(Optimal Length)"
                          : ""}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="A short punchy summary that appears on the blog cards and Google preview..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] resize-none leading-relaxed transition-all"
                    />
                  </div>

                  {/* Main Body */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-slate-800 font-bold text-xs">
                        Main Article Body <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{wordCount} words</span>
                        <span>•</span>
                        <span>{form.body.length} characters</span>
                      </div>
                    </div>

                    {/* Quick Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 rounded-t-xl border border-b-0 border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleInsertFormatting("**Bold Text Here**")}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-2xs"
                        title="Add Bold Text"
                      >
                        <Bold className="w-3 h-3" />
                        <span>Bold</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInsertFormatting("*Italic Text Here*")}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-2xs"
                        title="Add Italic Text"
                      >
                        <Italic className="w-3 h-3" />
                        <span>Italic</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInsertFormatting("\n## Section Heading\n")}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-2xs"
                        title="Add Heading 2"
                      >
                        <Heading2 className="w-3 h-3" />
                        <span>H2</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInsertFormatting("\n### Sub-heading\n")}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-2xs"
                        title="Add Heading 3"
                      >
                        <Heading3 className="w-3 h-3" />
                        <span>H3</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInsertFormatting("\n- Key point\n- Second point\n- Third point\n")}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-2xs"
                        title="Add Bullet List"
                      >
                        <List className="w-3 h-3" />
                        <span>Bullet List</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInsertFormatting("\n1. First step\n2. Second step\n3. Third step\n")}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-2xs"
                        title="Add Step List"
                      >
                        <ListOrdered className="w-3 h-3" />
                        <span>Step List</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleInsertFormatting(
                            "\n> [!TIP] Instructor Pro Tip: Keep your steering hands at 9 and 3 o'clock during reverse parking.\n"
                          )
                        }
                        className="px-2.5 py-1 rounded bg-[#FAB10B]/20 hover:bg-[#FAB10B]/30 text-[#0B1528] font-bold text-[11px] border border-[#FAB10B]/40 flex items-center gap-1 shadow-2xs"
                        title="Add Instructor Tip Box"
                      >
                        <Lightbulb className="w-3 h-3 text-[#0B1528]" />
                        <span>+ Instructor Tip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleInsertFormatting(
                            "\n> [!WARNING] Critical RMS Test Fail: Failing to do a blind spot head-check before moving off.\n"
                          )
                        }
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 flex items-center gap-1 shadow-2xs"
                        title="Add Test Warning Box"
                      >
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>+ Test Warning</span>
                      </button>
                    </div>

                    <textarea
                      rows={14}
                      required
                      placeholder="Write the full comprehensive guide here. Use the formatting buttons above for sections, lists, and tips..."
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      className="w-full p-4 rounded-b-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] transition-all"
                    />
                  </div>
                </div>

                {/* 4. SEO SUITE */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-heading font-black text-sm text-[#0B1528] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#FAB10B]" />
                      <span>4. Search Engine Optimization (SEO Suite)</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Step 4 of 4</span>
                  </div>

                  {/* Focus Keywords */}
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5 text-xs">
                      Focus Keywords & Tags
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. nsw driving test, logbook hours, parallel parking, automatic licence"
                      value={form.focus_keywords}
                      onChange={(e) => setForm({ ...form, focus_keywords: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528]"
                    />
                  </div>

                  {/* SEO Meta Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-800 font-bold text-xs">
                        SEO Meta Title
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              seo_title: `${form.title || "Driving Lesson Guide"} | EZY 2 LEARN Driving School`,
                            })
                          }
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          Auto-fill from Title
                        </button>
                        <span
                          className={`text-[11px] font-medium ${
                            (form.seo_title || form.title).length >= 40 &&
                            (form.seo_title || form.title).length <= 60
                              ? "text-emerald-600 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {(form.seo_title || form.title).length} / 60 chars
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Defaults to: [Article Title] | EZY 2 LEARN Driving School"
                      value={form.seo_title}
                      onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528]"
                    />
                  </div>

                  {/* SEO Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-800 font-bold text-xs">
                        SEO Meta Description
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, seo_description: form.description })}
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          Auto-fill from Excerpt
                        </button>
                        <span
                          className={`text-[11px] font-medium ${
                            (form.seo_description || form.description).length >= 120 &&
                            (form.seo_description || form.description).length <= 160
                              ? "text-emerald-600 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {(form.seo_description || form.description).length} / 160 chars
                        </span>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Defaults to article excerpt for search engines..."
                      value={form.seo_description}
                      onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1528]/15 focus:border-[#0B1528] resize-none"
                    />
                  </div>
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <label className="text-slate-800 font-bold text-xs">Publish Status:</label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          status: form.status === "published" ? "draft" : "published",
                        })
                      }
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        form.status === "published" ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          form.status === "published" ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="font-bold text-xs text-slate-700 capitalize">
                      {form.status === "published" ? "Published (Live)" : "Draft (Hidden)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/blogs"
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Cancel
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleSubmit("draft")}
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors disabled:opacity-75"
                    >
                      Save as Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmit("published")}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-bold text-xs shadow-md transition-all disabled:opacity-75 cursor-pointer group"
                    >
                      <Check className="w-4 h-4 text-[#FAB10B] stroke-[2.5]" />
                      <span>{submitting ? "Saving..." : "✓ Update Article"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE BLOG CARD & GOOGLE SERP PREVIEWS (4 COLS) */}
          <div className="lg:col-span-4 sticky top-6 space-y-5">
            {/* Control Panel Widget */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FAB10B]" />
                  <span>Publishing Controls</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    form.status === "published"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {form.status === "published" ? "Live" : "Draft"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Feature on Homepage</span>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#0B1528] rounded border-slate-300 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Calculated Read Time</span>
                  <span className="font-bold text-slate-900">{readTimeMin} min read</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Total Words</span>
                  <span className="font-bold text-slate-900">{wordCount} words</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Article ID</span>
                  <span className="font-mono text-slate-500 font-bold">#{blogId}</span>
                </div>
              </div>
            </div>

            {/* Front Page Visual Card Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#FAB10B]" />
                  <span>Live Website Card Preview</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Front Page
                </span>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-5 space-y-4 transition-all">
                {/* Visual Cover */}
                <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 relative">
                  {form.image_url ? (
                    <img
                      src={form.image_url}
                      alt={form.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Newspaper className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#0B1528] text-white shadow-xs">
                      {form.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        form.status === "published"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {form.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formattedPublishDate}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{readTimeMin} min read</span>
                  </div>

                  <h3 className="font-heading font-black text-base text-slate-900 leading-tight">
                    {form.title || "Top 10 Reasons Learners Fail the NSW Driving Test"}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {form.description ||
                      "Short excerpt summary will display here to introduce the article to students visiting the website..."}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#07345B] text-[#FAB10B] flex items-center justify-center font-bold text-[10px]">
                        {form.publisher_name ? form.publisher_name.charAt(0) : "K"}
                      </div>
                      <span className="text-slate-600 font-medium">
                        {form.publisher_name || "Kevin O'Connor"}
                      </span>
                    </div>

                    <span className="text-[#07345B] hover:text-[#FAB10B] font-bold transition-colors">
                      Read Article →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="space-y-2">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Search Preview (SERP)</span>
              </span>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#0B1528] text-[8px] text-[#FAB10B] flex items-center justify-center font-bold">
                    E
                  </div>
                  <span className="truncate">ezy2learn.com.au &gt; blogs &gt; {slug}</span>
                </div>

                <h4 className="font-medium text-sm text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                  {form.seo_title || form.title || "Article Headline Placeholder"} | EZY 2 LEARN
                </h4>

                <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {form.seo_description ||
                    form.description ||
                    "Enter article excerpt or SEO meta description to preview how Google displays this guide in search results."}
                </p>
              </div>
            </div>

            {/* Editorial Checklist */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5 text-xs">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                Publishing Quality Checklist
              </span>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      form.title.trim().length > 10 ? "text-emerald-500" : "text-slate-300"
                    }`}
                  />
                  <span>Clear, engaging title</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      form.description.trim().length >= 50 ? "text-emerald-500" : "text-slate-300"
                    }`}
                  />
                  <span>Comprehensive excerpt summary</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${wordCount >= 100 ? "text-emerald-500" : "text-slate-300"}`}
                  />
                  <span>In-depth content body (&gt; 100 words)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${form.image_url ? "text-emerald-500" : "text-slate-300"}`}
                  />
                  <span>High quality cover photo attached</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
