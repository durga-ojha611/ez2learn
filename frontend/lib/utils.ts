// frontend/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAUD(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "$0.00";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return "";
  // If time is HH:mm:ss, format as 12-hour e.g. 09:00 AM
  const parts = timeString.split(":");
  if (parts.length >= 2) {
    const hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  }
  return timeString;
}

export function getInitials(name: string): string {
  if (!name) return "EL";
  const cleaned = cleanText(name);
  const parts = cleaned.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function cleanText(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/OÔÇÖ|OÖÇÖ|Oâ€™|O’|O‘/gi, "O'")
    .replace(/ÔÇÖ|ÖÇÖ|â€™|’|‘/g, "'")
    .replace(/ÔÇô|ÖÇô|â€“|–|—/g, "-")
    .replace(/ÔÇ£|ÔÇØ|ÖÇ£|ÖÇØ|â€œ|â€ |“|”/g, '"');
}
