import type { TrackModule } from '../track/registry';
import type { TrackMeta } from '../track/types';

const OFFICIAL_LENGTH_M = 4940.0;

export const openMeta: TrackMeta = {
  id: 'open',
  name: 'Open World',
  country: 'Free Roam',
  lengthM: OFFICIAL_LENGTH_M,
  direction: 'cw',
  // Extra-wide runway & open testing zones: 30m to 48m width
  widthM: [
    [0, 48],    // Zone 1: 1K Speed Straight (48m ultra-wide runway)
    [1200, 48],
    [1600, 42], // Zone 2 Entry: Skidpan & Drift Circle
    [2400, 44], // Zone 2: Circular Drift Pad
    [3000, 38], // Zone 3: Stunt Launch Approach
    [3400, 36], // Zone 3: Ramp & Jump Crest
    [3800, 32], // Zone 4: Hairpin 1 Entry
    [4200, 30], // Zone 4: Hairpin 2 Apex
    [4600, 40], // Base Facility Connector
    [OFFICIAL_LENGTH_M, 48],
  ],
  // Elevation profile: Dead flat straight, bowl drift circle, +16m stunt jump ramp crest
  elevation: [
    [0, 0.0],     // 1K Straight: laser flat
    [1200, 0.0],
    [1600, 2.0],  // East transition
    [2400, 3.0],  // Drift Circle: banked bowl
    [2800, 4.0],  // Ramp approach incline
    [3200, 16.0], // STUNT JUMP CREST (+16m launch apex!)
    [3400, 4.0],  // Landing slope
    [3800, 0.0],  // Hairpins: flat precision tarmac
    [4400, 0.0],  // Hairpin 2
    [OFFICIAL_LENGTH_M, 0.0],
  ],
  sectorsM: [1400, 3200],
  drsZones: [
    { id: 1, name: '1K SPEED STRIP', detectionM: 4400, startM: 4600, endM: 1200 },
    { id: 2, name: 'NORTH LAUNCH RUN', detectionM: 2600, startM: 2700, endM: 3500 },
  ],
  pit: {
    side: 1,
    entryM: 4300,
    exitM: 300,
    boxStartM: 4450,
    boxEndM: 4700,
    speedLimitKmh: 120,
  },
  gridSlotSpacingM: 12.0,
  scenery: {},
  isOpenMap: true,
};

export const openControlPoints: [number, number][] = [
  // 1. Zone 1: 1K Speed Straight (South Runway, ~1.1km long)
  [-5500, -3800],
  [-4400, -3800],
  [-3300, -3800],
  [-2200, -3800],
  [-1100, -3800],
  [0, -3800],
  [1100, -3800],
  [2200, -3800],
  [3300, -3800],
  [4400, -3800],
  [5500, -3800],

  // 2. Zone 2: Skidpan & Drift Circle (East side sweeping circular pad)
  [7200, -3500],
  [8800, -2500],
  [9800, -1000],
  [10200, 600],
  [9700, 2200],
  [8500, 3400],
  [6800, 4200],

  // 3. Zone 3: Stunt Jump Ramps & Crest Launch (North side)
  [5000, 4700],
  [3200, 4900],
  [1500, 4700],
  [0, 4500],
  [-1500, 4700],
  [-3000, 4900],
  [-4600, 4700],

  // 4. Zone 4: Twin Hairpins & Slalom Agility Complex (West side)
  [-6200, 3900],
  [-7400, 2800],
  [-7800, 1600],  // Hairpin 1 Entry
  [-6800, 900],   // Hairpin 1 Apex (180° switchback)
  [-5900, 200],   // Slalom Connector
  [-6400, -1000], // Hairpin 2 Entry
  [-7800, -1600], // Hairpin 2 Apex (180° switchback)
  [-8400, -2600], // Hairpin 2 Exit
  [-7200, -3400], // Return to Base Ground
];

const trackModule: TrackModule = {
  meta: openMeta,
  controlPoints: openControlPoints,
  samplesPerPoint: 28,
};

export default trackModule;
