"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageHeading } from "@/components/common/PageHeading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  Globe,
  Home,
  Info,
  HelpCircle,
  BookOpen,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

export default function WebsiteContentPage() {
  const [activeTab, setActiveTab] = useState<"homepage" | "about" | "faqs" | "blogs" | "gallery">("homepage");
  const [saving, setSaving] = useState(false);

  // Homepage CMS
  const [homeData, setHomeData] = useState<any>({
    title: "",
    sections: {
      hero: { heading: "", subheading: "", cta_text: "", cta_phone: "", banner_badge: "" },
      about_preview: { heading: "", description: "" },
    },
  });

  // FAQs
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqForm, setFaqForm] = useState({ category: "General", question: "", answer: "", sort_order: 1 });

  // Blogs
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    author_name: "EZY 2 LEARN Driving Team",
    category: "Driving Tips",
    summary: "",
    content: "",
    status: "published",
    featured_image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
  });

  // Gallery
  const [gallery, setGallery] = useState<any[]>([]);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    image_url: "",
    caption: "",
    category: "student_passes",
  });

  useEffect(() => {
    loadTabContent();
  }, [activeTab]);

  const loadTabContent = async () => {
    try {
      if (activeTab === "homepage") {
        const res = await apiFetch("/api/content/page/homepage");
        if (res.success && res.data) {
          setHomeData(res.data);
        }
      } else if (activeTab === "about") {
        const res = await apiFetch("/api/content/page/about");
        if (res.success && res.data) {
          setHomeData(res.data);
        }
      } else if (activeTab === "faqs") {
        const res = await apiFetch("/api/content/faqs");
        if (res.success) setFaqs(res.data || []);
      } else if (activeTab === "blogs") {
        const res = await apiFetch("/api/content/blogs");
        if (res.success) setBlogs(res.data || []);
      } else if (activeTab === "gallery") {
        const res = await apiFetch("/api/content/gallery");
        if (res.success) setGallery(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePage = async (pageKey: string) => {
    setSaving(true);
    try {
      await apiFetch(`/api/content/page/${pageKey}`, {
        method: "PUT",
        body: JSON.stringify(homeData),
      });
      alert("Page content successfully published!");
    } catch (err: any) {
      alert(err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaqId) {
        await apiFetch(`/api/content/faqs/${editingFaqId}`, {
          method: "PUT",
          body: JSON.stringify(faqForm),
        });
      } else {
        await apiFetch("/api/content/faqs", {
          method: "POST",
          body: JSON.stringify(faqForm),
        });
      }
      setFaqModalOpen(false);
      loadTabContent();
    } catch (err: any) {
      alert(err.message || "Failed to save FAQ");
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await apiFetch(`/api/content/faqs/${id}`, { method: "DELETE" });
      loadTabContent();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlogId) {
        await apiFetch(`/api/content/blogs/${editingBlogId}`, {
          method: "PUT",
          body: JSON.stringify(blogForm),
        });
      } else {
        await apiFetch("/api/content/blogs", {
          method: "POST",
          body: JSON.stringify(blogForm),
        });
      }
      setBlogModalOpen(false);
      loadTabContent();
    } catch (err: any) {
      alert(err.message || "Failed to save article");
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    try {
      await apiFetch(`/api/content/blogs/${id}`, { method: "DELETE" });
      loadTabContent();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/content/gallery", {
        method: "POST",
        body: JSON.stringify(galleryForm),
      });
      setGalleryModalOpen(false);
      loadTabContent();
    } catch (err: any) {
      alert(err.message || "Failed to add image");
    }
  };

  const handleDeleteGallery = async (id: number) => {
    if (!confirm("Delete this gallery image?")) return;
    try {
      await apiFetch(`/api/content/gallery/${id}`, { method: "DELETE" });
      loadTabContent();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 select-none pb-16">
        {/* Page Title with Full-Width Rectangle Badge Heading */}
        <PageHeading
          icon={Globe}
          title="Website CMS & Content"
          subtitle="Live editor for public marketing pages, FAQs, policies, and pass gallery"
          badge="ezy2learn.com.au"
          actions={
            activeTab === "faqs" ? (
              <button
                onClick={() => {
                  setEditingFaqId(null);
                  setFaqForm({ question: "", answer: "", category: "General", sort_order: 1 });
                  setFaqModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <span>+ Add FAQ</span>
              </button>
            ) : activeTab === "blogs" ? (
              <button
                onClick={() => {
                  setEditingBlogId(null);
                  setBlogForm({
                    title: "",
                    author_name: "EZY 2 LEARN Driving Team",
                    category: "Driving Tips",
                    summary: "",
                    content: "",
                    status: "published",
                    featured_image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
                  });
                  setBlogModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <span>+ New Article</span>
              </button>
            ) : activeTab === "gallery" ? (
              <button
                onClick={() => setGalleryModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <span>+ Add Photo</span>
              </button>
            ) : (
              <button
                onClick={() => handleSavePage(activeTab)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#07345B] text-white font-heading font-bold text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{saving ? "Saving..." : "Save published changes"}</span>
              </button>
            )
          }
        />

        {/* 4 Stat KPI Cards matching Reference Image */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Published pages</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              14
            </div>
            <span className="font-sans text-xs font-bold text-emerald-600 mt-1 block">Live portal</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Blog articles</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {blogs.length || 28}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">FAQs answered</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              {faqs.length || 32}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <span className="font-sans text-xs font-semibold text-slate-500">Pass gallery photos</span>
            <div className="font-heading font-black text-3xl text-slate-900 mt-1">
              116
            </div>
          </div>
        </div>

        {/* Filter Pills matching Reference Image */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
          {[
            { key: "homepage", label: "Homepage Hero & Banners" },
            { key: "about", label: "About Us & Stats" },
            { key: "faqs", label: `FAQs Manager (${faqs.length})` },
            { key: "blogs", label: `Learner Blog Articles (${blogs.length})` },
            { key: "gallery", label: "Pass Celebration Gallery" },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-1.5 rounded-full font-heading font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#0B1528] text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 1. HOMEPAGE TAB */}
        {activeTab === "homepage" && (
          <div className="card-premium p-6 max-w-3xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                Homepage Hero Section & Call-to-Actions
              </h3>
              <button
                onClick={() => handleSavePage("homepage")}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4 text-brandYellow-500" />
                <span>{saving ? "Publishing..." : "Save & Publish"}</span>
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Hero Heading Title
              </label>
              <input
                type="text"
                value={homeData.sections?.hero?.heading || ""}
                onChange={(e) =>
                  setHomeData({
                    ...homeData,
                    sections: {
                      ...homeData.sections,
                      hero: { ...homeData.sections?.hero, heading: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-borderSubtle bg-white text-textPrimary text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Hero Subheading Description
              </label>
              <textarea
                rows={3}
                value={homeData.sections?.hero?.subheading || ""}
                onChange={(e) =>
                  setHomeData({
                    ...homeData,
                    sections: {
                      ...homeData.sections,
                      hero: { ...homeData.sections?.hero, subheading: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Primary CTA Button
                </label>
                <input
                  type="text"
                  value={homeData.sections?.hero?.cta_text || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      sections: {
                        ...homeData.sections,
                        hero: { ...homeData.sections?.hero, cta_text: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Direct Phone CTA
                </label>
                <input
                  type="text"
                  value={homeData.sections?.hero?.cta_phone || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      sections: {
                        ...homeData.sections,
                        hero: { ...homeData.sections?.hero, cta_phone: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Top Banner Badge
                </label>
                <input
                  type="text"
                  value={homeData.sections?.hero?.banner_badge || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      sections: {
                        ...homeData.sections,
                        hero: { ...homeData.sections?.hero, banner_badge: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. FAQS TAB */}
        {activeTab === "faqs" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingFaqId(null);
                  setFaqForm({ category: "General", question: "", answer: "", sort_order: 1 });
                  setFaqModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4 text-brandYellow-500" />
                <span>Add FAQ Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="card-premium p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {faq.category}
                      </span>
                      <StatusBadge status={faq.is_published ? "published" : "draft"} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-navy-900 mb-2">{faq.question}</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">{faq.answer}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingFaqId(faq.id);
                        setFaqForm({
                          category: faq.category,
                          question: faq.question,
                          answer: faq.answer,
                          sort_order: faq.sort_order,
                        });
                        setFaqModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BLOGS TAB */}
        {activeTab === "blogs" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingBlogId(null);
                  setBlogForm({
                    title: "",
                    author_name: "EZY 2 LEARN Driving Team",
                    category: "Driving Tips",
                    summary: "",
                    content: "",
                    status: "published",
                    featured_image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
                  });
                  setBlogModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4 text-brandYellow-500" />
                <span>Write Article</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.map((b) => (
                <div key={b.id} className="card-premium overflow-hidden flex flex-col justify-between">
                  <div>
                    <img src={b.featured_image} className="h-40 w-full object-cover" />
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-brandYellow-700 bg-brandYellow-50 px-2 py-0.5 rounded-full border border-brandYellow-200 uppercase">
                          {b.category}
                        </span>
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                      <h4 className="text-sm font-bold text-navy-900 mb-1 leading-snug">{b.title}</h4>
                      <p className="text-xs text-textSecondary line-clamp-3 mb-2">{b.summary || b.content}</p>
                      <span className="text-[10px] text-slate-400">By {b.author_name} • {formatDate(b.published_at || b.created_at)}</span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingBlogId(b.id);
                        setBlogForm({
                          title: b.title,
                          author_name: b.author_name,
                          category: b.category,
                          summary: b.summary || "",
                          content: b.content,
                          status: b.status,
                          featured_image: b.featured_image,
                        });
                        setBlogModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. GALLERY TAB */}
        {activeTab === "gallery" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setGalleryForm({
                    title: "",
                    image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
                    caption: "",
                    category: "student_passes",
                  });
                  setGalleryModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-navy-800 flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4 text-brandYellow-500" />
                <span>Upload to Gallery</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((item) => (
                <div key={item.id} className="card-premium overflow-hidden group">
                  <div className="relative h-44 w-full">
                    <img src={item.image_url} className="h-full w-full object-cover" />
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-navy-950/70 text-white hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3 text-xs">
                    <h5 className="font-bold text-navy-900 truncate">{item.title}</h5>
                    <p className="text-[11px] text-textSecondary truncate">{item.caption || item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQ Modal */}
      <Modal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={editingFaqId ? "Edit FAQ Item" : "Add Frequently Asked Question"}
        subtitle="Manage driving questions displayed on the website FAQ section."
        maxWidth="md"
      >
        <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
            <input
              type="text"
              required
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Question</label>
            <input
              type="text"
              required
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Answer</label>
            <textarea
              rows={4}
              required
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-borderSubtle">
            <button
              type="button"
              onClick={() => setFaqModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-borderSubtle font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800"
            >
              Save FAQ
            </button>
          </div>
        </form>
      </Modal>

      {/* Blog Modal */}
      <Modal
        isOpen={blogModalOpen}
        onClose={() => setBlogModalOpen(false)}
        title={editingBlogId ? "Edit Blog Article" : "Write Driving Guide Article"}
        subtitle="Educational guides, test tips, and road safety articles."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Article Title</label>
            <input
              type="text"
              required
              value={blogForm.title}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary font-semibold text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Author Name</label>
              <input
                type="text"
                required
                value={blogForm.author_name}
                onChange={(e) => setBlogForm({ ...blogForm, author_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={blogForm.category}
                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
              >
                <option value="Driving Tips">Driving Tips</option>
                <option value="Test Preparation">Test Preparation</option>
                <option value="Learner Guides">Learner Guides</option>
                <option value="NSW Road Rules">NSW Road Rules</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={blogForm.status}
                onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary font-semibold"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Featured Image URL</label>
            <input
              type="url"
              required
              value={blogForm.featured_image}
              onChange={(e) => setBlogForm({ ...blogForm, featured_image: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Summary Excerpt</label>
            <textarea
              rows={2}
              value={blogForm.summary}
              onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Article Body</label>
            <textarea
              rows={6}
              required
              value={blogForm.content}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-borderSubtle">
            <button
              type="button"
              onClick={() => setBlogModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-borderSubtle font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800"
            >
              Publish Article
            </button>
          </div>
        </form>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        title="Add Image to Gallery"
        subtitle="Showcase learner driving test passes and 5-star ANCAP cars."
        maxWidth="md"
      >
        <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Image Title</label>
            <input
              type="text"
              required
              value={galleryForm.title}
              onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
              placeholder="e.g. Jason passing test at Castle Hill Service NSW"
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Image URL</label>
            <input
              type="url"
              required
              value={galleryForm.image_url}
              onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
            <select
              value={galleryForm.category}
              onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-borderSubtle bg-white text-textPrimary"
            >
              <option value="student_passes">Student Test Passes</option>
              <option value="dual_control_cars">Dual Control Cars</option>
              <option value="training_sessions">Training Sessions</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-borderSubtle">
            <button
              type="button"
              onClick={() => setGalleryModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-borderSubtle font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800"
            >
              Add to Gallery
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

