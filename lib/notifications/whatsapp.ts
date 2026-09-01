import type { ClassOccurrence, ClassSignup, OccurrenceReschedule } from "@/lib/classes/types";

/**
 * Strips everything but digits and a leading "+". Returns null when fewer
 * than 8 digits remain — too short to be a real phone number, treated as
 * invalid so callers can skip the send rather than call the API with junk.
 */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  const trimmed = phone.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length < 8) return null;

  return hasLeadingPlus ? `+${digits}` : digits;
}

/**
 * Best-effort attendee notification via the WhatsApp Cloud API (raw fetch,
 * mirroring the Resend pattern in lib/leads/email.ts — no SDK dependency).
 * Without WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID set, this is a
 * no-op that logs the full payload it would have sent (template name +
 * ordered body params) instead of throwing — this is how the integration
 * gets verified as wired correctly before the client's Meta-approved
 * template exists.
 */
export async function sendWhatsAppTemplateMessage(args: {
  to: string;
  templateName: string;
  languageCode: string;
  bodyParams: string[];
}): Promise<"sent" | "failed" | "skipped"> {
  const { to, templateName, languageCode, bodyParams } = args;

  const normalizedTo = normalizePhoneForWhatsApp(to);
  if (!normalizedTo) {
    console.log(
      `[classes] WhatsApp recipient "${to}" is not a valid phone number — skipping template "${templateName}"`,
    );
    return "skipped";
  }

  const payload = {
    messaging_product: "whatsapp",
    to: normalizedTo,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: bodyParams.map((text) => ({ type: "text" as const, text })),
        },
      ],
    },
  };

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.log(
      `[classes] WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID not set — skipping WhatsApp template message. Payload that would have been sent: ${JSON.stringify(payload)}`,
    );
    return "skipped";
  }

  try {
    const apiVersion = process.env.WHATSAPP_API_VERSION ?? "v21.0";
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      console.error(
        `[classes] WhatsApp Cloud API responded ${response.status} for template "${templateName}" to ${normalizedTo}`,
      );
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error(
      `[classes] Failed to send WhatsApp template "${templateName}" to ${normalizedTo}`,
      error,
    );
    return "failed";
  }
}

export async function sendClassCancelledWhatsApp(
  signup: ClassSignup,
  occurrence: ClassOccurrence,
): Promise<"sent" | "failed" | "skipped"> {
  return sendWhatsAppTemplateMessage({
    to: signup.phone,
    templateName: process.env.WHATSAPP_TEMPLATE_CLASS_CANCELLED ?? "class_cancelled",
    languageCode: process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE ?? "en_US",
    // Positional body param order — must match the Meta-approved template
    // body exactly: {{1}} title, {{2}} date, {{3}} startTime.
    bodyParams: [occurrence.title, occurrence.date, occurrence.startTime],
  });
}

export async function sendClassRescheduledWhatsApp(
  signup: ClassSignup,
  occurrence: ClassOccurrence,
  previous: OccurrenceReschedule,
): Promise<"sent" | "failed" | "skipped"> {
  return sendWhatsAppTemplateMessage({
    to: signup.phone,
    templateName: process.env.WHATSAPP_TEMPLATE_CLASS_RESCHEDULED ?? "class_rescheduled",
    languageCode: process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE ?? "en_US",
    // Positional body param order — must match the Meta-approved template
    // body exactly: {{1}} title, {{2}} old date, {{3}} old time, {{4}} new date, {{5}} new time.
    bodyParams: [
      occurrence.title,
      previous.fromDate,
      previous.fromStartTime,
      occurrence.date,
      occurrence.startTime,
    ],
  });
}
