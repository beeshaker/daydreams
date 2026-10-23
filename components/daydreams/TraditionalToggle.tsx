"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

/** The game's ways out: back to the combined home page, or to the Daydreams traditional site. */
export function TraditionalToggle({ prominent }: { prominent: boolean }) {
  const size = prominent ? "px-5 py-2.5 text-sm" : "px-4 py-2 text-sm";
  return (
    <div className="pointer-events-auto flex gap-2">
      <Link
        href="/"
        className={`rounded-full bg-white font-semibold text-brand-ink shadow-md transition hover:bg-white/90 ${size}`}
      >
        Home
      </Link>
      <Link
        href="/daydreams/site"
        onClick={() => trackEvent("daydreams_traditional_selected")}
        className={`rounded-full bg-brand-lavender-strong font-semibold text-white shadow-md transition hover:brightness-95 ${size}`}
      >
        Traditional Site
      </Link>
    </div>
  );
}
