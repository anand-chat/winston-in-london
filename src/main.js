import * as C from './config.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { audio } from './audio.js';
import { drawMatrix } from './sprites/palette.js';
import { IDLE_1 } from './sprites/winston.js';
import { pad5 } from './hud.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = new Game();

// --- Favicon: Winston's face drawn to a data URI ---
(function favicon() {
  try {
    const fc = document.createElement('canvas');
    fc.width = 32; fc.height = 32;
    const f = fc.getContext('2d');
    f.imageSmoothingEnabled = false;
    // Head region of IDLE_1 (cols 10..22, rows 1..12)
    const head = IDLE_1.slice(1, 13).map(r => r.slice(10, 23));
    f.fillStyle = '#BFD4DE';
    f.fillRect(0, 0, 32, 32);
    drawMatrix(f, head, 2, 2, 2.2);
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = fc.toDataURL('image/png');
    document.head.appendChild(link);
  } catch { /* non-fatal */ }
})();

// --- Canvas sizing at devicePixelRatio, letterboxed ---
let viewScale = 1;
function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  viewScale = Math.min(vw / C.LOGICAL_WIDTH, vh / C.LOGICAL_HEIGHT);
  const cssW = C.LOGICAL_WIDTH * viewScale;
  const cssH = C.LOGICAL_HEIGHT * viewScale;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(viewScale * dpr, 0, 0, viewScale * dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
resize();

// --- DOM overlays ---
const overlayTitle = document.getElementById('title-overlay');
const overlayGameOver = document.getElementById('gameover-overlay');
const overlayPause = document.getElementById('pause-overlay');
const goSteps = document.getElementById('go-steps');
const goRecord = document.getElementById('go-record');
const titleHi = document.getElementById('title-hi');
const btnMute = document.getElementById('btn-mute');
const btnPause = document.getElementById('btn-pause');
const btnAgain = document.getElementById('btn-again');
const btnShare = document.getElementById('btn-share');
const copiedToast = document.getElementById('copied-toast');

function syncMuteIcon() {
  btnMute.textContent = audio.muted ? '\u{1F507}' : '\u{1F50A}';
  btnMute.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
}
syncMuteIcon();

function syncOverlays(state) {
  overlayTitle.hidden = state !== 'TITLE';
  overlayGameOver.hidden = state !== 'GAME_OVER';
  overlayPause.hidden = state !== 'PAUSED';
  btnPause.hidden = !(state === 'PLAYING' || state === 'PAUSED');
  if (state === 'TITLE') {
    titleHi.textContent = game.highScore > 0 ? `HI ${pad5(game.highScore)}` : '';
  }
  if (state === 'GAME_OVER') {
    goSteps.textContent = `after ${Math.floor(game.score).toLocaleString()} steps`;
    goRecord.hidden = !game.newRecord;
  }
}
game.onStateChange = syncOverlays;
syncOverlays(game.state);

// --- Input wiring ---
new Input(canvas, {
  gesture() { audio.init(); audio.resume(); },
  onJumpPress() { game.jumpPress(); },
  onJumpRelease() { game.jumpRelease(); },
  onDuckPress() { game.duckPress(); },
  onDuckRelease() { game.duckRelease(); },
  onStart() { game.start(); },
  onPause() { game.togglePause(); },
  onMute() { audio.init(); audio.toggleMute(); syncMuteIcon(); },
});

btnMute.addEventListener('click', (e) => {
  e.stopPropagation();
  audio.init(); audio.resume();
  audio.toggleMute();
  syncMuteIcon();
});
btnPause.addEventListener('click', (e) => {
  e.stopPropagation();
  game.togglePause();
});
btnAgain.addEventListener('click', (e) => {
  e.stopPropagation();
  audio.init(); audio.resume();
  game.start();
});
btnShare.addEventListener('click', async (e) => {
  e.stopPropagation();
  const text = `Winston caught his ball after ${Math.floor(game.score).toLocaleString()} steps through London. Beat that. ${location.href}`;
  let shared = false;
  try {
    if (navigator.share) {
      await navigator.share({ text });
      shared = true;
    }
  } catch { /* fall through to clipboard */ }
  if (!shared) {
    try {
      await navigator.clipboard.writeText(text);
      copiedToast.hidden = false;
      setTimeout(() => { copiedToast.hidden = true; }, 1600);
    } catch { /* degrade silently */ }
  }
});

// Auto-pause on tab hide / blur
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.pauseIfPlaying();
});
window.addEventListener('blur', () => game.pauseIfPlaying());

// --- Fixed timestep loop with interpolation ---
let last = performance.now();
let accumulator = 0;
let manualSim = false; // true when the debug API drives the simulation
let fps = 60, fpsCounter = 0, fpsTimer = 0;

const params = new URLSearchParams(location.search);
const debugMode = params.get('debug') === '1';

function frame(now) {
  const rawDt = Math.min(0.25, (now - last) / 1000);
  last = now;
  if (!manualSim) {
    accumulator += rawDt;
    let steps = 0;
    while (accumulator >= C.TIMESTEP && steps < C.MAX_CATCHUP_STEPS) {
      game.update(C.TIMESTEP);
      accumulator -= C.TIMESTEP;
      steps++;
    }
    if (steps === C.MAX_CATCHUP_STEPS) accumulator = 0;
  }
  const alpha = manualSim ? 1 : accumulator / C.TIMESTEP;
  game.render(ctx, alpha);
  renderCountdown();
  if (debugMode) renderDebugOverlay(rawDt);
  fpsCounter++;
  fpsTimer += rawDt;
  if (fpsTimer >= 0.5) { fps = Math.round(fpsCounter / fpsTimer); fpsCounter = 0; fpsTimer = 0; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function renderCountdown() {
  if (game.state !== 'COUNTDOWN') return;
  const n = game.countdownT < 0.4 ? 3 : game.countdownT < 0.8 ? 2 : 1;
  ctx.font = '800 64px ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(27,27,31,0.75)';
  ctx.fillText(String(n), C.LOGICAL_WIDTH / 2, 130);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
}

function renderDebugOverlay() {
  const s = game.getState();
  ctx.font = '12px ui-monospace, Menlo, monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(8, 8, 190, 64);
  ctx.fillStyle = '#D8F32A';
  ctx.fillText(`fps ${fps}  state ${s.state}`, 14, 20);
  ctx.fillText(`speed ${Math.round(s.speed)}  score ${s.score}`, 14, 36);
  ctx.fillText(`entities ${s.entityCount}`, 14, 52);
}

// --- Debug API ---
const api = {
  setSeed(n) { manualSim = true; this._tickAccum = 0; game.setSeed(n); },
  _tickAccum: 0,
  tick(ms) {
    this._tickAccum += ms / 1000;
    while (this._tickAccum >= C.TIMESTEP) {
      game.update(C.TIMESTEP);
      this._tickAccum -= C.TIMESTEP;
    }
  },
  getState() { return game.getState(); },
  spawn(type) { game.spawnObstacle(type); if (type === 'bus') { game.pendingBusHorn = null; game.spawnBusNow(); } },
  setSpeed(v) { game.speed = v; game.score = Math.max(game.score, ((v - C.SPEED_START) / C.SPEED_GAIN) * 100); },
  kill() { game.die(); },
  autopilot(on) { game.autopilotOn = on; },
  toggleHitboxes() { game.showHitboxes = !game.showHitboxes; },
  // extras for tests
  start() { game.start(); game.beginPlaying(); },
  config: C,
};
window.__game = api;
