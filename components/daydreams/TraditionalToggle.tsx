"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function TraditionalToggle({ prominent }: { prominent: boolean }) {
  return (
    <Link
      href="/site#daydreams"
      onClick={() => trackEvent("daydreams_traditional_selected")}
      className={
        "pointer-events-auto rounded-full bg-brand-lavender-strong font-semibold text-white shadow-md transition hover:brightness-95 " +
        (prominent ? "px-5 py-2.5 text-sm" : "px-4 py-2 text-sm")
      }
    >
      Traditional Site
    </Link>
  );
}
