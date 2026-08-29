import { NextRequest, NextResponse } from "next/server";
import { parseLeadPayload } from "@/lib/leads/schema";
import { saveLead, updateLeadEmailStatus } from "@/lib/leads/store";
import { sendLeadNotification } from "@/lib/leads/email";
import { isRateLimited } from "@/lib/leads/rateLimit";

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
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

  const stored = await saveLead(lead);

  // Best-effort — a failed notification never turns a successful
  // submission into a user-facing error; the DB row is already the source
  // of truth.
  const emailStatus = await sendLeadNotification(stored);
  await updateLeadEmailStatus(stored.id, emailStatus);

  return NextResponse.json({ success: true });
}
