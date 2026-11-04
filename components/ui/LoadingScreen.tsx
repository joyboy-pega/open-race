'use client';

import React, { useEffect, useState } from 'react';
import { getTrackCatalogEntry } from '@/lib/game/track';
import { useGameStore } from '@/lib/game/store';

const LOADING_STEPS = [
  'CALIBRATING ARCADE PHYSICS & TYRE SUBSTEPS',
  'COMPUTING HIGH-SPEED CIRCUIT SPLINES',
  'PRE-WARMING PROCEDURAL CAR MATERIALS & SHADERS',
  'SYNCHRONIZING AI GRID & TELEMETRY SYSTEMS',
  'SYSTEMS VERIFIED · GRID CLEARED FOR LAUNCH',
];

const TELEMETRY_TIPS = [
  'Trail-brake deep into apex corners to pivot the car quickly for maximum exit acceleration.',
  'Deploy hybrid power on long straightaways using [SHIFT] for instant overtake velocity.',
  'Optimal tyre operating temperature is 85°C–105°C. Keep tyres in the window for peak grip.',
  'Draft closely behind opponents in the slipstream to gain +15 km/h before making your move.',
];

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIdx((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        if (onComplete) setTimeout(onComplete, 300);
        return prev;
      });
    }, 400);

    const tipInterval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % TELEMETRY_TIPS.length);
    }, 2800);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [onComplete]);

  const progressPct = Math.min(100, Math.round(((stepIdx + 1) / LOADING_STEPS.length) * 100));
  const trackId = useGameStore((s) => s.settings.trackId);
  const trackInfo = getTrackCatalogEntry(trackId);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 select-none text-center"
      style={{
        backgroundColor: '#07080c',
        color: '#f8f9fa',
        fontFamily: 'var(--font-ui, sans-serif)',
      }}
    >
      {/* Main Flat Solid Card - NO GRADIENTS */}
      <div
        className="relative z-10 w-full max-w-lg p-8 flex flex-col items-center gap-6"
        style={{
          background: '#0e1118',
          border: '3px solid #000000',
          borderTop: '6px solid #ffe600',
          boxShadow: '8px 8px 0 #ff007a, 14px 14px 0 #000000',
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)',
        }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex items-center gap-2 text-[10px] font-black tracking-[0.22em] uppercase px-3 py-1"
            style={{
              backgroundColor: '#00f0ff',
              color: '#000000',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span>★ ARIGATOO CLUB PRESENTS ★</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-black tracking-wide uppercase m-0 leading-none"
            style={{
              fontFamily: 'var(--font-display, Anton, sans-serif)',
              color: '#ffffff',
              textShadow: '3px 3px 0 #ff007a',
            }}
          >
            OPEN RACE
          </h1>

          <div
            className="text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ color: '#ffe600', fontFamily: 'var(--font-mono, monospace)' }}
          >
            PARODY ARCADE EDITION · {trackInfo.name}
          </div>
        </div>

        {/* Track Stat Badge */}
        <div
          className="w-full flex items-center justify-around py-2 px-4"
          style={{
            backgroundColor: '#161a24',
            border: '2px solid #232836',
          }}
        >
          <div>
            <div className="text-[9px] font-bold text-neutral-400 uppercase font-mono">CIRCUIT LENGTH</div>
            <div className="text-base font-black text-white font-mono">{(trackInfo.lengthM / 1000).toFixed(3)} KM</div>
          </div>
          <div style={{ width: '2px', height: '24px', backgroundColor: '#232836' }} />
          <div>
            <div className="text-[9px] font-bold text-neutral-400 uppercase font-mono">TOTAL TURNS</div>
            <div className="text-base font-black text-white font-mono">{trackInfo.turns ?? 16}</div>
          </div>
          <div style={{ width: '2px', height: '24px', backgroundColor: '#232836' }} />
          <div>
            <div className="text-[9px] font-bold text-neutral-400 uppercase font-mono">GRID MODE</div>
            <div className="text-base font-black text-cyan-400 font-mono">ARCADE</div>
          </div>
        </div>

        {/* Progress Container - Solid flat bars, NO GRADIENTS */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider font-mono">
            <span style={{ color: '#9aa0a6' }}>{LOADING_STEPS[stepIdx]}</span>
            <span style={{ color: '#ffe600', fontSize: '13px', fontWeight: 900 }}>{progressPct}%</span>
          </div>

          <div
            className="w-full h-3 p-0.5"
            style={{
              backgroundColor: '#07080c',
              border: '2px solid #2a2f3d',
            }}
          >
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPct}%`,
                backgroundColor: '#ffe600',
              }}
            />
          </div>
        </div>

        {/* Briefing Box - Flat Solid */}
        <div
          className="w-full p-4 text-left flex flex-col gap-1.5"
          style={{
            backgroundColor: '#141822',
            border: '2px solid #262c3a',
            borderLeft: '4px solid #ff007a',
          }}
        >
          <div
            className="text-[10px] font-black tracking-[0.18em] uppercase"
            style={{ color: '#ff007a', fontFamily: 'var(--font-mono, monospace)' }}
          >
            <span>⚡ RACE ENGINEER BRIEFING</span>
          </div>
          <p className="text-xs leading-relaxed m-0 text-white font-medium">
            {TELEMETRY_TIPS[tipIdx]}
          </p>
        </div>

        {/* Footer Subtitle */}
        <div
          className="text-[10px] font-black tracking-[0.2em] uppercase font-mono"
          style={{ color: '#68707d' }}
        >
          ARIGATOO CLUB · 100% PURE ARCADE SIMULATION
        </div>
      </div>
    </div>
  );
}
