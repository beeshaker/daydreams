"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type HeroVideoProps = {
  src?: string;
  poster?: string;
};

/**
 * Autoplaying muted background video for the hero — but `autoplay` alone
 * ignores prefers-reduced-motion, so a reduced-motion visitor gets the
 * static poster frame instead of the video element entirely.
 */
export function HeroVideo({ src = "/hero-video.mp4", poster = "/hero-poster.webp" }: HeroVideoProps) {
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
        src={poster}
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
      poster={poster}
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
