# Portfolio-Konzept

Oct 23, 2026 · @Cosima Bühler

## Ziel & Rahmen

Das Portfolio soll mir einen Platz für das Pflichtpraktikum im Praxissemester (nächstes Semester) in einem Studio sichern.

| Punkt | Entscheidung |
| --- | --- |
| Zweck | Bewerbung Pflichtpraktikum / Praxissemester |
| Zielgruppe | Design-Studios |
| Wunschbereiche | UX/UI & Product Design, Invention Design, Interface Design, Speculative / Social Design |
| Gerät | Zuerst Laptop/Desktop, Mobile folgt später (muss funktionieren) |
| Sprache | Deutsch + Englisch (umschaltbar) |
| Modus | Erstmal nur Light Mode |
| Lebenslauf | Wird separat mit der Bewerbung geschickt, nicht auf der Seite |

Daraus folgt: Studios sichten schnell. Die Seite muss in ca. 30 Sekunden zeigen, wer ich bin, was ich kann und wo die Projekte sind, und dabei einen Moment bieten, an den man sich erinnert.

## Positionierung & roter Faden

Rolle: Interaction Design Studentin an der HfG Schwäbisch Gmünd. Der Claim darunter sagt, *welche Art* Interaction Designerin ich bin.

**Roter Faden:** Drei von vier Main Projects sind Tangible Interfaces, also physische Objekte, die digitale Systeme steuern. WarnWetter ergänzt das um klassisches Screen-UX/UI.

- Konekt: ein Stein auf Randpunkten steuert das Display
- Cluttr: ein physischer Controller steuert einen Roboter
- Anatomy of Minds: NFC-Figuren auf Sensorpunkten steuern eine Projektion
- WarnWetter: App-Redesign, Research bis Design System

**Was mich antreibt (Rohmaterial für Claim und About):** Neues lernen, Konzeption, Lösungen für Probleme finden, neue KI-Tools ausprobieren, Interaktionen analog und digital möglichst nutzerfreundlich gestalten.

**Claim-Entwürfe (noch offen, erstmal Platzhalter):**

1. „Ich gestalte Interfaces, die man anfassen kann, und Screens, die man sofort versteht.“
2. „Interaction Design zwischen Bildschirm und Hand.“
3. „Ich bringe Digitales in die Hand.“

Den KI-Text („verbinde User Research, visuelle Gestaltung, Interaktionslogik…“) nicht verwenden. Er ist zu generisch und klingt nach KI, und genau das soll die Seite nicht.

## Look & Feel

Professionell, aber nicht langweilig: klare Struktur plus wenige, kluge Interaktionen, die Lust aufs Ausprobieren machen und nicht nerven.

**Do**

- Schnell auffindbare Projekte, klare Navigation
- Zwei bis drei gezielte Signature-Interaktionen statt Effekte überall
- Ein Eyecatcher, der die Seite besonders macht

**Don't**

- Effekte, die schlecht umgesetzt sind oder billig aussehen
- Schlechte Navigation bzw. Orientierungslosigkeit
- Langweilig, in der Masse untergehen, keine eigene Idee
- Generischer „KI-generierter“ Look

**Referenzen**

| Seite | Was ich mitnehme | Was ich nicht will |
| --- | --- | --- |
| [johannes-biess.com](https://johannes-biess.com/) | Hohe Qualität, eigenständiger Charakter | Navigation als zoombarer Raum |
| [adilshaik.xyz](https://www.adilshaik.xyz/) | Struktur: Claim, nummerierte Case Studies mit Tags/Stats, „Side quests“ | Kann zu brav wirken |

Formel: Struktur wie Shaik + gezielte Signature-Interaktionen.

**Visuelle Basis**

- Farbe: Grün als Hauptfarbe (genauer Ton noch offen), Light Mode
- Schrift: muss noch ausprobiert werden
- Logo: noch offen, die Richtung „handgezeichnet“ gefällt mir. Es erscheint auch in der Ladeanimation.

## Seitenstruktur

&#91;embedded content: Seitenstruktur · 6 Abschnitte, 2 Ebenen\]

Alles liegt auf einer Seite. Projekte öffnen sich als Ebene darüber, dadurch bleibt die Scrollposition erhalten und man verliert nie die Orientierung.

## Abschnitte im Detail

### Ladeanimation

- Kurz und simpel, unter 1 Sekunde, nur beim ersten Besuch
- Zeigt das (handgezeichnete) Logo
- Wertet auf, darf nicht nerven

### Navigation

- Feste Leiste oben: Logo/Name, Main Projects, Side Projects, About, Sprachumschalter DE/EN
- Klick springt per Anker zum Abschnitt (weiches Scrollen)

### Landing

Die Landing ist eine Visitenkarte: Foto, wer ich bin und was mich interessiert.

- Foto von mir in 3 leicht unterschiedlichen Perspektiven. Bewegt man die Maus, wechselt die Perspektive, und es entsteht ein leichter 3D-Effekt. Subtil, nicht aufdringlich.
- Name + Rolle (Interaction Design Studentin, HfG) + Claim (Platzhalter)
- Kurz meine Interessen bzw. Themen
- Shooting-Tipp: exakt gleiches Licht und gleicher Hintergrund; 5 statt 3 Perspektiven machen den Effekt flüssiger.

### Main Projects: Akkordeon-Streifen

- 4 Projekte nebeneinander als Streifen auf einem Screen, damit man kaum scrollen muss
- Hover: Der Streifen fährt breit auf, die anderen werden schmal
- Aufgeklappt zeigt der Streifen: Bild/Video, Titel, Kurzbeschreibung, Stats (wann, wie lange) und Tags (meine Bereiche + Einordnung)
- Zugeklappt: Nummer + vertikaler Titel
- Klick öffnet das Projektdetail (siehe unten)
- Bewusster Kontrast zu den Side Projects: ruhig, geordnet, wertig

### Side Projects: Kartenstapel

- 3–4 Projekte: Datenvisualisierung, Application-Projekt (falls nicht Main), Zeichnungen, evtl. kleines Game
- Die Karten liegen als Stapel und werden beim Scrollen auseinandergeschoben
- Lockerer als die Main Projects, gewollter Kontrast
- Jede Karte hat eine kurze Beschreibung und lässt sich ausklappen bzw. öffnet eine eigene Ansicht
- Die Datenvisualisierung soll man direkt ausprobieren können

### About

- Skills + Tools
- Kontakt: Mail (Social Links optional)
- Kein Foto (ist schon auf der Landing), kein CV (geht separat mit)

## Projektdetail (Case-Study-Template)

Das Projektdetail ist ein Panel, das von rechts hereinfährt (Overlay) und vertikal gescrollt wird. Es ist kurz und visuell, die Tiefe steckt in ausklappbaren Kapiteln.

**Verhalten**

- Eigene URL pro Projekt, damit man es verlinken kann und der Browser-Zurück-Button funktioniert
- Schließen/Zurück ist immer sichtbar, ESC schließt
- Am Ende: „Nächstes Projekt“
- Ausklappbare Kapitel: Ein Bild + ein Satz bleiben immer sichtbar, nur die Details klappen ein (sonst wirkt es wie ein FAQ)
- 3D-Modelle sind möglich: erst beim Klick laden (vorher Standbild), komprimiert, max. eines pro Projekt

**Kopfbereich (immer gleich)**

- Titel + Kurzbeschreibung
- Schnellübersicht: Meine Rolle · Team · Dauer · Semester/Kurs · Tools · Tags
- Hero-Medium: Rendering, Foto oder Video des Endprodukts

**Kapitel (pro Projekt die passenden auswählen)**

1. Intro / Projektrahmen / Aufgabe
2. Übersicht: Worum ging es, was war das Ziel?
3. Research / Einordnung (optional)
4. Konzeption
5. Interaktionskonzept
6. UI/UX / Screendesign
7. Systemarchitektur (optional, z. B. Konekt)
8. Prototyping / Testing
9. Technische Umsetzung
10. Ergebnis / Impact
11. Meine Rolle (ausführlich)

## Projekte: Inhalte und Platzhalter

Vier Main Projects, drei bis vier Side Projects. Texte zu Konekt, Cluttr, Anatomy of Minds und WarnWetter liegen schon vor. Die Angaben unten sind Platzhalter und werden später ergänzt.

### Main Projects

| # | Projekt | Kurz | Typ | Material vorhanden |
| --- | --- | --- | --- | --- |
| 01 | Konekt | Gerät mit Stein-Interface, das Rentner:innen soziale Kontakte erleichtert, inkl. KI-Begleiter Kaius | Tangible + UI + KI | Screens, Interaktionsprinzip, Video Funktionsprototyp, Designprototyp |
| 02 | Cluttr | Controller, mit dem Kinder spielerisch einen Aufräumroboter steuern | Tangible / Hardware | Formvarianten, Bauteile, finales Konzept, Usertests |
| 03 | Anatomy of Minds | Interaktiver Tisch mit NFC-Figuren vergleicht Gehirne von Mensch und Ameise | Tangible + Projektion | Projektvideo, Illustrationen |
| 04 | WarnWetter | Redesign der DWD-App: personalisierte Templates, klare Farbcodierung | Screen UX/UI | Alte App, Persona, Value Proposition, IA, Design System, Userflow-Video |

Reihenfolge ist noch offen (Vorschlag: stärkstes Projekt zuerst). Material muss teilweise noch überarbeitet werden.

### Platzhalter-Checkliste (pro Main Project später ausfüllen)

- [ ] Teamgröße + was ich konkret gemacht habe
- [ ] Dauer + Semester/Kurs
- [ ] Schwierigste Entscheidung / größtes Problem + Lösung
- [ ] Was ich gelernt habe
- [ ] Das eine Vorschaubild/-video für den Akkordeon-Streifen

**Projektspezifisch**

- [ ] Konekt: Tests mit echten Rentner:innen? Kursname? Mein Anteil Raspberry Pi vs. Design?
- [ ] Cluttr: Foto/Video vom fertigen Controller bzw. vom Test mit der 5. Klasse?
- [ ] Anatomy of Minds: Mein Part (Illustration, Code, Hardware, Konzept)?
- [ ] WarnWetter: Gruppenprojekt? Klickbarer Figma-Prototyp zum Einbetten?

### Side Projects

| Projekt | Status | Darstellung |
| --- | --- | --- |
| Application-Projekt | = WarnWetter. Empfehlung: Main; nur hier, falls es doch Side wird | Karte, ausklappbar |
| Datenvisualisierung (2-Wochen-Projekt) | Vorhanden | Karte, live ausprobierbar |
| Zeichnungen | Vorhanden | Karte / kleine Galerie |
| Kleines Game | Geplant | Karte, evtl. spielbar |

- [ ] Datenvisualisierung: Thema? Läuft sie schon im Browser?
- [ ] Game: Was für ein Spiel?
- [ ] Zeichnungen: Skizzen, Illustrationen oder freie Arbeiten?

## Interaktion & Motion

Bewegung entsteht vor allem beim Scrollen. Jede Animation muss etwas erklären oder Lust machen, nie nur dekorieren.

**Signature-Momente (max. 3)**

1. Landing: Foto mit Perspektivwechsel per Maus
2. Main Projects: Akkordeon-Streifen
3. Side Projects: Kartenstapel, der beim Scrollen auffächert

**Eyecatcher-Idee (optional):** Eine Interaktion, die das Stein-/Token-Prinzip meiner Projekte zitiert. Man zieht zum Beispiel ein Objekt auf einen Punkt, um etwas zu öffnen. So wird mein Kernthema „zwischen Bildschirm und Hand“ direkt erlebbar. Muss dezent bleiben und darf die Navigation nie ersetzen.

**Regeln**

- Animationen kurz (ca. 200–500 ms), weich, unterbrechbar
- Nichts blockiert das Lesen oder Navigieren
- „Reduzierte Bewegung“ im Betriebssystem respektieren
- Videos in Vorschauen: Autoplay ohne Ton, in Schleife
- Mobile später: Hover wird zu Tippen/Wischen, das Akkordeon wird zu einer vertikalen Liste

## Technik & Workflow

Design in Figma, Umsetzung per Vibecoding mit Claude Code in VS Code.

**Vorgeschlagene Reihenfolge**

1. Grundlagen in Figma: Grünton, Schrift, Raster, Logo-Skizzen
2. Wireframes für Landing, Main Projects (Akkordeon), Side Projects (Stapel), Projektdetail
3. Claude Code: Gerüst des One-Pagers mit Navigation und Platzhaltertexten
4. Signature-Interaktionen einzeln bauen und testen: Akkordeon → Stapel → Foto-Effekt → Ladeanimation
5. Ein Projektdetail komplett füllen (Template testen), dann die anderen
6. Inhalte und Texte final, Englisch-Version
7. Mobile anpassen
8. Testen: Ladezeit, Browser, Freund:innen klicken lassen

**Tipp für Claude Code:** Dieses Doc lässt sich als Markdown exportieren und als Briefing in den Projektordner legen, damit Claude Code die Entscheidungen kennt.

**Technische Hinweise**

- Projekte als Daten (z. B. eine JSON-Datei pro Projekt), damit Main/Side und die Reihenfolge leicht änderbar sind
- Bilder komprimiert (WebP/AVIF), Videos kurz und stumm für Vorschauen
- 3D-Modelle als komprimierte .glb, erst beim Klick laden
- Mehrsprachigkeit DE/EN von Anfang an mitdenken

## Offene Punkte

Diese Entscheidungen sind noch offen. Die Projekt-Platzhalter stehen oben im Projekte-Abschnitt.

- [ ] Claim festlegen (Entwürfe siehe Positionierung)
- [ ] Passt der rote Faden „Tangible Interfaces / zwischen Bildschirm und Hand“, oder ist er zu eng?
- [ ] Grünton festlegen
- [ ] Schriften ausprobieren (clean-grotesk, technisch-mono oder mit Charakter)
- [ ] Logo entwerfen (Richtung handgezeichnet)
- [ ] Eyecatcher: Kernthema erlebbar machen oder eigenständiger Moment?
- [ ] Reihenfolge der Main Projects
- [ ] Fotoshooting für den Perspektiv-Effekt (3–5 Perspektiven)
- [ ] About: etwas Persönliches zeigen (Hobbys, Weg zum Interaction Design)?
- [ ] Projektmaterial überarbeiten (Renderings, Videos)
