import { NextRequest, NextResponse } from "next/server";
import { parseClassSignupPayload } from "@/lib/classes/schema";
import { getSignupCountsByOccurrenceIds, saveSignup } from "@/lib/classes/signups";
import { getOccurrenceById } from "@/lib/classes/store";
import { isRateLimited } from "@/lib/classes/rateLimit";

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

  const result = parseClassSignupPayload(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: result.error.issues },
      { status: 400 },
    );
  }

  const signup = result.data;

  // Honeypot: bots that fill this hidden field get a fake success — no
  // storage — so they don't learn the check exists.
  if (signup.companyWebsite) {
    return NextResponse.json({ success: true });
  }

  const occurrence = await getOccurrenceById(signup.occurrenceId);
  if (!occurrence) {
    return NextResponse.json({ error: "This class could not be found." }, { status: 404 });
  }

  if (occurrence.status === "cancelled") {
    return NextResponse.json({ error: "This class has been cancelled." }, { status: 400 });
  }

  if (occurrence.capacity !== null) {
    const counts = await getSignupCountsByOccurrenceIds([occurrence.id]);
    const currentCount = counts[occurrence.id] ?? 0;
    if (currentCount + signup.partySize > occurrence.capacity) {
      return NextResponse.json({ error: "This class is full." }, { status: 409 });
    }
  }

  await saveSignup(occurrence, signup);

  return NextResponse.json({ success: true });
}
