import type { SiteSettings } from "@/lib/daydreams/types";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.3-1.5 1.6-1.5h1.4V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8v3h2.3V21h3.2z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M16.5 3c.4 2 1.9 3.6 4 3.9v2.6c-1.5 0-3-.5-4.2-1.3v6.5c0 3-2.4 5.3-5.3 5.3S5.7 17.7 5.7 14.8c0-2.8 2.2-5.1 5-5.3v2.7c-1.3.2-2.3 1.3-2.3 2.6 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7V3h2.7z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { name: "Instagram", href: "#", icon: InstagramIcon },
  { name: "Facebook", href: "#", icon: FacebookIcon },
  { name: "TikTok", href: "#", icon: TikTokIcon },
];

function BrandColumn({ settings }: { settings: SiteSettings }) {
  return (
    <div>
      <h3 className="font-bold text-brand-ink">{settings.businessName}</h3>
      <p className="mt-1 text-sm text-brand-ink/70">{settings.tagline}</p>
      <p className="mt-3 text-sm text-brand-ink/60">{settings.address}</p>
      <p className="text-sm text-brand-ink/60">
        {settings.phone} · {settings.email}
      </p>
      <ul className="mt-3 space-y-0.5 text-xs text-brand-ink/50">
        {settings.hours.map((block) => (
          <li key={block.day}>
            {block.day}: {block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({
  daydreamsSettings,
  gymSettings,
}: {
  daydreamsSettings: SiteSettings;
  gymSettings: SiteSettings;
}) {
  return (
    <footer className="border-t border-brand-ink/10 bg-brand-bg">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <BrandColumn settings={daydreamsSettings} />
          <BrandColumn settings={gymSettings} />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-brand-ink/10 pt-6">
          <p className="text-xs text-brand-ink/50">
            © {new Date().getFullYear()} Daydreams &amp; Dumbbells. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                className="text-brand-ink/50 transition hover:text-brand-ink"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
