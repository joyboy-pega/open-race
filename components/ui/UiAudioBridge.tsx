'use client';

import { useEffect } from 'react';
import { audio } from '@/lib/game/audio';
import {
  initAudioFromGesture,
  playUiClick,
  playUiConfirm,
  playUiBack,
  playUiNav,
  playUiSwitch,
  playUiSlider,
} from '@/lib/game/audio/uiSound';
import { useGameStore } from '@/lib/game/store';

/**
 * Global UI audio listener. Mounted at the root layout.
 * Ensures the WebAudio context unlocks on first user gesture and plays tactile
 * high-tech UI feedback sounds across buttons, tabs, toggles, and sliders.
 */
export function UiAudioBridge() {
  useEffect(() => {
    // Sync initial store settings with audio engine
    const state = useGameStore.getState();
    if (state.settings) {
      if (typeof state.settings.audioEnabled === 'boolean' && audio.isEnabled() !== state.settings.audioEnabled) {
        audio.toggleAudio();
      }
      if (typeof state.settings.volume === 'number') {
        audio.setVolume(state.settings.volume);
      }
    }

    const unsub = useGameStore.subscribe((s, prev) => {
      if (s.settings.audioEnabled !== prev.settings.audioEnabled) {
        if (audio.isEnabled() !== s.settings.audioEnabled) {
          audio.toggleAudio();
        }
      }
      if (s.settings.volume !== prev.settings.volume) {
        audio.setVolume(s.settings.volume);
      }
    });

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      initAudioFromGesture();

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest<HTMLElement>(
        'button, a, [role="button"], [role="tab"], [role="radio"], [role="switch"], .k-switch, .k-seg button'
      );
      if (!interactive) return;

      const customSound = interactive.getAttribute('data-sound');
      if (customSound === 'none') return;
      if (customSound === 'confirm') return playUiConfirm();
      if (customSound === 'back') return playUiBack();
      if (customSound === 'nav') return playUiNav();
      if (customSound === 'switch') return playUiSwitch();

      const role = interactive.getAttribute('role');
      const cls = interactive.className || '';
      const text = (interactive.textContent || '').trim().toUpperCase();
      const aria = (interactive.getAttribute('aria-label') || '').trim().toUpperCase();

      if (role === 'switch' || role === 'radio' || cls.includes('k-switch') || cls.includes('k-seg')) {
        playUiSwitch();
        return;
      }

      if (role === 'tab' || cls.includes('nav') || cls.includes('tab') || cls.includes('l-nav-item')) {
        playUiNav();
        return;
      }

      if (
        text.includes('START') ||
        text.includes('RACE NOW') ||
        text.includes('DRIVE') ||
        text.includes('LAUNCH') ||
        aria.includes('START')
      ) {
        playUiConfirm();
        return;
      }

      if (
        text.includes('CLOSE') ||
        text.includes('CANCEL') ||
        text.includes('BACK') ||
        aria.includes('CLOSE') ||
        aria.includes('BACK')
      ) {
        playUiBack();
        return;
      }

      playUiClick();
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | null;
      if (target && target.tagName === 'INPUT' && target.type === 'range') {
        initAudioFromGesture();
        playUiSlider();
      }
    };

    window.addEventListener('click', handlePointerDown, { capture: true, passive: true });
    window.addEventListener('input', handleInput, { capture: true, passive: true });

    return () => {
      unsub();
      window.removeEventListener('click', handlePointerDown, { capture: true });
      window.removeEventListener('input', handleInput, { capture: true });
    };
  }, []);

  return null;
}
