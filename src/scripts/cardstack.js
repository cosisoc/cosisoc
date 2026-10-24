// Arbeiten: Kartenstapel. Setzt nur Positionsklassen, das Aussehen steht in cardstack.css.
// Steuerung: Hover oder Klick auf eine Nachbarkarte, Punkte, Pfeiltasten + Enter, Wischen (Touch).
const POSITIONS = ['is-active', 'is-next', 'is-hidden', 'is-prev'];
const calm = matchMedia('(prefers-reduced-motion: reduce)');

for (const root of document.querySelectorAll('[data-cardstack]')) {
  const stack = root.querySelector('.stack');
  const cards = [...root.querySelectorAll('.stack-card')];
  const details = [...root.querySelectorAll('[data-info]')];
  const live = root.querySelector('[data-live]');
  const dots = [...root.querySelectorAll('.stack-dot')];
  const n = cards.length;
  let active = -1;

  // Position relativ zur aktiven Karte (zirkulär): 0 aktiv, 1 rechts, n-1 links, Rest verdeckt
  const positionOf = (i) => {
    const rel = (i - active + n) % n;
    return rel === 0 ? 'is-active' : rel === 1 ? 'is-next' : rel === n - 1 ? 'is-prev' : 'is-hidden';
  };

  const show = (index) => {
    const next = (index + n) % n;
    if (next === active) return;
    active = next;
    cards.forEach((card, i) => {
      const pos = positionOf(i);
      card.classList.remove(...POSITIONS);
      card.classList.add(pos);
      card.inert = pos === 'is-hidden';
      // Nur die aktive Karte öffnet beim Klick das Projekt (panel.js)
      if (pos === 'is-active') card.dataset.panelOpen = card.dataset.slug;
      else delete card.dataset.panelOpen;
      // Nur das Video der aktiven Karte spielt
      const video = card.querySelector('video');
      if (video && pos === 'is-active' && !calm.matches) video.play().catch(() => {});
      else video?.pause();
    });
    details.forEach((detail, i) => { detail.hidden = i !== active; });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-current', i === active);
      if (i === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    live.textContent = cards[active].getAttribute('aria-label');
  };
  show(0);

  // Pfeiltasten wechseln, Enter öffnet das aktive Projekt
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(active - 1); }
    if (e.key === 'Enter' && e.target === root) cards[active].click();
  });

  // Klick auf eine Nachbarkarte holt sie nach vorn (die aktive öffnet das Projekt)
  cards.forEach((card, i) => card.addEventListener('click', (e) => {
    if (i !== active) { e.preventDefault(); e.stopPropagation(); show(i); }
  }));

  // Punkte unter dem Stapel springen direkt zum Projekt
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

  // Hover auf eine Nachbarkarte holt genau diese nach vorn. Danach erst wieder reagieren, wenn sich die
  // Maus ein Stück bewegt hat – sonst würde die nachrutschende Karte unter der Maus sofort mitspringen.
  let lock = null;
  stack.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || innerWidth < 768) return;
    if (lock && Math.hypot(e.clientX - lock.x, e.clientY - lock.y) < 60) return;
    lock = null;
    const i = cards.indexOf(e.target.closest('.stack-card'));
    if (i >= 0 && i !== active) {
      show(i);
      lock = { x: e.clientX, y: e.clientY };
    }
  });
  stack.addEventListener('pointerleave', () => { lock = null; });

  // Wischen auf Touch-Geräten
  let startX = null;
  stack.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
  stack.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(active + (dx < 0 ? 1 : -1));
  });
}
