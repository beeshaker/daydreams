"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession, type AdminSessionData } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";
import {
  uploadKbFile,
  uploadKbUrl,
  uploadKbText,
  updateKbDocument,
  deleteKbDocument,
} from "@/lib/elevenlabs/client";

function audit(session: AdminSessionData, action: string, targetId?: string) {
  return logAdminAction({
    actorId: session.userId ?? null,
    actorUsername: session.username ?? "unknown",
    action,
    targetType: "kb_document",
    targetId,
  });
}

export async function createKbTextAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const text = String(formData.get("text") ?? "");
  if (!text.trim()) return;
  const doc = await uploadKbText(text, name);
  await audit(session, "kb.create_text", doc.id);
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}

export async function createKbUrlAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  const doc = await uploadKbUrl(url, name);
  await audit(session, "kb.create_url", doc.id);
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}

export async function createKbFileAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const doc = await uploadKbFile(file, name);
  await audit(session, "kb.create_file", doc.id);
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}

export async function updateKbDocumentAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const name = String(formData.get("name") ?? "").trim() || undefined;
  const textValue = formData.get("text");
  const text = typeof textValue === "string" && textValue.length > 0 ? textValue : undefined;
  await updateKbDocument(id, { name, text });
  await audit(session, "kb.update", id);
  revalidatePath("/admin/kb");
  revalidatePath(`/admin/kb/${id}`);
}

export async function deleteKbDocumentAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteKbDocument(id, { force: true });
  await audit(session, "kb.delete", id);
  revalidatePath("/admin/kb");
  redirect("/admin/kb");
}
