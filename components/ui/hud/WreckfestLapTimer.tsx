'use client';

import React from 'react';
import { useGameStore } from '@/lib/game/store';
import { world } from '@/lib/game/sim/world';
import { useTicker } from '@/lib/game/useTicker';
import { useWriter } from '../domWrite';

function formatWreckfestTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec * 1000) % 1000);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '00' : ms < 100 ? '0' : ''}${ms}`;
}

/**
 * Wreckfest-style Top-Right Lap & 3-Row Digital Timing Table (positioned beside speedometer at top-right):
 * LAP
 * 1/4
 * ┌────────────────────────┐
 * │ TIME         00:32.016 │
 * │ LAP          00:32.016 │
 * │ BEST TIME    00:00.000 │
 * └────────────────────────┘
 */
export function WreckfestLapTimer() {
  const w = useWriter();
  const setPaused = useGameStore((s) => s.setPaused);
  const lap = useGameStore((s) => s.hud.lap || 1);
  const totalLaps = useGameStore((s) => s.settings.totalLaps || 4);
  const bestLap = useGameStore((s) => s.hud.bestLap);

  useTicker(() => {
    const t = world.player?.timing;
    if (t) {
      const running = (world.phase === 'racing' || world.phase === 'finished') && t.lapStartTime !== null;
      const raceElapsed = running ? world.raceTime : 0;
      const lapElapsed = running ? world.raceTime - (t.lapStartTime as number) : 0;

      w.text('timeVal', formatWreckfestTime(raceElapsed));
      w.text('lapVal', formatWreckfestTime(lapElapsed));
    }
  });

  return (
    <div className="absolute top-4 right-[148px] md:right-[154px] z-20 flex flex-col items-end select-none pointer-events-none font-sans">
      {/* Top Header Row with Pause Button */}
      <div className="flex items-center gap-2.5">
        <div className="flex flex-col items-end leading-none">
          <span className="text-[10px] font-mono font-bold tracking-widest text-white/75 uppercase drop-shadow">
            LAP
          </span>
          <div className="flex items-baseline leading-none mt-0.5">
            <span className="font-display font-black text-4xl md:text-5xl italic text-white tracking-tighter drop-shadow-lg">
              {lap}
            </span>
            <span className="font-display font-black text-xl md:text-2xl italic text-white/70 ml-0.5 tracking-tight drop-shadow-md">
              /{totalLaps}
            </span>
          </div>
        </div>

        {/* Minimalist Pause Button */}
        <button
          type="button"
          onClick={() => setPaused(true)}
          className="w-7 h-7 rounded-sm bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white/80 hover:text-white pointer-events-auto transition-transform hover:scale-105 active:scale-95 shadow-md"
          aria-label="Pause (Esc)"
          title="Pause (Esc)"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
      </div>

      {/* 3-Row Compact Translucent Table */}
      <div className="flex flex-col mt-2 w-44 bg-black/60 backdrop-blur-sm rounded-sm border border-white/10 text-xs font-mono shadow-xl overflow-hidden divide-y divide-white/10">
        {/* Row 1: TIME */}
        <div className="flex items-center justify-between px-2.5 py-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">
            TIME
          </span>
          <span className="text-white font-bold tabular-nums text-[11px]" ref={w.ref('timeVal')}>
            00:00.000
          </span>
        </div>

        {/* Row 2: LAP */}
        <div className="flex items-center justify-between px-2.5 py-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">
            LAP
          </span>
          <span className="text-white font-bold tabular-nums text-[11px]" ref={w.ref('lapVal')}>
            00:00.000
          </span>
        </div>

        {/* Row 3: BEST TIME */}
        <div className="flex items-center justify-between px-2.5 py-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">
            BEST TIME
          </span>
          <span className="text-white/90 font-bold tabular-nums text-[11px]">
            {bestLap ? formatWreckfestTime(bestLap) : '00:00.000'}
          </span>
        </div>
      </div>
    </div>
  );
}
