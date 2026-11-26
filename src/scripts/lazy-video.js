// Videos (Media.astro, Figures.astro) laden und laufen erst, wenn sie im Bild sind.
// Sonst würden alle Videos aller Projektseiten schon beim Öffnen der Startseite laden,
// denn die Projektseiten liegen dort unsichtbar bereit.
// Ohne Bedienleiste: im Bild abspielen, außerhalb pausieren. Mit Bedienleiste (Film mit Ton):
// nur beim ersten Mal von selbst starten, danach entscheidet die Person.
const seen = new WeakSet();
const observer = new IntersectionObserver((entries) => {
  for (const { target: video, isIntersecting } of entries) {
    if (video.controls) {
      if (isIntersecting && !seen.has(video)) { seen.add(video); video.play().catch(() => {}); }
      continue;
    }
    if (isIntersecting) video.play().catch(() => {});
    else video.pause();
  }
}, { rootMargin: '200px' });

// Im Projekt-Rad der Startseite steuert projectwheel.js die Videos (nur das aktive Projekt spielt)
for (const video of document.querySelectorAll('video[data-autoplay]')) {
  if (!video.closest('.work-slide')) observer.observe(video);
}
