// Twin Lanterns — Spot the Difference: the three scenes, drawn by hand in code.
// One file, one job: paint a scene into a 600 x 560 panel. Every painter takes
// `applied`, the set of difference ids to apply — the left panel passes an
// empty set, the right panel passes every id of the level, so the two pictures
// differ only where a difference says so. All art is original, drawn with
// canvas primitives; no image, font or sound file is loaded anywhere.

import { mulberry32 } from './random.js';

// --- small drawing helpers -------------------------------------------------

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

export function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

export function star(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

export function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, 18 * s);
  circle(ctx, x + 20 * s, y - 6 * s, 22 * s);
  circle(ctx, x + 42 * s, y, 18 * s);
  circle(ctx, x + 20 * s, y + 6 * s, 20 * s);
}

// --- Level 1: Sunny Garden -------------------------------------------------

export function paintGarden(ctx, applied) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#7ec8f7');
  sky.addColorStop(1, '#cfeeff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 340);

  // Sun with rays.
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 70, 70, 42);
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(70 + Math.cos(a) * 52, 70 + Math.sin(a) * 52);
    ctx.lineTo(70 + Math.cos(a) * 66, 70 + Math.sin(a) * 66);
    ctx.stroke();
  }
  ctx.fillStyle = '#fff3b0';
  circle(ctx, 70, 70, 30);

  // Clouds — the small one top-right vanishes on the right panel.
  cloud(ctx, 190, 56, 1, 'rgba(255,255,255,0.95)');
  cloud(ctx, 340, 36, 0.8, 'rgba(255,255,255,0.9)');
  if (!applied.has('g-cloud')) cloud(ctx, 500, 52, 0.9, 'rgba(255,255,255,0.95)');

  // Rolling hills.
  ctx.fillStyle = '#7ec850';
  ellipse(ctx, 120, 560, 340, 150);
  ctx.fillStyle = '#68b844';
  ellipse(ctx, 520, 560, 360, 170);

  // Cottage: walls, roof, door, window, chimney.
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(330, 210, 190, 190);
  ctx.fillStyle = '#d94f3d';
  poly(ctx, [[315, 215], [425, 135], [535, 215]]);
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(478, 128, 26, 62);
  // Chimney smoke: three puffs on the left, two on the right.
  ctx.fillStyle = 'rgba(240,240,240,0.9)';
  circle(ctx, 486, 112, 12);
  circle(ctx, 470, 92, 14);
  if (!applied.has('g-smoke')) circle(ctx, 452, 74, 11);
  // Door.
  ctx.fillStyle = '#7a4a21';
  rr(ctx, 452, 318, 44, 82, 6);
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 488, 360, 4);
  // Window with a flower box — the box is gone on the right panel.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(368, 262, 54, 54);
  ctx.fillStyle = '#9fd8ef';
  ctx.fillRect(374, 268, 42, 42);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(395, 268);
  ctx.lineTo(395, 310);
  ctx.moveTo(374, 289);
  ctx.lineTo(416, 289);
  ctx.stroke();
  if (!applied.has('g-flowerbox')) {
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(366, 316, 58, 12);
    ctx.fillStyle = '#ff6b9d';
    circle(ctx, 376, 312, 6);
    circle(ctx, 392, 310, 6);
    circle(ctx, 408, 312, 6);
    ctx.fillStyle = '#ffd93b';
    circle(ctx, 384, 306, 4);
    circle(ctx, 400, 304, 4);
  }

  // Tree with apples — one apple is missing on the right panel.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(96, 220, 28, 200);
  ctx.fillStyle = '#3f9e3f';
  circle(ctx, 60, 210, 46);
  circle(ctx, 160, 210, 46);
  circle(ctx, 110, 168, 62);
  ctx.fillStyle = '#e23b3b';
  const apples = [[78, 196], [140, 150], [160, 200], [60, 232], [96, 178]];
  for (const [ax, ay] of apples) {
    if (ax === 96 && ay === 178 && applied.has('g-apple')) continue;
    circle(ctx, ax, ay, 8);
  }

  // Stone path from the door.
  ctx.fillStyle = '#e8ddc0';
  ellipse(ctx, 452, 430, 26, 12);
  ellipse(ctx, 448, 470, 24, 11);
  ellipse(ctx, 456, 512, 26, 12);
  ellipse(ctx, 450, 548, 24, 10);

  // Fence — one picket is missing on the right panel.
  ctx.fillStyle = '#b08954';
  ctx.fillRect(0, 486, 600, 10);
  ctx.fillRect(0, 512, 600, 10);
  for (let x = 16; x < 600; x += 28) {
    if (x === 300 && applied.has('g-picket')) continue;
    ctx.fillRect(x, 472, 12, 62);
    poly(ctx, [[x, 472], [x + 6, 460], [x + 12, 472]]);
  }

  // Flower bed along the bottom.
  const rand = mulberry32(99);
  const petals = ['#ff6b9d', '#ffd93b', '#c58cff', '#ff9f43', '#ffffff'];
  for (let i = 0; i < 26; i++) {
    const fx = 20 + rand() * 560;
    const fy = 528 + rand() * 24;
    ctx.fillStyle = petals[i % petals.length];
    circle(ctx, fx, fy, 5);
    ctx.fillStyle = '#ffd93b';
    circle(ctx, fx, fy, 2);
  }

  // Cat sitting by the fence — its red collar is gone on the right panel.
  ctx.fillStyle = '#f2a541';
  ellipse(ctx, 150, 480, 26, 20);
  circle(ctx, 150, 448, 18);
  poly(ctx, [[136, 434], [142, 416], [150, 432]]);
  poly(ctx, [[164, 434], [158, 416], [150, 432]]);
  ctx.fillStyle = '#f2a541';
  ctx.strokeStyle = '#f2a541';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(172, 488);
  ctx.quadraticCurveTo(196, 480, 192, 452);
  ctx.stroke();
  ctx.fillStyle = '#222';
  circle(ctx, 144, 446, 2.5);
  circle(ctx, 156, 446, 2.5);
  if (!applied.has('g-collar')) {
    ctx.strokeStyle = '#e23b3b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(150, 462, 14, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Butterfly — gone entirely on the right panel.
  if (!applied.has('g-butterfly')) {
    ctx.fillStyle = '#ff9f43';
    ellipse(ctx, 458, 462, 12, 16);
    ellipse(ctx, 482, 462, 12, 16);
    ctx.fillStyle = '#ff6b9d';
    ellipse(ctx, 458, 478, 9, 11);
    ellipse(ctx, 482, 478, 9, 11);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(470, 458);
    ctx.lineTo(470, 482);
    ctx.stroke();
  }
}

// --- Level 2: Moonlit Harbor -----------------------------------------------

export function paintHarbor(ctx, applied) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#0b1035');
  sky.addColorStop(1, '#1d2f5e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 300);

  // Stars — one bright star is missing on the right panel.
  const rand = mulberry32(7);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 60; i++) {
    const sx = 10 + rand() * 580;
    const sy = 8 + rand() * 260;
    circle(ctx, sx, sy, rand() * 1.6 + 0.6);
  }
  if (!applied.has('h-star')) {
    ctx.fillStyle = '#fff6b0';
    star(ctx, 250, 56, 9);
  }

  // Moon with a crater — the crater is gone on the right panel.
  ctx.fillStyle = '#fdf6c9';
  circle(ctx, 92, 82, 34);
  ctx.fillStyle = '#e8dd9f';
  circle(ctx, 82, 74, 8);
  if (!applied.has('h-crater')) circle(ctx, 102, 92, 6);

  // Seagull — gone on the right panel.
  if (!applied.has('h-gull')) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(484, 92);
    ctx.quadraticCurveTo(494, 82, 502, 92);
    ctx.quadraticCurveTo(510, 82, 518, 92);
    ctx.stroke();
  }

  // Sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 560);
  sea.addColorStop(0, '#16355e');
  sea.addColorStop(1, '#0a1c38');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 600, 260);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  for (let y = 330; y < 540; y += 42) {
    ctx.beginPath();
    for (let x = 0; x <= 600; x += 30) {
      const wy = y + Math.sin((x + y) * 0.05) * 4;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  // Lighthouse on its rocks.
  ctx.fillStyle = '#3a3f4a';
  ellipse(ctx, 305, 372, 90, 26);
  ctx.fillStyle = '#f4f1e6';
  ctx.fillRect(288, 180, 34, 180);
  ctx.fillStyle = '#d94f3d';
  ctx.fillRect(288, 220, 34, 26);
  ctx.fillRect(288, 292, 34, 26);
  ctx.fillStyle = '#2b2f3a';
  ctx.fillRect(282, 150, 46, 32);
  ctx.fillStyle = '#ffe27a';
  ctx.fillRect(290, 156, 30, 20);
  // Beam — switched off on the right panel.
  if (!applied.has('h-beam')) {
    const beam = ctx.createLinearGradient(320, 166, 540, 210);
    beam.addColorStop(0, 'rgba(255,226,122,0.55)');
    beam.addColorStop(1, 'rgba(255,226,122,0)');
    ctx.fillStyle = beam;
    poly(ctx, [[320, 158], [540, 178], [540, 232], [320, 176]]);
  }

  // Sailboat — its flag is red on the left, blue on the right.
  ctx.fillStyle = '#7a4a21';
  poly(ctx, [[392, 356], [478, 356], [462, 382], [408, 382]]);
  ctx.fillStyle = '#5a3413';
  ctx.fillRect(432, 232, 6, 126);
  ctx.fillStyle = '#ffffff';
  poly(ctx, [[440, 244], [440, 348], [486, 348]]);
  ctx.fillStyle = applied.has('h-flag') ? '#3b82f6' : '#e23b3b';
  poly(ctx, [[438, 232], [462, 238], [438, 246]]);

  // Small rowboat.
  ctx.fillStyle = '#8b5a2b';
  ellipse(ctx, 170, 396, 42, 12);
  ctx.fillStyle = '#5a3413';
  ctx.fillRect(164, 388, 12, 6);

  // Dock with crates — the top crate is gone on the right panel.
  ctx.fillStyle = '#6b4a26';
  ctx.fillRect(20, 440, 240, 16);
  ctx.fillRect(20, 470, 240, 16);
  ctx.fillStyle = '#54371c';
  for (const px of [40, 120, 200]) ctx.fillRect(px, 440, 12, 90);
  ctx.fillStyle = '#b08954';
  ctx.fillRect(150, 470, 34, 34);
  ctx.fillRect(186, 470, 34, 34);
  ctx.fillRect(168, 436, 34, 34);
  if (!applied.has('h-crate')) ctx.fillRect(186, 402, 34, 34);
  ctx.strokeStyle = '#7a5a30';
  ctx.lineWidth = 2;
  for (const [cx, cy] of [[150, 470], [186, 470], [168, 436]]) {
    ctx.strokeRect(cx, cy, 34, 34);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 34, cy + 34);
    ctx.moveTo(cx + 34, cy);
    ctx.lineTo(cx, cy + 34);
    ctx.stroke();
  }
  if (!applied.has('h-crate')) {
    ctx.strokeRect(186, 402, 34, 34);
    ctx.beginPath();
    ctx.moveTo(186, 402);
    ctx.lineTo(220, 436);
    ctx.moveTo(220, 402);
    ctx.lineTo(186, 436);
    ctx.stroke();
  }

  // Buoy — two white stripes on the left, one on the right.
  ctx.fillStyle = '#e23b3b';
  ellipse(ctx, 520, 428, 22, 10);
  poly(ctx, [[506, 428], [534, 428], [528, 396], [512, 396]]);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(509, 408, 22, 8);
  if (!applied.has('h-buoy')) ctx.fillRect(511, 396, 18, 6);
  ctx.fillStyle = '#ffd93b';
  circle(ctx, 520, 390, 5);

  // Lantern post on the dock — glowing on the left, dark on the right.
  ctx.fillStyle = '#2b2f3a';
  ctx.fillRect(88, 380, 8, 60);
  ctx.fillRect(88, 380, 34, 6);
  if (!applied.has('h-lantern')) {
    const glow = ctx.createRadialGradient(112, 404, 4, 112, 404, 46);
    glow.addColorStop(0, 'rgba(255,226,122,0.7)');
    glow.addColorStop(1, 'rgba(255,226,122,0)');
    ctx.fillStyle = glow;
    circle(ctx, 112, 404, 46);
  }
  ctx.fillStyle = applied.has('h-lantern') ? '#4a4a55' : '#ffd93b';
  rr(ctx, 104, 392, 16, 24, 4);
}

// --- Level 3: Cozy Library -------------------------------------------------

export function paintLibrary(ctx, applied) {
  // Wall and wooden floor.
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(0, 0, 600, 470);
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 470, 600, 90);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  for (let y = 490; y < 560; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }

  // Window with night sky — the star in it is gone on the right panel.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(52, 76, 92, 100);
  ctx.fillStyle = '#1d2f5e';
  ctx.fillRect(58, 82, 80, 88);
  ctx.fillStyle = '#fdf6c9';
  circle(ctx, 122, 100, 12);
  if (!applied.has('l-star')) {
    ctx.fillStyle = '#fff6b0';
    star(ctx, 78, 122, 7);
  }
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(98, 82);
  ctx.lineTo(98, 170);
  ctx.moveTo(58, 126);
  ctx.lineTo(138, 126);
  ctx.stroke();
  ctx.fillStyle = '#c94f6d';
  poly(ctx, [[44, 72], [58, 72], [58, 176], [44, 176]]);
  poly(ctx, [[138, 72], [152, 72], [152, 176], [138, 176]]);

  // Wall clock — 3:00 on the left, 6:30 on the right.
  ctx.fillStyle = '#ffffff';
  circle(ctx, 300, 92, 30);
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 92, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(300, 92);
  if (applied.has('l-clock')) {
    ctx.lineTo(296, 108); // hour hand toward 6-7
  } else {
    ctx.lineTo(318, 92); // hour hand toward 3
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 92);
  if (applied.has('l-clock')) {
    ctx.lineTo(300, 114); // minute hand toward 6
  } else {
    ctx.lineTo(300, 70); // minute hand toward 12
  }
  ctx.stroke();
  ctx.fillStyle = '#222';
  circle(ctx, 300, 92, 3);

  // Framed picture — a sun on the left, a moon on the right.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(446, 88, 72, 68);
  ctx.fillStyle = '#cfeeff';
  ctx.fillRect(452, 94, 60, 56);
  if (applied.has('l-picture')) {
    ctx.fillStyle = '#fdf6c9';
    circle(ctx, 482, 122, 14);
    ctx.fillStyle = '#cfeeff';
    circle(ctx, 488, 118, 12);
  } else {
    ctx.fillStyle = '#ffd93b';
    circle(ctx, 482, 122, 14);
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(482 + Math.cos(a) * 18, 122 + Math.sin(a) * 18);
      ctx.lineTo(482 + Math.cos(a) * 24, 122 + Math.sin(a) * 24);
      ctx.stroke();
    }
  }

  // Bookshelf with three rows — one spine is red on the left, blue on the right.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(36, 180, 180, 260);
  const shelfColors = ['#d94f3d', '#3b82f6', '#3f9e3f', '#e8a13b', '#8b5cf6', '#e23b7a'];
  for (let row = 0; row < 3; row++) {
    const sy = 190 + row * 84;
    ctx.fillStyle = '#f7e8c8';
    ctx.fillRect(44, sy, 164, 66);
    for (let i = 0; i < 8; i++) {
      let color = shelfColors[(i + row * 2) % shelfColors.length];
      if (row === 0 && i === 3) color = applied.has('l-book') ? '#3b82f6' : '#d94f3d';
      ctx.fillStyle = color;
      const bx = 48 + i * 20;
      ctx.fillRect(bx, sy + 8, 16, 58);
    }
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(44, sy + 66, 164, 8);
  }

  // Rug — its middle stripe is gone on the right panel.
  ctx.fillStyle = '#c94f6d';
  ellipse(ctx, 300, 520, 132, 30);
  ctx.fillStyle = '#f3e2c2';
  ellipse(ctx, 300, 520, 110, 24);
  ctx.fillStyle = '#3b82f6';
  ellipse(ctx, 300, 520, 88, 18);
  if (!applied.has('l-stripe')) {
    ctx.fillStyle = '#ffd93b';
    ellipse(ctx, 300, 520, 56, 11);
  }
  ctx.fillStyle = '#c94f6d';
  ellipse(ctx, 300, 520, 24, 5);

  // Armchair with a sleeping cat — the cat's bow tie is gone on the right panel.
  ctx.fillStyle = '#5b7fa6';
  rr(ctx, 392, 372, 140, 110, 18);
  ctx.fillStyle = '#4a6b8f';
  rr(ctx, 392, 372, 140, 46, 18);
  ctx.fillStyle = '#6b8fb5';
  rr(ctx, 380, 400, 26, 82, 10);
  rr(ctx, 518, 400, 26, 82, 10);
  ctx.fillStyle = '#f2a541';
  ellipse(ctx, 432, 440, 34, 16);
  circle(ctx, 452, 424, 13);
  poly(ctx, [[442, 414], [446, 402], [452, 412]]);
  ctx.strokeStyle = '#f2a541';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(402, 448);
  ctx.quadraticCurveTo(388, 440, 392, 424);
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(456, 422, 4, 0, Math.PI); // closed, sleeping eye
  ctx.stroke();
  if (!applied.has('l-bow')) {
    ctx.fillStyle = '#e23b3b';
    poly(ctx, [[436, 436], [428, 430], [428, 442]]);
    poly(ctx, [[436, 436], [444, 430], [444, 442]]);
    circle(ctx, 436, 436, 3);
  }

  // Side table with the lamp — yellow shade on the left, green on the right.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(306, 380, 56, 10);
  ctx.fillRect(330, 390, 8, 70);
  ctx.fillRect(312, 456, 44, 8);
  ctx.fillStyle = '#2b2f3a';
  ctx.fillRect(330, 330, 6, 52);
  ctx.fillStyle = applied.has('l-shade') ? '#3f9e3f' : '#ffd93b';
  poly(ctx, [[312, 330], [354, 330], [346, 288], [320, 288]]);
  const lampGlow = ctx.createRadialGradient(333, 310, 6, 333, 310, 60);
  lampGlow.addColorStop(0, 'rgba(255,226,122,0.35)');
  lampGlow.addColorStop(1, 'rgba(255,226,122,0)');
  ctx.fillStyle = lampGlow;
  circle(ctx, 333, 310, 60);

  // Table with the teapot — steam rises on the left, not on the right.
  ctx.fillStyle = '#8b5a2b';
  ellipse(ctx, 224, 402, 66, 12);
  ctx.fillRect(196, 412, 10, 56);
  ctx.fillRect(244, 412, 10, 56);
  ctx.fillStyle = '#5b7fa6';
  ellipse(ctx, 202, 386, 24, 18);
  ctx.fillStyle = '#4a6b8f';
  poly(ctx, [[178, 380], [188, 372], [188, 392]]);
  ctx.strokeStyle = '#4a6b8f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(226, 384, 10, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  if (!applied.has('l-steam')) {
    ctx.strokeStyle = 'rgba(120,120,120,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(196, 362);
    ctx.quadraticCurveTo(188, 348, 196, 334);
    ctx.moveTo(208, 360);
    ctx.quadraticCurveTo(216, 346, 208, 332);
    ctx.stroke();
  }

  // Potted plant — its pink flower is gone on the right panel.
  ctx.fillStyle = '#c94f6d';
  poly(ctx, [[516, 500], [566, 500], [558, 532], [524, 532]]);
  ctx.strokeStyle = '#3f9e3f';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const [lx, ly, tx, ty] of [
    [541, 500, 522, 462],
    [541, 500, 541, 452],
    [541, 500, 560, 464],
  ]) {
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }
  ctx.fillStyle = '#3f9e3f';
  ellipse(ctx, 522, 462, 12, 7);
  ellipse(ctx, 541, 452, 12, 7);
  ellipse(ctx, 560, 464, 12, 7);
  if (!applied.has('l-flower')) {
    ctx.fillStyle = '#ff6b9d';
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      circle(ctx, 541 + Math.cos(a) * 8, 448 + Math.sin(a) * 8, 5);
    }
    ctx.fillStyle = '#ffd93b';
    circle(ctx, 541, 448, 4);
  }
}

// --- dispatcher ------------------------------------------------------------

export function paintScene(ctx, levelId, applied) {
  if (levelId === 'garden') paintGarden(ctx, applied);
  else if (levelId === 'harbor') paintHarbor(ctx, applied);
  else if (levelId === 'library') paintLibrary(ctx, applied);
  else throw new Error(`unknown scene: ${levelId}`);
}
