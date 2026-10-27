"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { verifyPassword } from "@/lib/admin/passwords";
import { matchTotpCode } from "@/lib/admin/totp";
import { getAdminSession, MFA_REQUIRED } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";
import { isRateLimited } from "@/lib/ratelimit/postgresRateLimit";
import { getClientIp } from "@/lib/http/clientIp";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
// Per-username cap on top of the per-IP one, so guessing one account's
// password (or TOTP code) from many IPs is still throttled. Kept loose
// enough that someone hammering a username can only delay, not
// permanently lock out, the real admin.
const USERNAME_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const USERNAME_RATE_LIMIT_MAX = 10;

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  totp_secret: string | null;
  totp_enabled: boolean;
  session_version: number;
};

export type LoginState = {
  error?: string;
  // Set once the password step succeeds for an account with MFA enabled,
  // so the form can render the TOTP-code step next without a redirect.
  pendingUsername?: string;
};

async function getClientIpFromHeaders(): Promise<string> {
  const headerList = await headers();
  return getClientIp(new Request("http://internal", { headers: headerList }));
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await getClientIpFromHeaders();
  if (await isRateLimited("admin-login", ip, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const totpCode = String(formData.get("totpCode") ?? "").trim();

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  if (
    await isRateLimited(
      "admin-login-user",
      username.toLowerCase(),
      USERNAME_RATE_LIMIT_WINDOW_MS,
      USERNAME_RATE_LIMIT_MAX,
    )
  ) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const pool = await getDb();
  const { rows } = await pool.query<AdminUserRow>(
    "SELECT id, username, password_hash, role, totp_secret, totp_enabled, session_version FROM admin_users WHERE username = $1",
    [username],
  );
  const admin = rows[0];

  // Always run a bcrypt compare, even against a dummy hash, so a
  // nonexistent username doesn't respond measurably faster than a wrong
  // password — avoids leaking which usernames exist via timing.
  const passwordOk = await verifyPassword(
    password,
    admin?.password_hash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidin",
  );

  if (!admin || !passwordOk) {
    await logAdminAction({ actorId: null, actorUsername: username, action: "login.failed", ip });
    return { error: "Invalid username or password." };
  }

  if (admin.totp_enabled) {
    if (!totpCode) {
      return { pendingUsername: admin.username };
    }
    const matchedEpoch = admin.totp_secret ? await matchTotpCode(admin.totp_secret, totpCode) : null;
    // Atomically claims this time step: a code that already signed someone
    // in (or one from an earlier step) is rejected even though it's still
    // inside its validity window.
    const claimed =
      matchedEpoch !== null &&
      (
        await pool.query(
          `UPDATE admin_users SET totp_last_used_epoch = $2
           WHERE id = $1 AND (totp_last_used_epoch IS NULL OR totp_last_used_epoch < $2)`,
          [admin.id, matchedEpoch],
        )
      ).rowCount === 1;
    if (!claimed) {
      await logAdminAction({
        actorId: admin.id,
        actorUsername: admin.username,
        action: "login.failed_mfa",
        ip,
      });
      return { error: "Invalid authentication code.", pendingUsername: admin.username };
    }
  }

  const session = await getAdminSession();
  session.userId = admin.id;
  session.username = admin.username;
  session.role = admin.role;
  session.sessionVersion = admin.session_version;
  await session.save();

  await logAdminAction({
    actorId: admin.id,
    actorUsername: admin.username,
    action: "login.success",
    ip,
  });

  redirect(MFA_REQUIRED && !admin.totp_enabled ? "/admin/settings/mfa" : "/admin/leads");
}
