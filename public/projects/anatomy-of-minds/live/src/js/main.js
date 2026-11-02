/**
 * Main Application
 * Verbindet alle Module und koordiniert die Logik
 */

import { BackgroundManager } from './backgroundManager.js';
import { PlacementManager } from './placementManager.js';
import { UIController } from './uiController.js';
import { tangibleInterface } from './tangibleInterface.js';
import { FigureDrag } from './figureDrag.js';

class App {
    constructor() {
        this.backgroundManager = new BackgroundManager();
        this.placementManager = new PlacementManager();
        this.uiController = new UIController();
        // Web-Version: Figuren werden mit der Maus gezogen und gedreht (statt Arduino)
        this.figureDrag = new FigureDrag(tangibleInterface);
        this.playedIntros = new Set(); // remember which animal_category intros were already played
        this.inactivityTimer = null; // timer id for 5s inactivity on category points
        this.lastActivityAt = 0;
        this.lastActiveFigure = null; // 'ameise' | 'mensch' | 'ant_human'
        this.globalNoFigureTimer = null; // 4s global timeout when no figures present
        this.isPlayingIntro = false; // flag to prevent setBackground during intro
        
        this.init();
    }

    init() {
        console.log('🚀 App initialisiert');

        // Lade Standard-Background und zeige drei Intro-Gehirne
        this.backgroundManager.reset();
        
        // Zeige drei Intro-Gehirne beim Start
        setTimeout(() => {
            this.uiController.showTripleBrains();
        }, 100);

        // Registriere Background-Change Listener
        this.backgroundManager.onBackgroundChange = (filename) => {
            this.handleBackgroundChange(filename);
        };

        // Registriere State-Change Listener
        this.placementManager.onChange((state) => {
            this.handleStateChange(state);
        });

        // Registriere Tangible-Event Handler
        tangibleInterface.onEvent((event) => {
            console.log('🎮 Tangible Event empfangen:', event);
            this.handleTangibleEvent(event);
        });

        console.log('✅ Bereit für Interaktion');
    }

    /**
     * Behandelt Background-Änderungen und zeigt sekundäres Gehirn bei _2 Slides
     */
    handleBackgroundChange(filename) {
        console.log('Background changed:', filename);
        
        // Prüfe ob es der intro-background ist -> Auto-Rotation starten
        if (filename === 'intro-background.png') {
            // Intro-Background: Starte Auto-Rotation
            if (this.uiController && typeof this.uiController.startIntroAutoRotation === 'function') {
                // Kleiner Delay damit Gehirne geladen sind
                setTimeout(() => {
                    this.uiController.startIntroAutoRotation();
                }, 1500);
            }
        } else {
            // Anderer Background: Stoppe Auto-Rotation
            if (this.uiController && typeof this.uiController.stopIntroAutoRotation === 'function') {
                this.uiController.stopIntroAutoRotation();
            }
        }
        
        // Prüfe ob es ein _2 Slide ist
        if (filename.includes('_2.png')) {
            // Match single animal pattern: ant_emotion_2.png
            const singleMatch = filename.match(/^(\w+)_(\w+)_2\.png$/);
            // Match comparison pattern: ant_human_emotion_2.png
            const comparisonMatch = filename.match(/^(\w+)_(\w+)_(\w+)_2\.png$/);
            
            if (comparisonMatch) {
                // Comparison view (e.g., ant_human_emotion_2.png)
                const animal1 = comparisonMatch[1]; // 'ant'
                const animal2 = comparisonMatch[2]; // 'human'
                const category = comparisonMatch[3]; // 'emotion'
                
                // Map to German names
                const nameMap = {
                    'ant': 'ameise',
                    'human': 'mensch',
                    'elephant': 'elefant',
                    'bird': 'vogel'
                };
                const germanName1 = nameMap[animal1] || animal1;
                const germanName2 = nameMap[animal2] || animal2;
                
                console.log(`Zeige zwei Gehirne für Vergleich: ${germanName1} + ${germanName2} (${category}_2)`);
                this.uiController.showDualBrains(germanName1, germanName2, true); // true = comparison _2 view
                
                // Start simultaneous rotation for both brains
                setTimeout(() => {
                    if (this.uiController && typeof this.uiController.startSimultaneousRotation === 'function') {
                        this.uiController.startSimultaneousRotation();
                    }
                }, 1500);
                
            } else if (singleMatch) {
                // Single animal view
                const animal = singleMatch[1]; // 'ant', 'human', etc.
                const category = singleMatch[2]; // 'emotion', 'intelligence', 'environment'
                
                // Map zurück zu deutschen Namen für Model-Loading
                const nameMap = {
                    'ant': 'ameise',
                    'human': 'mensch',
                    'elephant': 'elefant',
                    'bird': 'vogel'
                };
                const germanName = nameMap[animal] || animal;
                
                // Construct full sequence name for highlighting (e.g., 'ant_emotion_2')
                const sequenceName = `${animal}_${category}_2`;
                
                console.log(`Zeige sekundäres Gehirn für: ${germanName} (sequence: ${sequenceName})`);
                this.uiController.showSecondaryBrain(germanName, sequenceName);
                
                // Start simultaneous rotation for single brain
                setTimeout(() => {
                    if (this.uiController && typeof this.uiController.startSimultaneousRotation === 'function') {
                        this.uiController.startSimultaneousRotation();
                    }
                }, 1500);
            }
        } else {
            // Kein _2 Slide -> sekundäres Gehirn verstecken
            this.uiController.hideSecondaryBrain();
        }
    }

    /**
     * Verarbeitet Tangible-Events
     */
    handleTangibleEvent(event) {
        const { point, animal, rotation, action } = event;

        switch (action) {
            case 'place':
                this.placementManager.place(point, animal, rotation);
                break;

            case 'rotate':
                // Process rotation navigation first (uses the stored placement.rotation as baseline),
                // then update the placement rotation so the stored value reflects the new state.
                try {
                    this.processRotation(point, rotation);
                } catch (e) {
                    console.warn('Rotation processing failed', e);
                }
                // Hauptpunkte: Gehirn direkt drehen statt neu zu laden (der Drehgriff schickt viele Events)
                if (point <= 2 && this.rotateBrainDirectly(point, rotation)) break;
                this.placementManager.rotate(point, rotation);
                break;

            case 'remove':
                this.placementManager.remove(point);
                break;
        }

        // no inactivity timer on category points — placement keeps category active
    }

    /**
     * Dreht das Gehirn einer Figur auf Punkt 1/2 ohne State-Update (sonst lädt das Modell neu).
     * Ameise links (Viewer 1), Mensch rechts (Viewer 2), eine Figur allein immer Viewer 1.
     */
    rotateBrainDirectly(point, rotation) {
        const placement = this.placementManager.placements[point];
        if (!placement || this.placementManager.getActiveCategory()) return false;
        placement.rotation = rotation;
        const twoBrains = this.placementManager.getAllAnimals().length === 2;
        const viewer = twoBrains && placement.animal === 'mensch' ? this.uiController.brainViewer2 : this.uiController.brainViewer1;
        viewer?.setRotation(-rotation);
        return true;
    }

    // category inactivity timer removed: placed figures keep category active until removed

    /**
     * Blättert auf den Themenpunkten (3–5) per Drehung.
     * Web: Die Figur rastet alle 90° ein und schickt nur die eingerastete Stellung (0/90/180/270).
     * Die Raste bestimmt die Seite: gerade = _1, ungerade = _2. So kann man nicht „überdrehen“.
     */
    processRotation(point, rotationDeg) {
        const p = parseInt(point, 10);
        const placement = this.placementManager.placements[p];
        if (!placement || !placement.animal || p < 3 || p > 5) return;

        const category = {3: 'intelligence', 4: 'emotion', 5: 'environment'}[p];
        const slide = Math.round(rotationDeg / 90) % 2 === 0 ? 1 : 2;
        const currentBg = this.backgroundManager.currentBackground || '';
        if (currentBg.includes(`_${category}_${slide}.png`)) return;

        // Dreht man schon während des Intros, geht es sofort zur eingerasteten Seite
        this.backgroundManager._introLock = null;
        this.isPlayingIntro = false;
        this.backgroundManager.navigateSequence(this.placementManager.getAllAnimals(), category, slide, true);
    }

    /**
     * Reagiert auf State-Änderungen
     */
    handleStateChange(state) {
        console.log('State Update:', state);

        const { allAnimals, activeCategory, placements } = state;

        // GLOBAL: if no figures anywhere, start a timer to reset to intro
        // BUT: Don't start timer if we're in category mode (points 3-5) to avoid
        // interrupting navigation when figure detection is temporarily lost during rotation
        if (!allAnimals || allAnimals.length === 0) {
            if (!this.globalNoFigureTimer && !activeCategory) {
                this.globalNoFigureTimer = setTimeout(() => {
                    console.debug('[globalNoFigureTimer] no figures for 4s -> reset to intro');
                    if (this.backgroundManager && typeof this.backgroundManager.reset === 'function') this.backgroundManager.reset();
                    // Show triple intro brains
                    this.uiController.showTripleBrains();
                    this.lastActiveFigure = null;
                    if (this.playedIntros) this.playedIntros.clear();
                    this.globalNoFigureTimer = null;
                }, 4000);
            }
        } else {
            if (this.globalNoFigureTimer) {
                clearTimeout(this.globalNoFigureTimer);
                this.globalNoFigureTimer = null;
            }
        }

        // detect transitions into any category point (3..5) for animals
        try {
            // clear played intros when leaving category mode so they may play again later
            if (!activeCategory && this.playedIntros && this.playedIntros.size) {
                this.playedIntros.clear();
            }

            // (category inactivity timer removed) — no-op here

            // Detect if ANY animal entered a category point, and play intro with ALL animals
            const anyAnimalEnteredCategory = ['ameise','mensch','elefant','vogel'].some((animal) => {
                const wasOnCategoryBefore = this.prevState && Object.entries(this.prevState.placements).some(([pp, plc]) => {
                    return plc && plc.animal === animal && (parseInt(pp) >= 3 && parseInt(pp) <= 5);
                });
                const nowOnCategoryPoint = Object.entries(placements).some(([pp, plc]) => {
                    return plc && plc.animal === animal && (parseInt(pp) >= 3 && parseInt(pp) <= 5);
                });
                return !wasOnCategoryBefore && nowOnCategoryPoint;
            });

            if (anyAnimalEnteredCategory && activeCategory) {
                // Create intro key based on all animals present (sorted for consistency)
                const sortedAnimals = [...allAnimals].sort();
                const introKey = `${sortedAnimals.join('_')}_${activeCategory}`;
                if (!this.playedIntros.has(introKey)) {
                    this.playedIntros.add(introKey);
                    if (this.backgroundManager && typeof this.backgroundManager.playIntroSequence === 'function') {
                        this.isPlayingIntro = true;
                        // Pass ALL animals currently placed, not just the one that moved
                        this.backgroundManager.playIntroSequence(allAnimals, activeCategory).finally(() => {
                            this.isPlayingIntro = false;
                        });
                    }
                }
            }

            // Detect transitions from category points back to points 1/2 and show *_general
            ['ameise','mensch','elefant','vogel'].forEach((animal) => {
                const wasOnCategory = this.prevState && Object.entries(this.prevState.placements).some(([pp, plc]) => {
                    return plc && plc.animal === animal && (parseInt(pp) >= 3 && parseInt(pp) <= 5);
                });
                const nowOn12 = (placements[1] && placements[1].animal === animal) || (placements[2] && placements[2].animal === animal);
                if (wasOnCategory && nowOn12) {
                    // determine animals on 1/2 to show general (one or two)
                    const animalsOn12 = [];
                    if (placements[1]) animalsOn12.push(placements[1].animal);
                    if (placements[2]) animalsOn12.push(placements[2].animal);
                    const unique = [...new Set(animalsOn12)];
                    if (this.backgroundManager && typeof this.backgroundManager.setBackground === 'function') {
                        this.backgroundManager.setBackground({ animals: unique, category: null });
                    }
                    // Also show brains for general view
                    try {
                        if (unique.length === 1) {
                            const animalId = unique[0];
                            this.uiController.showSingleBrain(animalId);
                            // Start floating-only animation for general view
                            setTimeout(() => {
                                if (this.uiController && typeof this.uiController.startFloatingOnly === 'function') {
                                    this.uiController.startFloatingOnly();
                                }
                            }, 500);
                            // apply rotation for that animal from placements
                            let angle = 0;
                            for (const p in placements) {
                                const plc = placements[p];
                                if (plc && plc.animal === animalId) {
                                    angle = plc.rotation || 0;
                                    break;
                                }
                            }
                            if (this.uiController.brainViewer1 && typeof this.uiController.brainViewer1.setRotation === 'function') {
                                this.uiController.brainViewer1.setRotation(-angle);
                            }
                        } else if (unique.length === 2) {
                            // WICHTIG: Ameise IMMER links (viewer1), Mensch IMMER rechts (viewer2)
                            let leftAnimal, rightAnimal;
                            if (unique.includes('ameise') && unique.includes('mensch')) {
                                leftAnimal = 'ameise';
                                rightAnimal = 'mensch';
                            } else {
                                // Fallback für andere Kombinationen
                                [leftAnimal, rightAnimal] = unique;
                            }
                            
                            this.uiController.showDualBrains(leftAnimal, rightAnimal);
                            // Start floating-only animation for general view
                            setTimeout(() => {
                                if (this.uiController && typeof this.uiController.startFloatingOnly === 'function') {
                                    this.uiController.startFloatingOnly();
                                }
                            }, 500);
                            let leftAngle = 0, rightAngle = 0;
                            for (const p in placements) {
                                const plc = placements[p];
                                if (!plc) continue;
                                if (plc.animal === leftAnimal) leftAngle = plc.rotation || 0;
                                if (plc.animal === rightAnimal) rightAngle = plc.rotation || 0;
                            }
                            if (this.uiController.brainViewer1 && typeof this.uiController.brainViewer1.setRotation === 'function') this.uiController.brainViewer1.setRotation(-leftAngle);
                            if (this.uiController.brainViewer2 && typeof this.uiController.brainViewer2.setRotation === 'function') this.uiController.brainViewer2.setRotation(-rightAngle);
                        } else {
                            this.uiController.hideDisplayAreas();
                        }
                    } catch (e) {}
                }
            });

            // Detect transitions between category points (e.g., intelligence -> emotion)
            const prevCat = this.prevState ? this.prevState.activeCategory : null;
            const categoryChanged = prevCat !== activeCategory && prevCat && activeCategory;
            
            if (categoryChanged) {
                // Create intro key based on all animals present (sorted for consistency)
                const sortedAnimals = [...allAnimals].sort();
                const introKey = `${sortedAnimals.join('_')}_${activeCategory}`;
                if (!this.playedIntros.has(introKey)) {
                    this.playedIntros.add(introKey);
                    if (this.backgroundManager && typeof this.backgroundManager.playIntroSequence === 'function') {
                        this.isPlayingIntro = true;
                        // Pass ALL animals currently placed
                        this.backgroundManager.playIntroSequence(allAnimals, activeCategory).finally(() => {
                            this.isPlayingIntro = false;
                        });
                    }
                }
            }
        } catch (e) {
            console.warn('Error detecting placement transition', e);
        }

        // Prüfe ob Kategorie aktiv (Punkt 3-5)
        if (activeCategory) {
            // Determine animals to use for background:
            // Use ALL animals that are currently placed (anywhere)
            let animalsForBackground = [...allAnimals];
            const placedOn12 = [];
            if (placements[1]) placedOn12.push(placements[1].animal);
            if (placements[2]) placedOn12.push(placements[2].animal);

            // Special case: if only one animal present and none on 1/2, prefer lastActiveFigure
            if (allAnimals.length === 1 && placedOn12.length === 0 && this.lastActiveFigure) {
                animalsForBackground = [this.lastActiveFigure];
            }

            // Only change background when animals or category actually changed
            const prevAnimals = this.prevState ? this.prevState.allAnimals : null;
            const prevCategory = this.prevState ? this.prevState.activeCategory : null;
            const arraysEqual = (a, b) => {
                if (!a || !b) return false;
                if (a.length !== b.length) return false;
                const sortedA = [...a].sort();
                const sortedB = [...b].sort();
                for (let i = 0; i < sortedA.length; i++) if (sortedA[i] !== sortedB[i]) return false;
                return true;
            };

            if (!this.isPlayingIntro && (prevCategory !== activeCategory || !arraysEqual(prevAnimals, animalsForBackground))) {
                this.backgroundManager.setBackground({
                    animals: animalsForBackground,
                    category: activeCategory
                });
            }

            // Info display removed per user request

            // Verstecke 3D-Bereiche im Kategorie-Modus (ABER NICHT bei _2 Slides!)
            const currentBg = this.backgroundManager ? this.backgroundManager.currentBackground : '';
            if (!currentBg.includes('_2.png')) {
                this.uiController.hideDisplayAreas();
            }
        }
        // Basis-Modus (Tiere auf Punkt 1-2, keine Kategorie)
        else if (allAnimals.length > 0) {
            this.uiController.hideCategoryInfo();
            
            // Update Background mit allen platzierten Tieren
            this.backgroundManager.setBackground({
                animals: allAnimals,
                category: null
            });

            // Zeige 3D-Gehirne
            if (allAnimals.length === 1) {
                // Ein Tier: zentriertes Gehirn
                const animal = allAnimals[0];
                this.uiController.showSingleBrain(animal);
                // Find placement rotation for that animal and apply to viewer
                let angle = 0;
                for (const p in placements) {
                    const plc = placements[p];
                    if (plc && plc.animal === animal) {
                        angle = plc.rotation || 0;
                        break;
                    }
                }
                if (this.uiController.brainViewer1 && typeof this.uiController.brainViewer1.setRotation === 'function') {
                    this.uiController.brainViewer1.setRotation(-angle);
                }
            } else if (allAnimals.length === 2) {
                // Zwei Tiere: beide Gehirne links/rechts
                // WICHTIG: Ameise IMMER links (viewer1), Mensch IMMER rechts (viewer2)
                let leftAnimal, rightAnimal;
                if (allAnimals.includes('ameise') && allAnimals.includes('mensch')) {
                    leftAnimal = 'ameise';
                    rightAnimal = 'mensch';
                } else {
                    // Fallback für andere Kombinationen
                    [leftAnimal, rightAnimal] = allAnimals;
                }
                
                this.uiController.showDualBrains(leftAnimal, rightAnimal);
                
                // apply rotations for each animal based on their placement
                let leftAngle = 0, rightAngle = 0;
                for (const p in placements) {
                    const plc = placements[p];
                    if (!plc) continue;
                    if (plc.animal === leftAnimal) leftAngle = plc.rotation || 0;
                    if (plc.animal === rightAnimal) rightAngle = plc.rotation || 0;
                }
                if (this.uiController.brainViewer1 && typeof this.uiController.brainViewer1.setRotation === 'function') this.uiController.brainViewer1.setRotation(-leftAngle);
                if (this.uiController.brainViewer2 && typeof this.uiController.brainViewer2.setRotation === 'function') this.uiController.brainViewer2.setRotation(-rightAngle);
            } else {
                this.uiController.hideDisplayAreas();
            }
        }
        // Nichts platziert
        else {
            this.uiController.reset();
            this.backgroundManager.reset();
            // Zeige sofort die drei Intro-Gehirne (nur wenn inzwischen keine Figur gesetzt wurde)
            setTimeout(() => {
                if (this.placementManager.getAllAnimals().length === 0) this.uiController.showTripleBrains();
            }, 100);
        }

        // store previous state snapshot
        this.prevState = { placements: { ...placements }, allAnimals: [...allAnimals], activeCategory };

        // Update lastActiveFigure according to placements on points 1/2, or overall animals
        try {
            const placed12 = [];
            if (placements[1]) placed12.push(placements[1].animal);
            if (placements[2]) placed12.push(placements[2].animal);

            if (placed12.length === 2) {
                this.lastActiveFigure = 'ant_human';
            } else if (placed12.length === 1) {
                this.lastActiveFigure = placed12[0];
            } else {
                // if none on 1/2, but two animals anywhere, set ant_human
                if (allAnimals.length === 2) this.lastActiveFigure = 'ant_human';
                else if (allAnimals.length === 1) {
                    // keep existing lastActiveFigure if present, otherwise set to the single animal
                    if (!this.lastActiveFigure) this.lastActiveFigure = allAnimals[0];
                }
            }
        } catch (e) {}
    }

    /**
     * Gibt die Punktnummer für eine Kategorie zurück
     */
    getCategoryPoint(category) {
        const mapping = {
            'intelligence': 3,
            // swapped: point 4 -> emotion, point 5 -> environment
            'environment': 5,
            'emotion': 4
        };
        return mapping[category];
    }

}

// App starten wenn DOM bereit ist
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
