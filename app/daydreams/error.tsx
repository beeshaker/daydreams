"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DaydreamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Daydreams interactive experience failed to load:", error);
  }, [error]);

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-4 bg-brand-bg px-6 text-center text-brand-ink">
      <h1 className="text-2xl font-bold">We couldn&apos;t start the interactive experience.</h1>
      <p className="max-w-md text-brand-ink/70">
        Your device or browser may not support the 3D driving game. You can still see everything
        on our regular site.
      </p>
      <div className="flex gap-3">
        <Link
          href="/site#daydreams"
          className="rounded-full bg-brand-pink-strong px-5 py-2.5 font-semibold text-white hover:brightness-95"
        >
          Open Daydreams website
        </Link>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-ink ring-1 ring-brand-ink/15 hover:bg-brand-bg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
