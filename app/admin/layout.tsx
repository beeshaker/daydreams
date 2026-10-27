import type { Metadata } from "next";
import { connection } from "next/server";

/** Keeps every admin page out of search results (robots.ts also disallows /admin). */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Every admin page renders per request: proxy.ts issues a fresh CSP
  // nonce each time, which a prerendered page couldn't carry.
  await connection();
  return children;
}
