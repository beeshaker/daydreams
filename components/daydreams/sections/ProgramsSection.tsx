import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Program } from "@/lib/daydreams/types";

/**
 * `hrefFor` turns each card into a link to that program's own page — the
 * traditional site passes it; the game's content panel doesn't, so players
 * aren't navigated out of the game.
 */
export function ProgramsSection({
  programs,
  hrefFor,
}: {
  programs: Program[];
  hrefFor?: (id: string) => string;
}) {
  function card(program: Program, className: string, children: ReactNode, style?: CSSProperties) {
    const href = hrefFor?.(program.id);
    return href ? (
      <Link key={program.id} href={href} className={`${className} block`} style={style}>
        {children}
      </Link>
    ) : (
      <div key={program.id} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {programs.map((program) =>
        program.src
          ? card(
              program,
              "group relative aspect-[4/5] overflow-hidden rounded-xl border border-brand-ink/10 zone-dark:border-white/10",
              <>
                <Image
                  src={program.src}
                  alt={`The ${program.title} room`}
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
                  {hrefFor && (
                    <p className="mt-3 text-sm font-semibold text-white underline underline-offset-4">
                      More about {program.title} <span aria-hidden="true">→</span>
                    </p>
                  )}
                </div>
              </>,
            )
          : card(
              program,
              "rounded-xl border border-brand-ink/10 bg-white p-5 zone-dark:border-white/10 zone-dark:bg-white/5",
              <>
                <h3 className="text-lg font-bold text-brand-ink zone-dark:text-white">{program.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/60 zone-dark:text-white/50">
                  {program.ageRange}
                </p>
                <p className="mt-3 text-sm text-brand-ink/80 zone-dark:text-white/70">{program.description}</p>
              </>,
              { borderTopWidth: 4, borderTopColor: program.accentColor },
            ),
      )}
    </div>
  );
}
