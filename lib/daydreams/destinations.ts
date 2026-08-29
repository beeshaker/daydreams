import type { Destination } from "./types";

/**
 * Single source of truth for the Daydreams destinations. Drives the 3D
 * blocks, the Explore menu, progress tracking, and content-panel routing —
 * add a destination here once, not in each consumer separately.
 */
export const destinations: Destination[] = [
  { id: "programs", label: "Programs", blockLabel: "PLAY", color: "#9b5de5" },
  { id: "staff", label: "Meet the Teachers", blockLabel: "MEET", color: "#5fa8d3" },
  { id: "schedule", label: "Our Day", blockLabel: "DAY", color: "#f4b93e" },
  { id: "gallery", label: "Gallery", blockLabel: "LOOK", color: "#f2789f" },
  { id: "testimonials", label: "Parents Say", blockLabel: "LOVE", color: "#f4a259" },
  { id: "visit", label: "Book a Visit", blockLabel: "VISIT", color: "#2ec4b6" },
];

export function getDestination(id: string): Destination | undefined {
  return destinations.find((destination) => destination.id === id);
}
