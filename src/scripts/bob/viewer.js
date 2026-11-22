// Bob-Viewer: lädt three.js und Bob erst, wenn das Fenster sichtbar wird (Projektseiten liegen versteckt im DOM).
const observer = new IntersectionObserver((entries) => {
  for (const { isIntersecting, target } of entries) {
    if (!isIntersecting) continue;
    observer.unobserve(target);
    import('./scene.js').then((m) => m.init(target));
  }
});
for (const box of document.querySelectorAll('[data-bob-src]')) observer.observe(box);
