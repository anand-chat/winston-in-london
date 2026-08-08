import { LOGICAL_WIDTH } from './config.js';

const MONO = '600 16px ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export function pad5(n) { return String(Math.floor(n)).padStart(5, '0'); }

function drawHeart(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx - r / 2, cy - r / 4, r / 1.8, 0, Math.PI * 2);
  ctx.arc(cx + r / 2, cy - r / 4, r / 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - r, cy - r / 8);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx + r, cy - r / 8);
  ctx.closePath();
  ctx.fill();
}

export class Hud {
  constructor() {
    this.toasts = []; // { text, t }
    this.scoreFlash = 0;
  }

  reset() {
    this.toasts.length = 0;
    this.scoreFlash = 0;
  }

  toast(text) { this.toasts.push({ text, t: 0 }); }
  flashScore() { this.scoreFlash = 0.6; }

  update(dt) {
    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.toasts[i].t += dt;
      if (this.toasts[i].t > 2) this.toasts.splice(i, 1);
    }
    if (this.scoreFlash > 0) this.scoreFlash -= dt;
  }

  render(ctx, score, highScore, lives) {
    ctx.font = MONO;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';
    if (highScore > 0) {
      ctx.fillStyle = 'rgba(27,27,31,0.45)';
      ctx.fillText(`HI ${pad5(highScore)}`, LOGICAL_WIDTH - 130, 14);
    }
    const flashing = this.scoreFlash > 0 && Math.floor(this.scoreFlash * 10) % 2 === 0;
    ctx.fillStyle = flashing ? '#C0322B' : '#1B1B1F';
    ctx.fillText(pad5(score), LOGICAL_WIDTH - 20, 14);

    // Remaining chances as little hearts, top-left
    if (lives !== undefined) {
      for (let i = 0; i < lives; i++) {
        drawHeart(ctx, 20 + i * 22, 16, 7, '#E8748A');
      }
    }

    // Milestone toasts float up and fade
    ctx.textAlign = 'center';
    ctx.font = '700 20px ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
    for (const t of this.toasts) {
      const a = t.t < 1.5 ? 1 : 1 - (t.t - 1.5) / 0.5;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = '#1B1B1F';
      ctx.fillText(t.text, LOGICAL_WIDTH / 2, 90 - t.t * 22);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left';
  }
}
