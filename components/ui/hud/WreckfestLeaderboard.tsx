'use client';

import React from 'react';
import { useGameStore } from '@/lib/game/store';
import type { TimingRow } from '@/lib/game/gameState';

const EMPTY_ROWS: TimingRow[] = [];

export function WreckfestLeaderboard() {
  const position = useGameStore((s) => s.hud.position || 1);
  const carCount = useGameStore((s) => s.hud.carCount || 20);
  const order = useGameStore((s) => s.hud.order || EMPTY_ROWS);
  const isFreeRoam = useGameStore((s) => s.settings.mode === 'freeroam' || s.settings.trackId === 'open');

  // Compute the 4 relevant drivers: P1 (Leader), P - 1, P (Player), P + 1
  const rows = React.useMemo(() => {
    if (isFreeRoam || order.length === 0) return EMPTY_ROWS;

    const pIdx = order.findIndex((r) => r.isPlayer);
    const playerIdx = pIdx >= 0 ? pIdx : 0;

    let selected: typeof order = [];

    if (playerIdx === 0) {
      selected = order.slice(0, 4);
    } else if (playerIdx === 1) {
      selected = order.slice(0, 4);
    } else {
      const p1 = order[0];
      if (playerIdx === order.length - 1) {
        // Player is last: show Leader, P-2, P-1, Player in ascending rank
        const twoAhead = playerIdx >= 2 ? order[playerIdx - 2] : null;
        const oneAhead = order[playerIdx - 1];
        const player = order[playerIdx];
        selected = [p1, twoAhead, oneAhead, player].filter(Boolean) as typeof order;
      } else {
        const ahead = order[playerIdx - 1];
        const player = order[playerIdx];
        const behind = order[playerIdx + 1];
        selected = [p1, ahead, player, behind].filter(Boolean);
      }
    }

    return selected;
  }, [order, isFreeRoam]);

  if (isFreeRoam) {
    return (
      <div className="absolute top-4 left-[144px] md:left-[150px] z-20 flex flex-col items-start select-none pointer-events-none font-sans">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#c8ff2e] uppercase leading-tight drop-shadow">
          MAP
        </span>
        <div className="flex items-baseline leading-none mt-0.5">
          <span className="font-display font-black text-3xl md:text-4xl italic text-white tracking-tighter drop-shadow-lg">
            OPEN WORLD
          </span>
        </div>
        <div className="mt-1 px-2 py-0.5 bg-black/60 border border-white/10 text-[10px] font-mono font-bold tracking-wider text-white/80 uppercase">
          FREE ROAM MODE
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-[144px] md:left-[150px] z-20 flex flex-col items-start select-none pointer-events-none font-sans">
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
          const delta = row.position === 1 ? 'LEADER' : (row.gapToLeader || '--');

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
