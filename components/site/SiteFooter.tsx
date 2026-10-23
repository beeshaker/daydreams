import Link from "next/link";
import type { SiteSettings } from "@/lib/daydreams/types";

export function SiteFooter({
  settings,
  otherBrand,
  links,
}: {
  settings: SiteSettings;
  /** Cross-link to the other brand's site; the home page leaves it out. */
  otherBrand?: { name: string; href: string };
  /** Extra footer columns of internal links, e.g. one per program page. */
  links?: { heading: string; items: { label: string; href: string }[] }[];
}) {
  const columns = 2 + (links?.length ?? 0);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.businessName}, ${settings.address}, Kenya`)}`;

  return (
    <footer className="bg-brand-bg zone-dark:border-t zone-dark:border-white/10 zone-dark:bg-brand-ink">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className={`grid gap-8 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : columns >= 4 ? "lg:grid-cols-4" : ""}`}>
          <div>
            <h2 className="text-xl font-bold text-brand-ink zone-dark:text-white">{settings.businessName}</h2>
            <p className="mt-2 text-sm text-brand-ink/70 zone-dark:text-white/70">{settings.tagline}</p>
            <address className="mt-4 space-y-1 text-sm not-italic text-brand-ink/70 zone-dark:text-white/70">
              <p>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {settings.address}, Kenya
                </a>
              </p>
              {settings.phones.map((phone) => (
                <p key={phone}><a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:underline">{phone}</a></p>
              ))}
              <p><a href={`mailto:${settings.email}`} className="break-words hover:underline">{settings.email}</a></p>
              {settings.instagramUrl && (
                <p>
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Instagram
                  </a>
                </p>
              )}
            </address>
          </div>
          <div>
            <h2 className="font-bold text-brand-ink zone-dark:text-white">Opening hours</h2>
            <ul className="mt-3 space-y-2 text-sm text-brand-ink/70 zone-dark:text-white/70">
              {settings.hours.map((block) => (
                <li key={block.day}>
                  {block.day}: {block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}
                </li>
              ))}
            </ul>
          </div>
          {links?.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="font-bold text-brand-ink zone-dark:text-white">{group.heading}</h2>
              <ul className="mt-3 space-y-2 text-sm text-brand-ink/70 zone-dark:text-white/70">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:underline">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 pb-14 zone-dark:border-t zone-dark:border-white/10 zone-dark:pt-6">
          <p className="text-sm text-brand-ink/70 zone-dark:text-white/70">
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </p>
          {otherBrand && (
            <nav aria-label="Our websites" className="flex flex-wrap gap-5 text-sm">
              <Link href="/" className="text-brand-ink/70 hover:underline zone-dark:text-white/70">Back to the entrance</Link>
              <Link href={otherBrand.href} className="font-semibold text-brand-lavender-strong hover:underline zone-dark:text-brand-lavender">
                Visit {otherBrand.name} <span aria-hidden="true">↗</span>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
