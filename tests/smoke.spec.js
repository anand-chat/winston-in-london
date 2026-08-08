// @ts-check
const { test, expect } = require('@playwright/test');

function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

test('page loads with zero console errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('title → countdown → playing via keyboard', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  expect((await page.evaluate(() => window.__game.getState())).state).toBe('TITLE');
  await page.keyboard.press('Space');
  const s1 = await page.evaluate(() => window.__game.getState());
  expect(['COUNTDOWN', 'PLAYING']).toContain(s1.state);
  await page.waitForFunction(() => window.__game.getState().state === 'PLAYING', null, { timeout: 4000 });
});

test('title → countdown → playing via tap', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  const canvas = page.locator('#game');
  await canvas.dispatchEvent('touchstart', { touches: [{ identifier: 1, clientX: 300, clientY: 100 }], changedTouches: [{ identifier: 1, clientX: 300, clientY: 100 }] });
  const s1 = await page.evaluate(() => window.__game.getState());
  expect(['COUNTDOWN', 'PLAYING']).toContain(s1.state);
  await page.waitForFunction(() => window.__game.getState().state === 'PLAYING', null, { timeout: 4000 });
});

test('restart from game over resets score to zero', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  await page.evaluate(() => {
    window.__game.setSeed(7);
    window.__game.tick(3000);
    window.__game.kill();
    window.__game.tick(1500);
  });
  expect((await page.evaluate(() => window.__game.getState())).state).toBe('GAME_OVER');
  await page.keyboard.press('Space');
  // Session is in manual-sim mode after setSeed; advance time manually
  await page.evaluate(() => window.__game.tick(4000));
  const s = await page.evaluate(() => window.__game.getState());
  expect(s.state).toBe('PLAYING');
  expect(s.score).toBeLessThan(50);
});

test('no console errors after 60 seconds of simulated play', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  await page.evaluate(() => {
    window.__game.setSeed(3);
    window.__game.autopilot(true);
  });
  for (let i = 0; i < 60; i++) {
    await page.evaluate(() => window.__game.tick(1000));
  }
  // Let a few rendered frames pass too
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});
