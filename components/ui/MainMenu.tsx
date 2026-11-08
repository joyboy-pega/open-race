'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Difficulty, GameMode, Livery, TimeOfDay, TyreCompound, WeatherType } from '@/lib/game/constants';
import { MAX_AI_CARS } from '@/lib/game/constants';
import { DEFAULT_SETTINGS, formatLapTime, type GameSettings } from '@/lib/game/gameState';
import { recordKey, useGameStore } from '@/lib/game/store';
import { playUiNav, playUiConfirm, playUiBack } from '@/lib/game/audio/uiSound';
import { ControlsPanel } from './ControlsPanel';
import { SettingsPanel } from './SettingsPanel';
import { MultiplayerLobby } from './MultiplayerLobby';
import { multiplayerRoom as room } from '@/lib/game/multiplayer/room';
import { COMPOUNDS, COMPOUND_ORDER, MODE_NAMES, WEATHER_LABEL, useMounted } from './format';
import { Field, Seg, Slider } from './kit';
import { TrackPreview } from './TrackPreview';
import { trackCatalog } from '@/lib/game/track';
import { parseRecordKey } from '@/lib/game/records';
import { TrackSelectModal } from './TrackSelectModal';
import { PixelCross, PixelMap, PixelRain, PixelSnow } from './PixelIcon';

const Showroom = dynamic(() => import('./Showroom'), {
  ssr: false,
  loading: () => <div className="l-showroom-loading">WARMING UP GARAGE…</div>,
});

type MainMenuSection = 'arcade' | 'timetrial' | 'practice' | 'online' | 'garage' | 'profile' | 'options';

const MENU_ITEMS = [
  { id: 'arcade', label: 'RACE', sub: 'SPRINT VS AI' },
  { id: 'timetrial', label: 'TIME TRIAL', sub: 'HOT LAP' },
  { id: 'practice', label: 'PRACTICE', sub: 'FREE RUN' },
  { id: 'online', label: 'ONLINE', sub: 'P2P ROOM' },
  { id: 'garage', label: 'GARAGE', sub: 'CAR TUNING' },
  { id: 'profile', label: 'PROFILE', sub: 'RECORDS' },
  { id: 'options', label: 'OPTIONS', sub: 'SETTINGS' },
] as const;

const PRESETS: { name: string; livery: Omit<Livery, 'number'> }[] = [
  { name: 'Pegasus #53', livery: { body: '#f8fafc', accent: '#dc2626', rim: '#9a6b26' } },
  { name: 'Scarlet', livery: { body: '#e10600', accent: '#121212', rim: '#c0c0c0' } },
  { name: 'Papaya', livery: { body: '#ff8700', accent: '#0072bb', rim: '#1e1e1e' } },
  { name: 'Silver', livery: { body: '#d9dce1', accent: '#111111', rim: '#111111' } },
  { name: 'Sunburst', livery: { body: '#ffe600', accent: '#ff007a', rim: '#111111' } },
  { name: 'Electric Cyan', livery: { body: '#00f0ff', accent: '#ff007a', rim: '#ffffff' } },
  { name: 'Royal', livery: { body: '#1e41b0', accent: '#ffd700', rim: '#c0c0c0' } },
  { name: 'Violet', livery: { body: '#6b21a8', accent: '#f59e0b', rim: '#f59e0b' } },
];

function Colour({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="l-colour">
      <span>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    </label>
  );
}

export function MainMenu() {
  const mounted = useMounted();
  const stored = useGameStore((s) => s.settings);
  const records = useGameStore((s) => s.records);
  const set = useGameStore((s) => s.setSettings);
  const s: GameSettings = mounted ? stored : DEFAULT_SETTINGS;
  const router = useRouter();

  // Active navigation choice
  const [activeNav, setActiveNav] = useState<MainMenuSection>('arcade');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);

  const setLivery = (patch: Partial<Livery>) => set({ livery: { ...s.livery, ...patch } });
  const bestKey = recordKey(s.trackId, s.mode, s.weather);
  const catalog = trackCatalog();
  const trackInfo = catalog.find((t) => t.id === s.trackId) ?? catalog[0];
  const best = mounted ? records.bestLaps[bestKey] : undefined;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('join');
    if (roomParam) {
      set({ mode: 'multiplayer' });
      setActiveNav('online');
    }
  }, [set]);

  // Keyboard shortcuts: Space for quick race, G for garage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !trackModalOpen) {
        e.preventDefault();
        setTrackModalOpen(true);
      } else if (e.code === 'KeyG' && !drawerOpen && !trackModalOpen) {
        e.preventDefault();
        selectNav('garage');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trackModalOpen, drawerOpen]);

  const selectNav = (nav: MainMenuSection) => {
    playUiNav();
    setActiveNav(nav);
    if (nav === 'arcade') {
      set({ mode: 'race', totalLaps: 3, drivingModel: 'casual' });
      setDrawerOpen(false);
      setTrackModalOpen(true);
    } else if (nav === 'timetrial') {
      set({ mode: 'timetrial' });
      setDrawerOpen(false);
      setTrackModalOpen(true);
    } else if (nav === 'practice') {
      set({ mode: 'practice' });
      setDrawerOpen(false);
      setTrackModalOpen(true);
    } else if (nav === 'online') {
      set({ mode: 'multiplayer' });
      setDrawerOpen(false);
      setTrackModalOpen(false);
    } else {
      // garage, profile, options
      setDrawerOpen(true);
      setTrackModalOpen(false);
    }
  };

  const handleStartRace = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    playUiConfirm();
    router.push('/game');
  };

  const isRaceMode = activeNav === 'arcade' || activeNav === 'timetrial' || activeNav === 'practice';

  return (
    <main className="dirt-root" aria-label="Open Race main menu">
      {/* 3D Showroom Hero Stage */}
      <div className="dirt-stage">
        <Showroom
          model={s.carModel}
          livery={s.livery}
          compound={s.startCompound}
          weather={s.weather}
        />
      </div>

      {/* Top Bar with Brand Logo and Status Badges */}
      <header className="dirt-top">
        <div className="dirt-logo-wrap">
          <span className="dirt-logo-kicker">ARIGATOO CLUB</span>
          <Link href="/" className="dirt-logo" aria-label="Open Race Home">
            <span className="dirt-logo-open">OPEN</span>
            <span className="dirt-logo-race">RACE</span>
          </Link>
          <div className="dirt-brand-sub">
            <span className="dirt-brand-tag">ARCADE SIMULATION</span>
            <span className="dirt-brand-author">BUDDH INTERNATIONAL CIRCUIT</span>
          </div>
        </div>

        <div className="dirt-status-bar">
          <button
            type="button"
            className="dirt-chip net cursor-pointer"
            onClick={() => selectNav('online')}
            title="Launch Multiplayer"
          >
            <span className="dirt-chip-lbl">JOIN SPLITSCREEN / P2P</span>
          </button>
          <div
            className="dirt-chip track cursor-pointer"
            title="Choose Circuit"
            onClick={() => setTrackModalOpen(true)}
          >
            <span className="dirt-chip-num" style={{ fontSize: 13, textTransform: 'uppercase' }}>
              {trackInfo.name}
            </span>
            <span className="dirt-chip-lbl flex items-center gap-1">
              {(trackInfo.lengthM / 1000).toFixed(2)} KM · MAP <PixelMap size={12} />
            </span>
          </div>
        </div>
      </header>

      {/* Weather Indicator */}
      {(s.weather === 'rain' || s.weather === 'snow') && (
        <div className="dirt-weather-pill" aria-live="polite">
          <span className="flex items-center gap-1.5">
            {s.weather === 'rain' ? (
              <>
                <PixelRain size={14} /> Wet Weather Active
              </>
            ) : (
              <>
                <PixelSnow size={14} /> Snow Conditions Active
              </>
            )}
          </span>
        </div>
      )}

      {/* Left Navigation Stack (Solid Flat Color Blocks, NO GRADIENTS) */}
      <nav className="dirt-menu" aria-label="Main Navigation">
        {MENU_ITEMS.map((m) => {
          const isActive = activeNav === m.id;
          return (
            <button
              key={m.id}
              type="button"
              className={`dirt-menu-btn ${isActive ? 'active' : ''}`}
              onClick={() => selectNav(m.id)}
            >
              {isActive ? (
                <>
                  <span className="dirt-split-left">{m.label}</span>
                  <span className="dirt-split-right">{m.sub}</span>
                </>
              ) : (
                <>
                  <span>{m.label}</span>
                  <span className="dirt-menu-sub">{m.sub}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right-Side Configuration Drawer (Solid Flat) */}
      {drawerOpen && (
        <aside className="dirt-drawer" aria-label="Section Details">
          <div className="dirt-drawer-head">
            <h2 className="dirt-drawer-title">
              {activeNav === 'online' && 'MULTIPLAYER'}
              {activeNav === 'arcade' && 'RACE SETUP'}
              {activeNav === 'timetrial' && 'TIME TRIAL'}
              {activeNav === 'practice' && 'FREE PRACTICE'}
              {activeNav === 'garage' && 'GARAGE TUNING'}
              {activeNav === 'profile' && 'DRIVER PROFILE'}
              {activeNav === 'options' && 'OPTIONS & CONTROLS'}
              <span className="dirt-drawer-badge">
                {activeNav === 'garage' ? '3D' : activeNav === 'profile' ? 'STATS' : 'READY'}
              </span>
            </h2>
            <button
              type="button"
              className="dirt-drawer-close flex items-center gap-1.5"
              onClick={() => setDrawerOpen(false)}
              title="Close Drawer"
            >
              <PixelCross size={10} /> HIDE
            </button>
          </div>

          <div className="dirt-drawer-body">
            {/* Race Modes Setup */}
            {isRaceMode && (
              <>
                <div className="dirt-track-card">
                  <TrackPreview trackId={trackInfo.id} className="dirt-track-svg" />
                  <div className="dirt-track-info">
                    <span className="dirt-track-name">{trackInfo.name}</span>
                    <span className="dirt-track-meta">
                      {(trackInfo.lengthM / 1000).toFixed(3)} KM · {trackInfo.turns ?? 16} TURNS
                    </span>
                    {trackInfo.lapRecord && (
                      <span style={{ fontSize: '10px', color: '#9aa0a6' }}>
                        RECORD: {formatLapTime(trackInfo.lapRecord.time)} ({trackInfo.lapRecord.driver.split(' ')[1]})
                      </span>
                    )}
                  </div>
                </div>

                {catalog.length > 1 && (
                  <Field label="Circuit">
                    <select
                      className="l-input"
                      value={s.trackId}
                      onChange={(e) => set({ trackId: e.target.value })}
                      aria-label="Select circuit"
                      style={{
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        fontSize: '16px',
                        letterSpacing: '0.04em',
                        background: '#12161e',
                        borderColor: '#2a3142',
                      }}
                    >
                      {catalog.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({(t.lengthM / 1000).toFixed(2)} km)
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {activeNav === 'arcade' && (
                  <>
                    <Field label="Laps" value={String(s.totalLaps)}>
                      <Slider label="Laps" min={1} max={20} step={1} value={s.totalLaps} onChange={(v) => set({ totalLaps: v })} />
                    </Field>
                    <Field label="Opponents" value={String(s.aiCount)}>
                      <Slider
                        label="Opponents"
                        min={0}
                        max={MAX_AI_CARS}
                        step={1}
                        value={s.aiCount}
                        onChange={(v) => set({ aiCount: v, gridPosition: Math.min(s.gridPosition, v + 1) })}
                      />
                    </Field>
                    <Field label="Difficulty">
                      <Seg<Difficulty>
                        label="Difficulty"
                        value={s.difficulty}
                        options={[
                          { value: 'rookie', label: 'Rookie' },
                          { value: 'pro', label: 'Pro' },
                          { value: 'legend', label: 'Legend' },
                        ]}
                        onChange={(v) => set({ difficulty: v })}
                      />
                    </Field>
                    <Field label="Grid slot" value={`P${Math.min(s.gridPosition, s.aiCount + 1)}`}>
                      <Slider label="Grid position" min={1} max={s.aiCount + 1} step={1} value={Math.min(s.gridPosition, s.aiCount + 1)} onChange={(v) => set({ gridPosition: v })} />
                    </Field>
                  </>
                )}

                <Field label="Weather">
                  <Seg<WeatherType>
                    label="Weather"
                    value={s.weather}
                    options={(['sunny', 'cloudy', 'rain', 'snow', 'dynamic'] as WeatherType[]).map((w) => ({ value: w, label: WEATHER_LABEL[w] }))}
                    onChange={(v) => set({ weather: v })}
                  />
                </Field>

                <Field label="Time of day">
                  <Seg<TimeOfDay>
                    label="Time of day"
                    value={s.timeOfDay}
                    options={[
                      { value: 'day', label: 'Day' },
                      { value: 'sunset', label: 'Sunset' },
                      { value: 'night', label: 'Night' },
                    ]}
                    onChange={(v) => set({ timeOfDay: v })}
                  />
                </Field>

                <Field label="Starting tyre" hint={s.weather === 'rain' || s.weather === 'snow' ? 'Slicks struggle in wet conditions: choose Inter or Wet.' : undefined}>
                  <Seg<TyreCompound>
                    label="Starting tyre"
                    value={s.startCompound}
                    options={COMPOUND_ORDER.map((c) => ({ value: c, label: COMPOUNDS[c].letter, title: COMPOUNDS[c].name }))}
                    onChange={(v) => set({ startCompound: v })}
                  />
                </Field>

                <Field
                  label="Handling model"
                  hint={
                    (s.drivingModel ?? 'casual') === 'hardcore'
                      ? 'Hardcore: Realistic simulation physics'
                      : 'Casual: Arcade handling, drifting & easy steering (default)'
                  }
                >
                  <Seg<'casual' | 'hardcore'>
                    label="Handling model"
                    value={s.drivingModel ?? 'casual'}
                    options={[
                      { value: 'casual', label: 'Casual' },
                      { value: 'hardcore', label: 'Hardcore' },
                    ]}
                    onChange={(v) => set({ drivingModel: v })}
                  />
                </Field>
              </>
            )}

            {/* Garage Tab */}
            {activeNav === 'garage' && (
              <>
                <Field label="Car Model">
                  <Seg
                    label="Car model"
                    value={s.carModel}
                    options={[
                      { value: 'f1', label: 'Formula' },
                      { value: 'roadster', label: 'Tesla Roadster' },
                      { value: 'pegasus', label: 'Pegasus #53' },
                    ]}
                    onChange={(v) => {
                      if (v === 'pegasus') {
                        set({
                          carModel: v,
                          livery: { ...s.livery, number: 53, body: '#f8fafc', accent: '#dc2626', rim: '#9a6b26' },
                          driverName: s.driverName === 'You' ? 'Pegasus #53' : s.driverName,
                          driverCode: s.driverCode === 'YOU' ? 'PEG' : s.driverCode,
                        });
                      } else {
                        set({ carModel: v });
                      }
                    }}
                  />
                </Field>

                <div className="l-presets" role="group" aria-label="Livery presets">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      title={p.name}
                      className="l-preset"
                      style={{ background: p.livery.body, borderColor: p.livery.accent }}
                      onClick={() => setLivery(p.livery)}
                      aria-label={`${p.name} livery`}
                    />
                  ))}
                </div>

                <div className="l-colours">
                  <Colour label="Body" value={s.livery.body} onChange={(v) => setLivery({ body: v })} />
                  <Colour label="Accent" value={s.livery.accent} onChange={(v) => setLivery({ accent: v })} />
                  <Colour label="Wheels" value={s.livery.rim} onChange={(v) => setLivery({ rim: v })} />
                </div>

                <Field label="Number" value={`#${s.livery.number}`}>
                  <Slider label="Car number" min={1} max={99} step={1} value={s.livery.number} onChange={(v) => setLivery({ number: v })} />
                </Field>

                <Field label="Driver name">
                  <input className="l-input" value={s.driverName} maxLength={18} onChange={(e) => set({ driverName: e.target.value })} aria-label="Driver name" />
                </Field>

                <Field label="Timing code">
                  <input
                    className="l-input l-code"
                    value={s.driverCode}
                    maxLength={3}
                    onChange={(e) => set({ driverCode: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                    aria-label="Three letter timing code"
                  />
                </Field>
              </>
            )}

            {/* Profile & Records Tab */}
            {activeNav === 'profile' && (
              <div className="l-records">
                <div className="m-stats" style={{ padding: 0, marginBottom: 16 }}>
                  <div>
                    <small>Races started</small>
                    <b>{mounted ? records.racesStarted : 0}</b>
                  </div>
                  <div>
                    <small>Finished</small>
                    <b>{mounted ? records.racesFinished : 0}</b>
                  </div>
                  <div>
                    <small>Wins</small>
                    <b>{mounted ? records.wins : 0}</b>
                  </div>
                  <div>
                    <small>Podiums</small>
                    <b>{mounted ? records.podiums : 0}</b>
                  </div>
                </div>

                <h3 className="k-section-title">Personal Best Laps</h3>
                {mounted && Object.keys(records.bestLaps).length === 0 && (
                  <p className="m-empty" style={{ color: '#9aa0a6', marginTop: 8 }}>
                    Set a lap in Time Trial or Practice to see it recorded here.
                  </p>
                )}
                {mounted &&
                  Object.entries(records.bestLaps).map(([key, t]) => {
                    const { trackId, mode, weather } = parseRecordKey(key);
                    const trackName = catalog.find((cat) => cat.id === trackId)?.name ?? trackId;
                    return (
                      <div key={key} className="m-lap" style={{ marginBottom: 4, background: '#161922', border: '1px solid #232836' }}>
                        <span>
                          {catalog.length > 1 ? `${trackName} · ` : ''}
                          {MODE_NAMES[mode as GameMode] ?? mode} · {WEATHER_LABEL[weather as WeatherType] ?? weather}
                        </span>
                        <b style={{ color: '#ffe600' }}>{formatLapTime(t)}</b>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Options Tab */}
            {activeNav === 'options' && (
              <>
                <SettingsPanel />
                <h3 className="k-section-title">Controls Map</h3>
                <ControlsPanel />
              </>
            )}

            {/* Online Tab */}
            {activeNav === 'online' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ color: '#9aa0a6', fontSize: 13, marginBottom: 16 }}>
                  Connect with friends via WebRTC P2P Room. Real-time physics synchronization and live telemetry!
                </p>
                <button
                  type="button"
                  className="dirt-launch-btn"
                  onClick={() => set({ mode: 'multiplayer' })}
                >
                  <span>OPEN LOBBY</span>
                </button>
              </div>
            )}
          </div>

          {/* Massive Flat Solid Launch Button at Bottom of Drawer */}
          {isRaceMode && (
            <div className="dirt-drawer-foot">
              <button
                type="button"
                className="dirt-launch-btn"
                onClick={handleStartRace}
              >
                <span>START RACE</span>
                <span aria-hidden="true">➔</span>
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Showroom Hero Start CTA (Floating Bottom-Right, completely unobstructed car) */}
      {!drawerOpen && (
        <div className="dirt-hero-cta" aria-label="Race Launcher">
          <div
            className="dirt-hero-track-info"
            onClick={() => setTrackModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to select another track"
          >
            <div className="dirt-hero-track-left">
              <span className="dirt-hero-kicker">SELECTED CIRCUIT</span>
              <span className="dirt-hero-track-name">{trackInfo.name}</span>
              <span className="dirt-hero-track-meta">
                {(trackInfo.lengthM / 1000).toFixed(2)} KM · {trackInfo.turns ?? 16} TURNS · {s.totalLaps} LAPS
              </span>
            </div>
            <button
              type="button"
              className="dirt-hero-change-btn flex items-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                setTrackModalOpen(true);
              }}
            >
              CHANGE MAP <PixelMap size={12} />
            </button>
          </div>

          <button
            type="button"
            className="dirt-hero-start-btn"
            onClick={() => setTrackModalOpen(true)}
          >
            <span>START RACE</span>
            <span aria-hidden="true" className="dirt-hero-arrow">➔</span>
          </button>
        </div>
      )}

      {/* Track Selection Modal */}
      <TrackSelectModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        onStartRace={() => {
          setTrackModalOpen(false);
          router.push('/game');
        }}
        settings={s}
        setSettings={set}
      />

      {/* Bottom Bar: Car Specs & Controller Hints */}
      <footer className="dirt-bottom">
        <div className="dirt-car-badge">
          <span className="dirt-car-num">#{s.livery.number}</span>
          <div className="dirt-car-desc">
            <b>{s.driverName || 'You'}</b>
            <small>
              {s.carModel === 'pegasus'
                ? 'Team Pegasus #53 (SAE)'
                : s.carModel === 'f1'
                ? 'Formula One'
                : 'Tesla Roadster'}{' '}
              · {COMPOUNDS[s.startCompound].name} TYRES
            </small>
          </div>
        </div>

        <div className="dirt-prompts">
          <span className="dirt-prompt" onClick={() => setTrackModalOpen(true)} style={{ cursor: 'pointer' }}>
            <span className="dirt-btn-key">SPACE</span> START RACE
          </span>
          <span className="dirt-prompt" onClick={() => selectNav('garage')} style={{ cursor: 'pointer' }}>
            <span className="dirt-btn-key">G</span> GARAGE
          </span>
          <span className="dirt-prompt">
            <span className="dirt-btn-key">C</span> ORBIT CAM
          </span>
          <span className="dirt-prompt">
            <span className="dirt-btn-key">DRAG</span> ROTATE 3D
          </span>
        </div>
      </footer>

      {/* Multiplayer Lobby Overlay */}
      {s.mode === 'multiplayer' && (
        <MultiplayerLobby
          onStartRace={(roomSettings, players) => {
            const me = players.find((p) => p.id === room.localPeerId) || players[0];
            set({
              mode: 'multiplayer',
              trackId: roomSettings.trackId,
              totalLaps: roomSettings.totalLaps,
              weather: roomSettings.weather,
              timeOfDay: roomSettings.timeOfDay ?? 'day',
              aiCount: 0,
              carModel: me?.carModel ?? 'f1',
              livery: me?.livery ?? s.livery,
              driverName: me?.driverName ?? s.driverName,
              driverCode: me?.driverCode ?? s.driverCode,
              multiplayerPlayers: players,
              multiplayerLocalPeerId: room.localPeerId,
            });
            router.push('/game');
          }}
          onBack={() => set({ mode: 'race' })}
        />
      )}
    </main>
  );
}
