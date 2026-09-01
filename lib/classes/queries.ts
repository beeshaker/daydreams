import { getSignupCountsByOccurrenceIds } from "@/lib/classes/signups";
import { ensureUpcomingOccurrences } from "@/lib/classes/generate";
import { listOccurrences } from "@/lib/classes/store";
import type { ClassOccurrence, OccurrenceStatus, Zone } from "@/lib/classes/types";

function todayDateString(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

/** Adds `days` (>= 0) to a "YYYY-MM-DD" string, using UTC date math throughout. */
function addDaysToDateString(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Read facade for the public booking page (Task 4) and admin page (Task 5):
 * ensures upcoming occurrences exist for `zone`, then joins in sign-up
 * headcounts. Single-zone per call by design — see lib/classes/generate.ts
 * on why ensureUpcomingOccurrences calls for multiple zones must never run
 * concurrently, so callers that need every zone must await one call per
 * zone sequentially rather than Promise.all-ing them.
 *
 * `limitDays`, when passed, bounds the returned window to `limitDays` days
 * out from today (inclusive) — it only trims what this call RETURNS, not
 * what ensureUpcomingOccurrences GENERATES (still the full windowDays
 * default). Used by the public site page to keep the schedule section to a
 * short, browsable window; the admin page intentionally omits it so owners
 * still see and can manage the full generation window.
 */
export async function getOccurrencesWithCounts(
  zone: Zone,
  opts: { includePast?: boolean; status?: OccurrenceStatus; limitDays?: number } = {},
): Promise<(ClassOccurrence & { signupCount: number })[]> {
  await ensureUpcomingOccurrences(zone);

  const today = todayDateString();
  const to = opts.limitDays !== undefined ? addDaysToDateString(today, opts.limitDays - 1) : undefined;
  const occurrences = await listOccurrences({
    zone,
    status: opts.status,
    ...(opts.includePast ? {} : { from: today }),
    ...(to !== undefined ? { to } : {}),
  });

  const counts = await getSignupCountsByOccurrenceIds(occurrences.map((occ) => occ.id));

  return occurrences.map((occ) => ({ ...occ, signupCount: counts[occ.id] ?? 0 }));
}
