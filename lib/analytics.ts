type DestinationEventName = `destination_${string}_opened`;

export type AnalyticsEvent =
  | "landing_daydreams_selected"
  | "landing_dumbbells_selected"
  | "daydreams_game_started"
  | "daydreams_traditional_selected"
  | DestinationEventName
  | "lead_started"
  | "lead_submitted"
  | "all_stars_collected"
  | "voice_agent_opened"
  | "voice_agent_lead_logged";

/**
 * Thin analytics seam — call sites and event names are established now so
 * they're not bolted on later, but no real provider is wired up yet. Swap
 * the body for a real analytics call (Plausible/GA/etc.) without touching
 * any call site.
 */
export function trackEvent(name: AnalyticsEvent, props?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[analytics] ${name}`, props ?? {});
  }
}
