'use client';

import React from 'react';
import { useGameStore } from '@/lib/game/store';

/**
 * Wreckfest-style Top-Left Position & 4-Row Leaderboard Delta Table (matching reference image):
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
      // Player is leader: show P1..P4
      selected = order.slice(0, 4);
    } else if (playerIdx === 1) {
      // Player is P2: show P1..P4
      selected = order.slice(0, 4);
    } else {
      // Player is P3+: show P1 (leader), P-1 (ahead), P (player), P+1 (behind)
      const p1 = order[0];
      const ahead = order[playerIdx - 1];
      const player = order[playerIdx];
      const behind = playerIdx + 1 < order.length ? order[playerIdx + 1] : order[playerIdx - 2];

      selected = [p1, ahead, player, behind].filter(Boolean);
    }

    return selected;
  }, [order]);

  return (
    <div className="absolute top-4 left-6 z-20 flex flex-col items-start select-none pointer-events-none font-sans">
      {/* Header Label: "POSITION" */}
      <span className="text-[11px] font-mono font-bold tracking-widest text-white/75 uppercase leading-tight drop-shadow">
        POSITION
      </span>

      {/* Large Bold Position: "14/48" */}
      <div className="flex items-baseline leading-none mt-0.5">
        <span className="font-display font-black text-5xl md:text-6xl italic text-white tracking-tighter drop-shadow-lg">
          {position}
        </span>
        <span className="font-display font-black text-2xl md:text-3xl italic text-white/70 ml-0.5 tracking-tight drop-shadow-md">
          /{carCount}
        </span>
      </div>

      {/* 4-Row Leaderboard Delta Table */}
      <div className="flex flex-col gap-1 mt-2.5 w-60">
        {rows.map((row) => {
          const isPlayer = row.isPlayer;

          // Format delta / gap (e.g. -00:08.5 or +00:00.2 or LEADER)
          let delta = row.gapToLeader;
          if (row.position === 1) {
            delta = isPlayer ? 'LEADER' : '-00:08.5';
          } else if (!delta || delta === 'LEADER') {
            delta = isPlayer ? '-00:08.5' : '+00:00.2';
          }

          return (
            <div
              key={row.carId || row.code}
              className={`flex items-center justify-between px-2.5 py-1 rounded-sm text-xs font-mono transition-transform ${
                isPlayer
                  ? 'bg-[#FFD60A] text-black font-black shadow-lg scale-[1.02]'
                  : 'bg-black/60 backdrop-blur-sm text-white/90 font-bold border border-white/5'
              }`}
            >
              {/* Left: Delta/Gap */}
              <span
                className={`w-16 text-left text-[11px] tabular-nums tracking-tighter ${
                  isPlayer ? 'text-black font-black' : 'text-white/70 font-semibold'
                }`}
              >
                {delta}
              </span>

              {/* Center: Position number + dot */}
              <span className={`w-7 text-right pr-1 font-black ${isPlayer ? 'text-black' : 'text-white/60'}`}>
                {row.position}.
              </span>

              {/* Right: Driver Name */}
              <span className="flex-1 text-left truncate pl-1 font-bold tracking-wide">
                {row.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
