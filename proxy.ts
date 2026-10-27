import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin/session";
import { buildAdminCsp, generateNonce } from "@/lib/http/csp";

const API_STYLE_PATHS = ["/admin/leads/export"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next reads the nonce out of the request's CSP header while rendering
  // and stamps it on its own scripts (app/admin/layout.tsx forces dynamic
  // rendering so this works on every admin page).
  const csp = buildAdminCsp(generateNonce());
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  const withSecurityHeaders = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (pathname === "/admin/login") {
    return withSecurityHeaders(response);
  }

  const session = await getAdminSessionFromRequest(request, response);

  // Cheap cookie-presence/shape check only — the authoritative check
  // (re-verifying session_version in Postgres, so revocation takes effect
  // immediately) happens in requireAdminSession()/requireAdminPage()
  // inside every admin page, Server Action and route, since Server Actions
  // are POSTs that can bypass this matcher. This proxy check exists to keep
  // unauthenticated visitors off admin pages without a DB round trip on
  // every request.
  const isAuthenticated = Boolean(session.userId && session.username);

  if (!isAuthenticated) {
    if (API_STYLE_PATHS.some((path) => pathname.startsWith(path))) {
      return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    // Proxy responses need an absolute Location (a relative one throws
    // "Invalid URL"); nextUrl is built from the Host header Nginx forwards,
    // so this stays on the public domain.
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return withSecurityHeaders(response);
}

export const config = {
  matcher: ["/admin/:path*"],
};
