import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  // TODO: durch die eigene Domain ersetzen, sobald sie feststeht
  site: 'https://example.com',
  integrations: [mdx()],
  // model-viewer (3D) ist ~1 MB, wird aber erst geladen, wenn die Projektseite aufgeht
  vite: { build: { chunkSizeWarningLimit: 1100 } },
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
