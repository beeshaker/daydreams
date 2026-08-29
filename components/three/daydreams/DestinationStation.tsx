"use client";

import { memo, useCallback, useMemo, useRef, type ReactNode } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html, RoundedBox, useGLTF } from "@react-three/drei";
import type { IntersectionEnterPayload, IntersectionExitPayload } from "@react-three/rapier";
import type { Destination, DestinationId } from "@/lib/daydreams/types";

const SENSOR_HALF: [number, number, number] = [1, 1, 1];
const SENSOR_HEIGHT = 0.8;

function isMascot(payload: IntersectionEnterPayload | IntersectionExitPayload): boolean {
  return Boolean(payload.other.rigidBodyObject?.userData?.isMascot);
}

function FurniturePiece({
  url,
  offset,
  scale = 1.6,
}: {
  url: string;
  offset: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={model} position={offset} scale={scale} />;
}

const INK = "#1a1a1a";

/** Procedural tent — no good free CC0 match for this specific theme was found, so it's built from primitives like the rest of the pre-asset-pipeline geometry. */
function TentVisual({ color }: { color: string }) {
  return (
    <mesh position={[0, 0.6, 0]}>
      <coneGeometry args={[0.75, 1.2, 10]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/**
 * Procedural clock — same reasoning as the tent. Hands are nested in their
 * own rotated groups so each one pivots correctly around the clock's
 * center (the earlier version positioned boxes directly, which put their
 * pivot at the box's own center instead of the clock face's, reading as a
 * broken/illegible shape).
 */
function ClockVisual({ color }: { color: string }) {
  return (
    <group position={[0, 0.9, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.1, 24]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.02, 24]} />
        <meshStandardMaterial color="#f8f7f6" />
      </mesh>
      <group rotation={[0, 0, -Math.PI / 6]}>
        <mesh position={[0, 0.14, 0.1]}>
          <boxGeometry args={[0.05, 0.28, 0.02]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh position={[0, 0.2, 0.11]}>
          <boxGeometry args={[0.04, 0.4, 0.02]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.12]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color={INK} />
      </mesh>
    </group>
  );
}

/** Procedural picture frame on an easel stand — same reasoning as the tent/clock. */
function FrameVisual({ color }: { color: string }) {
  return (
    <group position={[0, 0, 0]} rotation={[0, 0.35, 0]}>
      <RoundedBox args={[0.9, 0.7, 0.08]} radius={0.05} smoothness={2} position={[0, 0.95, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <mesh position={[0, 0.95, 0.045]}>
        <boxGeometry args={[0.7, 0.5, 0.02]} />
        <meshStandardMaterial color="#f8f7f6" />
      </mesh>
      <mesh position={[-0.35, 0.35, 0.2]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.05, 0.9, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.35, 0.35, 0.2]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.05, 0.9, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

const STATION_VISUALS: Record<DestinationId, (color: string) => ReactNode> = {
  programs: (color) => <TentVisual color={color} />,
  staff: () => <FurniturePiece url="/models/furniture-kit/bookcaseOpen.glb" offset={[-0.4, 0, 0.25]} />,
  schedule: (color) => <ClockVisual color={color} />,
  gallery: (color) => <FrameVisual color={color} />,
  testimonials: () => <FurniturePiece url="/models/furniture-kit/benchCushion.glb" offset={[-0.4, 0, 0.2]} />,
  visit: () => <FurniturePiece url="/models/furniture-kit/doorway.glb" offset={[-0.25, 0, 0.075]} />,
};

/**
 * Memoized, and its two collider handlers are stable (useCallback), so
 * this only re-renders when its own props genuinely change (mainly its
 * one-time `discovered` flip) — not on every unrelated re-render of an
 * ancestor. That matters here specifically: @react-three/rapier
 * re-registers a CuboidCollider's sensor event handlers whenever those
 * handler props change identity, and an unmemoized component recreating
 * fresh inline closures on every render (e.g. every time `paused` toggles
 * when a content panel opens/closes) was causing that re-registration to
 * happen while the mascot was still standing inside the sensor —
 * surfacing a spurious extra "enter" the moment it next moved, even
 * without a real exit-then-re-entry. See DaydreamsGame.tsx's
 * handleEnterDestination for the other half of this stabilization.
 */
export const DestinationStation = memo(function DestinationStation({
  destination,
  position,
  discovered,
  onEnterDestination,
}: {
  destination: Destination;
  position: [number, number];
  discovered: boolean;
  onEnterDestination: (id: DestinationId) => void;
}) {
  const isInsideRef = useRef(false);

  const handleIntersectionEnter = useCallback(
    (payload: IntersectionEnterPayload) => {
      if (!isMascot(payload) || isInsideRef.current) return;
      isInsideRef.current = true;
      onEnterDestination(destination.id);
    },
    [onEnterDestination, destination.id],
  );

  const handleIntersectionExit = useCallback((payload: IntersectionExitPayload) => {
    if (!isMascot(payload)) return;
    isInsideRef.current = false;
  }, []);

  return (
    <RigidBody type="fixed" position={[position[0], 0, position[1]]} colliders={false}>
      <CuboidCollider
        args={SENSOR_HALF}
        position={[0, SENSOR_HEIGHT, 0]}
        sensor
        onIntersectionEnter={handleIntersectionEnter}
        onIntersectionExit={handleIntersectionExit}
      />

      {STATION_VISUALS[destination.id](destination.color)}

      <Html
        position={[0, 1.9, 0]}
        center
        distanceFactor={9}
        occlude={false}
        style={{ pointerEvents: "none" }}
      >
        <span
          className="whitespace-nowrap rounded-lg border-2 bg-brand-bg px-2.5 py-1 text-xs font-bold text-brand-ink shadow-md"
          style={{ borderColor: destination.color }}
        >
          {destination.blockLabel}
          {discovered && " ✓"}
        </span>
      </Html>
    </RigidBody>
  );
});

useGLTF.preload("/models/furniture-kit/bookcaseOpen.glb");
useGLTF.preload("/models/furniture-kit/benchCushion.glb");
useGLTF.preload("/models/furniture-kit/doorway.glb");
