import type { Program } from "@/lib/daydreams/types";

export const programs: Program[] = [
  {
    id: "wobblers",
    title: "Wobblers",
    shortDescription: "Gentle first steps into group play.",
    description:
      "A calm, low-stimulation room for our youngest friends, focused on sensory play, first words, and safe exploration alongside caring teachers.",
    ageRange: "6 months – 18 months",
    accentColor: "#F4A259",
    src: "/gallery/program-wobblers.webp",
  },
  {
    id: "explorers",
    title: "Explorers",
    shortDescription: "Curious toddlers on the move.",
    description:
      "Toddlers build independence through guided play, simple routines, and lots of climbing, stacking, and pretend adventures.",
    ageRange: "18 months – 3 years",
    accentColor: "#5FA8D3",
    src: "/gallery/program-explorers.webp",
  },
  {
    id: "dreambuilders",
    title: "Dreambuilders",
    shortDescription: "Pre-K prep with big imaginations.",
    description:
      "A structured-but-playful room that mixes early literacy, numbers, and cooperative games to get kids ready for kindergarten.",
    ageRange: "3 years – 5 years",
    accentColor: "#9B5DE5",
    src: "/gallery/program-dreambuilders.webp",
  },
];
