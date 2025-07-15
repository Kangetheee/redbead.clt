import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { ALLOWED_FILE_TYPES } from "./shared/constants";
import { DateRange } from "@/components/ui/date-picker";
import {
  DashboardPreset,
  DashboardSummaryQuery,
} from "@/lib/dashboard/types/dashboard.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== "string") {
    return "?";
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return "?";
  }

  return trimmedName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export function formatAmount(amount: string | number) {
  if (typeof amount !== "number" && typeof amount !== "string") return amount;
  const amt = typeof amount === "number" ? amount : Number(amount);

  return amt.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPhone(phone: string) {
  if (!phone.startsWith("+")) phone = `+${phone}`;
  return phone;
}

export function arrayDiff<T>(initialArr: T[], arr2: T[]) {
  return JSON.stringify(initialArr) === JSON.stringify(arr2) ? undefined : arr2;
}

const truncateString = (value: string, maxLength = 100) => {
  return value.length > maxLength ? value.slice(0, maxLength) + "…" : value;
};

export const truncateMetadata = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>,
  maxLength = 100
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const truncated: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      truncated[key] = truncateString(value, maxLength);
    } else {
      truncated[key] = value;
    }
  }

  return truncated;
};

export function formatDate(date: string) {
  try {
    return format(new Date(date), "PPp");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return date;
  }
}

export async function computeSHA256(image: Blob) {
  const buffer = await image.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((hash) => hash.toString(16).padStart(2, "0")).join("");
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function validateFileType(file: File) {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

/**
 * Helper function to get start of day (00:00:00)
 */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Helper function to get end of day (23:59:59)
 */
// function endOfDay(date: Date): Date {
//   return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
// }

/**
 * Helper function to get start of month
 */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Helper function to get start of quarter
 */
function startOfQuarter(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

/**
 * Helper function to get end of month
 */
function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Helper function to get end of quarter
 */
function endOfQuarter(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3 + 3, 0);
}

/**
 * Helper function to get start of year
 */
function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Helper function to get end of year
 */
function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}

/**
 * Generate DateRange for a given preset
 */
export function presetToDateRange(preset: DashboardPreset): DateRange {
  const today = new Date();
  const todayStart = startOfDay(today);

  switch (preset) {
    case "today":
      return { from: todayStart, to: todayStart };

    case "yesterday": {
      const yesterday = new Date(todayStart);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    }

    case "last_7_days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { from: start, to: todayStart };
    }

    case "last_30_days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 29);
      return { from: start, to: todayStart };
    }

    case "last_90_days": {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 89);
      return { from: start, to: todayStart };
    }

    case "this_month": {
      const start = startOfMonth(today);
      return { from: start, to: todayStart };
    }

    case "last_month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = endOfMonth(start);
      return { from: start, to: end };
    }

    case "this_quarter": {
      const start = startOfQuarter(today);
      return { from: start, to: todayStart };
    }

    case "last_quarter": {
      const thisQuarterStart = startOfQuarter(today);
      const lastQuarterStart = new Date(thisQuarterStart);
      lastQuarterStart.setMonth(lastQuarterStart.getMonth() - 3);
      const lastQuarterEnd = endOfQuarter(lastQuarterStart);
      return { from: lastQuarterStart, to: lastQuarterEnd };
    }

    case "this_year": {
      const start = startOfYear(today);
      return { from: start, to: todayStart };
    }

    case "last_year": {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = endOfYear(start);
      return { from: start, to: end };
    }

    default:
      // Default to last 7 days
      const start = new Date(todayStart);
      start.setDate(start.getDate() - 6);
      return { from: start, to: todayStart };
  }
}

/**
 * Detect if a DateRange matches a common preset pattern
 */
export function detectPresetFromDateRange(
  dateRange: DateRange
): DashboardPreset | null {
  // const today = new Date();
  // const todayStart = startOfDay(today);

  const rangeStart = startOfDay(dateRange.from);
  const rangeEnd = startOfDay(dateRange.to);

  // Generate all possible preset ranges and compare
  const presets: DashboardPreset[] = [
    "today",
    "yesterday",
    "last_7_days",
    "last_30_days",
    "last_90_days",
    "this_month",
    "last_month",
    "this_quarter",
    "last_quarter",
  ];

  for (const preset of presets) {
    const presetRange = presetToDateRange(preset);
    const presetStart = startOfDay(presetRange.from);
    const presetEnd = startOfDay(presetRange.to);

    if (
      rangeStart.getTime() === presetStart.getTime() &&
      rangeEnd.getTime() === presetEnd.getTime()
    ) {
      return preset;
    }
  }

  return null;
}

/**
 * Convert DateRange to DashboardSummaryQuery format, preferring presets when possible
 */
export function dateRangeToQuery(dateRange: DateRange): DashboardSummaryQuery {
  // First try to detect a preset
  const preset = detectPresetFromDateRange(dateRange);

  if (preset) {
    return { preset };
  }

  // Fall back to explicit dates
  return {
    startDate: dateRange.from.toISOString().split("T")[0],
    endDate: dateRange.to.toISOString().split("T")[0],
  };
}

/**
 * Format date range for display
 */
export function formatDateRange(range: DateRange): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (range.from.toDateString() === range.to.toDateString()) {
    return formatDate(range.from);
  }

  return `${formatDate(range.from)} - ${formatDate(range.to)}`;
}

/**
 * Check if two date ranges are equal
 */
export function isDateRangeEqual(
  range1: DateRange,
  range2: DateRange
): boolean {
  return (
    range1.from.toDateString() === range2.from.toDateString() &&
    range1.to.toDateString() === range2.to.toDateString()
  );
}

/**
 * Get the number of days in a date range
 */
export function getDaysBetween(range: DateRange): number {
  const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
}
