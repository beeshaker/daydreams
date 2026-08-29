"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { Group, Vector3 } from "three";
import type { WalkingInput } from "@/hooks/useWalkingInput";

const WALK_SPEED = 3.2;
const TURN_RATE = 12; // rad/s — how fast the character re-faces its move direction, not a physical turning radius.
const BOB_FREQUENCY = 9;
const BOB_AMOUNT = 0.035;
const TILT_AMOUNT = 0.08;

const FUR = "#a8703f";
const FUR_LIGHT = "#e0b27e";
const INK = "#2b2140";

/**
 * Fully procedural teddy-bear mascot — replaces an earlier vendored GLTF
 * (character-a.glb) that rendered completely invisibly in the browser
 * (a runtime external-texture load failure the offline render-preview
 * pipeline had no way to catch, since it validates via a different loading
 * path than the browser's GLTFLoader). Rounded primitives have no external
 * asset dependency at all, so there's nothing left that can silently fail
 * to load for the single most important object in the scene.
 */
export function Mascot({
  inputRef,
  paused,
  spawnPosition,
  positionRef,
}: {
  inputRef: RefObject<WalkingInput>;
  paused: boolean;
  spawnPosition: [number, number, number];
  positionRef: RefObject<Vector3>;
}) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const visualRef = useRef<Group>(null);
  const facingRef = useRef(0);

  useFrame((state, deltaRaw) => {
    const body = bodyRef.current;
    if (!body) return;

    const delta = Math.min(deltaRaw, 0.05);
    const t = body.translation();
    positionRef.current?.set(t.x, t.y, t.z);

    if (paused) {
      body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true);
      return;
    }

    const { x, z } = inputRef.current;
    const magnitude = Math.hypot(x, z);
    let moving = false;

    if (magnitude > 0.05) {
      moving = true;
      const nx = x / magnitude;
      const nz = z / magnitude;
      const speed = Math.min(magnitude, 1) * WALK_SPEED;
      const v = body.linvel();
      body.setLinvel({ x: nx * speed, y: v.y, z: nz * speed }, true);

      // Face the movement direction — snappy re-facing is expected for a
      // walking character, unlike a car's real turning radius.
      const targetFacing = Math.atan2(nx, nz);
      let diff = targetFacing - facingRef.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest angular path
      facingRef.current += diff * Math.min(1, TURN_RATE * delta);
      body.setRotation(
        { x: 0, y: Math.sin(facingRef.current / 2), z: 0, w: Math.cos(facingRef.current / 2) },
        true,
      );
    } else {
      const v = body.linvel();
      body.setLinvel({ x: 0, y: v.y, z: 0 }, true);
    }

    const visual = visualRef.current;
    if (visual) {
      if (moving) {
        const bob = Math.sin(state.clock.elapsedTime * BOB_FREQUENCY);
        visual.position.y = Math.abs(bob) * BOB_AMOUNT;
        visual.rotation.z = bob * TILT_AMOUNT;
      } else {
        visual.position.y = 0;
        visual.rotation.z = 0;
      }
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={spawnPosition}
      colliders="cuboid"
      friction={0.7}
      restitution={0}
      linearDamping={0.5}
      angularDamping={1}
      enabledRotations={[false, true, false]}
      userData={{ isMascot: true }}
    >
      <group ref={visualRef}>
        {/* legs */}
        <mesh position={[-0.14, 0.1, 0.02]} castShadow={false}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={FUR} />
        </mesh>
        <mesh position={[0.14, 0.1, 0.02]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={FUR} />
        </mesh>

        {/* body */}
        <mesh position={[0, 0.34, 0]} scale={[1, 1.15, 0.95]}>
          <sphereGeometry args={[0.28, 20, 20]} />
          <meshStandardMaterial color={FUR} />
        </mesh>

        {/* arms */}
        <mesh position={[-0.32, 0.38, 0.03]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={FUR} />
        </mesh>
        <mesh position={[0.32, 0.38, 0.03]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={FUR} />
        </mesh>

        {/* head */}
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.23, 20, 20]} />
          <meshStandardMaterial color={FUR} />
        </mesh>

        {/* ears */}
        <mesh position={[-0.16, 0.92, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={FUR} />
        </mesh>
        <mesh position={[0.16, 0.92, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={FUR} />
        </mesh>

        {/* snout */}
        <mesh position={[0, 0.67, 0.19]} scale={[1, 0.85, 1.1]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={FUR_LIGHT} />
        </mesh>

        {/* nose */}
        <mesh position={[0, 0.7, 0.3]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={INK} />
        </mesh>

        {/* eyes */}
        <mesh position={[-0.08, 0.77, 0.19]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        <mesh position={[0.08, 0.77, 0.19]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
    </RigidBody>
  );
}
