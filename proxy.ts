import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin/session";

const API_STYLE_PATHS = ["/admin/leads/export"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getAdminSessionFromRequest(request, response);

  // Cheap cookie-presence/shape check only — the authoritative check
  // (re-verifying session_version in Postgres, so revocation takes effect
  // immediately) happens in requireAdminSession() inside every Server
  // Action and admin route, since Server Actions are POSTs that can bypass
  // this matcher. This proxy check exists to keep unauthenticated visitors
  // off admin pages without a DB round trip on every request.
  const isAuthenticated = Boolean(session.userId && session.username);

  if (!isAuthenticated) {
    if (API_STYLE_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
