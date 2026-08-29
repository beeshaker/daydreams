"use client";

import { useEffect, useRef } from "react";
import { destinations } from "@/lib/daydreams/destinations";
import type {
  DestinationId,
  Program,
  StaffMember,
  ScheduleBlock,
  GalleryImage,
  Testimonial,
} from "@/lib/daydreams/types";
import { ProgramsSection } from "./sections/ProgramsSection";
import { StaffSection } from "./sections/StaffSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { GallerySection } from "./sections/GallerySection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { BookAVisitForm } from "./BookAVisitForm";

export type DaydreamsContent = {
  programs: Program[];
  staff: StaffMember[];
  schedule: ScheduleBlock[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
};

export function ContentPanel({
  destinationId,
  content,
  onClose,
}: {
  destinationId: DestinationId | null;
  content: DaydreamsContent;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const open = destinationId !== null;

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      previouslyFocusedRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const destination = destinations.find((item) => item.id === destinationId);

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={destination?.label ?? "Content"}
        className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-brand-bg p-6 outline-none sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-ink">{destination?.label}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-ink shadow ring-1 ring-brand-ink/10 hover:bg-brand-bg"
          >
            Close
          </button>
        </div>

        {destinationId === "programs" && <ProgramsSection programs={content.programs} />}
        {destinationId === "staff" && <StaffSection staff={content.staff} />}
        {destinationId === "schedule" && <ScheduleSection schedule={content.schedule} />}
        {destinationId === "gallery" && <GallerySection gallery={content.gallery} />}
        {destinationId === "testimonials" && (
          <TestimonialsSection testimonials={content.testimonials} />
        )}
        {destinationId === "visit" && <BookAVisitForm source="game" />}
      </div>
    </div>
  );
}
