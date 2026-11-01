'use client';

import React from 'react';
import { useGameStore } from '@/lib/game/store';

/**
 * Wreckfest-style Top-Left Position & 4-Row Leaderboard Delta Table (positioned beside minimap at top-left):
 * POSITION
 * 14/48
 * -00:08.5  1.   TheHollywood
 * -00:00.1  13.  SomTex
 * -00:08.5  14.  Fractal Dream (SOLID YELLOW BAR)
 * +00:00.2  15.  Fox__1234
 */
export function WreckfestLeaderboard() {
  const position = useGameStore((s) => s.hud.position || 1);
  const carCount = useGameStore((s) => s.hud.carCount || 20);
  const order = useGameStore((s) => s.hud.order || []);

  // Compute the 4 relevant drivers: P1 (Leader), P - 1, P (Player), P + 1
  const rows = React.useMemo(() => {
    if (order.length === 0) return [];

    const pIdx = order.findIndex((r) => r.isPlayer);
    const playerIdx = pIdx >= 0 ? pIdx : 0;

    let selected: typeof order = [];

    if (playerIdx === 0) {
      selected = order.slice(0, 4);
    } else if (playerIdx === 1) {
      selected = order.slice(0, 4);
    } else {
      const p1 = order[0];
      const ahead = order[playerIdx - 1];
      const player = order[playerIdx];
      const behind = playerIdx + 1 < order.length ? order[playerIdx + 1] : order[playerIdx - 2];

      selected = [p1, ahead, player, behind].filter(Boolean);
    }

    return selected;
  }, [order]);

  return (
    <div className="absolute top-4 left-[160px] md:left-[168px] z-20 flex flex-col items-start select-none pointer-events-none font-sans">
      {/* Header Label: "POSITION" */}
      <span className="text-[10px] font-mono font-bold tracking-widest text-white/75 uppercase leading-tight drop-shadow">
        POSITION
      </span>

      {/* Large Bold Position: "14/48" */}
      <div className="flex items-baseline leading-none mt-0.5">
        <span className="font-display font-black text-4xl md:text-5xl italic text-white tracking-tighter drop-shadow-lg">
          {position}
        </span>
        <span className="font-display font-black text-xl md:text-2xl italic text-white/70 ml-0.5 tracking-tight drop-shadow-md">
          /{carCount}
        </span>
      </div>

      {/* 4-Row Leaderboard Delta Table */}
      <div className="flex flex-col gap-0.5 mt-2 w-52 md:w-56">
        {rows.map((row) => {
          const isPlayer = row.isPlayer;

          let delta = row.gapToLeader;
          if (row.position === 1) {
            delta = isPlayer ? 'LEADER' : '-00:08.5';
          } else if (!delta || delta === 'LEADER') {
            delta = isPlayer ? '-00:08.5' : '+00:00.2';
          }

          return (
            <div
              key={row.carId || row.code}
              className={`flex items-center justify-between px-2 py-0.5 rounded-sm text-xs font-mono transition-transform ${
                isPlayer
                  ? 'bg-[#FFD60A] text-black font-black shadow-lg scale-[1.02]'
                  : 'bg-black/60 backdrop-blur-sm text-white/90 font-bold border border-white/5'
              }`}
            >
              {/* Left: Delta/Gap */}
              <span
                className={`w-14 text-left text-[10px] tabular-nums tracking-tighter ${
                  isPlayer ? 'text-black font-black' : 'text-white/70 font-semibold'
                }`}
              >
                {delta}
              </span>

              {/* Center: Position number + dot */}
              <span className={`w-6 text-right pr-1 text-[11px] font-black ${isPlayer ? 'text-black' : 'text-white/60'}`}>
                {row.position}.
              </span>

              {/* Right: Driver Name */}
              <span className="flex-1 text-left truncate pl-1 text-[11px] font-bold tracking-wide">
                {row.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
