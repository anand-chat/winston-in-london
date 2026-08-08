import { MUTE_KEY } from './config.js';
import { storageGet, storageSet } from './storage.js';

const MAX_VOICES = 6;

class Synth {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.voices = 0;
    this.muted = storageGet(MUTE_KEY) === '1';
  }

  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    } catch { this.ctx = null; }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(m) {
    this.muted = m;
    storageSet(MUTE_KEY, m ? '1' : '0');
    if (this.master) this.master.gain.value = m ? 0 : 1;
  }

  toggleMute() { this.setMuted(!this.muted); return this.muted; }

  tone({ freq, type = 'sine', duration = 0.1, attack = 0.005, decay = 0.05, gain = 0.25, slideTo = null, delay = 0, vibrato = 0 }) {
    if (!this.ctx || this.muted || this.voices >= MAX_VOICES) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, t0 + duration);
      if (vibrato > 0) {
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 18;
        lfoGain.gain.value = vibrato;
        lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
        lfo.start(t0); lfo.stop(t0 + duration + decay);
      }
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + attack);
      g.gain.setValueAtTime(gain, t0 + Math.max(attack, duration - decay));
      g.gain.linearRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(g); g.connect(this.master);
      this.voices++;
      osc.onended = () => { this.voices--; };
      osc.start(t0); osc.stop(t0 + duration + 0.02);
    } catch { /* degrade silently */ }
  }

  noise({ duration = 0.1, gain = 0.15, freqStart = 2000, freqEnd = 400, delay = 0 }) {
    if (!this.ctx || this.muted || this.voices >= MAX_VOICES) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freqStart, t0);
      filter.frequency.linearRampToValueAtTime(freqEnd, t0 + duration);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t0);
      g.gain.linearRampToValueAtTime(0.0001, t0 + duration);
      src.connect(filter); filter.connect(g); g.connect(this.master);
      this.voices++;
      src.onended = () => { this.voices--; };
      src.start(t0);
    } catch { /* degrade silently */ }
  }

  // Named game sounds
  jump()  { this.tone({ freq: 420, slideTo: 680, type: 'triangle', duration: 0.09, attack: 0.005, decay: 0.04, gain: 0.22 }); }
  land()  { this.tone({ freq: 120, type: 'sine', duration: 0.06, gain: 0.2 }); this.noise({ duration: 0.05, gain: 0.06, freqStart: 900, freqEnd: 300 }); }
  bark()  {
    this.tone({ freq: 900, type: 'square', duration: 0.045, gain: 0.12 });
    this.tone({ freq: 640, type: 'square', duration: 0.045, gain: 0.12, delay: 0.085 });
  }
  bone()  { this.tone({ freq: 880, slideTo: 1320, type: 'sine', duration: 0.12, gain: 0.2 }); }
  heart() {
    this.tone({ freq: 660, type: 'sine', duration: 0.09, gain: 0.18 });
    this.tone({ freq: 880, type: 'sine', duration: 0.09, gain: 0.18, delay: 0.09 });
    this.tone({ freq: 1100, type: 'sine', duration: 0.12, gain: 0.18, delay: 0.18 });
  }
  milestone() {
    this.tone({ freq: 1046, type: 'sine', duration: 0.07, gain: 0.16 });
    this.tone({ freq: 1046, type: 'sine', duration: 0.07, gain: 0.16, delay: 0.1 });
  }
  yelp() { this.tone({ freq: 700, slideTo: 300, type: 'sawtooth', duration: 0.26, gain: 0.18, vibrato: 24 }); }
  horn() {
    this.tone({ freq: 220, type: 'square', duration: 0.5, gain: 0.1 });
    this.tone({ freq: 330, type: 'square', duration: 0.5, gain: 0.1 });
  }
  shieldBreak() { this.noise({ duration: 0.3, gain: 0.18, freqStart: 2400, freqEnd: 200 }); }
  tick() { this.tone({ freq: 780, type: 'sine', duration: 0.05, gain: 0.12 }); }
  splash() { this.noise({ duration: 0.12, gain: 0.1, freqStart: 1600, freqEnd: 500 }); }
}

export const audio = new Synth();
