import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ClassOccurrence,
  OccurrenceReschedule,
  OccurrenceStatus,
  Zone,
} from "@/lib/classes/types";

export type OccurrenceFilter = {
  zone?: Zone;
  status?: OccurrenceStatus;
  from?: string;
  to?: string;
};

/**
 * Dev-only persistence: an append-only JSON file, mirroring
 * lib/leads/store.ts. This is the seam that gets swapped for a real
 * database in production — nothing outside this file needs to change
 * when that happens.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const OCCURRENCES_FILE = path.join(DATA_DIR, "class-occurrences.json");

async function readOccurrences(): Promise<ClassOccurrence[]> {
  try {
    const raw = await readFile(OCCURRENCES_FILE, "utf-8");
    return JSON.parse(raw) as ClassOccurrence[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeOccurrences(occurrences: ClassOccurrence[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OCCURRENCES_FILE, JSON.stringify(occurrences, null, 2), "utf-8");
}

export async function listOccurrences(filter: OccurrenceFilter = {}): Promise<ClassOccurrence[]> {
  const occurrences = await readOccurrences();
  return occurrences
    .filter((occ) => !filter.zone || occ.zone === filter.zone)
    .filter((occ) => !filter.status || occ.status === filter.status)
    .filter((occ) => !filter.from || occ.date >= filter.from)
    .filter((occ) => !filter.to || occ.date <= filter.to)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

export async function getOccurrenceById(id: string): Promise<ClassOccurrence | null> {
  const occurrences = await readOccurrences();
  return occurrences.find((occ) => occ.id === id) ?? null;
}

/**
 * Inserts an occurrence generated from a template, deduping on
 * (templateId, date) so re-running generation for the same window never
 * creates duplicates. A `templateId: null` one-off is never deduped here —
 * those are only ever created directly via createManualOccurrence.
 */
export async function insertOccurrenceIfMissing(
  occ: Omit<ClassOccurrence, "id" | "createdAt" | "updatedAt" | "rescheduleHistory" | "status">,
): Promise<void> {
  const occurrences = await readOccurrences();
  const exists =
    occ.templateId !== null &&
    occurrences.some((existing) => existing.templateId === occ.templateId && existing.date === occ.date);
  if (exists) return;

  const now = new Date().toISOString();
  const stored: ClassOccurrence = {
    ...occ,
    id: crypto.randomUUID(),
    status: "scheduled",
    rescheduleHistory: [],
    createdAt: now,
    updatedAt: now,
  };
  occurrences.push(stored);
  await writeOccurrences(occurrences);
}

export async function createManualOccurrence(input: {
  zone: Zone;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
}): Promise<ClassOccurrence> {
  const occurrences = await readOccurrences();
  const now = new Date().toISOString();
  const stored: ClassOccurrence = {
    ...input,
    id: crypto.randomUUID(),
    templateId: null,
    status: "scheduled",
    rescheduleHistory: [],
    createdAt: now,
    updatedAt: now,
  };
  occurrences.push(stored);
  await writeOccurrences(occurrences);
  return stored;
}

export async function updateOccurrenceStatus(
  id: string,
  status: OccurrenceStatus,
  note?: string,
): Promise<ClassOccurrence | null> {
  const occurrences = await readOccurrences();
  const index = occurrences.findIndex((occ) => occ.id === id);
  if (index === -1) return null;

  occurrences[index] = {
    ...occurrences[index],
    status,
    ...(note !== undefined ? { cancelledNote: note } : {}),
    updatedAt: new Date().toISOString(),
  };
  await writeOccurrences(occurrences);
  return occurrences[index];
}

export async function rescheduleOccurrenceInPlace(
  id: string,
  next: { date: string; startTime: string; endTime: string },
): Promise<{ occurrence: ClassOccurrence; previous: OccurrenceReschedule } | null> {
  const occurrences = await readOccurrences();
  const index = occurrences.findIndex((occ) => occ.id === id);
  if (index === -1) return null;

  const current = occurrences[index];
  const previous: OccurrenceReschedule = {
    fromDate: current.date,
    fromStartTime: current.startTime,
    fromEndTime: current.endTime,
    changedAt: new Date().toISOString(),
  };

  const updated: ClassOccurrence = {
    ...current,
    date: next.date,
    startTime: next.startTime,
    endTime: next.endTime,
    status: "rescheduled",
    rescheduleHistory: [...current.rescheduleHistory, previous],
    updatedAt: previous.changedAt,
  };
  occurrences[index] = updated;
  await writeOccurrences(occurrences);
  return { occurrence: updated, previous };
}
