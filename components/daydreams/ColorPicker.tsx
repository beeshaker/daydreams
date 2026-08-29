"use client";

// A distinct, vivid palette from the destination-identity colors
// (lib/daydreams/destinations.ts) — these are just paint, not tied to any
// destination's meaning.
export const SPRAY_COLORS = ["#ff5c8a", "#3ec1d3", "#a3e635", "#ff9f45", "#8a5cff", "#ffd23f"];

/**
 * Small swatch palette for the floor-painting toy (PaintableFloor.tsx) —
 * pick a color, then walking around sprays the floor with it.
 */
export function ColorPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-brand-ink/10">
      {SPRAY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          aria-label={`Paint color ${color}`}
          aria-pressed={selected === color}
          className={`h-7 w-7 shrink-0 rounded-full transition-transform ${
            selected === color ? "scale-110 ring-2 ring-brand-ink ring-offset-2" : ""
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
