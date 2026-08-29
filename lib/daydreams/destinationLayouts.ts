import type { DestinationId } from "./types";

export type Breakpoint = "desktop" | "mobile";

export type CameraConfig = {
  /** Height/distance the chase camera keeps behind the mascot — rotates with its facing (see CameraRig.tsx), not a fixed world-space position. */
  offset: [number, number, number];
  fov: number;
};

/**
 * The room is a fixed physical space now (unlike the old outdoor island,
 * which had to reflow per breakpoint) — destination and spawn positions
 * are the same everywhere. Only camera framing needs to adapt to a
 * narrower mobile viewport.
 */
// Visit's sensor is centered at z=2.6 with a 1-unit half-extent (spans
// z 1.6-3.6) — spawn needs to clear that with margin, or the lead form
// pops open immediately on load before the player does anything (caught
// via an actual browser run, not something type-checking or a build
// verifies).
export const spawnPosition: [number, number, number] = [0, 0.3, 0.4];

// "Visit" sits at the back-center, straight down the room's main sightline
// from spawn — a "grand finale" placement (matching the redesign doc's
// note that Book a Visit should read as more visually important than the
// others), and far from the camera rather than looming in the near
// foreground. "Schedule" takes the front-right spot instead, offset off
// the x=0 camera axis so nothing blocks the direct view into the room —
// an earlier version had a station sitting dead-center between spawn and
// camera, which occluded almost the entire room at initial load (only
// caught by an actual browser screenshot, not type-checking or a build).
export const destinationPositions: Record<DestinationId, [number, number]> = {
  programs: [-3.8, -0.3],
  staff: [-2.2, -2.9],
  schedule: [1.6, 2.6],
  gallery: [2.2, -2.9],
  testimonials: [3.8, -0.3],
  visit: [0, -2.9],
};

// Pulled back partway from an earlier, tighter pass that read as too
// zoomed in, but still noticeably closer than the original wide
// establishing shot.
const cameraByBreakpoint: Record<Breakpoint, CameraConfig> = {
  desktop: { offset: [0, 3.6, 5], fov: 52 },
  mobile: { offset: [0, 4.4, 6.2], fov: 58 },
};

export function getCamera(breakpoint: Breakpoint): CameraConfig {
  return cameraByBreakpoint[breakpoint];
}
