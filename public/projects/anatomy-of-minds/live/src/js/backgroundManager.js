/**
 * Background Manager
 * Verwaltet das Wechseln der Hintergrundbilder basierend auf Tier-Kombinationen und Kategorien
 */

import { getScreen, preloadScreens, screenExists } from './screens.js';

const SCREEN_FADE_MS = 250; // wie die Animation screen-in in styles.css

export class BackgroundManager {
    constructor() {
        this.container = document.getElementById('background-container');
        this.currentBackground = null;
        this._introLock = null; // prevent navigation while intro sequence is playing
        this._setBackgroundLock = false; // prevent concurrent setBackground calls
        this.onBackgroundChange = null; // Callback für Background-Änderungen
        preloadScreens();
    }

    /**
     * Setzt den Hintergrund basierend auf Kontext
     * @param {Object} context - { animals: ['ameise', 'mensch'], category: 'intelligence' }
     */
    setBackground(context) {
        const { animals = [], category = null } = context;
        
        // Don't change background if intro is currently playing
        if (this._introLock) {
            console.debug('[setBackground] blocked by intro lock:', this._introLock);
            return;
        }
        
        // If a category is active, prefer numbered sequence files (_1,_2,_3)
        // and only load the first existing one to avoid 404s for non-existing base files.
        if (category) {
            // Build baseName BEFORE async to check if we should stay on current slide
            const nameMap = {
                'ameise': 'ant',
                'mensch': 'human',
                'elefant': 'elephant',
                'vogel': 'bird'
            };
            const mappedAnimals = animals.map(a => nameMap[a] || a);
            
            let baseName = '';
            if (mappedAnimals.length === 1) {
                baseName = `${mappedAnimals[0]}_${category}`;
            } else if (mappedAnimals.length === 2) {
                const sorted = [...mappedAnimals].sort();
                baseName = `${sorted[0]}_${sorted[1]}_${category}`;
            }

            // CRITICAL FIX: Check if we're already on a slide from this sequence BEFORE starting async
            // This prevents race conditions that cause unwanted resets from _2 back to _1
            if (this.currentBackground && baseName) {
                const currentIsSequenceSlide = this.currentBackground.startsWith(baseName + '_');
                const isIntroSlide = this.currentBackground.includes('_intro.png');
                if (currentIsSequenceSlide && !isIntroSlide) {
                    console.log('[setBackground] ✅ KEEPING current slide:', this.currentBackground, '(no reset)');
                    return; // Don't reload - stay on current slide (_1 or _2)
                }
            }

            // Prevent concurrent setBackground operations (race condition protection)
            if (this._setBackgroundLock) {
                console.debug('[setBackground] blocked by concurrent operation lock');
                return;
            }

            this._setBackgroundLock = true;
            (async () => {
                try {
                    const makeCandidates = (baseName) => {
                        return [
                            `${baseName}_1.png`,
                            `${baseName}_2.png`,
                            `${baseName}.png`
                        ];
                    };

                    let candidates = [];
                    if (mappedAnimals.length === 1) {
                        candidates = makeCandidates(baseName);
                    } else if (mappedAnimals.length === 2) {
                        candidates = makeCandidates(baseName);
                    } else {
                        candidates = [`category_${category}.png`];
                    }


                    let chosen = null;
                    for (const c of candidates) {
                        if (screenExists(c)) { chosen = c; break; }
                    }
                    if (!chosen) chosen = 'intro-background.png';

                    if (chosen !== this.currentBackground) {
                        this.loadBackground(chosen);
                        this.currentBackground = chosen;
                    }
                } finally {
                    this._setBackgroundLock = false;
                }
            })();
            return;
        }

        // Fallback: no category -> use normal determineBackground logic
        const backgroundFile = this.determineBackground(animals, category);
        if (backgroundFile !== this.currentBackground) {
            this.loadBackground(backgroundFile);
            this.currentBackground = backgroundFile;
        }
    }

    /**
     * Bestimmt welche Background-Datei geladen werden soll
     * Angepasst an vorhandene Naming-Konvention:
     * - ant statt ameise
     * - human statt mensch
     * - ant_human statt compare_ameise_mensch
     */
    determineBackground(animals, category) {
        // Konvertiere deutsche Namen zu englischen (für existierende PNGs)
        const nameMap = {
            'ameise': 'ant',
            'mensch': 'human',
            'elefant': 'elephant',
            'vogel': 'bird'
        };
        
        const mappedAnimals = animals.map(a => nameMap[a] || a);

        // Standard-Background
        if (mappedAnimals.length === 0 && !category) {
            return 'intro-background.png';
        }

        // Kategorie-spezifischer Background
        if (category) {
            // Wenn ein Tier + Kategorie
            if (mappedAnimals.length === 1) {
                return `${mappedAnimals[0]}_${category}.png`;
            }
            // Zwei Tiere + Kategorie (z.B. ant_human_emotion.png)
            if (mappedAnimals.length === 2) {
                const sorted = [...mappedAnimals].sort();
                return `${sorted[0]}_${sorted[1]}_${category}.png`;
            }
            // Nur Kategorie
            return `category_${category}.png`;
        }

        // Vergleichs-Modus (2 Tiere auf Punkt 1-2)
        if (mappedAnimals.length === 2) {
            const sorted = [...mappedAnimals].sort();
            return `${sorted[0]}_${sorted[1]}.png`;
        }

        // Ein Tier alleine
        if (mappedAnimals.length === 1) {
            const animal = mappedAnimals[0];
            return `${animal}_general.png`;
        }

        return 'intro-background.png';
    }

    /**
     * Zeigt einen Screen, sobald er fertig dekodiert ist (so entsteht beim Wechsel keine Lücke)
     */
    loadBackground(filename) {
        const img = getScreen(filename);
        if (!img) {
            console.warn(`Background nicht gefunden: ${filename}`);
            return;
        }
        // set currentBackground immediately so navigation logic sees the intended slide
        const prevBackground = this.currentBackground;
        this.currentBackground = filename;

        img.decode().then(() => {
            if (this.currentBackground !== filename) return; // inzwischen wurde ein anderer Screen gewählt
            this.showScreen(img);
            console.log(`Background geladen: ${filename}`);
            if (this.onBackgroundChange) {
                try {
                    this.onBackgroundChange(filename);
                } catch (e) {
                    console.warn('onBackgroundChange callback error', e);
                }
            }
        }).catch(() => {
            console.warn(`Background nicht ladbar: ${filename}`);
            if (this.currentBackground === filename) this.currentBackground = prevBackground;
        });
    }

    /**
     * Neuer Screen legt sich über den alten und blendet ein; der alte verschwindet erst danach
     */
    showScreen(img) {
        if (this.container.lastElementChild === img) return;
        this.container.append(img);
        clearTimeout(this._cleanup);
        this._cleanup = setTimeout(() => {
            while (this.container.children.length > 1) this.container.firstElementChild.remove();
        }, SCREEN_FADE_MS);
    }

    /**
     * Play an intro image (if present) for 3 seconds then load a sequence for the
     * given animal(s) and category. `animals` may be an array of animal ids.
     */
    async playIntroSequence(animals, category) {
        const nameMap = {
            'ameise': 'ant',
            'mensch': 'human',
            'elefant': 'elephant',
            'vogel': 'bird'
        };

        if (!animals || animals.length === 0 || !category) return;

        // Map all animals to English names and create compound name
        const mappedAnimals = animals.map(a => nameMap[a] || a);
        const animalKey = mappedAnimals.length === 2 && mappedAnimals.includes('ant') && mappedAnimals.includes('human')
            ? 'ant_human'
            : mappedAnimals[0];

        const introFile = `${animalKey}_${category}_intro.png`;
        const seq1 = `${animalKey}_${category}_1.png`;
        const seq2 = `${animalKey}_${category}_2.png`;
        const base = `${animalKey}_${category}.png`;

        const key = `${animalKey}_${category}`;
        // set intro lock so navigation (rotate) won't immediately change slides
        this._introLock = key;
        console.debug('[playIntroSequence] starting intro lock for', key, 'with animals:', animals);


        try {
            if (screenExists(introFile)) {
                console.debug('[playIntroSequence] intro exists:', introFile);
                this.loadBackground(introFile);
                // wait for intro duration
                await new Promise(r => setTimeout(r, 2000));
            } else {
                console.debug('[playIntroSequence] intro missing:', introFile);
                // If no intro exists, load _1 directly
                if (screenExists(seq1)) {
                    console.debug('[playIntroSequence] no intro, loading seq1:', seq1);
                    this.loadBackground(seq1);
                }
            }

            // Release lock after intro
            this._introLock = null;
            console.debug('[playIntroSequence] intro lock released for', key);
            
            // Web: nach dem Intro automatisch Seite _1 (Ausstellung: Intro blieb bis zur Drehung).
            // Nur wenn noch dieses Intro zu sehen ist, die Figur also nicht inzwischen woanders steht.
            if (this.currentBackground === introFile && screenExists(seq1)) this.loadBackground(seq1);
        } catch (e) {
            console.warn('playIntroSequence failed', e);
            this._introLock = null;
        }
    }

    /**
     * Navigate the sequence of backgrounds for a given animal(s)+category.
     * direction: 1 -> next (clockwise), -1 -> previous (counter-clockwise)
     * Cycles through all available slides: _intro, _1, _2, _3, base (wraps around)
     * @param {Array|string} animals - Array of animal ids or single animal string
     * @param {boolean} forceSlide - if true, direction is treated as absolute slide number
     */
    async navigateSequence(animals, category, direction = 1, forceSlide = false) {
        const nameMap = {
            'ameise': 'ant',
            'mensch': 'human',
            'elefant': 'elephant',
            'vogel': 'bird'
        };
        
        // Handle both single animal string and array of animals
        const animalArray = Array.isArray(animals) ? animals : [animals];
        if (animalArray.length === 0 || !category) return;
        
        // Map all animals to English names and create compound name
        const mappedAnimals = animalArray.map(a => nameMap[a] || a);
        const animalKey = mappedAnimals.length === 2 && mappedAnimals.includes('ant') && mappedAnimals.includes('human')
            ? 'ant_human'
            : mappedAnimals[0];
        
        const key = `${animalKey}_${category}`;
        if (this._introLock === key) {
            console.debug('[navigateSequence] blocked by introLock for', key);
            return;
        }

        // Rotation slides: numbered states only (_1, _2). Wrap circularly.
        const allSlides = [
            `${animalKey}_${category}_1.png`,
            `${animalKey}_${category}_2.png`
        ];


        try {
            // Build list of actually existing numbered slides
            const availableSlides = [];
            for (const slide of allSlides) {
                if (screenExists(slide)) availableSlides.push(slide);
            }

            if (availableSlides.length === 0) return; // nothing available

            // Debug: list available slides
            console.debug('[navigateSequence] availableSlides:', availableSlides, 'currentBackground:', this.currentBackground, 'direction:', direction, 'forceSlide:', forceSlide);

            // If forceSlide is true, direction is treated as absolute slide number (e.g., 1 for _1)
            if (forceSlide) {
                const targetSlide = `${animalKey}_${category}_${direction}.png`;
                if (availableSlides.includes(targetSlide)) {
                    console.debug('[navigateSequence] forcing slide:', targetSlide);
                    this.loadBackground(targetSlide);
                } else {
                    console.warn('[navigateSequence] forced slide not found:', targetSlide);
                }
                return;
            }

            // Normal navigation: Determine current index and calculate next
            let currentIndex = availableSlides.indexOf(this.currentBackground);
            if (currentIndex === -1) currentIndex = 0;

            // Calculate next index with wrapping (circular)
            const nextIndex = (currentIndex + direction + availableSlides.length) % availableSlides.length;
            console.debug('[navigateSequence] currentIndex:', currentIndex, 'nextIndex:', nextIndex, 'target:', availableSlides[nextIndex]);
            this.loadBackground(availableSlides[nextIndex]);
        } catch (e) {
            console.warn('navigateSequence failed', e);
        }
    }

    /**
     * Reset zum Standard-Background
     */
    reset() {
        this.setBackground({ animals: [], category: null });
    }
}
