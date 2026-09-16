import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (session.userId && session.username) {
    await logAdminAction({
      actorId: session.userId,
      actorUsername: session.username,
      action: "logout",
    });
  }
  session.destroy();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
