// Main Projects: Hover, Fokus oder Klick klappt einen Streifen auf.
// Klick auf einen offenen Streifen öffnet das Projekt.
for (const list of document.querySelectorAll('[data-accordion]')) {
  const strips = [...list.querySelectorAll('.strip')];

  const activate = (strip) => {
    for (const s of strips) {
      const on = s === strip;
      s.classList.toggle('is-active', on);
      s.querySelector('.strip-toggle').setAttribute('aria-expanded', String(on));
    }
  };

  for (const strip of strips) {
    const toggle = strip.querySelector('.strip-toggle');
    strip.addEventListener('mouseenter', () => activate(strip));
    toggle.addEventListener('focus', () => activate(strip));
    toggle.addEventListener('click', () => activate(strip));
    strip.querySelector('.strip-body').addEventListener('click', (e) => {
      if (!e.target.closest('a, button')) strip.querySelector('[data-panel-open]').click();
    });
  }
}
