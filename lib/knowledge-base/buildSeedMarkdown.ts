import {
  getPrograms,
  getStaff,
  getSchedule,
  getSiteSettings,
  getGymClasses,
  getTrainers,
  getGymSchedule,
  getGymSiteSettings,
} from "@/lib/daydreams/content";
import type { ScheduleDay } from "@/lib/daydreams/types";

function formatHours(hours: { day: string; open: string; close: string }[]): string {
  return hours
    .map((block) => `- ${block.day}: ${block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}`)
    .join("\n");
}

function formatWeek(week: ScheduleDay[]): string {
  return week
    .map((day) => `- ${day.day}: ${day.sessions.map((s) => `${s.time} ${s.activity}`).join("; ")}`)
    .join("\n");
}

/**
 * Assembled at seed-time from the same fixture getters the site itself
 * reads, so this document can't silently drift from what's actually
 * published. A one-time bootstrap for the ElevenLabs knowledge base — after
 * the initial seed, further edits happen live through /admin/kb, not by
 * re-running this.
 */
export async function buildSeedMarkdown(): Promise<string> {
  const [
    daydreamsSettings,
    programs,
    staff,
    daydreamsSchedule,
    gymSettings,
    gymClasses,
    trainers,
    gymSchedule,
  ] = await Promise.all([
    getSiteSettings(),
    getPrograms(),
    getStaff(),
    getSchedule(),
    getGymSiteSettings(),
    getGymClasses(),
    getTrainers(),
    getGymSchedule(),
  ]);

  return `# Daydreams & Dumbbells

A gym and a daycare, under one roof.

## Daydreams (daycare)

${daydreamsSettings.tagline}

Address: ${daydreamsSettings.address}
Phone: ${daydreamsSettings.phones.join(" / ")}
Email: ${daydreamsSettings.email}

Hours:
${formatHours(daydreamsSettings.hours)}

### Programs

${programs
  .map((program) => `- **${program.title}** (${program.ageRange}): ${program.description}`)
  .join("\n")}

### Teachers

${staff.map((member) => `- **${member.name}**, ${member.role}: ${member.bio}`).join("\n")}

### Weekly activity plan

${formatWeek(daydreamsSchedule)}

## Dumbbells (gym)

${gymSettings.tagline}

Address: ${gymSettings.address}
Phone: ${gymSettings.phones.join(" / ")}
Email: ${gymSettings.email}

Hours:
${formatHours(gymSettings.hours)}

### Classes

${gymClasses
  .map((gymClass) => `- **${gymClass.title}** (${gymClass.ageRange}): ${gymClass.description}`)
  .join("\n")}

### Trainers

${trainers.map((trainer) => `- **${trainer.name}**, ${trainer.role}: ${trainer.bio}`).join("\n")}

### Weekly class plan

${formatWeek(gymSchedule)}
`;
}
