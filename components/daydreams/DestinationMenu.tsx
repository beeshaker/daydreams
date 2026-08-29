"use client";

import { useState } from "react";
import { destinations } from "@/lib/daydreams/destinations";
import type { DestinationId } from "@/lib/daydreams/types";
import { Star } from "./Star";

const ICON_PATHS: Record<DestinationId, string> = {
  programs: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  staff: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6",
  schedule: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2",
  gallery: "M3 6h18v14H3zM3 6l4-3h10l4 3M9 13a3 3 0 106 0 3 3 0 00-6 0z",
  testimonials:
    "M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 4 2.5.5-1 2-2.5 4-2.5C18 5 21.5 8.5 20.5 12.5 18 17 12 21 12 21z",
  visit: "M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z",
};

function DestinationIcon({ id, color }: { id: DestinationId; color: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-white stroke-2">
        <path d={ICON_PATHS[id]} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/**
 * Non-spatial way to reach every destination directly — the primary
 * accessibility guarantee alongside the traditional-site toggle. Anyone who
 * can't or doesn't want to walk still reaches all content. Collapsed
 * behind a toggle by default (per the redesign doc's note that the
 * always-open card competed with the 3D scene for attention) — still just
 * one click, or one Tab+Enter, away, and the toggle itself always shows
 * live progress so the count doesn't disappear when collapsed.
 */
export function DestinationMenu({
  discoveredDestinationIds,
  onSelect,
}: {
  discoveredDestinationIds: DestinationId[];
  onSelect: (id: DestinationId) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="explore-panel"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-brand-ink shadow-lg ring-1 ring-brand-ink/10 hover:bg-white"
      >
        Explore
        <span className="text-brand-ink/50">
          {discoveredDestinationIds.length}/{destinations.length}
        </span>
      </button>

      {isOpen && (
        <div
          id="explore-panel"
          className="w-56 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-brand-ink/10"
        >
          <ul className="flex flex-col gap-1">
            {destinations.map((destination) => {
              const discovered = discoveredDestinationIds.includes(destination.id);
              return (
                <li key={destination.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(destination.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-brand-ink hover:bg-brand-bg"
                  >
                    <DestinationIcon id={destination.id} color={destination.color} />
                    <span className="flex-1">{destination.label}</span>
                    <span aria-label={discovered ? "Star collected" : "Star not yet collected"}>
                      <Star filled={discovered} size="sm" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
