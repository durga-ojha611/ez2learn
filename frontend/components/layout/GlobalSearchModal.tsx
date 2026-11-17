"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Calendar, User, Car, MapPin, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    bookings: any[];
    instructors: any[];
    students: any[];
  }>({ bookings: [], instructors: [], students: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults({ bookings: [], instructors: [], students: [] });
      return;
    }

    if (!query.trim()) {
      setResults({ bookings: [], instructors: [], students: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [bookRes, instRes, studRes] = await Promise.all([
          apiFetch("/api/bookings", { params: { search: query, limit: 3 } }),
          apiFetch("/api/instructors", { params: { search: query, limit: 3 } }),
          apiFetch("/api/students", { params: { search: query, limit: 3 } }),
        ]);

        setResults({
          bookings: bookRes.data || [],
          instructors: instRes.data || [],
          students: studRes.data || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const hasResults =
    results.bookings.length > 0 ||
    results.instructors.length > 0 ||
    results.students.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-borderSubtle overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-borderSubtle gap-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search booking codes, instructors, students, suburbs..."
            autoFocus
            className="w-full text-sm text-textPrimary placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-8 text-xs text-textSecondary">
              Searching database records...
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-xs text-textSecondary">
              Type to search bookings, students, instructors, and locations across Greater Sydney.
            </div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {/* Bookings group */}
          {results.bookings.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Bookings
              </div>
              <div className="space-y-1">
                {results.bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigateTo(`/bookings/${b.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-borderSubtle transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-navy-900 mr-2">{b.booking_code}</span>
                      <span className="text-xs text-textSecondary">{b.student_name}</span>
                      <span className="text-[11px] text-slate-400 ml-2">({b.pickup_suburb})</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructors group */}
          {results.instructors.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5" /> Instructors
              </div>
              <div className="space-y-1">
                {results.instructors.map((i) => (
                  <div
                    key={i.id}
                    onClick={() => navigateTo(`/instructors/${i.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-borderSubtle transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={i.avatar_url} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <span className="font-semibold text-xs text-navy-900">{i.name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">★ {i.rating}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students group */}
          {results.students.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Students
              </div>
              <div className="space-y-1">
                {results.students.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigateTo(`/students/${s.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-borderSubtle transition-all"
                  >
                    <div>
                      <span className="font-semibold text-xs text-navy-900 mr-2">{s.name}</span>
                      <span className="text-xs text-slate-400">{s.suburb}</span>
                      <span className="text-[11px] text-brandYellow-600 ml-2">
                        {s.nsw_logbook_hours} hrs logged
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

