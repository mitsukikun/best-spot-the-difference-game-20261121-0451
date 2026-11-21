// Twin Lanterns — Spot the Difference: bootstrap and input wiring.
// One file, one job: own the canvas, the animation loop, the DOM header
// (timer, counter, score, buttons) and every mouse/keyboard input. The rules
// live in engine.js, the drawing in render.js, the scenes in scenes.js.

import { CANVAS_HEIGHT, CANVAS_WIDTH, PANEL, RIGHT_PANEL_X } from './config.js';
import {
  backToTitle,
  clickAt,
  createGame,
  currentLevel,
  foundCount,
  nextLevel,
  pruneTransient,
  remainingCount,
  startGame,
  startLevel,
  tick,
  useHint,
} from './engine.js';
import { LEVELS } from './levels.js';
import { renderFrame } from './render.js';
import { applyShot, isShotMode } from './shots.js';
import {
  isMuted,
  playClick,
  playFind,
  playHint,
  playLose,
  playMiss,
  playTick,
  playWin,
  setMuted,
} from './audio.js';

const BEST_KEY = 'twin-lanterns-best';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = createGame();
game.bestScore = loadBest();

// --- DOM header ------------------------------------------------------------

const els = {
  levelName: document.getElementById('levelName'),
  timerText: document.getElementById('timerText'),
  timerBar: document.getElementById('timerBar'),
  counter: document.getElementById('counter'),
  score: document.getElementById('score'),
  hintBtn: document.getElementById('hintBtn'),
  soundBtn: document.getElementById('soundBtn'),
  restartBtn: document.getElementById('restartBtn'),
  status: document.getElementById('status'),
  tabs: [...document.querySelectorAll('[data-level]')],
};

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

function saveBest() {
  if (game.score <= game.bestScore) return;
  game.bestScore = game.score;
  try {
    window.localStorage.setItem(BEST_KEY, String(game.bestScore));
  } catch {
    // Best score is a nicety, never a failure.
  }
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateHud() {
  const level = currentLevel(game);
  els.levelName.textContent = `L${game.levelIndex + 1} · ${level.name}`;
  els.timerText.textContent = formatTime(game.timeLeft);
  els.timerText.classList.toggle('low', game.timeLeft <= 10 && game.state === 'playing');
  els.timerBar.style.width = `${Math.max(0, (game.timeLeft / level.timeLimit) * 100)}%`;
  els.timerBar.classList.toggle('low', game.timeLeft <= 10 && game.state === 'playing');
  els.counter.textContent =
    game.state === 'title'
      ? 'Find every difference'
      : `Found ${foundCount(game)} / ${level.differences.length}  •  ${remainingCount(game)} remain`;
  els.score.textContent = `Score ${game.score}`;
  els.hintBtn.textContent = `Hint (${game.hintsLeft})`;
  els.hintBtn.disabled = game.state !== 'playing' || game.hintsLeft <= 0;
  els.soundBtn.textContent = isMuted() ? 'Sound off' : 'Sound on';
  els.restartBtn.disabled = game.state === 'title';
  for (const tab of els.tabs) {
    tab.classList.toggle('active', Number(tab.dataset.level) === game.levelIndex);
  }
  els.status.textContent =
    game.state === 'playing'
      ? `${level.name}: ${foundCount(game)} of ${level.differences.length} differences found, ${formatTime(game.timeLeft)} left.`
      : game.state === 'title'
        ? 'Twin Lanterns spot the difference. Press Enter to play.'
        : game.state === 'levelComplete'
          ? `Level clear. Score ${game.score}. Press Enter for the next level.`
          : game.state === 'gameOver'
            ? `Time is up. You found ${foundCount(game)} of ${level.differences.length}. Press R to retry.`
            : `You found every difference. Final score ${game.score}. Press Enter to play again.`;
}

// --- input -----------------------------------------------------------------

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const point = {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
  // A click outside the canvas (or with a broken layout) has no scene point.
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
  return point;
}

// Which panel (0 left, 1 right) a canvas point is on, and its scene coords.
function panelAt(point) {
  if (
    point.y >= PANEL.y &&
    point.y <= PANEL.y + PANEL.h &&
    point.x >= PANEL.x &&
    point.x <= PANEL.x + PANEL.w
  ) {
    return { panel: 0, x: point.x - PANEL.x, y: point.y - PANEL.y };
  }
  if (
    point.y >= PANEL.y &&
    point.y <= PANEL.y + PANEL.h &&
    point.x >= RIGHT_PANEL_X &&
    point.x <= RIGHT_PANEL_X + PANEL.w
  ) {
    return { panel: 1, x: point.x - RIGHT_PANEL_X, y: point.y - PANEL.y };
  }
  return null;
}

function handleCanvasClick(event) {
  const now = performance.now();
  if (game.state === 'title') {
    playClick();
    startGame(game);
    updateHud();
    return;
  }
  if (game.state === 'levelComplete') {
    playClick();
    nextLevel(game);
    updateHud();
    return;
  }
  if (game.state === 'gameOver') {
    playClick();
    startLevel(game, game.levelIndex);
    updateHud();
    return;
  }
  if (game.state === 'allComplete') {
    playClick();
    startGame(game);
    updateHud();
    return;
  }
  const point = canvasPoint(event);
  if (!point) return;
  const hit = panelAt(point);
  if (!hit) return;
  const outcome = clickAt(game, hit.x, hit.y, now, hit.panel);
  if (outcome.result === 'hit') playFind();
  else if (outcome.result === 'levelComplete') playWin();
  else if (outcome.result === 'miss') playMiss();
  if (outcome.result === 'levelComplete' || game.state === 'allComplete') saveBest();
  updateHud();
}

function doHint() {
  if (game.state !== 'playing') return;
  const target = useHint(game, performance.now());
  if (target) playHint();
  updateHud();
}

function toggleSound() {
  setMuted(!isMuted());
  playClick();
  updateHud();
}

function restartLevel() {
  if (game.state === 'title') return;
  playClick();
  startLevel(game, game.levelIndex);
  updateHud();
}

canvas.addEventListener('click', handleCanvasClick);
els.hintBtn.addEventListener('click', doHint);
els.soundBtn.addEventListener('click', toggleSound);
els.restartBtn.addEventListener('click', restartLevel);
for (const tab of els.tabs) {
  tab.addEventListener('click', () => {
    playClick();
    startLevel(game, Number(tab.dataset.level));
    updateHud();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'enter') {
    if (game.state === 'title') startGame(game);
    else if (game.state === 'levelComplete') nextLevel(game);
    else if (game.state === 'allComplete') startGame(game);
    else if (game.state === 'gameOver') startLevel(game, game.levelIndex);
    playClick();
  } else if (key === 'h') {
    doHint();
  } else if (key === 'r') {
    restartLevel();
  } else if (key === 'm') {
    toggleSound();
  } else if (key === 't' || key === 'escape') {
    backToTitle(game);
    playClick();
  } else if (key === '1' || key === '2' || key === '3') {
    startLevel(game, Number(key) - 1);
    playClick();
  } else {
    return;
  }
  updateHud();
});

// --- main loop -------------------------------------------------------------

const params = new URLSearchParams(window.location.search);
const shot = isShotMode(params) ? applyShot(game, params) : null;
// Deep link: ?level=2 opens the harbor straight into play (handy for testing).
if (!shot && params.has('level')) {
  const idx = Number(params.get('level'));
  if (Number.isInteger(idx) && idx >= 0 && idx < LEVELS.length) startLevel(game, idx);
}
let lastTick = performance.now();
let lastWholeSecond = -1;

function frame(now) {
  if (!shot) {
    const dt = Math.min(0.1, (now - lastTick) / 1000);
    lastTick = now;
    if (game.state === 'playing') {
      const result = tick(game, dt);
      const whole = Math.ceil(game.timeLeft);
      if (game.timeLeft <= 10 && whole !== lastWholeSecond) {
        lastWholeSecond = whole;
        playTick();
      }
      if (result === 'timeout') {
        playLose();
        saveBest();
      }
    }
    pruneTransient(game, now);
  }
  renderFrame(ctx, game, now);
  updateHud();
  if (!shot) requestAnimationFrame(frame);
}

updateHud();
if (shot) {
  // Staged screenshot state: one still frame, clock frozen.
  renderFrame(ctx, game, 0);
  updateHud();
} else {
  requestAnimationFrame(frame);
}

// Expose the live state for automated play-testing (no network, no secrets).
window.__twinLanterns = { game, LEVELS };
