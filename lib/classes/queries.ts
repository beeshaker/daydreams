import { getSignupCountsByOccurrenceIds } from "@/lib/classes/signups";
import { ensureUpcomingOccurrences } from "@/lib/classes/generate";
import { listOccurrences } from "@/lib/classes/store";
import type { ClassOccurrence, OccurrenceStatus, Zone } from "@/lib/classes/types";

function todayDateString(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString().slice(0, 10);
}

/**
 * Read facade for the public booking page (Task 4) and admin page (Task 5):
 * ensures upcoming occurrences exist for `zone`, then joins in sign-up
 * headcounts. Single-zone per call by design — see lib/classes/generate.ts
 * on why ensureUpcomingOccurrences calls for multiple zones must never run
 * concurrently, so callers that need every zone must await one call per
 * zone sequentially rather than Promise.all-ing them.
 */
export async function getOccurrencesWithCounts(
  zone: Zone,
  opts: { includePast?: boolean; status?: OccurrenceStatus } = {},
): Promise<(ClassOccurrence & { signupCount: number })[]> {
  await ensureUpcomingOccurrences(zone);

  const today = todayDateString();
  const occurrences = await listOccurrences({
    zone,
    status: opts.status,
    ...(opts.includePast ? {} : { from: today }),
  });

  const counts = await getSignupCountsByOccurrenceIds(occurrences.map((occ) => occ.id));

  return occurrences.map((occ) => ({ ...occ, signupCount: counts[occ.id] ?? 0 }));
}
