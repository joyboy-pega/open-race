'use client';

import React from 'react';
import { WreckfestLeaderboard } from './hud/WreckfestLeaderboard';
import { WreckfestLapTimer } from './hud/WreckfestLapTimer';
import { WreckfestSpeedometer } from './hud/WreckfestSpeedometer';
import { PitQTEOverlay } from './hud/PitQTEOverlay';
import { StartLights } from './hud/StartLights';
import { Toasts } from './hud/Toasts';

/**
 * Wreckfest-style In-Race HUD (matching user's uploaded reference image):
 * - Top-Left: Position (14/48) & 4-row leaderboard delta table (player in solid yellow bar)
 * - Top-Right: Lap (1/4) & 3-row compact digital timing table (TIME, LAP, BEST TIME)
 * - Bottom-Right: 160px circular tachometer arc with gear ticks, center gear, speed & status icons + segmented nitro bar
 * - Bottom-Left: 144px circular radar minimap with yellow heading chevron & key hints (rendered via Minimap.tsx)
 * - 3D Scene: In-world floating driver avatars & names above cars (rendered via DriverNametags.tsx)
 */
export function HUD() {
  return (
    <div className="h-root">
      <WreckfestLeaderboard />
      <WreckfestLapTimer />
      <WreckfestSpeedometer />
      <StartLights />
      <Toasts />
      <PitQTEOverlay />
    </div>
  );
}
