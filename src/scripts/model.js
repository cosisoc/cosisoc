// Lädt <model-viewer> erst, wenn jemand auf „3D-Modell laden“ klickt.
for (const box of document.querySelectorAll('[data-model-src]')) {
  box.querySelector('.model-load').addEventListener('click', async () => {
    await import('@google/model-viewer');
    const viewer = document.createElement('model-viewer');
    viewer.setAttribute('src', box.dataset.modelSrc);
    viewer.setAttribute('alt', box.dataset.modelAlt);
    viewer.setAttribute('camera-controls', '');
    box.replaceChildren(viewer);
  });
}
