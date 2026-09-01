import Link from "next/link";
import {
  addDaysToDateString,
  addMonthsToDateString,
  formatTimeLabel,
  startOfMonthDateString,
  startOfWeekDateString,
  todayDateString,
} from "@/lib/classes/dates";
import { StatusBadge, ZONE_DOT_COLOR } from "@/components/admin/ClassBadges";
import type { ClassOccurrence } from "@/lib/classes/types";

export type CalendarRange = "day" | "week" | "month";

type Occurrence = ClassOccurrence & { signupCount: number };

type Filters = { zoneParam?: string; statusParam?: string };

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RANGES: CalendarRange[] = ["day", "week", "month"];

function parseDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00Z`);
}

function formatLongDate(dateString: string): string {
  return parseDate(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMonthLabel(dateString: string): string {
  return parseDate(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatWeekRangeLabel(startDate: string): string {
  const endDate = addDaysToDateString(startDate, 6);
  const startLabel = parseDate(startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const endLabel = parseDate(endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${startLabel} – ${endLabel}`;
}

function formatDayLabel(dateString: string): string {
  return parseDate(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function hrefFor(filters: Filters, range: CalendarRange, date: string): string {
  const params = new URLSearchParams();
  if (filters.zoneParam) params.set("zone", filters.zoneParam);
  if (filters.statusParam) params.set("status", filters.statusParam);
  params.set("view", "calendar");
  params.set("range", range);
  params.set("date", date);
  return `/admin/classes?${params.toString()}`;
}

function OccurrencePill({ occurrence }: { occurrence: Occurrence }) {
  const isCancelled = occurrence.status === "cancelled";
  const label = `${formatTimeLabel(occurrence.startTime)} ${occurrence.title}`;
  return (
    <Link
      href={`/admin/classes/${occurrence.id}`}
      title={label}
      className={`flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] hover:bg-brand-bg ${
        isCancelled ? "text-brand-ink/40 line-through" : "text-brand-ink/80"
      }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ZONE_DOT_COLOR[occurrence.zone]}`} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function OccurrenceRow({ occurrence }: { occurrence: Occurrence }) {
  const isCancelled = occurrence.status === "cancelled";
  return (
    <Link
      href={`/admin/classes/${occurrence.id}`}
      className={`flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-brand-bg ${
        isCancelled ? "opacity-60" : ""
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${ZONE_DOT_COLOR[occurrence.zone]}`} />
      <span className={`font-semibold ${isCancelled ? "line-through" : ""}`}>
        {formatTimeLabel(occurrence.startTime)}
      </span>
      <span className={`flex-1 truncate ${isCancelled ? "line-through" : ""}`}>{occurrence.title}</span>
      <span className="shrink-0 text-brand-ink/50">
        {occurrence.signupCount}
        {occurrence.capacity ? `/${occurrence.capacity}` : ""}
      </span>
      <StatusBadge status={occurrence.status} />
    </Link>
  );
}

function MonthGrid({
  anchorDate,
  occurrencesByDate,
  today,
  filters,
}: {
  anchorDate: string;
  occurrencesByDate: Map<string, Occurrence[]>;
  today: string;
  filters: Filters;
}) {
  const monthStart = startOfMonthDateString(anchorDate);
  const currentMonth = monthStart.slice(0, 7);
  const gridStart = startOfWeekDateString(monthStart);
  const days = Array.from({ length: 42 }, (_, i) => addDaysToDateString(gridStart, i));
  const maxVisiblePerDay = 3;

  return (
    <div className="min-w-[700px]">
      <div className="grid grid-cols-7 border-b border-brand-ink/10 text-center text-xs font-semibold uppercase tracking-wide text-brand-ink/50">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = day.slice(0, 7) === currentMonth;
          const dayOccurrences = occurrencesByDate.get(day) ?? [];
          const visible = dayOccurrences.slice(0, maxVisiblePerDay);
          const overflow = dayOccurrences.length - visible.length;
          const isToday = day === today;

          return (
            <div
              key={day}
              className={`min-h-[110px] border-b border-r border-brand-ink/5 p-1.5 last:border-r-0 ${
                inMonth ? "" : "bg-brand-bg/60"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday
                    ? "bg-brand-pink-strong text-white"
                    : inMonth
                      ? "text-brand-ink/70"
                      : "text-brand-ink/30"
                }`}
              >
                {Number(day.slice(8, 10))}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {visible.map((occ) => (
                  <OccurrencePill key={occ.id} occurrence={occ} />
                ))}
                {overflow > 0 && (
                  <Link
                    href={hrefFor(filters, "day", day)}
                    className="text-[11px] font-semibold text-brand-lavender-strong hover:underline"
                  >
                    +{overflow} more
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({
  anchorDate,
  occurrencesByDate,
  today,
}: {
  anchorDate: string;
  occurrencesByDate: Map<string, Occurrence[]>;
  today: string;
}) {
  const weekStart = startOfWeekDateString(anchorDate);
  const days = Array.from({ length: 7 }, (_, i) => addDaysToDateString(weekStart, i));

  return (
    <div className="grid min-w-[900px] grid-cols-7 divide-x divide-brand-ink/5">
      {days.map((day) => {
        const dayOccurrences = occurrencesByDate.get(day) ?? [];
        return (
          <div key={day} className="min-h-[300px] p-2">
            <div
              className={`text-center text-xs font-semibold ${
                day === today ? "text-brand-pink-strong" : "text-brand-ink/60"
              }`}
            >
              {formatDayLabel(day)}
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {dayOccurrences.map((occ) => (
                <OccurrenceRow key={occ.id} occurrence={occ} />
              ))}
              {dayOccurrences.length === 0 && (
                <p className="mt-4 text-center text-[11px] text-brand-ink/30">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayList({
  anchorDate,
  occurrencesByDate,
}: {
  anchorDate: string;
  occurrencesByDate: Map<string, Occurrence[]>;
}) {
  const dayOccurrences = occurrencesByDate.get(anchorDate) ?? [];
  return (
    <div className="divide-y divide-brand-ink/5 p-2">
      {dayOccurrences.map((occ) => (
        <OccurrenceRow key={occ.id} occurrence={occ} />
      ))}
      {dayOccurrences.length === 0 && (
        <p className="px-2 py-8 text-center text-sm text-brand-ink/50">No classes on this day.</p>
      )}
    </div>
  );
}

export function ClassCalendar({
  occurrences,
  range,
  anchorDate,
  zoneParam,
  statusParam,
}: {
  occurrences: Occurrence[];
  range: CalendarRange;
  anchorDate: string;
  zoneParam?: string;
  statusParam?: string;
}) {
  const filters: Filters = { zoneParam, statusParam };
  const today = todayDateString();

  const occurrencesByDate = new Map<string, Occurrence[]>();
  for (const occ of occurrences) {
    const list = occurrencesByDate.get(occ.date) ?? [];
    list.push(occ);
    occurrencesByDate.set(occ.date, list);
  }

  const prevDate =
    range === "day"
      ? addDaysToDateString(anchorDate, -1)
      : range === "week"
        ? addDaysToDateString(anchorDate, -7)
        : addMonthsToDateString(startOfMonthDateString(anchorDate), -1);
  const nextDate =
    range === "day"
      ? addDaysToDateString(anchorDate, 1)
      : range === "week"
        ? addDaysToDateString(anchorDate, 7)
        : addMonthsToDateString(startOfMonthDateString(anchorDate), 1);

  const title =
    range === "day"
      ? formatLongDate(anchorDate)
      : range === "week"
        ? formatWeekRangeLabel(startOfWeekDateString(anchorDate))
        : formatMonthLabel(anchorDate);

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={hrefFor(filters, r, anchorDate)}
              className={`rounded-md px-3 py-1.5 font-semibold capitalize ${
                range === r
                  ? "bg-brand-ink text-white"
                  : "bg-white ring-1 ring-brand-ink/15 hover:bg-brand-bg"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={hrefFor(filters, range, prevDate)}
            aria-label="Previous"
            className="rounded-md bg-white px-3 py-1.5 font-semibold ring-1 ring-brand-ink/15 hover:bg-brand-bg"
          >
            ‹
          </Link>
          <Link
            href={hrefFor(filters, range, today)}
            className="rounded-md bg-white px-3 py-1.5 font-semibold ring-1 ring-brand-ink/15 hover:bg-brand-bg"
          >
            Today
          </Link>
          <Link
            href={hrefFor(filters, range, nextDate)}
            aria-label="Next"
            className="rounded-md bg-white px-3 py-1.5 font-semibold ring-1 ring-brand-ink/15 hover:bg-brand-bg"
          >
            ›
          </Link>
        </div>
      </div>

      <h3 className="mt-3 text-base font-bold">{title}</h3>

      <div className="mt-3 overflow-x-auto rounded-lg border border-brand-ink/10 bg-white">
        {range === "month" && (
          <MonthGrid anchorDate={anchorDate} occurrencesByDate={occurrencesByDate} today={today} filters={filters} />
        )}
        {range === "week" && (
          <WeekGrid anchorDate={anchorDate} occurrencesByDate={occurrencesByDate} today={today} />
        )}
        {range === "day" && <DayList anchorDate={anchorDate} occurrencesByDate={occurrencesByDate} />}
      </div>
    </div>
  );
}
