// Hauptprojekte: Rad mit Miniaturen + große Bühne. Setzt nur Klassen und --turn, das Aussehen steht in projectwheel.css.
// Steuerung: Scrollen, Klick, Ziehen auf dem Rad, Pfeiltasten, Enter; auf dem Handy Tippen.
const STEP_DRAG = 70; // Pixel Ziehen pro Schritt
const GAP = 42; // Grad zwischen zwei Miniaturen auf dem Rad
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const pinned = matchMedia('(min-width: 1000px) and (min-height: 780px) and (prefers-reduced-motion: no-preference)');

for (const root of document.querySelectorAll('[data-wheel-root]')) {
  const wheel = root.querySelector('[data-wheel]');
  const thumbs = [...root.querySelectorAll('.wheel-thumb')];
  const slides = [...root.querySelectorAll('.work-slide')];
  const details = [...root.querySelectorAll('[data-info]')];
  const live = root.querySelector('[data-live]');
  const n = thumbs.length;
  let active = 0;
  // Das Rad läuft linear, nicht im Kreis: Plätze -1 oben (vorheriges) … 0 vorne … n-2 unten.
  // Was oben hinausrutscht, verschwindet und kommt unten nicht wieder herein; was noch nicht dran ist,
  // wartet unsichtbar einen Platz unter dem untersten und rutscht schnell herein.
  const relOf = (i) => i - active;
  const hiddenOf = (i) => relOf(i) < -1 || relOf(i) > n - 2;
  const slotOf = (i) => Math.max(-2, Math.min(n - 1, relOf(i))); // Versteckte parken direkt über bzw. unter den Plätzen

  const show = (to) => {
    active = Math.max(0, Math.min(n - 1, to));
    thumbs.forEach((thumb, i) => {
      const rel = relOf(i);
      const hide = hiddenOf(i);
      thumb.style.setProperty('--turn', `${slotOf(i) * -GAP}deg`); // positiv = im Uhrzeigersinn
      thumb.classList.toggle('is-entering', thumb.classList.contains('is-hidden') && !hide);
      thumb.classList.toggle('is-hidden', hide);
      thumb.tabIndex = hide ? -1 : 0;
      thumb.classList.toggle('is-active', rel === 0);
      thumb.setAttribute('aria-current', rel === 0 ? 'true' : 'false');
      // Die aktive Miniatur führt ins Projekt, also auch derselbe Cursor wie über der Bühne
      if (rel === 0) thumb.dataset.cursorLabel = slides[i].dataset.cursorLabel;
      else delete thumb.dataset.cursorLabel;
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

  const track = root.closest('[data-wheel-track]');
  const distance = () => track.offsetHeight - innerHeight;
  let stepped = 0; // das Projekt, zu dem die Scrollposition zuletzt gehörte

  // Auswahl per Maus oder Tastatur: Scrollposition nachziehen, damit Weiterscrollen dort weitermacht.
  // Der Abschnitt steht dabei still, man sieht den Sprung also nicht.
  const pick = (to) => {
    show(to);
    if (!pinned.matches) return;
    const top = track.getBoundingClientRect().top;
    if (top > 0 || top < -distance()) return;
    stepped = active;
    scrollTo({ top: scrollY + top + (distance() * (active + 0.5)) / n, behavior: 'instant' });
  };

  let dragging = false;
  let dragged = false;

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      if (dragged) return;
      // Klick auf das schon gewählte Projekt öffnet es
      if (i === active) slides[i].click();
      else pick(i);
    });
  });

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
    if (Math.abs(dy) >= STEP_DRAG) { pick(active + (dy < 0 ? 1 : -1)); startY = e.clientY; dragged = true; }
  });
  const endDrag = () => { dragging = false; setTimeout(() => { dragged = false; }, 0); };
  wheel.addEventListener('pointerup', endDrag);
  wheel.addEventListener('pointercancel', endDrag);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); pick(active + 1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); pick(active - 1); }
    if (e.key === 'Enter' && e.target === root) slides[active].click();
  });

  // Scrollen dreht das Rad.
  const onScroll = () => {
    if (!pinned.matches) return;
    const p = -track.getBoundingClientRect().top / distance();
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    if (i === stepped) return;
    show(i);
    stepped = i;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll-Animation: beim ersten Reinscrollen rollt das Rad vom Rand herein, die Bühne blendet auf
  root.classList.add('is-waiting');
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    root.classList.add('is-in');
    observer.disconnect();
  }, { rootMargin: '0px 0px -20% 0px' });
  observer.observe(root);
}
