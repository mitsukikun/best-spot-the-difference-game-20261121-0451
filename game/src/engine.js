// Twin Lanterns — Spot the Difference: the rules and the state machine.
// One file, one job: everything about how the game plays, with no DOM and no
// canvas in it, so the rules can be tested from Node. Rendering lives in
// render.js; wiring lives in main.js.
//
// States: 'title' -> 'playing' -> 'levelComplete' | 'gameOver' -> (next level
// or back to 'title'). 'allComplete' is reached after the last level.

import {
  COMBO_BONUS_PER_STEP,
  DEFAULT_HIT_RADIUS,
  HINTS_PER_LEVEL,
  HINT_COST,
  HINT_PULSE_MS,
  MISS_MARK_MS,
  POINTS_PER_FIND,
  STAR_THRESHOLDS,
  TIME_BONUS_PER_SECOND,
  WRONG_CLICK_PENALTY,
} from './config.js';
import { LEVELS } from './levels.js';

export function createGame() {
  return {
    state: 'title',
    levelIndex: 0,
    score: 0,
    found: new Set(), // ids of differences found in this level
    combo: 0,
    wrongClicks: 0,
    timeLeft: LEVELS[0].timeLimit,
    hintsLeft: HINTS_PER_LEVEL,
    hintTarget: null, // difference id currently pulsing, if any
    hintUntil: 0, // performance.now() deadline of the pulse
    misses: [], // {x, y, until} red X marks, scene coords
    lastFindAt: 0,
    levelScore: 0,
    stars: 0,
    totalFound: 0,
    levelsCleared: 0,
  };
}

export function currentLevel(game) {
  return LEVELS[game.levelIndex];
}

export function foundCount(game) {
  return game.found.size;
}

export function remainingCount(game) {
  return currentLevel(game).differences.length - game.found.size;
}

export function startLevel(game, levelIndex) {
  const level = LEVELS[levelIndex];
  game.levelIndex = levelIndex;
  game.state = 'playing';
  game.found = new Set();
  game.combo = 0;
  game.wrongClicks = 0;
  game.timeLeft = level.timeLimit;
  game.hintsLeft = HINTS_PER_LEVEL;
  game.hintTarget = null;
  game.hintUntil = 0;
  game.misses = [];
  game.levelScore = 0;
  game.stars = 0;
  return game;
}

export function startGame(game) {
  game.score = 0;
  game.totalFound = 0;
  game.levelsCleared = 0;
  return startLevel(game, 0);
}

// The nearest unfound difference within its radius of a scene point, or null.
export function differenceAt(level, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const diff of level.differences) {
    const r = diff.r || DEFAULT_HIT_RADIUS;
    const dx = x - diff.x;
    const dy = y - diff.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= r && dist < bestDist) {
      best = diff;
      bestDist = dist;
    }
  }
  return best;
}

// A click at scene coordinates on one panel. Returns what happened; the
// caller renders it and plays the matching sound.
export function clickAt(game, x, y, nowMs, panel = 0) {
  if (game.state !== 'playing') return { result: 'ignored' };
  const level = currentLevel(game);
  const diff = differenceAt(level, x, y);
  if (diff && !game.found.has(diff.id)) {
    game.found.add(diff.id);
    game.combo += 1;
    const gained = POINTS_PER_FIND + COMBO_BONUS_PER_STEP * (game.combo - 1);
    game.score += gained;
    game.levelScore += gained;
    game.totalFound += 1;
    game.lastFindAt = nowMs;
    if (game.found.size === level.differences.length) {
      finishLevel(game);
      return { result: 'levelComplete', diff, gained };
    }
    return { result: 'hit', diff, gained };
  }
  if (diff && game.found.has(diff.id)) {
    return { result: 'already', diff };
  }
  game.combo = 0;
  game.wrongClicks += 1;
  game.score = Math.max(0, game.score - WRONG_CLICK_PENALTY);
  game.levelScore = Math.max(0, game.levelScore - WRONG_CLICK_PENALTY);
  game.misses.push({ x, y, panel, until: nowMs + MISS_MARK_MS });
  return { result: 'miss', x, y };
}

// Spend a hint: pulse the first still-hidden difference (in level order).
// Returns the hinted difference, or null when no hint is possible.
export function useHint(game, nowMs) {
  if (game.state !== 'playing') return null;
  if (game.hintsLeft <= 0) return null;
  const level = currentLevel(game);
  const target = level.differences.find((d) => !game.found.has(d.id));
  if (!target) return null;
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_COST);
  game.levelScore = Math.max(0, game.levelScore - HINT_COST);
  game.hintTarget = target.id;
  game.hintUntil = nowMs + HINT_PULSE_MS;
  return target;
}

// One clock tick (dt in seconds). Returns 'timeout' once, when time runs out.
export function tick(game, dt) {
  if (game.state !== 'playing') return null;
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  if (game.timeLeft <= 0) {
    game.state = 'gameOver';
    return 'timeout';
  }
  return null;
}

function finishLevel(game) {
  const level = currentLevel(game);
  const timeBonus = Math.round(game.timeLeft) * TIME_BONUS_PER_SECOND;
  game.score += timeBonus;
  game.levelScore += timeBonus;
  const fractionLeft = game.timeLeft / level.timeLimit;
  game.stars =
    game.wrongClicks === 0 && fractionLeft >= STAR_THRESHOLDS.three
      ? 3
      : fractionLeft >= STAR_THRESHOLDS.two
        ? 2
        : 1;
  game.levelsCleared += 1;
  game.state = game.levelIndex + 1 >= LEVELS.length ? 'allComplete' : 'levelComplete';
}

// Move on after a cleared level. Returns false when there is no next level.
export function nextLevel(game) {
  if (game.levelIndex + 1 >= LEVELS.length) return false;
  startLevel(game, game.levelIndex + 1);
  return true;
}

export function backToTitle(game) {
  game.state = 'title';
  game.levelIndex = 0;
  return game;
}

// Drop expired miss marks and hint pulses; called every frame.
export function pruneTransient(game, nowMs) {
  game.misses = game.misses.filter((m) => m.until > nowMs);
  if (game.hintTarget && nowMs > game.hintUntil) game.hintTarget = null;
}
