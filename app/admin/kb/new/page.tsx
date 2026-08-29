import Link from "next/link";
import { createKbTextAction, createKbUrlAction, createKbFileAction } from "../actions";

export const metadata = {
  title: "Admin — Add Knowledge Base Document",
};

export default function AdminKbNewPage() {
  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/kb" className="text-sm text-brand-lavender-strong underline">
          ← Back to knowledge base
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Add a document</h1>

        <section className="mt-8 rounded-lg border border-brand-ink/10 bg-white p-5">
          <h2 className="font-bold">Paste text</h2>
          <form action={createKbTextAction} className="mt-3 flex flex-col gap-3">
            <input
              type="text"
              name="name"
              placeholder="Document name (optional)"
              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
            />
            <textarea
              name="text"
              required
              rows={8}
              placeholder="Paste knowledge base content…"
              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="self-start rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Upload text
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-lg border border-brand-ink/10 bg-white p-5">
          <h2 className="font-bold">Add a URL</h2>
          <form action={createKbUrlAction} className="mt-3 flex flex-col gap-3">
            <input
              type="text"
              name="name"
              placeholder="Document name (optional)"
              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
            />
            <input
              type="url"
              name="url"
              required
              placeholder="https://…"
              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="self-start rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Add URL
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-lg border border-brand-ink/10 bg-white p-5">
          <h2 className="font-bold">Upload a file</h2>
          <form action={createKbFileAction} className="mt-3 flex flex-col gap-3">
            <input
              type="text"
              name="name"
              placeholder="Document name (optional)"
              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
            />
            <input type="file" name="file" required className="text-sm" />
            <button
              type="submit"
              className="self-start rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              Upload file
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
