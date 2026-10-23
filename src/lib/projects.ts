import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';

export type Project = CollectionEntry<'projects'> & { slug: string };
export type Media = Project['data']['hero'];

// Alle Projekte einer Sprache: erst Main, dann Side, jeweils nach `order`.
export async function getProjects(lang: Lang): Promise<Project[]> {
  const entries = await getCollection('projects', (e) => e.id.endsWith(`/${lang}`));
  return entries
    .map((e) => ({ ...e, slug: e.id.split('/')[0] }))
    .sort((a, b) =>
      a.data.kind === b.data.kind
        ? a.data.order - b.data.order
        : a.data.kind === 'main' ? -1 : 1,
    );
}

export function projectNumber(p: Project) {
  return String(p.data.order).padStart(2, '0');
}
