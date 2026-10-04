let audioCtx: AudioContext | null = null;
let masterVolume = 0.7;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try { audioCtx = new AudioContext(); } catch { return null; }
  }
  return audioCtx;
}

export function setVolume(v: number) {
  masterVolume = Math.max(0, Math.min(1, v));
}

export function getVolume(): number {
  return masterVolume;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const v = volume * masterVolume;
  gain.gain.setValueAtTime(v, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playActionSuccess() {
  playTone(520, 0.12, 'sine', 0.1);
  setTimeout(() => playTone(700, 0.15, 'sine', 0.1), 80);
}

export function playActionFail() {
  playTone(220, 0.2, 'square', 0.08);
  setTimeout(() => playTone(180, 0.25, 'square', 0.08), 120);
}

export function playCoinEarn() {
  playTone(800, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(1000, 0.08, 'sine', 0.1), 60);
  setTimeout(() => playTone(1200, 0.12, 'sine', 0.1), 120);
}

export function playCoinSpend() {
  playTone(600, 0.1, 'triangle', 0.08);
  setTimeout(() => playTone(400, 0.15, 'triangle', 0.08), 80);
}

export function playWarning() {
  playTone(440, 0.15, 'sawtooth', 0.06);
  setTimeout(() => playTone(440, 0.15, 'sawtooth', 0.06), 200);
}

export function playDilemma() {
  playTone(330, 0.2, 'sine', 0.1);
  setTimeout(() => playTone(415, 0.2, 'sine', 0.1), 150);
  setTimeout(() => playTone(330, 0.3, 'sine', 0.08), 300);
}

export function playChat() {
  playTone(880, 0.06, 'sine', 0.07);
  setTimeout(() => playTone(1100, 0.08, 'sine', 0.07), 50);
}

export function playGameStart() {
  playTone(440, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(550, 0.15, 'sine', 0.12), 120);
  setTimeout(() => playTone(660, 0.15, 'sine', 0.12), 240);
  setTimeout(() => playTone(880, 0.25, 'sine', 0.12), 360);
}

export function playGameEnd() {
  playTone(880, 0.2, 'sine', 0.12);
  setTimeout(() => playTone(660, 0.2, 'sine', 0.1), 200);
  setTimeout(() => playTone(440, 0.4, 'sine', 0.1), 400);
}

export function playFortune() {
  playTone(600, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(800, 0.1, 'sine', 0.1), 100);
  setTimeout(() => playTone(1000, 0.15, 'sine', 0.1), 200);
}
