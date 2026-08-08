import * as C from '../config.js';
import { PALETTE } from '../sprites/palette.js';

const TRAIL_LEN = 8;

export class Ball {
  constructor() { this.reset(); }

  reset() {
    this.t = 0;
    this.x = C.WINSTON_X + C.BALL_LEAD;
    this.y = C.GROUND_Y - 40;
    this.trail = [];
    for (let i = 0; i < TRAIL_LEN; i++) this.trail.push({ x: this.x, y: this.y });
    this.trailIdx = 0;
    this.rolling = false;
    this.rollX = 0;
    this.rollTarget = 0;
  }

  update(dt, speedFrac) {
    this.t += dt;
    if (this.rolling) {
      this.x += (this.rollTarget - this.x) * Math.min(1, dt * 4);
      this.y += (C.GROUND_Y - C.BALL_RADIUS - this.y) * Math.min(1, dt * 6);
    } else {
      const bounceHz = 1.1 + speedFrac * 0.6;
      this.x = C.WINSTON_X + C.BALL_LEAD + Math.sin(this.t * 0.9) * 14;
      const arc = Math.abs(Math.sin(this.t * Math.PI * bounceHz));
      this.y = C.GROUND_Y - C.BALL_RADIUS - arc * (52 + speedFrac * 22);
    }
    this.trail[this.trailIdx] = { x: this.x, y: this.y };
    this.trailIdx = (this.trailIdx + 1) % TRAIL_LEN;
  }

  rollToStop(targetX) {
    this.rolling = true;
    this.rollTarget = targetX;
  }

  render(ctx) {
    // Lime after-trail
    for (let i = 0; i < TRAIL_LEN; i++) {
      const idx = (this.trailIdx + i) % TRAIL_LEN;
      const p = this.trail[idx];
      const a = (i / TRAIL_LEN) * 0.25;
      ctx.globalAlpha = a;
      ctx.fillStyle = PALETTE.ball;
      const r = C.BALL_RADIUS * (0.4 + 0.6 * (i / TRAIL_LEN));
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.ball;
    ctx.beginPath();
    ctx.arc(this.x, this.y, C.BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    // Seam
    ctx.strokeStyle = PALETTE.ballLine;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y, C.BALL_RADIUS * 0.8, -0.6, 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x + 2, this.y, C.BALL_RADIUS * 0.8, Math.PI - 0.6, Math.PI + 0.6);
    ctx.stroke();
  }
}
