import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Baloo_2 } from "next/font/google";
import { VoiceAgentWidget } from "@/components/voice/VoiceAgentWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Dumbbells' dark/bold traditional-site zone (see globals.css's `zone-dark` variant). */
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

export const metadata: Metadata = {
  title: "Daydreams & Dumbbells",
  description: "A gym and a daycare, under one roof — pick your side.",
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
