import { useCallback } from "react";
import { getDesktopSettings } from "../desktopSettings.js";

function beep(freq, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore if AudioContext unsupported/blocked
  }
}

export function useSound() {
  const playClick = useCallback(() => {
    if (!getDesktopSettings().soundOn) return;
    beep(600, 0.05);
  }, []);
  const playOpen = useCallback(() => {
    if (!getDesktopSettings().soundOn) return;
    beep(440, 0.09);
  }, []);
  return { playClick, playOpen };
}