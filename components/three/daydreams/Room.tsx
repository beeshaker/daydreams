"use client";

import { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { RoundedBox, useGLTF } from "@react-three/drei";

export const ROOM_HALF_WIDTH = 4.5;
export const ROOM_HALF_DEPTH = 3.5;
const WALL_HEIGHT = 2.6;
const WALL_THICKNESS = 0.2;
// How far the floor visually continues past the open front edge. The
// rotating chase-camera (CameraRig.tsx) can end up looking back out
// through that missing 4th wall — e.g. at the mascot's idle facing — and
// without this the floor just stops in mid-air, revealing the app's flat
// background color right at the edge. Purely a visual backdrop: the
// mascot can't reach this far (the invisible front-edge collider below
// stops it well before ROOM_HALF_DEPTH), so it needs no collider of its
// own.
const FLOOR_APRON_DEPTH = 3;

/**
 * Floor and walls are simple procedural boxes rather than tiled Kenney
 * furniture-kit wall/floor pieces — those pieces use a corner-relative
 * origin convention that would need real alignment tuning to tile
 * correctly, which isn't verifiable without a browser. The single
 * `rugRectangle.glb` instance carries the "real asset" look for the floor
 * without any tiling risk, since it's placed once, not repeated.
 */
export function Room() {
  const { scene } = useGLTF("/models/furniture-kit/rugRectangle.glb");
  const rug = useMemo(() => scene.clone(true), [scene]);

  const width = ROOM_HALF_WIDTH * 2;
  const depth = ROOM_HALF_DEPTH * 2;

  return (
    <group>
      <mesh position={[0, -0.06, ROOM_HALF_DEPTH + FLOOR_APRON_DEPTH / 2]}>
        <boxGeometry args={[width, 0.08, FLOOR_APRON_DEPTH]} />
        <meshStandardMaterial color="#e3c28f" />
      </mesh>

      <primitive
        object={rug}
        position={[-2.2, 0.001, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={2.6}
      />

      {/* Back wall */}
      <RoundedBox
        args={[width + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]}
        radius={0.04}
        smoothness={2}
        position={[0, WALL_HEIGHT / 2, -ROOM_HALF_DEPTH]}
      >
        <meshStandardMaterial color="#bfe3f0" />
      </RoundedBox>
      {/* Left wall */}
      <RoundedBox
        args={[WALL_THICKNESS, WALL_HEIGHT, depth + WALL_THICKNESS]}
        radius={0.04}
        smoothness={2}
        position={[-ROOM_HALF_WIDTH, WALL_HEIGHT / 2, 0]}
      >
        <meshStandardMaterial color="#bfe3f0" />
      </RoundedBox>
      {/* Right wall */}
      <RoundedBox
        args={[WALL_THICKNESS, WALL_HEIGHT, depth + WALL_THICKNESS]}
        radius={0.04}
        smoothness={2}
        position={[ROOM_HALF_WIDTH, WALL_HEIGHT / 2, 0]}
      >
        <meshStandardMaterial color="#bfe3f0" />
      </RoundedBox>
      {/* Front stays open — the camera looks into the room from this side. */}

      {/* Corner posts at the back-wall seams — softens the sharp triangular
          artifact where flat walls meet at a right angle in-frame. Purely
          decorative: they sit exactly on top of the existing wall
          colliders, so no extra physics body is needed. */}
      <mesh position={[-ROOM_HALF_WIDTH, WALL_HEIGHT / 2, -ROOM_HALF_DEPTH]}>
        <cylinderGeometry args={[0.14, 0.14, WALL_HEIGHT, 16]} />
        <meshStandardMaterial color="#a9d4e6" />
      </mesh>
      <mesh position={[ROOM_HALF_WIDTH, WALL_HEIGHT / 2, -ROOM_HALF_DEPTH]}>
        <cylinderGeometry args={[0.14, 0.14, WALL_HEIGHT, 16]} />
        <meshStandardMaterial color="#a9d4e6" />
      </mesh>

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[width / 2, 0.05, depth / 2]} position={[0, -0.05, 0]} friction={0.9} />
        <CuboidCollider
          args={[width / 2 + WALL_THICKNESS / 2, WALL_HEIGHT / 2, WALL_THICKNESS / 2]}
          position={[0, WALL_HEIGHT / 2, -ROOM_HALF_DEPTH]}
        />
        <CuboidCollider
          args={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, depth / 2 + WALL_THICKNESS / 2]}
          position={[-ROOM_HALF_WIDTH, WALL_HEIGHT / 2, 0]}
        />
        <CuboidCollider
          args={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, depth / 2 + WALL_THICKNESS / 2]}
          position={[ROOM_HALF_WIDTH, WALL_HEIGHT / 2, 0]}
        />
        {/* Invisible collider on the open front side — no wall mesh (the
            camera looks into the room from here), but the mascot still
            needs a real boundary or it walks straight off the un-walled
            edge and falls indefinitely with no floor to land on (there's
            no fall-off-and-respawn mechanic here, unlike the old outdoor
            island). Caught by actually walking backward in a browser, not
            by type-checking or a build. */}
        <CuboidCollider
          args={[width / 2 + WALL_THICKNESS / 2, WALL_HEIGHT / 2, WALL_THICKNESS / 2]}
          position={[0, WALL_HEIGHT / 2, ROOM_HALF_DEPTH]}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload("/models/furniture-kit/rugRectangle.glb");
