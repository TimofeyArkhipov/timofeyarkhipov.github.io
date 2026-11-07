// Tiny synthesized sound effects via the Web Audio API - no audio files to download.
import { STORAGE_KEYS } from './config';
import { load, save } from './storage';

export type Sfx = 'arrow' | 'cannon' | 'frost' | 'boom' | 'hit' | 'build' | 'sell' | 'upgrade' | 'leak' | 'wave' | 'win' | 'lose' | 'click';

interface Tone {
  type: OscillatorType;
  from: number;
  to: number;
  duration: number;
  volume: number;
  noise?: boolean;
}

const SOUNDS: Record<Sfx, Tone[]> = {
  arrow: [{ type: 'triangle', from: 900, to: 500, duration: 0.06, volume: 0.05 }],
  cannon: [{ type: 'sine', from: 160, to: 60, duration: 0.18, volume: 0.18 }],
  frost: [{ type: 'sine', from: 1400, to: 1900, duration: 0.09, volume: 0.04 }],
  boom: [{ type: 'sine', from: 120, to: 40, duration: 0.25, volume: 0.16, noise: true }],
  hit: [{ type: 'square', from: 300, to: 200, duration: 0.03, volume: 0.02 }],
  build: [
    { type: 'square', from: 330, to: 330, duration: 0.06, volume: 0.06 },
    { type: 'square', from: 494, to: 494, duration: 0.08, volume: 0.06 },
  ],
  upgrade: [
    { type: 'triangle', from: 440, to: 440, duration: 0.06, volume: 0.08 },
    { type: 'triangle', from: 660, to: 660, duration: 0.06, volume: 0.08 },
    { type: 'triangle', from: 880, to: 880, duration: 0.1, volume: 0.08 },
  ],
  sell: [{ type: 'triangle', from: 700, to: 350, duration: 0.15, volume: 0.07 }],
  leak: [{ type: 'sawtooth', from: 220, to: 110, duration: 0.25, volume: 0.07 }],
  wave: [
    { type: 'square', from: 262, to: 262, duration: 0.1, volume: 0.05 },
    { type: 'square', from: 392, to: 392, duration: 0.18, volume: 0.05 },
  ],
  win: [
    { type: 'triangle', from: 523, to: 523, duration: 0.12, volume: 0.09 },
    { type: 'triangle', from: 659, to: 659, duration: 0.12, volume: 0.09 },
    { type: 'triangle', from: 784, to: 784, duration: 0.3, volume: 0.09 },
  ],
  lose: [
    { type: 'sawtooth', from: 330, to: 300, duration: 0.2, volume: 0.07 },
    { type: 'sawtooth', from: 247, to: 220, duration: 0.4, volume: 0.07 },
  ],
  click: [{ type: 'square', from: 600, to: 600, duration: 0.025, volume: 0.03 }],
};

/** Minimal gap between two plays of the same sound - stops machine-gun noise with many towers. */
const MIN_GAP = 0.045;

class AudioService {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private lastPlayed = new Map<Sfx, number>();
  muted = load(STORAGE_KEYS.muted, false);

  /** Browsers only allow audio after a user gesture - call this on the first click/key. */
  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
      this.noise = this.makeNoise(this.ctx);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    save(STORAGE_KEYS.muted, this.muted);
    return this.muted;
  }

  play(name: Sfx): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    if (now - (this.lastPlayed.get(name) ?? -1) < MIN_GAP) return;
    this.lastPlayed.set(name, now);

    let t = now;
    for (const tone of SOUNDS[name]) {
      this.tone(ctx, tone, t);
      t += tone.duration * 0.85;
    }
  }

  private tone(ctx: AudioContext, tone: Tone, at: number): void {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(tone.volume, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + tone.duration);
    gain.connect(this.master!);

    const osc = ctx.createOscillator();
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.from, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.to), at + tone.duration);
    osc.connect(gain);
    osc.start(at);
    osc.stop(at + tone.duration + 0.02);

    if (tone.noise && this.noise) {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(tone.volume * 0.6, at);
      ng.gain.exponentialRampToValueAtTime(0.0001, at + tone.duration);
      src.connect(ng).connect(this.master!);
      src.start(at);
      src.stop(at + tone.duration + 0.02);
    }
  }

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }
}

export const audio = new AudioService();
