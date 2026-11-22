/* Klickdummy – Wetter-App
   Durchgehender Flow: Template wählen → Module wählen (→ Karte einstellen) → Ort suchen
   → Templates & Standorte → Wetter-Screen. Positionen in px entsprechen den Figma-Frames. */

const A = 'assets/';

/* ---------- Helfer ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const px = (n) => (typeof n === 'number' ? n + 'px' : n);
const box = (l, t, w, h) => `left:${px(l)};top:${px(t)};width:${px(w)};height:${px(h)};`;

// Bild in einer absolut positionierten Box; insets bilden die verschachtelten Figma-Wrapper nach
function pic(src, l, t, w, h, insets = [], extra = '', cls = '') {
  let inner = `<img src="${A}${src}" alt="">`;
  const layers = insets.length ? insets : ['0'];
  for (let i = layers.length - 1; i >= 0; i--) inner = `<div class="fill" style="inset:${layers[i]}">${inner}</div>`;
  return `<div class="a ${cls}" style="${box(l, t, w, h)}${extra}">${inner}</div>`;
}

// Bild in einer Box mit Transformation (gedrehte/gespiegelte Figma-Elemente)
function turned(src, l, t, w, h, iw, ih, transform, insets = []) {
  let inner = `<img src="${A}${src}" alt="">`;
  for (let i = insets.length - 1; i >= 0; i--) inner = `<div class="fill" style="inset:${insets[i]}">${inner}</div>`;
  if (!insets.length) inner = `<div class="fill">${inner}</div>`;
  return `<div class="a" style="${box(l, t, w, h)}display:flex;align-items:center;justify-content:center">
    <div style="position:relative;flex:none;width:${iw}px;height:${ih}px;transform:${transform}">${inner}</div></div>`;
}

const txt = (html, l, t, cls = '', extra = '') =>
  `<p class="a ${cls}" style="left:${px(l)};top:${px(t)};${extra}">${html}</p>`;

const line = (src, l, t, w, inset = '-4px 0 0 0') => pic(src, l, t, w, 0, [inset]);

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Daten ---------- */

const MODULES = ['temp', 'karte', 'kleidung', 'pollen', 'uv', 'wind', 'niederschlag', 'wasserstand', 'warnungen'];
const MODULE_NAMES = {
  temp: 'Temperatur', karte: 'Karte', kleidung: 'Kleiderempfehlung', pollen: 'Pollen', uv: 'UV-Index',
  wind: 'Wind', niederschlag: 'Niederschlag', wasserstand: 'Wasserstand', warnungen: 'Warnungen',
};

const TEMPLATES = [
  { id: 'alltag', title: 'Alltags Template', sub: 'Für jeden Tag', label: 'Alltag', top: 204,
    icon: 'sofa', inset: ['16.67% 8.33%', '-4.69% -3.75%'],
    preset: ['temp', 'karte', 'kleidung', 'uv', 'niederschlag', 'warnungen'] },
  { id: 'wandern', title: 'Wander Template', sub: 'Für deinen Aufenthalt in den Bergen', label: 'Wandern', top: 299,
    icon: 'wander', inset: ['-3.13% -3.12%'], avatar: 'mountain', avatarInset: ['12.5% 8.33%', '-3.7% -3.33%'],
    preset: ['temp', 'karte', 'kleidung', 'pollen', 'uv'] },
  { id: 'urlaub', title: 'Urlaubs Template', sub: 'Für deine nächste große Reise', label: 'Urlaub', top: 394,
    icon: 'plane', inset: [],
    preset: ['temp', 'karte', 'kleidung', 'pollen', 'uv'] },
  { id: 'garten', title: 'Gärtner Template', sub: 'Für Pflanzenliebhaber', label: 'Garten', top: 489,
    icon: 'flower', inset: ['8.33% 20.83%', '-3.75% -5.36%'],
    preset: ['temp', 'pollen', 'uv', 'wind', 'niederschlag'] },
  { id: 'see', title: 'Seefahrer Template', sub: 'Für deine Erkundung der Meere und Seen', label: 'Seefahrt', top: 584,
    icon: 'anchor', inset: ['8.33% 12.5%', '-3.75% -4.17%'],
    preset: ['temp', 'karte', 'wind', 'wasserstand', 'warnungen'] },
  { id: 'neu', title: 'Neues Template erstellen', sub: 'Passend zu deinen Bedürfnissen', label: 'Eigenes', top: 679,
    icon: 'circleplus', inset: ['8.33%', '-3.75%'], dashed: true,
    preset: ['temp'] },
];

// Ortsdatenbank für die Suche (Farbe = Temperaturtendenz wie in Figma)
const PLACES = [
  ['Kehl', 'DE, Baden-Württemberg - 401 m', 'rot', '27°C'],
  ['Ketsch', 'DE, Baden-Württemberg - 808 m', 'gruen', '21°C'],
  ['Keltern', 'DE, Baden-Württemberg - 708 m', 'rot', '26°C'],
  ['Kempten', 'DE, Allgäu - 674 m', 'rot', '29°C'],
  ['Keulen', 'DE, Nordrhein-Westfalen - 401 m', 'blau', '12°C'],
  ['Kemnath', 'DE, Bayern - 808 m', 'blau', '11°C'],
  ['Kemnader See', 'DE, Nordrhein-Westfalen - 708 m', 'rot', '25°C'],
  ['Kembs', 'FR, Elsass - 401 m', 'gruen', '19°C'],
  ['Nürnberg', 'DE, Bayern - 674 m', 'blau', '9°C'],
  ['Neustadt an der Aisch', 'DE, Bayern - 808 m', 'rot', '24°C'],
  ['Neuwied', 'DE, Nord Rhein Westfalen - 708 m', 'rot', '23°C'],
  ['Neustadt am Rübenberge', 'DE, Niedersachsen - 808 m', 'gruen', '18°C'],
  ['Neuss', 'DE, Nordrhein-Westfalen - 708 m', 'rot', '22°C'],
  ['Nettetal', 'DE, Bodensee - 401 m', 'gruen', '17°C'],
  ['Nellingen', 'DE, Baden Württemberg - 401 m', 'blau', '8°C'],
  ['Nördlingen', 'DE, Bayern - 401 m', 'gruen', '16°C'],
  ['Nienburg (Weser)', 'DE, Niedersachsen - 401 m', 'blau', '10°C'],
  ['Nebringen', 'DE, Baden Württemberg - 674 m', 'blau', '7°C'],
  ['Nebelhorn', 'DE, Alpen - 2224 m', 'blau', '-2°C'],
  ['Nebra', 'DE, Sachsen-Anhalt - 708 m', 'rot', '22°C'],
  ['Nebelschütz', 'DE, Sachsen - 401 m', 'gruen', '15°C'],
].map(([name, sub, color, temp]) => ({ id: name.toLowerCase().replace(/\W+/g, '-'), name, sub, color, temp }));

const MAP_LAYERS = {
  n: { label: 'Niederschlag', title: 'Niederschlagskarte', l: ['schwach', 91], r: ['stark', 271], icon: 'drizzle' },
  g: { label: 'Gewitter', title: 'Gewitter Karte', l: ['schwach', 91], r: ['stark', 271], icon: 'lightning' },
  t: { label: 'Temperatur', title: 'Temperaturkarte', l: ['-10 °C', 101], r: ['30 °C', 260], icon: 'thermo' },
};
const LAYER_ORDER = ['n', 'g', 't'];

const MAP_SIZES = [
  { id: 'large', max: 5, inactive: [] },
  { id: 'wide', max: 3, inactive: ['legend'] },
  { id: 'small', max: 1, inactive: ['timeline', 'legend'] },
];

/* ---------- Zustand ---------- */

let S;

function freshState() {
  return {
    templates: [],
    activeTpl: null,
    places: [{ id: 'here', name: 'Aktueller Standort', sub: 'Live Standort', color: 'rot', temp: '24°C', fav: false }],
    current: null,
    layer: 'n',
    stack: [],
    draft: null, // Kopie des Templates, das gerade in der Modul-Auswahl bearbeitet wird
    modCtx: null, // 'onboarding' | 'new' | 'edit'
    mapDraft: null,
    searchBack: false,
  };
}

function makeTemplate(def) {
  const modules = Object.fromEntries(MODULES.map((m) => [m, def.preset.includes(m)]));
  return {
    id: def.id, label: def.label, icon: def.icon, avatar: def.avatar || def.icon,
    avatarInset: def.avatarInset || def.inset, modules,
    map: { size: 'large', fns: { n: true, t: true, g: true }, timeline: true, legend: true },
  };
}

const activeTemplate = () => S.templates.find((t) => t.id === S.activeTpl);
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ---------- Navigation ---------- */

const views = Object.fromEntries($$('.view').map((v) => [v.dataset.view, v]));
let currentView = null;

const ANIMS = {
  push: ['anim-push-in', 'anim-push-out'],
  pop: ['anim-pop-in', 'anim-pop-out'],
  up: ['anim-up-in', 'anim-stay'],
  down: ['anim-stay', 'anim-down-out'],
  fade: ['anim-fade-in', 'anim-stay'],
};

function go(name, anim = 'push', { remember = true } = {}) {
  RENDER[name]();
  const next = views[name];
  const prev = currentView && views[currentView];
  if (remember && currentView && currentView !== name) S.stack.push(currentView);
  if (prev === next) return;

  const [inCls, outCls] = ANIMS[anim] || ANIMS.fade;
  $$('.view').forEach((v) => v.classList.remove('is-active', 'is-leaving', ...Object.values(ANIMS).flat()));
  next.classList.add('is-active', inCls);
  if (prev) {
    prev.classList.add('is-leaving', outCls);
    setTimeout(() => prev.classList.remove('is-leaving', outCls), 460);
  }
  setTimeout(() => next.classList.remove(inCls), 460);
  currentView = name;
}

function back(anim = 'pop') {
  const target = S.stack.pop();
  if (target) go(target, anim, { remember: false });
}

/* ---------- 1 · Template-Auswahl (Onboarding) ---------- */

function renderWelcome() {
  const v = views.welcome;
  v.innerHTML = `
    <div class="intro">
      <p class="t16 sb">Guten Tag!</p>
      <p class="t14">Bevor wir loslegen, wähle ein Template aus, welches zu deiner Situation passt oder erstelle dein eigenes!</p>
    </div>
    <div class="divider"></div>
    ${TEMPLATES.map((t) => `
      <button class="tpl-card ${t.dashed ? 'tpl-card--new' : ''}" style="top:${t.top}px" data-tpl="${t.id}" type="button">
        <span class="tpl-card__title t16 sb nowrap">${t.title}</span>
        <span class="tpl-card__sub t14 nowrap">${t.sub}</span>
        ${pic(`tpl/${t.icon}.svg`, 305, 21, 32, 32, t.inset)}
      </button>`).join('')}
    ${S.templates.length ? `<button class="sheet-close" data-back type="button" aria-label="Abbrechen">${pic('module/Close.svg', 8, 8, 15, 15, ['-4.71%'])}</button>` : ''}
  `;
}

async function pickTemplate(id, card) {
  card.classList.add('is-pressed');
  await wait(220);
  const def = TEMPLATES.find((t) => t.id === id);
  let tpl = S.templates.find((t) => t.id === id);
  if (!tpl || id === 'neu') {
    tpl = makeTemplate(def);
    if (id === 'neu') tpl.id = 'neu-' + (S.templates.filter((t) => t.id.startsWith('neu')).length + 1);
  }
  S.draft = clone(tpl);
  S.modCtx = S.templates.length ? 'new' : 'onboarding';
  go('modules', 'up');
  card.classList.remove('is-pressed');
}

/* ---------- 2 · Modul-Auswahl ---------- */

const TGL = {
  on: ['ToggleOn.svg', '0 -1.37% -15.57% 0'],
  off: ['ToggleOff.svg', '0 0 -15.57% 0'],
};

function toggle(on, dir = 'module/') {
  const [file, inset] = on ? TGL.on : TGL.off;
  const src = dir === 'ui/' ? (on ? 'MapCfgToggleOn.svg' : 'MapCfgToggleOff.svg') : file;
  return `<div class="fill" style="inset:${dir === 'ui/' ? TGL.on[1] : inset}"><img src="${A}${dir}${src}" alt=""></div>`;
}

const CFG_INSET = ['-7.96% -17.84% -27.72% -17.84%'];

// Modul-Karten (Vorschau-Wireframes) – Geometrie aus Figma-Frame „Modul Auswahl"
const MOD_CARDS = {
  temp: { box: [20, 150, 362, 285], tgl: [302, 11], cfg: [141, 103], body: () => `
    ${txt('Temperatur', 20, 23, 'ttl vc')}
    ${pic('module/Line38.svg', 16, 131, 329, 0, ['-1px 0'])}
    ${[['Group110', 146], ['Group112', 169], ['Group112', 261], ['Group113', 192], ['Group114', 215], ['Group115', 238]]
      .map(([g, t]) => pic(`module/${g}.svg`, 133.69, t, 141, 7)).join('')}
    ${[152, 175, 198, 220, 244, 267].map((t) =>
      line('module/Line93.svg', 72, t, 24) + line('module/Line93.svg', 318, t, 24) + line('module/Line101.svg', 20, t, 17)).join('')}
    ${pic('module/Group144.svg', 20, 52, 320, 67, ['-5.97% 0 0 0'])}` },
  karte: { box: [27, 458, 348, 312], tgl: [295, 10], cfg: [134, 116], body: () => `
    <img class="a" src="${A}module/Image16.png" alt="" style="${box(0, 31, 348, 281)}border-radius:15px">
    <div class="a" style="${box(0, 31, 348, 67)}background:linear-gradient(to top,rgba(255,255,255,0),#fff 73%)"></div>
    ${[['#5b5b5b', 104, '15px 0 0 15px'], ['#939393', 139, '0'], ['#9e9e9e', 174, '0'], ['#6a6a6a', 209, '0 15px 15px 0']]
      .map(([c, l, r]) => `<div class="a" style="${box(l, 49, 35.25, 7)}background:${c};border-radius:${r}"></div>`).join('')}
    <div class="a" style="${box(0, 245, 348, 67)}background:linear-gradient(to bottom,rgba(255,255,255,0),#fff 73%)"></div>
    ${pic('module/Group136.svg', 103.83, 291.5, 153.263, 13.5, ['-11.11% -0.35% -7.37% -0.35%'])}
    ${pic('module/Rectangle204.svg', 305, 202.43, 30.426, 30.426)}
    ${pic('module/Group.svg', 310, 208, 20.745, 20.745, ['12.51% 8.3% 8.33% 8.34%', '-3.05% -2.89%'])}
    ${pic('module/Group141.svg', 305, 160, 30.426, 30.426)}
    ${pic('module/Group142.svg', 305, 244.85, 30.426, 30.426)}
    ${txt('Karte', 12, 22, 'ttl vc', 'color:#151228')}` },
  kleidung: { box: [17, 806, 171, 380], tgl: [111, 10], cfg: [40, 149], body: () => `
    ${pic('module/Ellipse111.svg', -27, 312, 226, 89)}
    ${pic('module/Group94.svg', 37.34, 121, 87.477, 245, ['-0.73% 0 0 -6.15%'])}
    ${txt('Kleidungs<br>empfehlung:', 13, 28, 'ttl vc', 'color:#151228;line-height:normal')}
    ${line('module/Line112.svg', 13, 78, 67, '-8px 0 0 0')}
    ${line('module/Line113.svg', 13, 98, 79, '-8px 0 0 0')}` },
  pollen: { box: [211, 807, 171, 180], tgl: [106, 10], cfg: [45, 50], body: () => `
    ${txt('Pollen', 19, 20, 'ttl vc')}
    ${line('module/Line4.svg', 20, 114.35, 131.25, '-2px 0 0 0')}
    ${pic('module/Vector.svg', 40, 47, 91.912, 41, ['-9.76% -4.35%'])}
    ${pic('module/Vector1.svg', 39.55, 47, 45.95, 41, ['-9.76% -8.7%'])}
    ${turned('module/Rectangle202.svg', 49, 73, 62, 23, 23, 62, 'rotate(-90deg) scaleY(-1)')}
    ${pic('module/Group154.svg', 27, 120, 117, 32)}
    ${pic('module/ChevronRight.svg', 133, 36, 24, 24)}` },
  uv: { box: [211, 1006, 171, 180], tgl: [113, 11], cfg: [45, 50], body: () => `
    ${txt('UV-Index', 19, 22, 'ttl vc')}
    ${pic('module/Group140.svg', 24.17, 61, 131.248, 44.525)}
    ${line('module/Line107.svg', 20, 126, 129)}
    ${line('module/Line109.svg', 38, 68, 27)}
    ${line('module/Line108.svg', 20, 141, 112)}
    <div class="a" style="${box(20, 43, 19, 30)}background:var(--dunkelgrau);border-radius:15px"></div>` },
  wind: { box: [20, 1205, 362, 156], tgl: [304, 10], cfg: [143, 38], body: () => `
    ${pic('module/Group97.svg', 20, 81, 159.5, 31, ['-3.23% -0.63%'])}
    ${pic('module/Group96.svg', 235, 31, 104, 104)}
    ${txt('Wind', 20, 22, 'ttl vc')}
    ${line('module/Line89.svg', 20, 68, 32)}${line('module/Line90.svg', 20, 99, 55)}
    ${line('module/Line92.svg', 138, 99, 36)}${line('module/Line95.svg', 264, 91, 29)}
    ${line('module/Line92.svg', 138, 68, 36)}${line('module/Line94.svg', 144, 130, 39)}
    ${line('module/Line91.svg', 20, 130, 48)}` },
  niederschlag: { box: [21, 1384, 171, 180], tgl: [113, 11], cfg: [45, 50], body: () => `
    ${txt('Niederschlag', 19, 20, 'ttl vc')}
    ${pic('module/Ellipse45.svg', 21, 120, 17, 17)}${pic('module/Ellipse46.svg', 121, 120, 17, 17)}${pic('module/Ellipse46.svg', 71, 120, 17, 17)}
    ${line('module/Line4.svg', 20.3, 114.35, 131.25, '-2px 0 0 0')}
    ${pic('module/Vector.svg', 39.55, 47, 91.9, 41, ['-9.76% -4.35%'])}
    ${pic('module/Vector1.svg', 39.55, 47, 45.95, 41, ['-9.76% -8.7%'])}
    ${turned('module/Rectangle202.svg', 49, 73, 62, 23, 23, 62, 'rotate(-90deg) scaleY(-1)')}
    ${line('module/Line110.svg', 21, 152, 17)}${line('module/Line111.svg', 71, 152, 17)}${line('module/Line111.svg', 121, 152, 17)}` },
  wasserstand: { box: [211, 1384, 171, 180], tgl: [108, 11], cfg: [45, 50], body: () => `
    ${pic('module/Vector42.svg', -1, 112.98, 172, 93.025)}
    ${pic('module/Frame107.svg', 11, 53, 160, 109, ['-7.34% 0 0 0'])}
    ${txt('Wasserstand', 12, 20, 'ttl vc')}` },
  warnungen: { box: [21, 1586, 362, 156], tgl: [303, 7], cfg: [134, 38], body: () => `
    ${txt('Warnungen', 22, 20, 'ttl vc')}
    ${pic('module/Flash.svg', 9, 61, 48, 48)}
    ${pic('module/Group98.svg', 182, 54, 159, 62, ['-1.61% -0.63%'])}
    ${turned('module/Group105.svg', 22, 64, 123, 75, 75, 123, 'rotate(-90deg) scaleY(-1)')}
    ${line('module/Line96.svg', 182, 72, 70)}${line('module/Line97.svg', 182, 41, 29)}
    ${line('module/Line98.svg', 182, 103, 60)}${line('module/Line91.svg', 182, 134, 48)}
    ${line('module/Line100.svg', 272, 134, 69)}${line('module/Line102.svg', 304, 103, 37)}
    ${line('module/Line103.svg', 309, 72, 32)}${line('module/Line104.svg', 305, 41, 36)}` },
};

function renderModules() {
  const v = views.modules;
  const mods = S.draft.modules;
  v.innerHTML = `
    <div class="scroll">
      <div class="canvas" style="height:1884px">
        <div class="sheet-bg" style="height:1824px"></div>
        <p class="sheet-title">Modul Auswahl</p>
        <p class="sheet-sub">wähle deine gewünschten Module</p>
        <button class="sheet-close" data-close type="button" aria-label="Schließen">${pic('module/Close.svg', 8, 8, 15, 15, ['-4.71%'])}</button>
        ${MODULES.map((id) => {
          const c = MOD_CARDS[id];
          const [l, t, w, h] = c.box;
          return `<div class="card mod-card" data-mod="${id}" style="${box(l, t, w, h)}">
            ${c.body()}
            <button class="mod-cfg" data-cfg="${id}" type="button" aria-label="${MODULE_NAMES[id]} einstellen" style="left:${c.cfg[0]}px;top:${c.cfg[1]}px">
              <div class="fill" style="inset:${CFG_INSET[0]}"><img src="${A}module/${mods[id] ? 'CfgOn' : 'CfgOff'}.svg" alt=""></div>
            </button>
            <button class="tgl" data-tgl="${id}" type="button" role="switch" aria-checked="${mods[id]}" aria-label="${MODULE_NAMES[id]}" style="left:${c.tgl[0]}px;top:${c.tgl[1]}px">${toggle(mods[id])}</button>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="sheet-fade"></div>
    <button class="pill-btn" data-apply type="button">
      <span class="pill-btn__label">Übernehmen</span>
      ${pic('module/ChevronWhite.svg', 211, 12, 24, 24)}
    </button>`;
}

function setModule(id, on) {
  S.draft.modules[id] = on;
  const card = $(`.mod-card[data-mod="${id}"]`, views.modules);
  const tgl = $('.tgl', card);
  tgl.innerHTML = toggle(on);
  tgl.setAttribute('aria-checked', on);
  $('.mod-cfg img', card).src = `${A}module/${on ? 'CfgOn' : 'CfgOff'}.svg`;
}

function applyModules() {
  const tpl = S.draft;
  const i = S.templates.findIndex((t) => t.id === tpl.id);
  if (i >= 0) S.templates[i] = tpl; else S.templates.push(tpl);
  S.activeTpl = tpl.id;
  S.draft = null;

  if (S.modCtx === 'onboarding') {
    S.searchBack = false;
    S.stack = [];
    go('search', 'push', { remember: false });
  } else if (S.modCtx === 'new') {
    S.stack = [];
    go('home', 'down', { remember: false });
  } else {
    back('down');
  }
}

/* ---------- 3 · Karten-Widget einstellen ---------- */

function previewHTML(size, i) {
  if (size === 'large') {
    return `<div class="preview" data-slide="${i}" style="width:249.243px;height:212px">
      <img class="a" src="${A}ui/MapGray.png" alt="" style="${box(0, 10.74, 249.243, 201.257)}border-radius:10.743px">
      <div class="preview__fade-top"></div>
      ${[['#5b5b5b', 74.49, '10px 0 0 10px'], ['#939393', 99.55, 0], ['#9e9e9e', 124.62, 0], ['#6a6a6a', 149.69, '0 10px 10px 0']]
        .map(([c, l, r]) => `<div class="a" style="${box(l, 23.64, 25.25, 5)}background:${c};border-radius:${r}"></div>`).join('')}
      <div class="preview__fade-bot" style="height:47.986px"></div>
      ${pic('module/Group136.svg', 74.36, 197.32, 109.77, 9.669, ['-11.11% -0.35% -7.37% -0.35%'])}
      ${pic('module/Group141.svg', 218.45, 103.14, 21.791, 21.791)}
      ${pic('module/Rectangle204.svg', 218.45, 133.52, 21.791, 21.791)}
      ${pic('module/Group.svg', 222.03, 137.51, 14.858, 14.858, ['12.51% 8.3% 8.33% 8.35%', '-3.04% -2.89% -3.05% -2.89%'])}
      ${pic('module/Group142.svg', 218.45, 163.91, 21.791, 21.791)}
    </div>`;
  }
  if (size === 'wide') {
    return `<div class="preview" data-slide="${i}" style="width:249px;height:99px">
      <img class="a" src="${A}ui/MapGray.png" alt="" style="${box(0, -23, 249.243, 201.257)}">
      <div class="preview__fade-top"></div>
      <div class="a" style="${box(0, 50, 249.243, 48)}background:linear-gradient(to bottom,rgba(255,255,255,0),#fff 73%)"></div>
      ${pic('module/Group136.svg', 74.36, 78.57, 109.77, 9.669, ['-11.11% -0.35% -7.37% -0.35%'])}
      ${pic('module/Group141.svg', 211, 5, 21.791, 21.791)}
      ${pic('module/Rectangle204.svg', 211, 35.39, 21.791, 21.791)}
      ${pic('module/Group.svg', 214.58, 39.38, 14.858, 14.858, ['12.51% 8.3% 8.33% 8.35%', '-3.04% -2.89% -3.05% -2.89%'])}
      ${pic('module/Group142.svg', 211, 65.77, 21.791, 21.791)}
    </div>`;
  }
  return `<div class="preview" data-slide="${i}" style="width:124px;height:124px">
    <img class="a" src="${A}ui/MapGray.png" alt="" style="${box(-62, -40, 249.243, 201.257)}">
    <div class="preview__fade-top" style="height:36px"></div>
  </div>`;
}

function renderMapCfg() {
  const v = views.mapcfg;
  const cfg = S.mapDraft;
  const idx = MAP_SIZES.findIndex((s) => s.id === cfg.size);
  const size = MAP_SIZES[idx];
  const isInactive = (k) => size.inactive.includes(k);

  const row = (key, label, on, inactive = false) => `
    <button class="cfg-row ${inactive ? 'is-inactive' : ''}" data-row="${key}" type="button" role="switch" aria-checked="${on && !inactive}" ${inactive ? 'aria-disabled="true"' : ''}>
      <span class="cfg-row__label">${label}</span>
      <span class="tgl">${toggle(on && !inactive, 'ui/')}</span>
    </button>`;

  const display = [['timeline', 'Timeline'], ['legend', 'Legende']];
  const activeDisplay = display.filter(([k]) => !isInactive(k));
  const inactiveDisplay = display.filter(([k]) => isInactive(k));

  v.innerHTML = `
    <div class="sheet-bg" style="height:900px"></div>
    <p class="sheet-title">Karte</p>
    <p class="sheet-sub">Stelle das Widget nach deinen Wünschen ein</p>
    <button class="sheet-close" data-close type="button" aria-label="Schließen">${pic('ui/MapCfgClose.svg', 8, 8, 15, 15, ['-4.71%'])}</button>
    <div class="carousel" id="carousel">
      <div class="carousel__track">${MAP_SIZES.map((s, i) => previewHTML(s.id, i)).join('')}</div>
    </div>
    <div class="dots">${MAP_SIZES.map((s, i) => `<button type="button" data-dot="${i}" class="${i === idx ? 'is-active' : ''}" aria-label="Größe ${i + 1}"></button>`).join('')}</div>
    <div class="cfg-list">
      <p class="cfg-head">Funktionen - Maximal ${size.max} gleichzeitig</p>
      ${['n', 't', 'g'].map((k) => row('fn-' + k, MAP_LAYERS[k].label, cfg.fns[k])).join('')}
      <p class="cfg-head">Anzeigeeinstellungen</p>
      ${activeDisplay.map(([k, l]) => row(k, l, cfg[k])).join('')}
      ${inactiveDisplay.length ? `<p class="cfg-head">Inaktiv</p>${inactiveDisplay.map(([k, l]) => row(k, l, false, true)).join('')}` : ''}
    </div>
    <div class="sheet-fade" style="height:70px"></div>
    <button class="pill-btn" data-apply type="button">
      <span class="pill-btn__label">Übernehmen</span>
      ${pic('ui/MapCfgChevron.svg', 211, 12, 24, 24)}
    </button>`;
  positionSlides(idx, false);
  bindCarousel();
}

function positionSlides(idx, animate = true) {
  const track = $('.carousel__track', views.mapcfg);
  if (!track) return;
  track.style.transition = animate ? '' : 'none';
  $$('.preview', track).forEach((p, i) => { p.style.left = `${201 + (i - idx) * 277}px`; });
}

function setMapSize(idx) {
  const cfg = S.mapDraft;
  const size = MAP_SIZES[idx];
  cfg.size = size.id;
  // Zu viele aktive Funktionen für die kleinere Größe? Überzählige abschalten.
  let count = 0;
  LAYER_ORDER.forEach((k) => { if (cfg.fns[k]) { count++; if (count > size.max) cfg.fns[k] = false; } });
  if (!LAYER_ORDER.some((k) => cfg.fns[k])) cfg.fns.n = true;
  const scrollY = 0;
  renderMapCfg();
  views.mapcfg.scrollTop = scrollY;
}

function bindCarousel() {
  const el = $('#carousel', views.mapcfg);
  let x0 = null;
  el.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  el.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    const idx = MAP_SIZES.findIndex((s) => s.id === S.mapDraft.size);
    if (Math.abs(dx) > 30) {
      const next = Math.max(0, Math.min(MAP_SIZES.length - 1, idx + (dx < 0 ? 1 : -1)));
      if (next !== idx) animateTo(next);
    } else {
      const slide = e.target.closest('[data-slide]');
      if (slide && +slide.dataset.slide !== idx) animateTo(+slide.dataset.slide);
    }
  });
}

function animateTo(idx) {
  positionSlides(idx, true);
  $$('.preview', views.mapcfg).forEach((p) => { p.style.transition = 'left .35s cubic-bezier(.2,.8,.2,1)'; });
  setTimeout(() => setMapSize(idx), 300);
}

function toggleMapRow(key, rowEl) {
  const cfg = S.mapDraft;
  const size = MAP_SIZES.find((s) => s.id === cfg.size);
  if (rowEl.classList.contains('is-inactive')) {
    toast('In dieser Widget-Größe nicht verfügbar');
    return;
  }
  if (key.startsWith('fn-')) {
    const k = key.slice(3);
    const activeCount = LAYER_ORDER.filter((l) => cfg.fns[l]).length;
    if (!cfg.fns[k] && activeCount >= size.max) {
      rowEl.classList.remove('shake'); void rowEl.offsetWidth; rowEl.classList.add('shake');
      toast(`Maximal ${size.max} Funktion${size.max > 1 ? 'en' : ''} gleichzeitig`);
      return;
    }
    if (cfg.fns[k] && activeCount === 1) {
      toast('Mindestens eine Funktion muss aktiv sein');
      return;
    }
    cfg.fns[k] = !cfg.fns[k];
    rowEl.querySelector('.tgl').innerHTML = toggle(cfg.fns[k], 'ui/');
    rowEl.setAttribute('aria-checked', cfg.fns[k]);
  } else {
    cfg[key] = !cfg[key];
    rowEl.querySelector('.tgl').innerHTML = toggle(cfg[key], 'ui/');
    rowEl.setAttribute('aria-checked', cfg[key]);
  }
}

/* ---------- 4 · Ortssuche ---------- */

function renderSearch() {
  const v = views.search;
  v.innerHTML = `
    <div class="${S.searchBack ? 'with-back' : ''}">
      ${S.searchBack ? `<button class="search-back" data-back type="button" aria-label="Zurück">
        <svg width="36" height="40" viewBox="0 0 36 40"><path d="M24 4 9 20l15 16" fill="none" stroke="#322f2f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` : ''}
      <input class="search-field" id="q" type="text" inputmode="none" autocomplete="off" spellcheck="false" placeholder="Nach Ort suchen" aria-label="Nach Ort suchen">
      <div class="search-line"></div>
      <button class="search-go" data-skip type="button" aria-label="Weiter">
        <svg width="36" height="40" viewBox="0 0 36 40"><path d="M12 4l15 16-15 16" fill="none" stroke="#322f2f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
    <div class="results" id="results"></div>
    <div class="keyboard" id="kb">
      <div class="kb-row">${'QWERTYUIOP'.split('').map((k) => `<button class="key" data-key="${k}" type="button">${k}</button>`).join('')}</div>
      <div class="kb-row kb-row--2">${'ASDFGHJKL'.split('').map((k) => `<button class="key" data-key="${k}" type="button">${k}</button>`).join('')}</div>
      <div class="kb-row kb-row--3">
        <button class="key key--fn" data-key="shift" type="button" aria-label="Umschalt">
          <svg width="20" height="18" viewBox="0 0 20 18"><path d="M10 1 1 10h5v7h8v-7h5z" fill="#fff"/></svg></button>
        <span class="kb-letters">${'ZXCVBNM'.split('').map((k) => `<button class="key" data-key="${k}" type="button">${k}</button>`).join('')}</span>
        <button class="key key--fn" data-key="del" type="button" aria-label="Löschen">
          <svg width="24" height="18" viewBox="0 0 24 18"><path d="M7 1h15a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7L1 9z" fill="#fff"/><path d="m11 5.5 7 7m0-7-7 7" stroke="#abb0bb" stroke-width="1.8" stroke-linecap="round"/></svg></button>
      </div>
      <div class="kb-row kb-row--4">
        <button class="key key--fn key--wide" data-key="num" type="button">.?123</button>
        <button class="key key--mid" data-key=" " type="button">space</button>
        <button class="key key--fn key--ret" data-key="ret" type="button">return</button>
      </div>
    </div>`;
  updateResults();
}

function searchMatches(q) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return PLACES.filter((p) => p.name.toLowerCase().startsWith(s)).slice(0, 5);
}

function updateResults() {
  const q = $('#q', views.search).value;
  const list = searchMatches(q);
  const res = $('#results', views.search);
  if (!q.trim()) { res.innerHTML = ''; return; }
  res.innerHTML = list.length
    ? list.map((p) => {
        const added = S.places.some((x) => x.id === p.id);
        return `<button class="loc loc--${p.color}" data-add="${p.id}" type="button">
          <span class="loc__name nowrap">${p.name}</span>
          <span class="loc__sub nowrap">${p.sub}</span>
          ${added ? `<img class="loc__add" src="${A}ui/CircleCheck.svg" alt="bereits hinzugefügt">`
                  : pic('tpl/circleplus.svg', 307, 21, 32, 32, ['8.33%', '-3.75%'])}
        </button>`;
      }).join('')
    : `<p class="no-results">Kein Ort gefunden – probier „Kempten" oder „Nebelhorn".</p>`;
}

function typeKey(k) {
  const input = $('#q', views.search);
  if (k === 'del') input.value = input.value.slice(0, -1);
  else if (k === 'ret') { const first = $('[data-add]', views.search); if (first) first.click(); return; }
  else if (k === 'shift' || k === 'num') return;
  else input.value += input.value.length ? k.toLowerCase() : k.toUpperCase();
  updateResults();
}

async function addPlace(id, btn) {
  const p = PLACES.find((x) => x.id === id);
  if (!S.places.some((x) => x.id === id)) {
    const here = S.places.findIndex((x) => x.id === 'here');
    S.places.splice(here < 0 ? S.places.length : here, 0, { ...p, fav: false });
  }
  const icon = btn.querySelector('.loc__add, .a');
  if (icon) icon.outerHTML = `<img class="loc__add" src="${A}ui/CircleCheck.svg" alt="">`;
  await wait(380);
  S.stack = [];
  go('home', 'push', { remember: false });
}

/* ---------- 5 · Templates & Standorte ---------- */

function renderHome() {
  const v = views.home;
  const tplHTML = S.templates.map((t, i) => {
    const on = t.id === S.activeTpl;
    const icon = t.avatar === 'mountain' ? `tpl/mountain-${on ? 'light' : 'dark'}.svg` : `tpl/${t.avatar}${on ? '-light' : ''}.svg`;
    return `<button class="avatar ${on ? 'is-active' : ''}" style="left:${20 + i * 89}px" data-pick-tpl="${t.id}" type="button" aria-pressed="${on}">
      <span class="avatar__circle"></span>
      ${pic(icon, 11.5, 11.5, 36, 36, t.avatarInset)}
      <span class="avatar__label">${t.label}</span>
    </button>`;
  }).join('');
  const newLeft = 20 + S.templates.length * 89;

  const placesHTML = S.places.map((p, i) => {
    const tone = p.color === 'blau' ? 'blau' : 'rot';
    const star = tone === 'blau' ? (p.fav ? 'StarBlue' : 'StarBlueOutline') : (p.fav ? 'StarFilled' : 'StarOutline');
    return `<div class="place place--${tone} ${p.fav ? 'is-fav' : ''}" style="top:${283 + i * 95}px" data-open="${p.id}" role="button" tabindex="0">
      <button class="place__star" data-fav="${p.id}" type="button" aria-label="Favorit" aria-pressed="${p.fav}"><img src="${A}ui/${star}.svg" alt=""></button>
      <span class="place__name">${p.name}</span>
      <span class="place__sub">${p.sub}</span>
      <span class="place__temp">${p.temp}</span>
    </div>`;
  }).join('');
  const addTop = 283 + S.places.length * 95;
  const height = Math.max(874, addTop + 75 + 140);

  v.innerHTML = `
    <div class="scroll">
      <div class="canvas" style="height:${height}px">
        <p class="h22" style="left:19px;top:67px">Deine Templates</p>
        ${tplHTML}
        <button class="avatar avatar--new" style="left:${newLeft}px" data-new-tpl type="button">
          <span class="avatar__circle"></span>
          ${pic('ui/Plus.svg', 17.5, 17.5, 24, 24, ['20.83%', '-4.76%'])}
          <span class="avatar__label">Neues<br>Template</span>
        </button>
        <p class="h22" style="left:20px;top:245px">Deine Standorte</p>
        ${placesHTML}
        <button class="place place--add" style="top:${addTop}px" data-add-place type="button">
          ${pic('ui/CirclePlus.svg', 13, 17, 40, 40, ['8.33%', '-3%'])}
          <span class="place__name">Standort hinzufügen</span>
        </button>
      </div>
    </div>
    <div class="navbar">
      <button type="button" style="left:0;width:145px" aria-label="Standorte" data-nav="pin">${pic('ui/Pin.svg', 61.98, 11, 21.17, 28.33, ['-3.53% -4.41%'])}</button>
      <button type="button" style="left:151px;width:51px" aria-label="Profil" data-nav="user">${pic('ui/User.svg', 12, 12, 26.67, 26.67, ['-3.75%'])}</button>
      <button type="button" style="left:206px;width:51px" aria-label="Einstellungen" data-nav="settings">${pic('ui/Settings.svg', 12.9, 12, 24.33, 26.62, ['-3.76% -4.19%'])}</button>
    </div>`;
}

/* ---------- 6 · Wetter-Screen ---------- */

const WARM = {
  cold: false,
  header: pic('kempten/Group95.svg', -46, -122, 520.61, 452.044) + pic('kempten/Group294.svg', -103, -84, 616, 343.239),
  badge: pic('kempten/Rectangle236.svg', 0, 0, 84, 47, ['-17.02% -14.29% -34.04% -0.76%']) +
         pic('kempten/Group3.svg', 37, 4, 36, 36, ['12.5% 8.33%', '-3.7% -3.33%']),
  badgeBox: [7.5, 65], titleColor: '#fff',
  sliders: pic('kempten/Group133.svg', 0, 0, 47, 47, ['-17.02% -25.53% -34.04% -25.53%']), slidersBox: [332.5, 64],
  alert: {
    bg: 'kempten/Rectangle188.svg', fill: 'var(--blass-rot)', border: 'var(--rot)', temp: '29° C',
    title: 'starkes Gewitter', sub: '16:00 Uhr - 21:00 Uhr', left: 82.02, width: 146,
    icon: pic('kempten/CarbonFlashFilled1.svg', 36, 252, 38.019, 38.019),
  },
  hourly: {
    temps: ['29 °C', '28 °C', '27 °C', '25 °C', '23 °C', '19 °C', '17 °C'],
    icons: [
      ...[21, 68, 117, 165].map((l) => ['kempten/Group4.svg', l, ['2px', '-5%']]),
      ['kempten/Group5.svg', 213, ['12.49% 8.33% 12.5% 8.33%', '-5.55% -5%']],
      ['kempten/LucideCloudMoon.svg', 264, []], ['kempten/LucideCloudMoon.svg', 316, []],
    ],
    rain: [[33, '5 %'], [80.5, '5 %'], [128.5, '3 %']],
  },
  week: {
    dayTops: [145, 168, 191, 214, 237, 260],
    min: { align: 'left', x: 55, tops: [146, 169, 192, 214, 238, 261], vals: [14, 16, 17, 14, 18, 15] },
    max: { align: 'left', x: 312, tops: [146, 169, 192, 215, 238, 261], vals: [29, 26, 27, 24, 26, 29] },
    bars: ['kempten/Group110', 'kempten/Group112', 'kempten/Group113', 'kempten/Group114', 'kempten/Group115', 'kempten/Group116'],
  },
  clothes: {
    text: 'T-Shirt &amp;<br>kurze Hose', ground: 'kempten/Ellipse111.svg',
    figure: pic('kempten/Group94.svg', 38, 93, 87.477, 245, ['-0.73% 0 0 -6.15%']),
  },
  hasel: {
    color: 'var(--rot)', value: '78', left: 61,
    dots: ['kempten/Ellipse45.svg', 'kempten/Ellipse45.svg', 'kempten/Ellipse46.svg'],
    line: 'kempten/Line4.svg', arc: 'kempten/Vector.svg', icon: 'kempten/LucideLeafyGreen.svg',
    fill: pic('kempten/Vector1.svg', 40.61, 48, 76.63, 42, ['-9.52% -5.22%']),
  },
  uv: {
    sun: 'kempten/Group140.svg', icon: 'kempten/Group6.svg', value: '7', valueX: 36, color: 'var(--rot)',
    level: 'hoch', levelX: 39, text: 'Sonnenschutz nötig<br>von 10:00 - 19:00 Uhr', textW: 139,
  },
  wind: { speed: '12', rows: ['12 km/h', '14 km/h', '92° Ost'] },
  rain: {
    value: '3', dots: ['kempten/Ellipse47.svg', 'kempten/Ellipse48.svg', 'kempten/Ellipse48.svg'],
    line: 'kempten/Line4.svg', arc: 'kempten/Vector.svg', icon: 'kempten/LucideDroplet.svg',
    fill: pic('kempten/Vector2.svg', 40.61, 67.5, 6.94, 22.49, ['-17.78% -57.59% -17.78% -57.58%']),
  },
  water: { value: '19', valueX: 72, wave: pic('kempten/Vector42.svg', -1, 130, 173, 41), onWave: ['10m'], icon: 'kempten/IcRoundWater.svg' },
  danger: null,
  times: ['15:30', '18:45', '21:00'],
};

const COLD = {
  cold: true,
  header: pic('nebelhorn/Header.svg', -50.99, -183.17, 574.99, 496.34),
  badge: pic('nebelhorn/Badge.svg', 0, 0, 84, 47, ['0 0 0 13.53%']) +
         pic('nebelhorn/BadgeIcon.svg', 37, 4, 36, 36, ['12.5% 8.33%', '-3.7% -3.33%']),
  badgeBox: [8, 65], titleColor: 'var(--text)',
  sliders: pic('nebelhorn/Sliders.svg', 0, 0, 47, 47, ['-17.02% -25.53% -34.04% -25.53%']), slidersBox: [334, 65],
  alert: {
    bg: 'nebelhorn/AlertBg.svg', fill: 'var(--blass-blau)', border: 'var(--blau)', temp: '-2° C',
    title: 'leichte Lawinengefahr', sub: 'bis Montag', left: 81, width: 170,
    icon: pic('nebelhorn/AlertDanger.svg', 43, 256, 28, 28, ['12.5% 8.33%', '-2.38% -2.14%']),
  },
  hourly: {
    temps: ['-2 °C', '-2 °C', '-3 °C', '-3 °C', '-4 °C', '-5 °C', '-6 °C'],
    icons: [
      ...[21, 117, 165].map((l) => ['nebelhorn/CloudLightning.svg', l, ['2px', '-5%']]),
      ...[69.65, 213.5, 264, 317.5].map((l) => ['nebelhorn/Snowflake.svg', l, ['12.5% 8.33%', '-5.56% -5%']]),
    ],
    rain: [[81.65, '5 %'], [225.5, '25 %'], [276, '50 %'], [329.5, '35 %']],
  },
  week: {
    dayTops: [142, 165, 188, 211, 234, 257],
    min: { align: 'right', x: 88, tops: [142, 165, 188, 211, 234, 257], vals: [-9, -8, -10, -7, -8, -8] },
    max: { align: 'right', x: 346, tops: [146, 169, 192, 215, 238, 261], vals: [5, 6, 4, 4, 6, 5] },
    bars: ['nebelhorn/Bar1', 'nebelhorn/Bar2', 'nebelhorn/Bar3', 'nebelhorn/Bar4', 'nebelhorn/Bar2', 'nebelhorn/Bar6'],
  },
  clothes: {
    text: 'dicke Jacke &amp;<br>lange Hose', ground: 'nebelhorn/Ellipse111.svg',
    figure: pic('nebelhorn/Group94.svg', 26.9, 94, 98.076, 245, ['-0.73% 0 0 0']),
  },
  hasel: {
    color: 'var(--blau)', value: '0', left: 65,
    dots: ['nebelhorn/HaselDot1.svg', 'nebelhorn/HaselDot1.svg', 'nebelhorn/HaselDot2.svg'],
    line: 'nebelhorn/HaselLine.svg', arc: 'nebelhorn/HaselArc.svg', icon: 'nebelhorn/Leafy.svg', fill: '',
  },
  uv: {
    sun: 'nebelhorn/UvSun.svg', icon: 'nebelhorn/UvIcon.svg', value: '1', valueX: 35, color: 'var(--blau)',
    level: 'niedrig', levelX: 38, text: 'kein Sonnenschutz nötig', textW: 131,
  },
  wind: { speed: '3', rows: ['3 km/h', '7 km/h', '92° Ost'] },
  rain: {
    value: '9', dots: ['nebelhorn/NsDot1.svg', 'nebelhorn/NsDot2.svg', 'nebelhorn/NsDot2.svg'],
    line: 'nebelhorn/NsLine.svg', arc: 'nebelhorn/NsArc.svg', icon: 'nebelhorn/Droplet.svg',
    fill: pic('nebelhorn/NsFill.svg', 40.61, 55.5, 19.39, 34.49, ['-11.6% -20.64% -11.59% -20.63%']),
  },
  water: { value: '25', valueX: 78, wave: pic('nebelhorn/Wave.svg', -1, 107, 172.5, 93.025), onWave: ['20m', '10m'], icon: 'nebelhorn/Water.svg' },
  danger: true,
  times: ['17:50', '18:45', '21:00'],
};

const title = (icon, text, x = 34) => `${icon}<p class="w-ttl" style="left:${x}px">${text}</p>`;
const HOUR_X = [33, 79.5, 128.5, 177, 225.5, 276, 328];
const HOUR_LABELS = ['Jetzt', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function wTemp(d) {
  const w = d.week;
  const col = (c) => c.vals.map((v, i) => c.align === 'left'
    ? txt(`${v} °C`, c.x, c.tops[i], 't14 muted nowrap')
    : txt(`${v} °C`, c.x, c.tops[i], 't14 muted nowrap rt')).join('');
  return `<div class="w w--full" style="height:292px">
    ${title(pic('kempten/LucideWind.svg', 16, 13, 14, 14), 'Temperatur')}
    ${HOUR_LABELS.map((h, i) => txt(h, HOUR_X[i], 46, 't14 hc nowrap')).join('')}
    ${d.hourly.icons.map(([src, l, ins]) => pic(src, l, 68, 24, 24, ins)).join('')}
    ${d.hourly.temps.map((t, i) => txt(t, HOUR_X[i], i > 4 ? 97 : 96, 't14 hc nowrap')).join('')}
    ${d.hourly.rain.map(([x, r]) => txt(r, x, 113, 't14 hc muted nowrap')).join('')}
    ${pic('kempten/Line38.svg', 16.5, 136, 329, 0, ['-1px 0'])}
    ${DAYS.map((day, i) => txt(day, 16, w.dayTops[i], 't14')).join('')}
    ${col(w.min)}${col(w.max)}
    ${w.bars.map((b, i) => pic(`${b}.svg`, 109, 150 + i * 23, 179, 7)).join('')}
  </div>`;
}

const LEGEND = [
  ['var(--blass-blau)', 'var(--blau)', 111, '15px 0 0 15px'],
  ['var(--blass-gruen)', '#55bda3', 146, '0'],
  ['var(--hell-gelb)', 'var(--gelb)', 181, '0'],
  ['var(--blass-rot)', 'var(--rot)', 216, '0 15px 15px 0'],
];

function wMap(tpl) {
  const cfg = tpl.map;
  const layers = LAYER_ORDER.filter((k) => cfg.fns[k]);
  if (!layers.includes(S.layer)) S.layer = layers[0];
  const L = MAP_LAYERS[S.layer];
  const sizeCls = { large: 'w--full', wide: 'w--full map--wide', small: 'map--small' }[cfg.size];
  const inactive = MAP_SIZES.find((s) => s.id === cfg.size).inactive;
  const showTimeline = cfg.timeline && !inactive.includes('timeline');
  const showLegend = cfg.legend && !inactive.includes('legend');
  return `<div class="w map ${sizeCls} ${showTimeline ? '' : 'no-timeline'} ${showLegend ? '' : 'no-legend'}" id="map">
    <div class="map__geo">
      <img class="map__img" src="${A}kempten/Image16.png" alt="">
      <div class="map__layers" id="mapLayers">
        <div class="map__layer ${S.layer === 'n' ? 'is-on' : ''}" data-layer="n">
          ${pic('kempten/Karte.svg', 22.28, 90.69, 199.449, 179.069, ['-0.28% -0.25%'])}
        </div>
        <div class="map__layer ${S.layer === 'g' ? 'is-on' : ''}" data-layer="g">
          ${turned('nebelhorn/GewitterKarte.svg', 89, 63, 221.603, 240.067, 204.63, 179.929, 'rotate(76.91deg)', ['-0.28% -0.24%'])}
        </div>
        <div class="map__layer ${S.layer === 't' ? 'is-on' : ''}" data-layer="t">
          <div class="a" style="${box(0, 13, 362, 301)}border-radius:38px;background:rgba(239,216,113,.34)"></div>
          ${pic('tempmap/Vector684.svg', 58.66, 16.11, 270.466, 257.077, ['-0.19% -0.18%'])}
        </div>
      </div>
      ${pic('kempten/Group.svg', 174, 109, 32, 32, ['8.33% 16.67%'])}
    </div>
    <div class="map__fade-top"></div>
    <div class="map__legend">
      <p class="map__legend-l rt" data-legend-l style="left:${L.l[1]}px">${L.l[0]}</p>
      <p class="map__legend-r" data-legend-r style="left:${L.r[1]}px">${L.r[0]}</p>
      ${LEGEND.map(([bg, bd, l, r]) => `<i style="left:${l}px;background:${bg};border-color:${bd};border-radius:${r}"></i>`).join('')}
    </div>
    <div class="map__fade-bot"></div>
    <div class="map__time" id="mapTime" aria-label="Zeitleiste – ziehen zum Abspielen">
      <p class="muted" style="left:83px">${S.data.times[0]}</p>
      <p id="mapNow" style="left:169px">18:45</p>
      <p class="muted" style="left:255px">${S.data.times[2]}</p>
      ${pic('kempten/Group136.svg', 94.54, 25.5, 172.555, 13.5, ['-11.11% -0.31% -7.37% -0.31%'])}
    </div>
    ${title(pic('kempten/LucideMap.svg', 15, 13, 14, 14), `<span id="mapTitle">${cfg.size === 'small' ? 'Karte' : L.title}</span>`, 32)}
    <div class="map__side">
      ${layers.map((k) => `<button class="layer-btn ${k === S.layer ? 'is-on' : ''}" data-layer-btn="${k}" type="button" aria-label="${MAP_LAYERS[k].label}">
        <img class="a" style="inset:0" src="${A}map/${MAP_LAYERS[k].icon}-${k === S.layer ? 'light' : 'dark'}.svg" alt="">
      </button>`).join('')}
    </div>
    <div class="map__expand a" style="left:0;bottom:0;width:362px;height:41px">
      <button class="a" data-expand type="button" aria-label="Vollbild" style="${box(304, 0, 30.43, 30.43)}">
        ${pic('kempten/Group143.svg', 0, 0, 30.426, 30.426, ['-26.29% -39.44% -52.59% -39.44%'])}
        ${pic('kempten/LucideExpand.svg', 5, 5, 21, 21)}
      </button>
    </div>
  </div>`;
}

function wClothes(d) {
  return `<div class="w w--tall">
    ${pic(d.clothes.ground, -26, 310, 226, 89)}
    ${d.clothes.figure}
    <p class="a t16 sb" style="left:16px;top:46px;width:139px">${d.clothes.text}</p>
    ${title(pic('kempten/LucideShirt.svg', 16, 14, 12, 12), 'Kleiderempfehlung', 32)}
  </div>`;
}

const triDays = () => [['Mo', 34], ['Di', 85], ['Mi', 136.5]].map(([dd, x]) => txt(dd, x, 143, 't14 muted hc')).join('');

function wHasel(d) {
  const h = d.hasel;
  return `<div class="w">
    ${[26, 77, 128].map((x, i) => pic(h.dots[i], x, 121, 17, 17)).join('')}
    ${txt(`<span class="t40">${h.value}</span><span class="t22">%</span>`, h.left, 86, 'vc sb nowrap', `color:${h.color};line-height:1`)}
    ${triDays()}
    ${line(h.line, 20.3, 111, 131.26, '-2px 0 0 0')}
    ${pic(h.arc, 40.61, 48, 89.78, 42, ['-9.52% -4.46%'])}
    ${h.fill}
    ${title(pic(h.icon, 16, 13, 13, 13), 'Hasel', 32)}
  </div>`;
}

function wUv(d) {
  const u = d.uv;
  return `<div class="w">
    ${pic(u.sun, 19, 63, 131.248, 47)}
    ${txt(u.level, u.levelX, 55, 't14 vc')}
    ${txt(u.value, u.valueX, 63, 't40 sb rt vc', `color:${u.color}`)}
    ${pic(u.icon, 16, 14, 11.75, 11.24, ['-7.56% -7.23%'])}
    <p class="w-ttl" style="left:32px">UV-Index</p>
    ${txt(u.text, 16, 134, 't14 vc', `width:${u.textW}px`)}
  </div>`;
}

function wWind(d) {
  const labels = ['Wind', 'Windböen', 'Richtung'];
  return `<div class="w w--full" style="height:144px">
    ${labels.map((l, i) => txt(l, 16, 55 + i * 31, 't14 vc')).join('')}
    ${d.wind.rows.map((r, i) => txt(r, 181, 55 + i * 31, 't14 rt vc nowrap')).join('')}
    ${pic('kempten/Vector34.svg', 16, 71, 163.463, 0, ['-0.5px 0'])}
    ${pic('kempten/Vector34.svg', 16, 102, 163.463, 0, ['-0.5px 0'])}
    ${pic('kempten/Ellipse112.svg', 233, 28, 90, 90, ['-5%'])}
    ${pic('kempten/Vector35.svg', 271.5, 21, 13.5, 15)}
    ${turned('kempten/Vector35.svg', 271.5, 110, 13.5, 15, 13.5, 15, 'scaleY(-1)')}
    ${turned('kempten/Vector36.svg', 314, 66, 15, 13.5, 13.5, 15, 'rotate(90deg)')}
    ${turned('kempten/Vector37.svg', 226, 66, 15, 13.5, 13.5, 15, 'rotate(-90deg)')}
    ${[['N', 274, 25.5], ['S', 275, 120.5], ['O', 320, 72.5], ['W', 225, 72.5]]
      .map(([c, x, y]) => txt(c, x, y, 'vc', 'font-size:12px;font-weight:500')).join('')}
    ${turned('kempten/Group96.svg', 239, 66, 79.771, 13.11, 79.42, 8, 'rotate(3.7deg)', ['-12.5% 0 -12.5% -1.78%'])}
    ${txt(d.wind.speed, 278, 66, 't14 sb hc vc')}
    ${txt('km/h', 279, 79, 't14 hc vc')}
    ${title(pic('kempten/LucideWind.svg', 16, 13, 14, 14), 'Wind')}
  </div>`;
}

function wRain(d) {
  const r = d.rain;
  return `<div class="w">
    ${[26, 128, 77].map((x, i) => pic(r.dots[i], x, 121, 17, 17)).join('')}
    ${txt(`<span class="t40">${r.value} </span><span class="t22">mm</span>`, 53, 86, 'vc sb nowrap', 'color:var(--gruen);line-height:1')}
    ${triDays()}
    ${line(r.line, 20.3, 111, 131.26, '-2px 0 0 0')}
    ${pic(r.arc, 40.61, 48, 89.78, 42, ['-9.52% -4.46%'])}
    ${r.fill}
    ${title(pic(r.icon, 16, 12, 15, 15), 'Niederschlag')}
  </div>`;
}

function wWater(d) {
  const w = d.water;
  const marks = [['50m', 39], ['40m', 66], ['30m', 93], ['20m', 120], ['10m', 147]];
  return `<div class="w">
    ${w.wave}
    ${[46, 73, 100, 127, 154].map((t) => `<div class="a" style="left:96px;right:0;top:${t}px;height:1px;border-radius:5px;background:var(--grau)"></div>`).join('')}
    ${txt(`<span class="t40">${w.value}</span><span class="t22">m</span>`, w.valueX, 63, 'rt vc sb nowrap', 'color:var(--blau);line-height:1')}
    ${marks.map(([m, y]) => txt(m, 155, y, 't14 rt vc', `color:${w.onWave.includes(m) ? 'var(--grau)' : 'var(--dunkelgrau)'}`)).join('')}
    ${title(pic(w.icon, 15, 12, 16, 16), 'Wasserstand')}
  </div>`;
}

function wDanger(d) {
  if (!d.danger) {
    return `<div class="w w--full" style="height:75px">
      ${txt('keine aktuellen Gefahren', 16, 49, 't22 sb vc', 'color:var(--blau);width:325px')}
      ${title(pic('kempten/Group7.svg', 16, 13, 14, 14, ['12.5% 8.33%', '-8.1% -7.29%']), 'Gefahren')}
    </div>`;
  }
  const labels = ['Höhenlage', 'Entfernung', 'Hangrichtung', 'Zeitraum'];
  const vals = ['ab 2000 m', '0,7 km', 'Nordost', 'bis Montag'];
  return `<div class="w w--full" style="height:144px">
    ${rowsRight(labels, vals)}
    ${txt('2', 37, 62, 't40 sb rt vc', 'color:var(--gruen)')}
    ${txt('leichte', 16, 107, 't16 sb vc', 'color:var(--gruen)')}
    ${txt('Lawinengefahr', 15, 123, 't14 vc')}
    ${turned('nebelhorn/GefLine4.svg', 75, 61.4, 57.5, 1, 57.5, 0, 'scaleX(-1)', ['-1px 0 0 0'])}
    ${turned('nebelhorn/LucideMountain.svg', 97, 38, 44, 44, 44, 44, 'rotate(180deg) scaleY(-1)')}
    ${txt('3', 83.35, 41.84, 't14 hc')}
    ${txt('2', 84.06, 61, 't14 hc')}
    <div class="a" style="${box(97, 71, 44, 44)}">
      <div style="position:absolute;inset:0;transform:rotate(180deg)">
        ${pic('nebelhorn/MountainVector.svg', 3.67, 5.5, 36.67, 33, ['-1.52% -1.36%'])}
        <p class="a t14" style="left:20.87px;top:20.74px;transform:rotate(-180deg) scaleX(-1)">!</p>
      </div>
    </div>
    ${title(pic('nebelhorn/Danger.svg', 15.75, 13, 14.5, 14.5, ['12.5% 8.33%', '-7.08% -6.37%']), 'Gefahren')}
  </div>`;
}

function rowsRight(labels, vals) {
  return `${labels.map((l, i) => txt(l, 171, 34 + i * 31, 't14 vc nowrap')).join('')}
    ${vals.map((v, i) => txt(v, 345.96, 34 + i * 31, 't14 rt vc nowrap')).join('')}
    ${pic('kempten/Vector32.svg', 171, 50, 174.996, 0, ['-0.5px 0'])}
    ${pic('kempten/Vector33.svg', 171, 81, 174.996, 0, ['-0.5px 0'])}
    ${pic('kempten/Vector32.svg', 171, 112, 174.996, 0, ['-0.5px 0'])}`;
}

function wWarn() {
  return `<div class="w w--full" style="height:144px">
    ${pic('kempten/Group2.svg', 15, 13, 15, 15, ['12.5%', '-7.56%'])}
    ${pic('kempten/CarbonFlashFilled.svg', 7, 52, 48, 48)}
    ${txt('leichtes<br>Gewitter', 54, 73, 't22 sb vc', 'color:var(--gruen);width:100px;line-height:31px')}
    ${rowsRight(['Wind', 'Niederschlag', 'Entfernung', 'Zeitraum'], ['3 km/h', '9 mm', '5 km', 'bis 15:00 Uhr'])}
    ${turned('kempten/Group105.svg', 25, 113, 108.867, 15, 15, 108.867, 'rotate(-90deg) scaleY(-1)')}
    <p class="w-ttl" style="left:34px">Warnungen</p>
  </div>`;
}

function renderMain() {
  const v = views.main;
  const place = S.places.find((p) => p.id === S.current) || S.places[0];
  const d = place.color === 'blau' ? COLD : WARM;
  S.data = d;
  const tpl = activeTemplate();
  const m = tpl.modules;
  const a = d.alert;

  v.classList.toggle('main--cold', d.cold);
  v.innerHTML = `
    <div class="scroll" id="mainScroll">
      <div class="canvas" style="padding-top:331px;overflow:hidden">
        ${d.header}
        <button class="hdr-btn" data-home type="button" aria-label="Templates & Standorte" style="${box(d.badgeBox[0], d.badgeBox[1], 84, 47)}">${d.badge}</button>
        <p class="a t22 sb nowrap" style="left:102.5px;top:75px;color:${d.titleColor}">${place.name}</p>
        <button class="hdr-btn" data-edit type="button" aria-label="Module bearbeiten" style="${box(d.slidersBox[0], d.slidersBox[1], 47, 47)}">${d.sliders}</button>
        ${pic(a.bg, 21, 223, 362, 96)}
        <div class="a" style="${box(21, 223, 362, 96)}border:2px solid ${a.border};border-radius:45px;background:${a.fill};-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)"></div>
        ${txt(a.temp, 356, 246, 't40 sb rt nowrap', 'color:var(--dunkelgrau)')}
        ${a.icon}
        ${txt(`<span class="t16 sb">${a.title}</span><br><span class="t14">${a.sub}</span>`, a.left, 271, 'vc', `width:${a.width}px;line-height:normal`)}
        <div class="widgets">
          ${m.temp ? wTemp(d) : ''}
          ${m.karte ? wMap(tpl) : ''}
          ${m.kleidung ? wClothes(d) : ''}
          ${m.pollen ? wHasel(d) : ''}
          ${m.uv ? wUv(d) : ''}
          ${m.wind ? wWind(d) : ''}
          ${m.niederschlag ? wRain(d) : ''}
          ${m.wasserstand ? wWater(d) : ''}
          ${wDanger(d)}
          ${m.warnungen ? wWarn() : ''}
        </div>
      </div>
    </div>`;
  bindTimeline();
  // Statusleisten-Hintergrund erst einblenden, wenn die Illustration weggescrollt ist
  const sc = $('#mainScroll', v);
  sc.addEventListener('scroll', () => v.style.setProperty('--bar-bg', sc.scrollTop > 240 ? 1 : 0));
}

function setLayer(k) {
  S.layer = k;
  const map = $('#map', views.main);
  if (!map) return;
  const L = MAP_LAYERS[k];
  $$('.map__layer', map).forEach((el) => el.classList.toggle('is-on', el.dataset.layer === k));
  $$('[data-layer-btn]', map).forEach((b) => {
    const on = b.dataset.layerBtn === k;
    b.classList.toggle('is-on', on);
    b.querySelector('img').src = `${A}map/${MAP_LAYERS[b.dataset.layerBtn].icon}-${on ? 'light' : 'dark'}.svg`;
  });
  if (!map.classList.contains('map--small')) $('#mapTitle', map).textContent = L.title;
  const l = $('[data-legend-l]', map), r = $('[data-legend-r]', map);
  l.textContent = L.l[0]; l.style.left = L.l[1] + 'px';
  r.textContent = L.r[0]; r.style.left = L.r[1] + 'px';
}

// Zeitleiste: Ziehen verschiebt die Wetterlage über der Karte
function bindTimeline() {
  const bar = $('#mapTime', views.main);
  if (!bar) return;
  const layers = $('#mapLayers', views.main);
  const now = $('#mapNow', views.main);
  const fmt = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const [startH, startM] = S.data.times[0].split(':').map(Number);
  const startMin = startH * 60 + startM;
  const nowMin = 18 * 60 + 45;
  const endMin = 21 * 60;
  let dragging = false;

  const update = (clientX) => {
    const r = bar.getBoundingClientRect();
    const scale = r.width / 362;
    const x = (clientX - r.left) / scale;
    const f = Math.max(0, Math.min(1, (x - 94.5) / 172.5));
    const min = Math.round((startMin + f * (endMin - startMin)) / 5) * 5;
    now.textContent = fmt(min);
    layers.style.transform = `translate(${(min - nowMin) * 0.12}px, ${(min - nowMin) * -0.05}px)`;
  };
  bar.addEventListener('pointerdown', (e) => { dragging = true; bar.setPointerCapture(e.pointerId); update(e.clientX); });
  bar.addEventListener('pointermove', (e) => { if (dragging) update(e.clientX); });
  bar.addEventListener('pointerup', () => { dragging = false; });
  bar.addEventListener('pointercancel', () => { dragging = false; });
}

/* ---------- Render-Tabelle ---------- */

const RENDER = {
  welcome: renderWelcome,
  modules: renderModules,
  mapcfg: renderMapCfg,
  search: renderSearch,
  home: renderHome,
  main: renderMain,
};

/* ---------- Events ---------- */

document.addEventListener('click', (e) => {
  const t = (sel) => e.target.closest(sel);
  let el;

  // Template-Auswahl
  if ((el = t('[data-tpl]'))) return pickTemplate(el.dataset.tpl, el);

  // Modul-Auswahl
  if ((el = t('[data-tgl]'))) return setModule(el.dataset.tgl, !S.draft.modules[el.dataset.tgl]);
  if ((el = t('[data-cfg]'))) {
    const id = el.dataset.cfg;
    if (!S.draft.modules[id]) { toast(`${MODULE_NAMES[id]} zuerst aktivieren`); return; }
    if (id === 'karte') {
      S.mapDraft = clone(S.draft.map);
      el.classList.add('is-pressed');
      setTimeout(() => { el.classList.remove('is-pressed'); go('mapcfg', 'push'); }, 160);
    } else {
      toast(`Einstellungen für „${MODULE_NAMES[id]}" sind im Prototyp nicht ausgearbeitet`);
    }
    return;
  }

  // Karten-Konfiguration
  if ((el = t('[data-row]'))) return toggleMapRow(el.dataset.row, el);
  if ((el = t('[data-dot]'))) return animateTo(+el.dataset.dot);

  // Sheets schließen / übernehmen
  if ((el = t('[data-close]'))) {
    if (currentView === 'mapcfg') { S.mapDraft = null; return back('pop'); }
    if (currentView === 'modules') { S.draft = null; return back('down'); }
  }
  if ((el = t('[data-apply]'))) {
    el.classList.add('is-pressed');
    setTimeout(() => {
      el.classList.remove('is-pressed');
      if (currentView === 'mapcfg') { S.draft.map = S.mapDraft; S.mapDraft = null; back('pop'); }
      else applyModules();
    }, 160);
    return;
  }
  if ((el = t('[data-back]'))) return back(currentView === 'welcome' ? 'down' : 'pop');

  // Suche
  if ((el = t('[data-key]'))) return typeKey(el.dataset.key);
  if ((el = t('[data-add]'))) return addPlace(el.dataset.add, el);
  if ((el = t('[data-skip]'))) {
    const first = $('[data-add]', views.search);
    if (first) return first.click();
    S.stack = [];
    return go('home', 'push', { remember: false });
  }

  // Home
  if ((el = t('[data-fav]'))) {
    const p = S.places.find((x) => x.id === el.dataset.fav);
    p.fav = !p.fav;
    return renderHome();
  }
  if ((el = t('[data-open]'))) {
    S.current = el.dataset.open;
    return go('main', 'push');
  }
  if ((el = t('[data-pick-tpl]'))) {
    S.activeTpl = el.dataset.pickTpl;
    return renderHome();
  }
  if ((el = t('[data-new-tpl]'))) return go('welcome', 'up');
  if ((el = t('[data-add-place]'))) { S.searchBack = true; return go('search', 'push'); }
  if ((el = t('[data-nav]'))) {
    if (el.dataset.nav !== 'pin') toast('Dieser Bereich ist im Prototyp nicht ausgearbeitet');
    return;
  }

  // Wetter-Screen
  if ((el = t('[data-layer-btn]'))) return setLayer(el.dataset.layerBtn);
  if ((el = t('[data-home]'))) {
    if (S.stack[S.stack.length - 1] === 'home') return back('pop');
    S.stack = [];
    return go('home', 'pop', { remember: false });
  }
  if ((el = t('[data-edit]'))) {
    S.draft = clone(activeTemplate());
    S.modCtx = 'edit';
    return go('modules', 'up');
  }
  if ((el = t('[data-expand]'))) return toast('Die Vollbild-Karte ist im Prototyp nicht ausgearbeitet');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('[data-open]')) { e.target.click(); return; }
  if (currentView !== 'search') return;
  const input = $('#q', views.search);
  if (document.activeElement === input) {
    if (e.key === 'Enter') { e.preventDefault(); typeKey('ret'); }
    return;
  }
  if (e.key === 'Backspace') typeKey('del');
  else if (e.key === 'Enter') typeKey('ret');
  else if (/^[a-zäöüß ]$/i.test(e.key)) typeKey(e.key);
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'q') updateResults();
});

$('#restart').addEventListener('click', start);

/* ---------- Skalierung (Gerät im Rahmen / Vollbild auf dem Handy) ---------- */

const params = new URLSearchParams(location.search);
if (params.has('embed')) document.documentElement.classList.add('is-embed');
if (params.has('cursor')) document.documentElement.classList.add('has-cursors');

function fit() {
  const root = document.documentElement;
  const vw = innerWidth, vh = innerHeight;
  // frame=1 erzwingt den Geräterahmen auch in schmalen Fenstern (Einbettung im Portfolio)
  const full = (vw < 500 && params.get('frame') !== '1') || params.get('frame') === '0';
  root.classList.toggle('is-full', full);
  const device = $('#device'), slot = $('#slot');
  if (full) {
    const s = vw / 402;
    root.style.setProperty('--screen-h', `${Math.max(600, vh / s)}px`);
    device.style.transform = `scale(${s})`;
    slot.style.width = `${vw}px`;
    slot.style.height = `${vh}px`;
  } else {
    root.style.setProperty('--screen-h', '874px');
    const extra = params.has('embed') ? 16 : 70;
    const s = Math.min(1, (vh - extra) / 898, (vw - 32) / 426);
    device.style.transform = `scale(${s})`;
    slot.style.width = `${426 * s}px`;
    slot.style.height = `${898 * s}px`;
  }
}
addEventListener('resize', fit);
new ResizeObserver(fit).observe(document.documentElement);
fit();

/* ---------- Start ---------- */

function start() {
  S = freshState();
  currentView = null;
  $$('.view').forEach((v) => { v.className = v.className.replace(/\b(is-active|is-leaving|anim-[\w-]+)\b/g, '').trim(); });

  // ?screen=home|main springt mit Beispieldaten direkt in die App (z. B. fürs Portfolio)
  const jump = params.get('screen');
  if (jump === 'home' || jump === 'main') {
    const tpl = makeTemplate(TEMPLATES[1]);
    tpl.modules = Object.fromEntries(MODULES.map((m) => [m, true]));
    S.templates = [tpl];
    S.activeTpl = tpl.id;
    const add = (id, fav) => S.places.splice(S.places.length - 1, 0, { ...PLACES.find((p) => p.id === id), fav });
    add('kempten', true);
    add('nebelhorn', false);
    S.current = 'kempten';
    go(jump, 'fade', { remember: false });
    if (jump === 'main') S.stack = ['home'];
    return;
  }
  go('welcome', 'fade', { remember: false });
}

start();
