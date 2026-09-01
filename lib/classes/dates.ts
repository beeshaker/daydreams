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
