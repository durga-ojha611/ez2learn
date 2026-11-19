"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Modal } from "@/components/common/Modal";
import { apiFetch } from "@/lib/api";
import {
  Monitor,
  Building2,
  Package,
  User,
  ShieldCheck,
  MessageSquare,
  FileText,
  Compass,
  ExternalLink,
  UploadCloud,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Car,
  Clock,
  Award,
  Globe,
  Settings,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

// Curated high-res driving school images for Image Picker
const CURATED_IMAGES = [
  {
    title: "Highway Car Driving (Default)",
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&auto=format&fit=crop&q=80",
    desc: "Sleek sedan driving on scenic highway - matches reference",
  },
  {
    title: "Dual-Control Lesson Car",
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&auto=format&fit=crop&q=80",
    desc: "Modern driving school vehicle on city road",
  },
  {
    title: "Driver in Training",
    url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1920&auto=format&fit=crop&q=80",
    desc: "Hands on steering wheel with open road ahead",
  },
  {
    title: "Sydney Roadway View",
    url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1920&auto=format&fit=crop&q=80",
    desc: "Scenic coastal highway for highway confidence",
  },
];

type SectionKey =
  | "hero"
  | "services"
  | "packages"
  | "about_us"
  | "why_choose_us"
  | "testimonials"
  | "footer"
  | "navbar";

export default function CMSStudioPage() {
  const [activeTab, setActiveTab] = useState<SectionKey>("hero");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Full Sections State
  const [sections, setSections] = useState<Record<string, any>>({
    hero: {
      title: "Drive with Confidence",
      subtitle: "Professional Driving Lessons for a Safer Tomorrow",
      button_text: "Book a Lesson",
      button_link: "/bookings",
      background_image:
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&auto=format&fit=crop&q=80",
      enabled: true,
      status: "published",
    },
    services: {
      title: "Our Driving Training Services",
      subtitle: "Tailored lesson structures designed for absolute beginners and test preparation.",
      enabled: true,
      status: "active",
      items: [
        { title: "Automatic Driving Lessons", desc: "Smooth, stress-free modern automatic vehicle training.", icon: "Car" },
        { title: "Manual Driving Lessons", desc: "Master clutch control, hill starts, and gear sequencing.", icon: "Settings" },
        { title: "RMS Driving Test Warm-Up", desc: "60-min warm-up plus test car hire at your local service centre.", icon: "Award" },
        { title: "Overseas Licence Conversion", desc: "Fast-track transition to a full NSW unrestricted driver licence.", icon: "Globe" },
      ],
    },
    packages: {
      title: "Popular Driving Packages",
      subtitle: "Save more with discounted lesson bundles eligible for 3-for-1 bonus NSW logbook hours.",
      enabled: true,
      status: "active",
      items: [
        { name: "First Timer Trial Lesson", hours: "1 Hour", price: "$70.00", tag: "Introductory" },
        { name: "Complete Beginner Pack", hours: "10 Lessons (30 Logbook Hrs)", price: "$650.00", tag: "Best Value" },
        { name: "RMS Practical Test Day", hours: "2.5 Hours + Test Car", price: "$220.00", tag: "Test Ready" },
      ],
    },
    about_us: {
      title: "About EZY 2 LEARN Driving School",
      subtitle: "Sydney's premier RMS-accredited driving academy guiding over 12,500 students to their P-plates.",
      description: "With over 15 years of instructional excellence in Greater Sydney, our certified instructors teach calm defensive driving techniques that ensure first-time test success and lifelong safety on NSW roads.",
      image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80",
      founder_name: "Kevin O'Connor",
      founder_role: "Head Coach & RMS Accredited Trainer",
      enabled: true,
      status: "active",
    },
    why_choose_us: {
      title: "Why Learn With Us",
      subtitle: "We combine safety, patience, and modern technology to deliver Sydney's highest pass rates.",
      enabled: true,
      status: "active",
      items: [
        { title: "98% First-Time Pass Rate", desc: "Industry-leading first-time practical driving test pass percentage across Sydney.", icon: "CheckCircle2" },
        { title: "3-for-1 Bonus Hours", desc: "1 hour of structured instruction equals 3 hours recorded in your official NSW logbook.", icon: "Clock" },
        { title: "5-Star Dual Control Fleet", desc: "Latest model vehicles equipped with certified dual controls for safety.", icon: "ShieldCheck" },
        { title: "Free Door-to-Door Pickups", desc: "Pickups directly from home, school, campus, or workplace throughout Sydney.", icon: "Car" },
      ],
    },
    testimonials: {
      title: "Student Success Stories",
      subtitle: "Hear from learners who passed their driving tests on the first attempt with EZY 2 LEARN.",
      enabled: true,
      status: "active",
      items: [
        { name: "Sarah Jenkins", suburb: "Castle Hill", stars: 5, quote: "Passed my test on the first go! Kevin made me feel so confident with reverse parallel parking." },
        { name: "David Chen", suburb: "Parramatta", stars: 5, quote: "The mock test routes around Silverwater were 100% accurate. Highly recommended driving school!" },
        { name: "Priya Patel", suburb: "Blacktown", stars: 5, quote: "Converted my overseas licence without any hassles. Patient instructors and great value packages." },
      ],
    },
    footer: {
      title: "Footer Information",
      subtitle: "Manage contact information, legal copyright, and footer links.",
      about_text: "EZY 2 LEARN is Greater Sydney's trusted driving school. RMS accredited instructors, dual-control cars, and comprehensive test preparation.",
      phone: "1300 399 532",
      email: "info@ezy2learn.com.au",
      address: "Suite 4, 32-36 Church Street, Parramatta NSW 2150",
      copyright: "© 2026 EZY 2 LEARN Driving School. All Rights Reserved.",
      abn: "ABN: 84 928 319 402",
      enabled: true,
      status: "active",
    },
    navbar: {
      title: "Navigation Bar",
      subtitle: "Manage top navigation links, logo text, and quick CTA button.",
      logo_text: "EZY 2 LEARN",
      tagline: "Driving School Sydney",
      phone_cta: "1300 399 532",
      cta_text: "Book Now",
      cta_link: "/bookings",
      enabled: true,
      status: "active",
      menu_items: ["Home", "Services", "Packages", "About Us", "Test Centres", "Contact"],
    },
  });

  // Stored backup for Reset button
  const [initialSections, setInitialSections] = useState<Record<string, any>>({});

  // Image Picker Modal
  const [isImagePickerOpen, setIsImagePickerOpen] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>("");

  // Load Content from MySQL Backend API
  const loadPageContent = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/content/page/homepage");
      if (res?.success && res.data?.sections) {
        const dbSec = res.data.sections;
        setSections((prev) => {
          const merged = { ...prev, ...dbSec };
          setInitialSections(JSON.parse(JSON.stringify(merged)));
          return merged;
        });
      }
    } catch (err) {
      console.error("Failed to load page content", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageContent();
  }, []);

  // Save current section to MySQL Backend API
  const handleSaveSection = async (secKey: SectionKey) => {
    setSaving(true);
    try {
      const sectionData = sections[secKey];
      const res = await apiFetch("/api/content/page/homepage", {
        method: "PUT",
        body: JSON.stringify({
          sections: {
            [secKey]: sectionData,
          },
        }),
      });

      if (res?.success) {
        showToast(`Saved ${secKey.replace("_", " ")} changes to database!`, "success");
        setInitialSections((prev) => ({
          ...prev,
          [secKey]: JSON.parse(JSON.stringify(sectionData)),
        }));
      } else {
        showToast(res?.message || "Failed to save changes", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Network error while saving", "error");
    } finally {
      setSaving(false);
    }
  };

  // Reset section to original state
  const handleResetSection = (secKey: SectionKey) => {
    if (initialSections[secKey]) {
      setSections((prev) => ({
        ...prev,
        [secKey]: JSON.parse(JSON.stringify(initialSections[secKey])),
      }));
      showToast(`Reset ${secKey.replace("_", " ")} to saved values!`, "success");
    }
  };

  // Update field helper
  const updateField = (secKey: SectionKey, field: string, value: any) => {
    setSections((prev) => ({
      ...prev,
      [secKey]: {
        ...prev[secKey],
        [field]: value,
      },
    }));
  };

  const navTabs: { key: SectionKey; label: string; icon: any }[] = [
    { key: "hero", label: "Hero Section", icon: Monitor },
    { key: "services", label: "Services", icon: Settings },
    { key: "packages", label: "Packages", icon: Package },
    { key: "about_us", label: "About Us", icon: User },
    { key: "why_choose_us", label: "Why Choose Us", icon: ShieldCheck },
    { key: "testimonials", label: "Testimonials", icon: MessageSquare },
    { key: "footer", label: "Footer", icon: FileText },
    { key: "navbar", label: "Navbar", icon: Compass },
  ];

  const currentHero = sections.hero || {};
  const currentServices = sections.services || {};
  const currentPackages = sections.packages || {};
  const currentAbout = sections.about_us || {};
  const currentWhy = sections.why_choose_us || {};
  const currentTestimonials = sections.testimonials || {};
  const currentFooter = sections.footer || {};
  const currentNavbar = sections.navbar || {};

  return (
    <AdminLayout>
      <div className="space-y-6 w-full min-w-0 pb-16 select-none font-sans">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 text-xs font-bold ${
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
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-700 ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= 1. PAGE HEADER (Matches Reference Image) ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
              Website Content (CMS)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-body mt-0.5">
              Manage your website content easily
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>

        {/* ================= 2. HORIZONTAL TABS BAR (Matches Reference Image) ================= */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FAB10B] text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= 3. TWO-COLUMN EDITOR & LIVE PREVIEW (Matches Reference Image) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: ACTIVE SECTION FORM */}
          <div className="lg:col-span-6 w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#07345B] flex items-center justify-center shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-base text-slate-900 leading-tight">
                    {navTabs.find((t) => t.key === activeTab)?.label}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {activeTab === "hero"
                      ? "Update the main banner content on your website"
                      : `Update the ${activeTab.replace("_", " ")} content on your website`}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Published</span>
              </span>
            </div>

            {/* TAB CONTENT: HERO SECTION (Exact Reference Image UI) */}
            {activeTab === "hero" && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={currentHero.title || ""}
                    onChange={(e) => updateField("hero", "title", e.target.value)}
                    placeholder="Enter main banner title..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] focus:border-[#0B1528] transition-all"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtitle</label>
                  <input
                    type="text"
                    value={currentHero.subtitle || ""}
                    onChange={(e) => updateField("hero", "subtitle", e.target.value)}
                    placeholder="Enter subtitle / description..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] focus:border-[#0B1528] transition-all"
                  />
                </div>

                {/* Primary Button Text + Button Link (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={currentHero.button_text || ""}
                      onChange={(e) => updateField("hero", "button_text", e.target.value)}
                      placeholder="e.g. Book a Lesson"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Button Link</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={currentHero.button_link || ""}
                        onChange={(e) => updateField("hero", "button_link", e.target.value)}
                        placeholder="e.g. /bookings"
                        className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B1528] transition-all"
                      />
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Background Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Background Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Thumbnail Preview */}
                    <div className="relative w-44 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
                      {currentHero.background_image ? (
                        <img
                          src={currentHero.background_image}
                          alt="Hero banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Change Button & Specs */}
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setIsImagePickerOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
                        <span>Change Image</span>
                      </button>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Recommended size: 1920 × 1080px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => updateField("hero", "enabled", !currentHero.enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        currentHero.enabled ? "bg-[#22C55E]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          currentHero.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-700">Enable Section</span>
                  </div>
                </div>

                {/* Action Buttons: Reset & Save Changes */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("hero")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("hero")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SERVICES */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Title</label>
                  <input
                    type="text"
                    value={currentServices.title || ""}
                    onChange={(e) => updateField("services", "title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Subtitle</label>
                  <input
                    type="text"
                    value={currentServices.subtitle || ""}
                    onChange={(e) => updateField("services", "subtitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Services Cards (4)</label>
                  {(currentServices.items || []).map((s: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <input
                        type="text"
                        value={s.title}
                        onChange={(e) => {
                          const items = [...currentServices.items];
                          items[idx].title = e.target.value;
                          updateField("services", "items", items);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                        placeholder="Service Title"
                      />
                      <input
                        type="text"
                        value={s.desc}
                        onChange={(e) => {
                          const items = [...currentServices.items];
                          items[idx].desc = e.target.value;
                          updateField("services", "items", items);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600"
                        placeholder="Service Description"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("services")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("services")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PACKAGES */}
            {activeTab === "packages" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Title</label>
                  <input
                    type="text"
                    value={currentPackages.title || ""}
                    onChange={(e) => updateField("packages", "title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Subtitle</label>
                  <input
                    type="text"
                    value={currentPackages.subtitle || ""}
                    onChange={(e) => updateField("packages", "subtitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Packages (3)</label>
                  {(currentPackages.items || []).map((p: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const items = [...currentPackages.items];
                          items[idx].name = e.target.value;
                          updateField("packages", "items", items);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        placeholder="Package Name"
                      />
                      <input
                        type="text"
                        value={p.hours}
                        onChange={(e) => {
                          const items = [...currentPackages.items];
                          items[idx].hours = e.target.value;
                          updateField("packages", "items", items);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        placeholder="Hours"
                      />
                      <input
                        type="text"
                        value={p.price}
                        onChange={(e) => {
                          const items = [...currentPackages.items];
                          items[idx].price = e.target.value;
                          updateField("packages", "items", items);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-amber-600"
                        placeholder="Price"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("packages")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("packages")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ABOUT US */}
            {activeTab === "about_us" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Heading</label>
                  <input
                    type="text"
                    value={currentAbout.title || ""}
                    onChange={(e) => updateField("about_us", "title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtitle</label>
                  <input
                    type="text"
                    value={currentAbout.subtitle || ""}
                    onChange={(e) => updateField("about_us", "subtitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Description Story</label>
                  <textarea
                    rows={4}
                    value={currentAbout.description || ""}
                    onChange={(e) => updateField("about_us", "description", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Founder Name</label>
                    <input
                      type="text"
                      value={currentAbout.founder_name || ""}
                      onChange={(e) => updateField("about_us", "founder_name", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Founder Role</label>
                    <input
                      type="text"
                      value={currentAbout.founder_role || ""}
                      onChange={(e) => updateField("about_us", "founder_role", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("about_us")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("about_us")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: WHY CHOOSE US */}
            {activeTab === "why_choose_us" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={currentWhy.title || ""}
                    onChange={(e) => updateField("why_choose_us", "title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Key Benefits</label>
                  {(currentWhy.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const items = [...currentWhy.items];
                          items[idx].title = e.target.value;
                          updateField("why_choose_us", "items", items);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                      />
                      <input
                        type="text"
                        value={item.desc}
                        onChange={(e) => {
                          const items = [...currentWhy.items];
                          items[idx].desc = e.target.value;
                          updateField("why_choose_us", "items", items);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("why_choose_us")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("why_choose_us")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TESTIMONIALS */}
            {activeTab === "testimonials" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={currentTestimonials.title || ""}
                    onChange={(e) => updateField("testimonials", "title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Testimonials List</label>
                  {(currentTestimonials.items || []).map((t: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const items = [...currentTestimonials.items];
                            items[idx].name = e.target.value;
                            updateField("testimonials", "items", items);
                          }}
                          className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                          placeholder="Student Name"
                        />
                        <input
                          type="text"
                          value={t.suburb}
                          onChange={(e) => {
                            const items = [...currentTestimonials.items];
                            items[idx].suburb = e.target.value;
                            updateField("testimonials", "items", items);
                          }}
                          className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          placeholder="Suburb"
                        />
                      </div>
                      <input
                        type="text"
                        value={t.quote}
                        onChange={(e) => {
                          const items = [...currentTestimonials.items];
                          items[idx].quote = e.target.value;
                          updateField("testimonials", "items", items);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600"
                        placeholder="Quote text"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("testimonials")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("testimonials")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FOOTER */}
            {activeTab === "footer" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">About Text</label>
                  <textarea
                    rows={2}
                    value={currentFooter.about_text || ""}
                    onChange={(e) => updateField("footer", "about_text", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="text"
                      value={currentFooter.phone || ""}
                      onChange={(e) => updateField("footer", "phone", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="text"
                      value={currentFooter.email || ""}
                      onChange={(e) => updateField("footer", "email", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Address</label>
                  <input
                    type="text"
                    value={currentFooter.address || ""}
                    onChange={(e) => updateField("footer", "address", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Copyright Text</label>
                  <input
                    type="text"
                    value={currentFooter.copyright || ""}
                    onChange={(e) => updateField("footer", "copyright", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("footer")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("footer")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NAVBAR */}
            {activeTab === "navbar" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Logo Text</label>
                    <input
                      type="text"
                      value={currentNavbar.logo_text || ""}
                      onChange={(e) => updateField("navbar", "logo_text", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tagline</label>
                    <input
                      type="text"
                      value={currentNavbar.tagline || ""}
                      onChange={(e) => updateField("navbar", "tagline", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">CTA Text</label>
                    <input
                      type="text"
                      value={currentNavbar.cta_text || ""}
                      onChange={(e) => updateField("navbar", "cta_text", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone CTA</label>
                    <input
                      type="text"
                      value={currentNavbar.phone_cta || ""}
                      onChange={(e) => updateField("navbar", "phone_cta", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleResetSection("navbar")}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSection("navbar")}
                    className="px-5 py-2 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW (Exact Match to Reference Image) */}
          <div className="lg:col-span-6 w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-heading font-black text-base text-slate-900 tracking-tight">
                  Live Preview
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Synchronized with Website
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-950 shadow-md">
              {/* HERO LIVE PREVIEW (Exact Match to User Reference Image) */}
              {activeTab === "hero" && (
                <div className="relative min-h-[380px] sm:min-h-[420px] flex flex-col justify-center px-6 sm:px-10 py-10 overflow-hidden">
                  {/* Background Image with Dark Vignette */}
                  {currentHero.background_image && (
                    <img
                      src={currentHero.background_image}
                      alt="Hero Live Preview"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />

                  {/* Banner Content */}
                  <div className="relative z-10 max-w-sm sm:max-w-md space-y-4">
                    {/* Gold Accent Bar */}
                    <div className="w-12 h-1 bg-[#FAB10B] rounded-full" />

                    {/* Title in Cinzel Font */}
                    <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight drop-shadow-sm">
                      {currentHero.title || "Drive with Confidence"}
                    </h2>

                    {/* Subtitle in Roboto Font */}
                    <p className="font-body text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow-xs">
                      {currentHero.subtitle ||
                        "Professional Driving Lessons for a Safer Tomorrow"}
                    </p>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#e2a009] text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-transform cursor-pointer">
                        <span>{currentHero.button_text || "Book a Lesson"}</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>

                  {/* Carousel Indicator Dots (as shown in reference image) */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FAB10B]" />
                    <span className="w-2 h-2 rounded-full bg-white/70" />
                    <span className="w-2 h-2 rounded-full bg-white/70" />
                  </div>
                </div>
              )}

              {/* SERVICES LIVE PREVIEW */}
              {activeTab === "services" && (
                <div className="p-6 bg-slate-900 text-white min-h-[380px] flex flex-col justify-center space-y-4">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-1 bg-[#FAB10B] mx-auto rounded-full" />
                    <h3 className="font-heading font-black text-xl text-white">
                      {currentServices.title}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      {currentServices.subtitle}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    {(currentServices.items || []).map((s: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                        <p className="font-bold text-xs text-[#FAB10B]">{s.title}</p>
                        <p className="text-[10px] text-slate-300 line-clamp-2">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PACKAGES LIVE PREVIEW */}
              {activeTab === "packages" && (
                <div className="p-6 bg-slate-900 text-white min-h-[380px] flex flex-col justify-center space-y-4">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-1 bg-[#FAB10B] mx-auto rounded-full" />
                    <h3 className="font-heading font-black text-xl text-white">
                      {currentPackages.title}
                    </h3>
                    <p className="text-xs text-slate-400">{currentPackages.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {(currentPackages.items || []).map((p: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/10 border border-white/10 text-center space-y-1">
                        <span className="text-[9px] font-bold text-[#FAB10B] uppercase">{p.tag}</span>
                        <p className="font-bold text-xs text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-300">{p.hours}</p>
                        <p className="font-heading font-black text-sm text-[#FAB10B]">{p.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABOUT US LIVE PREVIEW */}
              {activeTab === "about_us" && (
                <div className="p-6 bg-slate-900 text-white min-h-[380px] flex flex-col justify-center space-y-3">
                  <div className="w-10 h-1 bg-[#FAB10B] rounded-full" />
                  <h3 className="font-heading font-black text-xl text-white">
                    {currentAbout.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-body leading-relaxed">
                    {currentAbout.description}
                  </p>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#FAB10B]">{currentAbout.founder_name}</p>
                      <p className="text-[10px] text-slate-400">{currentAbout.founder_role}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">12,500+ Students</span>
                  </div>
                </div>
              )}

              {/* WHY CHOOSE US LIVE PREVIEW */}
              {activeTab === "why_choose_us" && (
                <div className="p-6 bg-slate-900 text-white min-h-[380px] flex flex-col justify-center space-y-4">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-1 bg-[#FAB10B] mx-auto rounded-full" />
                    <h3 className="font-heading font-black text-xl text-white">
                      {currentWhy.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(currentWhy.items || []).map((w: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                        <p className="font-bold text-xs text-[#FAB10B]">✔ {w.title}</p>
                        <p className="text-[10px] text-slate-300">{w.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TESTIMONIALS LIVE PREVIEW */}
              {activeTab === "testimonials" && (
                <div className="p-6 bg-slate-900 text-white min-h-[380px] flex flex-col justify-center space-y-3">
                  <div className="w-10 h-1 bg-[#FAB10B] mx-auto rounded-full" />
                  <h3 className="font-heading font-black text-xl text-white text-center">
                    {currentTestimonials.title}
                  </h3>
                  <div className="space-y-2 pt-1">
                    {(currentTestimonials.items || []).map((t: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{t.name} ({t.suburb})</span>
                          <span className="text-xs text-[#FAB10B]">★★★★★</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic">"{t.quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FOOTER LIVE PREVIEW */}
              {activeTab === "footer" && (
                <div className="p-6 bg-[#04203A] text-white min-h-[380px] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-heading font-black text-lg text-white">EZY 2 LEARN</h4>
                    <p className="text-xs text-slate-300">{currentFooter.about_text}</p>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>📞 {currentFooter.phone}</p>
                    <p>✉ {currentFooter.email}</p>
                    <p>📍 {currentFooter.address}</p>
                  </div>
                  <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 flex justify-between">
                    <span>{currentFooter.copyright}</span>
                    <span>{currentFooter.abn}</span>
                  </div>
                </div>
              )}

              {/* NAVBAR LIVE PREVIEW */}
              {activeTab === "navbar" && (
                <div className="p-6 bg-[#07345B] text-white min-h-[380px] flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <div>
                      <p className="font-heading font-black text-base text-white">{currentNavbar.logo_text}</p>
                      <p className="text-[9px] text-[#FAB10B]">{currentNavbar.tagline}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-xs text-slate-200">
                      {(currentNavbar.menu_items || []).slice(0, 4).map((m: string) => (
                        <span key={m} className="hover:text-white cursor-pointer">{m}</span>
                      ))}
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-[#FAB10B] text-slate-950 font-bold text-xs">
                      {currentNavbar.cta_text}
                    </span>
                  </div>
                  <div className="text-center text-xs text-slate-300 py-6">
                    Previewing navigation bar layout as seen on public website header.
                  </div>
                  <div className="text-[11px] text-slate-400 text-center">
                    Call Direct: {currentNavbar.phone_cta}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= 4. COLLAPSIBLE ACCORDION LIST (Matches Reference Image) ================= */}
        <div className="space-y-2.5 pt-2">
          {[
            {
              id: "services",
              title: "Services Section",
              subtitle: "Manage the services section content",
              icon: Building2,
              tabKey: "services" as SectionKey,
            },
            {
              id: "packages",
              title: "Packages Section",
              subtitle: "Manage driving packages section",
              icon: Package,
              tabKey: "packages" as SectionKey,
            },
            {
              id: "about_us",
              title: "About Us Section",
              subtitle: "Update about us content",
              icon: User,
              tabKey: "about_us" as SectionKey,
            },
            {
              id: "footer",
              title: "Footer Section",
              subtitle: "Manage footer information",
              icon: FileText,
              tabKey: "footer" as SectionKey,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedAccordion === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                {/* Accordion Row Header */}
                <div
                  onClick={() => {
                    setExpandedAccordion(isExpanded ? null : item.id);
                    setActiveTab(item.tabKey);
                  }}
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#07345B] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-black text-sm text-slate-900 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Inline Quick Preview / Action */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 animate-fade-in">
                    <p className="text-xs text-slate-600">
                      Editing <strong>{item.title}</strong> in the active editor above.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(item.tabKey);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0B1528] text-white font-bold text-xs hover:bg-[#152544] transition-colors cursor-pointer"
                      >
                        Open in Main Editor ↑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ================= MODAL: CHANGE IMAGE PICKER ================= */}
        {isImagePickerOpen && (
          <Modal
            isOpen={isImagePickerOpen}
            onClose={() => setIsImagePickerOpen(false)}
            title="Choose Background Image"
            maxWidth="lg"
          >
            <div className="space-y-4 text-xs font-sans">
              <p className="text-slate-600">
                Select a high-resolution background image for your Hero Banner or enter a custom URL:
              </p>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CURATED_IMAGES.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      updateField("hero", "background_image", img.url);
                      setIsImagePickerOpen(false);
                      showToast(`Selected "${img.title}"! Remember to save changes.`);
                    }}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                      currentHero.background_image === img.url
                        ? "border-[#FAB10B] ring-2 ring-[#FAB10B] bg-amber-50/30"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="relative h-28 rounded-xl overflow-hidden mb-2 bg-slate-100">
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                      {currentHero.background_image === img.url && (
                        <span className="absolute top-2 right-2 bg-[#FAB10B] text-slate-950 p-1 rounded-full shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900">{img.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{img.desc}</p>
                  </div>
                ))}
              </div>

              {/* Custom URL Input */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-slate-700 font-bold mb-1">Or paste a custom image URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B1528]"
                  />
                  <button
                    type="button"
                    disabled={!customImageUrl.trim()}
                    onClick={() => {
                      if (customImageUrl.trim()) {
                        updateField("hero", "background_image", customImageUrl.trim());
                        setCustomImageUrl("");
                        setIsImagePickerOpen(false);
                        showToast("Custom image applied! Remember to save changes.");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B1528] text-white font-bold text-xs hover:bg-[#152544] disabled:opacity-50 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
