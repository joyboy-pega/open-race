import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../gameState';
import { world } from '../sim/world';
import { ensureTrack, isTrackLoaded, trackCatalog } from './index';

describe('Open World circuit integration', () => {
  it('registers Open World in the track catalog', () => {
    const catalog = trackCatalog();
    const open = catalog.find((t) => t.id === 'open');
    expect(open).toBeDefined();
    expect(open!.name).toBe('Open World');
    expect(open!.country).toBe('Free Roam');
    expect(open!.lengthM).toBe(4940);
  });

  it('ensureTrack loads and builds Open World TrackRuntime with open map properties', async () => {
    const rt = await ensureTrack('open');
    expect(isTrackLoaded('open')).toBe(true);
    expect(rt.meta.id).toBe('open');
    expect(rt.meta.isOpenMap).toBe(true);
    expect(rt.N).toBeGreaterThan(900);

    // Track length in world units
    expect(rt.length).toBeGreaterThan(48000);
    expect(rt.length).toBeLessThan(51000);

    // Wide runway & pads: half-width between 150 and 240 units (30m to 48m width)
    let minHw = 999;
    let maxHw = 0;
    for (let i = 0; i < rt.N; i++) {
      if (rt.halfWidth[i] < minHw) minHw = rt.halfWidth[i];
      if (rt.halfWidth[i] > maxHw) maxHw = rt.halfWidth[i];
    }
    expect(minHw).toBeGreaterThanOrEqual(140);
    expect(maxHw).toBeLessThanOrEqual(250);
  });

  it('can initialize game world in free roam on open map without errors', async () => {
    await ensureTrack('open');
    world.setup({
      ...DEFAULT_SETTINGS,
      trackId: 'open',
      mode: 'freeroam',
    });
    expect(world.isFreeRoam).toBe(true);
    expect(world.isRace).toBe(false);
    expect(world.phase).toBe('racing');
    expect(world.cars.length).toBe(1);
    expect(world.player.isPlayer).toBe(true);
  });
});
