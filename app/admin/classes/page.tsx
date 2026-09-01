import Link from "next/link";
import { getOccurrencesWithCounts } from "@/lib/classes/queries";
import type { OccurrenceStatus, Zone } from "@/lib/classes/types";
import { createManualOccurrenceAction, bulkUploadOccurrencesAction } from "./actions";

export const metadata = {
  title: "Admin — Classes",
};

const ZONES: Zone[] = ["gym", "daycare"];
const STATUSES: OccurrenceStatus[] = ["scheduled", "confirmed", "cancelled", "rescheduled"];

function isZone(value: string | string[] | undefined): value is Zone {
  return typeof value === "string" && (ZONES as string[]).includes(value);
}

function isOccurrenceStatus(value: string | string[] | undefined): value is OccurrenceStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

const STATUS_STYLES: Record<OccurrenceStatus, string> = {
  scheduled: "bg-brand-ink/10 text-brand-ink/70",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-amber-100 text-amber-700",
};

function StatusBadge({ status }: { status: OccurrenceStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function ZoneBadge({ zone }: { zone: Zone }) {
  return (
    <span className="shrink-0 rounded-full bg-brand-lavender/30 px-2.5 py-1 text-xs font-semibold text-brand-lavender-strong">
      {zone === "gym" ? "Gym" : "Daycare"}
    </span>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminClassesPage(props: PageProps<"/admin/classes">) {
  const searchParams = await props.searchParams;
  const zoneParam = firstParam(searchParams.zone);
  const statusParam = firstParam(searchParams.status);
  const status = isOccurrenceStatus(statusParam) ? statusParam : undefined;

  const uploadCreated = firstParam(searchParams.uploadCreated);
  const uploadSkipped = firstParam(searchParams.uploadSkipped);
  const uploadErrors = firstParam(searchParams.uploadErrors);
  const showUploadResult = uploadCreated !== undefined;

  // Sequential, not Promise.all: both calls can write to the same
  // .data/class-occurrences.json file via ensureUpcomingOccurrences (inside
  // getOccurrencesWithCounts), whose read-modify-write isn't synchronized,
  // so running them concurrently risks one write clobbering the other.
  // Always fetched for both zones regardless of the zone filter below, so
  // the filter selector never leaves the other zone's occurrences stale.
  const gymOccurrences = await getOccurrencesWithCounts("gym", { includePast: true, status });
  const daycareOccurrences = await getOccurrencesWithCounts("daycare", { includePast: true, status });

  const allOccurrences = [...gymOccurrences, ...daycareOccurrences].sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  );
  const occurrences = isZone(zoneParam)
    ? allOccurrences.filter((occurrence) => occurrence.zone === zoneParam)
    : allOccurrences;

  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Classes</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/admin/leads" className="text-brand-lavender-strong underline">
              Leads
            </Link>
            <Link href="/admin/kb" className="text-brand-lavender-strong underline">
              Knowledge base
            </Link>
          </div>
        </div>

        {showUploadResult && (
          <p role="status" className="mt-6 rounded-md bg-brand-mauve/15 px-4 py-3 text-sm text-brand-ink">
            Upload complete: <strong>{uploadCreated}</strong> created, <strong>{uploadSkipped}</strong>{" "}
            skipped as duplicates
            {uploadErrors && uploadErrors !== "0" ? (
              <>
                , <strong>{uploadErrors}</strong> row{uploadErrors === "1" ? "" : "s"} had errors and were
                skipped
              </>
            ) : null}
            .
          </p>
        )}

        <section className="mt-6 rounded-lg border border-brand-ink/10 bg-white p-4">
          <h2 className="text-sm font-bold">Bulk upload (CSV)</h2>
          <p className="mt-1 text-sm text-brand-ink/60">
            Add many one-off sessions at once.{" "}
            <Link
              href="/admin/classes/template"
              className="font-semibold text-brand-lavender-strong underline"
            >
              Download the CSV template
            </Link>
            , fill in a row per session, then upload it below. Rows matching an existing session
            (same zone, date, start time, and title) are skipped automatically.
          </p>
          <form
            action={bulkUploadOccurrencesAction}
            className="mt-3 flex flex-wrap items-end gap-3 text-sm"
          >
            <label className="flex flex-col gap-1 font-medium">
              CSV file
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                required
                className="rounded-md border border-brand-ink/20 bg-white px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-brand-pink-strong px-4 py-2 font-semibold text-white hover:brightness-95"
            >
              Upload
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-lg border border-brand-ink/10 bg-white p-4">
          <h2 className="text-sm font-bold">Add one-off session</h2>
          <form action={createManualOccurrenceAction} className="mt-3 flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1 font-medium">
              Title
              <input
                type="text"
                name="title"
                required
                className="rounded-md border border-brand-ink/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 font-medium">
              Zone
              <select
                name="zone"
                required
                defaultValue=""
                className="rounded-md border border-brand-ink/20 bg-white px-3 py-2"
              >
                <option value="" disabled>
                  Select zone
                </option>
                <option value="gym">Gym</option>
                <option value="daycare">Daycare</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 font-medium">
              Date
              <input
                type="date"
                name="date"
                required
                className="rounded-md border border-brand-ink/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 font-medium">
              Start time
              <input
                type="time"
                name="startTime"
                required
                className="rounded-md border border-brand-ink/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 font-medium">
              End time
              <input
                type="time"
                name="endTime"
                required
                className="rounded-md border border-brand-ink/20 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 font-medium">
              Capacity
              <input
                type="number"
                name="capacity"
                min={1}
                placeholder="Unlimited"
                className="w-28 rounded-md border border-brand-ink/20 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-brand-pink-strong px-4 py-2 font-semibold text-white hover:brightness-95"
            >
              Add session
            </button>
          </form>
        </section>

        <form method="get" className="mt-6 flex flex-wrap gap-3 text-sm">
          <select
            name="zone"
            defaultValue={zoneParam ?? ""}
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2"
          >
            <option value="">All zones</option>
            <option value="gym">Gym</option>
            <option value="daycare">Daycare</option>
          </select>
          <select
            name="status"
            defaultValue={statusParam ?? ""}
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2"
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-white px-3 py-2 font-semibold ring-1 ring-brand-ink/15 hover:bg-brand-bg"
          >
            Filter
          </button>
        </form>

        <div className="mt-6 divide-y divide-brand-ink/10 rounded-lg border border-brand-ink/10 bg-white">
          {occurrences.map((occurrence) => (
            <Link
              key={occurrence.id}
              href={`/admin/classes/${occurrence.id}`}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm hover:bg-brand-bg"
            >
              <span className="w-44 shrink-0 text-brand-ink/70">
                {occurrence.date} · {occurrence.startTime}–{occurrence.endTime}
              </span>
              <ZoneBadge zone={occurrence.zone} />
              <span className="flex-1 font-medium">{occurrence.title}</span>
              <span className="w-16 shrink-0 text-brand-ink/60">
                {occurrence.signupCount}
                {occurrence.capacity ? `/${occurrence.capacity}` : ""}
              </span>
              <StatusBadge status={occurrence.status} />
            </Link>
          ))}
          {occurrences.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-brand-ink/50">
              No classes match these filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
