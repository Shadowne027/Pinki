// Audio system - Procedural music and sound effects using Web Audio API
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let currentMusic: { stop: () => void } | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
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
  playNote(60 + Math.random() * 30, 0.04, 'square', 0.02);
}

export function playPickup() {
  playNote(523, 0.1, 'square', 0.07);
  setTimeout(() => playNote(659, 0.1, 'square', 0.07), 80);
  setTimeout(() => playNote(784, 0.15, 'square', 0.07), 160);
}

export function playDoor() {
  playNote(100, 0.4, 'sawtooth', 0.05);
  setTimeout(() => playNote(80, 0.3, 'sawtooth', 0.04), 200);
}

export function playScare() {
  const ctx = getCtx();
  const master = getMaster();
  // Dissonant chord
  playNote(80, 0.8, 'sawtooth', 0.12, master);
  playNote(85, 0.8, 'sawtooth', 0.1, master);
  playNote(120, 0.6, 'square', 0.08, master);
  // Noise burst
  try {
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;
    noise.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
  } catch (e) { /* ignore */ }
}

export function playLaugh() {
  const notes = [220, 260, 200, 240, 180, 220, 160, 200, 140];
  notes.forEach((n, i) => {
    setTimeout(() => playNote(n, 0.12, 'square', 0.04), i * 100);
  });
}

export function playVictory() {
  const melody = [523, 587, 659, 784, 659, 784, 1047];
  melody.forEach((n, i) => {
    setTimeout(() => playNote(n, 0.4, 'triangle', 0.08), i * 250);
  });
}

export function playMenuSelect() {
  playNote(440, 0.06, 'square', 0.05);
}

export function playHeartbeat() {
  playNote(40, 0.15, 'sine', 0.12);
  setTimeout(() => playNote(35, 0.12, 'sine', 0.08), 150);
}

// ============ PROCEDURAL MUSIC SYSTEM ============
type MusicPattern = {
  notes: number[];
  tempo: number;
  waveform: OscillatorType;
  volume: number;
  bassNotes?: number[];
  bassVolume?: number;
  padNotes?: number[];
  padVolume?: number;
};

const MUSIC_PATTERNS: Record<string, MusicPattern> = {
  // Menu - eerie, mysterious
  menu: {
    notes: [220, 0, 261, 0, 220, 0, 196, 0, 220, 0, 261, 0, 293, 0, 261, 0],
    tempo: 600,
    waveform: 'sine',
    volume: 0.03,
    padNotes: [110, 130],
    padVolume: 0.015,
  },
  // Level 1 - Ponyville abandoned - dark exploration
  exploration: {
    notes: [196, 0, 220, 0, 0, 196, 0, 174, 0, 196, 0, 0, 220, 0, 196, 0],
    tempo: 500,
    waveform: 'triangle',
    volume: 0.025,
    bassNotes: [98, 0, 110, 0, 98, 0, 87, 0],
    bassVolume: 0.02,
    padNotes: [98, 110],
    padVolume: 0.01,
  },
  // Level 2 - Sugarcube Corner - creepy bakery
  creepy: {
    notes: [261, 0, 246, 0, 220, 0, 207, 0, 220, 0, 246, 0, 261, 0, 0, 0],
    tempo: 450,
    waveform: 'sine',
    volume: 0.025,
    bassNotes: [130, 0, 123, 0, 110, 0, 103, 0],
    bassVolume: 0.018,
    padNotes: [130, 155],
    padVolume: 0.012,
  },
  // Level 3 - Everfree Forest - tense, being hunted
  forest: {
    notes: [164, 0, 174, 164, 0, 155, 0, 146, 155, 0, 164, 0, 0, 146, 0, 0],
    tempo: 380,
    waveform: 'triangle',
    volume: 0.03,
    bassNotes: [82, 82, 87, 82, 73, 73, 82, 82],
    bassVolume: 0.025,
  },
  // Chase music - fast, intense
  chase: {
    notes: [330, 330, 392, 330, 294, 330, 392, 440, 392, 330, 294, 330, 392, 330, 294, 262],
    tempo: 180,
    waveform: 'square',
    volume: 0.04,
    bassNotes: [165, 165, 196, 165, 147, 165, 196, 220],
    bassVolume: 0.035,
  },
  // Level 4 - Castle - mysterious, revelatory
  mystery: {
    notes: [293, 0, 329, 0, 349, 0, 329, 0, 293, 0, 261, 0, 293, 0, 0, 0],
    tempo: 550,
    waveform: 'sine',
    volume: 0.025,
    bassNotes: [146, 0, 164, 0, 174, 0, 164, 0],
    bassVolume: 0.018,
    padNotes: [146, 174, 220],
    padVolume: 0.01,
  },
  // Level 5 - Factory - industrial, mechanical
  industrial: {
    notes: [110, 130, 110, 0, 146, 130, 110, 0, 110, 130, 110, 0, 98, 110, 130, 0],
    tempo: 300,
    waveform: 'sawtooth',
    volume: 0.02,
    bassNotes: [55, 55, 65, 55, 55, 55, 73, 55],
    bassVolume: 0.03,
  },
  // Level 6 - Final party - distorted, climactic
  finalBoss: {
    notes: [220, 261, 220, 196, 220, 261, 293, 261, 220, 196, 174, 196, 220, 261, 220, 0],
    tempo: 350,
    waveform: 'square',
    volume: 0.03,
    bassNotes: [110, 110, 130, 110, 98, 98, 110, 110],
    bassVolume: 0.025,
    padNotes: [110, 138, 165],
    padVolume: 0.015,
  },
  // Ending - peaceful, bittersweet
  ending: {
    notes: [523, 0, 659, 0, 784, 0, 880, 0, 784, 0, 659, 0, 523, 0, 0, 0],
    tempo: 700,
    waveform: 'sine',
    volume: 0.04,
    padNotes: [261, 329, 392],
    padVolume: 0.02,
  },
  // Hiding - quiet, tense
  hiding: {
    notes: [110, 0, 0, 0, 110, 0, 0, 0, 116, 0, 0, 0, 110, 0, 0, 0],
    tempo: 800,
    waveform: 'sine',
    volume: 0.015,
    padNotes: [55, 65],
    padVolume: 0.01,
  },
};

class MusicPlayer {
  private intervalId: number | null = null;
  private noteIndex: number = 0;
  private pattern: MusicPattern | null = null;
  private padOscillators: OscillatorNode[] = [];
  private isPlaying: boolean = false;

  play(patternName: string) {
    if (this.isPlaying && this.pattern === MUSIC_PATTERNS[patternName]) return;
    this.stop();

    const pattern = MUSIC_PATTERNS[patternName];
    if (!pattern) return;

    this.pattern = pattern;
    this.noteIndex = 0;
    this.isPlaying = true;

    // Start pad/ambient drone
    this.startPad(pattern);

    // Start melody loop
    this.intervalId = window.setInterval(() => {
      if (!this.pattern || !this.isPlaying) return;
      this.playNextNote();
    }, pattern.tempo);
  }

  private startPad(pattern: MusicPattern) {
    if (!pattern.padNotes) return;
    try {
      const ctx = getCtx();
      const master = getMaster();

      pattern.padNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = pattern.padVolume || 0.01;

        // Slow LFO for movement
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.2 + i * 0.1;
        lfoGain.gain.value = 2;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(gain);
        gain.connect(master);
        osc.start();
        this.padOscillators.push(osc);
      });
    } catch (e) { /* ignore */ }
  }

  private playNextNote() {
    if (!this.pattern) return;
    const freq = this.pattern.notes[this.noteIndex % this.pattern.notes.length];
    if (freq > 0) {
      playNote(freq, this.pattern.tempo / 1000 * 0.8, this.pattern.waveform, this.pattern.volume);
    }

    // Bass line
    if (this.pattern.bassNotes) {
      const bassIdx = Math.floor(this.noteIndex / 2) % this.pattern.bassNotes.length;
      const bassFreq = this.pattern.bassNotes[bassIdx];
      if (bassFreq > 0) {
        playNote(bassFreq, this.pattern.tempo / 1000 * 1.5, 'sine', this.pattern.bassVolume || 0.02);
      }
    }

    this.noteIndex++;
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.padOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) { /* ignore */ }
    });
    this.padOscillators = [];
    this.pattern = null;
    this.noteIndex = 0;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

const musicPlayer = new MusicPlayer();

export function playMusic(trackName: string) {
  musicPlayer.play(trackName);
}

export function stopMusic() {
  musicPlayer.stop();
}

// Legacy compatibility
export function startAmbientLoop() {
  // Now handled by playMusic
}

export function stopAmbientLoop() {
  stopMusic();
}
