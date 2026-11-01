'use client';

import React, { useEffect, useRef } from 'react';
import { track } from '@/lib/game/track';
import { useTicker } from '@/lib/game/useTicker';
import { world } from '@/lib/game/sim/world';

const W = 124;
const H = 124;
const PAD = 12;
const DPR = 2;

function bounds() {
  const { minX: a, maxX: b, minY: c, maxY: d } = track.current.bounds;
  const s = Math.min((W - PAD * 2) / (b - a), (H - PAD * 2) / (d - c));
  return { s, ox: W / 2 - ((a + b) / 2) * s, oy: H / 2 - ((c + d) / 2) * s };
}

let B = bounds();
const px = (x: number) => x * B.s + B.ox;
const py = (y: number) => y * B.s + B.oy;

/** Clean circular track ribbon with soft shadow casing, drawn once in monochrome. */
function drawStatic(): HTMLCanvasElement {
  const T = track.current;
  const N = T.N;
  B = bounds();
  const cv = document.createElement('canvas');
  cv.width = W * DPR;
  cv.height = H * DPR;
  const ctx = cv.getContext('2d');
  if (!ctx) return cv;
  ctx.scale(DPR, DPR);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const path = (from: number, to: number) => {
    ctx.beginPath();
    for (let i = from; i <= to; i += 2) {
      const k = i % N;
      if (i === from) ctx.moveTo(px(T.px[k]), py(T.py[k]));
      else ctx.lineTo(px(T.px[k]), py(T.py[k]));
    }
  };

  // Outer dark shadow casing
  path(0, N);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Core bright white track ribbon
  path(0, N);
  ctx.closePath();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.6;
  ctx.stroke();

  // Start / finish tick perpendicular to the track
  const dx = px(T.px[1]) - px(T.px[0]);
  const dy = py(T.py[1]) - py(T.py[0]);
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(px(T.px[0]) - nx * 5, py(T.py[0]) - ny * 5);
  ctx.lineTo(px(T.px[0]) + nx * 5, py(T.py[0]) + ny * 5);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  return cv;
}

/**
 * Top-Left Circular Minimap Radar (placed at the top-left, nothing at the bottom):
 * - Circular dark translucent radar disk with white border ring
 * - Pure white circuit ribbon
 * - Yellow heading chevron for player car
 * - White dots for competitor cars
 * - Key hints underneath: [ C ] CAM   [ V ] MIRROR
 */
export function Minimap() {
  const ref = useRef<HTMLCanvasElement>(null);
  const base = useRef<HTMLCanvasElement | null>(null);

  const trackId = track.current.meta.id;
  useEffect(() => {
    base.current = drawStatic();
  }, [trackId]);

  useTicker(() => {
    const cv = ref.current;
    const bg = base.current;
    if (!cv || !bg) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bg, 0, 0, W, H);

    // AI & competitor cars: clean crisp dots
    for (const car of world.cars) {
      if (car.isPlayer) continue;
      const cx = px(car.phys.x);
      const cy = py(car.phys.y);
      ctx.beginPath();
      ctx.arc(cx, cy, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#05070b';
      ctx.stroke();
    }

    // Player car: vibrant yellow directional chevron pointing along vehicle heading
    const me = world.player.phys;
    const mx = px(me.x);
    const my = py(me.y);
    const heading = me.a;

    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(heading);

    // Drop shadow on chevron
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    const size = 6.8;
    ctx.beginPath();
    ctx.moveTo(size * 1.35, 0);
    ctx.lineTo(-size * 0.9, -size * 0.75);
    ctx.lineTo(-size * 0.35, 0);
    ctx.lineTo(-size * 0.9, size * 0.75);
    ctx.closePath();

    ctx.fillStyle = '#FFD60A';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    ctx.restore();
  });

  return (
    <div className="absolute top-4 left-5 z-20 flex flex-col items-center gap-1 select-none pointer-events-none font-sans">
      {/* Circular Radar Disk with White Border */}
      <div className="w-[124px] h-[124px] rounded-full bg-black/50 border-2 border-white/20 overflow-hidden shadow-2xl flex items-center justify-center p-0.5">
        <canvas ref={ref} width={W * DPR} height={H * DPR} style={{ width: W, height: H }} />
      </div>

      {/* Key Hints Bar */}
      <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-white/60">
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.2 rounded-sm bg-black/70 border border-white/30 text-white font-bold text-[8px]">
            C
          </kbd>
          CAM
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.2 rounded-sm bg-black/70 border border-white/30 text-white font-bold text-[8px]">
            V
          </kbd>
          MIRROR
        </span>
      </div>
    </div>
  );
}
