'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { world } from '@/lib/game/sim/world';
import { surfaceHeight, surfaceIndex } from '@/lib/game/track/surface';
import { renderPose, type Pose } from '@/lib/game/sim/interp';

interface TagData {
  id: number;
  name: string;
  avatarSeed: number;
  dist: number;
  x: number;
  y: number;
  z: number;
}

const scratchPose: Pose = { x: 0, y: 0, a: 0 };
const scratchVec = new THREE.Vector3();
const camDir = new THREE.Vector3();

// Diverse stylized portrait avatars for rival drivers (matching Wreckfest reference)
const AVATAR_COLORS = [
  ['#FF7A18', '#FF2E9A'],
  ['#19E3FF', '#7B4DFF'],
  ['#B6FF3B', '#19E3FF'],
  ['#FFD60A', '#FF7A18'],
  ['#FF4D5E', '#FF7A18'],
  ['#00E5FF', '#00B0FF'],
];

/**
 * In-world floating driver markers above nearby rival cars (Wreckfest reference style).
 * Shows a circular portrait avatar with white border + uppercase driver name underneath.
 */
export function DriverNametags() {
  const { camera } = useThree();
  const [visibleTags, setVisibleTags] = React.useState<TagData[]>([]);
  const lastUpdate = useRef(0);

  useFrame((state) => {
    if (world.phase !== 'racing' && world.phase !== 'finished') {
      if (visibleTags.length > 0) setVisibleTags([]);
      return;
    }

    // Throttle to 30Hz for performance
    const now = state.clock.getElapsedTime();
    if (now - lastUpdate.current < 0.033) return;
    lastUpdate.current = now;

    const player = world.player;
    if (!player) return;

    renderPose(player, world.alpha, scratchPose);
    const px = scratchPose.x;
    const pz = scratchPose.y;

    camera.getWorldDirection(camDir);

    const candidates: TagData[] = [];

    for (let i = 0; i < world.cars.length; i++) {
      const car = world.cars[i];
      if (car.isPlayer) continue;

      renderPose(car, world.alpha, scratchPose);
      const cx = scratchPose.x;
      const cz = scratchPose.y;

      const dx = cx - px;
      const dz = cz - pz;
      const dist = Math.hypot(dx, dz);

      // Show markers for cars within 160m in front of the player
      if (dist > 1600 || dist < 15) continue;

      scratchVec.set(cx - camera.position.x, 0, cz - camera.position.z).normalize();
      if (scratchVec.dot(camDir) < 0.15) continue; // Behind camera

      const p = car.phys;
      const cy = (p.idx !== undefined ? surfaceHeight(surfaceIndex(p.idx, cx, cz), 0) : 0) + 18;

      candidates.push({
        id: car.id,
        name: car.driver.name.toUpperCase(),
        avatarSeed: (car.id * 7 + 3) % AVATAR_COLORS.length,
        dist,
        x: cx,
        y: cy,
        z: cz,
      });
    }

    candidates.sort((a, b) => a.dist - b.dist);
    setVisibleTags(candidates.slice(0, 5));
  });

  if (visibleTags.length === 0) return null;

  return (
    <group name="driver-nametags">
      {visibleTags.map((tag) => {
        const grad = AVATAR_COLORS[tag.avatarSeed];
        return (
          <Html
            key={tag.id}
            position={[tag.x, tag.y, tag.z]}
            center
            distanceFactor={40}
            zIndexRange={[100, 0]}
          >
            <div className="flex flex-col items-center select-none pointer-events-none transition-transform duration-75">
              {/* Circular Avatar with White Ring Border */}
              <div
                className="w-7 h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.85)',
                }}
              >
                {/* Stylized Driver Silhouette Icon */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current drop-shadow">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Bold Uppercase Driver Name */}
              <span
                className="text-xs font-black font-sans uppercase tracking-wider text-white whitespace-nowrap mt-1 leading-none"
                style={{
                  textShadow:
                    '0 2px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9), 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                }}
              >
                {tag.name}
              </span>
            </div>
          </Html>
        );
      })}
    </group>
  );
}
