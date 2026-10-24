// Grüner Tab in der Navigation: gleitet zu dem Abschnitt, der gerade die Bildschirmmitte kreuzt.
const nav = document.querySelector('[data-nav]');
const tab = nav?.querySelector('.nav-tab');
const items = nav ? [...nav.querySelectorAll('[data-nav-target]')] : [];
const sections = [...document.querySelectorAll('[data-nav-section]')];
let current = null;

function move(item) {
  current = item;
  for (const i of items) i.classList.toggle('is-active', i === item);
  if (!item) { tab.style.opacity = '0'; return; }
  tab.style.width = `${item.offsetWidth}px`;
  tab.style.transform = `translateX(${item.getBoundingClientRect().left - nav.getBoundingClientRect().left}px)`;
  tab.style.opacity = '1';
}

if (nav && sections.length) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) move(items.find((i) => i.dataset.navTarget === entry.target.dataset.navSection));
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  sections.forEach((s) => observer.observe(s));

  // Breiten ändern sich, wenn Schriften laden oder das Fenster sich ändert
  const realign = () => move(current);
  addEventListener('resize', realign);
  document.fonts.ready.then(realign);
  requestAnimationFrame(() => nav.classList.add('is-ready'));
}
