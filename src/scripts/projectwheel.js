// Arbeiten: Rad mit Miniaturen + große Bühne. Setzt nur Klassen und --rel, das Aussehen steht in projectwheel.css.
// Steuerung: Hover mit Verzögerung, Klick, Ziehen auf dem Rad, Pfeiltasten, Enter; auf dem Handy Tippen.
const DWELL = 320; // so lange muss die Maus auf einer Miniatur ruhen
const STEP_DRAG = 70; // Pixel Ziehen pro Schritt
const calm = matchMedia('(prefers-reduced-motion: reduce)');

for (const root of document.querySelectorAll('[data-wheel-root]')) {
  const wheel = root.querySelector('[data-wheel]');
  const thumbs = [...root.querySelectorAll('.wheel-thumb')];
  const slides = [...root.querySelectorAll('.work-slide')];
  const details = [...root.querySelectorAll('[data-info]')];
  const live = root.querySelector('[data-live]');
  const n = thumbs.length;
  let active = -1;
  // Position am Rad: -1 oben … 0 vorne … n-2 unten
  const relOf = (i) => ((i - active + n + 1) % n) - 1;

  const show = (to) => {
    const prev = thumbs.map((_, i) => relOf(i));
    active = (to + n) % n;
    thumbs.forEach((thumb, i) => {
      const rel = relOf(i);
      // Miniaturen, die einmal ums Rad springen, blenden kurz aus statt quer durchs Bild zu fliegen
      if (Math.abs(rel - prev[i]) > 1) { thumb.classList.add('is-jumping'); thumb.getBoundingClientRect(); }
      thumb.style.setProperty('--rel', String(rel));
      thumb.classList.toggle('is-active', rel === 0);
      thumb.setAttribute('aria-current', rel === 0 ? 'true' : 'false');
      // Die aktive Miniatur führt ins Projekt, also auch derselbe Cursor wie über der Bühne
      if (rel === 0) thumb.dataset.cursorLabel = slides[i].dataset.cursorLabel;
      else delete thumb.dataset.cursorLabel;
      requestAnimationFrame(() => thumb.classList.remove('is-jumping'));
    });
    slides.forEach((slide, i) => {
      const on = i === active;
      slide.classList.toggle('is-active', on);
      slide.tabIndex = on ? 0 : -1;
      // Nur das Video der aktiven Bühne spielt
      const video = slide.querySelector('video');
      if (video && on && !calm.matches) video.play().catch(() => {});
      else video?.pause();
    });
    details.forEach((detail, i) => { detail.hidden = i !== active; });
    live.textContent = slides[active].getAttribute('aria-label');
  };
  show(0);

  // Hover mit Verzögerung. Nach einer Drehung ist die Miniatur, die unter der Maus landet, gesperrt:
  // erst einmal runter und wieder drauf (oder klicken), dann zählt sie wieder.
  let timer = 0;
  let blocked = false;
  let blockedThumb = null;
  let dragging = false;
  let dragged = false;
  const turnByPointer = (i) => { show(i); blocked = true; blockedThumb = null; };

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || dragging || blocked) return;
      clearTimeout(timer);
      timer = setTimeout(() => { if (i !== active) turnByPointer(i); }, DWELL);
    });
    thumb.addEventListener('pointerleave', () => {
      clearTimeout(timer);
      if (blocked && thumb === blockedThumb) { blocked = false; blockedThumb = null; }
    });
    thumb.addEventListener('click', () => {
      if (dragged) return;
      clearTimeout(timer);
      // Klick auf das schon gewählte Projekt öffnet es
      if (i === active) slides[i].click();
      else turnByPointer(i);
    });
  });
  // Beim ersten Bewegen nach der Drehung: liegt eine Miniatur unter der Maus → bis zum Verlassen gesperrt
  wheel.addEventListener('pointermove', (e) => {
    if (!blocked || blockedThumb || dragging) return;
    const under = e.target.closest('.wheel-thumb');
    if (under) blockedThumb = under; else blocked = false;
  });
  wheel.addEventListener('pointerleave', () => { blocked = false; blockedThumb = null; });

  // Ziehen (Maus): hoch/runter dreht das Rad schrittweise. Erst festhalten, wenn wirklich gezogen wird,
  // sonst käme ein normaler Klick nicht bei der Miniatur an.
  let startY = 0;
  wheel.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    dragging = true;
    dragged = false;
    startY = e.clientY;
  });
  wheel.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dy = e.clientY - startY;
    if (Math.abs(dy) > 8 && !wheel.hasPointerCapture(e.pointerId)) wheel.setPointerCapture(e.pointerId);
    if (Math.abs(dy) >= STEP_DRAG) { show(active + (dy < 0 ? 1 : -1)); startY = e.clientY; dragged = true; }
  });
  const endDrag = () => { dragging = false; setTimeout(() => { dragged = false; }, 0); };
  wheel.addEventListener('pointerup', endDrag);
  wheel.addEventListener('pointercancel', endDrag);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); show(active + 1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); show(active - 1); }
    if (e.key === 'Enter' && e.target === root) slides[active].click();
  });

  // Scroll-Animation: beim ersten Reinscrollen rollt das Rad vom Rand herein, die Bühne blendet auf
  root.classList.add('is-waiting');
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    root.classList.add('is-in');
    observer.disconnect();
  }, { rootMargin: '0px 0px -20% 0px' });
  observer.observe(root);
}
