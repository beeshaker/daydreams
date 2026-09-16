"use server";

import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";
import { getDb } from "@/lib/db/client";
import { generateTotpSecret, verifyTotpCode, buildOtpAuthQrCode } from "@/lib/admin/totp";

export type MfaEnrollState = {
  error?: string;
  secret?: string;
  qrCodeDataUrl?: string;
};

export async function startMfaEnrollmentAction(): Promise<MfaEnrollState> {
  const session = await requireAdminSession();
  const secret = generateTotpSecret();
  const qrCodeDataUrl = await buildOtpAuthQrCode(session.username ?? "admin", secret);
  return { secret, qrCodeDataUrl };
}

/**
 * Only persists the TOTP secret once the admin proves they can generate a
 * valid code with it — never saves an unverified secret, which would risk
 * locking the admin out on their next login.
 */
export async function confirmMfaEnrollmentAction(
  _prevState: MfaEnrollState,
  formData: FormData,
): Promise<MfaEnrollState> {
  const session = await requireAdminSession();
  const secret = String(formData.get("secret") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!secret || !code || !(await verifyTotpCode(secret, code))) {
    return { error: "That code didn't match. Scan the QR code again and try once more.", secret };
  }

  const pool = await getDb();
  await pool.query("UPDATE admin_users SET totp_secret = $2, totp_enabled = true WHERE id = $1", [
    session.userId,
    secret,
  ]);

  await logAdminAction({
    actorId: session.userId ?? null,
    actorUsername: session.username ?? "unknown",
    action: "mfa.enabled",
  });

  redirect("/admin/leads");
}
