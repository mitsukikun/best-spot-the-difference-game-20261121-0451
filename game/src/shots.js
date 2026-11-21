// Twin Lanterns — Spot the Difference: staged states for screenshots.
// One file, one job: turn a `?shot=` query into a fixed, deterministic game
// state so the screenshots are real renders of the game's own code, taken
// in a browser, with the timer frozen and no animation running.
//
//   ?shot=start  — the title screen
//   ?shot=play   — mid-game: 4 of 7 found, markers on, 3 still hiding
//   ?shot=end    — the level-clear card with three stars
//
// The staged states are the same states a player reaches by playing; nothing
// here draws anything the game itself cannot show.

import { LEVELS } from './levels.js';

export function applyShot(game, params) {
  const shot = params.get('shot');
  if (!shot) return null;

  if (shot === 'start') {
    game.state = 'title';
    game.bestScore = 1250;
    return 'start';
  }

  if (shot === 'play') {
    const level = LEVELS[0];
    game.levelIndex = 0;
    game.state = 'playing';
    game.score = 430;
    game.levelScore = 430;
    game.combo = 2;
    game.wrongClicks = 1;
    game.timeLeft = 96;
    game.hintsLeft = 2;
    // Four found (markers on both panels), three still unfound.
    game.found = new Set(level.differences.slice(0, 4).map((d) => d.id));
    game.misses = [];
    game.hintTarget = null;
    return 'play';
  }

  if (shot === 'end') {
    const level = LEVELS[0];
    game.levelIndex = 0;
    game.state = 'levelComplete';
    game.score = 1420;
    game.levelScore = 1420;
    game.stars = 3;
    game.wrongClicks = 0;
    game.timeLeft = 54;
    game.found = new Set(level.differences.map((d) => d.id));
    game.misses = [];
    game.hintTarget = null;
    return 'end';
  }

  return null;
}

// True while a staged screenshot state is active: the clock never runs and
// the animation loop draws one still frame.
export function isShotMode(params) {
  return params.has('shot');
}
