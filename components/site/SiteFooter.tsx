import Link from "next/link";
import type { SiteSettings } from "@/lib/daydreams/types";

export function SiteFooter({
  settings,
  otherBrand,
}: {
  settings: SiteSettings;
  otherBrand: { name: string; href: string };
}) {
  return (
    <footer className="border-t border-brand-ink/10 bg-brand-bg zone-dark:border-white/10 zone-dark:bg-brand-ink">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-brand-ink zone-dark:text-white">{settings.businessName}</h2>
            <p className="mt-2 text-sm text-brand-ink/70 zone-dark:text-white/70">{settings.tagline}</p>
            <address className="mt-4 space-y-1 text-sm not-italic text-brand-ink/70 zone-dark:text-white/70">
              <p>{settings.address}</p>
              <p><a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="hover:underline">{settings.phone}</a></p>
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
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-brand-ink/10 pb-14 pt-6 zone-dark:border-white/10">
          <p className="text-xs text-brand-ink/70 zone-dark:text-white/70">
            © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
          </p>
          <nav aria-label="Our websites" className="flex flex-wrap gap-5 text-sm">
            <Link href="/" className="text-brand-ink/70 hover:underline zone-dark:text-white/70">Back to the entrance</Link>
            <Link href={otherBrand.href} className="font-semibold text-brand-lavender-strong hover:underline zone-dark:text-brand-lavender">
              Visit {otherBrand.name} <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
