'use client';

import React, { useEffect, useState } from 'react';
import { trackCatalog, type TrackCatalogEntry } from '@/lib/game/track';
import { TrackPreview } from './TrackPreview';
import { formatLapTime, type Difficulty, type GameSettings, type WeatherType } from '@/lib/game/gameState';
import { recordKey, useGameStore } from '@/lib/game/store';
import { PixelCross, PixelRain, PixelSnow, PixelSun } from './PixelIcon';

interface TrackSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRace: () => void;
  settings: GameSettings;
  setSettings: (patch: Partial<GameSettings>) => void;
}

const TRACK_DETAILS: Record<
  string,
  {
    flag: string;
    tagline: string;
    turns: number;
    highlight: string;
  }
> = {
  open: {
    flag: 'FREE',
    tagline: 'Open World Free Roam · Infinite Freedom',
    turns: 6,
    highlight: 'Drive wherever and whatever you want with no walls or limits',
  },
  buddh: {
    flag: 'IND',
    tagline: 'F1 Indian Grand Prix · High Elevation & Sweeping Hairpins',
    turns: 16,
    highlight: 'Challenging 1.06km straight & banked multi-apex Turn 10-11',
  },
  monza: {
    flag: 'ITA',
    tagline: 'The Temple of Speed · Ultra High-Speed Slipstream Battle',
    turns: 11,
    highlight: 'Iconic Variante del Rettifilo, Curva Grande & Parabolica',
  },
  redbullring: {
    flag: 'AUT',
    tagline: 'Alpine Rollercoaster · Short, Explosive, Heavy Braking',
    turns: 10,
    highlight: 'Steep climb to Turn 3 with 65m dramatic elevation changes',
  },
  silverstone: {
    flag: 'GBR',
    tagline: 'Home of British Motorsport · Flat-out High-G Sweepers',
    turns: 18,
    highlight: 'Legendary Copse, Maggotts, Becketts & Stowe complex',
  },
  spa: {
    flag: 'BEL',
    tagline: 'The Ardennes Legend · Legendary Eau Rouge & Raidillon',
    turns: 19,
    highlight: '102m elevation sweep through Kemmel Straight & Blanchimont',
  },
  suzuka: {
    flag: 'JPN',
    tagline: 'Figure-8 Masterclass · Demanding Degner & 130R Curves',
    turns: 18,
    highlight: 'Unique crossover bridge, Esses snake & 300+ km/h 130R apex',
  },
};

export function TrackSelectModal({
  isOpen,
  onClose,
  onStartRace,
  settings,
  setSettings,
}: TrackSelectModalProps) {
  const catalog = trackCatalog();
  const records = useGameStore((state) => state.records);
  const [selectedTrackId, setSelectedTrackId] = useState(settings.trackId || 'monza');

  // Sync selected track when modal opens
  useEffect(() => {
    if (settings.trackId) {
      setSelectedTrackId(settings.trackId);
    }
  }, [settings.trackId, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onStartRace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onStartRace]);

  if (!isOpen) return null;

  const handleSelectTrack = (id: string) => {
    setSelectedTrackId(id);
    const isOpen = id === 'open';
    setSettings({
      trackId: id,
      ...(isOpen ? { mode: 'freeroam', aiCount: 0 } : {}),
    });
  };

  const handleDoubleCardClick = (id: string) => {
    handleSelectTrack(id);
    onStartRace();
  };

  const activeEntry = catalog.find((c) => c.id === selectedTrackId) ?? catalog[0];
  const activeDetails = TRACK_DETAILS[activeEntry.id] ?? {
    flag: 'GP',
    tagline: 'Championship Circuit',
    turns: activeEntry.turns ?? 16,
    highlight: 'High-speed racing circuit',
  };

  return (
    <div className="dirt-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-track-title">
      <div className="dirt-track-modal-box">
        {/* Header */}
        <div className="dirt-track-modal-head">
          <div className="dirt-track-modal-title-wrap">
            <span className="dirt-track-kicker">★ WORLD CHAMPIONSHIP CALENDAR ★</span>
            <h2 id="modal-track-title" className="dirt-track-modal-title">
              CHOOSE CIRCUIT
            </h2>
            <p className="dirt-track-modal-desc">
              Select your track to launch the race. Double-click any card to start instantly!
            </p>
          </div>

          <button
            type="button"
            className="dirt-track-modal-close flex items-center gap-1.5"
            onClick={onClose}
            aria-label="Close circuit selector"
          >
            <PixelCross size={10} /> BACK TO SHOWROOM
          </button>
        </div>

        {/* Cards Grid */}
        <div className="dirt-circuit-grid">
          {catalog.map((track) => {
            const isSelected = track.id === selectedTrackId;
            const details = TRACK_DETAILS[track.id] ?? {
              flag: 'GP',
              tagline: `${track.country} Circuit`,
              turns: track.turns ?? 16,
              highlight: 'Official Racing Circuit',
            };
            const pbKey = recordKey(track.id, settings.mode, settings.weather);
            const personalBest = records.bestLaps[pbKey];

            return (
              <div
                key={track.id}
                className={`dirt-circuit-card ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectTrack(track.id)}
                onDoubleClick={() => handleDoubleCardClick(track.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    handleSelectTrack(track.id);
                  }
                }}
              >
                {isSelected && (
                  <div className="dirt-circuit-active-badge">
                    <span>★ SELECTED</span>
                  </div>
                )}

                <div className="dirt-circuit-card-header">
                  <div className="dirt-circuit-country">
                    <span className="dirt-circuit-flag font-mono font-black text-[10px] px-1.5 py-0.5 bg-[var(--ink-4)] text-[var(--lime)] border border-[var(--edge)]">
                      {details.flag}
                    </span>
                    <span className="dirt-circuit-country-name">{track.country}</span>
                  </div>
                  <span className="dirt-circuit-turns-badge">{track.turns ?? details.turns} TURNS</span>
                </div>

                <h3 className="dirt-circuit-name">{track.name}</h3>
                <p className="dirt-circuit-tagline">{details.tagline}</p>

                {/* Minimap SVG preview */}
                <div className="dirt-circuit-svg-wrap">
                  <TrackPreview trackId={track.id} className="dirt-circuit-svg" />
                </div>

                {/* Track Stats Row */}
                <div className="dirt-circuit-stats">
                  <div className="dirt-stat-col">
                    <small>LENGTH</small>
                    <b>{(track.lengthM / 1000).toFixed(2)} KM</b>
                  </div>
                  {track.lapRecord && (
                    <div className="dirt-stat-col">
                      <small>RECORD</small>
                      <b>
                        {formatLapTime(track.lapRecord.time)}{' '}
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>
                          ({track.lapRecord.driver.split(' ').pop()})
                        </span>
                      </b>
                    </div>
                  )}
                  {personalBest && (
                    <div className="dirt-stat-col pb">
                      <small>YOUR BEST</small>
                      <b style={{ color: '#00d26a' }}>{formatLapTime(personalBest)}</b>
                    </div>
                  )}
                </div>

                <div className="dirt-circuit-card-action">
                  <span className="dirt-circuit-select-hint">
                    {isSelected ? 'CLICK TO RACE ➔' : 'CLICK TO SELECT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Configuration & Launch Bar */}
        <div className="dirt-track-modal-foot">
          <div className="dirt-modal-quick-settings">
            <div className="dirt-quick-field">
              <span className="dirt-quick-label">LAPS:</span>
              <div className="dirt-quick-pills">
                {[1, 3, 5, 10, 20].map((lap) => (
                  <button
                    key={lap}
                    type="button"
                    className={`dirt-quick-pill ${settings.totalLaps === lap ? 'active' : ''}`}
                    onClick={() => setSettings({ totalLaps: lap })}
                  >
                    {lap} {lap === 1 ? 'LAP' : 'LAPS'}
                  </button>
                ))}
              </div>
            </div>

            <div className="dirt-quick-field">
              <span className="dirt-quick-label">DIFFICULTY:</span>
              <div className="dirt-quick-pills">
                {(['rookie', 'pro', 'legend'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`dirt-quick-pill ${settings.difficulty === d ? 'active' : ''}`}
                    onClick={() => setSettings({ difficulty: d })}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="dirt-quick-field">
              <span className="dirt-quick-label">AI CARS:</span>
              <div className="dirt-quick-pills">
                {[0, 5, 11, 19].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`dirt-quick-pill ${settings.aiCount === count ? 'active' : ''}`}
                    onClick={() =>
                      setSettings({
                        aiCount: count,
                        gridPosition: Math.min(settings.gridPosition, count + 1),
                      })
                    }
                  >
                    {count === 0 ? 'SOLO' : `${count} AI`}
                  </button>
                ))}
              </div>
            </div>

            <div className="dirt-quick-field">
              <span className="dirt-quick-label">WEATHER:</span>
              <div className="dirt-quick-pills">
                {(['sunny', 'rain', 'snow'] as WeatherType[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`dirt-quick-pill flex items-center gap-1.5 ${settings.weather === w ? 'active' : ''}`}
                    onClick={() => setSettings({ weather: w })}
                  >
                    {w === 'sunny' ? (
                      <>
                        <PixelSun size={11} /> SUNNY
                      </>
                    ) : w === 'rain' ? (
                      <>
                        <PixelRain size={11} /> RAIN
                      </>
                    ) : (
                      <>
                        <PixelSnow size={11} /> SNOW
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="dirt-modal-launch-zone">
            <div className="dirt-modal-summary">
              <span className="dirt-modal-summary-track">{activeEntry.name}</span>
              <span className="dirt-modal-summary-meta">
                {settings.totalLaps} LAPS · {settings.aiCount} OPPONENTS ·{' '}
                {settings.difficulty.toUpperCase()}
              </span>
            </div>

            <button
              type="button"
              className="dirt-circuit-launch-btn"
              onClick={onStartRace}
              autoFocus
            >
              <span>START RACE</span>
              <span className="dirt-launch-arrow" aria-hidden="true">
                ➔
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
