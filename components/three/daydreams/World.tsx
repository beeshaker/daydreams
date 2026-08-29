"use client";

import { Suspense, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { Physics } from "@react-three/rapier";
import { Mascot } from "./Mascot";
import { Room } from "./Room";
import { PaintableFloor } from "./PaintableFloor";
import { DestinationStation } from "./DestinationStation";
import { CameraRig } from "./CameraRig";
import { BlockPile } from "./BlockPile";
import { Football } from "./Football";
import { destinations } from "@/lib/daydreams/destinations";
import { destinationPositions, spawnPosition, type CameraConfig } from "@/lib/daydreams/destinationLayouts";
import type { DestinationId } from "@/lib/daydreams/types";
import type { WalkingInput } from "@/hooks/useWalkingInput";
import type { RefObject } from "react";

function PhysicsReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export function World({
  camera,
  inputRef,
  paused,
  discoveredDestinationIds,
  onEnterDestination,
  onPhysicsReady,
  sprayColor,
}: {
  camera: CameraConfig;
  inputRef: RefObject<WalkingInput>;
  paused: boolean;
  discoveredDestinationIds: DestinationId[];
  onEnterDestination: (id: DestinationId) => void;
  onPhysicsReady: () => void;
  sprayColor: string;
}) {
  const targetPositionRef = useRef(new Vector3(...spawnPosition));

  return (
    <>
      <CameraRig camera={camera} targetPositionRef={targetPositionRef} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 8, 3]} intensity={1.1} color="#fff1dc" />
      <directionalLight position={[-5, 5, -3]} intensity={0.4} color="#cfe3f5" />

      <Suspense fallback={null}>
        <Physics gravity={[0, -18, 0]}>
          <PhysicsReadySignal onReady={onPhysicsReady} />

          <Room />
          <PaintableFloor positionRef={targetPositionRef} color={sprayColor} />

          <Mascot
            inputRef={inputRef}
            paused={paused}
            spawnPosition={spawnPosition}
            positionRef={targetPositionRef}
          />

          {destinations.map((destination) => (
            <DestinationStation
              key={destination.id}
              destination={destination}
              position={destinationPositions[destination.id]}
              discovered={discoveredDestinationIds.includes(destination.id)}
              onEnterDestination={onEnterDestination}
            />
          ))}

          <BlockPile position={[-3, 1.6]} />
          <Football position={[3, 1.6]} />
        </Physics>
      </Suspense>
    </>
  );
}
