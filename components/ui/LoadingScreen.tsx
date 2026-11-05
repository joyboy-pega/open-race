'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getTrackCatalogEntry } from '@/lib/game/track';
import { useGameStore } from '@/lib/game/store';

export const TOTAL_PARTS = 20;

export const PARODY_LOADING_STEPS = [
  '1/20 · HEATING SLICK TYRES WITH HAIR DRYERS & HOPE',
  '2/20 · DOWNLOADING 500KG OF EXTRA DOWNFORCE FROM TORRENTS',
  '3/20 · BRIBING FIA RACE STEWARDS WITH CANNOLI & MASALA CHAI',
  '4/20 · STRATEGY DESK: "WE ARE CHECKING, SLOW BUTTON ON..."',
  '5/20 · BONO, MY TYRES ARE DEAD · SETTING PURPLE SECTOR ANYWAY',
  '6/20 · TURNING OFF TRACTION CONTROL BECAUSE DANGER IS FUN',
  '7/20 · REPLACING FRONT WING WITH DUCT TAPE & GOOD VIBES',
  '8/20 · ASKING ADRIAN NEWEY IF AIRFLOW OBEYS TRAFFIC LAWS',
  '9/20 · INJECTING EXTRA SPICY CHAI INTO HYDRATION SYSTEM',
  '10/20 · CONSULTING ASTROLOGER FOR OPTIMAL PIT STOP WINDOW',
  '11/20 · OVERCLOCKING 1000HP LAWNMOWER HYBRID ENGINE',
  '12/20 · TELLING DRIVER "NO TALKING IN BRAKING ZONE" WHILE TALKING',
  '13/20 · POLISHING DRIVER HELMET FOR MAXIMUM TV GLAMOUR',
  '14/20 · INSTALLING EUROBEAT DRIFT PLAYLIST ON CAR BLUETOOTH',
  '15/20 · ADJUSTING BRAKE BIAS TOWARD WHICHEVER TURN IS SCARIER',
  '16/20 · REMINDING DRIVER: BRAKING IS JUST ADMITTING DEFEAT',
  '17/20 · SPEED CAMERA RADAR DETECTOR: BLOCKED ON WHATSAPP',
  '18/20 · 20-CAR PARODY GRID ROSTER SYNCHRONIZED FOR CHAOS',
  '19/20 · FINAL RADIO CHECK: "LEAVE ME ALONE, I KNOW WHAT TO DO!"',
  '20/20 · GREEN LIGHT GREEN LIGHT · SEND IT FULL THROTTLE!',
];

export const PARODY_RADIO_BRIEFINGS = [
  {
    author: 'TEAM RADIO // LAP 0',
    quote: '“Bono, my tyres are completely gone!”',
    punchline: 'Driver proceeds to set the all-time track lap record by 1.4 seconds on the very next lap.',
    tag: 'TYRE DRAMA',
  },
  {
    author: 'PIT WALL STRATEGY DESK',
    quote: '“We are switching to Plan G. Repeat, Plan G.”',
    punchline: 'Plan G stands for: “Good luck, we have absolutely no idea what is happening out there.”',
    tag: 'STRATEGY 100',
  },
  {
    author: 'TEAM RADIO // CORNER 4',
    quote: '“Leave me alone, I know what to do!”',
    punchline: 'Famous last words recorded 0.8 seconds before taking an unscheduled tour of the gravel trap.',
    tag: 'ICEMAN',
  },
  {
    author: 'CHIEF RACE ENGINEER',
    quote: '“We are checking. We will come back to you.”',
    punchline: 'Pit wall stays completely silent for 8 laps while ordering takeout to the pit lane.',
    tag: 'CHECKING...',
  },
  {
    author: 'TELEMETRY ADVISORY',
    quote: '“If you keep all other 19 cars behind you, you will finish P1.”',
    punchline: 'Elite mathematics from our 50-person data science department working overtime.',
    tag: 'BIG BRAIN',
  },
  {
    author: 'PIT BOX CONFUSION',
    quote: '“Box, box, box! NO, STAY OUT! NO WAIT, IN IN IN!”',
    punchline: 'Mechanics frantically sprinting across the pit lane holding tyres for the wrong car.',
    tag: 'PANIC MODE',
  },
  {
    author: 'AERO DEVELOPMENT DEPT',
    quote: '“Front wing damage reported on telemetry.”',
    punchline: 'Replaced with 3 layers of duct tape and a 5-star Google review. Yields +15 handling.',
    tag: 'BUDGET CAP',
  },
  {
    author: 'SPEED TRAP SURVEILLANCE',
    quote: '“Clocked at 334 km/h entering the hairpin zone.”',
    punchline: 'Local traffic police have issued 4 speeding tickets directly to your team motorhome.',
    tag: 'VIOLATION',
  },
  {
    author: 'DRIVER COACHING MANUAL',
    quote: '“Remember: Braking is just admitting defeat to the laws of physics.”',
    punchline: 'The tyre barrier has been instructed to cushion your vehicle at 250 km/h with warm hospitality.',
    tag: 'G-FORCE',
  },
  {
    author: 'ENGINE TELEMETRY WARNING',
    quote: '“Exhaust manifold temp: 125°C.”',
    punchline: 'Optimum temperature reached for grilling paneer tikka directly on the turbocharger.',
    tag: 'CHAI BREAK',
  },
  {
    author: 'PEDAL USAGE GUIDE',
    quote: '“The loud pedal on the right is for eternal glory.”',
    punchline: 'The squeaky pedal in the middle is exclusively reserved for cowards and timid spectators.',
    tag: 'FULL THROTTLE',
  },
  {
    author: 'DRS WING MALFUNCTION',
    quote: '“DRS flap is stuck permanently wide open!”',
    punchline: 'Car achieves orbital velocity on the back straight. FIA stewarding desk left baffled.',
    tag: 'WARP SPEED',
  },
  {
    author: 'SLIPSTREAM STRATEGY',
    quote: '“Tuck in closely behind the car ahead.”',
    punchline: 'Drafting at 320 km/h allows you to steal their onboard Wi-Fi hotspot and gain +20 km/h.',
    tag: 'HOTSPOT',
  },
  {
    author: 'HYDRATION ADVISORY',
    quote: '“Driver reporting strange taste in drink straw.”',
    punchline: 'Mechanic accidentally filled drink reservoir with triple-shot dark roast espresso. Pace +200%.',
    tag: 'CAFFEINE',
  },
  {
    author: 'TRACK LIMITS NOTE',
    quote: '“Stewards are monitoring Turn 9 exit limits.”',
    punchline: 'Track limits are merely polite artistic suggestions drawn in white paint for casual tourists.',
    tag: 'OFF TRACK',
  },
  {
    author: 'METEOROLOGY RADAR',
    quote: '“100% chance of torrential rain in 4 minutes.”',
    punchline: 'Pit wall decides to bolt on dry slick tyres just to observe the artistic spin-outs.',
    tag: 'WEATHER RNG',
  },
  {
    author: 'RADIO COMMUNICATION TEST',
    quote: '“Can you hear me now over engine noise?”',
    punchline: '“No, I can only hear Eurobeat synth bass. Turning the steering wheel and praying.”',
    tag: 'COMMS',
  },
  {
    author: 'TYRE WEAR REPORT',
    quote: '“Rubber wear reached 100%. Driving on pure aluminum rims.”',
    punchline: 'Shower of golden sparks emitting from wheels. Crowd scores the sparks 10/10.',
    tag: 'SPARKS',
  },
  {
    author: 'SAFETY CAR INTERLUDE',
    quote: '“Safety car deployed onto the racing surface.”',
    punchline: 'Safety car driver took the wrong exit and is currently ordering burgers at the drive-thru.',
    tag: 'SAFETY FIRST',
  },
  {
    author: 'FINAL GRID COMMAND',
    quote: '“When the five red lights extinguish: Pin the throttle.”',
    punchline: 'Do not lift off the gas until you see the checkered flag, victory champagne, or ancestors.',
    tag: 'VICTORY LAP',
  },
];

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
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

  // Advance loading steps through 20 parts (~120ms each = ~2.4s total)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIdx((prev) => {
        if (prev < TOTAL_PARTS - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        finishLoading();
        return prev;
      });
    }, 120);

    return () => clearInterval(stepInterval);
  }, [finishLoading]);

  // Cycle comedy quotes every 2.6s
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % PARODY_RADIO_BRIEFINGS.length);
    }, 2600);

    return () => clearInterval(quoteInterval);
  }, []);

  // Keyboard shortcut to skip / send it
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

  const activePart = isFinishing ? TOTAL_PARTS : Math.min(TOTAL_PARTS, stepIdx + 1);
  const progressPct = Math.round((activePart / TOTAL_PARTS) * 100);

  const currentQuote = PARODY_RADIO_BRIEFINGS[quoteIdx % PARODY_RADIO_BRIEFINGS.length];

  const handleNextJoke = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteIdx((prev) => (prev + 1) % PARODY_RADIO_BRIEFINGS.length);
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
            <span>★ ARIGATOO CLUB · 20-PART PARODY SIMULATION ★</span>
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
            PARODY GRID PREPARATION · {trackInfo.name}
          </div>
        </div>

        {/* Track Satire Stats Row */}
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
              CORNERS TO SURVIVE
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
              TRACK RECORD
            </span>
            <span
              className="text-sm sm:text-base font-black text-[var(--orange)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              1:12.4 (THE STIG)
            </span>
          </div>
        </div>

        {/* 20-Part Divided Progress Bar Container */}
        <div className="w-full flex flex-col gap-2">
          <div
            className="flex justify-between items-center text-[11px] font-bold tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span className="truncate pr-2 text-[var(--ink-mute)]">
              {isFinishing
                ? 'ALL 20 PARTS LOADED · CLEARED FOR LAUNCH'
                : PARODY_LOADING_STEPS[stepIdx]}
            </span>
            <span
              className="font-black text-xs shrink-0 flex items-center gap-1"
              style={{ color: 'var(--lime)', fontFamily: 'var(--font-mono)' }}
            >
              <span>PART {activePart}/{TOTAL_PARTS}</span>
              <span className="text-[var(--ink-dim)]">({progressPct}%)</span>
            </span>
          </div>

          {/* 20 Segmented Parts */}
          <div
            className="w-full gap-1 p-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(20, minmax(0, 1fr))',
              backgroundColor: 'var(--ink)',
              border: '2px solid var(--ink-4)',
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
            }}
          >
            {Array.from({ length: TOTAL_PARTS }).map((_, i) => {
              const isFilled = i < activePart;
              return (
                <div
                  key={i}
                  className="h-3.5 transition-all duration-150 rounded-none"
                  style={{
                    backgroundColor: isFilled ? 'var(--lime)' : 'var(--ink-3)',
                    boxShadow: isFilled ? '0 0 6px rgba(255, 230, 0, 0.6)' : 'none',
                    opacity: isFilled ? 1 : 0.35,
                  }}
                  title={`Part ${i + 1} of 20`}
                />
              );
            })}
          </div>
        </div>

        {/* Parody Radio & Engineer Briefing Card (20 Laughs Collection) */}
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
              <span>📻 {currentQuote.author}</span>
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
                {currentQuote.tag}
              </span>
              <button
                type="button"
                onClick={handleNextJoke}
                className="text-[9px] font-black uppercase px-2 py-0.5 hover:bg-[var(--ink-3)] cursor-pointer transition-colors"
                style={{
                  border: '1px solid var(--edge)',
                  color: 'var(--ink-text)',
                  fontFamily: 'var(--font-mono)',
                }}
                title="Next parody laugh"
              >
                ↻ JOKE ({quoteIdx + 1}/20)
              </button>
            </div>
          </div>

          <p
            className="text-xs sm:text-sm leading-snug m-0 text-white font-bold"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {currentQuote.quote}
          </p>

          <p
            className="text-[11px] sm:text-xs leading-relaxed m-0 text-[var(--ink-mute)] font-medium"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {currentQuote.punchline}
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
              backgroundColor: activePart >= 10 ? 'var(--lime)' : 'var(--ink-3)',
              color: activePart >= 10 ? 'var(--ink)' : 'var(--ink-text)',
              border: '2px solid var(--edge)',
              clipPath:
                'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {isFinishing ? 'LAUNCHING...' : 'SEND IT NOW ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}
