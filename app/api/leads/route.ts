import { NextRequest, NextResponse, after } from "next/server";
import { parseLeadPayload } from "@/lib/leads/schema";
import { saveLead, updateLeadEmailStatus } from "@/lib/leads/store";
import { sendLeadNotification } from "@/lib/leads/email";
import { retryNotificationWithBackoff } from "@/lib/leads/emailRetry";
import { isRateLimited } from "@/lib/ratelimit/postgresRateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { getClientIp } from "@/lib/http/clientIp";
import { assertBodySizeFromHeader, PayloadTooLargeError } from "@/lib/http/bodyLimit";

const LEADS_MAX_BODY_BYTES = Number(process.env.LEADS_MAX_BODY_BYTES ?? 20000);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (await isRateLimited("leads", ip, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  try {
    assertBodySizeFromHeader(request, LEADS_MAX_BODY_BYTES);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    }
    throw error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = parseLeadPayload(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: result.error.issues },
      { status: 400 },
    );
  }

  const lead = result.data;

  // Honeypot: bots that fill this hidden field get a fake success — no
  // storage, no email — so they don't learn the check exists.
  if (lead.companyWebsite) {
    return NextResponse.json({ success: true });
  }

  const turnstileOk = await verifyTurnstileToken(lead.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "We couldn't verify your submission. Please try again." },
      { status: 400 },
    );
  }

  const stored = await saveLead(lead);

  // Best-effort — a failed notification never turns a successful
  // submission into a user-facing error; the DB row is already the source
  // of truth.
  const emailStatus = await sendLeadNotification(stored);
  await updateLeadEmailStatus(stored.id, emailStatus);

  if (emailStatus === "failed") {
    // Runs after the response is sent — a backoff retry shouldn't delay
    // the submitting user, and the lead is already durably saved.
    after(() => retryNotificationWithBackoff(stored));
  }

  return NextResponse.json({ success: true });
}
