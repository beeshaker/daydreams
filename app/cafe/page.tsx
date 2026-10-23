import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHeader } from "@/components/home/HomeHeader";
import { VisitUs } from "@/components/home/HomeSections";
import { SiteFooter } from "@/components/site/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettings, getTrainers } from "@/lib/daydreams/content";
import { AREA, LOCALITY, SITE_NAME, absoluteUrl, pageMetadata, venueJsonLd } from "@/lib/seo";

/**
 * The coffee shop and recovery room — the two shared spaces that aren't
 * part of either brand's own site. Copy comes from the client's profile and
 * from Sarah's and Loise's bios (content/fixtures/trainers.ts).
 */

const DESCRIPTION = `The coffee shop and recovery room at ${SITE_NAME} in ${LOCALITY}: great coffee, massage, prenatal and postnatal treatments and facials — while your little one plays next door.`;

export const metadata: Metadata = pageMetadata({
  title: `Coffee Shop & Massage in ${LOCALITY} | ${SITE_NAME}`,
  description: DESCRIPTION,
  path: "/cafe",
  image: { url: "/home/cafe-wide.webp", alt: "The coffee shop terrace at night, lit with string lights", width: 1600, height: 900 },
});

/** First `count` paragraphs of a bio, skipping bullet lists and sign-offs. */
function bioParagraphs(bio: string, count: number) {
  return bio
    .split(/\n\s*\n/)
    .filter((paragraph) => !paragraph.includes("•"))
    .slice(0, count);
}

/** The "• item" lines from a bio (Loise lists her treatments this way). */
function bioBullets(bio: string) {
  return bio
    .split("\n")
    .filter((line) => line.trim().startsWith("•"))
    .map((line) => line.replace("•", "").trim());
}

export default async function CafePage() {
  const [baseSettings, trainers] = await Promise.all([getSiteSettings(), getTrainers()]);
  const settings = { ...baseSettings, businessName: SITE_NAME, tagline: "Strong parents. Happy kids. Brighter days." };
  const sarah = trainers.find((t) => t.id === "sarah");
  const loise = trainers.find((t) => t.id === "loise");
  const treatments = loise ? bioBullets(loise.bio) : [];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      <JsonLd
        data={[
          venueJsonLd({
            type: "CafeOrCoffeeShop",
            name: `${SITE_NAME} Coffee Shop`,
            description: "A welcoming coffee shop to relax, catch up with a friend or work for a while.",
            path: "/cafe#coffee",
            image: "/home/cafe-wide.webp",
            settings,
          }),
          venueJsonLd({
            type: "HealthAndBeautyBusiness",
            name: `${SITE_NAME} Recovery Room`,
            description: "Massage, prenatal and postnatal treatments, facials and other wellness and beauty services.",
            path: "/cafe#recovery",
            image: "/home/cafe-wide.webp",
            settings,
          }),
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Café & recovery", item: absoluteUrl("/cafe") },
            ],
          },
        ]}
      />
      <HomeHeader />
      <main>
        <section className="relative min-h-[440px] overflow-hidden bg-brand-ink sm:min-h-[520px]">
          <Image
            src="/home/cafe-wide.webp"
            alt="The coffee shop terrace at night, with umbrellas, wooden tables and string lights in a tree"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/95 via-brand-ink/50 to-brand-ink/10" />
          <div className="relative z-10 mx-auto flex min-h-[440px] max-w-6xl flex-col justify-end px-6 pb-12 text-white sm:min-h-[520px] sm:pb-16">
            <nav aria-label="Breadcrumb" className="text-sm text-white/75">
              <ol className="flex gap-2">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-semibold text-white">Café &amp; recovery</li>
              </ol>
            </nav>
            <h1 className="font-baloo mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
              Coffee shop &amp; recovery room
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">
              A calm place to pause in {LOCALITY} — after a workout, after a treatment, or while your little one plays at
              Daydreams.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#coffee" className="rounded-full bg-white px-6 py-3 font-bold text-brand-ink hover:bg-white/90">The coffee shop</a>
              <a href="#recovery" className="rounded-full border border-white/60 px-6 py-3 font-bold text-white hover:bg-white/10">The recovery room</a>
            </div>
          </div>
        </section>

        <section id="coffee" aria-labelledby="coffee-heading" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-6 py-20 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-lavender-strong">Coffee shop</p>
            <h2 id="coffee-heading" className="font-baloo mt-3 text-3xl sm:text-4xl">Take a break, with a hot coffee</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-brand-ink/80">
              <p>
                Our coffee shop is a welcoming place to relax, catch up with a friend, work for a while, or simply enjoy a
                hot coffee and take a break. It sits right alongside the gym and Daydreams, so a coffee can be the start, the
                end, or the quiet middle of your visit.
              </p>
              {/* TODO(client): confirm whether the coffee shop is open to non-members and walk-ins. */}
              <p>
                Whether you&apos;re coming from a spin class, a massage, or dropping off your little one, there&apos;s a warm
                seat on the terrace waiting for you.
              </p>
            </div>
          </div>
          {sarah && (
            <aside className="rounded-3xl border border-brand-ink/10 bg-white p-7" style={{ borderTopWidth: 4, borderTopColor: sarah.accentColor }}>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/50">Meet your host</p>
              <h3 className="mt-2 text-2xl font-bold">{sarah.name}</h3>
              <p className="text-sm text-brand-ink/60">{sarah.role}</p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-ink/80">
                {bioParagraphs(sarah.bio, 2).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </aside>
          )}
        </section>

        <section id="recovery" aria-labelledby="recovery-heading" className="scroll-mt-24 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[3fr_2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-pink-strong">Recovery room</p>
              <h2 id="recovery-heading" className="font-baloo mt-3 text-3xl sm:text-4xl">Rest, recover and reset</h2>
              <p className="mt-5 leading-relaxed text-brand-ink/80">
                A space for rest, recovery and self-care, offering massages, prenatal and postnatal treatments, facials and
                other wellness and beauty services. Because taking care of yourself isn&apos;t a luxury — it&apos;s part of the
                workout.
              </p>
              {treatments.length > 0 && (
                <>
                  <h3 className="mt-8 font-bold">Treatments include</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-brand-ink/80 sm:grid-cols-2">
                    {[...treatments, "Facials and beauty treatments"].map((treatment) => (
                      <li key={treatment} className="flex gap-2">
                        <span aria-hidden="true" className="text-brand-pink-strong">●</span>
                        {treatment}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {/* TODO(client): swap for their treatment booking route (WhatsApp, booking app) if it isn't a call/email. */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`tel:${settings.phones[settings.phones.length - 1].replace(/[^+\d]/g, "")}`}
                  className="rounded-full bg-brand-pink-strong px-6 py-3 font-bold text-white hover:brightness-95"
                >
                  Call to book a treatment
                </a>
                <Link
                  href="/cafe?topic=treatment#contact"
                  className="rounded-full border border-brand-ink/20 px-6 py-3 font-bold hover:bg-brand-bg"
                >
                  Send us a message
                </Link>
              </div>
            </div>
            {loise && (
              <aside className="rounded-3xl border border-brand-ink/10 bg-brand-bg p-7" style={{ borderTopWidth: 4, borderTopColor: loise.accentColor }}>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/50">Meet your therapist</p>
                <h3 className="mt-2 text-2xl font-bold">{loise.name}</h3>
                <p className="text-sm text-brand-ink/60">{loise.role}</p>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-ink/80">
                  {bioParagraphs(loise.bio, 2).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </section>

        <section aria-labelledby="also-heading" className="mx-auto max-w-6xl px-6 py-16">
          <h2 id="also-heading" className="font-baloo text-3xl">Also under our roof</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/daydreams/site" className="rounded-2xl border border-brand-ink/10 bg-white p-6 transition hover:shadow-md" style={{ borderTopWidth: 4, borderTopColor: "#7443a3" }}>
              <span className="text-xl font-bold">Daydreams</span>
              <span className="mt-1 block text-sm text-brand-ink/70">Daycare and early learning for children 6 months to 5 years.</span>
            </Link>
            <Link href="/dumbbells" className="rounded-2xl border border-brand-ink/10 bg-white p-6 transition hover:shadow-md" style={{ borderTopWidth: 4, borderTopColor: "#c4214b" }}>
              <span className="text-xl font-bold">Dumbbells</span>
              <span className="mt-1 block text-sm text-brand-ink/70">A gym, a spin room and coached classes for every level.</span>
            </Link>
          </div>
        </section>

        <VisitUs settings={settings} area={AREA} />
      </main>
      <SiteFooter
        settings={settings}
        links={[
          {
            heading: "Explore",
            items: [
              { label: "Home", href: "/" },
              { label: "Daydreams daycare", href: "/daydreams/site" },
              { label: "Dumbbells gym", href: "/dumbbells" },
              { label: "Café & recovery", href: "/cafe" },
            ],
          },
        ]}
      />
    </div>
  );
}
