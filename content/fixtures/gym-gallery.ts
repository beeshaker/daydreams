import type { GalleryImage } from "@/lib/daydreams/types";

export const gymGallery: GalleryImage[] = [
  {
    id: "gg1",
    alt: "Morning bootcamp mid-circuit",
    category: "Bootcamp",
    accentColor: "#c4214b",
    src: "/gallery/dumbbells-bootcamp.webp",
  },
  {
    id: "gg2",
    alt: "Barbell platform during a strength session",
    category: "Strength",
    accentColor: "#7443a3",
    src: "/gallery/dumbbells-strength.webp",
  },
  {
    id: "gg3",
    alt: "Stretching circle after a mobility class",
    category: "Mobility",
    accentColor: "#a39093",
    src: "/gallery/dumbbells-mobility.webp",
  },
  {
    id: "gg4",
    alt: "Sunrise spin class lit by string lights",
    category: "Spin",
    accentColor: "#b3542e",
    src: "/gallery/dumbbells-spin.webp",
  },
  {
    id: "gg5",
    alt: "Trainer spotting a deadlift",
    category: "Coaching",
    accentColor: "#8a3352",
    src: "/gallery/dumbbells-coaching.webp",
  },
  // No image yet — deliberately left without src to exercise the color-block fallback.
  { id: "gg6", alt: "Members high-fiving after a workout", category: "Community", accentColor: "#4f3a63" },
];
