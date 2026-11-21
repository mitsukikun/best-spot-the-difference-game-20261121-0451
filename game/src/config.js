// Twin Lanterns — Spot the Difference: shared constants.
// One file, one job: every number the rest of the game agrees on lives here.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 640;

// One scene panel (each side of the pair) in canvas pixels.
export const PANEL = { x: 20, y: 40, w: 600, h: 560, gap: 40 };
export const RIGHT_PANEL_X = PANEL.x + PANEL.w + PANEL.gap; // 660

// A click counts as a find when it lands within a difference's radius.
export const DEFAULT_HIT_RADIUS = 30;

// Scoring.
export const POINTS_PER_FIND = 100;
export const COMBO_BONUS_PER_STEP = 10; // +10 per consecutive find without a miss
export const WRONG_CLICK_PENALTY = 25;
export const HINT_COST = 50;
export const HINTS_PER_LEVEL = 3;
export const TIME_BONUS_PER_SECOND = 5;

// Miss feedback.
export const MISS_MARK_MS = 900; // how long a red X stays on screen
export const HINT_PULSE_MS = 2200; // how long a hint ring pulses

// Stars at level end.
export const STAR_THRESHOLDS = { three: 0.4, two: 0.15 }; // fraction of time left
