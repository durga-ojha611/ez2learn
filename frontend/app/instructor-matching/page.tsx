"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Modal } from "@/components/common/Modal";
import { apiFetch } from "@/lib/api";
import { formatAUD } from "@/lib/utils";
import { Suburb } from "@/types";
import {
  Sparkles,
  MapPin,
  Car,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Check,
  ChevronDown,
} from "lucide-react";

export default function InstructorMatchingPage() {
  const router = useRouter();

  // Filter criteria
  const [suburb, setSuburb] = useState("Parramatta");
  const [postcode, setPostcode] = useState("2150");
  const [transmission, setTransmission] = useState("automatic");
  const [gender, setGender] = useState("any");
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [maxRate, setMaxRate] = useState<number | "">("");

  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Compare Modal
  const [compareList, setCompareList] = useState<any[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  useEffect(() => {
    loadSuburbs();
    runMatching();
  }, []);

  const loadSuburbs = async () => {
    try {
      const res = await apiFetch("/api/locations");
      setSuburbs(res.data?.suburbs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const runMatching = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/matching", {
        params: {
          suburb,
          postcode,
          transmission,
          gender,
          lesson_date: lessonDate,
          start_time: startTime,
          duration_minutes: durationMinutes,
          max_rate: maxRate || undefined,
        },
      });

      if (res.success) {
        setMatches(res.data?.instructors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompare = (instructor: any) => {
    if (compareList.some((c) => c.instructor_id === instructor.instructor_id)) {
      setCompareList(compareList.filter((c) => c.instructor_id !== instructor.instructor_id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 instructors at a time.");
        return;
      }
      setCompareList([...compareList, instructor]);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full select-none pb-12">
        {/* Top Header Bar matching DriveHub style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Instructor Matching
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
              Automated proximity dispatch and student-instructor pairing engine
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {compareList.length > 0 && (
              <button
                onClick={() => setCompareModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200/90 shadow-sm transition-all"
              >
                Compare ({compareList.length}) Selected
              </button>
            )}

            <button
              onClick={runMatching}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              Run Auto-Match
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0B1528] text-white flex items-center justify-center text-xs font-bold shadow-sm ml-1">
              AD
            </div>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Unassigned bookings</p>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-1.5">
              8
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#16A34A] mt-2">
              Live queue
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Match accuracy</p>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-1.5">
              98.4%
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#4F46E5] mt-2">
              Verified
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Available instructors</p>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-1.5">
              16
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] mt-2">
              Sydney West
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Avg dispatch</p>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-1.5">
              4 mins
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 mt-2">
              Real-time
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "automatic", label: "Automatic Transmission" },
            { key: "manual", label: "Manual Transmission" },
            { key: "any", label: "All Vehicles" },
          ].map((tab) => {
            const isSelected = transmission === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTransmission(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#0B1528] text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Matching Results Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-black text-slate-900 text-lg">
              Matching Results ({matches.length} Certified Instructors Found)
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Sorted by highest compatibility score &amp; availability
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Calculating real-time availability and service coverage...
            </div>
          ) : matches.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No instructors match the specified criteria. Try expanding transmission or rate filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((m) => {
                const isSelectedForCompare = compareList.some(
                  (c) => c.instructor_id === m.instructor_id
                );

                const initials = m.name
                  ? m.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "IN";

                return (
                  <div
                    key={m.instructor_id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      {/* Top Bar: Compatibility Badge & Availability */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-bold">
                          {m.match_score}% Match
                        </span>

                        {m.is_available ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-2.5 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" /> Conflict
                          </span>
                        )}
                      </div>

                      {/* Instructor Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{m.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{m.rating}</span>
                            <span className="text-slate-400 font-normal">
                              ({m.total_reviews} reviews)
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {m.experience_years} years teaching in Sydney
                          </span>
                        </div>
                      </div>

                      {/* Match Reasons Tags */}
                      <div className="space-y-1 mb-4">
                        {m.match_reasons.map((reason: string, rIdx: number) => (
                          <div
                            key={rIdx}
                            className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium"
                          >
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      {/* Rate and vehicle specs */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Vehicle:</span>
                          <span className="font-semibold text-slate-800">{m.vehicle}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Transmission:</span>
                          <span className="font-semibold text-slate-800 capitalize">
                            {m.transmission}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Rate:</span>
                          <span className="font-bold text-slate-900">
                            {formatAUD(m.hourly_rate)} / hr
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => toggleCompare(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          isSelectedForCompare
                            ? "bg-[#0B1528] text-white border-[#0B1528]"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isSelectedForCompare ? "✓ Added" : "Compare"}
                      </button>

                      <button
                        disabled={!m.is_available}
                        onClick={() =>
                          router.push(
                            `/bookings?create=true&instructor_id=${m.instructor_id}&suburb=${suburb}`
                          )
                        }
                        className="flex-1 py-1.5 px-3 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors text-center shadow-sm"
                      >
                        {m.is_available ? "Assign Instructor" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side Compare Modal */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Side-by-Side Instructor Comparison"
        subtitle={`Comparing ${compareList.length} instructors for ${suburb} NSW`}
        maxWidth="3xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {compareList.map((inst) => {
            const initials = inst.name
              ? inst.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "IN";

            return (
              <div
                key={inst.instructor_id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center text-sm font-bold mx-auto mb-2">
                    {initials}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{inst.name}</h4>
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-bold mt-0.5">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{inst.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200/60 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Match Score</span>
                    <span className="font-bold text-emerald-600">{inst.match_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hourly Rate</span>
                    <span className="font-bold text-slate-900">
                      {formatAUD(inst.hourly_rate)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience</span>
                    <span className="font-bold text-slate-900">{inst.experience_years} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-bold text-slate-900">{inst.vehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transmission</span>
                    <span className="font-bold text-slate-900 capitalize">{inst.transmission}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCompareModalOpen(false);
                    router.push(
                      `/bookings?create=true&instructor_id=${inst.instructor_id}&suburb=${suburb}`
                    );
                  }}
                  className="w-full py-2 rounded-xl bg-[#FAB10B] hover:bg-[#E09E0A] text-slate-950 font-bold text-xs shadow-sm transition-colors"
                >
                  Select &amp; Assign
                </button>
              </div>
            );
          })}
        </div>
      </Modal>
    </AdminLayout>
  );
}
