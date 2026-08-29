import type { NextRequest } from "next/server";
import { isValidAdminAuth } from "@/lib/admin/auth";

export function proxy(request: NextRequest) {
  if (!isValidAdminAuth(request.headers.get("authorization"))) {
    return new Response(null, {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
