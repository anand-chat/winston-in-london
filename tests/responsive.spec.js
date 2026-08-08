// @ts-check
const { test, expect } = require('@playwright/test');

const SIZES = [
  { w: 375, h: 667 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
  { w: 2560, h: 1440 },
];

for (const { w, h } of SIZES) {
  test(`renders and playable at ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    await page.waitForFunction(() => window.__game !== undefined);
    const canvas = page.locator('#game');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.width).toBeLessThanOrEqual(w + 1);
    // No horizontal page scroll
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(w + 1);
    // Playable: start via keyboard
    await page.keyboard.press('Space');
    await page.waitForFunction(() => window.__game.getState().state === 'PLAYING', null, { timeout: 4000 });
  });
}

test('touch tap jumps; bottom-third hold ducks', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  const canvas = page.locator('#game');
  const box = await canvas.boundingBox();
  const topY = box.y + box.height * 0.2;
  const botY = box.y + box.height * 0.9;
  const cx = box.x + box.width / 2;

  // Tap to start
  await canvas.dispatchEvent('touchstart', { touches: [{ identifier: 1, clientX: cx, clientY: topY }], changedTouches: [{ identifier: 1, clientX: cx, clientY: topY }] });
  await canvas.dispatchEvent('touchend', { touches: [], changedTouches: [{ identifier: 1, clientX: cx, clientY: topY }] });
  await page.waitForFunction(() => window.__game.getState().state === 'PLAYING', null, { timeout: 4000 });

  // Tap top region → jump
  await canvas.dispatchEvent('touchstart', { touches: [{ identifier: 2, clientX: cx, clientY: topY }], changedTouches: [{ identifier: 2, clientX: cx, clientY: topY }] });
  await page.waitForFunction(() => !window.__game.getState().winston.grounded, null, { timeout: 2000 });
  await canvas.dispatchEvent('touchend', { touches: [], changedTouches: [{ identifier: 2, clientX: cx, clientY: topY }] });
  await page.waitForFunction(() => window.__game.getState().winston.grounded, null, { timeout: 3000 });

  // Hold bottom third → duck
  await canvas.dispatchEvent('touchstart', { touches: [{ identifier: 3, clientX: cx, clientY: botY }], changedTouches: [{ identifier: 3, clientX: cx, clientY: botY }] });
  await page.waitForFunction(() => window.__game.getState().winston.ducking, null, { timeout: 2000 });
  await canvas.dispatchEvent('touchend', { touches: [], changedTouches: [{ identifier: 3, clientX: cx, clientY: botY }] });
  await page.waitForFunction(() => !window.__game.getState().winston.ducking, null, { timeout: 2000 });
});

test('all touch targets are at least 44x44', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  // Kill to game over so all buttons exist
  await page.evaluate(() => {
    window.__game.setSeed(1);
    window.__game.tick(1000);
    window.__game.kill();
    window.__game.tick(1500);
  });
  for (const id of ['btn-mute', 'btn-again', 'btn-share']) {
    const box = await page.locator(`#${id}`).boundingBox();
    expect(box.width, `${id} width`).toBeGreaterThanOrEqual(44);
    expect(box.height, `${id} height`).toBeGreaterThanOrEqual(44);
  }
});
