"use client";

const STAR_GOLD = "#f4b93e";

function BigStar() {
  return (
    <svg viewBox="0 0 20 20" className="h-10 w-10" style={{ fill: STAR_GOLD }}>
      <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
    </svg>
  );
}

/**
 * One-shot celebration once every destination's star has been collected —
 * triggered from DaydreamsGame.tsx. A non-blocking toast, not a modal: it
 * doesn't pause the game or trap focus, just celebrates and fades.
 */
export function CelebrationBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4">
      <div className="animate-celebration-in pointer-events-auto flex flex-col items-center gap-2 rounded-3xl bg-white/95 px-8 py-6 text-center shadow-2xl ring-1 ring-brand-ink/10">
        <BigStar />
        <p className="text-xl font-extrabold text-brand-lavender-strong">Congrats, you&apos;ve sparkled today!</p>
        <p className="text-sm text-brand-ink/70">You found every star in Daydreams.</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-1 rounded-full bg-brand-pink-strong px-5 py-2 text-sm font-bold text-white hover:brightness-105"
        >
          Keep playing
        </button>
      </div>
    </div>
  );
}
