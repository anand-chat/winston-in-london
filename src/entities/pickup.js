import * as C from '../config.js';
import { drawMatrix } from '../sprites/palette.js';
import { BONE, BISCUIT, CARROT, SAUSAGE, DRUMSTICK, HEART } from '../sprites/props.js';

// Each dog has a favourite treat; hearts restore a life.
const KINDS = {
  bone:    { sprite: BONE,    w: 18, h: 12 },
  biscuit: { sprite: BISCUIT, w: 16, h: 16 },
  carrot:  { sprite: CARROT,  w: 20, h: 14 },
  sausage: { sprite: SAUSAGE, w: 22, h: 10 },
  drumstick: { sprite: DRUMSTICK, w: 22, h: 14 },
  heart:   { sprite: HEART,   w: 16, h: 14 },
};

const POOL_SIZE = 8;

export class Pickup {
  constructor() { this.active = false; }

  init(kind, x, y) {
    this.kind = kind;
    this.active = true;
    this.x = x;
    this.prevX = x;
    this.y = y;
    this.w = KINDS[kind].w;
    this.h = KINDS[kind].h;
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
    drawMatrix(ctx, KINDS[this.kind].sprite, x, this.y + bob, C.PIXEL_SCALE);
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
