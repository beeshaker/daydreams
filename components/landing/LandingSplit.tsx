"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

/**
 * The two halves are invisible full-height Link overlays spanning the
 * whole viewport (a large, obvious hit target, not just the small centered
 * image) — a single shared image floats on top, pointer-events-none so
 * clicks pass through to whichever half is underneath. Hovering/focusing
 * one half dims the *other* half via an overlay layered above the image.
 *
 * On hover, the static logo swaps for a real animated GIF of that side —
 * generated (Seedance, image-to-video from the logo itself) rather than
 * faked with CSS, since a genuine "the mother curls the dumbbell" /
 * "the baby is lifted" motion needs actual character animation, not a
 * cropped-and-rotated static image. Swapping the whole scene (not just a
 * cropped piece) means both animations show the full picture staying
 * consistent around the moving part, with no separate cutout/patch
 * bookkeeping needed. GIFs restart from frame 0 on each hover since the
 * `src` swap re-triggers a fresh load.
 */
export function LandingSplit() {
  const [dumbbellsActive, setDumbbellsActive] = useState(false);
  const [daydreamsActive, setDaydreamsActive] = useState(false);

  const artworkSrc = dumbbellsActive
    ? "/branding/dumbbell-curl.gif"
    : daydreamsActive
      ? "/branding/baby-lift.gif"
      : "/branding/logo.png";

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-brand-bg">
      <Link
        href="/daydreams"
        aria-label="Enter Daydreams"
        onClick={() => trackEvent("landing_daydreams_selected")}
        onMouseEnter={() => setDaydreamsActive(true)}
        onMouseLeave={() => setDaydreamsActive(false)}
        onFocus={() => setDaydreamsActive(true)}
        onBlur={() => setDaydreamsActive(false)}
        className="absolute inset-y-0 left-0 z-0 w-1/2"
      />
      <Link
        href="/site#dumbbells"
        aria-label="Enter Dumbbells"
        onClick={() => trackEvent("landing_dumbbells_selected")}
        onMouseEnter={() => setDumbbellsActive(true)}
        onMouseLeave={() => setDumbbellsActive(false)}
        onFocus={() => setDumbbellsActive(true)}
        onBlur={() => setDumbbellsActive(false)}
        className="absolute inset-y-0 right-0 z-0 w-1/2"
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-8">
        <div className="relative w-full max-w-[320px] sm:max-w-[420px]">
          <Image
            src={artworkSrc}
            alt="Daydreams and Dumbbells"
            width={960}
            height={960}
            unoptimized
            priority
            className="h-auto w-full"
          />
        </div>
      </div>

      {/* Dims the daydreams/baby half when the dumbbells/mother half is active. */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-black transition-opacity duration-300 ${
          dumbbellsActive ? "opacity-35" : "opacity-0"
        }`}
      />
      {/* Dims the dumbbells/mother half when the daydreams/baby half is active. */}
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-black transition-opacity duration-300 ${
          daydreamsActive ? "opacity-35" : "opacity-0"
        }`}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-30 flex sm:bottom-14">
        <div className="flex flex-1 justify-center">
          <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-brand-ink shadow-md sm:text-base">
            Daydreams
          </span>
        </div>
        <div className="flex flex-1 justify-center">
          <span className="rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-brand-ink shadow-md sm:text-base">
            Dumbbells
          </span>
        </div>
      </div>
    </div>
  );
}
