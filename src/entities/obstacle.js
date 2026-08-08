import * as C from '../config.js';
import { drawMatrix } from '../sprites/palette.js';
import { CONE, PHONEBOX, BIN, PIGEON_1, PIGEON_2, CAB, SQUIRREL_1, SQUIRREL_2, BUS } from '../sprites/props.js';
import { PALETTE } from '../sprites/palette.js';

const POOL_SIZE = 16;

// Bus: only the body (top 58px of its 88px height) collides; the gap
// underneath is duckable.
export const BUS_OVERHANG_H = 64;

export class Obstacle {
  constructor() { this.active = false; }

  init(type, x, rng) {
    const def = C.OBSTACLES[type];
    this.type = type;
    this.def = def;
    this.active = true;
    this.x = x;
    this.prevX = x;
    this.w = def.w;
    this.h = def.h;
    this.t = 0;
    this.hit = false;
    if (type === 'pigeons') {
      this.y = def.flyY;
    } else if (type === 'bus') {
      this.y = C.GROUND_Y - def.h;
    } else {
      this.y = C.GROUND_Y - def.h;
    }
    this.pair = type === 'cone' && rng.chance(0.3);
    if (this.pair) this.w = def.w * 2 + 14;
    // Squirrel darting state
    this.dartPhase = 0;
    this.dartTimer = rng ? rng.range(0.25, 0.45) : 0.3;
    this.hornPlayed = false;
  }

  update(dt, speed) {
    this.prevX = this.x;
    this.t += dt;
    let vx = -speed;
    if (this.type === 'cab') vx = -speed * (1 + this.def.speedMult);
    if (this.type === 'bus') vx = -speed * 1.25;
    if (this.type === 'squirrel') {
      this.dartTimer -= dt;
      if (this.dartTimer <= 0) {
        this.dartPhase = (this.dartPhase + 1) % 2;
        this.dartTimer = this.dartPhase === 0 ? 0.35 : 0.22;
      }
      vx = this.dartPhase === 0 ? -speed * 1.45 : -speed * 0.55;
    }
    this.x += vx * dt;
    if (this.x + this.w < -60) this.active = false;
  }

  hitbox() {
    const i = C.OBSTACLE_HITBOX_INSET;
    if (this.type === 'bus') {
      return { x: this.x + i, y: this.y + i, w: this.w - 2 * i, h: BUS_OVERHANG_H - 2 * i };
    }
    return { x: this.x + i, y: this.y + i, w: this.w - 2 * i, h: this.h - 2 * i };
  }

  render(ctx, alpha) {
    const x = this.prevX + (this.x - this.prevX) * alpha;
    const s = C.PIXEL_SCALE;
    switch (this.type) {
      case 'cone':
        drawMatrix(ctx, CONE, x, this.y, s);
        if (this.pair) drawMatrix(ctx, CONE, x + this.def.w + 14, this.y, s);
        break;
      case 'phonebox': drawMatrix(ctx, PHONEBOX, x, this.y, s); break;
      case 'bin':
        drawMatrix(ctx, BIN, x, this.y, s);
        break;
      case 'pigeons': {
        const f = Math.floor(this.t * 10) % 2 ? PIGEON_1 : PIGEON_2;
        for (let i = 0; i < 3; i++) {
          const bob = Math.sin(this.t * 4 + i * 1.3) * 3;
          drawMatrix(ctx, f, x + i * 22, this.y + bob, s);
        }
        break;
      }
      case 'cab': drawMatrix(ctx, CAB, x, this.y, s); break;
      case 'squirrel': {
        const f = this.dartPhase === 0 ? SQUIRREL_1 : SQUIRREL_2;
        drawMatrix(ctx, f, x, this.y, s);
        break;
      }
      case 'bus': drawMatrix(ctx, BUS, x, this.y, s); break;
      case 'puddle': {
        ctx.fillStyle = PALETTE.wet;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#AFC4D2';
        ctx.beginPath();
        ctx.ellipse(x + this.w / 2 - 8, this.y + 2, this.w / 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
    }
  }
}

export class ObstaclePool {
  constructor() {
    this.pool = [];
    for (let i = 0; i < POOL_SIZE; i++) this.pool.push(new Obstacle());
  }
  spawn(type, x, rng) {
    for (const o of this.pool) {
      if (!o.active) { o.init(type, x, rng); return o; }
    }
    return null;
  }
  forEach(fn) { for (const o of this.pool) if (o.active) fn(o); }
  clear() { for (const o of this.pool) o.active = false; }
  count() { let n = 0; for (const o of this.pool) if (o.active) n++; return n; }
}
