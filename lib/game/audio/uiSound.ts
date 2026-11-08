import { audio } from '../audio';

let lastSliderSound = 0;

/** Initialize the WebAudio context safely from any user gesture. */
export function initAudioFromGesture() {
  if (typeof window === 'undefined') return;
  if (!audio.ready) {
    audio.init();
  }
}

export function playUiClick() {
  audio.playUiClick();
}

export function playUiNav() {
  audio.playUiNav();
}

export function playUiSwitch() {
  audio.playUiSwitch();
}

export function playUiSlider() {
  const now = performance.now();
  if (now - lastSliderSound < 45) return;
  lastSliderSound = now;
  audio.playUiSlider();
}

export function playUiConfirm() {
  audio.playUiConfirm();
}

export function playUiBack() {
  audio.playUiBack();
}
