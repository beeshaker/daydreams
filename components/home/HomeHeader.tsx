"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Absolute "/#…" anchors so the same header works on /cafe as well as the home page.
const NAV = [
  { href: "/", label: "Home" },
  { href: "/daydreams/site", label: "Daycare" },
  { href: "/dumbbells", label: "Gym" },
  { href: "/cafe", label: "Café & recovery" },
  { href: "/#events", label: "Events" },
  { href: "/#faqs", label: "FAQs" },
];

/** True once the page has scrolled past `fraction` of the viewport height. */
function useScrolledPast(fraction: number, enabled: boolean) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const sync = () => setPast(window.scrollY > window.innerHeight * fraction);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [fraction, enabled]);
  return past;
}

/**
 * Header for the combined pages (home, café). The default is a sticky solid
 * bar. `overlay` (home page) starts as a transparent bar over the
 * full-screen hero and fills with the page colour once the hero has mostly
 * scrolled away. The mobile menu is
 * a plain <details>.
 */
export function HomeHeader({ overlay = false }: { overlay?: boolean }) {
  const scrolled = useScrolledPast(0.8, overlay);
  const onDark = overlay && !scrolled;

  const shell = overlay
    ? `fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${onDark ? "bg-transparent text-white" : "bg-brand-bg text-brand-ink shadow-sm"}`
    : "sticky top-0 z-40 border-b border-brand-ink/10 bg-brand-bg/95 backdrop-blur";
  const bar = overlay
    ? "mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3"
    : "mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6";

  return (
    <header className={shell}>
      <div className={bar}>
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold" aria-label="Daydreams & Dumbbells home">
          <Image src="/branding/logo.png" alt="" width={44} height={44} unoptimized className="h-10 w-10 rounded-full bg-white" />
          <span className="text-sm sm:text-base">Daydreams &amp; Dumbbells</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="opacity-75 transition-opacity hover:opacity-100">
              {item.label}
            </Link>
          ))}
          <Link href="/#contact" className="rounded-full bg-brand-pink-strong px-5 py-2.5 font-semibold text-white hover:brightness-95">
            Get in touch
          </Link>
        </nav>

        <details className="group relative lg:hidden">
          <summary
            className={`flex cursor-pointer list-none items-center gap-2 rounded-full px-4 py-2 font-semibold marker:content-none ${
              onDark ? "bg-white/15" : "bg-brand-ink/5"
            }`}
          >
            Menu
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <nav aria-label="Main" className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 text-brand-ink shadow-lg">
            {[...NAV, { href: "/#contact", label: "Get in touch" }].map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-2.5 hover:bg-brand-bg">
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
