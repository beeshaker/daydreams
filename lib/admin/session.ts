import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import type { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";

export type AdminSessionData = {
  userId?: string;
  username?: string;
  role?: string;
  sessionVersion?: number;
};

const sessionSecret = process.env.SESSION_SECRET;

export const sessionOptions: SessionOptions = {
  cookieName: "daydreams_admin_session",
  // Falls back to an obviously-invalid password so import-time evaluation
  // (e.g. during `next build`) doesn't throw before env vars are loaded;
  // any real session operation still requires a real SESSION_SECRET via
  // the guard in getAdminSession()/getAdminSessionFromRequest() below.
  password: sessionSecret ?? "insecure-placeholder-please-set-SESSION_SECRET-min-32-chars!!",
  ttl: 60 * 60 * 12, // 12 hours
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

function assertSessionSecretConfigured(): void {
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
}

/** For use in Server Components, Server Actions, and Route Handlers. */
export async function getAdminSession(): Promise<IronSession<AdminSessionData>> {
  assertSessionSecretConfigured();
  const cookieStore = await cookies();
  return getIronSession<AdminSessionData>(cookieStore, sessionOptions);
}

/** For use in proxy.ts, which receives a NextRequest/NextResponse pair rather than next/headers cookies(). */
export async function getAdminSessionFromRequest(
  request: NextRequest,
  response: NextResponse,
): Promise<IronSession<AdminSessionData>> {
  assertSessionSecretConfigured();
  return getIronSession<AdminSessionData>(request, response, sessionOptions);
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Authoritative session check: validates the cookie AND re-checks the
 * admin's current session_version in Postgres, so revoking a session
 * (password change, "log out everywhere", or de-provisioning an admin)
 * takes effect immediately even for cookies that haven't expired yet.
 * Used inside every admin Server Action as defense-in-depth, since
 * proxy.ts's matcher covers page/route requests but Server Actions are
 * POSTs to whatever route renders them — a matcher gap would silently skip
 * this check too if it only lived in proxy.ts.
 */
export async function requireAdminSession(requiredRole?: string): Promise<AdminSessionData> {
  const session = await getAdminSession();
  if (!session.userId || !session.username || session.sessionVersion === undefined) {
    throw new UnauthorizedError();
  }

  const pool = await getDb();
  const { rows } = await pool.query<{ role: string; session_version: number }>(
    "SELECT role, session_version FROM admin_users WHERE id = $1",
    [session.userId],
  );
  const admin = rows[0];
  if (!admin || admin.session_version !== session.sessionVersion) {
    throw new UnauthorizedError("Session has been revoked");
  }
  if (requiredRole && admin.role !== requiredRole) {
    throw new UnauthorizedError("Insufficient role");
  }

  return { userId: session.userId, username: session.username, role: admin.role, sessionVersion: admin.session_version };
}
