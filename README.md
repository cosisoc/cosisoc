# Portfolio – Cosima Bühler

Persönliche Portfolio-Webseite, gebaut mit [Astro](https://astro.build) (MDX, Deutsch/Englisch) und three.js.
Design-Vorlage: Figma-Datei „portfolio-design“ (Projektseiten auf dem 12-Spalten-Raster).

## Schnellstart

```bash
npm install
npm run dev       # Entwicklung: http://localhost:4321
npm run build     # fertige Seite nach dist/
npm run preview   # dist/ lokal ansehen
```

**Wichtig:** Werden neue Dateien angelegt (Komponenten, Bilder), danach den Dev-Server neu starten
(`Ctrl+C`, `npm run dev`). Sonst merkt er sich „Datei nicht gefunden“ und zeigt Fehler wie
`Failed to load url` oder `ImageNotFound`, obwohl die Datei da ist.

## Aufbau

```
src/
  content/projects/<slug>/   ein Projekt = de.mdx + en.mdx + Bilder
  components/                Bausteine (siehe unten)
  scripts/                   Browser-Skripte (Karussell, Cursor, Panels, Bob-Viewer …)
  scripts/bob/               3D-Viewer für Bob the Blob (three.js)
  styles/                    tokens.css (Farben, Abstände), global.css, panel.css …
  i18n/                      Oberflächentexte (ui.ts) und Seitentexte (copy.ts)
  pages/                     Routen; Deutsch ist Standard, Englisch unter /en/
public/projects/<slug>/      Videos, 3D-Modelle, Live-Demos (werden nicht von Astro verarbeitet)
content/                     Rohmaterial (Original-Fotos, Blender-Dateien), nicht Teil der Seite
docs/Portfolio-Konzept.md    Konzept und Layout-Entscheidungen
```

Regel für den Code: keine Code-Datei über 200 Zeilen (siehe `CLAUDE.md`).

## Neues Projekt anlegen

1. Ordner `src/content/projects/<slug>/` mit `de.mdx` und `en.mdx` anlegen (am besten ein bestehendes Projekt kopieren).
2. Kopfdaten ausfüllen: `title`, `short`, `kind` (`main` = Hauptprojekt, `side` = Nebenprojekt), `order`,
   `role`, `team`, `duration`, `semester`, `tools`, `tags`, `preview` (Karte in der Übersicht), `hero` (Bild oben).
   `preview`/`hero` nehmen `label` (Alt-Text) plus `image: ./bild.jpg` **oder** `video: "/projects/<slug>/film.mp4"`
   mit optionalem `poster` und `controls: true` (Bedienleiste und Ton).
3. Bilder neben die MDX-Dateien legen (Astro verkleinert sie selbst), Videos nach `public/projects/<slug>/`.
4. Kapitel mit `<Chapter>` schreiben (wird automatisch nummeriert).

## Bausteine für die MDX-Dateien

| Komponente | Wofür | Beispiel |
|---|---|---|
| `Chapter` | Kapitel: Nummer + Titel links, Kernsatz rechts, darunter Text und Bild im Wechsel | `<Chapter title="Prozess" teaser="…" image={bild} label="Alt-Text">Text</Chapter>` |
| `Chapter wide` | Text oben, Medium über die volle Breite (Video, Karussell, Demo) | `<Chapter title="Film" teaser="…" video="/projects/x/film.mp4" label="…" controls wide>` |
| `Carousel` | Bildreihe zum Wischen, läuft von allein weiter | `<Carousel slot="media" images={[{ image: a, label: 'Skizzen' }]} />` |
| `LiveEmbed` | Live-Demo als iframe; mit `button` erst nach Klick laden | `<LiveEmbed slot="media" src="/projects/x/index.html" width={1280} height={720} label="…" hint="…" button="Spiel starten" />` |
| `Prototype` | Figma-Klickdummy, lädt erst nach Klick | `<Prototype slot="media" url="https://www.figma.com/proto/…" label="…" button="Prototyp starten" />` |
| `BobViewer` | Bob the Blob als 3D-Figur (Hero mit Bühne oder Kapitel mit Emotionen) | siehe `game/de.mdx` |
| `Model3D` | 3D-Modell (`model-viewer`) | Kopfdaten `model: { src, label }` |
| `Gallery` | einfache Bildreihe | siehe bestehende Projekte |

Bilder, die nicht beschnitten werden sollen: `fit="contain"` an `Chapter`.

## Videos vorbereiten (ffmpeg)

Aus dem Portfolio-Ordner ausführen (Terminal braucht unter macOS Zugriff auf den Schreibtisch-Ordner):

```bash
# Film fürs Web (ohne Ton, 1080p)
ffmpeg -i input.mov -vf scale=1920:-2 -c:v libx264 -crf 23 -preset slow -an -movflags +faststart public/projects/<slug>/film.mp4

# Mit Ton (für controls)
ffmpeg -i input.mov -vf scale=1920:-2 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart public/projects/<slug>/film.mp4

# Kurze Vorschau-Schleife für die Projektkarte (~10 s, 640 px, wenige 100 KB)
ffmpeg -ss 30 -t 10 -i film.mp4 -vf scale=640:-2 -an -c:v libx264 -crf 28 -movflags +faststart public/projects/<slug>/preview.mp4

# Poster-Bild aus dem Video
ffmpeg -ss 5 -i film.mp4 -frames:v 1 -vf scale=640:-2 src/content/projects/<slug>/preview-poster.jpg
```

## The Colors We Feel (Unity-Spiel)

- Spielbare Web-Version liegt in `public/projects/game/webgl/` und lädt erst nach Klick auf „Spiel starten“.
- Neu bauen im Unity-Projekt (`laborwoche/BobtheBlob`): **Tools → Build → 2) WebGL bauen**, danach den Build-Ordner
  nach `public/projects/game/webgl/` kopieren. Die Seite dafür kommt aus `Assets/WebGLTemplates/BobPortfolio/index.html`.
- Esc im Browser gibt nur die Maus frei; die Seite meldet das dem Spiel (`pointerlockchange` → `PauseMenu.OnPointerLockLost`),
  das dann sofort pausiert.
- Bob als 3D-Modell: `public/projects/game/bob.glb` und `stage.glb`, exportiert aus
  `content/bobtheblob/viewer/Bob_Portfolio.blend` (siehe `LIESMICH.md` dort).
