'use client';

import React, { useRef } from 'react';
import { track } from '@/lib/game/track';
import { useTicker } from '@/lib/game/useTicker';
import { world } from '@/lib/game/sim/world';
import { useGameStore } from '@/lib/game/store';

const W = 132;
const H = 164;
const DPR = 2;
// Zoom factor: 1 world unit (0.1m) maps to ~0.08 canvas pixels (~80m view ahead)
const ZOOM = 0.082;

/**
 * Zoomed Player-Centered Dynamic GPS Minimap (matching user's uploaded reference):
 * - Rotates with vehicle heading so driving direction is always facing UP
 * - Centered on player vehicle
 * - Shows local road curves, edges, and centerline with high clarity
 * - Player marker: yellow chevron pointing straight UP
 * - Competitor cars: cyan/blue dots along the track
 * - Top-left chip with current position (e.g. 2/24)
 */
export function Minimap() {
  const ref = useRef<HTMLCanvasElement>(null);
  const position = useGameStore((s) => s.hud.position || 1);
  const carCount = useGameStore((s) => s.hud.carCount || 20);

  useTicker(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const player = world.player;
    if (!player) return;
    const me = player.phys;
    const T = track.current;
    if (!T || !T.px) return;

    const N = T.N;
    const px = me.x;
    const py = me.y;
    const heading = me.a;
    const curIdx = me.idx ?? 0;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Apply player-centered Track-Up transform
    // Player is positioned at (W / 2, H * 0.65) so more road is visible ahead
    ctx.save();
    ctx.translate(W / 2, H * 0.65);
    ctx.rotate(-heading - Math.PI / 2);
    ctx.scale(ZOOM, ZOOM);
    ctx.translate(-px, -py);

    // 1. Draw local track road edges (Left & Right boundaries)
    const rangeBehind = 60;
    const rangeAhead = 160;
    const from = curIdx - rangeBehind;
    const to = curIdx + rangeAhead;

    // Left road edge
    ctx.beginPath();
    for (let i = from; i <= to; i += 2) {
      const k = ((i % N) + N) % N;
      const hw = T.halfWidth ? T.halfWidth[k] || 65 : 65;
      const nx = T.nx ? T.nx[k] : 0;
      const ny = T.ny ? T.ny[k] : 0;
      const lx = T.px[k] - nx * hw;
      const ly = T.py[k] - ny * hw;
      if (i === from) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Right road edge
    ctx.beginPath();
    for (let i = from; i <= to; i += 2) {
      const k = ((i % N) + N) % N;
      const hw = T.halfWidth ? T.halfWidth[k] || 65 : 65;
      const nx = T.nx ? T.nx[k] : 0;
      const ny = T.ny ? T.ny[k] : 0;
      const rx = T.px[k] + nx * hw;
      const ry = T.py[k] + ny * hw;
      if (i === from) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 18;
    ctx.stroke();

    // 2. Center bright white road line
    ctx.beginPath();
    for (let i = from; i <= to; i += 2) {
      const k = ((i % N) + N) % N;
      if (i === from) ctx.moveTo(T.px[k], T.py[k]);
      else ctx.lineTo(T.px[k], T.py[k]);
    }
    // Dark shadow casing on center road line
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.lineWidth = 42;
    ctx.stroke();

    // Solid white road line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 26;
    ctx.stroke();

    // 3. Competitor cars: light-blue / cyan dots along the track
    for (let c = 0; c < world.cars.length; c++) {
      const other = world.cars[c];
      if (other.isPlayer) continue;

      const op = other.phys;
      const dx = op.x - px;
      const dy = op.y - py;
      const dist = Math.hypot(dx, dy);

      // Only render cars within local ~110m radar radius
      if (dist < 1150) {
        ctx.beginPath();
        ctx.arc(op.x, op.y, 44, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8'; // Vibrant light blue / cyan matching reference
        ctx.fill();
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#05070b';
        ctx.stroke();
      }
    }

    ctx.restore();

    // 4. Player vehicle: Yellow chevron fixed at center facing straight UP
    ctx.save();
    ctx.translate(W / 2, H * 0.65);

    // Chevron drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw yellow chevron arrow
    ctx.beginPath();
    ctx.moveTo(0, -9.5);
    ctx.lineTo(8.5, 5);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(0, -1.5);
    ctx.lineTo(-4.5, 5);
    ctx.lineTo(-8.5, 5);
    ctx.closePath();

    ctx.fillStyle = '#FFD60A';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    ctx.restore();
  });

  return (
    <div className="absolute top-4 left-5 z-20 flex flex-col items-center select-none pointer-events-none font-sans">
      {/* Zoomed GPS Radar - 100% Transparent, No Background */}
      <div
        className="w-[132px] h-[164px] relative flex items-center justify-center bg-transparent"
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.9)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.95))',
        }}
      >
        {/* Canvas Radar View */}
        <canvas ref={ref} width={W * DPR} height={H * DPR} style={{ width: W, height: H }} />
      </div>
    </div>
  );
}
