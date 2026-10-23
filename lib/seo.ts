import type { Metadata } from "next";
import type { Program, SiteHours, SiteSettings } from "@/lib/daydreams/types";

/**
 * Shared SEO config and builders — page metadata (canonical, Open Graph,
 * Twitter) and schema.org JSON-LD. Business facts (address, phones, hours)
 * come from SiteSettings via lib/daydreams/content.ts, not from here, so
 * there's one source of truth for NAP across the footer, FAQs and schema.
 */

export const PRODUCTION_URL = "https://daydreamsanddumbbells.com";

/** Staging sets NEXT_PUBLIC_SITE_URL to its own origin; robots.ts then blocks crawling. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL).replace(/\/+$/, "");

export const IS_PRODUCTION_SITE = SITE_URL === PRODUCTION_URL;

export const SITE_NAME = "Daydreams & Dumbbells";

/**
 * The Nairobi neighbourhood 41 Greviellia Grove is in (confirmed by the
 * client) — local searches are usually "daycare in <area>".
 */
export const AREA: string | null = "Spring Valley";

/** Map pin for the LocalBusiness schema, from the business's Google Maps listing. */
export const GEO: { latitude: number; longitude: number } | null = { latitude: -1.253956, longitude: 36.7750561 };

export const LOCALITY = AREA ? `${AREA}, Nairobi` : "Nairobi";

export const OG_IMAGES = {
  shared: { url: "/og/daydreams-and-dumbbells.png", alt: "Daydreams & Dumbbells — a daycare and a gym under one roof in Nairobi" },
  daydreams: { url: "/og/daydreams.png", alt: "Children playing with building blocks at Daydreams daycare" },
  dumbbells: { url: "/og/dumbbells.png", alt: "A woman lifting a dumbbell at Dumbbells gym" },
} as const;

export const BUSINESS_IDS = {
  organization: `${SITE_URL}/#organization`,
  daydreams: `${SITE_URL}/daydreams/site#business`,
  dumbbells: `${SITE_URL}/dumbbells#business`,
} as const;

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Metadata for one public page. Titles are absolute (not run through a
 * layout template) so each page controls its full title length. Child
 * `openGraph` objects replace the parent's rather than merging, so every
 * field is set here rather than relying on the root layout.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = OG_IMAGES.shared,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  /** Defaults to the 1200×630 cards in public/og/; pass width/height for any other image. */
  image?: { url: string; alt: string; width?: number; height?: number };
  noIndex?: boolean;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_KE",
      title,
      description,
      url: path,
      images: [{ width: 1200, height: 630, ...image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}

/** Kenyan numbers as written locally ("0715 634 027") to E.164 ("+254715634027"). */
export function toE164(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("254")) return `+${digits}`;
  return `+254${digits.replace(/^0/, "")}`;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "8:30 AM" -> "08:30", "6:00 PM" -> "18:00". */
function to24h(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

/** SiteSettings.hours ("Monday – Friday", "8:30 AM", "6:00 PM") to schema.org OpeningHoursSpecification. */
export function openingHoursSpecification(hours: SiteHours[]) {
  return hours.flatMap((block) => {
    const opens = to24h(block.open);
    const closes = to24h(block.close);
    if (!opens || !closes) return [];
    const [from, to = from] = block.day.split(/\s*[–-]\s*/).map((day) => WEEKDAYS.indexOf(day.trim()));
    if (from < 0 || to < 0) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: WEEKDAYS.slice(from, to + 1).map((day) => `https://schema.org/${day}`),
        opens,
        closes,
      },
    ];
  });
}

function postalAddress(settings: SiteSettings) {
  // settings.address is "41 Greviellia Grove, Nairobi" — street before the first comma.
  const [street] = settings.address.split(",");
  return {
    "@type": "PostalAddress",
    streetAddress: street.trim(),
    ...(AREA && { addressRegion: AREA }),
    addressLocality: "Nairobi",
    addressCountry: "KE",
  };
}

/** ChildCare / ExerciseGym schema for one side of the business, with its programs as an offer catalog. */
export function localBusinessJsonLd({
  type,
  settings,
  path,
  description,
  image,
  offerings,
  offeringPath,
}: {
  type: "ChildCare" | "ExerciseGym";
  settings: SiteSettings;
  path: string;
  description: string;
  image: string;
  offerings: Program[];
  /** Detail page for one offering, e.g. (id) => `/daydreams/programs/${id}`. */
  offeringPath: (id: string) => string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": type === "ChildCare" ? BUSINESS_IDS.daydreams : BUSINESS_IDS.dumbbells,
    name: settings.businessName,
    description,
    url: absoluteUrl(path),
    image: absoluteUrl(image),
    logo: absoluteUrl("/branding/logo.png"),
    telephone: settings.phones.map(toE164),
    email: settings.email,
    address: postalAddress(settings),
    ...(GEO && { geo: { "@type": "GeoCoordinates", ...GEO } }),
    areaServed: { "@type": "City", name: "Nairobi" },
    openingHoursSpecification: openingHoursSpecification(settings.hours),
    ...(settings.instagramUrl && { sameAs: [settings.instagramUrl] }),
    parentOrganization: { "@id": BUSINESS_IDS.organization },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: type === "ChildCare" ? "Programs" : "Classes",
      itemListElement: offerings.map((offering) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: offering.title,
          description: offering.description,
          url: absoluteUrl(offeringPath(offering.id)),
        },
      })),
    },
  };
}

/**
 * The combined business, for the home page. A LocalBusiness (itself an
 * Organization subtype) rather than a bare Organization, so the home page
 * carries the full local listing — address, hours, map pin — that Google
 * matches against the Business Profile.
 */
export function organizationJsonLd(settings: SiteSettings, { description, image }: { description: string; image: string }) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": BUSINESS_IDS.organization,
      name: SITE_NAME,
      description,
      url: SITE_URL,
      image: absoluteUrl(image),
      logo: absoluteUrl("/branding/logo.png"),
      email: settings.email,
      telephone: settings.phones.map(toE164),
      address: postalAddress(settings),
      ...(GEO && { geo: { "@type": "GeoCoordinates", ...GEO } }),
      openingHoursSpecification: openingHoursSpecification(settings.hours),
      ...(settings.instagramUrl && { sameAs: [settings.instagramUrl] }),
      subOrganization: [{ "@id": BUSINESS_IDS.daydreams }, { "@id": BUSINESS_IDS.dumbbells }],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": BUSINESS_IDS.organization },
    },
  ];
}

/** A venue inside the building (the coffee shop, the recovery room) — same NAP and hours, part of the combined business. */
export function venueJsonLd({
  type,
  name,
  description,
  path,
  image,
  settings,
}: {
  type: "CafeOrCoffeeShop" | "HealthAndBeautyBusiness";
  name: string;
  description: string;
  path: string;
  image: string;
  settings: SiteSettings;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: absoluteUrl(path),
    image: absoluteUrl(image),
    telephone: settings.phones.map(toE164),
    email: settings.email,
    address: postalAddress(settings),
    ...(GEO && { geo: { "@type": "GeoCoordinates", ...GEO } }),
    openingHoursSpecification: openingHoursSpecification(settings.hours),
    parentOrganization: { "@id": BUSINESS_IDS.organization },
  };
}

/** Schema for a single program/class page: the Service itself plus its breadcrumb trail. */
export function offeringJsonLd({
  offering,
  path,
  providerId,
  breadcrumbs,
}: {
  offering: Program;
  path: string;
  providerId: string;
  breadcrumbs: { name: string; path: string }[];
}) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: offering.title,
      description: offering.longDescription ?? offering.description,
      url: absoluteUrl(path),
      ...(offering.src && { image: absoluteUrl(offering.src) }),
      audience: { "@type": "Audience", audienceType: offering.ageRange },
      areaServed: { "@type": "City", name: "Nairobi" },
      provider: { "@id": providerId },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
  ];
}

/** FAQPage schema from plain-text question/answer pairs (see components/site/SiteFAQs.tsx). */
export function faqJsonLd(questions: { question: string; answerText: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answerText }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answerText },
    })),
  };
}
