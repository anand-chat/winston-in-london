import * as C from '../config.js';
import { drawMatrix } from '../sprites/palette.js';
import { RUN_FRAMES, DUCK_FRAMES, IDLE_FRAMES, JUMP_RISE, JUMP_FALL, HURT, CATCH, IDLE_2 } from '../sprites/winston.js';

const IDLE_2_BLINK = IDLE_2.map(row => row.replaceAll('E', 'K'));

export class Winston {
  constructor(audio) {
    this.audio = audio;
    this.reset();
  }

  reset() {
    this.x = C.WINSTON_X;
    this.y = C.GROUND_Y;         // feet y
    this.prevY = this.y;
    this.vy = 0;
    this.grounded = true;
    this.ducking = false;
    this.duckHeld = false;
    this.jumpHeld = false;
    this.coyoteMs = 0;
    this.bufferMs = 0;
    this.animTime = 0;
    this.shield = false;
    this.slowTimer = 0;
    this.barkChance = 0.2;
    this.skin = null;
    this.skinScale = 1;
  }

  get width() { return C.WINSTON_W; }
  get height() { return this.ducking ? C.WINSTON_DUCK_H : C.WINSTON_H; }

  hitbox() {
    const i = C.WINSTON_HITBOX_INSET;
    return {
      x: this.x + i,
      y: this.y - this.height + i,
      w: this.width - 2 * i,
      h: this.height - 2 * i,
    };
  }

  pressJump(rng) {
    this.bufferMs = C.JUMP_BUFFER_MS;
    this.jumpHeld = true;
  }

  releaseJump() {
    this.jumpHeld = false;
    if (!this.grounded && this.vy < 0) this.vy *= C.JUMP_CUT_MULT;
  }

  pressDuck() { this.duckHeld = true; }
  releaseDuck() { this.duckHeld = false; }

  update(dt, rng) {
    this.prevY = this.y;
    const dtMs = dt * 1000;

    if (this.grounded) this.coyoteMs = C.COYOTE_TIME_MS;
    else this.coyoteMs = Math.max(0, this.coyoteMs - dtMs);

    if (this.bufferMs > 0) {
      this.bufferMs -= dtMs;
      if (this.grounded || this.coyoteMs > 0) {
        this.vy = C.JUMP_VELOCITY;
        this.grounded = false;
        this.coyoteMs = 0;
        this.bufferMs = 0;
        this.ducking = false;
        this.audio.jump();
        if (rng && rng.chance(this.barkChance)) this.audio.bark();
        this.jumped = true; // flag for dust particles
      }
    }

    if (!this.grounded) {
      const g = this.duckHeld ? C.GRAVITY * C.FAST_FALL_GRAVITY : C.GRAVITY;
      // Velocity Verlet: exact for constant acceleration, keeps the
      // analytic apex/airtime regardless of timestep.
      this.y += (this.vy + 0.5 * g * dt) * dt;
      this.vy += g * dt;
      if (this.y >= C.GROUND_Y) {
        this.y = C.GROUND_Y;
        this.vy = 0;
        this.grounded = true;
        this.landed = true; // flag for dust + sound
        this.audio.land();
      }
      this.ducking = false;
    } else {
      this.ducking = this.duckHeld;
    }

    if (this.slowTimer > 0) this.slowTimer -= dt;
    this.animTime += dt;
  }

  render(ctx, alpha, speedFrac, state, animOverride) {
    const y = this.prevY + (this.y - this.prevY) * alpha;
    const fps = C.ANIM_FPS_MIN + (C.ANIM_FPS_MAX - C.ANIM_FPS_MIN) * speedFrac;
    let frame;
    if (animOverride === 'hurt') frame = HURT;
    else if (animOverride === 'catch') frame = CATCH;
    else if (animOverride === 'idle') {
      const t = this.animTime;
      const blink = (t % 3) > 2.85;
      frame = blink ? IDLE_2_BLINK : IDLE_FRAMES[Math.floor(t * 2) % 2];
    } else if (!this.grounded) {
      frame = this.vy < 0 ? JUMP_RISE : JUMP_FALL;
    } else if (this.ducking) {
      frame = DUCK_FRAMES[Math.floor(this.animTime * fps / 2) % 2];
    } else {
      frame = RUN_FRAMES[Math.floor(this.animTime * fps) % 4];
    }

    const h = frame === DUCK_FRAMES[0] || frame === DUCK_FRAMES[1] ? C.WINSTON_DUCK_H : C.WINSTON_H;
    const scale = C.PIXEL_SCALE * this.skinScale;
    const drawY = y - h * this.skinScale;

    if (this.shield) {
      ctx.save();
      ctx.shadowColor = '#F5EFE3';
      ctx.shadowBlur = 12;
      drawMatrix(ctx, frame, this.x, drawY, scale, this.skin);
      ctx.restore();
    } else {
      drawMatrix(ctx, frame, this.x, drawY, scale, this.skin);
    }
  }
}

