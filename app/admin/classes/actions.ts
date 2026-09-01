"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertAdminRequest } from "@/lib/admin/auth";
import {
  createManualOccurrence,
  rescheduleOccurrenceInPlace,
  updateOccurrenceStatus,
} from "@/lib/classes/store";
import { listSignupsByOccurrence } from "@/lib/classes/signups";
import { notifyOccurrenceChange } from "@/lib/notifications/classChangeNotifier";
import { parseOccurrenceCsv, bulkCreateOccurrences } from "@/lib/classes/csv";
import type { Zone } from "@/lib/classes/types";

const ZONES: Zone[] = ["gym", "daycare"];

function isZone(value: FormDataEntryValue | null): value is Zone {
  return typeof value === "string" && (ZONES as string[]).includes(value);
}

/** Occurrence status is shown on the public site too, so every mutation revalidates it alongside the admin views. */
function revalidateOccurrencePaths(id: string): void {
  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${id}`);
  revalidatePath("/site");
}

export async function createManualOccurrenceAction(formData: FormData): Promise<void> {
  await assertAdminRequest();

  const zoneValue = formData.get("zone");
  const zone = isZone(zoneValue) ? zoneValue : null;
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();

  if (!zone || !title || !date || !startTime || !endTime) return;

  const capacityValue = capacityRaw ? Number(capacityRaw) : null;
  const capacity = capacityValue !== null && Number.isFinite(capacityValue) ? capacityValue : null;

  await createManualOccurrence({ zone, title, date, startTime, endTime, capacity });

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function bulkUploadOccurrencesAction(formData: FormData): Promise<void> {
  await assertAdminRequest();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const text = await file.text();
  const { rows, errors } = parseOccurrenceCsv(text);
  const { created, skippedDuplicates } = await bulkCreateOccurrences(rows);

  revalidatePath("/admin/classes");
  revalidatePath("/site");

  const params = new URLSearchParams({
    uploadCreated: String(created),
    uploadSkipped: String(skippedDuplicates),
    uploadErrors: String(errors.length),
  });
  redirect(`/admin/classes?${params.toString()}`);
}

export async function confirmOccurrenceAction(formData: FormData): Promise<void> {
  await assertAdminRequest();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Confirming doesn't change anything a signed-up family needs to hear
  // about — only cancel/reschedule notify.
  await updateOccurrenceStatus(id, "confirmed");

  revalidateOccurrencePaths(id);
}

export async function cancelOccurrenceAction(formData: FormData): Promise<void> {
  await assertAdminRequest();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const noteValue = formData.get("note");
  const note = typeof noteValue === "string" && noteValue.trim() ? noteValue.trim() : undefined;

  const occurrence = await updateOccurrenceStatus(id, "cancelled", note);
  if (!occurrence) return;

  // Fetched after the mutation so notifications reflect who's currently
  // signed up, and notifyOccurrenceChange gets the already-cancelled record.
  const signups = await listSignupsByOccurrence(id);
  await notifyOccurrenceChange(occurrence, signups, "cancelled");

  revalidateOccurrencePaths(id);
}

export async function rescheduleOccurrenceAction(formData: FormData): Promise<void> {
  await assertAdminRequest();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const date = String(formData.get("date") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  if (!date || !startTime || !endTime) return;

  const result = await rescheduleOccurrenceInPlace(id, { date, startTime, endTime });
  if (!result) return;

  const { occurrence, previous } = result;
  // Fetched after the mutation, same reasoning as cancelOccurrenceAction.
  const signups = await listSignupsByOccurrence(id);
  await notifyOccurrenceChange(occurrence, signups, "rescheduled", previous);

  revalidateOccurrencePaths(id);
}
