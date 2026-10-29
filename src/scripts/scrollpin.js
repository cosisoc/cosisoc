// Scroll-gekoppelte Abschnitte: [data-pin] ist höher als der Bildschirm, sein Inhalt bleibt stehen (sticky).
// Dieses Skript setzt nur --p (0 → 1) = wie weit man durch den Abschnitt gescrollt ist; das Aussehen steht im CSS.
// Auf schmalen Bildschirmen und bei „Bewegung reduzieren“ bleibt alles statisch im Endzustand.
const tracks = [...document.querySelectorAll('[data-pin]')];
const enabled = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
const smooth = (x) => x * x * (3 - 2 * x);
let queued = false;

function update() {
  queued = false;
  document.documentElement.classList.toggle('pins', enabled.matches);
  for (const track of tracks) {
    let p = 1;
    let y = 0;
    let distance = 0;
    if (enabled.matches) {
      distance = track.offsetHeight - innerHeight;
      // wie weit der Inhalt schon angehalten ist (0 → distance)
      y = Math.round(Math.min(distance, Math.max(0, -track.getBoundingClientRect().top)));
      // data-pin-start: schon so viele Bildschirmhöhen vor dem Anhalten loslegen (0,5 = Abschnitt halb im Bild)
      // data-pin-end: Anteil der Strecke, nach dem die Animation fertig ist (danach kurz Ruhe)
      const lead = Number(track.dataset.pinStart ?? 0) * innerHeight;
      const end = Number(track.dataset.pinEnd ?? 1);
      p = Math.min(1, Math.max(0, (lead - track.getBoundingClientRect().top) / (lead + distance * end)));
    }
    track.style.setProperty('--p', smooth(p).toFixed(4));
    // Am Elternelement, damit dessen Hintergrund (z. B. Punktraster) beim Anhalten mit stehen bleiben kann
    track.parentElement.style.setProperty('--pin-y', `${y}px`);
    track.parentElement.style.setProperty('--pin-distance', `${distance}px`);
  }
}

const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
if (tracks.length) {
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  enabled.addEventListener('change', request);
  update();
}
