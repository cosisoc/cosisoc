// Mauszeiger als grüner Punkt; über klickbaren Elementen wird er zum Ring.
// Über einer Projektvorschau ([data-cursor-label]) wird er zum runden Button mit Pfeil und drehendem Text.
// Nur mit Maus (nicht auf Touch-Geräten) und nicht bei „Bewegung reduzieren“.
const HOVER = 'a, button, summary, [data-wheel], [data-bob-hit]'; // data-bob-hit: Maus über Bob (bob/scene.js)
const CASE = '[data-cursor-label]';

if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = `
    <svg class="cursor-case" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" />
      <path id="cursor-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" fill="none" />
      <text class="cursor-case-text"><textPath href="#cursor-circle" textLength="230" lengthAdjust="spacing"></textPath></text>
      <path class="cursor-case-arrow" d="M38 50h24M52 40l10 10-10 10" />
    </svg>`;
  const textPath = dot.querySelector('textPath');
  document.body.append(dot);
  document.documentElement.classList.add('has-cursor');

  let label = '';
  // Solange der Projekt-Cursor über einer Vorschau steht, pausiert deren Video (sonst bewegt sich zu viel).
  // Beim Verlassen läuft es weiter – außer es gehört zu einem Projekt, das im Rad nicht mehr aktiv ist.
  let paused = null;
  const pauseVideoIn = (preview) => {
    const video = preview?.querySelector('video') ?? null;
    if (video === paused) return;
    if (paused && (!paused.closest('.work-slide') || paused.closest('.is-active'))) paused.play().catch(() => {});
    paused = video && !video.paused ? video : null;
    paused?.pause();
  };
  // Zustand (Projekt-Button, Ring) hängt am Element unter der Maus. Das ändert sich auch ohne Mausbewegung,
  // wenn ein Projekt auf- oder zugeht – deshalb gibt es eine eigene Funktion, die auch dann neu rechnet.
  const setState = (target) => {
    const preview = target?.closest?.(CASE);
    if (preview && preview.dataset.cursorLabel !== label) {
      label = preview.dataset.cursorLabel;
      textPath.textContent = `${label} • ${label} • `.toUpperCase();
    }
    pauseVideoIn(preview);
    dot.classList.toggle('is-case', Boolean(preview));
    dot.classList.toggle('is-hover', !preview && Boolean(target?.closest?.(HOVER)));
  };
  let last = null;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    last = [e.clientX, e.clientY];
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    dot.classList.add('is-visible');
    setState(e.target);
  }, { passive: true });
  // Projekt geöffnet oder geschlossen: sofort neu prüfen, nach dem Hereinfahren/Wegfahren noch einmal
  const refresh = () => { if (last) setState(document.elementFromPoint(...last)); };
  new MutationObserver(refresh).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('transitionend', (e) => { if (e.target.classList?.contains('panel-sheet')) requestAnimationFrame(refresh); });
  document.documentElement.addEventListener('pointerleave', () => dot.classList.remove('is-visible'));
  // Im iframe kommen keine Mausbewegungen an: Punkt ausblenden, statt ihn am Rand stehen zu lassen
  addEventListener('pointerover', (e) => { if (e.target.tagName === 'IFRAME') dot.classList.remove('is-visible'); });
}
