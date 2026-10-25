// Mauszeiger als grüner Punkt; über klickbaren Elementen wird er zum Ring.
// Über einer Projektvorschau ([data-cursor-label]) wird er zum runden Button mit Pfeil und drehendem Text.
// Nur mit Maus (nicht auf Touch-Geräten) und nicht bei „Bewegung reduzieren“.
const HOVER = 'a, button, summary, [data-wheel]';
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
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    dot.classList.add('is-visible');
    const preview = e.target.closest?.(CASE);
    if (preview && preview.dataset.cursorLabel !== label) {
      label = preview.dataset.cursorLabel;
      textPath.textContent = `${label} • ${label} • `.toUpperCase();
    }
    dot.classList.toggle('is-case', Boolean(preview));
    dot.classList.toggle('is-hover', !preview && Boolean(e.target.closest?.(HOVER)));
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => dot.classList.remove('is-visible'));
}
