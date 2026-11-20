"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Direct Admin access enabled - immediately navigate to dashboard
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center">
        <img
          src="/logo.png"
          alt="EZY 2 LEARN Driving School"
          className="h-16 w-auto mx-auto object-contain mb-4"
        />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Direct Admin Access Enabled</span>
        </div>
        <h1 className="text-xl font-heading font-black text-slate-900 mb-2">
          Entering Admin Portal
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Login requirement is bypassed. Redirecting you straight to the Admin Dashboard...
        </p>

        <Link
          href="/dashboard"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#07345B] hover:bg-[#0B1528] text-white font-heading font-bold text-sm shadow-md transition-all"
        >
          <LayoutDashboard className="w-4 h-4 text-[#FAB10B]" />
          <span>Open Dashboard Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
