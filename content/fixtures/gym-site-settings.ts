import type { SiteSettings } from "@/lib/daydreams/types";

export const gymSiteSettings: SiteSettings = {
  businessName: "Dumbbells",
  tagline: "Strength training for people with a life outside the gym.",
  address: "123 Play Street, Suite B, Springfield",
  phone: "(555) 010-2020",
  email: "hello@daydreamsanddumbbells.com",
  hours: [
    { day: "Monday – Friday", open: "5:00 AM", close: "9:00 PM" },
    { day: "Saturday – Sunday", open: "7:00 AM", close: "5:00 PM" },
  ],
};
