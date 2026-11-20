"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Phone,
  Calendar,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Award,
  Lock,
} from "lucide-react";

interface LandingNavbarProps {
  phone?: string;
  logoText?: string;
  tagline?: string;
  onBookClick?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  phone = "1300 399 532",
  logoText = "EZY 2 LEARN",
  tagline = "Driving School Sydney",
  onBookClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Driving Lessons", href: "/#driving-lessons" },
    { name: "Instructors", href: "/our-instructors" },
    { name: "Packages", href: "/#packages" },
    { name: "Why Us", href: "/#why-choose-us" },
    { name: "Reviews", href: "/#reviews" },
    { name: "Contact", href: "/#inquiry" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") && window.location.pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/", "");
      const el = document.querySelector(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#07345B] text-white text-xs py-2 px-4 sm:px-8 border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAB10B] text-[#07345B] font-bold text-[10px] tracking-wide uppercase">
              <Award className="w-3 h-3" /> RMS Accredited
            </span>
            <span className="text-slate-200 font-medium hidden md:inline">
              Sydney&apos;s #1 Driving School • 3-for-1 NSW Logbook Bonus Hours
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-200">
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:text-[#FAB10B] font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#FAB10B]" />
              <span>Call Us: {phone}</span>
            </a>
            <span className="text-white/30 hidden sm:inline">•</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FAB10B]" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3"
            : "bg-white border-b border-slate-100 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-xl bg-[#07345B] text-[#FAB10B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xl sm:text-2xl text-[#07345B] tracking-tight">
                  {logoText}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FAB10B]"></span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-0.5">
                {tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Primary"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#07345B] hover:bg-slate-50 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="hidden xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-[#07345B] hover:border-slate-300 text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#07345B]" />
              <span>{phone}</span>
            </a>

            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FAB10B] hover:bg-[#e2a008] text-[#07345B] font-heading font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <Calendar className="w-4 h-4 text-[#07345B] transition-transform group-hover:scale-110" />
              <span>Book a Lesson</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/book"
              className="px-3 py-2 rounded-lg bg-[#FAB10B] text-[#07345B] font-heading font-bold text-xs shrink-0"
            >
              Book
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[2]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2]" />
              )}
            </button>
          </div>
        </div>

        {/* 3. MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav"
            className="lg:hidden bg-white border-t border-slate-200 px-5 py-4 space-y-3 animate-fadeIn"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile Primary">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-[#07345B] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs"
              >
                <Phone className="w-4 h-4 text-[#07345B]" />
                <span>Call {phone}</span>
              </a>

              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#07345B]" />
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
