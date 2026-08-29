import Image from "next/image";
import type { Program } from "@/lib/daydreams/types";

export function ProgramsSection({ programs }: { programs: Program[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {programs.map((program) =>
        program.src ? (
          <div
            key={program.id}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-brand-ink/10 zone-dark:border-white/10"
          >
            <Image
              src={program.src}
              alt=""
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="text-lg font-bold text-white">{program.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                {program.ageRange}
              </p>
              <p className="mt-2 text-sm text-white/85">{program.shortDescription}</p>
            </div>
          </div>
        ) : (
          <div
            key={program.id}
            className="rounded-xl border border-brand-ink/10 bg-white p-5 zone-dark:border-white/10 zone-dark:bg-white/5"
            style={{ borderTopWidth: 4, borderTopColor: program.accentColor }}
          >
            <h3 className="text-lg font-bold text-brand-ink zone-dark:text-white">{program.title}</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/60 zone-dark:text-white/50">
              {program.ageRange}
            </p>
            <p className="mt-3 text-sm text-brand-ink/80 zone-dark:text-white/70">{program.description}</p>
          </div>
        ),
      )}
    </div>
  );
}
