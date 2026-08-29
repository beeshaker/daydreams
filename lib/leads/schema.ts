import { z } from "zod";

/**
 * Server-side validation for /api/leads. Mirrors LeadPayload in
 * lib/daydreams/types.ts but is intentionally the source of truth for what
 * the API will actually accept — the type is for callers, this is the gate.
 */
export const leadPayloadSchema = z.object({
  leadType: z.enum(["daycare-interest", "gym-interest"]),
  source: z.enum(["game", "traditional-site", "voice-agent"]),
  parentName: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z.string().trim().max(40).optional(),
  childAge: z.string().trim().max(60).optional(),
  preferredContact: z.string().trim().max(60).optional(),
  message: z.string().trim().max(2000).optional(),
  consent: z.literal(true, {
    error: "You must acknowledge the privacy notice to submit this form",
  }),
  // Honeypot — real users never see or fill this field.
  companyWebsite: z.string().optional().default(""),
});

export type ValidatedLeadPayload = z.infer<typeof leadPayloadSchema>;

export function parseLeadPayload(input: unknown) {
  return leadPayloadSchema.safeParse(input);
}
