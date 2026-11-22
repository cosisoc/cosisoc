// Hinweis „man kann drehen“ wie beim 3D-Controller (model-viewer): eine Hand wischt einmal hin und her,
// Bob dreht mit. Zeiten und Werte übernommen aus @google/model-viewer (features/controls.js).
const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
function timeline(start, keys) {
  const total = keys.reduce((sum, [frames]) => sum + frames, 0);
  return (t) => {
    let at = 0, from = start;
    for (const [frames, value] of keys) {
      if (t * total <= at + frames) return from + (value - from) * ease((t * total - at) / frames);
      at += frames; from = value;
    }
    return from;
  };
}
const wiggle = timeline(0, [[5, -1], [1, -1], [8, 1], [1, 1], [5, 0], [18, 0]]);
const fade = timeline(0, [[1, 1], [5, 1], [1, 0], [6, 0]]);
const DELAY = 2, DURATION = 5; // Sekunden

export function handHint(hand) {
  let t = -DELAY;
  return {
    stop() { t = DURATION; hand.style.opacity = 0; },
    // Drehwinkel (rad), solange der Hinweis läuft, sonst null
    update(dt, width) {
      if (t >= DURATION) return null;
      t += dt;
      if (t < 0) return 0;
      const k = Math.min(1, t / DURATION), offset = wiggle(k);
      hand.style.opacity = fade(k);
      hand.style.transform = `translateX(${offset * width * 0.05}px)`;
      return -offset * Math.PI / 16;
    },
  };
}
