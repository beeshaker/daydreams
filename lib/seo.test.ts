import { describe, it, expect, afterEach, vi } from "vitest";
import { siteSettings } from "@/content/fixtures/site-settings";

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_SITE_URL;

async function loadSeo(siteUrl?: string) {
  vi.resetModules();
  if (siteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  return import("./seo");
}

afterEach(() => {
  if (ORIGINAL_ENV === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_ENV;
});

describe("SITE_URL", () => {
  it("defaults to the production domain", async () => {
    const seo = await loadSeo();
    expect(seo.SITE_URL).toBe("https://daydreamsanddumbbells.com");
    expect(seo.IS_PRODUCTION_SITE).toBe(true);
  });

  it("treats any other origin as non-production and strips trailing slashes", async () => {
    const seo = await loadSeo("https://daydreams.whats2manage.com/");
    expect(seo.SITE_URL).toBe("https://daydreams.whats2manage.com");
    expect(seo.IS_PRODUCTION_SITE).toBe(false);
  });
});

describe("pageMetadata", () => {
  it("sets an absolute title, canonical, and matching Open Graph/Twitter fields", async () => {
    const { pageMetadata } = await loadSeo();
    const metadata = pageMetadata({ title: "Spin", description: "Ride.", path: "/dumbbells/classes/spin" });
    expect(metadata.title).toEqual({ absolute: "Spin" });
    expect(metadata.alternates).toEqual({ canonical: "/dumbbells/classes/spin" });
    expect(metadata.openGraph).toMatchObject({ title: "Spin", url: "/dumbbells/classes/spin", locale: "en_KE" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "Spin" });
    expect(metadata.robots).toBeUndefined();
  });

  it("marks pages noindex (but still followed) on request", async () => {
    const { pageMetadata } = await loadSeo();
    const metadata = pageMetadata({ title: "Game", description: "Play.", path: "/daydreams", noIndex: true });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});

describe("toE164", () => {
  it("converts local Kenyan numbers", async () => {
    const { toE164 } = await loadSeo();
    expect(toE164("0715 634 027")).toBe("+254715634027");
    expect(toE164("254715634027")).toBe("+254715634027");
    expect(toE164("+254 715 634 027")).toBe("+254715634027");
  });
});

describe("openingHoursSpecification", () => {
  it("expands day ranges, converts to 24h, and skips closed days", async () => {
    const { openingHoursSpecification } = await loadSeo();
    expect(openingHoursSpecification(siteSettings.hours)).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => `https://schema.org/${d}`),
        opens: "08:30",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["https://schema.org/Saturday"],
        opens: "09:00",
        closes: "13:00",
      },
    ]);
  });
});

describe("sitemap", () => {
  it("lists every public page, including one per program and class, and leaves out the game", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = (await sitemap()).map((entry) => entry.url.replace("https://daydreamsanddumbbells.com", ""));
    expect(urls).toEqual(
      expect.arrayContaining(["/", "/daydreams/site", "/dumbbells", "/daydreams/programs/wobblers", "/dumbbells/classes/spin"]),
    );
    expect(urls).not.toContain("/daydreams");
    expect(urls.some((url) => url.startsWith("/admin"))).toBe(false);
  });
});

describe("robots", () => {
  it("blocks all crawling outside production", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SITE_URL = "https://daydreams.whats2manage.com";
    const { default: robots } = await import("@/app/robots");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });
});
