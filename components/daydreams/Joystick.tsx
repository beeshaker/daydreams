"use client";

import { useRef, useState } from "react";

const BASE_RADIUS = 48;

/**
 * On-screen virtual joystick for mobile driving: one drag gesture gives
 * forward/reverse (throttle) and left/right (steer), positioned so it never
 * overlaps the Explore menu and doesn't trigger page scroll while dragging.
 */
export function Joystick({
  onVector,
  onRelease,
}: {
  onVector: (x: number, y: number) => void;
  onRelease: () => void;
}) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const activePointerId = useRef<number | null>(null);

  function updateFromPointer(clientX: number, clientY: number) {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > BASE_RADIUS) {
      dx = (dx / distance) * BASE_RADIUS;
      dy = (dy / distance) * BASE_RADIUS;
    }

    setKnobOffset({ x: dx, y: dy });
    // Screen-down is positive dy; "up" on screen should mean forward.
    onVector(dx / BASE_RADIUS, -dy / BASE_RADIUS);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    activePointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (activePointerId.current !== event.pointerId) return;
    event.preventDefault();
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (activePointerId.current !== event.pointerId) return;
    activePointerId.current = null;
    setKnobOffset({ x: 0, y: 0 });
    onRelease();
  }

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="application"
      aria-label="Driving joystick"
      className="pointer-events-auto relative h-28 w-28 touch-none rounded-full bg-white/70 ring-1 ring-brand-ink/15"
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-lavender-strong shadow"
        style={{ transform: `translate(-50%, -50%) translate(${knobOffset.x}px, ${knobOffset.y}px)` }}
      />
    </div>
  );
}
