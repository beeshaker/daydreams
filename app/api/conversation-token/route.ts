import { NextRequest, NextResponse } from "next/server";
import { getSignedConversationUrl, requireEnv } from "@/lib/elevenlabs/client";
import { isRateLimited } from "@/lib/ratelimit/postgresRateLimit";
import { checkDailyQuota } from "@/lib/ratelimit/quota";
import { getClientIp } from "@/lib/http/clientIp";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.CONVERSATION_TOKEN_RATE_MAX ?? 3);
const DAILY_QUOTA = Number(process.env.CONVERSATION_TOKEN_DAILY_QUOTA ?? 200);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (await isRateLimited("conversation-token", ip, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  if (await checkDailyQuota("conversation-token", DAILY_QUOTA)) {
    console.warn("[conversation-token] daily quota exceeded");
    return NextResponse.json(
      { error: "Voice agent is temporarily unavailable. Please try again later." },
      { status: 429 },
    );
  }

  let agentId: string;
  try {
    agentId = requireEnv("ELEVENLABS_AGENT_ID");
    requireEnv("ELEVENLABS_API_KEY");
  } catch (error) {
    console.error("[conversation-token] missing env var:", error);
    return NextResponse.json({ error: "Voice agent is not configured." }, { status: 503 });
  }

  try {
    const { signedUrl } = await getSignedConversationUrl(agentId);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("[conversation-token] ElevenLabs request failed:", error);
    return NextResponse.json(
      { error: "Couldn't start the voice agent. Please try again." },
      { status: 502 },
    );
  }
}
