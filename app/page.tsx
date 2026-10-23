import Link from "next/link";
import { HomeHeader } from "@/components/home/HomeHeader";
import { SplitHero } from "@/components/home/SplitHero";
import {
  EventsSection,
  OfferingsLists,
  ReviewsSection,
  SpacesGrid,
  TogetherSection,
  VisitUs,
} from "@/components/home/HomeSections";
import { SiteFAQs, contactFaqs, type FaqItem } from "@/components/site/SiteFAQs";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LegacySiteRedirect } from "@/components/site/LegacySiteRedirect";
import { JsonLd } from "@/components/seo/JsonLd";
import { getGymClasses, getPrograms, getSiteSettings, getTestimonials } from "@/lib/daydreams/content";
import { AREA, LOCALITY, SITE_NAME, organizationJsonLd, pageMetadata } from "@/lib/seo";

/**
 * The combined front door. The two brands keep their own sites
 * (/daydreams/site, /dumbbells); this page explains the "gym and daycare
 * under one roof" offer neither site can on its own, and is what ranks for
 * those combined searches. The 3D game is linked from the Daydreams half.
 */

const DESCRIPTION = `A gym and a daycare under one roof in ${LOCALITY}. Work out, recover or grab a coffee while your child plays and learns at Daydreams — plus spin classes, parties and events.`;

export const metadata = pageMetadata({
  title: `Gym with Daycare in ${LOCALITY} | ${SITE_NAME}`,
  description: DESCRIPTION,
  path: "/",
});

const HOME_FAQS: FaqItem[] = [
  {
    // TODO(client): confirm drop-off rules (ages, supervision, whether booking ahead is needed).
    question: "Can I work out while my child is at Daydreams?",
    answerText:
      "Yes — that's exactly why we built Daydreams & Dumbbells. Your child plays and learns at Daydreams while you train at Dumbbells, have a treatment or enjoy a coffee, all in the same building.",
    answer: (
      <p>
        Yes — that&apos;s exactly why we built Daydreams &amp; Dumbbells. Your child plays and learns at Daydreams while you
        train at Dumbbells, have a treatment or enjoy a coffee, all in the same building.
      </p>
    ),
  },
  {
    question: "What ages does Daydreams take?",
    answerText:
      "Daydreams is for children from 6 months to 5 years, across three rooms: Wobblers (6–18 months), Explorers (18 months–3 years) and Dreambuilders (3–5 years).",
    answer: (
      <p>
        Daydreams is for children from 6 months to 5 years, across three rooms:{" "}
        <Link href="/daydreams/programs/wobblers" className="font-semibold underline">Wobblers</Link> (6–18 months),{" "}
        <Link href="/daydreams/programs/explorers" className="font-semibold underline">Explorers</Link> (18 months–3 years) and{" "}
        <Link href="/daydreams/programs/dreambuilders" className="font-semibold underline">Dreambuilders</Link> (3–5 years).
      </p>
    ),
  },
  {
    question: "Do I need a gym membership?",
    answerText: "No. You can come in for a single day or a week, or join monthly or for three or six months.",
    answer: <p>No. You can come in for a single day or a week, or join monthly or for three or six months.</p>,
  },
  {
    question: "What does the recovery room offer?",
    answerText: "Massage, prenatal and postnatal treatments, facials and other wellness and beauty services.",
    answer: (
      <p>
        Massage, prenatal and postnatal treatments, facials and other wellness and beauty services.{" "}
        <Link href="/cafe#recovery" className="font-semibold underline">See the recovery room</Link>.
      </p>
    ),
  },
  {
    question: "Can I book the space for a party?",
    answerText:
      "Yes. We host birthday parties, baby showers, children's celebrations and family gatherings. Get in touch to ask about a date.",
    answer: (
      <p>
        Yes. We host birthday parties, baby showers, children&apos;s celebrations and family gatherings.{" "}
        <Link href="/?topic=events#contact" className="font-semibold underline">Ask about a date</Link>.
      </p>
    ),
  },
];

export default async function Home() {
  const [baseSettings, programs, classes, testimonials] = await Promise.all([
    getSiteSettings(),
    getPrograms(),
    getGymClasses(),
    getTestimonials(),
  ]);
  // Both brands share one address, phone and hours; only the name differs here.
  const settings = { ...baseSettings, businessName: SITE_NAME, tagline: "Strong parents. Happy kids. Brighter days." };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      <JsonLd data={organizationJsonLd(settings, { description: DESCRIPTION, image: "/home/building-day.webp" })} />
      <LegacySiteRedirect />
      <HomeHeader overlay />
      <main>
        <SplitHero locality={LOCALITY} />
        <TogetherSection />
        <SpacesGrid />
        <OfferingsLists programs={programs} classes={classes} />
        <EventsSection />
        <ReviewsSection testimonials={testimonials} />
        <div className="bg-brand-bg">
          <SiteFAQs id="faqs" questions={[...HOME_FAQS, ...contactFaqs(settings)]} />
        </div>
        <VisitUs settings={settings} area={AREA} />
      </main>
      <SiteFooter
        settings={settings}
        links={[
          {
            heading: "Daydreams",
            items: [
              { label: "Daydreams daycare", href: "/daydreams/site" },
              ...programs.map((p) => ({ label: p.title, href: `/daydreams/programs/${p.id}` })),
              { label: "Play the Daydreams game", href: "/daydreams" },
            ],
          },
          {
            heading: "Dumbbells",
            items: [
              { label: "Dumbbells gym", href: "/dumbbells" },
              ...classes.map((c) => ({ label: c.title, href: `/dumbbells/classes/${c.id}` })),
            ],
          },
        ]}
      />
    </div>
  );
}
