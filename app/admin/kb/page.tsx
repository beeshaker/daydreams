import Link from "next/link";
import { listKbDocuments } from "@/lib/elevenlabs/client";

export const metadata = {
  title: "Admin — Knowledge Base",
};

export default async function AdminKbPage() {
  let documents: Awaited<ReturnType<typeof listKbDocuments>> = [];
  let loadError: string | null = null;

  try {
    documents = await listKbDocuments();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Couldn't load knowledge base documents — is ELEVENLABS_API_KEY set?";
  }

  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/admin/leads" className="text-brand-lavender-strong underline">
              Leads
            </Link>
            <Link
              href="/admin/kb/new"
              className="rounded-md bg-brand-pink-strong px-3 py-1.5 font-semibold text-white hover:brightness-95"
            >
              Add document
            </Link>
          </div>
        </div>

        {loadError && (
          <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        <div className="mt-6 divide-y divide-brand-ink/10 rounded-lg border border-brand-ink/10 bg-white">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/admin/kb/${doc.id}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-brand-bg"
            >
              <span className="font-medium">{doc.name}</span>
              <span className="text-brand-ink/50">{doc.type}</span>
            </Link>
          ))}
          {documents.length === 0 && !loadError && (
            <p className="px-4 py-8 text-center text-sm text-brand-ink/50">
              No documents yet. Add one to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
