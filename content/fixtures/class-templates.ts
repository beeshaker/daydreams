import type { ClassTemplate } from "@/lib/classes/types";

const WEEKDAYS = [1, 2, 3, 4, 5];

/**
 * Bookable class templates for both zones, keyed by weekday recurrence.
 * `ensureUpcomingOccurrences` expands these into dated `ClassOccurrence`
 * records. Gym entries mirror the activities/times in
 * `content/fixtures/gym-schedule.ts` (kept in sync manually — that file
 * stays display-only and untouched); daycare entries are a small set of
 * actually-bookable sessions distinct from the "Our Day" schedule.
 */
export const classTemplates: ClassTemplate[] = [
  {
    id: "gym-sunrise-spin",
    zone: "gym",
    title: "Sunrise Spin",
    description: "Rhythm-driven cardio to start the day right.",
    dayOfWeek: WEEKDAYS,
    startTime: "06:00",
    endTime: "07:00",
    capacity: 18,
    active: true,
  },
  {
    id: "gym-strength-foundations-am",
    zone: "gym",
    title: "Strength Foundations",
    description: "Barbell basics, built the right way.",
    dayOfWeek: WEEKDAYS,
    startTime: "07:00",
    endTime: "08:00",
    capacity: 12,
    active: true,
  },
  {
    id: "gym-mobility-recovery-am",
    zone: "gym",
    title: "Mobility & Recovery",
    description: "Slow down, stretch out, move better.",
    dayOfWeek: WEEKDAYS,
    startTime: "09:00",
    endTime: "09:45",
    capacity: 15,
    active: true,
  },
  {
    id: "gym-hiit-lunch-express",
    zone: "gym",
    title: "HIIT Bootcamp (Lunch Express)",
    description: "High-energy intervals that torch calories fast.",
    dayOfWeek: WEEKDAYS,
    startTime: "12:00",
    endTime: "12:45",
    capacity: 16,
    active: true,
  },
  {
    id: "gym-hiit-bootcamp-pm",
    zone: "gym",
    title: "HIIT Bootcamp",
    description: "High-energy intervals that torch calories fast.",
    dayOfWeek: WEEKDAYS,
    startTime: "17:30",
    endTime: "18:15",
    capacity: 20,
    active: true,
  },
  {
    id: "gym-strength-foundations-pm",
    zone: "gym",
    title: "Strength Foundations",
    description: "Barbell basics, built the right way.",
    dayOfWeek: WEEKDAYS,
    startTime: "18:30",
    endTime: "19:30",
    capacity: 12,
    active: true,
  },
  {
    id: "gym-mobility-recovery-pm",
    zone: "gym",
    title: "Mobility & Recovery",
    description: "Slow down, stretch out, move better.",
    dayOfWeek: WEEKDAYS,
    startTime: "19:30",
    endTime: "20:15",
    capacity: 15,
    active: true,
  },
  {
    id: "daycare-story-time",
    zone: "daycare",
    title: "Story Time",
    description: "A cozy read-aloud session with songs and puppets.",
    dayOfWeek: WEEKDAYS,
    startTime: "10:00",
    endTime: "10:30",
    capacity: 10,
    active: true,
  },
  {
    id: "daycare-open-play",
    zone: "daycare",
    title: "Open Play",
    description: "Drop-in supervised play in our indoor play space.",
    dayOfWeek: WEEKDAYS,
    startTime: "15:00",
    endTime: "16:00",
    capacity: 15,
    active: true,
  },
  {
    id: "daycare-weekend-family",
    zone: "daycare",
    title: "Weekend Family Session",
    description: "A parent-and-child session for play, crafts, and connection.",
    dayOfWeek: [6],
    startTime: "10:00",
    endTime: "11:30",
    capacity: 20,
    active: true,
  },
];
