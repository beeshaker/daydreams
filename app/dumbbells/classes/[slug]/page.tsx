import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGymClasses, getGymSchedule, getGymSiteSettings } from "@/lib/daydreams/content";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS_IDS, LOCALITY, OG_IMAGES, offeringJsonLd, pageMetadata } from "@/lib/seo";
import type { Program, ScheduleDay } from "@/lib/daydreams/types";

/**
 * One page per Dumbbells class, so each can rank for its own search
 * ("spin class Nairobi", "prenatal pilates Nairobi"). Uses the shared
 * site components in their `zone-dark` treatment rather than the
 * scrollcraft build, which is a single bespoke page (see ../../page.tsx).
 * Booking happens on the main page's form (/dumbbells#join).
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const classes = await getGymClasses();
  return classes.map((gymClass) => ({ slug: gymClass.id }));
}

async function getClass(slug: string) {
  const classes = await getGymClasses();
  return classes.find((gymClass) => gymClass.id === slug);
}

/** The weekly timetable narrowed to this class's sessions, dropping days it doesn't run. */
function sessionsFor(gymClass: Program, schedule: ScheduleDay[]): ScheduleDay[] {
  const names = gymClass.scheduleActivities ?? [];
  return schedule
    .map((day) => ({
      ...day,
      sessions: day.sessions.filter((session) => names.some((name) => session.activity.startsWith(name))),
    }))
    .filter((day) => day.sessions.length > 0);
}

export async function generateMetadata({ params }: PageProps<"/dumbbells/classes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const gymClass = await getClass(slug);
  if (!gymClass) return {};
  return pageMetadata({
    title: `${gymClass.title} Classes in ${LOCALITY} | Dumbbells`,
    description: gymClass.seoDescription ?? gymClass.description,
    path: `/dumbbells/classes/${gymClass.id}`,
    image: OG_IMAGES.dumbbells,
  });
}

const sections = [
  { id: "about", label: "About" },
  { id: "timetable", label: "Timetable" },
  { id: "book", label: "Book" },
];

export default async function GymClassPage({ params }: PageProps<"/dumbbells/classes/[slug]">) {
  const { slug } = await params;
  const [gymClass, classes, schedule, settings] = await Promise.all([
    getClass(slug),
    getGymClasses(),
    getGymSchedule(),
    getGymSiteSettings(),
  ]);
  if (!gymClass) notFound();

  const path = `/dumbbells/classes/${gymClass.id}`;
  const timetable = sessionsFor(gymClass, schedule);
  const otherClasses = classes.filter((other) => other.id !== gymClass.id);
  const paragraphs = (gymClass.longDescription ?? gymClass.description).split(/\n\s*\n/);

  return (
    <div className="zone-dark min-h-screen bg-brand-ink text-white">
      <JsonLd
        data={offeringJsonLd({
          offering: gymClass,
          path,
          providerId: BUSINESS_IDS.dumbbells,
          breadcrumbs: [
            { name: "Dumbbells", path: "/dumbbells" },
            { name: "Classes", path: "/dumbbells#range" },
            { name: gymClass.title, path },
          ],
        })}
      />
      <SiteHeader brand="dumbbells" sections={sections} bookingId="book" bookingLabel="Book a Session" />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="text-sm text-white/70">
          <ol className="flex flex-wrap gap-2">
            <li><Link href="/dumbbells" className="hover:underline">Dumbbells</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/dumbbells#range" className="hover:underline">Classes</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-white">{gymClass.title}</li>
          </ol>
        </nav>

        <section id="about" className="mt-8 grid scroll-mt-40 gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-pink">
              {gymClass.ageRange} · {LOCALITY}
            </p>
            <h1 className="font-bebas mt-3 text-6xl uppercase leading-none tracking-wide sm:text-7xl">{gymClass.title}</h1>
            <p className="mt-4 text-lg text-white/80">{gymClass.shortDescription}</p>
            <Link
              href="/dumbbells#join"
              className="mt-6 inline-block rounded-full bg-brand-pink-strong px-6 py-3 font-bold text-white hover:brightness-110"
            >
              Book a Session
            </Link>
          </div>
          {gymClass.src && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
              <Image
                src={gymClass.src}
                alt={`${gymClass.title} at Dumbbells gym`}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </section>

        <div className="mt-14 grid gap-10 md:grid-cols-[3fr_2fr]">
          <div className="space-y-4 text-white/80">
            <h2 className="font-bebas text-3xl uppercase tracking-wide text-white">About {gymClass.title}</h2>
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed">{paragraph}</p>
            ))}
          </div>
          {gymClass.highlights && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6" style={{ borderTopWidth: 4, borderTopColor: gymClass.accentColor }}>
              <h2 className="font-bebas text-2xl uppercase tracking-wide">What to expect</h2>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {gymClass.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span aria-hidden="true" className="text-brand-pink-strong">●</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {timetable.length > 0 && (
          <section id="timetable" className="mt-16 scroll-mt-40">
            <h2 className="font-bebas text-3xl uppercase tracking-wide">When it runs</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {timetable.map((day) => (
                <li key={day.day} className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                  <h3 className="font-bold">{day.day}</h3>
                  <ul className="mt-2 space-y-1 text-sm text-white/70">
                    {day.sessions.map((session) => (
                      <li key={session.id}>
                        <span className="font-semibold text-brand-pink">{session.time}</span> · {session.activity}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-white/50">
              The timetable can change week to week — get in touch to confirm before your first class.
            </p>
          </section>
        )}

        <section id="book" className="mt-16 scroll-mt-40 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
          <h2 className="font-bebas text-4xl uppercase tracking-wide">Your journey starts now.</h2>
          <p className="mt-3 max-w-xl text-white/75">
            Come in for a {gymClass.title.toLowerCase()} session and meet your coach. And if you have little ones,{" "}
            <Link href="/daydreams/site" className="font-semibold text-brand-lavender underline underline-offset-4">Daydreams</Link>{" "}
            is right next door.
          </p>
          <Link
            href="/dumbbells#join"
            className="mt-6 inline-block rounded-full bg-brand-pink-strong px-6 py-3 font-bold text-white hover:brightness-110"
          >
            Book a Session
          </Link>
        </section>

        {otherClasses.length > 0 && (
          <section className="mt-16" aria-labelledby="other-classes">
            <h2 id="other-classes" className="font-bebas text-3xl uppercase tracking-wide">More classes</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherClasses.map((other) => (
                <li key={other.id}>
                  <Link
                    href={`/dumbbells/classes/${other.id}`}
                    className="block h-full rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                    style={{ borderTopWidth: 4, borderTopColor: other.accentColor }}
                  >
                    <span className="text-lg font-bold">{other.title}</span>
                    <span className="mt-2 block text-sm text-white/70">{other.shortDescription}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter
        settings={settings}
        otherBrand={{ name: "Daydreams", href: "/daydreams/site" }}
        links={[{
          heading: "Classes",
          items: classes.map((c) => ({ label: c.title, href: `/dumbbells/classes/${c.id}` })),
        }]}
      />
    </div>
  );
}
