// Arbeiten: Kartenstapel. Setzt nur Positionsklassen, das Aussehen steht in cardstack.css.
// Steuerung: Hover-Scrubbing (Zonen), Klick, Pfeiltasten + Enter, Wischen (Touch); dazu leichte Parallaxe.
const POSITIONS = ['is-active', 'is-next', 'is-hidden', 'is-prev'];
const calm = matchMedia('(prefers-reduced-motion: reduce)');

for (const root of document.querySelectorAll('[data-cardstack]')) {
  const area = root.querySelector('.stack-area');
  const stack = root.querySelector('.stack');
  const cards = [...root.querySelectorAll('.stack-card')];
  const details = [...root.querySelectorAll('[data-info]')];
  const live = root.querySelector('[data-live]');
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

  // Hover-Scrubbing: Breite in n Zonen, linke Zone = 01 … rechte Zone = 0n; beim Verlassen bleibt die Karte stehen
  area.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || innerWidth < 768) return;
    const r = area.getBoundingClientRect();
    show(Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n)));
  });

  // Wischen auf Touch-Geräten
  let startX = null;
  stack.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
  stack.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(active + (dx < 0 ? 1 : -1));
  });

  // Parallaxe: der Stapel kippt mit der Maus um max. ±4°, weich nachgezogen
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let ticking = false;
  const step = () => {
    tilt.x += (tilt.tx - tilt.x) * 0.1;
    tilt.y += (tilt.ty - tilt.y) * 0.1;
    stack.style.transform = `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)`;
    ticking = Math.abs(tilt.tx - tilt.x) > 0.01 || Math.abs(tilt.ty - tilt.y) > 0.01;
    if (ticking) requestAnimationFrame(step);
  };
  const aim = (tx, ty) => {
    tilt.tx = tx;
    tilt.ty = ty;
    if (!ticking) { ticking = true; requestAnimationFrame(step); }
  };
  root.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || calm.matches || innerWidth < 768) return;
    const r = root.getBoundingClientRect();
    aim(-((e.clientY - r.top) / r.height - 0.5) * 8, ((e.clientX - r.left) / r.width - 0.5) * 8);
  });
  root.addEventListener('pointerleave', () => aim(0, 0));
}
