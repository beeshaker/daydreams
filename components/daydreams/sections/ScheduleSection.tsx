import type { ScheduleBlock } from "@/lib/daydreams/types";

export function ScheduleSection({ schedule }: { schedule: ScheduleBlock[] }) {
  return (
    <ul className="divide-y divide-brand-ink/10 overflow-hidden rounded-xl border border-brand-ink/10 bg-white zone-dark:divide-white/10 zone-dark:border-white/10 zone-dark:bg-white/5">
      {schedule.map((block) => (
        <li key={block.id} className="flex items-baseline justify-between gap-4 px-5 py-3">
          <span className="text-sm font-semibold text-brand-lavender-strong zone-dark:text-brand-lavender">{block.time}</span>
          <span className="text-right text-sm text-brand-ink/80 zone-dark:text-white/70">{block.activity}</span>
        </li>
      ))}
    </ul>
  );
}
