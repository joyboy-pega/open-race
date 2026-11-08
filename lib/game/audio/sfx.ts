import type { AudioCore, Buses } from './core';
import { clamp01 } from './helpers';

type Bus = keyof Buses;

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  /** Seconds from now. */
  at?: number;
  slideTo?: number;
  attack?: number;
  bus?: Bus;
  lowpass?: number;
}

/**
 * One-shot sounds: race cues (UI bus) and impacts / pit (sfx bus).
 * Each call creates a few short-lived nodes that are garbage-collected after `stop()`;
 * noise comes from the shared NoiseBank so nothing is allocated per hit.
 */
export class Sfx {
  private readonly core: AudioCore;

  constructor(core: AudioCore) {
    this.core = core;
  }

  private tone(freq: number, dur: number, o: ToneOpts = {}) {
    const { ctx, bus } = this.core;
    const t = ctx.currentTime + (o.at ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
    const g = ctx.createGain();
    const peak = o.gain ?? 0.2;
    const atk = o.attack ?? 0.008;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + atk);
    g.gain.setValueAtTime(peak, t + Math.max(atk, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const dest = bus[o.bus ?? 'ui'];
    if (o.lowpass) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = o.lowpass;
      osc.connect(lp).connect(g).connect(dest);
    } else {
      osc.connect(g).connect(dest);
    }
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noiseHit(
    dur: number,
    o: { at?: number; freq: number; q?: number; type?: BiquadFilterType; gain: number; buf?: 'white' | 'pink' | 'brown'; bus?: Bus; sweepTo?: number }
  ) {
    const { ctx, noise, bus } = this.core;
    const t = ctx.currentTime + (o.at ?? 0);
    const src = noise.burst(noise[o.buf ?? 'white'], t, dur);
    const f = ctx.createBiquadFilter();
    f.type = o.type ?? 'bandpass';
    f.Q.value = o.q ?? 1;
    f.frequency.setValueAtTime(o.freq, t);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus[o.bus ?? 'sfx']);
  }

  // --- start lights -----------------------------------------------------------------

  /** Each light gets the same pip; the fifth is a touch higher to feel "complete". */
  startLight(count: number) {
    this.tone(count >= 5 ? 1046 : 880, 0.2, { type: 'sine', gain: 0.22 });
    this.tone(count >= 5 ? 2092 : 1760, 0.2, { type: 'sine', gain: 0.04 });
  }

  /** Lights out: a rising two-note "go" that is clearly different from the pips. */
  lightsOut() {
    this.tone(660, 0.12, { type: 'triangle', gain: 0.22 });
    this.tone(990, 0.12, { type: 'triangle', gain: 0.22, at: 0.1 });
    this.tone(1320, 0.34, { type: 'triangle', gain: 0.26, at: 0.2 });
    this.tone(2640, 0.3, { type: 'sine', gain: 0.05, at: 0.2 });
  }

  // --- DRS / timing -------------------------------------------------------------------

  drs(open: boolean) {
    if (open) {
      this.tone(880, 0.09, { gain: 0.16 });
      this.tone(1318, 0.16, { gain: 0.16, at: 0.07 });
    } else {
      this.tone(698, 0.08, { gain: 0.13 });
      this.tone(466, 0.14, { gain: 0.13, at: 0.06 });
    }
  }

  lapBeep() {
    this.tone(1200, 0.07, { type: 'square', gain: 0.07, lowpass: 3500 });
    this.tone(1200, 0.07, { type: 'square', gain: 0.07, lowpass: 3500, at: 0.1 });
  }

  /** Sector beep; `status` mirrors the timing-screen colour (overall = purple). */
  sectorBeep(status: 'none' | 'personal' | 'overall' | 'slower') {
    if (status === 'overall') {
      this.tone(1175, 0.08, { type: 'triangle', gain: 0.16 });
      this.tone(1480, 0.08, { type: 'triangle', gain: 0.16, at: 0.08 });
      this.tone(1760, 0.2, { type: 'triangle', gain: 0.18, at: 0.16 });
    } else if (status === 'personal') {
      this.tone(1100, 0.07, { type: 'triangle', gain: 0.13 });
      this.tone(1400, 0.1, { type: 'triangle', gain: 0.13, at: 0.07 });
    } else {
      this.tone(900, 0.09, { type: 'sine', gain: 0.1 });
    }
  }

  /** Fastest-lap mini fanfare: major arpeggio with a bright top. */
  fastestLap() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone(f, i === notes.length - 1 ? 0.5 : 0.11, { type: 'triangle', gain: 0.16, at: i * 0.1 });
      this.tone(f * 2, i === notes.length - 1 ? 0.5 : 0.11, { type: 'sine', gain: 0.05, at: i * 0.1 });
    });
  }

  penalty() {
    for (let i = 0; i < 2; i++) {
      this.tone(155, 0.17, { type: 'sawtooth', gain: 0.17, at: i * 0.22, lowpass: 900 });
      this.tone(160, 0.17, { type: 'square', gain: 0.08, at: i * 0.22, lowpass: 700 });
    }
  }

  pitLimiterTick() {
    this.tone(1650, 0.06, { type: 'square', gain: 0.07, lowpass: 3000 });
  }

  /** Short team-radio squelch: opens and closes with a noise tick + a soft tone. */
  radioBlip() {
    this.noiseHit(0.05, { freq: 2200, q: 0.8, gain: 0.07, bus: 'ui' });
    this.tone(1800, 0.05, { type: 'sine', gain: 0.05, at: 0.045 });
    this.noiseHit(0.04, { freq: 2600, q: 0.8, gain: 0.05, bus: 'ui', at: 0.1 });
  }

  biasTick() {
    this.tone(1400, 0.04, { type: 'triangle', gain: 0.1, slideTo: 400, attack: 0.002 });
  }

  // --- pit -------------------------------------------------------------------------------

  /** Wheel-gun burst x4 (one per corner) + a release hiss. */
  pitStop() {
    for (let i = 0; i < 4; i++) {
      const at = i * 0.12;
      for (let k = 0; k < 5; k++) {
        this.noiseHit(0.025, { at: at + k * 0.022, freq: 1800 + (k % 2) * 700, q: 2.5, gain: 0.16 });
      }
      this.tone(520, 0.1, { type: 'sawtooth', gain: 0.04, at, lowpass: 1500, bus: 'sfx' });
    }
    this.noiseHit(0.5, { at: 0.55, freq: 5000, q: 0.7, type: 'highpass', gain: 0.05, sweepTo: 3000 });
  }

  // --- impacts -----------------------------------------------------------------------------

  /** Car-to-car contact. `intensity` 0..1+, `atten` 0..1 distance attenuation. */
  collision(intensity: number, atten = 1) {
    const i = clamp01(intensity);
    const a = clamp01(atten);
    const peak = (0.15 + 0.6 * i) * a;
    this.tone(120 + 40 * (1 - i), 0.18 + 0.15 * i, { type: 'sine', gain: peak, slideTo: 38, bus: 'sfx', attack: 0.003 });
    this.noiseHit(0.1 + 0.12 * i, { freq: 700 + 800 * i, q: 0.9, gain: peak * 0.9, bus: 'sfx' });
    // Carbon "crack"
    this.noiseHit(0.05, { freq: 3200, q: 1.2, gain: peak * 0.5 * i, bus: 'sfx' });
  }

  /** Barrier hit: heavier, with a metallic ring. */
  wallHit(intensity: number) {
    const i = clamp01(intensity);
    const peak = 0.2 + 0.55 * i;
    this.tone(90, 0.3 + 0.2 * i, { type: 'sine', gain: peak, slideTo: 32, bus: 'sfx', attack: 0.003 });
    this.noiseHit(0.18 + 0.15 * i, { freq: 500 + 500 * i, q: 0.7, gain: peak * 0.9, bus: 'sfx' });
    this.noiseHit(0.1, { freq: 2400, q: 2, gain: peak * 0.4, bus: 'sfx' });
    this.tone(1180, 0.35, { type: 'sine', gain: 0.03 * i, bus: 'sfx', attack: 0.002 });
  }

  // --- off-track & boundary dynamics ----------------------------------------------------

  /** Breaching the white line / entering grass or gravel at speed. */
  offTrackBreach(intensity: number) {
    const i = clamp01(intensity);
    const peak = 0.16 + 0.32 * i;
    this.tone(74, 0.14 + 0.1 * i, { type: 'triangle', gain: peak, slideTo: 32, attack: 0.002, bus: 'sfx' });
    this.noiseHit(0.12 + 0.08 * i, { freq: 1200, q: 1.1, gain: peak * 0.75, buf: 'brown', bus: 'sfx' });
    this.noiseHit(0.08, { freq: 3400, q: 1.8, gain: peak * 0.35, buf: 'white', bus: 'sfx' });
  }

  /** Returning from grass/gravel to asphalt track surface. */
  onTrackReturn(intensity: number) {
    const i = clamp01(intensity);
    this.tone(420, 0.045, { type: 'sawtooth', gain: 0.07 * i, slideTo: 220, bus: 'tyre' });
    this.noiseHit(0.05, { freq: 1500, q: 3.2, gain: 0.1 * i, buf: 'white', bus: 'tyre' });
  }

  /** Track limits violation warning chime (modern F1 steering alert). */
  trackLimitsAlert() {
    this.tone(980, 0.065, { type: 'square', gain: 0.12, lowpass: 2800, bus: 'ui' });
    this.tone(1320, 0.075, { type: 'square', gain: 0.13, lowpass: 3200, at: 0.085, bus: 'ui' });
  }

  /** Penalty buzzer for chicane cutting. */
  chicaneCutTone() {
    this.tone(280, 0.13, { type: 'sawtooth', gain: 0.14, slideTo: 130, lowpass: 1000, bus: 'ui' });
  }

  /** Lap invalidated buzz (track limits / cut). */
  lapInvalidTone() {
    this.tone(220, 0.07, { type: 'sawtooth', gain: 0.12, lowpass: 800, bus: 'ui' });
    this.tone(180, 0.11, { type: 'sawtooth', gain: 0.12, at: 0.09, lowpass: 800, bus: 'ui' });
  }

  // --- drivetrain & mechanics -----------------------------------------------------------

  /** Pneumatic paddle gear shift: pressure burst + dog engagement. */
  gearShift(up: boolean) {
    if (up) {
      this.noiseHit(0.018, { freq: 4400, q: 2.6, gain: 0.11, bus: 'sfx' });
      this.tone(175, 0.032, { type: 'triangle', gain: 0.14, slideTo: 85, bus: 'sfx' });
    } else {
      this.noiseHit(0.022, { freq: 2900, q: 2.0, gain: 0.09, bus: 'sfx' });
      this.tone(135, 0.042, { type: 'triangle', gain: 0.16, slideTo: 210, bus: 'sfx' });
    }
  }

  /** Rev-limiter bounce / overrun exhaust crackle. */
  exhaustPop(gain = 0.15) {
    const g = clamp01(gain);
    this.noiseHit(0.032, { freq: 420 + Math.random() * 280, q: 1.6, gain: 0.14 * g, buf: 'brown', bus: 'sfx' });
    this.tone(80 + Math.random() * 35, 0.038, { type: 'sine', gain: 0.11 * g, slideTo: 28, bus: 'sfx' });
  }

  /** ERS / Electric motor boost activation whine. */
  ersDeploy(active: boolean) {
    if (active) {
      this.tone(2400, 0.18, { type: 'sine', gain: 0.09, slideTo: 4800, attack: 0.02, bus: 'sfx' });
    } else {
      this.tone(3600, 0.12, { type: 'sine', gain: 0.06, slideTo: 1800, bus: 'sfx' });
    }
  }

  // --- race control & flags -------------------------------------------------------------

  /** Flag audio advisory. */
  flagAlert(flag: 'green' | 'yellow' | 'blue') {
    if (flag === 'yellow') {
      this.tone(660, 0.11, { type: 'sine', gain: 0.14, bus: 'ui' });
      this.tone(520, 0.16, { type: 'sine', gain: 0.14, at: 0.12, bus: 'ui' });
    } else if (flag === 'green') {
      this.tone(1046, 0.18, { type: 'triangle', gain: 0.15, bus: 'ui' });
    } else {
      this.tone(880, 0.08, { type: 'sine', gain: 0.09, bus: 'ui' });
    }
  }

  /** Pit stop mini-game QTE feedback tone. */
  pitQTE(result: 'perfect' | 'good' | 'early' | 'late') {
    if (result === 'perfect') {
      this.tone(1318, 0.08, { type: 'triangle', gain: 0.17, bus: 'ui' });
      this.tone(1760, 0.18, { type: 'triangle', gain: 0.19, at: 0.07, bus: 'ui' });
    } else if (result === 'good') {
      this.tone(1046, 0.11, { type: 'triangle', gain: 0.13, bus: 'ui' });
    } else {
      this.tone(220, 0.15, { type: 'sawtooth', gain: 0.14, lowpass: 800, bus: 'ui' });
    }
  }

  // --- UI interactions ------------------------------------------------------------------

  /** Standard snappy F1 tactile click for buttons and cards. */
  uiClick() {
    this.tone(1650, 0.024, { type: 'sine', gain: 0.11, slideTo: 720, attack: 0.001, bus: 'ui' });
    this.noiseHit(0.012, { freq: 3600, q: 2.2, gain: 0.045, bus: 'ui' });
  }

  /** Navigation / section tab change. */
  uiNav() {
    this.tone(1180, 0.028, { type: 'sine', gain: 0.075, bus: 'ui' });
    this.tone(1580, 0.038, { type: 'sine', gain: 0.085, at: 0.024, bus: 'ui' });
  }

  /** Toggle switch / segmented option clack. */
  uiSwitch() {
    this.noiseHit(0.016, { freq: 2700, q: 2.8, gain: 0.07, bus: 'ui' });
    this.tone(310, 0.024, { type: 'triangle', gain: 0.065, bus: 'ui' });
  }

  /** Subtle micro-tick for slider adjustments. */
  uiSlider() {
    this.noiseHit(0.007, { freq: 2300, q: 4.2, gain: 0.035, bus: 'ui' });
  }

  /** Confirm / Start Race launch cue. */
  uiConfirm() {
    this.tone(880, 0.075, { type: 'triangle', gain: 0.13, bus: 'ui' });
    this.tone(1760, 0.17, { type: 'triangle', gain: 0.15, at: 0.055, bus: 'ui' });
    this.tone(3520, 0.13, { type: 'sine', gain: 0.045, at: 0.075, bus: 'ui' });
  }

  /** Back / Cancel / Dismissal click. */
  uiBack() {
    this.tone(940, 0.036, { type: 'sine', gain: 0.085, slideTo: 470, bus: 'ui' });
  }

  /** Pause menu entry tone. */
  uiPause() {
    this.tone(840, 0.11, { type: 'sine', gain: 0.11, slideTo: 320, bus: 'ui' });
  }

  /** Unpause / Resume game chime. */
  uiResume() {
    this.tone(440, 0.055, { type: 'sine', gain: 0.09, slideTo: 880, bus: 'ui' });
  }
}
