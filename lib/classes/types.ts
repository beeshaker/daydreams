export type Zone = "gym" | "daycare";

export type ClassTemplate = {
  id: string;
  zone: Zone;
  title: string;
  description?: string;
  dayOfWeek: number[]; // 0=Sun..6=Sat, recurring days this class runs
  startTime: string; // "HH:mm", 24h
  endTime: string; // "HH:mm", 24h
  capacity: number | null; // null = unlimited / display-only headcount
  active: boolean;
};

export type OccurrenceStatus = "scheduled" | "confirmed" | "cancelled" | "rescheduled";

export type OccurrenceReschedule = {
  fromDate: string; // "YYYY-MM-DD"
  fromStartTime: string;
  fromEndTime: string;
  changedAt: string; // ISO timestamp
};

export type ClassOccurrence = {
  id: string;
  templateId: string | null; // null = manually created one-off (admin-created)
  zone: Zone;
  title: string;
  description?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  capacity: number | null;
  status: OccurrenceStatus;
  rescheduleHistory: OccurrenceReschedule[];
  cancelledNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type NotificationChannel = "email" | "whatsapp";
export type NotificationDeliveryStatus = "sent" | "failed" | "skipped";
export type NotificationLogEntry = {
  changeType: "cancelled" | "rescheduled";
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  sentAt: string; // ISO timestamp
};

export type ClassSignup = {
  id: string;
  occurrenceId: string;
  zone: Zone;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  consent: boolean;
  createdAt: string;
  notifications: NotificationLogEntry[];
};
