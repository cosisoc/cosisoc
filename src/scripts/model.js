// Lädt <model-viewer> erst, wenn das Modell sichtbar wird (Projektseiten liegen versteckt im DOM).
const observer = new IntersectionObserver((entries) => {
  for (const { isIntersecting, target: box } of entries) {
    if (!isIntersecting) continue;
    observer.unobserve(box);
    import('@google/model-viewer').then(() => {
      const viewer = document.createElement('model-viewer');
      viewer.setAttribute('src', box.dataset.modelSrc);
      viewer.setAttribute('alt', box.dataset.modelAlt);
      // Nur drehen: kein Zoom, kein Verschieben; senkrechtes Wischen scrollt weiter die Seite.
      // Ohne Eingabe dreht sich das Modell langsam nach links; der Radius hält den Controller in jeder Drehung im Fenster.
      // Stilles Modell (Vorschau): feste Schrägansicht, keine Steuerung, kein Drehen.
      const attrs = 'modelStill' in box.dataset
        ? { 'camera-orbit': '-8deg 80deg 85%', 'shadow-intensity': '0' }
        : {
          'camera-controls': '', 'disable-zoom': '', 'disable-pan': '', 'touch-action': 'pan-y',
          'camera-orbit': '0deg 75deg 122%', 'max-camera-orbit': 'auto auto 122%', 'shadow-intensity': '0',
          'auto-rotate': '', 'auto-rotate-delay': '1500', 'rotation-per-second': '-12deg',
        };
      for (const [k, v] of Object.entries(attrs)) viewer.setAttribute(k, v);
      box.replaceChildren(viewer);
    });
  }
});
for (const box of document.querySelectorAll('[data-model-src]')) observer.observe(box);
