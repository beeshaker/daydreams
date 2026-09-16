import { fetchWithTimeout } from "@/lib/http/fetchWithTimeout";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token server-side. If
 * TURNSTILE_SECRET_KEY isn't set (e.g. local dev, or before the user has
 * created a Turnstile site), this is a deliberate no-op that returns true
 * so form submission isn't blocked — a warning is logged so this is
 * visible in the server logs rather than silently bypassed forever.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string,
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping bot-protection check");
    return true;
  }

  if (!token) return false;

  try {
    const response = await fetchWithTimeout(
      VERIFY_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: secretKey, response: token, remoteip: remoteIp }),
      },
      8000,
    );

    if (!response.ok) return false;
    const result = (await response.json()) as { success: boolean };
    return result.success === true;
  } catch (error) {
    console.error("[turnstile] verification request failed", error);
    return false;
  }
}
