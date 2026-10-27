/**
 * Content-Security-Policy builders.
 *
 * Two policies, because the site has two very different halves:
 *
 * - Public pages are statically prerendered, so they can't carry a
 *   per-request nonce (see node_modules/next/dist/docs/01-app/02-guides/
 *   content-security-policy.md). They get a host-allowlist policy that
 *   still permits inline scripts (Next's hydration payload, the dumbbells
 *   page's inline boot scripts) but blocks loading script from, framing,
 *   or sending data to any origin not listed here. Applied from
 *   next.config.ts headers().
 * - Admin pages hold lead PII and are always dynamic, so they get a strict
 *   nonce + 'strict-dynamic' policy with no third parties at all. Applied
 *   per request from proxy.ts.
 *
 * Adding a new third-party embed/script/API to a public page means adding
 * its origin below, or the browser will block it (visible as a CSP
 * violation in the devtools console).
 */

const isDev = process.env.NODE_ENV === "development";

function serialize(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name))
    .join("; ");
}

export function buildPublicCsp(): string {
  return serialize({
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      // Rapier physics (the Daydreams 3D game) compiles WebAssembly.
      "'wasm-unsafe-eval'",
      // ElevenLabs voice widget registers its audio worklets from blob: URLs.
      "blob:",
      "https://challenges.cloudflare.com",
      // ElevenLabs client's resampler worklet.
      "https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js@2.1.2/",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "blob:"],
    "media-src": ["'self'", "blob:"],
    "connect-src": [
      "'self'",
      "https://*.elevenlabs.io",
      "wss://*.elevenlabs.io",
      "https://challenges.cloudflare.com",
      // drei's useGLTF Draco decoder, only fetched for Draco-compressed models.
      "https://www.gstatic.com/draco/",
    ],
    "worker-src": ["'self'", "blob:"],
    // Turnstile widget and the Google Maps embed on the home page.
    "frame-src": ["https://challenges.cloudflare.com", "https://www.google.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
  });
}

export function buildAdminCsp(nonce: string): string {
  return serialize({
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    // Tailwind output is a static stylesheet, but React/Next still emit a
    // few inline style attributes; style injection alone can't run script.
    "style-src": ["'self'", "'unsafe-inline'"],
    // data: for the MFA enrollment QR code.
    "img-src": ["'self'", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
  });
}

export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/** Headers that apply to every response, public and admin alike. */
export const BASELINE_SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Microphone stays allowed for the site itself — the voice agent uses it.
    value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
