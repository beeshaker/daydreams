import { classTemplates } from "@/content/fixtures/class-templates";
import { insertOccurrenceIfMissing } from "@/lib/classes/store";
import type { Zone } from "@/lib/classes/types";

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Expands active class templates for `zone` into dated occurrences covering
 * today through `today + windowDays` (inclusive), inserting any that don't
 * already exist. All date math runs in UTC (via the UTC* Date methods) so
 * "today" and each day's weekday are computed consistently regardless of
 * server timezone — mixing local and UTC date math here is what causes the
 * classic off-by-one-day bug.
 *
 * Idempotent: insertOccurrenceIfMissing dedupes on (templateId, date), so
 * this is safe to call on every page render for a zone.
 */
export async function ensureUpcomingOccurrences(zone: Zone, windowDays = 21): Promise<void> {
  const templates = classTemplates.filter((template) => template.zone === zone && template.active);
  if (templates.length === 0) return;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let offset = 0; offset <= windowDays; offset++) {
    const current = new Date(today);
    current.setUTCDate(current.getUTCDate() + offset);
    const date = toDateString(current);
    const weekday = current.getUTCDay();

    for (const template of templates) {
      if (!template.dayOfWeek.includes(weekday)) continue;
      // Sequential awaits: the JSON-file store does an unsynchronized
      // read-modify-write, so interleaving inserts within this loop would
      // risk clobbering each other.
      await insertOccurrenceIfMissing({
        templateId: template.id,
        zone: template.zone,
        title: template.title,
        description: template.description,
        date,
        startTime: template.startTime,
        endTime: template.endTime,
        capacity: template.capacity,
      });
    }
  }
}
