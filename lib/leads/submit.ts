import type { LeadPayload } from "@/lib/daydreams/types";

export type SubmitLeadResult = { success: true } | { success: false; error: string };

export async function submitLead(payload: LeadPayload): Promise<SubmitLeadResult> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return { success: false, error: data?.error ?? "Something went wrong. Please try again." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Network error. Please check your connection and try again." };
  }
}
