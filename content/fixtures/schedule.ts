import type { ScheduleDay } from "@/lib/daydreams/types";

// From the Daydreams Weekly Activity Plan (docs/data). Activities can be
// swapped between days or slots depending on the children, the weather and
// the day's routine.
export const schedule: ScheduleDay[] = [
  {
    day: "Monday",
    sessions: [
      { id: "mon-1", time: "9:00 – 10:00 AM", activity: "Art & crafts" },
      { id: "mon-2", time: "11:30 AM – 12:30 PM", activity: "Messy play" },
      { id: "mon-3", time: "12:30 – 2:30 PM", activity: "Play pod" },
      { id: "mon-4", time: "2:30 – 3:30 PM", activity: "Play pod" },
      { id: "mon-5", time: "3:30 – 4:30 PM", activity: "Music & movement" },
    ],
  },
  {
    day: "Tuesday",
    sessions: [
      { id: "tue-1", time: "9:00 – 10:00 AM", activity: "Sensory exploration" },
      { id: "tue-2", time: "11:30 AM – 12:30 PM", activity: "Puppetry & storytelling" },
      { id: "tue-3", time: "12:30 – 2:30 PM", activity: "Mud pit exploration" },
      { id: "tue-4", time: "2:30 – 3:30 PM", activity: "Art & crafts" },
      { id: "tue-5", time: "3:30 – 4:30 PM", activity: "Yoga & movement" },
    ],
  },
  {
    day: "Wednesday",
    sessions: [
      { id: "wed-1", time: "9:00 – 10:00 AM", activity: "Play pod" },
      { id: "wed-2", time: "11:30 AM – 12:30 PM", activity: "Play pod" },
      { id: "wed-3", time: "12:30 – 2:30 PM", activity: "Fine motor skills" },
      { id: "wed-4", time: "2:30 – 3:30 PM", activity: "Sensory exploration" },
      { id: "wed-5", time: "3:30 – 4:30 PM", activity: "Storytelling" },
    ],
  },
  {
    day: "Thursday",
    sessions: [
      { id: "thu-1", time: "9:00 – 10:00 AM", activity: "Music & movement" },
      { id: "thu-2", time: "11:30 AM – 12:30 PM", activity: "Art & crafts" },
      { id: "thu-3", time: "12:30 – 2:30 PM", activity: "Science exploration" },
      { id: "thu-4", time: "2:30 – 3:30 PM", activity: "Gross motor skills" },
      { id: "thu-5", time: "3:30 – 4:30 PM", activity: "Art & crafts" },
    ],
  },
  {
    day: "Friday",
    sessions: [
      { id: "fri-1", time: "9:00 – 10:00 AM", activity: "Puppetry & storytelling" },
      { id: "fri-2", time: "11:30 AM – 12:30 PM", activity: "Sensory exploration" },
      { id: "fri-3", time: "12:30 – 2:30 PM", activity: "Disco & dance" },
      { id: "fri-4", time: "2:30 – 3:30 PM", activity: "Music & movement" },
    ],
  },
  {
    day: "Saturday",
    sessions: [
      { id: "sat-1", time: "9:00 – 10:00 AM", activity: "Play pod" },
      { id: "sat-2", time: "11:30 AM – 12:30 PM", activity: "Play pod" },
    ],
  },
];
