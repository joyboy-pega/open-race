'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getTrackCatalogEntry } from '@/lib/game/track';
import { useGameStore } from '@/lib/game/store';
import { PixelCompass } from './PixelIcon';

export const TOTAL_STEPS = 6;

export const LOADING_STEPS = [
  '1/6 · INITIALIZING RACE PHYSICS & DYNAMICS ENGINE',
  '2/6 · GENERATING TRACK SPLINE & TERRAIN MESHES',
  '3/6 · COMPILING 3D SHADER PIPELINE & TEXTURES',
  '4/6 · CALIBRATING AERODYNAMICS & TYRE DEGRADATION',
  '5/6 · SYNCHRONIZING GRID ROSTER & AI PACE MODELS',
  '6/6 · GREEN LIGHT READY · GRID FORMATION SET',
];

export const RACING_TIPS = [
  {
    topic: 'TRAIL BRAKING // TECHNIQUE',
    detail: 'Ease off the brake smoothly as you turn in toward the apex to keep front weight loaded and maximize steering bite.',
    tag: 'CORNERING',
  },
  {
    topic: 'TYRE MANAGEMENT // OPERATING WINDOW',
    detail: 'Excessive sliding overheats compound surfaces rapidly. Smooth, progressive steering inputs keep tyres in their optimal grip window.',
    tag: 'TYRE WEAR',
  },
  {
    topic: 'AERODYNAMICS // DRS EFFICIENCY',
    detail: 'Activate DRS in designated straight zones to dump rear-wing drag and gain a significant top-speed advantage for overtaking.',
    tag: 'AERO DYNAMICS',
  },
  {
    topic: 'RACING LINE // APEX DISCIPLINE',
    detail: 'Prioritize a late apex on corners leading into long straights so you can get the car rotated early and apply full throttle sooner.',
    tag: 'RACING LINE',
  },
  {
    topic: 'ERS DEPLOYMENT // HYBRID BOOST',
    detail: 'Energy harvests under heavy braking. Deploy electric boost exiting slow turns to overcome turbo-lag and launch onto straights.',
    tag: 'HYBRID ERS',
  },
  {
    topic: 'SLIPSTREAM // DRAFTING ZONES',
    detail: 'Running directly behind a competitor reduces air resistance, providing a speed surge before pulling out to brake into the corner.',
    tag: 'OVERTAKING',
  },
];

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const trackId = useGameStore((s) => s.settings.trackId);
  const trackInfo = getTrackCatalogEntry(trackId);

  const finishLoading = useCallback(() => {
    if (isFinishing) return;
    setIsFinishing(true);
    if (onComplete) {
      setTimeout(onComplete, 200);
    }
  }, [isFinishing, onComplete]);

  // Advance loading steps through 6 stages
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIdx((prev) => {
        if (prev < TOTAL_STEPS - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        finishLoading();
        return prev;
      });
    }, 280);

    return () => clearInterval(stepInterval);
  }, [finishLoading]);

  // Cycle racing tips periodically
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % RACING_TIPS.length);
    }, 3200);

    return () => clearInterval(tipInterval);
  }, []);

  // Keyboard shortcut to skip / start
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        finishLoading();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [finishLoading]);

  const activeStep = isFinishing ? TOTAL_STEPS : Math.min(TOTAL_STEPS, stepIdx + 1);
  const progressPct = Math.round((activeStep / TOTAL_STEPS) * 100);
  const currentTip = RACING_TIPS[tipIdx % RACING_TIPS.length];

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIdx((prev) => (prev + 1) % RACING_TIPS.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 select-none text-center"
      style={{
        backgroundColor: 'var(--ink)',
        color: 'var(--ink-text)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Background Ambience Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(var(--lime) 1px, transparent 1px), radial-gradient(var(--orange) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      {/* Main Card with Official Clip-Path Corner Language */}
      <div
        className="relative z-10 w-full max-w-xl p-5 sm:p-7 flex flex-col items-center gap-4 sm:gap-5"
        style={{
          background: 'var(--panel)',
          border: '2px solid var(--edge)',
          borderTop: '6px solid var(--lime)',
          boxShadow: '10px 10px 0 var(--ink-4), 16px 16px 0 rgba(0, 0, 0, 0.8)',
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header Ribbon & Title */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div
            className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] uppercase px-3 py-0.5"
            style={{
              backgroundColor: 'var(--lime)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
            }}
          >
            <span>SIMULATION INITIALIZATION · REAL-TIME TELEMETRY</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-black tracking-wider uppercase m-0 leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--ink-text)',
              textShadow: '3px 3px 0 var(--orange)',
            }}
          >
            OPEN RACE
          </h1>

          <div
            className="text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ color: 'var(--lime)', fontFamily: 'var(--font-mono)' }}
          >
            SESSION PREPARATION · {trackInfo.name}
          </div>
        </div>

        {/* Track Telemetry Stats Row */}
        <div
          className="w-full grid grid-cols-3 gap-2 py-2 px-3"
          style={{
            backgroundColor: 'var(--ink-2)',
            border: '1px solid var(--edge)',
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
          }}
        >
          <div className="flex flex-col items-center">
            <span
              className="text-[9px] font-bold uppercase tracking-wider text-[var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              CIRCUIT LENGTH
            </span>
            <span
              className="text-sm sm:text-base font-black text-white"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {(trackInfo.lengthM / 1000).toFixed(3)} KM
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-[var(--edge)]">
            <span
              className="text-[9px] font-bold uppercase tracking-wider text-[var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              CORNERS
            </span>
            <span
              className="text-sm sm:text-base font-black text-[var(--lime)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {trackInfo.turns ?? 16} TURNS
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className="text-[9px] font-bold uppercase tracking-wider text-[var(--ink-mute)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              SESSION FORMAT
            </span>
            <span
              className="text-sm sm:text-base font-black text-[var(--orange)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              SPRINT RACE
            </span>
          </div>
        </div>

        {/* Segmented Progress Bar Container */}
        <div className="w-full flex flex-col gap-2">
          <div
            className="flex justify-between items-center text-[11px] font-bold tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span className="truncate pr-2 text-[var(--ink-mute)]">
              {isFinishing ? 'ALL SUBSYSTEMS READY · CLEARED FOR LAUNCH' : LOADING_STEPS[stepIdx]}
            </span>
            <span
              className="font-black text-xs shrink-0 flex items-center gap-1"
              style={{ color: 'var(--lime)', fontFamily: 'var(--font-mono)' }}
            >
              <span>STAGE {activeStep}/{TOTAL_STEPS}</span>
              <span className="text-[var(--ink-dim)]">({progressPct}%)</span>
            </span>
          </div>

          {/* 6 Segmented Parts */}
          <div
            className="w-full gap-1 p-1"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${TOTAL_STEPS}, minmax(0, 1fr))`,
              backgroundColor: 'var(--ink)',
              border: '2px solid var(--ink-4)',
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
            }}
          >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const isFilled = i < activeStep;
              return (
                <div
                  key={i}
                  className="h-3.5 transition-all duration-150 rounded-none"
                  style={{
                    backgroundColor: isFilled ? 'var(--lime)' : 'var(--ink-3)',
                    boxShadow: isFilled ? '0 0 6px rgba(255, 230, 0, 0.6)' : 'none',
                    opacity: isFilled ? 1 : 0.35,
                  }}
                  title={`Stage ${i + 1} of ${TOTAL_STEPS}`}
                />
              );
            })}
          </div>
        </div>

        {/* Race Engineering Briefing Card */}
        <div
          className="w-full p-3.5 sm:p-4 text-left flex flex-col gap-1.5"
          style={{
            backgroundColor: 'var(--ink-2)',
            border: '2px solid var(--edge)',
            borderLeft: '4px solid var(--orange)',
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div
              className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-1.5"
              style={{ color: 'var(--orange)', fontFamily: 'var(--font-mono)' }}
            >
              <PixelCompass size={12} />
              <span>{currentTip.topic}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-black uppercase px-2 py-0.5"
                style={{
                  backgroundColor: 'var(--ink-4)',
                  color: 'var(--lime)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {currentTip.tag}
              </span>
              <button
                type="button"
                onClick={handleNextTip}
                className="text-[9px] font-black uppercase px-2 py-0.5 hover:bg-[var(--ink-3)] cursor-pointer transition-colors"
                style={{
                  border: '1px solid var(--edge)',
                  color: 'var(--ink-text)',
                  fontFamily: 'var(--font-mono)',
                }}
                title="Next driving tip"
              >
                ↻ TIP ({tipIdx + 1}/{RACING_TIPS.length})
              </button>
            </div>
          </div>

          <p
            className="text-xs sm:text-sm leading-relaxed m-0 text-white font-medium"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {currentTip.detail}
          </p>
        </div>

        {/* Action Controls / Skip Footer */}
        <div className="w-full flex items-center justify-between gap-4 pt-0.5">
          <span
            className="text-[10px] font-bold tracking-widest uppercase text-[var(--ink-dim)] hidden sm:inline"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            [SPACE] OR [ENTER] TO LAUNCH
          </span>

          <button
            type="button"
            onClick={finishLoading}
            className="ml-auto px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: activeStep >= 3 ? 'var(--lime)' : 'var(--ink-3)',
              color: activeStep >= 3 ? 'var(--ink)' : 'var(--ink-text)',
              border: '2px solid var(--edge)',
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {isFinishing ? 'LAUNCHING...' : 'START SESSION ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}
