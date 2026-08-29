import Link from "next/link";
import { getKbDocument } from "@/lib/elevenlabs/client";
import { updateKbDocumentAction, deleteKbDocumentAction } from "../actions";

export const metadata = {
  title: "Admin — Knowledge Base Document",
};

export default async function AdminKbDocumentPage(props: PageProps<"/admin/kb/[documentId]">) {
  const { documentId } = await props.params;
  const doc = await getKbDocument(documentId);
  const isEditableText = doc.type === "text" && typeof doc.text === "string";

  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/kb" className="text-sm text-brand-lavender-strong underline">
          ← Back to knowledge base
        </Link>
        <h1 className="mt-4 text-2xl font-bold">{doc.name}</h1>
        <p className="mt-1 text-sm text-brand-ink/50">Type: {doc.type}</p>

        <form action={updateKbDocumentAction} className="mt-6 flex flex-col gap-3 rounded-lg border border-brand-ink/10 bg-white p-5">
          <input type="hidden" name="id" value={doc.id} />
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <input
              type="text"
              name="name"
              defaultValue={doc.name}
              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
            />
          </label>

          {isEditableText ? (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Content
              <textarea
                name="text"
                defaultValue={doc.text}
                rows={14}
                className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
              />
            </label>
          ) : (
            <p className="text-sm text-brand-ink/60">
              This document&apos;s source content ({doc.type}) can&apos;t be edited in place here yet —
              only its name. Replace the file or URL directly in the ElevenLabs dashboard if the
              content itself needs to change.
            </p>
          )}

          <button
            type="submit"
            className="self-start rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            Save
          </button>
        </form>

        <form action={deleteKbDocumentAction} className="mt-4">
          <input type="hidden" name="id" value={doc.id} />
          <button
            type="submit"
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50"
          >
            Delete document
          </button>
        </form>
      </div>
    </div>
  );
}
