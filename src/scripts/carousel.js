// Karussell (Carousel.astro): mit der Maus ziehen wie Wischen; ohne Eingabe läuft es langsam und gleichmäßig durch.
// Die Bilder stehen dafür zweimal hintereinander (Kopie für Screenreader versteckt), so geht es am Ende nahtlos weiter.
// Jede Bedienung pausiert das Laufen für 5 s. Nicht bei „Bewegung reduzieren“, nur solange das Karussell zu sehen ist.
const SPEED = 40; // px pro Sekunde
const REST = 5000;
const autoplay = !matchMedia('(prefers-reduced-motion: reduce)').matches;

for (const track of document.querySelectorAll('[data-carousel]')) {
  let restUntil = 0;
  const rest = () => { restUntil = Date.now() + REST; };
  for (const type of ['wheel', 'touchstart', 'keydown']) track.addEventListener(type, rest, { passive: true });

  // Ziehen mit der Maus (Touch und Trackpad scrollen von selbst)
  let dragX = null;
  track.addEventListener('pointerdown', (e) => {
    rest();
    if (e.pointerType !== 'mouse') return;
    dragX = e.clientX;
    track.setPointerCapture(e.pointerId);
    track.classList.add('is-dragging');
  });
  track.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    track.scrollLeft -= e.clientX - dragX;
    dragX = e.clientX;
    rest();
  });
  const drop = () => {
    if (dragX === null) return;
    dragX = null;
    track.classList.remove('is-dragging'); // bleibt genau dort stehen, wo man losgelassen hat (kein Einrasten)
  };
  track.addEventListener('pointerup', drop);
  track.addEventListener('pointercancel', drop);

  if (!autoplay) continue;
  const count = track.children.length;
  for (const item of [...track.children]) {
    const copy = item.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    track.append(copy);
  }
  // Breite einer Runde: Abstand vom ersten Bild zu seiner Kopie
  const loop = () => track.children[count].getBoundingClientRect().left - track.children[0].getBoundingClientRect().left;
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(track);
  let pos = null; // eigene Position mit Nachkommastellen, scrollLeft rundet auf ganze Pixel
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    const running = visible && !document.hidden && dragX === null && Date.now() >= restUntil;
    if (!running) pos = null;
    else {
      if (pos === null) pos = track.scrollLeft;
      pos += SPEED * dt;
      if (pos >= loop()) pos -= loop();
      track.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
