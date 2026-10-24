// Main Projects: Kartenstapel. Setzt nur Positionsklassen, das Aussehen steht in cardstack.css.
const POSITIONS = ['is-active', 'is-next', 'is-hidden', 'is-prev'];

for (const root of document.querySelectorAll('[data-cardstack]')) {
  const cards = [...root.querySelectorAll('.stack-card')];
  const details = [...root.querySelectorAll('[data-info]')];
  const dots = [...root.querySelectorAll('.stack-dot')];
  const n = cards.length;
  let active = 0;

  // Position relativ zur aktiven Karte (zirkulär): 0 aktiv, 1 rechts, n-1 links, Rest verdeckt
  const positionOf = (i) => {
    const rel = (i - active + n) % n;
    return rel === 0 ? 'is-active' : rel === 1 ? 'is-next' : rel === n - 1 ? 'is-prev' : 'is-hidden';
  };

  const show = (index) => {
    active = (index + n) % n;
    cards.forEach((card, i) => {
      const pos = positionOf(i);
      card.classList.remove(...POSITIONS);
      card.classList.add(pos);
      card.inert = pos === 'is-hidden';
      // Nur die aktive Karte öffnet beim Klick das Projekt (panel.js)
      if (pos === 'is-active') card.dataset.panelOpen = card.dataset.slug;
      else delete card.dataset.panelOpen;
    });
    details.forEach((detail, i) => { detail.hidden = i !== active; });
    dots.forEach((dot, i) => dot.classList.toggle('is-current', i === active));
  };

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(active - 1); }
  });
}
