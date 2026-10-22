import type { Program } from "@/lib/daydreams/types";

// The regular classes on the Dumbbells Weekly Activity Plan (docs/data).
export const classes: Program[] = [
  {
    id: "spin",
    title: "Spin",
    shortDescription: "High-energy rides in the dedicated spin room.",
    description:
      "Group cycling in our dedicated spin room, with great music and the push of riding together. Runs most days of the week.",
    ageRange: "All levels",
    accentColor: "#b3542e",
    src: "/dumbbells-premium/assets/class-sunrise.webp",
  },
  {
    id: "functional-crossfit",
    title: "Functional & CrossFit",
    shortDescription: "Full-body strength and conditioning.",
    description:
      "Coached sessions that build strength, power and fitness you can use outside the gym, from dumbbells and kettlebells to bodyweight work.",
    ageRange: "All levels",
    accentColor: "#c4214b",
    src: "/dumbbells-premium/assets/gym-floor.webp",
  },
  {
    id: "circuit",
    title: "Circuit",
    shortDescription: "Station to station, start to finish.",
    description: "A circuit around the gym floor mixing strength and cardio stations to work the whole body.",
    ageRange: "All levels",
    accentColor: "#7443a3",
    src: "/dumbbells-premium/assets/gym-machines.webp",
  },
  {
    id: "mobility",
    title: "Mobility",
    shortDescription: "Slow down, stretch out, move better.",
    description: "Mobility drills and stretching to keep the rest of your training comfortable and sustainable.",
    ageRange: "All levels",
    accentColor: "#a39093",
    src: "/dumbbells-premium/assets/class-mobility.webp",
  },
  {
    id: "prenatal-pilates",
    title: "Prenatal Pilates",
    shortDescription: "Gentle strength for mums-to-be.",
    description:
      "Pilates adapted for pregnancy. Needs at least 3 people, so book one day in advance.",
    ageRange: "Expecting mums",
    accentColor: "#8a3352",
  },
  {
    id: "zumba-barre",
    title: "Zumba & Barre",
    shortDescription: "Dance-led cardio and ballet-inspired toning.",
    description:
      "Weekly Zumba and Barre sessions. Each needs at least 3 people, so book one day in advance.",
    ageRange: "All levels",
    accentColor: "#4f3a63",
  },
];
