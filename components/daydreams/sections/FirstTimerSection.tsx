import type { FirstTimerStep } from "@/lib/daydreams/types";

export function FirstTimerSection({ steps }: { steps: FirstTimerStep[] }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="flex gap-4 rounded-xl border border-brand-ink/10 bg-white p-5 zone-dark:border-white/10 zone-dark:bg-white/5"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-lavender-strong text-sm font-bold text-white zone-dark:bg-brand-lavender"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <div>
            <h4 className="font-bold text-brand-ink zone-dark:text-white">{step.title}</h4>
            <p className="mt-1 text-sm text-brand-ink/80 zone-dark:text-white/70">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
