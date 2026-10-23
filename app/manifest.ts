import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "D&D",
    description: "A daycare and a gym under one roof in Nairobi.",
    start_url: "/",
    display: "browser",
    background_color: "#f8f7f6",
    theme_color: "#f8f7f6",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
