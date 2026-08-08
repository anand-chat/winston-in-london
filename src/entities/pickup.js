import * as C from '../config.js';
import { drawMatrix } from '../sprites/palette.js';
import { BONE, HEART } from '../sprites/props.js';

const POOL_SIZE = 8;

export class Pickup {
  constructor() { this.active = false; }

  init(kind, x, y) {
    this.kind = kind; // 'bone' | 'heart'
    this.active = true;
    this.x = x;
    this.prevX = x;
    this.y = y;
    this.w = kind === 'bone' ? 18 : 16;
    this.h = kind === 'bone' ? 12 : 14;
    this.t = 0;
  }

  update(dt, speed) {
    this.prevX = this.x;
    this.t += dt;
    this.x -= speed * dt;
    if (this.x + this.w < -40) this.active = false;
  }

  hitbox() {
    return { x: this.x - 4, y: this.y - 4, w: this.w + 8, h: this.h + 8 };
  }

  render(ctx, alpha) {
    const x = this.prevX + (this.x - this.prevX) * alpha;
    const bob = Math.sin(this.t * 5) * 3;
    drawMatrix(ctx, this.kind === 'bone' ? BONE : HEART, x, this.y + bob, C.PIXEL_SCALE);
  }
}

export class PickupPool {
  constructor() {
    this.pool = [];
    for (let i = 0; i < POOL_SIZE; i++) this.pool.push(new Pickup());
  }
  spawn(kind, x, y) {
    for (const p of this.pool) {
      if (!p.active) { p.init(kind, x, y); return p; }
    }
    return null;
  }
  forEach(fn) { for (const p of this.pool) if (p.active) fn(p); }
  clear() { for (const p of this.pool) p.active = false; }
  count() { let n = 0; for (const p of this.pool) if (p.active) n++; return n; }
}
