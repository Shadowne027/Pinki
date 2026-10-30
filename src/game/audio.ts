// Audio system - Procedural music and sound effects
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicEnabled = true;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

export function resumeAudio() {
  getCtx();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function setMusicEnabled(enabled: boolean) {
  musicEnabled = enabled;
  if (!enabled) stopMusic();
}

function playNote(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.1, dest?: AudioNode) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(dest || getMaster());
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* ignore */ }
}

// ============ SOUND EFFECTS ============
export function playStep() {
  if (!musicEnabled) return;
  playNote(60 + Math.random() * 30, 0.04, 'square', 0.02);
}

export function playPickup() {
  if (!musicEnabled) return;
  playNote(523, 0.1, 'square', 0.08);
  setTimeout(() => playNote(659, 0.1, 'square', 0.08), 80);
  setTimeout(() => playNote(784, 0.15, 'square', 0.08), 160);
}

export function playDoor() {
  if (!musicEnabled) return;
  playNote(100, 0.4, 'sawtooth', 0.06);
  setTimeout(() => playNote(80, 0.3, 'sawtooth', 0.04), 200);
}

export function playScare() {
  if (!musicEnabled) return;
  playNote(80, 0.8, 'sawtooth', 0.15);
  playNote(85, 0.8, 'sawtooth', 0.12);
  playNote(120, 0.6, 'square', 0.1);
}

export function playLaugh() {
  if (!musicEnabled) return;
  const notes = [220, 260, 200, 240, 180, 220, 160, 200, 140];
  notes.forEach((n, i) => {
    setTimeout(() => playNote(n, 0.12, 'square', 0.05), i * 100);
  });
}

export function playVictory() {
  if (!musicEnabled) return;
  const melody = [523, 587, 659, 784, 659, 784, 1047];
  melody.forEach((n, i) => {
    setTimeout(() => playNote(n, 0.4, 'triangle', 0.1), i * 250);
  });
}

export function playMenuSelect() {
  if (!musicEnabled) return;
  playNote(440, 0.06, 'square', 0.06);
}

export function playHeartbeat() {
  if (!musicEnabled) return;
  playNote(40, 0.15, 'sine', 0.15);
  setTimeout(() => playNote(35, 0.12, 'sine', 0.1), 150);
}

// ============ MUSIC SYSTEM ============
const MUSIC: Record<string, { notes: number[]; tempo: number; wave: OscillatorType; vol: number; bass?: number[]; bassVol?: number }> = {
  menu: {
    notes: [220,0,261,0,220,0,196,0,220,0,261,0,293,0,261,0],
    tempo: 600, wave: 'sine', vol: 0.04,
    bass: [110,0,130,0,110,0,98,0], bassVol: 0.03,
  },
  exploration: {
    notes: [196,0,220,0,0,196,0,174,0,196,0,0,220,0,196,0],
    tempo: 500, wave: 'triangle', vol: 0.04,
    bass: [98,0,110,0,98,0,87,0], bassVol: 0.03,
  },
  creepy: {
    notes: [261,0,246,0,220,0,207,0,220,0,246,0,261,0,0,0],
    tempo: 450, wave: 'sine', vol: 0.04,
    bass: [130,0,123,0,110,0,103,0], bassVol: 0.03,
  },
  forest: {
    notes: [164,0,174,164,0,155,0,146,155,0,164,0,0,146,0,0],
    tempo: 380, wave: 'triangle', vol: 0.04,
    bass: [82,82,87,82,73,73,82,82], bassVol: 0.035,
  },
  chase: {
    notes: [330,330,392,330,294,330,392,440,392,330,294,330,392,330,294,262],
    tempo: 180, wave: 'square', vol: 0.05,
    bass: [165,165,196,165,147,165,196,220], bassVol: 0.04,
  },
  mystery: {
    notes: [293,0,329,0,349,0,329,0,293,0,261,0,293,0,0,0],
    tempo: 550, wave: 'sine', vol: 0.04,
    bass: [146,0,164,0,174,0,164,0], bassVol: 0.03,
  },
  industrial: {
    notes: [110,130,110,0,146,130,110,0,110,130,110,0,98,110,130,0],
    tempo: 300, wave: 'sawtooth', vol: 0.03,
    bass: [55,55,65,55,55,55,73,55], bassVol: 0.04,
  },
  finalBoss: {
    notes: [220,261,220,196,220,261,293,261,220,196,174,196,220,261,220,0],
    tempo: 350, wave: 'square', vol: 0.04,
    bass: [110,110,130,110,98,98,110,110], bassVol: 0.035,
  },
  ending: {
    notes: [523,0,659,0,784,0,880,0,784,0,659,0,523,0,0,0],
    tempo: 700, wave: 'sine', vol: 0.05,
  },
  hiding: {
    notes: [110,0,0,0,110,0,0,0,116,0,0,0,110,0,0,0],
    tempo: 800, wave: 'sine', vol: 0.02,
    bass: [55,0,65,0,55,0,0,0], bassVol: 0.015,
  },
};

let musicInterval: number | null = null;
let musicIdx = 0;
let currentTrack = '';

export function playMusic(trackName: string) {
  if (!musicEnabled) return;
  if (currentTrack === trackName && musicInterval) return;
  stopMusic();
  const m = MUSIC[trackName];
  if (!m) return;
  currentTrack = trackName;
  musicIdx = 0;

  musicInterval = window.setInterval(() => {
    const freq = m.notes[musicIdx % m.notes.length];
    if (freq > 0) playNote(freq, m.tempo / 1000 * 0.8, m.wave, m.vol);
    if (m.bass) {
      const bi = Math.floor(musicIdx / 2) % m.bass.length;
      const bf = m.bass[bi];
      if (bf > 0) playNote(bf, m.tempo / 1000 * 1.5, 'sine', m.bassVol || 0.03);
    }
    musicIdx++;
  }, m.tempo);
}

export function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  currentTrack = '';
  musicIdx = 0;
}
