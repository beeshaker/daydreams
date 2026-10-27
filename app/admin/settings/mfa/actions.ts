"use server";

import { redirect } from "next/navigation";
import { getAdminSession, requireAdminSession } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";
import { getDb } from "@/lib/db/client";
import { generateTotpSecret, verifyTotpCode, buildOtpAuthQrCode } from "@/lib/admin/totp";

export type MfaEnrollState = {
  error?: string;
  secret?: string;
  qrCodeDataUrl?: string;
};

export async function startMfaEnrollmentAction(): Promise<MfaEnrollState> {
  const session = await requireAdminSession({ allowWithoutMfa: true });
  const secret = generateTotpSecret();
  const qrCodeDataUrl = await buildOtpAuthQrCode(session.username ?? "admin", secret);
  return { secret, qrCodeDataUrl };
}

/**
 * Only persists the TOTP secret once the admin proves they can generate a
 * valid code with it — never saves an unverified secret, which would risk
 * locking the admin out on their next login.
 *
 * Enrollment is one-way from here: once MFA is on, this refuses to swap in
 * a new secret, so a hijacked session can't quietly take over the second
 * factor. Resetting a lost authenticator is a deliberate DB operation
 * (clear totp_secret/totp_enabled for that admin_users row).
 */
export async function confirmMfaEnrollmentAction(
  _prevState: MfaEnrollState,
  formData: FormData,
): Promise<MfaEnrollState> {
  const session = await requireAdminSession({ allowWithoutMfa: true });
  const secret = String(formData.get("secret") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!secret || !code || !(await verifyTotpCode(secret, code))) {
    return { error: "That code didn't match. Scan the QR code again and try once more.", secret };
  }

  const pool = await getDb();
  // Bumping session_version signs out every other session for this admin —
  // any that were opened with only a password before MFA existed.
  const { rows } = await pool.query<{ session_version: number }>(
    `UPDATE admin_users
     SET totp_secret = $2, totp_enabled = true, session_version = session_version + 1
     WHERE id = $1 AND totp_enabled = false
     RETURNING session_version`,
    [session.userId, secret],
  );
  if (rows.length === 0) {
    return { error: "Two-factor authentication is already enabled for this account." };
  }

  const cookieSession = await getAdminSession();
  cookieSession.sessionVersion = rows[0].session_version;
  await cookieSession.save();

  await logAdminAction({
    actorId: session.userId ?? null,
    actorUsername: session.username ?? "unknown",
    action: "mfa.enabled",
  });

  redirect("/admin/leads");
}
