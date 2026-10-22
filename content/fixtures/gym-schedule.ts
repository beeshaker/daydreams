import type { ScheduleDay } from "@/lib/daydreams/types";

// From the Dumbbells Weekly Activity Plan (docs/data). Not shown on the site
// any more; it feeds the voice agent's knowledge-base seed. Classes marked
// "book ahead" need at least 3 people and booking one day in advance.
export const gymSchedule: ScheduleDay[] = [
  {
    day: "Monday",
    sessions: [
      { id: "gmon-1", time: "9:00 AM", activity: "Spin" },
      { id: "gmon-2", time: "10:00 AM", activity: "Prenatal Pilates (book ahead)" },
      { id: "gmon-3", time: "11:30 AM", activity: "PRS (book ahead)" },
      { id: "gmon-4", time: "1:30 PM", activity: "Circuit" },
      { id: "gmon-5", time: "2:30 PM", activity: "Spin" },
      { id: "gmon-6", time: "3:30 PM", activity: "Mobility" },
    ],
  },
  {
    day: "Tuesday",
    sessions: [
      { id: "gtue-1", time: "9:00 AM", activity: "Zumba with Aarti (book ahead)" },
      { id: "gtue-2", time: "10:00 AM", activity: "Spin" },
      { id: "gtue-3", time: "11:30 AM", activity: "PRS (book ahead)" },
      { id: "gtue-4", time: "1:30 PM", activity: "Functional" },
      { id: "gtue-5", time: "2:30 PM", activity: "CrossFit" },
      { id: "gtue-6", time: "3:30 PM", activity: "Spin" },
    ],
  },
  {
    day: "Wednesday",
    sessions: [
      { id: "gwed-1", time: "9:00 AM", activity: "Spin" },
      { id: "gwed-2", time: "10:00 AM", activity: "Mobility" },
      { id: "gwed-3", time: "11:30 AM", activity: "PRS (book ahead)" },
      { id: "gwed-4", time: "1:30 PM", activity: "CrossFit" },
      { id: "gwed-5", time: "2:30 PM", activity: "Functional" },
      { id: "gwed-6", time: "3:30 PM", activity: "Spin" },
    ],
  },
  {
    day: "Thursday",
    sessions: [
      { id: "gthu-1", time: "9:00 AM", activity: "Spin" },
      { id: "gthu-2", time: "10:00 AM", activity: "Functional" },
      { id: "gthu-3", time: "11:30 AM", activity: "PRS (book ahead)" },
      { id: "gthu-4", time: "1:30 PM", activity: "Circuit" },
      { id: "gthu-5", time: "2:00 PM", activity: "Barre (book ahead)" },
      { id: "gthu-6", time: "2:30 PM", activity: "Mobility" },
      { id: "gthu-7", time: "3:30 PM", activity: "Spin" },
    ],
  },
  {
    day: "Friday",
    sessions: [
      { id: "gfri-1", time: "9:00 AM", activity: "Feet Up (book ahead)" },
      { id: "gfri-2", time: "10:00 AM", activity: "Spin" },
      { id: "gfri-3", time: "11:30 AM", activity: "PRS (book ahead)" },
      { id: "gfri-4", time: "1:30 PM", activity: "Mobility" },
      { id: "gfri-5", time: "2:30 PM", activity: "CrossFit" },
      { id: "gfri-6", time: "3:30 PM", activity: "Spin" },
    ],
  },
  {
    day: "Saturday",
    sessions: [
      { id: "gsat-1", time: "9:00 AM", activity: "Spin" },
      { id: "gsat-2", time: "10:00 AM", activity: "Mobility / PRS" },
    ],
  },
];
