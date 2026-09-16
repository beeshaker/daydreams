import type { SiteSettings } from "@/lib/daydreams/types";

export const siteSettings: SiteSettings = {
  businessName: "Daydreams",
  tagline: "Where daydreams turn into big days.",
  address: "41 Gurviellia Grove, Nairobi",
  phone: "0180 117040",
  email: "daydreamsanddumbbells@gmail.com",
  hours: [
    { day: "Monday – Friday", open: "8:30 AM", close: "6:00 PM" },
    { day: "Saturday", open: "9:00 AM", close: "1:00 PM" },
    { day: "Sunday", open: "Closed", close: "Closed" },
  ],
  instagramUrl: "https://www.instagram.com/daydreamsanddumbbells/",
};
