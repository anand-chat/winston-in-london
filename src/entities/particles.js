import { MAX_PARTICLES } from '../config.js';
import { PALETTE } from '../sprites/palette.js';

// Object-pooled particles: dust, hearts, sparkles, splash, rain.
export class ParticleSystem {
  constructor() {
    this.pool = new Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool[i] = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, kind: 'dust', size: 2 };
    }
  }

  emit(kind, x, y, count, rng) {
    for (let i = 0; i < count; i++) {
      const p = this.get();
      if (!p) return;
      p.active = true;
      p.kind = kind;
      p.x = x; p.y = y;
      const r = rng ? rng.float.bind(rng) : Math.random;
      switch (kind) {
        case 'dust':
          p.vx = -20 - r() * 40; p.vy = -10 - r() * 30;
          p.life = p.maxLife = 0.35 + r() * 0.25; p.size = 2 + r() * 3;
          break;
        case 'heart':
          p.vx = (r() - 0.5) * 120; p.vy = -60 - r() * 100;
          p.life = p.maxLife = 0.7 + r() * 0.5; p.size = 3 + r() * 3;
          break;
        case 'sparkle':
          p.vx = (r() - 0.5) * 90; p.vy = (r() - 0.5) * 90;
          p.life = p.maxLife = 0.3 + r() * 0.3; p.size = 1.5 + r() * 2;
          break;
        case 'splash':
          p.vx = (r() - 0.7) * 140; p.vy = -80 - r() * 120;
          p.life = p.maxLife = 0.3 + r() * 0.3; p.size = 1.5 + r() * 2;
          break;
        case 'rain':
          p.vx = -140; p.vy = 420;
          p.life = p.maxLife = 1.2; p.size = 1;
          break;
      }
    }
  }

  get() {
    for (const p of this.pool) if (!p.active) return p;
    return null;
  }

  update(dt) {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'dust' || p.kind === 'splash' || p.kind === 'heart') p.vy += 240 * dt;
    }
  }

  clear() { for (const p of this.pool) p.active = false; }
  count() { let n = 0; for (const p of this.pool) if (p.active) n++; return n; }

  render(ctx) {
    for (const p of this.pool) {
      if (!p.active) continue;
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a * (p.kind === 'rain' ? 0.4 : 0.9);
      switch (p.kind) {
        case 'dust':
          ctx.fillStyle = '#C9C2B4';
          ctx.fillRect(p.x, p.y, p.size, p.size);
          break;
        case 'heart': {
          ctx.fillStyle = PALETTE.tongue;
          const s = p.size;
          ctx.fillRect(p.x - s / 2, p.y, s, s * 0.8);
          ctx.fillRect(p.x - s * 0.8, p.y - s * 0.3, s * 0.6, s * 0.6);
          ctx.fillRect(p.x + s * 0.2, p.y - s * 0.3, s * 0.6, s * 0.6);
          break;
        }
        case 'sparkle':
          ctx.fillStyle = '#FFF7D6';
          ctx.fillRect(p.x - p.size / 2, p.y, p.size, 1.5);
          ctx.fillRect(p.x, p.y - p.size / 2, 1.5, p.size);
          break;
        case 'splash':
          ctx.fillStyle = PALETTE.wet;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          break;
        case 'rain':
          ctx.strokeStyle = PALETTE.wet;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 3, p.y - 9);
          ctx.stroke();
          break;
      }
    }
    ctx.globalAlpha = 1;
  }
}
