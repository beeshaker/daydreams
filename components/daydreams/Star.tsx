"use client";

import { useEffect, useRef, useState } from "react";

const STAR_GOLD = "#f4b93e";

/**
 * Shared star icon used both for GameHUD's progress row and for each
 * Explore-menu row's per-destination collectible — the same "collect a
 * star at each destination" idea shown two ways. Plays a brief pop
 * animation the moment `filled` transitions from false to true (a
 * destination just got discovered), not on every render.
 */
export function Star({ filled, size = "md" }: { filled: boolean; size?: "sm" | "md" }) {
  const wasFilledRef = useRef(filled);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    if (filled && !wasFilledRef.current) {
      setPopping(true);
      const timer = setTimeout(() => setPopping(false), 450);
      wasFilledRef.current = filled;
      return () => clearTimeout(timer);
    }
    wasFilledRef.current = filled;
  }, [filled]);

  const dimension = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <svg
      viewBox="0 0 20 20"
      className={`${dimension} shrink-0 transition-colors duration-300 ${popping ? "animate-star-pop" : ""}`}
      style={{ fill: filled ? STAR_GOLD : "rgba(26, 26, 26, 0.15)" }}
    >
      <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
    </svg>
  );
}
