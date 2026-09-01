import { ClassSignupForm } from "@/components/daydreams/ClassSignupForm";
import { formatTimeLabel } from "@/lib/classes/dates";
import type { ClassOccurrence } from "@/lib/classes/types";

type Occurrence = ClassOccurrence & { signupCount: number };

function formatOccurrenceDate(dateString: string): string {
  // Parse as UTC midnight so the displayed weekday/date never shifts with
  // the server's local timezone — mirrors the UTC date math in generate.ts.
  const date = new Date(`${dateString}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function StatusBadge({ occurrence }: { occurrence: Occurrence }) {
  if (occurrence.status === "confirmed") {
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 zone-dark:bg-green-400/20 zone-dark:text-green-300">
        Confirmed
      </span>
    );
  }

  if (occurrence.status === "cancelled") {
    return (
      <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 zone-dark:bg-red-400/20 zone-dark:text-red-300">
        Cancelled — this class is no longer meeting
        {occurrence.cancelledNote ? `: ${occurrence.cancelledNote}` : ""}
      </span>
    );
  }

  if (occurrence.status === "rescheduled") {
    // Most recent reschedule is the last entry — an occurrence can be
    // rescheduled more than once, and only the latest move is relevant.
    const latest = occurrence.rescheduleHistory[occurrence.rescheduleHistory.length - 1];
    if (!latest) return null;
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 zone-dark:bg-amber-400/20 zone-dark:text-amber-300">
        Moved from {formatOccurrenceDate(latest.fromDate)}{" "}
        {formatTimeLabel(latest.fromStartTime)}–{formatTimeLabel(latest.fromEndTime)} to{" "}
        {formatOccurrenceDate(occurrence.date)} {formatTimeLabel(occurrence.startTime)}–
        {formatTimeLabel(occurrence.endTime)}
      </span>
    );
  }

  return null;
}

function OccurrenceCard({ occurrence }: { occurrence: Occurrence }) {
  const { capacity, signupCount, status } = occurrence;
  const isCancelled = status === "cancelled";
  const isFull = capacity !== null && signupCount >= capacity;
  const isBlocked = isCancelled || isFull;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-lavender-strong zone-dark:text-brand-lavender">
            {formatOccurrenceDate(occurrence.date)} · {formatTimeLabel(occurrence.startTime)}–
            {formatTimeLabel(occurrence.endTime)}
          </p>
          <h4 className="mt-1 text-lg font-semibold text-brand-ink zone-dark:text-white">
            {occurrence.title}
          </h4>
          {occurrence.description && (
            <p className="mt-1 text-sm text-brand-ink/70 zone-dark:text-white/70">
              {occurrence.description}
            </p>
          )}
        </div>
        <StatusBadge occurrence={occurrence} />
      </div>

      <p className="text-sm text-brand-ink/60 zone-dark:text-white/60">
        {signupCount}
        {capacity ? `/${capacity}` : ""} signed up
      </p>

      {isBlocked ? (
        <p className="w-fit rounded-md bg-brand-ink/5 px-3 py-2 text-sm font-semibold text-brand-ink/50 zone-dark:bg-white/10 zone-dark:text-white/50">
          {isCancelled ? "Cancelled" : "Class full"}
        </p>
      ) : (
        <details className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-2 text-sm font-semibold text-brand-lavender-strong marker:content-none zone-dark:text-brand-lavender">
            Sign up
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0 transition-transform group-open:rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M10 4v12M4 10h12" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="mt-3">
            <ClassSignupForm occurrenceId={occurrence.id} />
          </div>
        </details>
      )}
    </div>
  );
}

export function ClassScheduleSection({ occurrences }: { occurrences: Occurrence[] }) {
  if (occurrences.length === 0) {
    return (
      <p className="text-sm text-brand-ink/70 zone-dark:text-white/60">
        No upcoming sessions are scheduled right now — check back soon.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {occurrences.map((occurrence) => (
        <li
          key={occurrence.id}
          className="rounded-xl border border-brand-ink/10 bg-white p-5 zone-dark:border-white/10 zone-dark:bg-white/5"
        >
          <OccurrenceCard occurrence={occurrence} />
        </li>
      ))}
    </ul>
  );
}
