import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/home/ContactForm";
import type { Program, SiteSettings, Testimonial } from "@/lib/daydreams/types";

/**
 * The home page's content sections, below the split hero. Each section
 * targets a search the two separate sites can't: the combined "gym with
 * daycare" offer, the shared spaces, and parties/events. Copy is drawn from
 * the client's profile (docs/data/Profile - Daydreams & Dumbbellls.pdf);
 * anything marked TODO(client) still needs their confirmation.
 */

const sectionHeading = "font-baloo text-3xl leading-tight text-brand-ink sm:text-4xl";

export function TogetherSection() {
  return (
    <section id="together" aria-labelledby="together-heading" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-6 py-20 md:grid-cols-[2fr_3fr] md:items-center">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
        <Image
          src="/home/building-day.webp"
          alt="The Daydreams & Dumbbells building, a white house with the logo on its gable, set among tall trees"
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
      <div>
        <h2 id="together-heading" className={sectionHeading}>Work out while they play</h2>
        <div className="mt-5 space-y-4 text-lg leading-relaxed text-brand-ink">
          <p>
            After having her daughter, our founder Satnam went looking for one place where she could train, get a
            massage or simply enjoy a hot coffee — while her little one had her own activities too. It didn&apos;t
            exist, so she built it.
          </p>
          {/* TODO(client): confirm how drop-off works while a parent is in the gym (ages, supervision, booking). */}
          <p>
            Daydreams &amp; Dumbbells is a gym and a daycare under one roof in Nairobi. Bring your child to
            Daydreams for sensory play, soft play, music and early learning, head next door to Dumbbells for a spin
            class or a strength session, then finish with a coffee — no criss-crossing town, and no mum guilt.
          </p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/daydreams/site#visit" className="rounded-full bg-brand-lavender-strong px-6 py-3 font-bold text-white hover:brightness-95">
            Book a visit to Daydreams
          </Link>
          <Link href="/dumbbells#join" className="rounded-full bg-white px-6 py-3 font-bold text-brand-ink hover:bg-brand-ink/5">
            Book a gym session
          </Link>
        </div>
      </div>
    </section>
  );
}

const SPACES: { title: string; text: string; src?: string; alt: string; href?: string; accent: string }[] = [
  {
    title: "Kids' spaces",
    text: "Soft play, sensory play, mud play, climbing and early learning rooms for little ones.",
    src: "/home/tile-kids.webp",
    alt: "The Daydreams climbing room, with a climbing wall, cargo net and a small table and chairs",
    href: "/daydreams/site",
    accent: "#7443a3",
  },
  {
    title: "The gym",
    text: "Free weights, strength machines and cardio, for every stage of your fitness journey.",
    src: "/home/tile-gym.webp",
    alt: "Cable machines, a squat rack and treadmills on the Dumbbells gym floor",
    href: "/dumbbells",
    accent: "#c4214b",
  },
  {
    title: "Spin room",
    text: "A dedicated cycling room for high-energy rides with great music.",
    src: "/dumbbells-premium/assets/class-sunrise.webp",
    alt: "A spin bike in the Dumbbells spin room",
    href: "/dumbbells/classes/spin",
    accent: "#b3542e",
  },
  {
    // TODO(client): swap in a recovery-room photo when one is available.
    title: "Recovery room",
    text: "Massage, prenatal and postnatal treatments, facials and other wellness services.",
    alt: "",
    href: "/cafe#recovery",
    accent: "#7a6468",
  },
  {
    title: "Coffee shop",
    text: "Relax, catch up with a friend or work for a while over a hot coffee.",
    src: "/home/tile-cafe.webp",
    alt: "The coffee shop terrace at night, with umbrellas, wooden tables and string lights in a tree",
    href: "/cafe#coffee",
    accent: "#2e8b6f",
  },
  {
    title: "Parties & events",
    text: "Birthday parties, baby showers and family celebrations in a space built for kids.",
    src: "/home/tile-events.webp",
    alt: "The Daydreams soft-play room with a rainbow slide and colourful foam floor",
    href: "#events",
    accent: "#e9a23b",
  },
];

export function SpacesGrid() {
  return (
    <section id="spaces" aria-labelledby="spaces-heading" className="scroll-mt-24 bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="spaces-heading" className={sectionHeading}>Everything under one roof</h2>
        <p className="mt-3 max-w-2xl text-lg text-brand-ink">
          Fitness, recovery, play, coffee and community — all in one Nairobi home for modern families.
        </p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SPACES.map((space) => {
            const body = (
              <>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl" style={{ backgroundColor: space.accent }}>
                  {space.src ? (
                    <Image src={space.src} alt={space.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" />
                  ) : (
                    // No photo yet: the room's services set large, so the tile isn't an empty swatch.
                    <p aria-hidden="true" className="font-baloo absolute inset-0 flex flex-col justify-end p-6 text-2xl leading-none text-white motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105">
                      <span>Massage.</span>
                      <span>Facials.</span>
                      <span>Prenatal care.</span>
                    </p>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-brand-ink">
                  {space.title}
                </h3>
                <p className="mt-1 text-brand-ink">{space.text}</p>
              </>
            );
            return (
              <li key={space.title}>
                {space.href ? (
                  <Link href={space.href} className="group block">{body}</Link>
                ) : (
                  <div className="group">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const offeringRow =
  "group flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 transition-transform duration-300 motion-safe:hover:translate-x-1";

export function OfferingsLists({ programs, classes }: { programs: Program[]; classes: Program[] }) {
  return (
    <section id="offerings" aria-label="Programs and classes" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-6 py-20 md:grid-cols-2">
      <div>
        <h2 className={sectionHeading}>Daydreams programs</h2>
        <p className="mt-3 text-lg text-brand-ink">Daycare and early learning rooms for every stage, from first steps to school-ready.</p>
        <ul className="mt-6 space-y-2">
          {programs.map((program) => (
            <li key={program.id}>
              <Link href={`/daydreams/programs/${program.id}`} className={offeringRow}>
                <span>
                  <span className="block text-lg font-bold text-brand-ink">{program.title}</span>
                  <span className="text-brand-ink/75">{program.ageRange} · {program.shortDescription}</span>
                </span>
                <span aria-hidden="true" className="text-brand-lavender-strong">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/daydreams/site" className="mt-6 inline-block font-bold text-brand-lavender-strong underline underline-offset-4">
          See all of Daydreams
        </Link>
      </div>
      <div>
        <h2 className={sectionHeading}>Dumbbells classes</h2>
        <p className="mt-3 text-lg text-brand-ink">Coached classes through the week, from spin to strength to prenatal Pilates.</p>
        <ul className="mt-6 space-y-2">
          {classes.map((gymClass) => (
            <li key={gymClass.id}>
              <Link href={`/dumbbells/classes/${gymClass.id}`} className={offeringRow}>
                <span>
                  <span className="block text-lg font-bold text-brand-ink">{gymClass.title}</span>
                  <span className="text-brand-ink/75">{gymClass.shortDescription}</span>
                </span>
                <span aria-hidden="true" className="text-brand-pink-strong">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/dumbbells" className="mt-6 inline-block font-bold text-brand-pink-strong underline underline-offset-4">
          See all of Dumbbells
        </Link>
      </div>
    </section>
  );
}

export function EventsSection() {
  return (
    <section id="events" aria-labelledby="events-heading" className="scroll-mt-24 bg-brand-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[3fr_2fr] md:items-center">
        <div>
          <h2 id="events-heading" className="font-baloo text-3xl leading-tight sm:text-4xl">Parties and events</h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">
            Our space is available for private events and celebrations — a relaxed setting where kids can play and
            grown-ups can actually enjoy themselves.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {["Birthday parties", "Baby showers", "Children's celebrations", "Family gatherings", "Private celebrations"].map((item) => (
              <li key={item} className="rounded-full bg-white/10 px-4 py-1.5 text-white">{item}</li>
            ))}
          </ul>
          <Link
            href="/?topic=events#contact"
            className="mt-8 inline-block rounded-full bg-brand-pink-strong px-6 py-3 font-bold text-white hover:brightness-110"
          >
            Ask about a date
          </Link>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image
            src="/home/cafe-terrace.webp"
            alt="The coffee shop terrace lit up at night with string lights and umbrellas"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-20 text-center">
      <h2 id="reviews-heading" className={sectionHeading}>What parents say</h2>
      <div className="mt-8 space-y-10">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.id}>
            <blockquote className="font-baloo text-2xl leading-snug text-brand-ink sm:text-3xl">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 font-semibold text-brand-ink/75">
              {testimonial.author} — {testimonial.relation}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/**
 * Address, hours and phones next to the general contact form. Every "get in
 * touch" style button on the combined pages lands here (optionally with
 * ?topic= to preselect), rather than opening a mail app.
 */
export function VisitUs({ settings, area }: { settings: SiteSettings; area: string | null }) {
  const mapQuery = encodeURIComponent(`${settings.businessName}, ${settings.address}, Kenya`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 id="contact-heading" className={sectionHeading}>Visit us</h2>
          <address className="mt-6 space-y-6 text-lg not-italic text-brand-ink">
            <div>
              <h3 className="font-bold">Address</h3>
              <p className="mt-1">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                  {settings.address}, Kenya
                </a>
              </p>
              {area && <p className="text-brand-ink/75">{area}, Nairobi</p>}
            </div>
            <div>
              <h3 className="font-bold">Opening hours</h3>
              <ul className="mt-1 space-y-0.5">
                {settings.hours.map((block) => (
                  <li key={block.day}>
                    {block.day}: {block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Call or email</h3>
              <p className="mt-1">
                {settings.phones.map((phone, i) => (
                  <span key={phone}>
                    {i > 0 && " · "}
                    <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:underline">{phone}</a>
                  </span>
                ))}
              </p>
              <p className="break-words">{settings.email}</p>
            </div>
          </address>
          {/*
            Google's keyless embed, searching the same query as mapsUrl so it pins
            the business listing. Lazy, so the third-party frame only loads near
            the section. The link sits outside the frame (clicks inside it go to
            the map), and stays usable if the frame is blocked.
          */}
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-brand-bg">
            <iframe
              src={mapEmbedUrl}
              title={`Map showing ${settings.businessName} at ${settings.address}, Nairobi`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-ink px-5 py-2.5 font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Open in Google Maps <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="rounded-3xl bg-brand-bg p-6 sm:p-8">
          <h3 className="font-baloo text-2xl text-brand-ink">Send us a message</h3>
          <p className="mt-1 text-brand-ink/80">
            Questions, bookings, parties or treatments — we&apos;ll get back to you soon.
          </p>
          <div className="mt-6">
            {/* useSearchParams (for ?topic=) needs a Suspense boundary on a statically rendered page. */}
            <Suspense fallback={<div className="h-[460px]" aria-hidden="true" />}>
              <ContactForm turnstileSiteKey={process.env.TURNSTILE_SITE_KEY ?? ""} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
