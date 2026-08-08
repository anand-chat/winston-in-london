import { LOGICAL_WIDTH, LOGICAL_HEIGHT, GROUND_Y } from '../config.js';
import { PALETTE } from '../sprites/palette.js';

// Cobblestone band, kerb line, drain grates.
const TILE_W = 240;

export function renderGround(ctx, scrollX, wetness) {
  const bandH = LOGICAL_HEIGHT - GROUND_Y;
  ctx.fillStyle = '#8D939C';
  ctx.fillRect(0, GROUND_Y, LOGICAL_WIDTH, bandH);

  // Kerb line
  ctx.fillStyle = PALETTE.stone;
  ctx.fillRect(0, GROUND_Y, LOGICAL_WIDTH, 4);
  ctx.fillStyle = '#B7AD9C';
  ctx.fillRect(0, GROUND_Y + 4, LOGICAL_WIDTH, 2);

  // Paving: subtle wide slabs, low contrast
  const off = ((scrollX % TILE_W) + TILE_W) % TILE_W;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let row = 0; row < 3; row++) {
    const y = GROUND_Y + 12 + row * 16;
    const stagger = row % 2 ? 24 : 0;
    for (let x = -off - TILE_W + stagger; x < LOGICAL_WIDTH + TILE_W; x += 48) {
      ctx.fillRect(x + 1, y, 44, 12);
    }
  }

  // Drain grates every tile, softened
  ctx.fillStyle = 'rgba(63,70,80,0.55)';
  for (let x = -off; x < LOGICAL_WIDTH + TILE_W; x += TILE_W) {
    const gx = x + 150;
    ctx.fillRect(gx, GROUND_Y + 5, 34, 6);
    ctx.fillStyle = 'rgba(44,50,58,0.55)';
    for (let i = 0; i < 5; i++) ctx.fillRect(gx + 3 + i * 6, GROUND_Y + 6, 3, 4);
    ctx.fillStyle = 'rgba(63,70,80,0.55)';
  }

  // Wet sheen when raining
  if (wetness > 0) {
    ctx.globalAlpha = 0.12 * wetness;
    ctx.fillStyle = PALETTE.wet;
    ctx.fillRect(0, GROUND_Y, LOGICAL_WIDTH, bandH);
    ctx.globalAlpha = 1;
  }
}

// Puddle reflections of Winston (wobbling), drawn under him.
export function renderPuddleReflection(ctx, winstonX, winstonBottomY, t, wetness) {
  if (wetness <= 0.15) return;
  ctx.save();
  ctx.globalAlpha = 0.14 * wetness;
  ctx.fillStyle = PALETTE.ink;
  const wob = Math.sin(t * 7) * 2;
  ctx.beginPath();
  ctx.ellipse(winstonX + 23 + wob, GROUND_Y + 14, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
