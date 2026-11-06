'use client';

import React from 'react';
import { world } from '@/lib/game/sim/world';
import { useTicker } from '@/lib/game/useTicker';
import { useWriter } from '../domWrite';

const RPM_IDLE = 3000;
const RPM_MAX = 11000;
const NITRO_SEGMENTS = 8;
const GEAR_STRINGS = ['N', '1', '2', '3', '4', '5', '6', '7', '8'];

/**
 * Top-Right Circular Tachometer & Speedometer (positioned at top-right, nothing at the bottom):
 * - Circular arc gauge with gear ticks 1..7
 * - Large center gear number (e.g. 7)
 * - Large speed readout (e.g. 128)
 * - Row of 4 car subsystem status icons (Engine, Transmission, Differential, Suspension)
 * - Segmented Nitro meter underneath: 100 [■][■][■][■][■][■][■][■]
 */
export function WreckfestSpeedometer() {
  const w = useWriter();

  useTicker(() => {
    const p = world.player?.phys;
    if (!p) return;

    // Speed display
    w.text('speedNum', String(Math.round(p.kmh)));

    // Gear display (R, N, 1..8)
    const gearIdx = typeof p.gear === 'number' ? p.gear : 0;
    const gearText = p.isReversing ? 'R' : (GEAR_STRINGS[gearIdx] ?? 'N');
    w.text('gearNum', gearText);

    // RPM Fraction (0..1)
    const rpmFrac = Math.max(0, Math.min(1, (p.rpm - RPM_IDLE) / (RPM_MAX - RPM_IDLE)));

    // SVG arc strokeDasharray (circumference ~ 210 for r=33, 270 deg sweep = 150 length)
    const activeLength = Math.round(rpmFrac * 145);
    w.css('rpmArc', 'strokeDasharray', `${activeLength} 230`);

    // Color shift: yellow -> orange -> redline
    const arcColor = rpmFrac > 0.88 ? '#FF4D5E' : rpmFrac > 0.6 ? '#FF7A18' : '#FFD60A';
    w.css('rpmArc', 'stroke', arcColor);

    // Nitro / ERS Segments & Percentage
    const ersFrac = Math.max(0, Math.min(1, p.ersCharge / 100));
    w.text('ersPct', String(Math.round(p.ersCharge)));
    const activeSegs = Math.round(ersFrac * NITRO_SEGMENTS);

    for (let i = 0; i < NITRO_SEGMENTS; i++) {
      const active = i < activeSegs;
      w.css(`nitroSeg${i}`, 'opacity', active ? '1' : '0.2');
      w.css(
        `nitroSeg${i}`,
        'background',
        active ? (i >= 6 ? '#FF4D5E' : '#FFFFFF') : 'rgba(255, 255, 255, 0.2)'
      );
    }
  });

  return (
    <div className="absolute top-4 right-5 z-20 flex flex-col items-center select-none pointer-events-none font-sans">
      {/* Compact Circular Tachometer & Speedometer */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* SVG Tachometer Arc */}
        <svg viewBox="0 0 90 90" className="w-full h-full transform -rotate-135">
          {/* Background Outer Arc Track */}
          <circle
            cx="45"
            cy="45"
            r="33"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="4.5"
            strokeDasharray="145 230"
            strokeLinecap="round"
          />

          {/* Active RPM Gauge Fill */}
          <circle
            cx="45"
            cy="45"
            r="33"
            fill="none"
            stroke="#FFD60A"
            strokeWidth="4.5"
            strokeDasharray="0 230"
            strokeLinecap="round"
            className="transition-all duration-75"
            ref={w.ref('rpmArc')}
          />
        </svg>

        {/* Gear Ticks around Arc: 1..7 */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { num: '1', top: '74%', left: '16%' },
            { num: '2', top: '48%', left: '10%' },
            { num: '3', top: '24%', left: '18%' },
            { num: '4', top: '10%', left: '36%' },
            { num: '5', top: '10%', left: '60%' },
            { num: '6', top: '22%', left: '78%' },
            { num: '7', top: '46%', left: '88%' },
          ].map((tick) => (
            <span
              key={tick.num}
              className="absolute text-[8px] font-mono font-bold text-white/50 -translate-x-1/2 -translate-y-1/2"
              style={{ top: tick.top, left: tick.left }}
            >
              {tick.num}
            </span>
          ))}
        </div>

        {/* Center Readout: Gear + Speed */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {/* Current Gear: "7" */}
          <span
            className="font-display font-black text-xl md:text-2xl italic text-amber-400 leading-none -mt-1 drop-shadow"
            ref={w.ref('gearNum')}
          >
            7
          </span>

          {/* Digital Speed: "128" */}
          <span
            className="font-display font-black text-4xl md:text-5xl text-white tracking-tighter leading-none mt-0.5 drop-shadow-md"
            ref={w.ref('speedNum')}
          >
            0
          </span>
        </div>
      </div>

      {/* Segmented ERS / Boost Meter: "[ERS %] ▮▮▮▮▮▮▮▮" */}
      <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded bg-black/50 border border-white/10 shadow">
        <span className="text-[10px] font-mono font-bold text-white/80 tracking-tight" ref={w.ref('ersPct')}>
          100
        </span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: NITRO_SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-3 rounded-[1px] bg-white transition-opacity duration-75 shadow-sm"
              ref={w.ref(`nitroSeg${i}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
