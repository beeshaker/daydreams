"use server";

import { revalidatePath } from "next/cache";
import { assertAdminRequest } from "@/lib/admin/auth";
import { updateLeadStatusAndNotes, type LeadStatus } from "@/lib/leads/store";

const VALID_STATUSES: LeadStatus[] = ["new", "contacted", "booked", "closed"];

function isLeadStatus(value: FormDataEntryValue | null): value is LeadStatus {
  return typeof value === "string" && (VALID_STATUSES as string[]).includes(value);
}

export async function updateLeadAction(formData: FormData): Promise<void> {
  await assertAdminRequest();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const statusValue = formData.get("status");
  const notesValue = formData.get("notes");

  await updateLeadStatusAndNotes(id, {
    status: isLeadStatus(statusValue) ? statusValue : undefined,
    notes: typeof notesValue === "string" ? notesValue : undefined,
  });

  revalidatePath("/admin/leads");
}
