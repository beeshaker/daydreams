"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, type MeshStandardMaterial, type Vector3 } from "three";
import { ROOM_HALF_WIDTH, ROOM_HALF_DEPTH } from "./Room";

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = Math.round(CANVAS_WIDTH * (ROOM_HALF_DEPTH / ROOM_HALF_WIDTH));
const BASE_COLOR = "#e3c28f";
const STAMP_RADIUS_PX = 22;
// World-unit distance the mascot must move before another stamp is drawn —
// dense enough for an unbroken-looking trail at walking speed without
// re-uploading the texture to the GPU every single frame while barely
// moving or standing still.
const MIN_STAMP_DISTANCE = 0.15;

function createFloorTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = BASE_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const texture = new CanvasTexture(canvas);
  // Map canvas rows directly to V (no implicit vertical flip) so the u/v
  // formula below is the only place orientation is decided.
  texture.flipY = false;
  return texture;
}

/**
 * The room's floor, painted by the mascot as it walks — Splatoon-style
 * coverage from movement, not an aim/shoot mechanic. Replaces the plain
 * flat-color floor mesh that used to live directly in Room.tsx (still
 * responsible for walls, colliders, rug, and the floor apron).
 *
 * Uses a plain PlaneGeometry (not RoundedBox) specifically because its
 * default UV mapping is simple and known, unlike a rounded box's — that
 * predictability is what the world-position-to-canvas-pixel math below
 * depends on.
 *
 * The texture is created and attached to the material imperatively inside
 * a mount-only useEffect, and read/mutated only inside useFrame — never
 * during render — because this project's lint config forbids mutating
 * any value read directly in a component's render body or JSX (including
 * useMemo/useState results), even from within useFrame. Refs mutated
 * exclusively outside the render phase (effects, the animation loop) are
 * the one pattern it accepts, matching how every other file's useFrame
 * logic in this project already works.
 */
export function PaintableFloor({
  positionRef,
  color,
}: {
  positionRef: RefObject<Vector3>;
  color: string;
}) {
  const materialRef = useRef<MeshStandardMaterial>(null);
  const textureRef = useRef<CanvasTexture | null>(null);
  const lastStampRef = useRef<{ x: number; z: number } | null>(null);
  const colorRef = useRef(color);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const texture = createFloorTexture();
    textureRef.current = texture;
    if (materialRef.current) {
      materialRef.current.map = texture;
      materialRef.current.needsUpdate = true;
    }
    return () => {
      texture.dispose();
    };
  }, []);

  const width = ROOM_HALF_WIDTH * 2;
  const depth = ROOM_HALF_DEPTH * 2;

  useFrame(() => {
    const texture = textureRef.current;
    const pos = positionRef.current;
    if (!texture || !pos) return;

    const last = lastStampRef.current;
    if (last && Math.hypot(pos.x - last.x, pos.z - last.z) < MIN_STAMP_DISTANCE) return;
    lastStampRef.current = { x: pos.x, z: pos.z };

    // A plane rotated -90deg about X to lie flat maps local +Y (V=1, the
    // "top" of the unrotated plane) to world -Z, so V runs from 0 at the
    // open front edge (+Z) to 1 at the back wall (-Z); U runs directly
    // with world X since that rotation doesn't touch it.
    const u = (pos.x + ROOM_HALF_WIDTH) / width;
    const v = (ROOM_HALF_DEPTH - pos.z) / depth;

    const ctx = (texture.image as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = colorRef.current;
    ctx.beginPath();
    ctx.arc(u * CANVAS_WIDTH, v * CANVAS_HEIGHT, STAMP_RADIUS_PX, 0, Math.PI * 2);
    ctx.fill();
    texture.needsUpdate = true;
  });

  return (
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial ref={materialRef} color={BASE_COLOR} />
    </mesh>
  );
}
