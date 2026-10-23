import { DaydreamsGame } from "@/components/daydreams/DaydreamsGame";
import {
  getPrograms,
  getStaff,
  getSchedule,
  getGallery,
  getTestimonials,
} from "@/lib/daydreams/content";
import { OG_IMAGES, pageMetadata } from "@/lib/seo";

// The game has no crawlable content — search engines get /daydreams/site instead.
export const metadata = {
  ...pageMetadata({
    title: "Daydreams — Play the Game",
    description: "Drive around and discover what makes Daydreams daycare special.",
    path: "/daydreams",
    image: OG_IMAGES.daydreams,
    noIndex: true,
  }),
  alternates: { canonical: "/daydreams/site" },
};

export default async function DaydreamsPage() {
  const [programs, staff, schedule, gallery, testimonials] = await Promise.all([
    getPrograms(),
    getStaff(),
    getSchedule(),
    getGallery(),
    getTestimonials(),
  ]);

  return (
    <DaydreamsGame
      content={{ programs, staff, schedule, gallery, testimonials }}
      turnstileSiteKey={process.env.TURNSTILE_SITE_KEY ?? ""}
    />
  );
}
