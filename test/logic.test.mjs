// Twin Lanterns — logic tests (Node, stdlib only).
// Exercises engine.js without a browser: every difference is findable by
// clicking its exact centre, a far-away click misses, hints work, the timer
// expires, and a full playthrough of every level wins with the right score.
// Run: node test/logic.test.mjs   (exit 0 = all pass)

import assert from 'node:assert/strict';
import {
  clickAt,
  createGame,
  currentLevel,
  foundCount,
  nextLevel,
  remainingCount,
  startGame,
  startLevel,
  tick,
  useHint,
} from '../game/src/engine.js';
import { LEVELS, allDifferenceIds } from '../game/src/levels.js';
import { paintScene } from '../game/src/scenes.js';

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
}

// A stub canvas context that records calls but draws nothing, so the scene
// painters can run in Node (they must not throw for any level/variant).
function stubContext() {
  const gradient = { addColorStop() {} };
  const target = {
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    save() {}, restore() {}, beginPath() {}, closePath() {}, moveTo() {},
    lineTo() {}, quadraticCurveTo() {}, arc() {}, arcTo() {}, ellipse() {},
    rect() {}, fillRect() {}, strokeRect() {}, fill() {}, stroke() {},
    clip() {}, translate() {}, fillText() {}, roundRect() {},
    set fillStyle(_) {}, set strokeStyle(_) {}, set lineWidth(_) {},
    set lineCap(_) {}, set lineJoin(_) {}, set font(_) {}, set textAlign(_) {},
    set globalAlpha(_) {},
  };
  return new Proxy(target, {
    get(t, key) {
      if (key in t) return t[key];
      return () => {};
    },
    set(t, key, value) {
      t[key] = value;
      return true;
    },
  });
}

check('all three levels paint left and right without throwing', () => {
  const ctx = stubContext();
  for (const level of LEVELS) {
    paintScene(ctx, level.id, new Set());
    paintScene(ctx, level.id, new Set(level.differences.map((d) => d.id)));
  }
});

check('every difference id is unique across levels', () => {
  const ids = allDifferenceIds();
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(ids.length, 24);
});

check('clicking each difference centre finds it; a far click misses', () => {
  for (const level of LEVELS) {
    const game = createGame();
    startLevel(game, LEVELS.indexOf(level));
    for (const diff of level.differences) {
      const out = clickAt(game, diff.x, diff.y, 1000);
      assert.ok(
        out.result === 'hit' || out.result === 'levelComplete',
        `${diff.id} should be a hit (got ${out.result})`,
      );
    }
    assert.equal(foundCount(game), level.differences.length);
    assert.equal(remainingCount(game), 0);
    // A fresh level: a click well clear of every difference misses.
    const game2 = createGame();
    startLevel(game2, LEVELS.indexOf(level));
    let missPoint = null;
    for (let y = 20; y < 540 && !missPoint; y += 20) {
      for (let x = 20; x < 580 && !missPoint; x += 20) {
        const clear = level.differences.every(
          (d) => Math.hypot(x - d.x, y - d.y) > (d.r || 30) + 15,
        );
        if (clear) missPoint = { x, y };
      }
    }
    assert.ok(missPoint, 'a clear point exists in the scene');
    const miss = clickAt(game2, missPoint.x, missPoint.y, 1000);
    assert.equal(miss.result, 'miss');
    assert.equal(game2.wrongClicks, 1);
    assert.equal(game2.combo, 0);
  }
});

check('clicking an already-found difference reports already, not a hit', () => {
  const game = createGame();
  startGame(game);
  const diff = LEVELS[0].differences[0];
  assert.equal(clickAt(game, diff.x, diff.y, 1000).result, 'hit');
  assert.equal(clickAt(game, diff.x, diff.y, 2000).result, 'already');
  assert.equal(foundCount(game), 1);
});

check('no two differences overlap (each centre is outside the others)', () => {
  for (const level of LEVELS) {
    for (const a of level.differences) {
      for (const b of level.differences) {
        if (a.id === b.id) continue;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        assert.ok(dist > (a.r || 30) + (b.r || 30) - 20, `${a.id} vs ${b.id} too close`);
      }
    }
  }
});

check('hint pulses the first unfound difference and costs 50', () => {
  const game = createGame();
  startGame(game);
  game.score = 500;
  const first = LEVELS[0].differences[0];
  clickAt(game, first.x, first.y, 1000);
  const target = useHint(game, 2000);
  assert.equal(target.id, LEVELS[0].differences[1].id);
  assert.equal(game.hintsLeft, 2);
  assert.equal(game.score, 500 + 100 - 50);
});

check('full playthrough of every level wins with score above the finds alone', () => {
  const game = createGame();
  startGame(game);
  for (let li = 0; li < LEVELS.length; li++) {
    const level = LEVELS[li];
    assert.equal(currentLevel(game).id, level.id);
    for (const diff of level.differences) {
      const out = clickAt(game, diff.x, diff.y, 1000);
      assert.ok(out.result === 'hit' || out.result === 'levelComplete');
    }
    const expectedState = li === LEVELS.length - 1 ? 'allComplete' : 'levelComplete';
    assert.equal(game.state, expectedState, `level ${level.id} end state`);
    assert.ok(game.stars >= 1 && game.stars <= 3, 'stars in 1..3');
    if (li < LEVELS.length - 1) assert.equal(nextLevel(game), true);
  }
  // 24 finds x 100 + combo bonuses + 3 time bonuses must beat 2400.
  assert.ok(game.score > 2400, `score ${game.score} should exceed 2400`);
  assert.equal(game.totalFound, 24);
});

check('timer expiring ends the level as gameOver', () => {
  const game = createGame();
  startGame(game);
  assert.equal(tick(game, LEVELS[0].timeLimit), 'timeout');
  assert.equal(game.state, 'gameOver');
  assert.equal(tick(game, 5), null);
});

check('wrong clicks never drive the score below zero', () => {
  const game = createGame();
  startGame(game);
  for (let i = 0; i < 10; i++) clickAt(game, 300, 540, 1000 + i);
  assert.equal(game.score, 0);
});

console.log(`\n${passed} logic tests passed.`);
