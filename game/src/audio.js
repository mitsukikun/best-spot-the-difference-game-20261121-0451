// Twin Lanterns — Spot the Difference: synthesized sound effects.
// One file, one job: every sound the game makes, built with WebAudio so the
// game loads no audio file at all. All sounds are optional — if the browser
// has no AudioContext (or the player muted the game) every call is a no-op.

let audioContext = null;
let muted = false;

export function setMuted(value) {
  muted = Boolean(value);
}

export function isMuted() {
  return muted;
}

// Created lazily on the first user gesture, as browsers require.
function context() {
  if (muted) return null;
  try {
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioContext = new AC();
    }
    if (audioContext.state === 'suspended') void audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}

function tone(freq, startAt, duration, type, volume) {
  const ctx = context();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + startAt;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {
    // Sound must never break the game.
  }
}

// A bright two-note chime when a difference is found.
export function playFind() {
  tone(660, 0, 0.16, 'sine', 0.22);
  tone(990, 0.09, 0.24, 'sine', 0.22);
}

// A low buzz for a wrong click.
export function playMiss() {
  tone(160, 0, 0.18, 'sawtooth', 0.1);
  tone(120, 0.08, 0.2, 'sawtooth', 0.08);
}

// A soft shimmer when a hint is used.
export function playHint() {
  tone(520, 0, 0.12, 'triangle', 0.14);
  tone(780, 0.08, 0.18, 'triangle', 0.14);
}

// A short tick when the clock runs low.
export function playTick() {
  tone(880, 0, 0.06, 'square', 0.05);
}

// A rising arpeggio for clearing a level.
export function playWin() {
  [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.11, 0.22, 'sine', 0.2));
}

// A falling phrase for running out of time.
export function playLose() {
  [392, 330, 262].forEach((freq, i) => tone(freq, i * 0.16, 0.26, 'triangle', 0.16));
}

// A click for buttons.
export function playClick() {
  tone(440, 0, 0.07, 'sine', 0.12);
}
