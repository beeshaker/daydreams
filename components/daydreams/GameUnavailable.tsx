"use client";

import Link from "next/link";

export function GameUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-brand-bg px-6 py-12 text-center text-brand-ink">
      <p className="font-baloo text-3xl text-brand-lavender-strong">Daydreams</p>
      <h1 className="font-baloo max-w-lg text-4xl">There&apos;s another way to explore.</h1>
      <p className="max-w-md text-brand-ink/75">
        The interactive tour isn&apos;t available in this browser. You can still explore our
        programs, meet the teachers, and book a visit on the Daydreams website.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/daydreams/site"
          className="rounded-full bg-brand-pink-strong px-5 py-3 font-semibold text-white hover:brightness-95"
        >
          Open Daydreams website
        </Link>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-white px-5 py-3 font-semibold ring-1 ring-brand-ink/15 hover:bg-brand-lavender/10"
        >
          Try the game again
        </button>
      </div>
      <Link href="/" className="text-sm text-brand-ink/70 underline underline-offset-4">
        Back to the entrance
      </Link>
    </main>
  );
}
