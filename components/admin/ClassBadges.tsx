import type { OccurrenceStatus, Zone } from "@/lib/classes/types";

const STATUS_STYLES: Record<OccurrenceStatus, string> = {
  scheduled: "bg-brand-ink/10 text-brand-ink/70",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-amber-100 text-amber-700",
};

export function StatusBadge({ status }: { status: OccurrenceStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

export function ZoneBadge({ zone }: { zone: Zone }) {
  return (
    <span className="shrink-0 rounded-full bg-brand-lavender/30 px-2.5 py-1 text-xs font-semibold text-brand-lavender-strong">
      {zone === "gym" ? "Gym" : "Daycare"}
    </span>
  );
}

/** Small color cue for compact calendar entries — not a full badge, just enough to tell zones apart at a glance. */
export const ZONE_DOT_COLOR: Record<Zone, string> = {
  gym: "bg-brand-pink-strong",
  daycare: "bg-brand-lavender-strong",
};
