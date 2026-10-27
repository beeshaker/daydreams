import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";

export async function POST() {
  const session = await getAdminSession();
  if (session.userId && session.username) {
    await logAdminAction({
      actorId: session.userId,
      actorUsername: session.username,
      action: "logout",
    });
  }
  session.destroy();
  // Relative Location, not new URL(..., request.url): behind Nginx,
  // request.url is the internal 127.0.0.1:3001 origin, so an absolute
  // redirect would send the browser to localhost. 303 so the browser
  // follows with a GET instead of re-POSTing to the login page.
  return new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
}
