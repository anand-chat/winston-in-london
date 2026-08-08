import { LOGICAL_WIDTH, GROUND_Y } from '../config.js';
import { PALETTE } from '../sprites/palette.js';

// Procedural far-skyline of London landmarks, slate silhouettes at 55% opacity.
// Non-repeating for at least 90s of scroll at layer speed.

const HORIZON = GROUND_Y - 60;

function bigBen(ctx, x) {
  ctx.fillRect(x, HORIZON - 120, 22, 120);
  ctx.fillRect(x - 3, HORIZON - 128, 28, 10);
  // Clock face
  ctx.fillRect(x + 4, HORIZON - 112, 14, 14);
  // Spire
  ctx.beginPath();
  ctx.moveTo(x - 3, HORIZON - 128);
  ctx.lineTo(x + 11, HORIZON - 152);
  ctx.lineTo(x + 25, HORIZON - 128);
  ctx.closePath();
  ctx.fill();
}

function londonEye(ctx, x, t) {
  const cy = HORIZON - 62;
  const r = 55;
  ctx.save();
  ctx.translate(x, cy);
  ctx.rotate(t * 0.05);
  ctx.lineWidth = 3;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
    ctx.fillRect(Math.cos(a) * r - 3, Math.sin(a) * r - 3, 6, 6);
  }
  ctx.restore();
  // Support legs
  ctx.beginPath();
  ctx.moveTo(x - 30, HORIZON);
  ctx.lineTo(x, cy);
  ctx.lineTo(x + 30, HORIZON);
  ctx.lineTo(x + 22, HORIZON);
  ctx.lineTo(x, cy + 10);
  ctx.lineTo(x - 22, HORIZON);
  ctx.closePath();
  ctx.fill();
}

function stPauls(ctx, x) {
  ctx.fillRect(x, HORIZON - 40, 80, 40);
  ctx.beginPath();
  ctx.arc(x + 40, HORIZON - 40, 30, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x + 36, HORIZON - 82, 8, 14);
  ctx.fillRect(x + 38, HORIZON - 90, 4, 8);
}

function gherkin(ctx, x) {
  ctx.beginPath();
  ctx.moveTo(x, HORIZON);
  ctx.quadraticCurveTo(x - 14, HORIZON - 70, x + 16, HORIZON - 108);
  ctx.quadraticCurveTo(x + 46, HORIZON - 70, x + 32, HORIZON);
  ctx.closePath();
  ctx.fill();
}

function shard(ctx, x) {
  ctx.beginPath();
  ctx.moveTo(x, HORIZON);
  ctx.lineTo(x + 16, HORIZON - 150);
  ctx.lineTo(x + 20, HORIZON - 150);
  ctx.lineTo(x + 38, HORIZON);
  ctx.closePath();
  ctx.fill();
}

function towerBridge(ctx, x) {
  // Two towers + walkway
  for (const dx of [0, 90]) {
    ctx.fillRect(x + dx, HORIZON - 70, 20, 70);
    ctx.beginPath();
    ctx.moveTo(x + dx - 2, HORIZON - 70);
    ctx.lineTo(x + dx + 10, HORIZON - 88);
    ctx.lineTo(x + dx + 22, HORIZON - 70);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillRect(x + 20, HORIZON - 56, 70, 6);
  ctx.fillRect(x + 20, HORIZON - 40, 70, 5);
  // Suspension curves
  ctx.beginPath();
  ctx.moveTo(x - 30, HORIZON - 20);
  ctx.quadraticCurveTo(x - 5, HORIZON - 44, x + 8, HORIZON - 48);
  ctx.lineTo(x + 8, HORIZON - 42);
  ctx.quadraticCurveTo(x - 5, HORIZON - 38, x - 30, HORIZON - 14);
  ctx.closePath();
  ctx.fill();
}

function terrace(ctx, x) {
  ctx.fillRect(x, HORIZON - 52, 70, 52);
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 8 + i * 22, HORIZON - 60, 8, 8);
}

const LANDMARKS = [bigBen, terrace, londonEye, terrace, stPauls, gherkin, terrace, shard, towerBridge, terrace];
const SEGMENT_W = 340;
export const SKYLINE_TOTAL_W = LANDMARKS.length * SEGMENT_W; // 3400px, >90s at 0.1x speed

export function renderSkyline(ctx, scrollX, t, darken) {
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = darken ? '#3A434C' : PALETTE.slate;
  ctx.strokeStyle = ctx.fillStyle;
  const offset = ((scrollX % SKYLINE_TOTAL_W) + SKYLINE_TOTAL_W) % SKYLINE_TOTAL_W;
  for (let i = -1; i <= Math.ceil(LOGICAL_WIDTH / SEGMENT_W) + 1; i++) {
    const idx = ((Math.floor(offset / SEGMENT_W) + i) % LANDMARKS.length + LANDMARKS.length) % LANDMARKS.length;
    const x = i * SEGMENT_W - (offset % SEGMENT_W) + 40;
    if (idx === 2) LANDMARKS[idx](ctx, x, t);
    else LANDMARKS[idx](ctx, x);
  }
  ctx.restore();
}
