// Audio system using Web Audio API for procedural horror sounds
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* ignore */ }
}

export function playStep() {
  playTone(80 + Math.random() * 40, 0.05, 'square', 0.03);
}

export function playPickup() {
  playTone(440, 0.1, 'square', 0.08);
  setTimeout(() => playTone(660, 0.15, 'square', 0.08), 100);
}

export function playDoor() {
  playTone(120, 0.3, 'sawtooth', 0.06);
}

export function playScare() {
  playTone(100, 0.5, 'sawtooth', 0.15);
  playTone(150, 0.5, 'square', 0.1);
  setTimeout(() => playTone(80, 0.8, 'sawtooth', 0.12), 200);
}

export function playLaugh() {
  const notes = [200, 250, 180, 220, 160, 200, 140];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.15, 'square', 0.06), i * 120);
  });
}

export function playAmbient() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 55;
    gain.gain.value = 0.02;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      setTimeout(() => osc.stop(), 1100);
    }, 3000);
  } catch (e) { /* ignore */ }
}

export function playVictory() {
  const melody = [523, 659, 784, 1047];
  melody.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.3, 'square', 0.08), i * 200);
  });
}

export function playMenuSelect() {
  playTone(330, 0.08, 'square', 0.06);
}

let ambientInterval: number | null = null;
export function startAmbientLoop() {
  if (ambientInterval) return;
  ambientInterval = window.setInterval(() => {
    playAmbient();
  }, 5000);
}

export function stopAmbientLoop() {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
}
