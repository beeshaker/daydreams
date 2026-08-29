import { destinations } from "@/lib/daydreams/destinations";
import type { DestinationId } from "@/lib/daydreams/types";
import { Star } from "./Star";

export function GameHUD({ discoveredDestinationIds }: { discoveredDestinationIds: DestinationId[] }) {
  const total = destinations.length;
  const discovered = discoveredDestinationIds.length;
  const percent = Math.round((discovered / total) * 100);

  return (
    <div className="pointer-events-auto flex w-56 flex-col gap-3">
      <div className="rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-brand-ink/10" role="status">
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5" aria-hidden="true">
            {destinations.map((destination) => (
              <Star key={destination.id} filled={discoveredDestinationIds.includes(destination.id)} size="sm" />
            ))}
          </div>
          <span className="text-xs font-bold text-brand-ink">
            {discovered} / {total}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-bg">
          <div
            className="h-full rounded-full bg-brand-mauve transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-brand-lavender-strong/10 p-3 text-xs text-brand-ink ring-1 ring-brand-lavender-strong/20">
        <p className="font-bold text-brand-lavender-strong">Collect every star!</p>
        <p className="mt-0.5 text-brand-ink/70">Walk to each spot to find its star.</p>
      </div>
    </div>
  );
}
