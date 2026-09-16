import type { Metadata } from "next";
import Link from "next/link";
import {
  getPrograms,
  getStaff,
  getSchedule,
  getGallery,
  getTestimonials,
  getSiteSettings,
} from "@/lib/daydreams/content";
import { BookAVisitForm } from "@/components/daydreams/BookAVisitForm";
import { ProgramsSection } from "@/components/daydreams/sections/ProgramsSection";
import { StaffSection } from "@/components/daydreams/sections/StaffSection";
import { ScheduleSection } from "@/components/daydreams/sections/ScheduleSection";
import { GallerySection } from "@/components/daydreams/sections/GallerySection";
import { TestimonialsSection } from "@/components/daydreams/sections/TestimonialsSection";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteFAQs } from "@/components/site/SiteFAQs";
import { HeroVideo } from "@/components/site/HeroVideo";

export const metadata: Metadata = {
  title: "Daydreams — Daycare & Early Learning",
  description: "Discover Daydreams daycare: explore our programs, meet the teachers, see our daily routine, and book a visit for your family.",
};

const sections = [
  { id: "programs", label: "Programs" },
  { id: "staff", label: "Meet the Teachers" },
  { id: "schedule", label: "Our Day" },
  { id: "gallery", label: "Gallery" },
  { id: "testimonials", label: "Parents Say" },
  { id: "questions", label: "FAQs" },
];

export default async function DaydreamsSitePage() {
  const [programs, staff, schedule, gallery, testimonials, siteSettings] = await Promise.all([
    getPrograms(),
    getStaff(),
    getSchedule(),
    getGallery(),
    getTestimonials(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      <SiteHeader brand="daydreams" sections={sections} bookingId="visit" bookingLabel="Book a Visit" />
      <main>
        <section className="relative min-h-[520px] overflow-hidden bg-brand-ink sm:min-h-[620px]">
          <HeroVideo src="/daydreams-hero-video.mp4" poster="/daydreams-hero-poster.webp" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/40 to-brand-ink/15" />
          <div className="relative z-10 mx-auto flex min-h-[520px] max-w-5xl flex-col justify-end px-6 pb-14 pt-16 sm:min-h-[620px] sm:pb-20">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Daydreams · Daycare &amp; early learning</p>
            <h1 className="font-baloo mt-4 text-5xl leading-[1.05] text-white sm:text-7xl">
              Little dreamers.
              <br />
              <span className="text-brand-lavender">Big discoveries.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              {siteSettings.tagline} A place to play, learn, and grow — with teachers who make every day special.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#visit" className="rounded-full bg-brand-pink-strong px-6 py-3 font-bold text-white hover:brightness-95">Book a Visit</a>
              <a href="#programs" className="rounded-full border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10">Explore Programs</a>
            </div>
            <Link href="/daydreams" className="mt-6 inline-block text-sm font-semibold text-white/90 underline underline-offset-4">
              Explore Daydreams as a game <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <div className="mx-auto max-w-5xl px-6 pb-4 pt-8 sm:pt-12">
          <div className="mt-12 flex flex-col gap-16">
            <section id="programs" className="scroll-mt-40">
              <h2 className="font-baloo text-2xl text-brand-ink">Programs</h2>
              <div className="mt-5">
                <ProgramsSection programs={programs} />
              </div>
            </section>

            <section id="staff" className="scroll-mt-40">
              <h2 className="font-baloo text-2xl text-brand-ink">Meet the Teachers</h2>
              <div className="mt-5">
                <StaffSection staff={staff} />
              </div>
            </section>

            <section id="schedule" className="scroll-mt-40">
              <h2 className="font-baloo text-2xl text-brand-ink">Our Day</h2>
              <div className="mt-5 max-w-md">
                <ScheduleSection schedule={schedule} />
              </div>
            </section>

            <section id="gallery" className="scroll-mt-40">
              <h2 className="font-baloo text-2xl text-brand-ink">Gallery</h2>
              <div className="mt-5">
                <GallerySection gallery={gallery} />
              </div>
            </section>

            <section id="testimonials" className="scroll-mt-40">
              <h2 className="font-baloo text-2xl text-brand-ink">Parents Say</h2>
              <div className="mt-5">
                <TestimonialsSection testimonials={testimonials} />
              </div>
            </section>

            <section id="visit" className="scroll-mt-40">
              <h2 className="font-baloo text-2xl text-brand-ink">Book a Visit</h2>
              <p className="mt-2 text-sm text-brand-ink/70">
                Tell us a bit about your family and we&apos;ll follow up to schedule a tour.
              </p>
              <div className="relative mt-5 max-w-xl">
                <BookAVisitForm
                  source="traditional-site"
                  turnstileSiteKey={process.env.TURNSTILE_SITE_KEY ?? ""}
                />
              </div>
            </section>
          </div>
        </div>
        <SiteFAQs
          settings={siteSettings}
          gettingStarted={
            <p>
              Fill out the <a href="#visit" className="font-semibold text-brand-lavender-strong underline">Book a Visit</a> form
              and we&apos;ll follow up to arrange a tour and talk about your family&apos;s needs.
            </p>
          }
        />
      </main>
      <SiteFooter settings={siteSettings} otherBrand={{ name: "Dumbbells", href: "/dumbbells" }} />
    </div>
  );
}
