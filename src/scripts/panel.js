// Projektdetail als Overlay: öffnet ohne Seitenwechsel, setzt die Projekt-URL,
// Zurück-Button / ESC / × schließen, die Scrollposition der Startseite bleibt erhalten.
const root = document.documentElement;
const page = document.querySelector('[data-page]');
const langLink = document.querySelector('[data-lang-alt]');
const panels = [...document.querySelectorAll('.panel')];

let current = panels.find((p) => p.classList.contains('is-open')) ?? null;
// true, wenn wir das Panel selbst per pushState geöffnet haben → Schließen = history.back()
let pushedByUs = false;
let returnFocus = null;

function show(panel) {
  if (current && current !== panel) hide(current);
  current = panel;
  panel.classList.add('is-open');
  panel.inert = false;
  page.inert = true;
  document.body.classList.add('panel-open');
  const sheet = panel.querySelector('.panel-sheet');
  sheet.scrollTop = 0;
  sheet.focus({ preventScroll: true });
  langLink.href = panel.dataset.altUrl;
  document.title = panel.dataset.title;
}

function hide(panel) {
  panel.classList.remove('is-open');
  panel.inert = true;
  // Das Video läuft im geschlossenen Panel weiter, darf dann aber nicht mehr zu hören sein.
  for (const video of panel.querySelectorAll('video')) video.muted = true;
}

function closeView() {
  if (!current) return;
  hide(current);
  current = null;
  page.inert = false;
  document.body.classList.remove('panel-open');
  langLink.href = root.dataset.homeAlt;
  document.title = root.dataset.homeTitle;
  returnFocus?.focus({ preventScroll: true });
}

function open(slug, url) {
  const panel = panels.find((p) => p.dataset.slug === slug);
  if (!panel) return;
  if (current) {
    history.replaceState({}, '', url); // „Nächstes Projekt“ stapelt keine History-Einträge
  } else {
    returnFocus = document.activeElement;
    history.pushState({}, '', url);
    pushedByUs = true;
  }
  show(panel);
}

function close() {
  if (!current) return;
  if (pushedByUs) {
    history.back(); // popstate schließt das Panel
  } else {
    history.replaceState({}, '', root.dataset.home);
    closeView();
  }
}

document.addEventListener('click', (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const opener = e.target.closest('[data-panel-open]');
  if (opener) {
    e.preventDefault();
    open(opener.dataset.panelOpen, opener.href);
    return;
  }
  if (e.target.closest('[data-panel-close]')) {
    e.preventDefault();
    close();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') close();
});

window.addEventListener('popstate', () => {
  const panel = panels.find((p) => p.dataset.url === location.pathname);
  if (panel) {
    pushedByUs = true; // per „Vorwärts“ zurückgekehrt: davor liegt die Startseite
    show(panel);
  } else {
    pushedByUs = false;
    closeView();
  }
});

// Direktaufruf einer Projekt-URL: Seite darunter sperren
if (current) {
  page.inert = true;
  document.body.classList.add('panel-open');
}
