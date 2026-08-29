"use client";

import { useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
import { CanvasTexture } from "three";

const BALL_RADIUS = 0.22;
const TEXTURE_SIZE = 256;
const GRID_CELLS = 8;

function createCheckerTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  ctx.fillStyle = "#2b2140";
  const cell = TEXTURE_SIZE / GRID_CELLS;
  for (let row = 0; row < GRID_CELLS; row++) {
    for (let col = 0; col < GRID_CELLS; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Standalone kickable ball — a dynamic Rapier body unconnected to any
 * destination, with real collision response off the mascot and the block
 * pile. The checkered look comes from a canvas texture drawn at runtime,
 * not an external image file — no asset to get wrong or fail to load.
 */
export function Football({ position }: { position: [number, number] }) {
  const texture = useMemo(() => createCheckerTexture(), []);

  return (
    <RigidBody
      position={[position[0], BALL_RADIUS, position[1]]}
      colliders="ball"
      friction={0.4}
      restitution={0.55}
      linearDamping={0.4}
      angularDamping={0.3}
    >
      <mesh>
        <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </RigidBody>
  );
}
