export type DestinationId =
  | "programs"
  | "staff"
  | "schedule"
  | "gallery"
  | "testimonials"
  | "visit";

export type Destination = {
  id: DestinationId;
  label: string;
  blockLabel: string;
  /** Drives both the 3D building's color and the Explore menu row's accent. */
  color: string;
};

export type Program = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  ageRange: string;
  accentColor: string;
  /** Falls back to accentColor as a flat card treatment when absent. */
  src?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  accentColor: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  relation: string;
};

export type GalleryImage = {
  id: string;
  alt: string;
  category: string;
  accentColor: string;
  /** Falls back to the accentColor swatch treatment when absent. */
  src?: string;
};

export type ScheduleBlock = {
  id: string;
  time: string;
  activity: string;
};

export type SiteHours = {
  day: string;
  open: string;
  close: string;
};

export type SiteSettings = {
  businessName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  hours: SiteHours[];
};

export type DaydreamsGameStatus = "loading" | "playing" | "paused" | "panel-open";

export type DaydreamsGameState = {
  status: DaydreamsGameStatus;
  activeDestinationId: DestinationId | null;
  discoveredDestinationIds: DestinationId[];
  reducedMotion: boolean;
};

export type DestinationTriggerState = {
  isInside: boolean;
  canTrigger: boolean;
};

export type LeadSource = "game" | "traditional-site" | "voice-agent";

export type LeadType = "daycare-interest" | "gym-interest";

export type LeadPayload = {
  leadType: LeadType;
  source: LeadSource;
  parentName: string;
  email: string;
  phone?: string;
  childAge?: string;
  preferredContact?: string;
  message?: string;
  consent: boolean;
  /** Honeypot field — must stay empty; non-empty means a bot filled the form. */
  companyWebsite?: string;
};
