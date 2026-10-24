// Einblenden beim Reinscrollen: Elemente mit [data-reveal] gleiten einmalig herein (CSS in global.css).
// Bei „Bewegung reduzieren“ bleibt alles sofort sichtbar.
const items = document.querySelectorAll('[data-reveal]');

if (items.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach((el) => observer.observe(el));
}
