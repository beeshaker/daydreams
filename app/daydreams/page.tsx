import { DaydreamsGame } from "@/components/daydreams/DaydreamsGame";
import {
  getPrograms,
  getStaff,
  getSchedule,
  getGallery,
  getTestimonials,
} from "@/lib/daydreams/content";

export const metadata = {
  title: "Daydreams — Play",
  description: "Drive around and discover what makes Daydreams daycare special.",
};

export default async function DaydreamsPage() {
  const [programs, staff, schedule, gallery, testimonials] = await Promise.all([
    getPrograms(),
    getStaff(),
    getSchedule(),
    getGallery(),
    getTestimonials(),
  ]);

  return <DaydreamsGame content={{ programs, staff, schedule, gallery, testimonials }} />;
}
