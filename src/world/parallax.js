import { LOGICAL_WIDTH, GROUND_Y } from '../config.js';
import { PALETTE } from '../sprites/palette.js';
import { renderSkyline } from './skyline.js';
import { renderGround } from './ground.js';

// 5 parallax layers: sky (0), far skyline (0.1), mid buildings (0.35),
// street furniture (0.75), ground (1.0).

function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return `rgb(${r},${g},${bl})`;
}

const DUSK_TOP = '#5C6B8A';
const DUSK_BOT = '#C98A5E';

const MID_TILE = 520;
const FURN_TILE = 460;

function drawTerraceRow(ctx, x, duskT) {
  // Georgian terrace: soft pastel fronts, chimney pots, sash windows.
  const baseY = GROUND_Y;
  const houses = [
    { w: 100, h: 96,  c: '#D9B8AE', d: '#3B4B8C' },
    { w: 84,  h: 82,  c: '#E3DACB', d: '#2E5940' },
    { w: 108, h: 104, c: '#C7A196', d: '#8C3B3B' },
    { w: 92,  h: 88,  c: '#DCC3B0', d: '#2E3338' },
  ];
  let hx = x;
  let houseIdx = 0;
  for (const hme of houses) {
    ctx.fillStyle = hme.c;
    ctx.fillRect(hx, baseY - hme.h, hme.w, hme.h);
    // White ground-floor band (classic stucco)
    ctx.fillStyle = 'rgba(245,239,227,0.55)';
    ctx.fillRect(hx, baseY - 26, hme.w, 26);
    // Cornice + roof line + chimney pots
    ctx.fillStyle = 'rgba(245,239,227,0.7)';
    ctx.fillRect(hx - 1, baseY - hme.h + 2, hme.w + 2, 3);
    ctx.fillStyle = '#8B939C';
    ctx.fillRect(hx - 2, baseY - hme.h - 8, hme.w + 4, 8);
    ctx.fillRect(hx + 12, baseY - hme.h - 22, 10, 14);
    ctx.fillRect(hx + hme.w - 26, baseY - hme.h - 22, 10, 14);
    // Front door with fanlight
    ctx.fillStyle = hme.d;
    ctx.fillRect(hx + hme.w / 2 - 7, baseY - 22, 14, 22);
    ctx.fillStyle = 'rgba(232,190,120,0.6)';
    ctx.fillRect(hx + hme.w / 2 - 5, baseY - 26, 10, 3);
    // Sash windows — lit pattern is fixed per window so nothing flickers
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < Math.floor(hme.w / 34); col++) {
        const wx = hx + 12 + col * 34;
        const wy = baseY - hme.h + 18 + row * 38;
        const lit = ((houseIdx * 7 + row * 13 + col * 29) % 11) < 2 + Math.round(duskT * 3);
        ctx.fillStyle = lit ? 'rgba(232,190,120,0.55)' : 'rgba(90,98,110,0.35)';
        ctx.fillRect(wx, wy, 14, 22);
        ctx.strokeStyle = 'rgba(245,239,227,0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, wy, 14, 22);
        ctx.beginPath();
        ctx.moveTo(wx, wy + 11); ctx.lineTo(wx + 14, wy + 11);
        ctx.stroke();
      }
    }
    hx += hme.w + 34;
    houseIdx++;
  }
  // A little Union Jack on one house
  ctx.fillStyle = '#3B4B8C';
  ctx.fillRect(x + 60, baseY - 124, 16, 10);
  ctx.strokeStyle = '#C0322B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 60, baseY - 124); ctx.lineTo(x + 76, baseY - 114);
  ctx.moveTo(x + 76, baseY - 124); ctx.lineTo(x + 60, baseY - 114);
  ctx.moveTo(x + 68, baseY - 124); ctx.lineTo(x + 68, baseY - 114);
  ctx.moveTo(x + 60, baseY - 119); ctx.lineTo(x + 76, baseY - 119);
  ctx.stroke();
  ctx.fillStyle = PALETTE.slate;
  ctx.fillRect(x + 59, baseY - 124, 2, 24);
}

// Kensington-Gardens-style park stretch: iron railings, big leafy
// trees, and a flower bed, with an occasional bandstand.
function drawParkRow(ctx, x, withBandstand) {
  const baseY = GROUND_Y;
  // Big soft tree canopies behind the railings
  const trees = [
    { tx: 60,  r: 42, c: '#6E8F63' },
    { tx: 180, r: 34, c: '#7B9A6E' },
    { tx: 320, r: 46, c: '#63855A' },
    { tx: 440, r: 30, c: '#7B9A6E' },
  ];
  for (const tr of trees) {
    ctx.fillStyle = '#5A4636';
    ctx.fillRect(x + tr.tx - 4, baseY - tr.r - 20, 8, tr.r + 20);
    ctx.fillStyle = tr.c;
    ctx.beginPath();
    ctx.arc(x + tr.tx, baseY - tr.r - 34, tr.r, 0, Math.PI * 2);
    ctx.arc(x + tr.tx - tr.r * 0.6, baseY - tr.r - 14, tr.r * 0.6, 0, Math.PI * 2);
    ctx.arc(x + tr.tx + tr.r * 0.6, baseY - tr.r - 14, tr.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (withBandstand) {
    const bx = x + 250;
    ctx.fillStyle = '#4A5560';
    ctx.beginPath();
    ctx.moveTo(bx - 34, baseY - 58);
    ctx.lineTo(bx, baseY - 86);
    ctx.lineTo(bx + 34, baseY - 58);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#CFC7B8';
    for (let i = -1; i <= 1; i++) ctx.fillRect(bx + i * 22 - 2, baseY - 58, 4, 46);
    ctx.fillStyle = '#8B939C';
    ctx.fillRect(bx - 38, baseY - 14, 76, 6);
  }
  // Iron railings along the whole stretch
  ctx.fillStyle = '#2E3338';
  ctx.fillRect(x, baseY - 30, 520, 3);
  for (let rx = 0; rx < 520; rx += 14) {
    ctx.fillRect(x + rx, baseY - 30, 2, 30);
  }
  // Flower bed in front of the railings
  const flowerColors = ['#D96A7B', '#E8B44C', '#C05B9E', '#E8748A'];
  for (let fx = 8; fx < 512; fx += 24) {
    ctx.fillStyle = '#5E7A55';
    ctx.fillRect(x + fx, baseY - 8, 3, 8);
    ctx.fillStyle = flowerColors[Math.floor(fx / 24) % flowerColors.length];
    ctx.beginPath();
    ctx.arc(x + fx + 1, baseY - 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFurniture(ctx, x, variant, t, duskT) {
  const baseY = GROUND_Y;
  switch (variant) {
    case 0: { // Lamp post
      ctx.fillStyle = '#2E3338';
      ctx.fillRect(x, baseY - 110, 5, 110);
      ctx.fillRect(x - 6, baseY - 116, 17, 8);
      ctx.fillStyle = duskT > 0.3 ? '#F2C464' : '#D8DCE0';
      ctx.fillRect(x - 3, baseY - 112, 11, 6);
      if (duskT > 0.3) {
        ctx.globalAlpha = 0.15 * duskT;
        ctx.fillStyle = '#F2C464';
        ctx.beginPath();
        ctx.arc(x + 2, baseY - 108, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      break;
    }
    case 1: { // Plane tree
      ctx.fillStyle = '#5A4636';
      ctx.fillRect(x, baseY - 66, 8, 66);
      ctx.fillStyle = PALETTE.moss;
      ctx.beginPath();
      ctx.arc(x + 4, baseY - 80, 30, 0, Math.PI * 2);
      ctx.arc(x - 14, baseY - 62, 20, 0, Math.PI * 2);
      ctx.arc(x + 22, baseY - 62, 20, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 2: { // Underground roundel
      ctx.fillStyle = '#2E3338';
      ctx.fillRect(x + 14, baseY - 92, 4, 92);
      ctx.fillStyle = '#C0322B';
      ctx.beginPath();
      ctx.arc(x + 16, baseY - 96, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F5EFE3';
      ctx.beginPath();
      ctx.arc(x + 16, baseY - 96, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2B4B9B';
      ctx.fillRect(x - 4, baseY - 100, 40, 8);
      break;
    }
    case 3: { // Bollards + bus stop
      ctx.fillStyle = '#2E3338';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + i * 26, baseY - 22, 8, 22);
      ctx.fillRect(x + 90, baseY - 96, 4, 96);
      ctx.fillStyle = '#C0322B';
      ctx.fillRect(x + 82, baseY - 104, 20, 12);
      break;
    }
    case 4: { // Park bench
      ctx.fillStyle = '#4C6B45';
      for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 3, baseY - 40 + i * 3, 44, 2);
      ctx.fillRect(x + 10, baseY - 26, 40, 4);
      ctx.fillStyle = '#2E3338';
      ctx.fillRect(x + 12, baseY - 22, 4, 22);
      ctx.fillRect(x + 44, baseY - 22, 4, 22);
      break;
    }
  }
}

export class Parallax {
  constructor(rng) {
    this.rng = rng;
    this.scroll = 0;
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      this.clouds.push({ x: i * 220 + 40, y: 24 + (i % 3) * 26, w: 70 + (i % 4) * 24, drift: 3 + (i % 3) * 2 });
    }
  }

  update(dt, speed) {
    this.scroll += speed * dt;
    for (const c of this.clouds) {
      c.x -= c.drift * dt;
      if (c.x + c.w < -20) c.x = LOGICAL_WIDTH + 30;
    }
  }

  render(ctx, t, duskT, darken, wetness, reducedMotion) {
    // Layer 1: sky gradient
    const dk = 1 - darken * 0.12;
    const top = lerpColor(PALETTE.sky2, DUSK_TOP, duskT);
    const bot = lerpColor(PALETTE.sky1, DUSK_BOT, duskT);
    const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    grad.addColorStop(0, shade(top, dk));
    grad.addColorStop(1, shade(bot, dk));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, GROUND_Y);

    // Clouds
    ctx.fillStyle = 'rgba(245,239,227,0.35)';
    for (const c of this.clouds) {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w / 2, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(c.x + c.w * 0.25, c.y - 8, c.w / 3, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 2: far skyline
    renderSkyline(ctx, this.scroll * 0.10, reducedMotion ? 0 : t, darken > 0.5);

    // Layer 3: mid buildings, with park stretches every third tile
    const midOff = ((this.scroll * 0.35) % MID_TILE + MID_TILE) % MID_TILE;
    ctx.save();
    ctx.globalAlpha = 0.6;
    for (let i = -1; i <= Math.ceil(LOGICAL_WIDTH / MID_TILE) + 1; i++) {
      const worldIdx = Math.floor((this.scroll * 0.35) / MID_TILE) + i;
      const kind = ((worldIdx % 3) + 3) % 3;
      const x = i * MID_TILE - midOff;
      if (kind === 2) drawParkRow(ctx, x, ((worldIdx % 6) + 6) % 6 === 2);
      else drawTerraceRow(ctx, x, duskT);
    }
    ctx.restore();

    // Layer 4: street furniture
    const fOff = ((this.scroll * 0.75) % (FURN_TILE * 5) + FURN_TILE * 5) % (FURN_TILE * 5);
    for (let i = -1; i <= Math.ceil(LOGICAL_WIDTH / FURN_TILE) + 4; i++) {
      const worldIdx = Math.floor((this.scroll * 0.75) / FURN_TILE) + i;
      const x = i * FURN_TILE - (fOff % FURN_TILE);
      const variant = ((worldIdx % 5) + 5) % 5;
      if (x > -120 && x < LOGICAL_WIDTH + 120) drawFurniture(ctx, x, variant, t, duskT);
    }

    // Layer 5: ground
    renderGround(ctx, this.scroll, wetness);
  }
}

function shade(rgbStr, mult) {
  const m = rgbStr.match(/\d+/g);
  if (!m) return rgbStr;
  return `rgb(${Math.round(m[0] * mult)},${Math.round(m[1] * mult)},${Math.round(m[2] * mult)})`;
}
