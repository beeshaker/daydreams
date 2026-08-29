"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Autoplaying muted background video for the hero — but `autoplay` alone
 * ignores prefers-reduced-motion, so a reduced-motion visitor gets the
 * static poster frame instead of the video element entirely.
 */
export function HeroVideo() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    function syncReducedMotion() {
      setReducedMotion(query.matches);
    }
    syncReducedMotion();
    query.addEventListener("change", syncReducedMotion);
    return () => query.removeEventListener("change", syncReducedMotion);
  }, []);

  if (reducedMotion) {
    return (
      <Image
        src="/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-poster.webp"
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>
  );
}
