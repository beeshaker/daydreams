"use client";

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { trackEvent } from "@/lib/analytics";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Side = "daydreams" | "dumbbells";
type Slide = { src: string; alt: string };

const DAYDREAMS_SLIDES: Slide[] = [
  { src: "/home/hero-daydreams.webp", alt: "The soft-play room at Daydreams, with a ball pit, a purple play tent and bright foam floor tiles" },
  { src: "/home/hero-daydreams-2.webp", alt: "The Daydreams climbing room, with a climbing wall, cargo net and a children's table" },
  { src: "/home/hero-daydreams-3.webp", alt: "A rainbow slide and sensory boards in the Daydreams soft-play room" },
  { src: "/home/hero-daydreams-4.webp", alt: "A bright activity room at Daydreams with low tables, floor cushions and a climbing wall" },
];

const DUMBBELLS_SLIDES: Slide[] = [
  { src: "/home/hero-dumbbells.webp", alt: "The Dumbbells gym floor, with a dumbbell rack, benches and strength machines" },
  { src: "/home/hero-dumbbells-2.webp", alt: "Cable machines, a squat rack and treadmills at Dumbbells gym" },
  { src: "/dumbbells-premium/assets/class-sunrise.webp", alt: "A spin bike in the Dumbbells spin room" },
];

const INTERVAL_MS = 6000;

// Headline colour over each half. Light tints of the brand pink and lavender,
// checked for contrast over every slide once the scrims below are applied.
const DAYDREAMS_INK = "#ff8fab";
const DUMBBELLS_INK = "#d4bff2";
// Lets the CSS entrance (see .hero-* in globals.css) finish before the first slide change.
const START_DELAY_MS = 1000;

const HEADLINE = [
  ["A", "gym", "and", "a", "daycare,"],
  ["under", "one", "roof."],
];

/**
 * Advances through `count` slides every INTERVAL_MS. Progress is written to a
 * `--progress` custom property on `rootRef` each frame (not React state), so
 * the story-style bars fill smoothly without re-rendering. `offsetMs` staggers
 * the two halves. Hover deliberately does not pause: a resting cursor would
 * otherwise freeze the half it lands on. Only the pause button and keyboard
 * focus do. rAF stops in background tabs, so hidden tabs pause for free.
 */
function useSlideshow(count: number, offsetMs: number, paused: boolean) {
  const rootRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const elapsed = useRef(-(START_DELAY_MS + offsetMs));
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (count < 2) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Clamp so returning to a backgrounded tab doesn't skip a slide.
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current) {
        elapsed.current += dt;
        if (elapsed.current >= INTERVAL_MS) {
          elapsed.current = 0;
          setIndex((i) => (i + 1) % count);
        }
      }
      rootRef.current?.style.setProperty("--progress", String(Math.max(0, elapsed.current) / INTERVAL_MS));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  const go = (i: number) => {
    elapsed.current = 0;
    setIndex(i);
  };

  return { rootRef, index, go };
}

/**
 * The full-screen front door: two photo slideshows side by side with the
 * combined headline across the seam. Hovering a half widens it (lg+). Each
 * half's main link is stretched over the whole half with an ::after overlay,
 * so the entire photo is clickable while the markup stays a plain heading +
 * text + link that crawlers read. On scroll the photos push in and fade (GSAP).
 */
export function SplitHero({ locality }: { locality: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Side | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const scrub = { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-media]", { scale: 1.12, opacity: 0.35, ease: "none", scrollTrigger: scrub });
        gsap.to("[data-hero-title]", { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: scrub });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const cols = active === "daydreams" ? "1.25fr 0.75fr" : active === "dumbbells" ? "0.75fr 1.25fr" : "1fr 1fr";
  const seam = active === "daydreams" ? "62.5%" : active === "dumbbells" ? "37.5%" : "50%";

  return (
    <section
      ref={rootRef}
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-brand-ink text-white"
    >
      <div
        className="grid transition-[grid-template-columns] duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)] md:h-[85svh] md:min-h-[600px] md:grid-cols-2 lg:grid-cols-[var(--hero-cols)]"
        style={{ "--hero-cols": cols } as CSSProperties}
        onMouseLeave={() => setActive(null)}
      >
        <HeroHalf
          side="daydreams"
          slides={DAYDREAMS_SLIDES}
          offsetMs={0}
          onActivate={setActive}
          className="hero-wipe-left h-[85svh] min-h-[640px]"
          heading={<h2 id="hero-daydreams" className="font-baloo text-5xl leading-none sm:text-6xl">Daydreams</h2>}
          text="Daycare and early learning for children from 6 months to 5 years."
          cta={
            <Link
              href="/daydreams/site"
              onClick={() => trackEvent("landing_daydreams_selected")}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-brand-ink transition-transform after:absolute after:inset-0 after:content-[''] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore Daydreams <span aria-hidden="true">→</span>
            </Link>
          }
          extra={
            // Sits above the stretched link's overlay so it stays clickable.
            <Link
              href="/daydreams"
              onClick={() => trackEvent("landing_game_selected")}
              className={secondaryLink}
            >
              Or explore Daydreams as a game <span aria-hidden="true">↗</span>
            </Link>
          }
        />
        <HeroHalf
          side="dumbbells"
          slides={DUMBBELLS_SLIDES}
          offsetMs={INTERVAL_MS / 2}
          onActivate={setActive}
          className="hero-wipe-right h-[75svh] min-h-[520px]"
          heading={<h2 id="hero-dumbbells" className="font-baloo text-5xl leading-none sm:text-6xl">Dumbbells</h2>}
          text="A gym, a spin room and coached classes for every level."
          cta={
            <Link
              href="/dumbbells"
              onClick={() => trackEvent("landing_dumbbells_selected")}
              className="inline-flex items-center gap-2 rounded-full bg-brand-pink-strong px-5 py-2.5 font-bold text-white transition-transform after:absolute after:inset-0 after:content-[''] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore Dumbbells <span aria-hidden="true">→</span>
            </Link>
          }
          extra={
            <Link href="/dumbbells#join" className={secondaryLink}>
              Or book a gym session <span aria-hidden="true">→</span>
            </Link>
          }
        />
      </div>

      {/* Darkens the top of both photos so the shared headline reads over any slide. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[75svh] bg-[radial-gradient(120%_70%_at_50%_0%,rgba(10,10,10,0.78),rgba(10,10,10,0.35)_55%,transparent)] md:h-[70%]"
      />

      <div data-hero-title className="pointer-events-none absolute inset-x-0 top-0 z-30 pt-28 text-center md:pt-[max(6.5rem,12vh)]">
        {/*
          The headline is set twice, stacked, each copy clipped to one half and
          tinted for it. The clip edge follows the seam (--seam), and its
          transition matches the grid's, so the colour change stays on the
          photo edge while a hovered half widens. Phones stack the halves, so
          there the headline sits wholly over Daydreams.
        */}
        <div className="relative" style={{ "--seam": seam } as CSSProperties}>
          <div className={`${seamClip} [clip-path:inset(0)] md:[clip-path:inset(0_50%_0_0)] lg:[clip-path:inset(0_calc(100%-var(--seam))_0_0)]`} style={{ color: DAYDREAMS_INK }}>
            <h1 id="home-hero-title" className={headlineClass}>
              <HeadlineWords />
            </h1>
          </div>
          <div
            aria-hidden="true"
            className={`${seamClip} absolute inset-0 hidden md:block md:[clip-path:inset(0_0_0_50%)] lg:[clip-path:inset(0_0_0_var(--seam))]`}
            style={{ color: DUMBBELLS_INK }}
          >
            <p className={headlineClass}>
              <HeadlineWords />
            </p>
          </div>
        </div>
        <p className="hero-fade-up mx-auto mt-5 px-6 max-w-2xl text-balance text-lg text-white/90 sm:text-xl" style={{ animationDelay: "400ms" }}>
          Work out, recover or grab a coffee in <span className="whitespace-nowrap">{locality}</span> while your little one plays and learns next door.
        </p>
      </div>
    </section>
  );
}

const secondaryLink =
  "relative z-30 block w-fit font-semibold text-white/85 underline underline-offset-4 hover:text-white";

// Same duration and curve as the grid's column transition, so the colour edge tracks the seam.
const seamClip = "transition-[clip-path] duration-700 ease-[cubic-bezier(0.2,0.7,0.1,1)]";

const headlineClass =
  "font-baloo mx-auto max-w-6xl text-balance px-6 text-[clamp(2.25rem,6.2vw,6.25rem)] leading-[0.95] tracking-tight";

/** Lines break as authored from sm up; on phones the words flow so the headline stays at two lines. */
function HeadlineWords() {
  return HEADLINE.map((line, l) => (
    <span key={l} className="sm:block">
      {line.map((word, w) => (
        <span key={w}>
          <span className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom">
            <span className="hero-rise inline-block" style={{ animationDelay: `${80 + (l * 5 + w) * 35}ms` }}>
              {word}
            </span>
          </span>{" "}
        </span>
      ))}
    </span>
  ));
}

function HeroHalf({
  side,
  slides,
  offsetMs,
  onActivate,
  className,
  heading,
  text,
  cta,
  extra,
}: {
  side: Side;
  slides: Slide[];
  offsetMs: number;
  onActivate: (side: Side | null) => void;
  /** Entrance wipe plus the half's own mobile height. */
  className: string;
  heading: ReactNode;
  text: string;
  cta: ReactNode;
  extra?: ReactNode;
}) {
  const [userPaused, setUserPaused] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const { rootRef, index, go } = useSlideshow(slides.length, offsetMs, userPaused || keyboardFocus);
  // The Ken Burns push only starts after hydration, so the first slide eases in too.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (e.target.matches(":focus-visible")) setKeyboardFocus(true);
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false);
  };

  return (
    <section
      ref={rootRef}
      aria-labelledby={`hero-${side}`}
      aria-roledescription="carousel"
      className={`group relative overflow-hidden bg-brand-ink md:h-auto md:min-h-0 ${className}`}
      onMouseEnter={() => onActivate(side)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div data-hero-media className="absolute inset-0">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            aria-hidden={i !== index}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 65vw, (min-width: 768px) 50vw, 100vw"
            className={`object-cover ${
              i === index
                ? `opacity-100 [transition:opacity_1.2s_ease,transform_7s_linear] ${mounted ? "motion-safe:scale-[1.08]" : ""}`
                : "opacity-0 [transition:opacity_1.2s_ease,transform_0s_linear_1.2s]"
            }`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/95 via-brand-ink/40 to-transparent" />
      {/* The Daydreams rooms are bright lime and pastel; darken their top so the pink headline holds. */}
      {side === "daydreams" && <div className="absolute inset-x-0 top-0 h-3/4 bg-gradient-to-b from-black/55 via-black/30 to-transparent" />}

      {/* Phones: bottom padding keeps the controls clear of the fixed "Talk to us" button, which the shorter desktop hero ends above. */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-stretch justify-end p-6 pb-20 text-white sm:p-10 sm:pb-24 md:pb-10 ${
          side === "daydreams" ? "md:pl-[max(2.5rem,calc((100vw-72rem)/2+1.5rem))]" : "md:pr-[max(2.5rem,calc((100vw-72rem)/2+1.5rem))]"
        }`}
      >
        <div className="hero-fade-up" style={{ animationDelay: "500ms" }}>
          {heading}
          {/* Reserved height keeps both halves' rows level when one text wraps further. */}
          <p className="mt-3 max-w-sm text-pretty text-lg text-white/90 md:min-h-[3lh] lg:min-h-[2lh]">{text}</p>
          <div className="mt-5">{cta}</div>
          {extra && <div className="mt-4">{extra}</div>}
        </div>

        {/* Above the stretched link's overlay, so the controls stay clickable. */}
        <div className="hero-fade-up relative z-30 mt-8 flex w-full max-w-md items-center gap-2" style={{ animationDelay: "600ms" }}>
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              className="relative h-6 flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/30">
                <span
                  className="absolute inset-0 origin-left rounded-full bg-white"
                  style={{ transform: i < index ? "scaleX(1)" : i === index ? "scaleX(var(--progress, 0))" : "scaleX(0)" }}
                />
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
            className="ml-2 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white/85 hover:bg-white/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
              {userPaused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />}
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
