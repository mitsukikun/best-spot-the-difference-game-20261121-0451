// Twin Lanterns — Spot the Difference: everything drawn on the canvas.
// One file, one job: take the game state and paint one frame — the two panels,
// the found markers, the miss marks, the hint pulse, and the title / end
// overlays. It never changes the state; main.js owns the loop.

import { CANVAS_HEIGHT, CANVAS_WIDTH, PANEL, RIGHT_PANEL_X } from './config.js';
import { currentLevel, foundCount, remainingCount } from './engine.js';
import { LEVELS } from './levels.js';
import { paintScene } from './scenes.js';

const PANEL_LABELS = ['LEFT — the original', 'RIGHT — spot the changes'];

function drawPanelFrame(ctx, x, y, w, h, hot) {
  ctx.save();
  ctx.strokeStyle = hot ? '#ffd93b' : '#ffffff';
  ctx.lineWidth = hot ? 4 : 3;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function drawFoundMarker(ctx, x, y, r) {
  ctx.save();
  ctx.strokeStyle = '#2ecc40';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r + 9, 0, Math.PI * 2);
  ctx.stroke();
  // A check mark inside the ring.
  ctx.strokeStyle = '#2ecc40';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.4);
  ctx.lineTo(x + r * 0.5, y - r * 0.4);
  ctx.stroke();
  ctx.restore();
}

function drawMissMark(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = '#ff4136';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, x, y, nowMs) {
  const phase = (nowMs % 500) / 500;
  const r = 26 + phase * 14;
  ctx.save();
  ctx.strokeStyle = `rgba(255, 217, 59, ${1 - phase})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPanel(ctx, game, panelIndex, nowMs) {
  const level = currentLevel(game);
  const px = panelIndex === 0 ? PANEL.x : RIGHT_PANEL_X;
  const applied = panelIndex === 0 ? new Set() : new Set(level.differences.map((d) => d.id));
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, PANEL.y, PANEL.w, PANEL.h);
  ctx.clip();
  ctx.translate(px, PANEL.y);
  paintScene(ctx, level.id, applied);
  ctx.restore();

  // Markers for the differences already found — on both panels, at the same spot.
  for (const diff of level.differences) {
    if (!game.found.has(diff.id)) continue;
    drawFoundMarker(ctx, px + diff.x, PANEL.y + diff.y, diff.r || 30);
  }
  // Miss marks (only where the player actually clicked, on that panel).
  for (const miss of game.misses) {
    if (miss.panel !== panelIndex) continue;
    drawMissMark(ctx, px + miss.x, PANEL.y + miss.y);
  }
  // The hint pulse, on both panels.
  if (game.hintTarget) {
    const target = level.differences.find((d) => d.id === game.hintTarget);
    if (target) drawHintPulse(ctx, px + target.x, PANEL.y + target.y, nowMs);
  }
  drawPanelFrame(ctx, px, PANEL.y, PANEL.w, PANEL.h, game.state === 'playing');
}

function drawBackdrop(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#1b2a4a');
  g.addColorStop(1, '#0e1830');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawPanelLabels(ctx) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(PANEL_LABELS[0], PANEL.x + 4, 26);
  ctx.textAlign = 'right';
  ctx.fillText(PANEL_LABELS[1], RIGHT_PANEL_X + PANEL.w - 4, 26);
  ctx.restore();
}

function drawFooterHint(ctx, game) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const level = currentLevel(game);
  ctx.fillText(
    `${level.name} — ${level.difficulty}  •  Click a difference on either picture  •  H hint  •  R restart  •  M sound`,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - 8,
  );
  ctx.restore();
}

function dim(ctx, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(8, 12, 24, ${alpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}

function card(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawTitle(ctx, game) {
  drawBackdrop(ctx);
  // A little preview of the first scene behind the title card.
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.rect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
  ctx.clip();
  ctx.translate(PANEL.x, PANEL.y);
  paintScene(ctx, 'garden', new Set());
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.rect(RIGHT_PANEL_X, PANEL.y, PANEL.w, PANEL.h);
  ctx.clip();
  ctx.translate(RIGHT_PANEL_X, PANEL.y);
  paintScene(ctx, 'garden', new Set(LEVELS[0].differences.map((d) => d.id)));
  ctx.restore();

  card(ctx, 340, 130, 600, 380);
  ctx.save();
  ctx.fillStyle = '#1b2a4a';
  ctx.textAlign = 'center';
  ctx.font = '700 44px system-ui, sans-serif';
  ctx.fillText('Twin Lanterns', 640, 200);
  ctx.font = '600 24px system-ui, sans-serif';
  ctx.fillStyle = '#c94f6d';
  ctx.fillText('SPOT THE DIFFERENCE', 640, 238);
  ctx.fillStyle = '#333';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Two pictures. A handful of tiny changes.', 640, 282);
  ctx.fillText('Find them all before the lantern burns down.', 640, 308);
  ctx.font = '600 17px system-ui, sans-serif';
  ctx.fillStyle = '#1b2a4a';
  ctx.fillText('1  Sunny Garden — 7 differences — 150s', 640, 352);
  ctx.fillText('2  Moonlit Harbor — 8 differences — 120s', 640, 380);
  ctx.fillText('3  Cozy Library — 9 differences — 100s', 640, 408);
  ctx.fillStyle = '#c94f6d';
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.fillText('Click anywhere, or press Enter, to play', 640, 462);
  ctx.fillStyle = '#666';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Best score this browser: ' + (game.bestScore || 0), 640, 492);
  ctx.restore();
}

function drawStars(ctx, cx, y, stars) {
  ctx.save();
  ctx.font = '34px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = i + 1 < stars ? '#ffb400' : '#d8d8d8';
    ctx.fillText('★', cx + i * 44, y);
  }
  ctx.restore();
}

function drawLevelComplete(ctx, game) {
  dim(ctx, 0.55);
  card(ctx, 390, 150, 500, 340);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1b2a4a';
  ctx.font = '700 34px system-ui, sans-serif';
  ctx.fillText('Level clear!', 640, 210);
  drawStars(ctx, 640, 258, game.stars);
  ctx.fillStyle = '#333';
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText(`${currentLevel(game).name} — all differences found`, 640, 296);
  ctx.fillText(`Level score ${game.levelScore}  •  Total score ${game.score}`, 640, 326);
  ctx.fillStyle = '#c94f6d';
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.fillText('Press Enter for the next level', 640, 380);
  ctx.fillStyle = '#666';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('or press T to return to the title screen', 640, 412);
  ctx.restore();
}

function drawGameOver(ctx, game) {
  dim(ctx, 0.6);
  card(ctx, 390, 160, 500, 320);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1b2a4a';
  ctx.font = '700 34px system-ui, sans-serif';
  ctx.fillText("Time's up!", 640, 220);
  ctx.fillStyle = '#333';
  ctx.font = '17px system-ui, sans-serif';
  const level = currentLevel(game);
  ctx.fillText(
    `You found ${foundCount(game)} of ${level.differences.length} differences in ${level.name}.`,
    640,
    268,
  );
  ctx.fillText(`${remainingCount(game)} still hiding — so close!`, 640, 296);
  ctx.fillText(`Score ${game.score}`, 640, 330);
  ctx.fillStyle = '#c94f6d';
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.fillText('Press R to try this level again', 640, 384);
  ctx.fillStyle = '#666';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('or press T to return to the title screen', 640, 414);
  ctx.restore();
}

function drawAllComplete(ctx, game) {
  dim(ctx, 0.55);
  card(ctx, 340, 130, 600, 380);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1b2a4a';
  ctx.font = '700 38px system-ui, sans-serif';
  ctx.fillText('You found them all!', 640, 196);
  drawStars(ctx, 640, 244, 3);
  ctx.fillStyle = '#333';
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText('Every difference in all three scenes — 24 in total.', 640, 288);
  ctx.fillText(`Final score ${game.score}`, 640, 320);
  ctx.fillText(`Best score this browser: ${game.bestScore || 0}`, 640, 348);
  ctx.fillStyle = '#c94f6d';
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.fillText('Press Enter to play again', 640, 404);
  ctx.fillStyle = '#666';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('or press T to return to the title screen', 640, 434);
  ctx.restore();
}

// One frame. `nowMs` drives the hint pulse; the panels are static otherwise.
export function renderFrame(ctx, game, nowMs) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (game.state === 'title') {
    drawTitle(ctx, game);
    return;
  }
  drawBackdrop(ctx);
  drawPanelLabels(ctx);
  drawPanel(ctx, game, 0, nowMs);
  drawPanel(ctx, game, 1, nowMs);
  drawFooterHint(ctx, game);
  if (game.state === 'levelComplete') drawLevelComplete(ctx, game);
  else if (game.state === 'gameOver') drawGameOver(ctx, game);
  else if (game.state === 'allComplete') drawAllComplete(ctx, game);
}
