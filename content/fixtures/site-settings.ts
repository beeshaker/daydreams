import type { SiteSettings } from "@/lib/daydreams/types";

export const siteSettings: SiteSettings = {
  businessName: "Daydreams",
  tagline: "Where daydreams turn into big days.",
  address: "123 Play Street, Springfield",
  phone: "(555) 010-2020",
  email: "hello@daydreamsanddumbbells.com",
  hours: [
    { day: "Monday – Friday", open: "7:00 AM", close: "6:00 PM" },
    { day: "Saturday – Sunday", open: "Closed", close: "Closed" },
  ],
};
