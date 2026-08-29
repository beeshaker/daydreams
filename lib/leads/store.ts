import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ValidatedLeadPayload } from "./schema";

export type EmailNotificationStatus = "pending" | "sent" | "failed" | "skipped";

export type LeadStatus = "new" | "contacted" | "booked" | "closed";

export type StoredLead = ValidatedLeadPayload & {
  id: string;
  createdAt: string;
  emailNotificationStatus: EmailNotificationStatus;
  status: LeadStatus;
  notes: string;
};

export type LeadFilter = {
  status?: LeadStatus;
  leadType?: ValidatedLeadPayload["leadType"];
  search?: string;
};

/**
 * Dev-only persistence: an append-only JSON file. This is the seam that
 * gets swapped for Vercel Postgres in production — nothing outside this
 * file needs to change when that happens, only the implementation of
 * saveLead()/updateLeadEmailStatus().
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

async function readLeads(): Promise<StoredLead[]> {
  try {
    const raw = await readFile(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoredLead[];
    // Entries written before status/notes existed fall back to defaults rather than needing a migration.
    return parsed.map((lead) => ({
      ...lead,
      status: lead.status ?? "new",
      notes: lead.notes ?? "",
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLeads(leads: StoredLead[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

/** Persists the lead first — the DB write is the source of truth, independent of email delivery. */
export async function saveLead(lead: ValidatedLeadPayload): Promise<StoredLead> {
  const leads = await readLeads();
  const stored: StoredLead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    emailNotificationStatus: "pending",
    status: "new",
    notes: "",
  };
  leads.push(stored);
  await writeLeads(leads);
  return stored;
}

/** Called after the (best-effort) email attempt so delivery status never blocks the lead being saved. */
export async function updateLeadEmailStatus(
  id: string,
  status: EmailNotificationStatus,
): Promise<void> {
  const leads = await readLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return;
  leads[index] = { ...leads[index], emailNotificationStatus: status };
  await writeLeads(leads);
}

export async function updateLeadStatusAndNotes(
  id: string,
  patch: { status?: LeadStatus; notes?: string },
): Promise<StoredLead | null> {
  const leads = await readLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return null;
  leads[index] = { ...leads[index], ...patch };
  await writeLeads(leads);
  return leads[index];
}

export async function listLeads(filter: LeadFilter = {}): Promise<StoredLead[]> {
  const leads = await readLeads();
  const search = filter.search?.trim().toLowerCase();
  return leads
    .filter((lead) => !filter.status || lead.status === filter.status)
    .filter((lead) => !filter.leadType || lead.leadType === filter.leadType)
    .filter(
      (lead) =>
        !search ||
        lead.parentName.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search) ||
        lead.notes.toLowerCase().includes(search),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
