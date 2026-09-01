const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

/**
 * Minimal in-memory, per-process rate limiter for /api/classes/signups.
 * Mirrors lib/leads/rateLimit.ts but keeps its own module-scoped state —
 * intentionally not shared with the leads rate limiter. It resets on server
 * restart and isn't shared across serverless instances — good enough to
 * blunt casual form-spam for launch, not a substitute for a real store
 * (e.g. Upstash/Redis) if abuse becomes a problem later.
 */
const requestTimestampsByIp = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestTimestampsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestTimestampsByIp.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  requestTimestampsByIp.set(ip, timestamps);
  return false;
}
