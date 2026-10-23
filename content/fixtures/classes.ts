import type { Program } from "@/lib/daydreams/types";

// The regular classes on the Dumbbells Weekly Activity Plan (docs/data).
export const classes: Program[] = [
  {
    id: "spin",
    seoDescription:
      "Spin classes in Nairobi at Dumbbells: high-energy group cycling in a dedicated spin room, with sessions most days of the week for every fitness level.",
    longDescription:
      "Our spin room is a dedicated cycling space built for high-energy rides, great music and the push you only get from riding with a group. Every rider sets their own resistance, so the same class works whether it's your first ride or your hundredth.\n\nThere are spin sessions most days of the week, morning and afternoon, so it's easy to fit a ride around school runs and work. And if you have little ones, Daydreams is right next door.",
    highlights: [
      "A dedicated spin room with music and lighting built for riding",
      "You set your own resistance, so every level is welcome",
      "Morning and afternoon sessions most days",
      "Coached by our Dumbbells team",
    ],
    scheduleActivities: ["Spin"],
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
    seoDescription:
      "Functional training and CrossFit-style classes in Nairobi at Dumbbells: coached full-body strength and conditioning with dumbbells, kettlebells and bodyweight.",
    longDescription:
      "Functional and CrossFit sessions build the kind of strength you actually use: lifting your kids, carrying shopping, getting up off the floor without thinking about it. Expect dumbbells, kettlebells and bodyweight work, coached so you learn to move well before you move heavy.\n\nEvery movement can be scaled up or down, so beginners and experienced lifters train side by side. Our head coach, James, has 10 years in the fitness industry and knows how to meet you where you are.",
    highlights: [
      "Full-body strength and conditioning",
      "Dumbbells, kettlebells and bodyweight movements",
      "Every exercise scaled to your level",
      "Coaching on technique, not just counting reps",
    ],
    scheduleActivities: ["Functional", "CrossFit"],
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
    seoDescription:
      "Circuit training classes in Nairobi at Dumbbells: move station to station around the gym floor, mixing strength and cardio for a full-body workout.",
    longDescription:
      "Circuit moves you station to station around the gym floor, mixing strength and cardio so the whole body gets worked and the time flies. Each station is short and focused, and a coach keeps the group moving and your form honest.\n\nIt's a great first class if you're new to the gym — you'll try a bit of everything and learn your way around the equipment.",
    highlights: [
      "Strength and cardio stations around the gym floor",
      "Short, focused work intervals",
      "A great introduction to the gym's equipment",
      "Suitable for all levels",
    ],
    scheduleActivities: ["Circuit"],
    title: "Circuit",
    shortDescription: "Station to station, start to finish.",
    description: "A circuit around the gym floor mixing strength and cardio stations to work the whole body.",
    ageRange: "All levels",
    accentColor: "#7443a3",
    src: "/dumbbells-premium/assets/gym-machines.webp",
  },
  {
    id: "mobility",
    seoDescription:
      "Mobility and stretching classes in Nairobi at Dumbbells: slow down, open up tight hips and shoulders, and keep the rest of your training comfortable.",
    longDescription:
      "Mobility is the class that makes all the others feel better. We slow things down with mobility drills, stretching and foam rolling to open up tight hips, backs and shoulders — the places that take the strain from desk work, lifting and carrying little ones.\n\nCome on its own as a gentler session, or add it to your week to keep your strength and spin training comfortable and sustainable.",
    highlights: [
      "Mobility drills, stretching and foam rolling",
      "Focus on hips, back and shoulders",
      "A gentler session for any fitness level",
      "Pairs well with strength and spin training",
    ],
    scheduleActivities: ["Mobility"],
    title: "Mobility",
    shortDescription: "Slow down, stretch out, move better.",
    description: "Mobility drills and stretching to keep the rest of your training comfortable and sustainable.",
    ageRange: "All levels",
    accentColor: "#a39093",
    src: "/dumbbells-premium/assets/class-mobility.webp",
  },
  {
    id: "prenatal-pilates",
    seoDescription:
      "Prenatal Pilates in Nairobi at Dumbbells: gentle, pregnancy-safe Pilates for mums-to-be. Small group class — book one day in advance.",
    longDescription:
      "Prenatal Pilates is gentle strength for mums-to-be: Pilates adapted for pregnancy to support your posture, core, pelvic floor and breathing as your body changes.\n\nIt runs as a small group and needs at least 3 people, so please book one day in advance. Our recovery room also offers prenatal and postnatal treatments if you'd like to pair your class with some time to rest.",
    highlights: [
      "Pilates adapted for each stage of pregnancy",
      "Posture, core, pelvic floor and breathing",
      "Small group — at least 3 people",
      "Book one day in advance",
    ],
    scheduleActivities: ["Prenatal Pilates"],
    title: "Prenatal Pilates",
    shortDescription: "Gentle strength for mums-to-be.",
    description:
      "Pilates adapted for pregnancy. Needs at least 3 people, so book one day in advance.",
    ageRange: "Expecting mums",
    accentColor: "#8a3352",
  },
  {
    id: "zumba-barre",
    seoDescription:
      "Zumba and Barre classes in Nairobi at Dumbbells: dance-led cardio and ballet-inspired toning every week. Book one day in advance.",
    longDescription:
      "Zumba is dance-led cardio that feels more like a party than a workout. Barre borrows from ballet for small, controlled movements that tone and strengthen. Together they make a fun, low-impact way to move every week.\n\nEach class needs at least 3 people, so please book one day in advance.",
    highlights: [
      "Zumba: dance-led, high-energy cardio",
      "Barre: ballet-inspired toning and balance",
      "Low impact and beginner-friendly",
      "Book one day in advance (at least 3 people)",
    ],
    scheduleActivities: ["Zumba", "Barre"],
    title: "Zumba & Barre",
    shortDescription: "Dance-led cardio and ballet-inspired toning.",
    description:
      "Weekly Zumba and Barre sessions. Each needs at least 3 people, so book one day in advance.",
    ageRange: "All levels",
    accentColor: "#4f3a63",
  },
];
