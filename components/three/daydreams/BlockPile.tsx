"use client";

import { RigidBody } from "@react-three/rapier";
import { RoundedBox } from "@react-three/drei";

const BLOCK_COLORS = ["#f2789f", "#5fa8d3", "#f4b93e", "#9b5de5", "#2ec4b6"];
const BLOCK_SIZE = 0.32;

const BLOCK_OFFSETS: [number, number, number][] = [
  [-0.15, 0, -0.1],
  [0.15, 0, -0.1],
  [0, 0, 0.15],
  [-0.1, 0.32, 0],
  [0.12, 0.32, 0.05],
];

/**
 * A standalone pile of toy blocks — decorative and crashable, not wired to
 * any destination. Bumping it scatters the blocks via real Rapier
 * collision response, same mechanic the earlier crate piles used; it just
 * doesn't discover anything or open a panel.
 */
export function BlockPile({ position }: { position: [number, number] }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      {BLOCK_OFFSETS.map((offset, i) => (
        <RigidBody
          key={i}
          position={[offset[0], BLOCK_SIZE / 2 + offset[1], offset[2]]}
          colliders="cuboid"
          friction={0.6}
          restitution={0.15}
        >
          <RoundedBox args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} radius={0.05} smoothness={2}>
            <meshStandardMaterial color={BLOCK_COLORS[i % BLOCK_COLORS.length]} />
          </RoundedBox>
        </RigidBody>
      ))}
    </group>
  );
}
