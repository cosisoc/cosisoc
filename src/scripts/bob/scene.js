// Baut die 3D-Szene für ein Bob-Fenster: Bob (und optional die Bühne) laden, drehen lassen,
// Animationen von allein abspielen (siehe director.js). Wird von viewer.js erst bei Bedarf geladen.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { addSoulGlow, SoulMotion } from './soul.js';
import { Director } from './director.js';
import { setupScene, KEY_DIR } from './stage.js';
import { handHint } from './hint.js';

const loader = new GLTFLoader();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function init(box) {
  const withStage = 'bobStage' in box.dataset;
  const base = box.dataset.bobSrc;
  const [bob, stage] = await Promise.all([
    loader.loadAsync(`${base}bob.glb`),
    withStage ? loader.loadAsync(`${base}stage.glb`) : null,
  ]);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', box.dataset.bobAlt);
  box.prepend(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, withStage ? 2.1 : 1.35, withStage ? 6.4 : 4.8);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, withStage ? 0.65 : 0.8, 0);
  controls.update();
  // Nur seitlich drehen, kein Zoom/Verschieben; senkrechtes Wischen scrollt weiter die Seite
  controls.minPolarAngle = controls.maxPolarAngle = controls.getPolarAngle();
  Object.assign(controls, { enableZoom: false, enablePan: false, enableDamping: true });
  // Kein Dauerdrehen: einmal die Hand wie beim 3D-Controller zeigen, Bob dreht mit (entfällt beim Anfassen)
  const home = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  const hint = handHint(box.querySelector('.bob-hand'));
  if (reduceMotion) hint.stop();
  controls.addEventListener('start', () => hint.stop());
  canvas.style.touchAction = 'pan-y';

  const view = setupScene(renderer, scene, camera, stage);
  scene.add(bob.scene);

  // Körper bekommt die Seele, Gesicht (Gesicht + Augen) die Ausdrücke
  let body, face = [];
  bob.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false; // Animationen gehen über die Ruhe-Bounding-Box hinaus
    if (o.material.name === 'W_Body') body = o.material;
    if (o.morphTargetDictionary?.Blink !== undefined) face.push(o);
  });
  const soul = addSoulGlow(body);
  soul.uKeyDir.value.copy(KEY_DIR);
  const motion = new SoulMotion(bob.scene.getObjectByName('spine'), bob.scene.getObjectByName('chest'));
  // Kapitel (BobViewer color/acts/moods): feste Farbe, nur diese Aktionen, Emotion per Button wählbar
  const moodButtons = box.parentElement.querySelectorAll('[data-bob-mood]');
  const options = box.dataset.bobColor ? {
    acts: box.dataset.bobActs?.split(','),
    color: new THREE.Color(box.dataset.bobColor),
    mood: box.parentElement.querySelector('[data-bob-mood][aria-pressed="true"]')?.dataset.bobMood,
  } : {};
  const director = new Director(bob.scene, bob.animations, body, face, soul, options);
  // Klick auf Bob (nicht Ziehen zum Drehen): neue Aktion und neue Farbe
  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const hitsBob = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    bob.scene.traverse((o) => o.isSkinnedMesh && o.computeBoundingSphere()); // aktuelle Pose treffen
    return ray.intersectObject(bob.scene, true).length > 0;
  };
  let downX = 0, downY = 0;
  canvas.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) <= 5 && hitsBob(e)) director.start();
  });
  // Emotion umschalten, gewählte grün markieren
  for (const b of moodButtons) b.addEventListener('click', () => {
    director.setMood(b.dataset.bobMood);
    for (const o of moodButtons) o.setAttribute('aria-pressed', o === b);
  });
  // Über Bob wird der Mauszeiger zum Ring (cursor.js), damit man sieht, dass er klickbar ist
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') canvas.toggleAttribute('data-bob-hit', hitsBob(e));
  });

  new ResizeObserver(() => {
    const { clientWidth: w, clientHeight: h } = box;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }).observe(box);

  // Nur rendern, solange das Fenster zu sehen ist
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(box);
  let last = performance.now(), t = 0;
  renderer.setAnimationLoop(() => {
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (!visible || document.hidden) return;
    t += dt;
    director.update(dt);
    bob.scene.updateMatrixWorld();
    const pos = motion.update(dt, t);
    soul.uSoulPos.value.copy(pos); soul.uTime.value = t;
    view.setSoul(pos, soul.uGlowColor.value, soul.uGlow.value);
    const turn = hint.update(dt, box.clientWidth);
    if (turn !== null) {
      const swing = new THREE.Spherical().copy(home);
      swing.theta += turn;
      camera.position.setFromSpherical(swing).add(controls.target);
    }
    controls.update(dt);
    view.render();
  });
  box.classList.add('is-ready');
}
