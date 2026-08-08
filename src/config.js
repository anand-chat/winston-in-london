// All gameplay tuning constants. Single source of truth.

// Personal messages (easy to change)
export const GAME_TITLE = 'Winston in London';
export const SECRET_MESSAGE = 'I love you more than ball';

// Canvas
export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 340;
export const GROUND_Y = 280;
export const PIXEL_SCALE = 2;

// Physics (px/s, px/s^2)
export const GRAVITY = 2400;
export const JUMP_VELOCITY = -900;
export const JUMP_CUT_MULT = 0.40;
export const FAST_FALL_GRAVITY = 3.0;
export const COYOTE_TIME_MS = 80;
export const JUMP_BUFFER_MS = 120;
export const MAX_JUMPS = 1;

// Speed & difficulty
export const SPEED_START = 380;
export const SPEED_MAX = 1000;
export const SPEED_GAIN = 12;      // px/s added per 100 points
export const SCORE_RATE = 10;      // points per second at SPEED_START, scales with speed

// Obstacle spawning
export const GAP_MIN_SEC = 0.78;
export const GAP_MAX_SEC = 1.65;
export const DUCK_AFTER_JUMP_MIN_SEC = 0.9;

// Fixed timestep
export const TIMESTEP = 1 / 120;
export const MAX_CATCHUP_STEPS = 5;

// Hitboxes
export const OBSTACLE_HITBOX_INSET = 4;
export const WINSTON_HITBOX_INSET = 6;

// Winston sizes (logical px)
export const WINSTON_W = 46;
export const WINSTON_H = 40;
export const WINSTON_DUCK_H = 26;
export const WINSTON_X = 120;

// Ball
export const BALL_LEAD = 140;    // px ahead of Winston
export const BALL_RADIUS = 7;

// Animation
export const ANIM_FPS_MIN = 12;
export const ANIM_FPS_MAX = 16;

// Obstacle definitions: unlock score, size, kind
export const OBSTACLES = {
  cone:     { w: 26,  h: 34, unlock: 0,   type: 'jump' },
  phonebox: { w: 44,  h: 76, unlock: 0,   type: 'jump' },
  bin:      { w: 38,  h: 46, unlock: 150, type: 'jump' },
  puddle:   { w: 70,  h: 8,  unlock: 200, type: 'puddle' },
  pigeons:  { w: 66,  h: 18, unlock: 300, type: 'duck', flyY: 240 },
  cab:      { w: 96,  h: 52, unlock: 400, type: 'jump', speedMult: 0.18 },
  bus:      { w: 150, h: 88, unlock: 700, type: 'duck', hornLeadSec: 1.2 },
};

// Puddle effect
export const PUDDLE_SLOW_MULT = 0.85;
export const PUDDLE_SLOW_SEC = 0.4;

// Pickups
export const BONE_POINTS = 25;
export const HEART_RARITY_POINTS = 400; // ~1 per this many points

// Weather
export const WEATHER_CYCLE_SEC = 45;
export const WEATHER_TRANSITION_SEC = 4;

// Milestones
export const MILESTONES = [
  { score: 100,  text: 'Good boy!' },
  { score: 250,  text: 'Winston is warming up' },
  { score: 500,  text: 'Zoomies unlocked' },
  { score: 750,  text: 'Tail at maximum wag' },
  { score: 1000, text: SECRET_MESSAGE },
  { score: 1500, text: 'Winston has run further than any Chihuahua in history' },
  { score: 2000, text: "He's doing it for you" },
];

// Storage keys
export const HIGH_SCORE_KEY = 'winston_high_score';
export const MUTE_KEY = 'winston_muted';

// Lives: Winston gets a second chance before the run ends
export const LIVES = 2;
export const SECOND_CHANCE_INVULN_SEC = 1.5;

// Catch sequence (run end)
export const DYING_MS = 900;

// Particles
export const MAX_PARTICLES = 200;
