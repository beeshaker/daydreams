import type { Metadata } from "next";

/** Keeps every admin page out of search results (robots.ts also disallows /admin). */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
