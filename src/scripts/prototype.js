// Lädt den Figma-Prototyp erst, wenn jemand auf „Prototyp starten“ klickt.
for (const box of document.querySelectorAll('[data-proto-src]')) {
  box.querySelector('.proto-load').addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = box.dataset.protoSrc;
    frame.title = box.dataset.protoLabel;
    frame.allowFullscreen = true;
    box.replaceChildren(frame);
  });
}
