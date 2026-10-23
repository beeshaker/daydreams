import Image from "next/image";
import Link from "next/link";

export function SiteHeader({
  brand,
  sections,
  bookingId,
  bookingLabel,
}: {
  brand: "daydreams" | "dumbbells";
  sections: { id: string; label: string }[];
  bookingId: string;
  bookingLabel: string;
}) {
  const isDaydreams = brand === "daydreams";
  const homeHref = isDaydreams ? "/daydreams/site" : "/dumbbells";
  const otherHref = isDaydreams ? "/dumbbells" : "/daydreams/site";
  const name = isDaydreams ? "Daydreams" : "Dumbbells";
  const otherName = isDaydreams ? "Dumbbells" : "Daydreams";

  return (
    <header className="sticky top-0 z-20 border-b border-brand-ink/10 bg-brand-bg/95 backdrop-blur zone-dark:border-white/10 zone-dark:bg-brand-ink/95">
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-4">
          <Link href={homeHref} className="flex shrink-0 items-center gap-2" aria-label={`${name} home`}>
            <Image
              src="/branding/logo.png"
              alt=""
              width={40}
              height={40}
              unoptimized
              className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
            />
            <span className={isDaydreams ? "font-baloo text-xl sm:text-3xl" : "font-bebas text-2xl uppercase tracking-wide sm:text-3xl"}>
              {name}
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href={otherHref}
              className="hidden text-sm text-brand-ink/70 hover:text-brand-ink sm:inline-flex zone-dark:text-white/70 zone-dark:hover:text-white"
            >
              Visit {otherName} <span aria-hidden="true" className="ml-1">↗</span>
            </Link>
            <a
              href={`#${bookingId}`}
              className="shrink-0 rounded-full bg-brand-pink-strong px-4 py-2.5 text-xs font-semibold text-white hover:brightness-95 sm:px-5 sm:text-sm"
            >
              {bookingLabel}
            </a>
          </div>
        </div>
        <nav aria-label={`${name} sections`} className="flex gap-5 overflow-x-auto pb-3 text-sm">
          {/* Back to the combined home page from anywhere on either brand's site. */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 border-r border-brand-ink/15 py-1 pr-5 font-semibold text-brand-ink hover:text-brand-ink/70 zone-dark:border-white/15 zone-dark:text-white zone-dark:hover:text-white/70"
          >
            <HomeIcon />
            Home
          </Link>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 py-1 text-brand-ink/70 hover:text-brand-ink zone-dark:text-white/70 zone-dark:hover:text-white"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1V9.5Z" strokeLinejoin="round" />
    </svg>
  );
}
