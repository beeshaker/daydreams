import { NextResponse } from "next/server";
import { getSignedConversationUrl, requireEnv } from "@/lib/elevenlabs/client";

export async function POST() {
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
