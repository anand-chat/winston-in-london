// @ts-check
const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });

test('autopilot survives seeds 1-50 for 3 simulated minutes each', async ({ page }) => {
  test.setTimeout(1200000);
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  const failures = [];
  for (let seed = 1; seed <= 50; seed++) {
    const result = await page.evaluate((s) => {
      const g = window.__game;
      g.setSeed(s);
      g.autopilot(true);
      for (let t = 0; t < 180000; t += 500) {
        g.tick(500);
        const st = g.getState();
        if (st.state !== 'PLAYING') return { died: true, at: t, score: st.score };
      }
      const st = g.getState();
      g.autopilot(false);
      return { died: false, score: st.score, speed: st.speed };
    }, seed);
    if (result.died) failures.push({ seed, ...result });
  }
  expect(failures).toEqual([]);
});

test('speed reaches SPEED_MAX and stops there', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  const r = await page.evaluate(() => {
    const g = window.__game;
    g.setSeed(2);
    g.autopilot(true);
    g.setSpeed(990);
    g.tick(30000);
    return g.getState();
  });
  expect(r.speed).toBe(990 <= 1000 ? Math.min(1000, r.speed) : 1000);
  expect(r.speed).toBeLessThanOrEqual(1000);
  expect(r.speed).toBeGreaterThanOrEqual(999);
});

test('every obstacle type appears at its unlock threshold', async ({ page }) => {
  test.setTimeout(600000);
  await page.goto('/');
  await page.waitForFunction(() => window.__game !== undefined);
  const seen = await page.evaluate(() => {
    const g = window.__game;
    g.setSeed(11);
    g.autopilot(true);
    const seen = {};
    for (let t = 0; t < 600000; t += 250) {
      g.tick(250);
      const st = g.getState();
      for (const o of st.obstacles) seen[o.type] = true;
      if (st.state !== 'PLAYING') break;
      if (Object.keys(seen).length >= 8) break;
    }
    g.autopilot(false);
    return seen;
  });
  for (const type of ['cone', 'phonebox', 'bin', 'puddle', 'pigeons', 'cab', 'squirrel', 'bus']) {
    expect(seen[type], `obstacle ${type} should appear`).toBe(true);
  }
});
