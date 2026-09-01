import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ValidatedClassSignupPayload } from "@/lib/classes/schema";
import type { ClassOccurrence, ClassSignup, NotificationLogEntry } from "@/lib/classes/types";

/**
 * Dev-only persistence: an append-only JSON file, mirroring
 * lib/leads/store.ts and lib/classes/store.ts. This is the seam that gets
 * swapped for a real database in production — nothing outside this file
 * needs to change when that happens.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const SIGNUPS_FILE = path.join(DATA_DIR, "class-signups.json");

async function readSignups(): Promise<ClassSignup[]> {
  try {
    const raw = await readFile(SIGNUPS_FILE, "utf-8");
    return JSON.parse(raw) as ClassSignup[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeSignups(signups: ClassSignup[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SIGNUPS_FILE, JSON.stringify(signups, null, 2), "utf-8");
}

/** Persists a sign-up for `occurrence`, deriving `zone` server-side rather than trusting the client. */
export async function saveSignup(
  occurrence: ClassOccurrence,
  payload: ValidatedClassSignupPayload,
): Promise<ClassSignup> {
  const signups = await readSignups();
  const stored: ClassSignup = {
    id: crypto.randomUUID(),
    occurrenceId: occurrence.id,
    zone: occurrence.zone,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    partySize: payload.partySize,
    consent: payload.consent,
    createdAt: new Date().toISOString(),
    notifications: [],
  };
  signups.push(stored);
  await writeSignups(signups);
  return stored;
}

export async function listSignupsByOccurrence(occurrenceId: string): Promise<ClassSignup[]> {
  const signups = await readSignups();
  return signups.filter((signup) => signup.occurrenceId === occurrenceId);
}

/** Sums partySize per occurrenceId — only counts, not full rows, for the public page's headcount display. */
export async function getSignupCountsByOccurrenceIds(
  occurrenceIds: string[],
): Promise<Record<string, number>> {
  const signups = await readSignups();
  const ids = new Set(occurrenceIds);
  const counts: Record<string, number> = {};
  for (const signup of signups) {
    if (!ids.has(signup.occurrenceId)) continue;
    counts[signup.occurrenceId] = (counts[signup.occurrenceId] ?? 0) + signup.partySize;
  }
  return counts;
}

export async function appendNotificationLog(
  signupId: string,
  entries: NotificationLogEntry[],
): Promise<void> {
  const signups = await readSignups();
  const index = signups.findIndex((signup) => signup.id === signupId);
  if (index === -1) return;
  signups[index] = {
    ...signups[index],
    notifications: [...signups[index].notifications, ...entries],
  };
  await writeSignups(signups);
}
