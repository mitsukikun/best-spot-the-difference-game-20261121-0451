// Twin Lanterns — Spot the Difference: the three levels and their differences.
// One file, one job: pure data. Every difference is a point in scene space
// (600 x 560, the panel's own coordinates) with a hit radius and a plain
// description. The scene painters in scenes.js read the same ids.
//
// Coordinates were chosen so no two differences overlap and every one sits
// on something visible in the scene — fair, but never obvious at a glance.

export const LEVELS = [
  {
    id: 'garden',
    name: 'Sunny Garden',
    tagline: 'A cottage garden at noon — 7 changes hide in the daylight.',
    timeLimit: 150,
    difficulty: 'Easy',
    seed: 11,
    differences: [
      { id: 'g-butterfly', x: 470, y: 470, r: 26, label: 'Butterfly' },
      { id: 'g-collar', x: 150, y: 468, r: 24, label: "Cat's collar" },
      { id: 'g-smoke', x: 470, y: 88, r: 30, label: 'Chimney smoke' },
      { id: 'g-flowerbox', x: 402, y: 306, r: 26, label: 'Window flower box' },
      { id: 'g-apple', x: 96, y: 178, r: 22, label: 'Apple on the tree' },
      { id: 'g-cloud', x: 520, y: 58, r: 34, label: 'Little cloud' },
      { id: 'g-picket', x: 300, y: 506, r: 22, label: 'Fence picket' },
    ],
  },
  {
    id: 'harbor',
    name: 'Moonlit Harbor',
    tagline: 'A quiet harbor under the moon — 8 changes hide in the dark.',
    timeLimit: 120,
    difficulty: 'Medium',
    seed: 23,
    differences: [
      { id: 'h-crater', x: 92, y: 82, r: 24, label: 'Moon crater' },
      { id: 'h-beam', x: 330, y: 205, r: 40, label: 'Lighthouse beam' },
      { id: 'h-flag', x: 432, y: 232, r: 22, label: 'Boat flag' },
      { id: 'h-gull', x: 500, y: 92, r: 24, label: 'Seagull' },
      { id: 'h-crate', x: 182, y: 470, r: 26, label: 'Dock crate' },
      { id: 'h-buoy', x: 520, y: 420, r: 24, label: 'Buoy stripes' },
      { id: 'h-star', x: 250, y: 56, r: 18, label: 'A bright star' },
      { id: 'h-lantern', x: 92, y: 428, r: 26, label: 'Lantern glow' },
    ],
  },
  {
    id: 'library',
    name: 'Cozy Library',
    tagline: 'Lamplight, books and a sleeping cat — 9 changes hide indoors.',
    timeLimit: 100,
    difficulty: 'Hard',
    seed: 37,
    differences: [
      { id: 'l-clock', x: 300, y: 92, r: 26, label: 'Clock hands' },
      { id: 'l-book', x: 122, y: 182, r: 20, label: 'Red book spine' },
      { id: 'l-bow', x: 432, y: 428, r: 24, label: "Cat's bow tie" },
      { id: 'l-steam', x: 202, y: 378, r: 24, label: 'Teapot steam' },
      { id: 'l-flower', x: 542, y: 478, r: 22, label: 'Plant flower' },
      { id: 'l-picture', x: 482, y: 122, r: 28, label: 'Framed picture' },
      { id: 'l-shade', x: 332, y: 262, r: 26, label: 'Lamp shade' },
      { id: 'l-stripe', x: 300, y: 520, r: 24, label: 'Rug stripe' },
      { id: 'l-star', x: 92, y: 122, r: 20, label: 'Star in the window' },
    ],
  },
];

// Look a level up by its id; throws on an unknown id so a typo fails loudly.
export function levelById(id) {
  const level = LEVELS.find((entry) => entry.id === id);
  if (!level) throw new Error(`unknown level id: ${id}`);
  return level;
}

// Every difference id across every level, for validation.
export function allDifferenceIds() {
  return LEVELS.flatMap((level) => level.differences.map((d) => d.id));
}
