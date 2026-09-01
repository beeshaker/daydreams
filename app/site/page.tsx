import Image from "next/image";
import Link from "next/link";
import {
  getPrograms,
  getStaff,
  getTestimonials,
  getGallery,
  getSchedule,
  getFirstTimerSteps,
  getSiteSettings,
  getGymClasses,
  getTrainers,
  getGymGallery,
  getGymTestimonials,
  getGymFirstTimerSteps,
  getGymSiteSettings,
} from "@/lib/daydreams/content";
import { getOccurrencesWithCounts } from "@/lib/classes/queries";
import { ProgramsSection } from "@/components/daydreams/sections/ProgramsSection";
import { StaffSection } from "@/components/daydreams/sections/StaffSection";
import { ScheduleSection } from "@/components/daydreams/sections/ScheduleSection";
import { ClassScheduleSection } from "@/components/daydreams/sections/ClassScheduleSection";
import { GallerySection } from "@/components/daydreams/sections/GallerySection";
import { TestimonialsSection } from "@/components/daydreams/sections/TestimonialsSection";
import { FirstTimerSection } from "@/components/daydreams/sections/FirstTimerSection";
import { BookAVisitForm } from "@/components/daydreams/BookAVisitForm";
import { BookASessionForm } from "@/components/dumbbells/BookASessionForm";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroVideo } from "@/components/site/HeroVideo";

export const metadata = {
  title: "Daydreams & Dumbbells — Traditional Site",
  description: "A gym and a daycare, under one roof — see both sides in one place.",
};

// Class occurrences and sign-up counts are live, mutable data (new sign-ups,
// admin cancellations/reschedules) read straight from the filesystem store —
// nothing here uses a Next.js "dynamic API", so without this the route would
// otherwise be statically prerendered once at build time and never reflect
// real sign-ups, which defeats router.refresh() after a sign-up.
export const dynamic = "force-dynamic";

const dumbbellsSections = [
  { id: "classes", label: "Classes" },
  { id: "trainers", label: "Trainers" },
  { id: "dumbbells-schedule", label: "Class Schedule" },
  { id: "dumbbells-gallery", label: "Gallery" },
  { id: "dumbbells-testimonials", label: "Members Say" },
  { id: "dumbbells-first-timers", label: "First Timers" },
  { id: "join", label: "Join Us" },
];

const daydreamsSections = [
  { id: "programs", label: "Programs" },
  { id: "staff", label: "Meet the Teachers" },
  { id: "schedule", label: "Our Day" },
  { id: "sessions", label: "Book a Session" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Parents Say" },
  { id: "first-timers", label: "First Timers" },
  { id: "visit", label: "Book a Visit" },
];

export default async function SitePage() {
  const [
    programs,
    staff,
    schedule,
    gallery,
    testimonials,
    firstTimerSteps,
    siteSettings,
    gymClasses,
    trainers,
    gymGallery,
    gymTestimonials,
    gymFirstTimerSteps,
    gymSiteSettings,
  ] = await Promise.all([
    getPrograms(),
    getStaff(),
    getSchedule(),
    getGallery(),
    getTestimonials(),
    getFirstTimerSteps(),
    getSiteSettings(),
    getGymClasses(),
    getTrainers(),
    getGymGallery(),
    getGymTestimonials(),
    getGymFirstTimerSteps(),
    getGymSiteSettings(),
  ]);

  // Awaited sequentially (not inside the Promise.all above): both calls can
  // write to the same .data/class-occurrences.json file via
  // ensureUpcomingOccurrences, and that store does an unsynchronized
  // read-modify-write, so running them concurrently risks one write
  // clobbering the other.
  const gymOccurrences = await getOccurrencesWithCounts("gym");
  const daycareOccurrences = await getOccurrencesWithCounts("daycare");

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      <header className="sticky top-0 z-10 border-b border-brand-ink/10 bg-brand-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Image
              src="/branding/logo.png"
              alt="Daydreams and Dumbbells logo"
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 rounded-full object-cover"
            />
            Daydreams &amp; Dumbbells
          </Link>
          <nav aria-label="Top-level sections" className="flex gap-x-4 text-sm font-semibold">
            <a href="#dumbbells" className="text-brand-ink/70 hover:text-brand-ink">
              Dumbbells
            </a>
            <a href="#daydreams" className="text-brand-ink/70 hover:text-brand-ink">
              Daydreams
            </a>
          </nav>
          <Link
            href="/daydreams"
            className="rounded-full bg-brand-ink px-4 py-1.5 text-sm font-semibold text-white hover:brightness-125"
          >
            Play the Daydreams game
          </Link>
        </div>
      </header>

      <main className="flex flex-col">
        <div className="relative h-[80vh] min-h-[520px] w-full overflow-hidden bg-brand-ink">
          <HeroVideo />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
          <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-16">
            <div className="text-xs font-extrabold uppercase tracking-widest text-white/70">
              Daydreams &amp; Dumbbells
            </div>
            <h1 className="font-bebas mt-3 text-6xl uppercase leading-[0.95] tracking-wide text-white sm:text-8xl">
              Strength for you.
              <br />
              Joy for them.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/85">
              One address, two reasons to walk through the door — {siteSettings.address}.
              Whichever one you need today, the other&apos;s right there too.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a
                href="#join"
                className="rounded-full bg-brand-pink-strong px-8 py-3 font-bold text-white hover:brightness-95"
              >
                Sign Up for Dumbbells
              </a>
              <a
                href="#visit"
                className="rounded-full border-2 border-white px-8 py-3 font-bold text-white hover:bg-white/10"
              >
                Book a Daydreams Visit
              </a>
            </div>
          </div>
        </div>

        {/* Dumbbells zone — dark and bold */}
        <div id="dumbbells" className="zone-dark scroll-mt-24 bg-brand-ink text-white">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="font-bebas text-6xl uppercase tracking-wide sm:text-7xl">Dumbbells</h2>
            <nav aria-label="Dumbbells sections" className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {dumbbellsSections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="text-white/60 hover:text-white">
                  {section.label}
                </a>
              ))}
            </nav>

            <p className="mt-5 max-w-2xl text-white/75">
              {gymSiteSettings.tagline} Meet the trainers, see this week&apos;s class schedule, and
              find the class that fits.
            </p>

            <div className="mt-12 flex flex-col gap-16">
              <section id="classes" className="scroll-mt-24">
                <h3 className="font-bebas text-3xl uppercase tracking-wide">Classes</h3>
                <div className="mt-5">
                  <ProgramsSection programs={gymClasses} />
                </div>
              </section>

              <section id="trainers" className="scroll-mt-24">
                <h3 className="font-bebas text-3xl uppercase tracking-wide">Trainers</h3>
                <div className="mt-5">
                  <StaffSection staff={trainers} />
                </div>
              </section>

              <section id="dumbbells-schedule" className="scroll-mt-24">
                <h3 className="font-bebas text-3xl uppercase tracking-wide">Class Schedule</h3>
                <div className="mt-5 max-w-2xl">
                  <ClassScheduleSection occurrences={gymOccurrences} />
                </div>
              </section>

              <section id="dumbbells-gallery" className="scroll-mt-24">
                <h3 className="font-bebas text-3xl uppercase tracking-wide">Gallery</h3>
                <div className="mt-5">
                  <GallerySection gallery={gymGallery} />
                </div>
              </section>

              <section id="dumbbells-testimonials" className="scroll-mt-24">
                <h3 className="font-bebas text-3xl uppercase tracking-wide">Members Say</h3>
                <div className="mt-5">
                  <TestimonialsSection testimonials={gymTestimonials} />
                </div>
              </section>

              <section id="dumbbells-first-timers" className="scroll-mt-24">
                <h3 className="font-bebas text-3xl uppercase tracking-wide">First Timers</h3>
                <p className="mt-2 text-sm text-white/60">
                  New around here? Here&apos;s how to get started — then check{" "}
                  <a href="#dumbbells-schedule" className="font-semibold text-brand-lavender underline">
                    this week&apos;s class schedule
                  </a>{" "}
                  to book your first spot.
                </p>
                <div className="mt-5">
                  <FirstTimerSection steps={gymFirstTimerSteps} />
                </div>
              </section>

              <section id="join" className="scroll-mt-24">
                <h3 className="font-bebas text-3xl uppercase tracking-wide">Join Us</h3>
                <p className="mt-2 text-sm text-white/60">
                  Tell us a bit about your goals and we&apos;ll follow up to book your first session.
                </p>
                <div className="relative mt-5 max-w-xl">
                  <BookASessionForm source="traditional-site" />
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Daydreams zone — warm and light */}
        <div
          id="daydreams"
          className="scroll-mt-24 bg-gradient-to-b from-brand-lavender/20 via-brand-lavender/5 to-transparent"
        >
          <div className="mx-auto max-w-5xl px-6 py-20">
            <h2 className="font-baloo text-6xl text-brand-ink sm:text-7xl">Daydreams</h2>
            <nav aria-label="Daydreams sections" className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {daydreamsSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-brand-ink/70 hover:text-brand-ink"
                >
                  {section.label}
                </a>
              ))}
            </nav>

            <p className="mt-5 max-w-2xl text-brand-ink/80">
              {siteSettings.tagline} Take a look around, meet our teachers, and see what a day at
              Daydreams looks like — or{" "}
              <Link href="/daydreams" className="font-semibold text-brand-lavender-strong underline">
                hop in the car and explore it as a game
              </Link>
              .
            </p>

            <div className="mt-12 flex flex-col gap-16">
              <section id="programs" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">Programs</h3>
                <div className="mt-5">
                  <ProgramsSection programs={programs} />
                </div>
              </section>

              <section id="staff" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">Meet the Teachers</h3>
                <div className="mt-5">
                  <StaffSection staff={staff} />
                </div>
              </section>

              <section id="schedule" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">Our Day</h3>
                <div className="mt-5 max-w-md">
                  <ScheduleSection schedule={schedule} />
                </div>
              </section>

              <section id="sessions" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">Book a Session</h3>
                <div className="mt-5 max-w-2xl">
                  <ClassScheduleSection occurrences={daycareOccurrences} />
                </div>
              </section>

              <section id="gallery" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">Gallery</h3>
                <div className="mt-5">
                  <GallerySection gallery={gallery} />
                </div>
              </section>

              <section id="testimonials" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">Parents Say</h3>
                <div className="mt-5">
                  <TestimonialsSection testimonials={testimonials} />
                </div>
              </section>

              <section id="first-timers" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">First Timers</h3>
                <p className="mt-2 text-sm text-brand-ink/70">
                  New to Daydreams? Here&apos;s how a first visit works — then check{" "}
                  <a href="#sessions" className="font-semibold text-brand-lavender-strong underline">
                    upcoming sessions
                  </a>{" "}
                  to book a spot.
                </p>
                <div className="mt-5">
                  <FirstTimerSection steps={firstTimerSteps} />
                </div>
              </section>

              <section id="visit" className="scroll-mt-24">
                <h3 className="font-baloo text-2xl text-brand-ink">Book a Visit</h3>
                <p className="mt-2 text-sm text-brand-ink/70">
                  Tell us a bit about your family and we&apos;ll follow up to schedule a tour.
                </p>
                <div className="relative mt-5 max-w-xl">
                  <BookAVisitForm source="traditional-site" />
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 py-20">
          <h2 className="font-baloo text-4xl text-brand-ink">Questions, answered.</h2>
          <div className="mt-6 divide-y divide-brand-ink/10 rounded-xl border border-brand-ink/10 bg-white">
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-ink marker:content-none">
                Can I visit Dumbbells and Daydreams on the same trip?
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-brand-ink/50 transition-transform group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-brand-ink/70">
                Yes — both are at {siteSettings.address}, so you can drop off, train, and pick up
                without leaving the building.
              </p>
            </details>
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-ink marker:content-none">
                What are your hours?
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-brand-ink/50 transition-transform group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                </svg>
              </summary>
              <div className="mt-3 grid gap-4 text-sm text-brand-ink/70 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-brand-ink">Daydreams</p>
                  {siteSettings.hours.map((block) => (
                    <p key={block.day}>
                      {block.day}: {block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-brand-ink">Dumbbells</p>
                  {gymSiteSettings.hours.map((block) => (
                    <p key={block.day}>
                      {block.day}: {block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}
                    </p>
                  ))}
                </div>
              </div>
            </details>
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-ink marker:content-none">
                How do I get started?
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-brand-ink/50 transition-transform group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-brand-ink/70">
                Fill out the{" "}
                <a href="#join" className="font-semibold text-brand-lavender-strong underline">
                  Join Us
                </a>{" "}
                form in the Dumbbells section or the{" "}
                <a href="#visit" className="font-semibold text-brand-lavender-strong underline">
                  Book a Visit
                </a>{" "}
                form in the Daydreams section — we&apos;ll follow up to get you scheduled.
              </p>
            </details>
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-ink marker:content-none">
                How can I reach you directly?
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-brand-ink/50 transition-transform group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-brand-ink/70">
                Call {siteSettings.phone} or email {siteSettings.email}.
              </p>
            </details>
          </div>
        </div>
      </main>

      <SiteFooter daydreamsSettings={siteSettings} gymSettings={gymSiteSettings} />
    </div>
  );
}
