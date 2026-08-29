"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { submitLead } from "@/lib/leads/submit";
import { trackEvent } from "@/lib/analytics";
import type { LeadType } from "@/lib/daydreams/types";

type TranscriptEntry = { role: "user" | "agent"; text: string };

type LogLeadParams = {
  interest: "daycare" | "gym";
  name: string;
  email: string;
  phone?: string;
  message?: string;
};

function VoiceAgentModal({ onClose }: { onClose: () => void }) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textOnly, setTextOnly] = useState(false);
  const [started, setStarted] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => trackEvent("voice_agent_opened"),
    onMessage: (props) => {
      setTranscript((prev) => [...prev, { role: props.role, text: props.message }]);
    },
    onError: (error) => {
      console.error("[voice-agent] session error", error);
    },
    clientTools: {
      log_lead: async (parameters: LogLeadParams) => {
        const leadType: LeadType = parameters.interest === "gym" ? "gym-interest" : "daycare-interest";
        const result = await submitLead({
          leadType,
          source: "voice-agent",
          parentName: parameters.name,
          email: parameters.email,
          phone: parameters.phone,
          message: parameters.message,
          consent: true,
          companyWebsite: "",
        });
        if (result.success) {
          trackEvent("voice_agent_lead_logged", { leadType });
          return "Lead logged successfully.";
        }
        return `Failed to log lead: ${result.error}`;
      },
    },
  });

  async function handleStart(withAudio: boolean) {
    setStartError(null);
    let audioAvailable = withAudio;

    if (withAudio) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        audioAvailable = false;
        setTextOnly(true);
      }
    } else {
      setTextOnly(true);
    }

    const tokenRes = await fetch("/api/conversation-token", { method: "POST" });
    if (!tokenRes.ok) {
      const body = (await tokenRes.json().catch(() => null)) as { error?: string } | null;
      setStartError(body?.error ?? "Couldn't start the voice agent. Please try again.");
      return;
    }

    const { signedUrl } = (await tokenRes.json()) as { signedUrl: string };
    conversation.startSession({ signedUrl, textOnly: !audioAvailable });
    setStarted(true);
  }

  function handleSendText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!textInput.trim()) return;
    conversation.sendUserMessage(textInput.trim());
    setTranscript((prev) => [...prev, { role: "user", text: textInput.trim() }]);
    setTextInput("");
  }

  function handleClose() {
    if (conversation.status === "connected" || conversation.status === "connecting") {
      conversation.endSession();
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Talk to us"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-brand-bg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-brand-ink/10 px-5 py-3">
          <p className="font-bold text-brand-ink">Talk to us</p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-ink shadow ring-1 ring-brand-ink/10 hover:bg-brand-bg"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!started ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-sm text-brand-ink/70">
                Ask about classes, programs, hours, or anything else — by voice or text.
              </p>
              {startError && (
                <p role="alert" className="text-sm text-red-600">
                  {startError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleStart(true)}
                  className="rounded-full bg-brand-pink-strong px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
                >
                  Start talking
                </button>
                <button
                  type="button"
                  onClick={() => handleStart(false)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-ink ring-1 ring-brand-ink/15 hover:bg-brand-bg"
                >
                  Type instead
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {transcript.map((entry, index) => (
                <p key={index} className={entry.role === "user" ? "text-right" : "text-left"}>
                  <span
                    className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                      entry.role === "user" ? "bg-brand-lavender-strong text-white" : "bg-white text-brand-ink"
                    }`}
                  >
                    {entry.text}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>

        {started && (
          <div className="border-t border-brand-ink/10 px-5 py-3">
            {textOnly ? (
              <form onSubmit={handleSendText} className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(event) => setTextInput(event.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
                >
                  Send
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-ink/50">
                  {conversation.status === "connected"
                    ? conversation.isSpeaking
                      ? "Speaking…"
                      : "Listening…"
                    : "Connecting…"}
                </p>
                <button
                  type="button"
                  onClick={() => conversation.setMuted(!conversation.isMuted)}
                  className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-ink ring-1 ring-brand-ink/15 hover:bg-brand-bg"
                >
                  {conversation.isMuted ? "Unmute" : "Mute"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function VoiceAgentWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/daydreams") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <ConversationProvider>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-30 rounded-full bg-brand-pink-strong px-5 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-95"
        >
          Talk to us
        </button>
      )}
      {open && <VoiceAgentModal onClose={() => setOpen(false)} />}
    </ConversationProvider>
  );
}
