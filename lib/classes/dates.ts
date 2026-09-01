export const BUSINESS_TIMEZONE = "Africa/Nairobi";

/**
 * Returns "today" as a "YYYY-MM-DD" string in `timeZone` (defaults to the
 * business's own timezone, not the server's). This is the one place "what
 * day is it" gets decided for the class-booking feature — every other date
 * computation here treats "YYYY-MM-DD" strings as plain calendar dates and
 * does pure UTC arithmetic on them (calendar math is timezone-agnostic:
 * a given date is the same weekday no matter what timezone you're in), so
 * only this anchor point needs real timezone awareness. Getting this wrong
 * (e.g. deriving "today" from the server's UTC clock) shifts the visible
 * schedule by up to a day whenever the server's day boundary and the
 * business's day boundary don't line up.
 */
export function todayDateString(timeZone: string = BUSINESS_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Parses a "YYYY-MM-DD" string into a UTC-midnight Date, for pure calendar-date arithmetic. */
export function dateStringToUtcDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00Z`);
}

/** Formats a UTC-midnight-anchored Date back to a "YYYY-MM-DD" string. */
export function utcDateToDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Adds `days` (can be negative) to a "YYYY-MM-DD" string, via UTC calendar-date arithmetic. */
export function addDaysToDateString(dateString: string, days: number): string {
  const date = dateStringToUtcDate(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return utcDateToDateString(date);
}

/** 0=Sun..6=Sat for a "YYYY-MM-DD" string — pure calendar arithmetic, timezone-agnostic. */
export function weekdayForDateString(dateString: string): number {
  return dateStringToUtcDate(dateString).getUTCDay();
}

/** The Sunday on or before `dateString` (start of the calendar week it falls in). */
export function startOfWeekDateString(dateString: string): string {
  return addDaysToDateString(dateString, -weekdayForDateString(dateString));
}

/** "YYYY-MM-01" for the month containing `dateString`. */
export function startOfMonthDateString(dateString: string): string {
  return `${dateString.slice(0, 7)}-01`;
}

/**
 * Adds/subtracts whole months, always anchored to the 1st of the resulting
 * month — sidesteps day-of-month overflow (e.g. "Jan 31 + 1 month") since
 * callers only use this to change which month a calendar is showing, never
 * to preserve a specific day.
 */
export function addMonthsToDateString(dateString: string, months: number): string {
  const [year, month] = dateString.split("-").map(Number);
  return utcDateToDateString(new Date(Date.UTC(year, month - 1 + months, 1)));
}

/** Formats a "HH:mm" 24h time as a compact 12h label, e.g. "6:00AM" or "6PM". */
export function formatTimeLabel(time: string): string {
  const [hoursRaw, minutes] = time.split(":");
  const hours = Number(hoursRaw);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === "00" ? `${hour12}${period}` : `${hour12}:${minutes}${period}`;
}
