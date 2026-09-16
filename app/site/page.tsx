import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LegacySiteRedirect } from "@/components/site/LegacySiteRedirect";

export const metadata: Metadata = {
  title: "Choose Your Website — Daydreams & Dumbbells",
  description: "Visit Daydreams for daycare and early learning, or Dumbbells for gym classes and strength training.",
};

export default function SitePage() {
  return (
    <main className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink sm:py-16">
      <LegacySiteRedirect />
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-3 text-sm font-bold">
          <Image src="/branding/logo.png" alt="" width={48} height={48} unoptimized className="rounded-full" />
          Daydreams &amp; Dumbbells
        </Link>
        <div className="mb-10 mt-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink/70">Two spaces. One community.</p>
          <h1 className="font-baloo mt-3 text-4xl sm:text-5xl">Where would you like to go?</h1>
          <p className="mt-4 text-brand-ink/70">A little room to grow. A little time to get stronger. Choose your website to take a look around.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/daydreams/site" className="group overflow-hidden rounded-3xl border border-brand-lavender/40 bg-brand-lavender/15 transition hover:shadow-lg">
            <div className="relative h-56 overflow-hidden">
              <Image src="/gallery/program-explorers.webp" alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105" />
            </div>
            <div className="p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-lavender-strong">Daycare &amp; early learning</p>
              <h2 className="font-baloo mt-2 text-4xl">Daydreams</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">Meet our teachers, explore our programs, and find a place for your little one to thrive.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-lavender-strong">Visit Daydreams <span aria-hidden="true">→</span></span>
            </div>
          </Link>
          <Link href="/dumbbells" className="group overflow-hidden rounded-3xl border border-brand-ink bg-brand-ink text-white transition hover:shadow-lg">
            <div className="relative h-56 overflow-hidden">
              <Image src="/gallery/dumbbells-strength.webp" alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105" />
            </div>
            <div className="p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-pink">Strength &amp; fitness</p>
              <h2 className="font-bebas mt-2 text-4xl uppercase tracking-wide">Dumbbells</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">Find your next class, meet our trainers, and make time for a stronger you.</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-pink">Visit Dumbbells <span aria-hidden="true">→</span></span>
            </div>
          </Link>
        </div>
        <p className="mb-16 mt-8 text-sm text-brand-ink/70">
          Feeling playful? <Link href="/daydreams" className="font-semibold text-brand-lavender-strong underline underline-offset-4">Explore the Daydreams game.</Link>
        </p>
      </div>
    </main>
  );
}
