# Winston in London

An endless runner about a very good boy. Winston — a long-haired black-and-white
Chihuahua — chases his lime tennis ball through London, jumping over traffic
cones, phone boxes, bins, black cabs and squirrels, and ducking under pigeons
and double-decker buses. The city speeds up the longer he runs. When the run
ends, Winston finally catches the ball.

Every pixel is drawn programmatically on an HTML5 canvas and every sound is
synthesized with the Web Audio API — no image files, no audio files, no fonts,
no frameworks, no build step.

## Play

Open `index.html` from any static server. Locally:

```bash
python3 -m http.server 8123
# then visit http://localhost:8123
```

### Controls

| Action        | Desktop                         | Touch                          |
|---------------|---------------------------------|--------------------------------|
| Jump          | Space / ↑ / W / left click      | Tap top two-thirds of screen   |
| Duck          | Hold ↓ / S                      | Hold bottom third, or swipe ↓  |
| Start/restart | Space / Enter / click           | Tap                            |
| Pause         | P / Esc                         | Pause button                   |
| Mute          | M                               | Mute button                    |

Tapping jump while airborne cuts the jump short; holding duck in the air
fast-falls. There's a little coyote time and jump buffering, so inputs feel
forgiving.

## Tuning

All gameplay constants live in `src/config.js`:

- **Physics** — `GRAVITY`, `JUMP_VELOCITY`, `JUMP_CUT_MULT`, `FAST_FALL_GRAVITY`,
  `COYOTE_TIME_MS`, `JUMP_BUFFER_MS`.
- **Difficulty** — `SPEED_START`, `SPEED_MAX`, `SPEED_GAIN` (px/s gained per
  100 points), `GAP_MIN_SEC` / `GAP_MAX_SEC` (spawn gaps in seconds of travel),
  and per-obstacle `unlock` score thresholds in `OBSTACLES`.
- **Colors** — the full palette is in `src/sprites/palette.js`.

## Messages

Milestone toasts (including the secret message at 1000 points) are in
`MILESTONES` / `SECRET_MESSAGE` in `src/config.js`. Edit the strings there to
change what Winston tells you as you run.

## Tests

A Playwright suite covers state transitions, jump physics (apex, airtime,
frame-rate independence), seeded determinism, duck hitboxes, input buffering,
responsive layouts from 375px to 2560px, touch controls, and an autopilot that
must survive seeds 1–50 for three simulated minutes each.

```bash
npm install
npx playwright install chromium
npx playwright test
```

The game exposes a deterministic debug API at `window.__game`
(`setSeed`, `tick`, `getState`, `spawn`, `setSpeed`, `kill`, `autopilot`,
`toggleHitboxes`) that the tests drive.
