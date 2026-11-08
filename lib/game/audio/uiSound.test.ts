import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  initAudioFromGesture,
  playUiClick,
  playUiNav,
  playUiSwitch,
  playUiSlider,
  playUiConfirm,
  playUiBack,
} from './uiSound';
import { audio } from '../audio';

describe('uiSound helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it('safely handles UI sound invocations without crashing before init', () => {
    expect(() => playUiClick()).not.toThrow();
    expect(() => playUiNav()).not.toThrow();
    expect(() => playUiSwitch()).not.toThrow();
    expect(() => playUiSlider()).not.toThrow();
    expect(() => playUiConfirm()).not.toThrow();
    expect(() => playUiBack()).not.toThrow();
  });

  it('initAudioFromGesture delegates to audio.init() when in browser environment', () => {
    (globalThis as unknown as { window: unknown }).window = {};
    const initSpy = vi.spyOn(audio, 'init').mockImplementation(() => {});
    initAudioFromGesture();
    expect(initSpy).toHaveBeenCalled();
  });
});
