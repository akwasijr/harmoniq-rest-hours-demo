import type {
  RestHoursDayEntry,
  RestHoursComplianceCheck,
  RestHours7DayCheck,
  RestPeriod,
} from "@/types";

/**
 * Calculates hours for a time period (from/to in HH:mm format).
 * Handles overnight periods (e.g., 22:00 → 06:00).
 */
export function periodHours(period: RestPeriod): number {
  const [fh, fm] = period.from.split(":").map(Number);
  const [th, tm] = period.to.split(":").map(Number);
  let fromMin = fh * 60 + fm;
  let toMin = th * 60 + tm;
  if (toMin <= fromMin) toMin += 24 * 60; // overnight
  return (toMin - fromMin) / 60;
}

/**
 * Sums total hours from an array of time periods.
 */
export function sumPeriods(periods: RestPeriod[]): number {
  return periods.reduce((sum, p) => sum + periodHours(p), 0);
}

/**
 * Builds an auto-computed RestHoursDayEntry from rest periods.
 * Work periods are the inverse of rest periods within 24h.
 */
export function buildDayEntry(
  date: string,
  restPeriods: RestPeriod[],
  isAtSea: boolean,
  comments = "",
): RestHoursDayEntry {
  const totalRest = sumPeriods(restPeriods);
  return {
    date,
    is_at_sea: isAtSea,
    rest_periods: restPeriods,
    work_periods: [], // computed on the UI side if needed
    total_rest_hours: Math.round(totalRest * 100) / 100,
    total_work_hours: Math.round((24 - totalRest) * 100) / 100,
    comments,
  };
}

/**
 * MLC 2006 / STCW compliance check for a single day:
 *  - Minimum 10 hours rest in any 24-hour period
 *  - At least one rest period of minimum 6 continuous hours
 *  - Rest may be divided into no more than 2 periods
 */
export function checkDayCompliance(entry: RestHoursDayEntry): RestHoursComplianceCheck {
  const totalRest = entry.total_rest_hours;
  const longestRest = entry.rest_periods.length > 0
    ? Math.max(...entry.rest_periods.map(periodHours))
    : 0;

  return {
    date: entry.date,
    min_rest_24h_ok: totalRest >= 10,
    min_continuous_ok: longestRest >= 6,
    total_rest_hours: totalRest,
  };
}

/**
 * MLC 2006 rolling 7-day compliance:
 *  - Minimum 77 hours rest in any 7-day period
 */
export function check7DayCompliance(entries: RestHoursDayEntry[]): RestHours7DayCheck[] {
  const results: RestHours7DayCheck[] = [];
  if (entries.length < 7) return results;

  for (let i = 6; i < entries.length; i++) {
    const window = entries.slice(i - 6, i + 1);
    const total = window.reduce((sum, e) => sum + e.total_rest_hours, 0);
    results.push({
      period_end: entries[i].date,
      total_rest_hours: Math.round(total * 100) / 100,
      min_77h_ok: total >= 77,
    });
  }

  return results;
}

/**
 * Checks if a submission is late (> 48h after period end).
 */
export function isLateSubmission(month: number, year: number): boolean {
  const periodEnd = new Date(year, month, 0, 23, 59, 59); // last day of month
  const cutoff = new Date(periodEnd.getTime() + 48 * 60 * 60 * 1000);
  return new Date() > cutoff;
}

/**
 * Runs full compliance for a set of entries.
 * Returns { daily, weekly, hasViolations }.
 */
export function runFullCompliance(entries: RestHoursDayEntry[]) {
  const daily = entries.map(checkDayCompliance);
  const weekly = check7DayCompliance(entries);

  const hasViolations =
    daily.some((d) => !d.min_rest_24h_ok || !d.min_continuous_ok) ||
    weekly.some((w) => !w.min_77h_ok);

  return { daily, weekly, hasViolations };
}

/**
 * Generates an empty set of day entries for a given month/year.
 */
export function generateEmptyMonth(month: number, year: number): RestHoursDayEntry[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const entries: RestHoursDayEntry[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    entries.push({
      date,
      is_at_sea: true,
      rest_periods: [],
      work_periods: [],
      total_rest_hours: 0,
      total_work_hours: 0,
      comments: "",
    });
  }
  return entries;
}

/**
 * Format hours as "Xh Ym" for display.
 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Compact format for tight layouts: "10.5h" instead of "10h 30m" */
export function formatHoursCompact(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  if (rounded === Math.floor(rounded)) return `${Math.floor(rounded)}h`;
  return `${rounded}h`;
}
