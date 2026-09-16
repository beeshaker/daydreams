/**
 * Extracts the "real" client IP from an incoming request, trusting only the
 * hop(s) appended by our own reverse proxy — not arbitrary client-supplied
 * headers.
 *
 * `X-Forwarded-For` is a comma-separated list that each proxy in the chain
 * appends to (rightmost entry = most recently added, i.e. closest to us).
 * A client can freely set this header themselves, so the leftmost entries
 * are never trustworthy on their own — only entries appended by hops we
 * control are. `TRUSTED_PROXY_HOPS` says how many trusted hops sit between
 * us and the client (default 1, i.e. a single reverse proxy), and we read
 * the value that many entries in from the right.
 *
 * `X-Real-IP` is preferred when present, since (once configured) it is set
 * directly by our reverse proxy from the raw socket address rather than
 * built up from a client-editable list.
 *
 * IMPORTANT: this is only fully trustworthy once the eventual reverse
 * proxy (Nginx — not yet configured; VPS deployment work, out of scope
 * here) is confirmed to set `X-Real-IP $remote_addr;` and to properly
 * append (rather than blindly pass through) `X-Forwarded-For`. Until then,
 * both headers may still be attacker-controlled end to end.
 */
const TRUSTED_PROXY_HOPS = Number(process.env.TRUSTED_PROXY_HOPS ?? 1);

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return "unknown";

  const hops = forwardedFor
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  if (hops.length === 0) return "unknown";

  const trustedIndex = hops.length - TRUSTED_PROXY_HOPS;
  return hops[Math.max(0, trustedIndex)] ?? "unknown";
}
