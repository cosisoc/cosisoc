import { ui } from './ui';

export type Lang = keyof typeof ui;
export const langs: Lang[] = ['de', 'en'];

export const routes = {
  home: { de: '/', en: '/en/' },
  project: { de: '/projekte/', en: '/en/projects/' },
  imprint: { de: '/impressum/', en: '/en/imprint/' },
  privacy: { de: '/datenschutz/', en: '/en/privacy/' },
} as const;

export function useT(lang: Lang) {
  return (key: keyof (typeof ui)['de']) => ui[lang][key];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'de' ? 'en' : 'de';
}

export function projectUrl(lang: Lang, slug: string) {
  return `${routes.project[lang]}${slug}/`;
}
