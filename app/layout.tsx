import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Baloo_2 } from "next/font/google";
import { VoiceAgentWidget } from "@/components/voice/VoiceAgentWidget";
import { LOCALITY, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Dumbbells' dark/bold traditional site (see globals.css's `zone-dark` variant). */
const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

/** Daydreams' warm traditional-site headlines. */
const baloo2 = Baloo_2({
  weight: "700",
  variable: "--font-baloo-2",
  subsets: ["latin"],
});

/**
 * Defaults for any page that doesn't set its own (each public page calls
 * pageMetadata() from lib/seo.ts). metadataBase lets those pages use
 * relative canonical and Open Graph image paths.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  ...pageMetadata({
    title: `${SITE_NAME} — Daycare & Gym in ${LOCALITY}`,
    description: `A daycare and a gym under one roof in ${LOCALITY}. Daydreams offers early learning for children 6 months to 5 years; Dumbbells offers spin, strength and fitness classes.`,
    path: "/",
  }),
  // A canonical here would be inherited by every page that doesn't set its
  // own, pointing them all at "/" — each page sets its own instead.
  alternates: undefined,
  // Set once the domain is verified in Google Search Console (HTML tag method).
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  }),
};

export const viewport: Viewport = {
  themeColor: "#f8f7f6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${baloo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <VoiceAgentWidget />
      </body>
    </html>
  );
}
