import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Ein Projekt = ein Ordner mit de.mdx + en.mdx (z. B. projects/konekt/de.mdx).
// Bilder liegen im selben Ordner (./hero.jpg), Videos und 3D-Modelle in public/projects/<slug>/.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) => {
    // label = Alt-Text bzw. Platzhalter-Beschriftung, solange keine Datei gesetzt ist
    const media = z.object({
      label: z.string(),
      image: image().optional(),
      video: z.string().optional(),
      poster: image().optional(),
      controls: z.boolean().optional(), // Video mit Steuerung: Ton anschalten, spulen
    });
    return z.object({
      title: z.string(),
      short: z.string(),
      kind: z.enum(['main', 'side']),
      order: z.number(),
      role: z.string(),
      team: z.string(),
      duration: z.string(),
      semester: z.string(),
      tools: z.array(z.string()),
      tags: z.array(z.string()),
      preview: media,
      hero: media,
      model: z.object({ src: z.string(), label: z.string() }).optional(),
    });
  },
});

export const collections = { projects };
