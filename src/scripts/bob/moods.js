// Bobs Emotionen wie im Spiel (BobMoodController.cs): Seele leuchtet in der Emotionsfarbe, das Gesicht passt dazu.
// Neutral = Seele aus. Farben als sRGB wie in Unity.
import { Color, SRGBColorSpace } from 'three';

const c = (r, g, b) => new Color().setRGB(r, g, b, SRGBColorSpace);
export const MOODS = {
  neutral: { glow: 0, color: c(1, 1, 1), face: {} },
  unsure: { glow: 1, color: c(0.20, 0.85, 0.90), face: { Sad: 1 } },
  happy: { glow: 1, color: c(1.00, 0.62, 0.12), face: { Happy: 1 } },
  scared: { glow: 1, color: c(0.15, 0.40, 1.00), face: { Sad: 1, Surprised: 0.4 } },
  empathy: { glow: 1, color: c(1.00, 0.48, 0.66), face: { Happy: 0.5, Sad: 0.25 } },
};
