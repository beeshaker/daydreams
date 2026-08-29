import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";

/** Fixed-length hash comparison avoids both a timing side-channel and timingSafeEqual's length-mismatch throw. */
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function isValidAdminAuth(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return false;

  return safeEqual(user, expectedUser) && safeEqual(pass, expectedPass);
}

/**
 * Defense in depth for Server Actions: proxy.ts's matcher covers page/route
 * requests, but Server Actions are POSTs to whatever route renders them, so
 * a matcher gap would silently skip auth for them too. Every admin Server
 * Action must call this itself rather than trusting proxy.ts alone.
 */
export async function assertAdminRequest(): Promise<void> {
  const headersList = await headers();
  if (!isValidAdminAuth(headersList.get("authorization"))) {
    throw new Error("Unauthorized");
  }
}
