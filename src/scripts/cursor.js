// Mauszeiger als grüner Punkt; über klickbaren Elementen wird er größer.
// Nur mit Maus (nicht auf Touch-Geräten) und nicht bei „Bewegung reduzieren“.
const HOVER = 'a, button, summary, [data-cardstack]';

if (matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(dot);
  document.documentElement.classList.add('has-cursor');

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    dot.classList.add('is-visible');
    dot.classList.toggle('is-hover', Boolean(e.target.closest?.(HOVER)));
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => dot.classList.remove('is-visible'));
}
