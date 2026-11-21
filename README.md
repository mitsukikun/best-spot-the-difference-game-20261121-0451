# Twin Lanterns — Spot the Difference

A complete, original spot-the-difference game that runs offline in a desktop
browser from its own static files. Two near-identical pictures side by side,
a handful of tiny changes hiding in each pair — find them all before the
lantern burns down.

Entry for the make.fun bounty **best-spot-the-difference-game-20261121-0451**
($50, 1st–10th place $5 each). No entry fee.

## How to play

- **Click** a difference on either picture. A green ring and check mark the
  find on both panels; the counter updates (`Found 4 / 7 • 3 remain`).
- Wrong clicks cost 25 points and break your combo; consecutive finds build a
  combo bonus (+10 per step).
- **Hint (H)**: 3 per level, pulses the next hidden difference for a couple of
  seconds, costs 50 points.
- **Timer**: each level has its own clock (150s / 120s / 100s). Clearing a
  level banks a time bonus (5 points per second left) and up to 3 stars.
- **Levels**: 1 Sunny Garden (7 differences, Easy), 2 Moonlit Harbor (8,
  Medium), 3 Cozy Library (9, Hard) — 24 differences in all.
- **Keys**: `Enter` start / next level, `1/2/3` pick a level, `H` hint,
  `R` restart level, `M` sound on/off, `T`/`Esc` back to the title screen.
- Sounds are synthesized with WebAudio (find chime, miss buzz, win
  arpeggio) — no audio files, no network, no libraries.

## Run it

```sh
node serve.ts        # serves game/ on http://localhost:8080
```

Open http://localhost:8080 in desktop Chrome and play. The game loads no
network resource: every script is a file under `game/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the kit's `vendor/makefun-game.ts` library.

## Layout

| File | Job |
| --- | --- |
| `game/index.html` | Page shell + DOM header (timer, counter, score, buttons) |
| `game/src/main.js` | Bootstrap, input, animation loop, HUD wiring |
| `game/src/engine.js` | Rules + state machine (no DOM, testable from Node) |
| `game/src/render.js` | Everything drawn on the canvas |
| `game/src/scenes.js` | The three scenes, drawn by hand in canvas code |
| `game/src/levels.js` | Level data: differences, timers, difficulty |
| `game/src/config.js` | Shared constants (sizes, scoring, timers) |
| `game/src/audio.js` | Synthesized WebAudio sound effects |
| `game/src/random.js` | Seeded RNG for deterministic scenes |
| `game/src/shots.js` | Staged states for the screenshots (`?shot=`) |
| `main.ts` | Hand-in program: copies game + screenshots, writes dossier |
| `serve.ts` | Tiny static server for local play |
| `shots.json` | The three screenshot states |
| `screenshots/` | 3 real renders of the game's own code in a browser |

## Screenshots

The three screenshots are real renders of this game in headless Chromium,
staged with `?shot=` (the same states a player reaches by playing):

1. `1-start.jpg` — title screen over the garden scene.
2. `2-play.jpg` — mid-game: 4 of 7 found, markers on, 3 still hiding, counter
   showing `Found 4 / 7 • 3 remain`.
3. `3-end.jpg` — the level-clear card with three stars.

## Tests

```sh
node test/logic.test.mjs   # rules: hits, misses, hints, scoring, timeout, win
```

## License

MIT — see `LICENSE`. All art, sounds, names and levels are original.
