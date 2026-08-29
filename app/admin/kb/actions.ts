"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertAdminRequest } from "@/lib/admin/auth";
import {
  uploadKbFile,
  uploadKbUrl,
  uploadKbText,
  updateKbDocument,
  deleteKbDocument,
} from "@/lib/elevenlabs/client";

export async function createKbTextAction(formData: FormData): Promise<void> {
  await assertAdminRequest();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const text = String(formData.get("text") ?? "");
  if (!text.trim()) return;
  await uploadKbText(text, name);
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}

export async function createKbUrlAction(formData: FormData): Promise<void> {
  await assertAdminRequest();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  await uploadKbUrl(url, name);
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}

export async function createKbFileAction(formData: FormData): Promise<void> {
  await assertAdminRequest();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  await uploadKbFile(file, name);
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}

export async function updateKbDocumentAction(formData: FormData): Promise<void> {
  await assertAdminRequest();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const textValue = formData.get("text");
  const text = typeof textValue === "string" && textValue.length > 0 ? textValue : undefined;
  await updateKbDocument(id, { name, text });
  revalidatePath("/admin/kb");
  revalidatePath(`/admin/kb/${id}`);
}

export async function deleteKbDocumentAction(formData: FormData): Promise<void> {
  await assertAdminRequest();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteKbDocument(id, { force: true });
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}
