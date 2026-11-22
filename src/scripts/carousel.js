// Karussell (Carousel.astro): mit der Maus ziehen wie Wischen; ohne Eingabe alle 3 s ein Bild weiter, am Ende zurück zum Anfang.
// Jede Bedienung pausiert das Weiterlaufen für 5 s. Nicht bei „Bewegung reduzieren“, nur solange das Karussell zu sehen ist.
const STEP = 3000;
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
    track.classList.remove('is-dragging'); // Einrasten wieder an: springt zum nächsten Bild
  };
  track.addEventListener('pointerup', drop);
  track.addEventListener('pointercancel', drop);

  if (!autoplay) continue;
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(track);
  setInterval(() => {
    if (!visible || document.hidden || dragX !== null || Date.now() < restUntil) return;
    const step = track.children[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap);
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: 'smooth' });
  }, STEP);
}
