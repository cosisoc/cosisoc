// Spielt Bobs Animationen von allein: kurz Idle, dann eine zufällige Aktion, wieder Idle …
// Ohne Optionen (Hero): startet gleich farbig mit leuchtender Seele, bei jeder Aktion eine neue Farbe.
// Mit Optionen (Kapitel): feste Körperfarbe, nur ausgewählte Aktionen, Seele und Gesicht zeigen die Emotion (moods.js).
import { AnimationMixer, LoopRepeat, LoopOnce, Color, SRGBColorSpace } from 'three';
import { MOODS } from './moods.js';

// Farben aus BlobPalette.cs (Pastell), als sRGB wie in Unity
const PALETTE = [
  [0.94, 0.47, 0.45], [0.98, 0.67, 0.45], [0.98, 0.87, 0.55], [0.60, 0.82, 0.62],
  [0.62, 0.81, 0.95], [0.46, 0.53, 0.85], [0.74, 0.62, 0.91], [0.97, 0.68, 0.81],
].map((c) => new Color().setRGB(...c, SRGBColorSpace));

// Aktion = Folge von [Clip, Wiederholungen]; face = Gesichtsausdruck währenddessen; id = Name für BobViewer acts
const ACTS = [
  { id: 'walk', steps: [['Waddle', 4]] },
  { id: 'sprint', steps: [['Sprint', 6]], face: 'Happy' },
  { id: 'laugh', steps: [['Talk_Laugh', 2]], face: 'Laugh' },
  { id: 'pickup', steps: [['PickUp_Floor', 1]] },
  { id: 'jump', steps: [['Jump', 1]], face: 'Happy' },
  { id: 'fall', steps: [['Miss_Fall', 1]], face: 'Surprised' },
  { id: 'sit', steps: [['Sit_Floor_Down', 1], ['Sit_Floor_Loop', 2], ['Sit_Floor_Up', 1]], face: 'Tired' },
  { id: 'dance', steps: [['Dance_Ready', 1], ['Dance', 3]], face: 'Happy' },
  { id: 'spin', steps: [['Special_Spin', 2]], face: 'Happy' },
  { id: 'joy', steps: [['Joy', 1]], face: 'Laugh' },
  { id: 'win', steps: [['Win', 2]], face: 'Happy' },
  { id: 'wave', steps: [['Wave', 2]], face: 'Happy' },
  { id: 'hop', steps: [['Hop_Left', 1], ['Hop_Right', 1], ['Hop_Left', 1], ['Hop_Right', 1]], face: 'Happy' },
  { id: 'highfive', steps: [['HighFive', 1]], face: 'Happy' },
];
const FADE = 0.25;
const pick = (list, not) => { let x; do x = list[Math.floor(Math.random() * list.length)]; while (list.length > 1 && x === not); return x; };

export class Director {
  // options: acts = erlaubte Aktionen (ids), color = feste Körperfarbe, mood = Start-Emotion
  constructor(root, clips, body, face, soul, { acts, color, mood } = {}) {
    this.mixer = new AnimationMixer(root);
    this.actions = Object.fromEntries(clips.map((c) => [c.name, this.mixer.clipAction(c)]));
    this.body = body; this.face = face; this.soul = soul;
    this.acts = acts ? ACTS.filter((a) => acts.includes(a.id)) : ACTS;
    this.fixedColor = !!color;
    const start = color || pick(PALETTE);
    this.color = start.clone(); this.fromColor = start.clone(); this.toColor = start.clone();
    this.mood = mood ? MOODS[mood] : null;
    this.glow = color ? 0 : 1; this.toGlow = this.glow; this.colorT = 1;
    this.faceKey = null; this.faceW = {}; this.blinkIn = 2; this.blinkT = -1;
    this.mixer.addEventListener('finished', (e) => e.action === this.current && this.next());
    this.current = null; this.act = null; this.step = 0; this.idleLeft = 2.5;
    this.play('Idle', Infinity);
  }

  play(name, reps) {
    const a = this.actions[name];
    a.reset(); a.setLoop(reps === Infinity ? LoopRepeat : reps > 1 ? LoopRepeat : LoopOnce, reps);
    a.clampWhenFinished = true;
    if (this.current && this.current !== a) a.crossFadeFrom(this.current, FADE, false);
    a.play(); this.current = a;
  }

  // Neue zufällige Aktion (von allein und beim Klick auf Bob)
  start() {
    this.act = pick(this.acts, this.act); this.step = 0;
    this.newColor(); this.faceKey = this.act.face || null;
    this.play(...this.act.steps[0]);
  }

  next() {
    if (!this.act) return;
    this.step += 1;
    if (this.step < this.act.steps.length) return this.play(...this.act.steps[this.step]);
    this.act = null; this.faceKey = null;
    this.idleLeft = 2 + Math.random() * 2;
    this.play('Idle', Infinity);
  }

  setMood(id) { this.mood = MOODS[id]; }

  newColor() {
    if (this.fixedColor) return;
    this.fromColor.copy(this.color);
    this.toColor.copy(pick(PALETTE.filter((c) => !c.equals(this.toColor)))); this.colorT = 0;
    this.toGlow = 1;
  }

  update(dt) {
    this.mixer.update(dt);
    if (!this.act && (this.idleLeft -= dt) <= 0) this.start();
    // Farbe weich überblenden; Seele leuchtet in der Körperfarbe
    this.colorT = Math.min(1, this.colorT + dt / 0.9);
    this.color.lerpColors(this.fromColor, this.toColor, this.colorT * this.colorT * (3 - 2 * this.colorT));
    this.body.color.copy(this.color);
    const k = Math.min(1, dt * 1.5);
    if (this.mood) { // Emotion: Seele in der Emotionsfarbe
      this.glow += (this.mood.glow - this.glow) * k;
      this.soul.uGlowColor.value.lerp(this.mood.color, k);
    } else { // sonst leuchtet die Seele in der Körperfarbe
      this.glow += (this.toGlow - this.glow) * k;
      this.soul.uGlowColor.value.copy(this.color).offsetHSL(0, 0.25, 0.05);
    }
    this.soul.uGlow.value = this.glow;
    this.updateFace(dt);
  }

  updateFace(dt) {
    // Ausdruck der Aktion, sonst der Emotion
    const goal = this.faceKey ? { [this.faceKey]: 1 } : this.mood?.face || {};
    for (const key of ['Happy', 'Sad', 'Laugh', 'Surprised', 'Tired']) {
      const target = goal[key] || 0;
      this.faceW[key] = (this.faceW[key] || 0) + (target - (this.faceW[key] || 0)) * Math.min(1, dt * 6);
    }
    // Blinzeln alle paar Sekunden (nicht beim Lachen, da sind die Augen schon zu)
    if ((this.blinkIn -= dt) <= 0) { this.blinkT = 0; this.blinkIn = 2 + Math.random() * 3.5; }
    let b = 0;
    if (this.blinkT >= 0) { this.blinkT += dt; b = Math.max(0, 1 - Math.abs(this.blinkT - 0.07) / 0.07); if (this.blinkT > 0.14) this.blinkT = -1; }
    const eyesClosed = this.faceKey === 'Laugh' || this.faceW.Happy > 0.5; // bei Freude sind die Augen schon ^^
    const weights = { ...this.faceW, Blink: eyesClosed ? 0 : b };
    // Das Gesicht besteht aus zwei Teilen (Gesicht + Augen), beide haben dieselben Shape Keys
    for (const m of this.face) {
      for (const [key, w] of Object.entries(weights)) {
        const i = m.morphTargetDictionary[key];
        if (i !== undefined) m.morphTargetInfluences[i] = w;
      }
    }
  }
}
