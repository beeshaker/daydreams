import { z } from "zod";
import { createManualOccurrences, listOccurrences } from "@/lib/classes/store";
import type { Zone } from "@/lib/classes/types";

export const CSV_TEMPLATE_HEADER = "title,zone,date,startTime,endTime,capacity,description";
export const CSV_TEMPLATE_EXAMPLE_ROW =
  "HIIT Bootcamp,gym,2026-09-15,18:00,19:00,15,High-intensity interval training";

const csvRowSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  zone: z.enum(["gym", "daycare"], { error: "Zone must be \"gym\" or \"daycare\"" }),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Start time must be HH:mm"),
  endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "End time must be HH:mm"),
  capacity: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || (Number.isInteger(value) && value > 0), {
      message: "Capacity must be a positive whole number, or blank for unlimited",
    }),
  description: z.string().trim().optional(),
});

export type ParsedCsvRow = {
  zone: Zone;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
};

export type CsvRowError = { line: number; message: string };

/**
 * Minimal RFC4180-ish line splitter: handles quoted fields (so a field can
 * contain a comma) and a doubled "" as an escaped quote. This is
 * intentionally not a general-purpose CSV library — it's sized for a
 * small, admin-authored upload built from our own downloadable template,
 * matching this feature's existing "no new npm dependency" pattern.
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Parses uploaded CSV text into valid rows plus a list of per-line errors.
 * A malformed row is skipped and reported, not fatal to the rest of the
 * upload — partial success is more useful than an all-or-nothing failure
 * for a spreadsheet a human filled in by hand.
 */
export function parseOccurrenceCsv(text: string): { rows: ParsedCsvRow[]; errors: CsvRowError[] } {
  const lines = text.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { rows: [], errors: [] };

  const header = splitCsvLine(lines[0]).map((cell) => cell.trim());
  const rows: ParsedCsvRow[] = [];
  const errors: CsvRowError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNumber = i + 1; // 1-indexed, matching what a spreadsheet app shows
    const cells = splitCsvLine(lines[i]);
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key] = cells[index] ?? "";
    });

    const result = csvRowSchema.safeParse(record);
    if (!result.success) {
      errors.push({ line: lineNumber, message: result.error.issues[0]?.message ?? "Invalid row" });
      continue;
    }
    rows.push(result.data);
  }

  return { rows, errors };
}

function duplicateKey(date: string, startTime: string, title: string): string {
  return `${date}::${startTime}::${title.trim().toLowerCase()}`;
}

export type BulkUploadSummary = { created: number; skippedDuplicates: number };

/**
 * Creates every row that isn't a duplicate of an existing occurrence (same
 * zone, date, start time, and title) or of another row earlier in the same
 * upload. Reads existing occurrences once per distinct zone present in the
 * upload, then inserts everything else in a single batched write via
 * createManualOccurrences — not one read-modify-write per row.
 */
export async function bulkCreateOccurrences(rows: ParsedCsvRow[]): Promise<BulkUploadSummary> {
  const zones = Array.from(new Set(rows.map((row) => row.zone)));
  const existingKeysByZone = new Map<Zone, Set<string>>();
  for (const zone of zones) {
    const existing = await listOccurrences({ zone });
    existingKeysByZone.set(
      zone,
      new Set(existing.map((occ) => duplicateKey(occ.date, occ.startTime, occ.title))),
    );
  }

  const seenThisUpload = new Set<string>();
  const toCreate: ParsedCsvRow[] = [];
  let skippedDuplicates = 0;

  for (const row of rows) {
    const key = duplicateKey(row.date, row.startTime, row.title);
    const uploadKey = `${row.zone}::${key}`;
    if (existingKeysByZone.get(row.zone)?.has(key) || seenThisUpload.has(uploadKey)) {
      skippedDuplicates++;
      continue;
    }
    seenThisUpload.add(uploadKey);
    toCreate.push(row);
  }

  const created = await createManualOccurrences(toCreate);
  return { created: created.length, skippedDuplicates };
}
