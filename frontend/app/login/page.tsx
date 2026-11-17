"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Car } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ezy2learn.com.au");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: "Super Admin", email: "admin@ezy2learn.com.au", desc: "Full Access" },
    { role: "Booking Manager", email: "bookings@ezy2learn.com.au", desc: "Lessons & Schedules" },
    { role: "Instructor Coord.", email: "instructors@ezy2learn.com.au", desc: "Instructors & Cars" },
    { role: "Finance Viewer", email: "finance@ezy2learn.com.au", desc: "Payments & Reports" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data) {
        setAuthSession(res.data.token, res.data.user);
        router.replace("/dashboard");
      } else {
        setError(res.message || "Invalid login credentials");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (accEmail: string) => {
    setEmail(accEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block">
            <img
              src="/logo.png"
              alt="EZY 2 LEARN Driving School"
              className="h-16 sm:h-20 w-auto mx-auto object-contain mb-3 drop-shadow-2xs"
            />
          </Link>
          <p className="text-xs sm:text-sm text-textSecondary font-medium">
            Driving School Sydney — Central Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="card-clean p-6 sm:p-8 shadow-card">
          <div className="mb-6">
            <h2 className="font-heading text-card-heading text-navy-900">Sign in to your account</h2>
            <p className="text-[13px] text-textSecondary mt-1">
              Authorised administrative personnel only.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-textSecondary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ezy2learn.com.au"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderSubtle text-sm text-textPrimary bg-white focus:outline-none focus:ring-1 focus:ring-navy-900 transition-all placeholder:text-textSecondary/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-textSecondary" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderSubtle text-sm text-textPrimary bg-white focus:outline-none focus:ring-1 focus:ring-navy-900 transition-all placeholder:text-textSecondary/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3 px-4 shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4 text-brandYellow-400" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Accounts Quick-Select */}
          <div className="mt-6 pt-5 border-t border-borderSubtle">
            <p className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider mb-2.5 text-center">
              Quick Login Demo Profiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectDemoAccount(acc.email)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    email === acc.email
                      ? "border-navy-900 bg-navy-50 text-navy-900 font-semibold shadow-xs"
                      : "border-borderSubtle hover:bg-navy-50/50 text-navy-900 bg-white"
                  }`}
                >
                  <div className="font-semibold text-navy-900">{acc.role}</div>
                  <div className="text-[10px] text-textSecondary truncate">{acc.desc}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-center text-textSecondary mt-2.5">
              Password for all demo accounts: <code className="font-semibold text-navy-900 bg-navy-50 px-1 py-0.5 rounded">password123</code>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-textSecondary font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>NSW Transport Accredited Driving System — TLS 256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
}

