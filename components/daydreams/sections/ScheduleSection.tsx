import type { ScheduleDay } from "@/lib/daydreams/types";

export function ScheduleSection({ schedule }: { schedule: ScheduleDay[] }) {
  return (
    <div className="@container">
      <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
        {schedule.map((day) => (
          <div
            key={day.day}
            className="overflow-hidden rounded-xl border border-brand-ink/10 bg-white zone-dark:border-white/10 zone-dark:bg-white/5"
          >
            <h3 className="border-b border-brand-ink/10 px-5 py-3 font-bold text-brand-ink zone-dark:border-white/10 zone-dark:text-white">
              {day.day}
            </h3>
            <ul className="divide-y divide-brand-ink/10 zone-dark:divide-white/10">
              {day.sessions.map((block) => (
                <li key={block.id} className="flex flex-col gap-0.5 px-5 py-2.5">
                  <span className="text-xs font-semibold text-brand-lavender-strong zone-dark:text-brand-lavender">
                    {block.time}
                  </span>
                  <span className="text-sm text-brand-ink/80 zone-dark:text-white/70">{block.activity}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-brand-ink/60 zone-dark:text-white/50">
        Activities may be swapped between days or time slots depending on the children&apos;s interests, the weather and
        the day&apos;s routine.
      </p>
    </div>
  );
}
