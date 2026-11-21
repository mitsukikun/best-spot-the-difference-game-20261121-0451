// Twin Lanterns — Spot the Difference: a tiny seeded RNG.
// One file, one job: deterministic pseudo-random numbers so a scene (and a
// screenshot staged with ?shot=) always looks the same for the same seed.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick a deterministic element from an array by seed.
export function pickSeeded(seed, items) {
  const rand = mulberry32(seed);
  return items[Math.floor(rand() * items.length)];
}
