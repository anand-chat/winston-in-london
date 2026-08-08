import * as C from './config.js';
import { RNG } from './rng.js';
import { Winston } from './entities/winston.js';
import { Ball } from './entities/ball.js';
import { ObstaclePool, BUS_OVERHANG_H } from './entities/obstacle.js';
import { PickupPool } from './entities/pickup.js';
import { ParticleSystem } from './entities/particles.js';
import { Parallax } from './world/parallax.js';
import { renderPuddleReflection } from './world/ground.js';
import { Hud, pad5 } from './hud.js';
import { audio } from './audio.js';
import { storageGet, storageSet } from './storage.js';

// DYING is the happy "catching the ball" transition into GAME_OVER.
const STATES = ['BOOT', 'TITLE', 'COUNTDOWN', 'PLAYING', 'DYING', 'GAME_OVER', 'PAUSED'];
const WEATHERS = ['bright', 'overcast', 'drizzle'];

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class Game {
  constructor() {
    this.rng = new RNG(Math.floor(Math.random() * 1e9) || 1);
    this.winston = new Winston(audio);
    this.ball = new Ball();
    this.obstacles = new ObstaclePool();
    this.pickups = new PickupPool();
    this.particles = new ParticleSystem();
    this.parallax = new Parallax(this.rng);
    this.hud = new Hud();
    this.state = 'TITLE';
    this.highScore = parseInt(storageGet(C.HIGH_SCORE_KEY) || '0', 10) || 0;
    this.showHitboxes = false;
    this.autopilotOn = false;
    this.reducedMotion = typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.time = 0;
    this.resetRun();
    this.newRecord = false;
    this.onStateChange = null;
  }

  resetRun() {
    this.score = 0;
    this.speed = C.SPEED_START;
    this.distToNextSpawn = this.rng.range(C.GAP_MIN_SEC, C.GAP_MAX_SEC) * this.speed + 400;
    this.lastTypes = [];
    this.lastJumpTypeTime = -10;
    this.runTime = 0;
    this.nextMilestoneIdx = 0;
    this.lastHundred = 0;
    this.nextHeartScore = C.HEART_RARITY_POINTS * (0.7 + this.rng.float() * 0.6);
    this.winston.reset();
    this.ball.reset();
    this.obstacles.clear();
    this.pickups.clear();
    this.hud.reset();
    this.dyingT = 0;
    this.lives = C.LIVES;
    this.invulnT = 0;
    this.countdownT = 0;
    this.pendingBusHorn = null;
    this.newRecord = false;
    // Weather
    this.weatherIdx = 0;
    this.weatherT = 0;
    this.wetness = 0;
    this.targetWetness = 0;
    this.darken = 0;
    this.targetDarken = 0;
  }

  setState(s) {
    this.state = s;
    if (this.onStateChange) this.onStateChange(s);
  }

  setSeed(n) {
    this.rng.reseed(n);
    this.resetRun();
    this.setState('PLAYING');
  }

  // --- Input intents ---
  jumpPress() {
    if (this.state === 'PLAYING') this.winston.pressJump(this.rng);
  }
  jumpRelease() { this.winston.releaseJump(); }
  duckPress() { if (this.state === 'PLAYING') this.winston.pressDuck(); }
  duckRelease() { this.winston.releaseDuck(); }

  start() {
    if (this.state === 'TITLE' || this.state === 'GAME_OVER') {
      this.resetRun();
      this.setState('COUNTDOWN');
      audio.tick();
    } else if (this.state === 'COUNTDOWN' && this.countdownT > 0.15) {
      this.beginPlaying();
    }
  }

  beginPlaying() {
    this.setState('PLAYING');
  }

  togglePause() {
    if (this.state === 'PLAYING') this.setState('PAUSED');
    else if (this.state === 'PAUSED') this.setState('PLAYING');
  }

  pauseIfPlaying() {
    if (this.state === 'PLAYING') this.setState('PAUSED');
  }

  // --- Simulation ---
  update(dt) {
    this.time += dt;
    this.hud.update(dt);
    this.particles.update(dt);

    switch (this.state) {
      case 'TITLE':
        this.winston.animTime += dt;
        this.ball.update(dt, 0);
        break;
      case 'COUNTDOWN': {
        const prev = this.countdownT;
        this.countdownT += dt;
        for (const mark of [0.4, 0.8]) {
          if (prev < mark && this.countdownT >= mark) audio.tick();
        }
        this.winston.animTime += dt;
        this.ball.update(dt, 0);
        if (this.countdownT >= 1.2) this.beginPlaying();
        break;
      }
      case 'PLAYING':
        this.updatePlaying(dt);
        break;
      case 'DYING': {
        this.dyingT += dt;
        if (this.dyingT * 1000 >= C.DYING_MS) {
          this.ball.rollToStop(this.winston.x + 40);
          this.setState('GAME_OVER');
          if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            storageSet(C.HIGH_SCORE_KEY, String(this.highScore));
            this.newRecord = true;
            this.particles.emit('heart', C.LOGICAL_WIDTH / 2, 140, 14, this.rng);
          }
        }
        break;
      }
      case 'GAME_OVER':
        this.ball.update(dt, 0);
        break;
    }
  }

  updatePlaying(dt) {
    if (this.autopilotOn) this.autopilotStep(dt);

    this.runTime += dt;

    // Speed ramp: SPEED_GAIN px/s per 100 points
    this.speed = Math.min(C.SPEED_MAX, C.SPEED_START + (this.score / 100) * C.SPEED_GAIN);
    let effSpeed = this.speed;
    if (this.winston.slowTimer > 0) effSpeed *= C.PUDDLE_SLOW_MULT;

    // Score scales with speed
    const prevScore = this.score;
    this.score += C.SCORE_RATE * (effSpeed / C.SPEED_START) * dt;

    // Milestones
    while (this.nextMilestoneIdx < C.MILESTONES.length &&
           this.score >= C.MILESTONES[this.nextMilestoneIdx].score) {
      this.hud.toast(C.MILESTONES[this.nextMilestoneIdx].text);
      this.nextMilestoneIdx++;
    }
    // Every 100: beeps + flash + heart pop
    if (Math.floor(this.score / 100) > Math.floor(prevScore / 100)) {
      audio.milestone();
      this.hud.flashScore();
      this.particles.emit('heart', C.LOGICAL_WIDTH - 60, 40, 1, this.rng);
    }

    // Winston physics
    const wasGrounded = this.winston.grounded;
    this.winston.update(dt, this.rng);
    if (this.winston.jumped) {
      this.winston.jumped = false;
      this.particles.emit('dust', this.winston.x + 10, C.GROUND_Y, 5, this.rng);
    }
    if (this.winston.landed) {
      this.winston.landed = false;
      this.particles.emit('dust', this.winston.x + 10, C.GROUND_Y, 6, this.rng);
    }

    // Ball
    this.ball.update(dt, (this.speed - C.SPEED_START) / (C.SPEED_MAX - C.SPEED_START));

    // World
    this.parallax.update(dt, effSpeed);

    // Weather cycle
    this.updateWeather(dt);

    // Spawning
    this.distToNextSpawn -= effSpeed * dt;
    if (this.distToNextSpawn <= 0) this.spawnObstacle();

    // Bus horn telegraph
    if (this.pendingBusHorn !== null) {
      this.pendingBusHorn -= dt;
      if (this.pendingBusHorn <= 0) {
        this.pendingBusHorn = null;
        this.spawnBusNow();
      }
    }

    // Obstacles
    if (this.invulnT > 0) this.invulnT -= dt;
    const wbox = this.winston.hitbox();
    this.obstacles.forEach(o => {
      o.update(dt, this.speed);
      if (!o.hit && overlap(wbox, o.hitbox())) {
        if (o.type === 'puddle') {
          o.hit = true;
          this.winston.slowTimer = C.PUDDLE_SLOW_SEC;
          this.particles.emit('splash', this.winston.x + 20, C.GROUND_Y, 10, this.rng);
          audio.splash();
        } else if (this.winston.shield) {
          o.hit = true;
          this.winston.shield = false;
          this.particles.emit('heart', this.winston.x + 20, this.winston.y - 30, 12, this.rng);
          audio.shieldBreak();
        } else if (this.invulnT > 0) {
          // brushing past during a second chance — no harm done
        } else if (this.lives > 1) {
          this.lives--;
          this.invulnT = C.SECOND_CHANCE_INVULN_SEC;
          o.hit = true;
          this.hud.toast('Winston shakes it off!');
          this.particles.emit('sparkle', this.winston.x + 20, this.winston.y - 30, 10, this.rng);
          audio.bark();
        } else {
          this.die();
        }
      }
    });

    // Pickups
    this.pickups.forEach(p => {
      p.update(dt, effSpeed);
      if (overlap(wbox, p.hitbox())) {
        p.active = false;
        if (p.kind === 'bone') {
          this.score += C.BONE_POINTS;
          this.particles.emit('sparkle', p.x + 9, p.y + 6, 8, this.rng);
          audio.bone();
        } else {
          if (!this.winston.shield) this.winston.shield = true;
          this.particles.emit('heart', p.x + 8, p.y + 7, 8, this.rng);
          audio.heart();
        }
      }
    });

    // Drizzle rain particles
    if (this.wetness > 0.5 && !this.reducedMotion) {
      this.rainAccum = (this.rainAccum || 0) + dt * 60;
      while (this.rainAccum > 1) {
        this.rainAccum -= 1;
        this.particles.emit('rain', this.rng.range(0, C.LOGICAL_WIDTH + 200), -10, 1, this.rng);
      }
    }
  }

  updateWeather(dt) {
    this.weatherT += dt;
    if (this.weatherT >= C.WEATHER_CYCLE_SEC) {
      this.weatherT = 0;
      this.weatherIdx = (this.weatherIdx + 1) % WEATHERS.length;
      const w = WEATHERS[this.weatherIdx];
      this.targetWetness = w === 'drizzle' ? 1 : 0;
      this.targetDarken = w === 'bright' ? 0 : w === 'overcast' ? 0.5 : 1;
    }
    const rate = dt / C.WEATHER_TRANSITION_SEC;
    this.wetness += Math.sign(this.targetWetness - this.wetness) * Math.min(rate, Math.abs(this.targetWetness - this.wetness));
    this.darken += Math.sign(this.targetDarken - this.darken) * Math.min(rate, Math.abs(this.targetDarken - this.darken));
  }

  availableTypes() {
    const types = [];
    for (const [name, def] of Object.entries(C.OBSTACLES)) {
      if (this.score >= def.unlock) types.push(name);
    }
    return types;
  }

  spawnObstacle(forceType) {
    let type = forceType;
    if (!type) {
      let candidates = this.availableTypes();
      // Rule: no duck-type within 0.9s (of travel) after a jump-type
      const sinceJumpType = this.runTime - this.lastJumpTypeTime;
      if (sinceJumpType < C.DUCK_AFTER_JUMP_MIN_SEC) {
        candidates = candidates.filter(t => C.OBSTACLES[t].type !== 'duck');
      }
      // Rule: never three consecutive of the same type
      if (this.lastTypes.length >= 2 &&
          this.lastTypes[0] === this.lastTypes[1]) {
        candidates = candidates.filter(t => t !== this.lastTypes[0]);
      }
      // Bus is rare
      if (candidates.includes('bus') && !this.rng.chance(0.25)) {
        candidates = candidates.filter(t => t !== 'bus');
      }
      type = this.rng.pick(candidates);
    }

    if (type === 'bus') {
      // Telegraph with horn, spawn after lead time
      if (this.pendingBusHorn === null) {
        audio.horn();
        this.pendingBusHorn = C.OBSTACLES.bus.hornLeadSec;
      }
    } else {
      // Fast movers close on Winston quicker than the scroll speed, which
      // would compress the gap the player just banked. Spawn them farther
      // right so their arrival time matches a normal obstacle's.
      const closingMult = type === 'cab' ? 1.18 : 1;
      const baseX = C.LOGICAL_WIDTH + 40;
      const extra = (baseX - C.WINSTON_X) * (closingMult - 1);
      const o = this.obstacles.spawn(type, baseX + extra, this.rng);
      if (o && C.OBSTACLES[type].type === 'jump') this.lastJumpTypeTime = this.runTime;
    }
    this.lastTypes.unshift(type);
    if (this.lastTypes.length > 2) this.lastTypes.pop();

    // Next gap in time units → pixels at current speed
    const gapSec = this.rng.range(C.GAP_MIN_SEC, C.GAP_MAX_SEC);
    this.distToNextSpawn = gapSec * this.speed;
    // Leave breathing room after a fast mover so the follow-up is reactable
    if (type === 'cab') {
      this.distToNextSpawn += 0.35 * this.speed;
    }
    // The bus arrives late (after the horn) and fast — hold the next spawn back
    if (type === 'bus') {
      this.distToNextSpawn = (C.OBSTACLES.bus.hornLeadSec + gapSec + 0.4) * this.speed;
    }

    // Occasionally spawn a bone in a jump arc after this obstacle
    if (this.rng.chance(0.3)) {
      this.pickups.spawn('bone', C.LOGICAL_WIDTH + 40 + this.rng.range(120, 260), C.GROUND_Y - 90 - this.rng.range(0, 40));
    }
    // Hearts are rare
    if (this.score >= this.nextHeartScore) {
      this.nextHeartScore = this.score + C.HEART_RARITY_POINTS * (0.7 + this.rng.float() * 0.6);
      this.pickups.spawn('heart', C.LOGICAL_WIDTH + 40 + this.rng.range(300, 500), C.GROUND_Y - 100);
    }
  }

  spawnBusNow() {
    this.obstacles.spawn('bus', C.LOGICAL_WIDTH + 40, this.rng);
  }

  // The run ends happily: Winston finally catches up with his ball.
  die() {
    this.setState('DYING');
    this.dyingT = 0;
    audio.bark();
    audio.heart();
    this.particles.emit('heart', this.winston.x + 20, this.winston.y - 40, 10, this.rng);
    this.particles.emit('sparkle', this.winston.x + 30, this.winston.y - 20, 8, this.rng);
  }

  // --- Autopilot (perfect-play bot for solvability tests) ---
  autopilotStep(dt) {
    const w = this.winston;
    let nearest = null;
    let nearestDist = Infinity;
    this.obstacles.forEach(o => {
      if (o.hit || o.type === 'puddle') return;
      // Keep an obstacle in consideration until it is fully behind Winston,
      // so ducks are held while pigeons/buses still overlap him.
      if (o.x + o.w <= w.x - 8) return;
      const dist = o.x - (w.x + w.width);
      if (dist < nearestDist) { nearest = o; nearestDist = dist; }
    });
    if (!nearest) {
      if (w.duckHeld) w.releaseDuck();
      return;
    }
    const def = nearest.def;
    // Effective closing speed
    let closing = this.speed;
    if (nearest.type === 'cab') closing = this.speed * 1.18;
    if (nearest.type === 'bus') closing = this.speed * 1.25;
    const timeToReach = nearestDist / closing;

    if (def.type === 'duck') {
      if (timeToReach < 0.5) { if (!w.duckHeld) w.pressDuck(); }
      else if (w.duckHeld && nearest.x + nearest.w < w.x - 4) w.releaseDuck();
    } else {
      if (w.duckHeld) w.releaseDuck();
      // Jump so apex covers obstacle: jump when time-to-reach ~ rise time
      const jumpLead = 0.30;
      if (w.grounded && timeToReach < jumpLead && timeToReach > 0) {
        w.pressJump(this.rng);
        w.jumpHeld = true;
      }
      // Fast-fall while descending whenever the nearest obstacle is either
      // already behind or still comfortably ahead — shortens airtime so
      // Winston is grounded and ready to react to the next obstacle.
      if (!w.grounded && w.vy > 0 && !w.duckHeld) {
        const behind = nearest.x + nearest.w < w.x;
        const farAhead = nearest.x > w.x + w.width + 40 && timeToReach > 0.28;
        if (behind || farAhead) w.pressDuck();
      }
    }
    // Release duck after passing duck obstacles
    if (w.duckHeld && (!nearest || nearest.x + nearest.w < w.x - 4) && w.grounded === false) {
      // keep fast-fall until landing
    }
  }

  // --- Rendering ---
  render(ctx, alpha) {
    const speedFrac = (this.speed - C.SPEED_START) / (C.SPEED_MAX - C.SPEED_START);
    // Day/night cycle: night falls by ~250 points, dawn returns by ~500, repeating
    const dayPhase = (this.score % 500) / 500;
    const duskT = 0.5 - 0.5 * Math.cos(dayPhase * Math.PI * 2);

    ctx.save();

    this.parallax.render(ctx, this.time, duskT, this.darken, this.wetness, this.reducedMotion);

    renderPuddleReflection(ctx, this.winston.x, this.winston.y, this.time, this.wetness);

    this.obstacles.forEach(o => o.render(ctx, alpha));
    this.pickups.forEach(p => p.render(ctx, alpha));

    // Winston + ball
    let anim = null;
    if (this.state === 'TITLE' || this.state === 'COUNTDOWN') anim = 'idle';
    if (this.state === 'DYING' || this.state === 'GAME_OVER') anim = 'catch';
    // Soft protective halo during second-chance invulnerability (no flicker)
    if (this.invulnT > 0) {
      ctx.save();
      ctx.globalAlpha = 0.25 * Math.min(1, this.invulnT / 0.4);
      ctx.fillStyle = '#F2C464';
      ctx.beginPath();
      ctx.ellipse(this.winston.x + 23, this.winston.y - 20, 34, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    this.winston.render(ctx, alpha, speedFrac, this.state, anim);
    this.ball.render(ctx);

    this.particles.render(ctx);

    if (this.state === 'PLAYING' || this.state === 'DYING' || this.state === 'PAUSED') {
      this.hud.render(ctx, this.score, this.highScore, this.lives);
    }

    if (this.showHitboxes) {
      ctx.strokeStyle = '#FF00AA';
      ctx.lineWidth = 1;
      const wb = this.winston.hitbox();
      ctx.strokeRect(wb.x, wb.y, wb.w, wb.h);
      this.obstacles.forEach(o => {
        const b = o.hitbox();
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });
      this.pickups.forEach(p => {
        const b = p.hitbox();
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });
    }

    ctx.restore();
  }

  getState() {
    const obs = [];
    this.obstacles.forEach(o => obs.push({ type: o.type, x: o.x, y: o.y, w: o.w, h: o.h }));
    return {
      state: this.state,
      score: Math.floor(this.score),
      speed: this.speed,
      winston: {
        x: this.winston.x,
        y: this.winston.y,
        vy: this.winston.vy,
        ducking: this.winston.ducking,
        grounded: this.winston.grounded,
        hitbox: this.winston.hitbox(),
        shield: this.winston.shield,
      },
      lives: this.lives,
      obstacles: obs,
      wetness: this.wetness,
      entityCount: this.obstacles.count() + this.pickups.count() + this.particles.count(),
    };
  }
}

export { pad5, BUS_OVERHANG_H };
