import type { MetadataRoute } from "next";
import { getGymClasses, getPrograms } from "@/lib/daydreams/content";
import { absoluteUrl } from "@/lib/seo";

/**
 * Every indexable public page. Leaves out /daydreams (the 3D game — no
 * crawlable content, canonicalised to /daydreams/site), /site (a duplicate
 * chooser, canonicalised to /) and /admin.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, classes] = await Promise.all([getPrograms(), getGymClasses()]);

  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    changeFrequency: "monthly",
    priority,
  });

  return [
    page("/", 1),
    page("/daydreams/site", 0.9),
    page("/dumbbells", 0.9),
    page("/cafe", 0.7),
    ...programs.map((program) => page(`/daydreams/programs/${program.id}`, 0.8)),
    ...classes.map((gymClass) => page(`/dumbbells/classes/${gymClass.id}`, 0.8)),
    page("/dumbbells/privacy", 0.2),
    page("/dumbbells/terms", 0.2),
  ];
}
