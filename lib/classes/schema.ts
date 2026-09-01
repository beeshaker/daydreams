import { z } from "zod";

/**
 * Server-side validation for /api/classes/signups. `zone` is intentionally
 * not part of this schema — it's derived server-side from the looked-up
 * occurrence in the API route, never trusted from the client payload.
 */
export const classSignupSchema = z.object({
  occurrenceId: z.string().trim().min(1),
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(40),
  partySize: z.coerce.number().int().min(1).max(20).optional().default(1),
  consent: z.literal(true, { error: "You must acknowledge the notice to sign up" }),
  // Honeypot — real users never see or fill this field.
  companyWebsite: z.string().optional().default(""),
});

export type ValidatedClassSignupPayload = z.infer<typeof classSignupSchema>;

export function parseClassSignupPayload(input: unknown) {
  return classSignupSchema.safeParse(input);
}
