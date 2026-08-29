"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from "three";
import type { CameraConfig } from "@/lib/daydreams/destinationLayouts";
import { ROOM_HALF_DEPTH } from "./Room";

// Keeps the camera from trailing out past the room's open front edge (no
// wall there) when the mascot backs up close to it — otherwise the camera
// ends up outside the room looking down at the floor's bare edge and the
// empty void beyond it.
const MAX_CAMERA_Z = ROOM_HALF_DEPTH - 0.5;

// Higher = the camera catches up to the target faster (less lag, more snap).
const FOLLOW_SMOOTHING = 4;

/**
 * Angled chase camera that follows the mascot — keeps a constant distance
 * (the `camera.offset` from the layout) so it reads at a consistent,
 * legible size instead of shrinking to a dot as it walks away from a fixed
 * framing shot. Doesn't rotate with the mascot's heading (stays a fixed
 * world-space angle) — a rotating version was tried and reverted, since
 * for a small, already-fully-visible room the view swinging around as the
 * mascot turned read as disorienting rather than helpful.
 */
export function CameraRig({
  camera,
  targetPositionRef,
}: {
  camera: CameraConfig;
  targetPositionRef: RefObject<Vector3>;
}) {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const [offsetX, offsetY, offsetZ] = camera.offset;

  useFrame((_, deltaRaw) => {
    const cam = cameraRef.current;
    const targetPosition = targetPositionRef.current;
    if (!cam || !targetPosition) return;

    const delta = Math.min(deltaRaw, 0.05);
    const t = 1 - Math.exp(-FOLLOW_SMOOTHING * delta);

    const desiredZ = Math.min(targetPosition.z + offsetZ, MAX_CAMERA_Z);

    cam.position.x += (targetPosition.x + offsetX - cam.position.x) * t;
    cam.position.y += (offsetY - cam.position.y) * t;
    cam.position.z += (desiredZ - cam.position.z) * t;
    cam.lookAt(targetPosition.x, 0.6, targetPosition.z);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={camera.offset} fov={camera.fov} />;
}
