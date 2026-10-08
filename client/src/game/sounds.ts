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

export function playMove() {
  playTone(350, 0.08, 'sine', 0.06);
  setTimeout(() => playTone(450, 0.1, 'sine', 0.06), 60);
}

export function playHelp() {
  playTone(523, 0.12, 'sine', 0.1);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.1), 100);
  setTimeout(() => playTone(784, 0.18, 'sine', 0.1), 200);
}

export function playAchievement() {
  playTone(523, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 80);
  setTimeout(() => playTone(784, 0.1, 'sine', 0.12), 160);
  setTimeout(() => playTone(1047, 0.25, 'sine', 0.15), 240);
}

export function playNotification() {
  playTone(700, 0.06, 'triangle', 0.06);
  setTimeout(() => playTone(900, 0.08, 'triangle', 0.06), 50);
}

let ambientInterval: ReturnType<typeof setInterval> | null = null;
let currentAmbientType: string | null = null;

export function playAmbient(locationType: string) {
  if (locationType === currentAmbientType) return;
  stopAmbient();
  currentAmbientType = locationType;

  const patterns: Record<string, () => void> = {
    transport: () => {
      playTone(120 + Math.random() * 60, 0.8, 'sawtooth', 0.015);
      if (Math.random() > 0.6) playTone(800 + Math.random() * 400, 0.1, 'square', 0.008);
    },
    food: () => {
      playTone(300 + Math.random() * 200, 0.15, 'sine', 0.01);
      if (Math.random() > 0.7) playTone(500 + Math.random() * 300, 0.1, 'triangle', 0.008);
    },
    shop: () => {
      if (Math.random() > 0.5) playTone(400 + Math.random() * 300, 0.1, 'sine', 0.01);
    },
    office: () => {
      if (Math.random() > 0.7) playTone(200 + Math.random() * 100, 0.3, 'sine', 0.008);
    },
    medical: () => {
      if (Math.random() > 0.8) playTone(880, 0.15, 'sine', 0.01);
    },
    public: () => {
      if (Math.random() > 0.5) playTone(250 + Math.random() * 150, 0.2, 'sine', 0.008);
      if (Math.random() > 0.7) playTone(600 + Math.random() * 200, 0.08, 'triangle', 0.006);
    },
    residential: () => {
      if (Math.random() > 0.8) playTone(400 + Math.random() * 200, 0.15, 'sine', 0.005);
    },
    education: () => {
      if (Math.random() > 0.6) playTone(350 + Math.random() * 100, 0.1, 'sine', 0.008);
    },
  };

  const pattern = patterns[locationType] || patterns.public;
  ambientInterval = setInterval(pattern, 3000 + Math.random() * 2000);
}

export function stopAmbient() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
  currentAmbientType = null;
}

