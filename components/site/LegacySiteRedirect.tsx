"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const destinations = new Map([
  ["#daydreams", "/daydreams/site"],
  ["#programs", "/daydreams/site#programs"],
  ["#staff", "/daydreams/site#staff"],
  ["#schedule", "/daydreams/site#schedule"],
  ["#gallery", "/daydreams/site#gallery"],
  ["#testimonials", "/daydreams/site#testimonials"],
  ["#visit", "/daydreams/site#visit"],
  ["#dumbbells", "/dumbbells"],
  ["#classes", "/dumbbells#classes"],
  ["#trainers", "/dumbbells#trainers"],
  ["#dumbbells-schedule", "/dumbbells#schedule"],
  ["#dumbbells-gallery", "/dumbbells#gallery"],
  ["#dumbbells-testimonials", "/dumbbells#testimonials"],
  ["#join", "/dumbbells#join"],
]);

/** URL fragments only reach the browser, so old bookmarks are resolved here. */
export function LegacySiteRedirect() {
  const router = useRouter();

  useEffect(() => {
    function followLegacyLink() {
      const destination = destinations.get(window.location.hash);
      if (!destination) return;

      const [pathname, hash] = destination.split("#");
      router.replace(`${pathname}${window.location.search}${hash ? `#${hash}` : ""}`);
    }

    followLegacyLink();
    window.addEventListener("hashchange", followLegacyLink);
    return () => window.removeEventListener("hashchange", followLegacyLink);
  }, [router]);

  return null;
}
