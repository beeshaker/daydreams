"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { World } from "@/components/three/daydreams/World";
import { GameHUD } from "./GameHUD";
import { DestinationMenu } from "./DestinationMenu";
import { TraditionalToggle } from "./TraditionalToggle";
import { Joystick } from "./Joystick";
import { ContentPanel, type DaydreamsContent } from "./ContentPanel";
import { CelebrationBanner } from "./CelebrationBanner";
import { ColorPicker, SPRAY_COLORS } from "./ColorPicker";
import { useWalkingInput } from "@/hooks/useWalkingInput";
import { getCamera, type Breakpoint } from "@/lib/daydreams/destinationLayouts";
import { destinations } from "@/lib/daydreams/destinations";
import type { DestinationId, DaydreamsGameState } from "@/lib/daydreams/types";
import { trackEvent } from "@/lib/analytics";

const CELEBRATION_DURATION_MS = 5000;

const MOBILE_BREAKPOINT_QUERY = "(max-width: 639px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function DaydreamsGame({ content }: { content: DaydreamsContent }) {
  const { inputRef, setJoystickVector, releaseJoystick } = useWalkingInput();

  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [gameState, setGameState] = useState<DaydreamsGameState>({
    status: "loading",
    activeDestinationId: null,
    discoveredDestinationIds: [],
    reducedMotion: false,
  });
  const gameStartTrackedRef = useRef(false);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const celebrationTrackedRef = useRef(false);
  const [sprayColor, setSprayColor] = useState(SPRAY_COLORS[0]);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    function syncBreakpoint() {
      setBreakpoint(mobileQuery.matches ? "mobile" : "desktop");
    }
    function syncReducedMotion() {
      setGameState((state) => ({ ...state, reducedMotion: reducedMotionQuery.matches }));
    }

    syncBreakpoint();
    syncReducedMotion();
    mobileQuery.addEventListener("change", syncBreakpoint);
    reducedMotionQuery.addEventListener("change", syncReducedMotion);
    return () => {
      mobileQuery.removeEventListener("change", syncBreakpoint);
      reducedMotionQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  const camera = useMemo(() => getCamera(breakpoint), [breakpoint]);

  // A stable reference matters here, not just style: it's passed down
  // through World.tsx to DestinationStation.tsx's sensor collider event
  // handlers, and @react-three/rapier re-registers those on every render
  // where the handler prop's identity changes — including unrelated
  // renders like `paused` flipping back to false the instant a panel
  // closes. That re-registration was surfacing a spurious re-trigger the
  // moment the mascot moved again while still standing inside a sensor.
  const handleEnterDestination = useCallback((id: DestinationId) => {
    setGameState((state) => ({
      ...state,
      status: "panel-open",
      activeDestinationId: id,
      discoveredDestinationIds: state.discoveredDestinationIds.includes(id)
        ? state.discoveredDestinationIds
        : [...state.discoveredDestinationIds, id],
    }));
    trackEvent(`destination_${id}_opened`);
    if (id === "visit") trackEvent("lead_started");
  }, []);

  function handleClosePanel() {
    setGameState((state) => ({ ...state, status: "playing", activeDestinationId: null }));
  }

  const handlePhysicsReady = useCallback(() => {
    setGameState((state) => (state.status === "loading" ? { ...state, status: "playing" } : state));
    if (!gameStartTrackedRef.current) {
      gameStartTrackedRef.current = true;
      trackEvent("daydreams_game_started");
    }
  }, []);

  const paused = gameState.status !== "playing";
  const allStarsCollected = gameState.discoveredDestinationIds.length >= destinations.length;
  const showCelebration = allStarsCollected && !celebrationDismissed;

  useEffect(() => {
    if (!allStarsCollected || celebrationTrackedRef.current) return;
    celebrationTrackedRef.current = true;
    trackEvent("all_stars_collected");
  }, [allStarsCollected]);

  useEffect(() => {
    if (!showCelebration) return;
    const timer = setTimeout(() => setCelebrationDismissed(true), CELEBRATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showCelebration]);

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-brand-bg">
      <Canvas dpr={[1, 1.5]}>
        <World
          camera={camera}
          inputRef={inputRef}
          paused={paused}
          discoveredDestinationIds={gameState.discoveredDestinationIds}
          onEnterDestination={handleEnterDestination}
          onPhysicsReady={handlePhysicsReady}
          sprayColor={sprayColor}
        />
      </Canvas>

      {gameState.status === "loading" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-brand-bg">
          <p className="text-brand-ink">Loading Daydreams…</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-10 p-4 sm:p-6">
        <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-2 shadow-md sm:left-6 sm:top-6">
          <p className="text-base font-extrabold leading-none text-brand-lavender-strong">
            Daydreams<span className="text-brand-pink-strong"> & Dumbbells</span>
          </p>
        </div>

        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <TraditionalToggle prominent={gameState.reducedMotion} />
        </div>

        <div className="absolute right-4 top-20 flex flex-col items-end gap-3 sm:right-6 sm:top-24">
          <DestinationMenu
            discoveredDestinationIds={gameState.discoveredDestinationIds}
            onSelect={handleEnterDestination}
          />
          <GameHUD discoveredDestinationIds={gameState.discoveredDestinationIds} />
        </div>

        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
          <ColorPicker selected={sprayColor} onSelect={setSprayColor} />
        </div>

        {breakpoint === "mobile" && (
          <div className="absolute bottom-4 left-4">
            <Joystick
              onVector={(x, forwardAmount) => setJoystickVector(x, -forwardAmount)}
              onRelease={releaseJoystick}
            />
          </div>
        )}
      </div>

      <ContentPanel
        destinationId={gameState.activeDestinationId}
        content={content}
        onClose={handleClosePanel}
      />

      {showCelebration && <CelebrationBanner onDismiss={() => setCelebrationDismissed(true)} />}
    </div>
  );
}
