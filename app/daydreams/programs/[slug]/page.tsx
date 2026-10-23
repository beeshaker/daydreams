import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrograms, getSchedule, getSiteSettings } from "@/lib/daydreams/content";
import { BookAVisitForm } from "@/components/daydreams/BookAVisitForm";
import { ScheduleSection } from "@/components/daydreams/sections/ScheduleSection";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS_IDS, LOCALITY, OG_IMAGES, offeringJsonLd, pageMetadata } from "@/lib/seo";

/**
 * One page per Daydreams program, so each can rank for its own age group
 * ("infant daycare", "toddler daycare", "pre-K") — the main site only has
 * room for a card each. Copy lives on the Program fixture.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((program) => ({ slug: program.id }));
}

async function getProgram(slug: string) {
  const programs = await getPrograms();
  return programs.find((program) => program.id === slug);
}

export async function generateMetadata({ params }: PageProps<"/daydreams/programs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return {};
  return pageMetadata({
    title: `${program.title} (${program.ageRange}) — Daycare in ${LOCALITY} | Daydreams`,
    description: program.seoDescription ?? program.description,
    path: `/daydreams/programs/${program.id}`,
    // Not the program photo — some are portrait, which crops badly in link previews.
    image: OG_IMAGES.daydreams,
  });
}

const sections = [
  { id: "about", label: "About" },
  { id: "week", label: "Our Week" },
  { id: "visit", label: "Book a Visit" },
];

export default async function ProgramPage({ params }: PageProps<"/daydreams/programs/[slug]">) {
  const { slug } = await params;
  const [program, programs, schedule, siteSettings] = await Promise.all([
    getProgram(slug),
    getPrograms(),
    getSchedule(),
    getSiteSettings(),
  ]);
  if (!program) notFound();

  const path = `/daydreams/programs/${program.id}`;
  const otherPrograms = programs.filter((other) => other.id !== program.id);
  const paragraphs = (program.longDescription ?? program.description).split(/\n\s*\n/);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      <JsonLd
        data={offeringJsonLd({
          offering: program,
          path,
          providerId: BUSINESS_IDS.daydreams,
          breadcrumbs: [
            { name: "Daydreams", path: "/daydreams/site" },
            { name: "Programs", path: "/daydreams/site#programs" },
            { name: program.title, path },
          ],
        })}
      />
      <SiteHeader brand="daydreams" sections={sections} bookingId="visit" bookingLabel="Book a Visit" />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-brand-ink/70">
          <ol className="flex flex-wrap gap-2">
            <li><Link href="/daydreams/site" className="hover:underline">Daydreams</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/daydreams/site#programs" className="hover:underline">Programs</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-brand-ink">{program.title}</li>
          </ol>
        </nav>

        <section id="about" className="mt-8 grid scroll-mt-40 gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: program.accentColor }}>
              {program.ageRange} · Daycare in {LOCALITY}
            </p>
            <h1 className="font-baloo mt-3 text-5xl leading-[1.05] sm:text-6xl">{program.title}</h1>
            <p className="mt-4 text-lg text-brand-ink/80">{program.shortDescription}</p>
            <a
              href="#visit"
              className="mt-6 inline-block rounded-full bg-brand-pink-strong px-6 py-3 font-bold text-white hover:brightness-95"
            >
              Book a Visit
            </a>
          </div>
          {program.src && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-brand-ink/10">
              <Image
                src={program.src}
                alt={`The ${program.title} room at Daydreams`}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </section>

        <div className="mt-14 grid gap-10 md:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-brand-ink/80">
            <h2 className="font-baloo text-2xl text-brand-ink">About {program.title}</h2>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed">{paragraph}</p>
            ))}
          </div>
          {program.highlights && (
            <div className="rounded-2xl border border-brand-ink/10 bg-white p-6" style={{ borderTopWidth: 4, borderTopColor: program.accentColor }}>
              <h2 className="font-baloo text-xl">What a day includes</h2>
              <ul className="mt-4 space-y-2 text-sm text-brand-ink/80">
                {program.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span aria-hidden="true" style={{ color: program.accentColor }}>●</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <section id="week" className="mt-16 scroll-mt-40">
          <h2 className="font-baloo text-2xl">Our week</h2>
          <p className="mt-2 text-sm text-brand-ink/70">The activities running across Daydreams this week.</p>
          <div className="mt-5">
            <ScheduleSection schedule={schedule} />
          </div>
        </section>

        <section id="visit" className="mt-16 scroll-mt-40">
          <h2 className="font-baloo text-2xl">Book a visit</h2>
          <p className="mt-2 text-sm text-brand-ink/70">
            Come and see the {program.title} room. Tell us a bit about your family and we&apos;ll follow up to schedule a tour.
          </p>
          <div className="relative mt-5 max-w-xl">
            <BookAVisitForm source="traditional-site" turnstileSiteKey={process.env.TURNSTILE_SITE_KEY ?? ""} />
          </div>
        </section>

        {otherPrograms.length > 0 && (
          <section className="mt-16" aria-labelledby="other-programs">
            <h2 id="other-programs" className="font-baloo text-2xl">Other programs</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {otherPrograms.map((other) => (
                <li key={other.id}>
                  <Link
                    href={`/daydreams/programs/${other.id}`}
                    className="block rounded-xl border border-brand-ink/10 bg-white p-5 transition hover:shadow-md"
                    style={{ borderTopWidth: 4, borderTopColor: other.accentColor }}
                  >
                    <span className="text-lg font-bold">{other.title}</span>
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-brand-ink/60">{other.ageRange}</span>
                    <span className="mt-2 block text-sm text-brand-ink/80">{other.shortDescription}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter
        settings={siteSettings}
        otherBrand={{ name: "Dumbbells", href: "/dumbbells" }}
        links={[{
          heading: "Programs",
          items: programs.map((p) => ({ label: `${p.title} (${p.ageRange})`, href: `/daydreams/programs/${p.id}` })),
        }]}
      />
    </div>
  );
}
