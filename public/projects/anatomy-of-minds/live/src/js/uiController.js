/**
 * UI Controller
 * Steuert die Anzeige von Inhalten und 3D-Bereichen
 */

import { tiere } from './tiere.js';
import { Brain3DViewer } from './brain3DViewer.js';

export class UIController {
    constructor() {
        this.infoDisplay = document.getElementById('info-display');
        this.infoContent = document.getElementById('info-content');
        this.displayArea1 = document.getElementById('display-area-1');
        this.displayArea2 = document.getElementById('display-area-2');
        this.displayArea3 = document.getElementById('display-area-3');
        
        // 3D Brain Viewers
        this.brainViewer1 = null;
        this.brainViewer2 = null;
        this.brainViewer3 = null;
        // Default persistent palette — hard-coded so it's always applied from code
        this.defaultPalette = [
            '#FF9174','#FFD5A3','#FFB59B','#FF9F9F','#FFAEBF','#FFE5F1','#FFB2C0','#FFE3BD','#FFC8CA'
        ];
        try { localStorage.setItem('defaultBrainPalette', JSON.stringify(this.defaultPalette)); } catch (e) {}
        
        // Auto-rotation state for intro brains
        this.introRotationActive = false;
        this.introRotationInterval = null;
        
        // Simultaneous rotation state for _2 slides
        this.simultaneousRotationActive = false;
        this.simultaneousRotationInterval = null;
        
        // Floating-only state for general views (no rotation)
        this.floatingOnlyActive = false;
        this.floatingOnlyInterval = null;
    }

    /**
     * Zeigt Kategorie-Informationen an
     */
    showCategoryInfo(animal, category) {
        if (!tiere[animal] || !tiere[animal].categories[category]) {
            console.warn(`Keine Daten für ${animal} / ${category}`);
            return;
        }

        const data = tiere[animal].categories[category];
        if (!this.infoContent || !this.infoDisplay) {
            console.log('Info display not available in DOM; skipping category info render.');
            return;
        }

        this.infoContent.innerHTML = `
            <h2>${data.title}</h2>
            <p>${data.content}</p>
        `;

        this.infoDisplay.classList.remove('hidden');
        console.log(`Zeige Kategorie: ${animal} - ${category}`);
    }

    /**
     * Versteckt die Kategorie-Informationen
     */
    hideCategoryInfo() {
        if (this.infoDisplay) this.infoDisplay.classList.add('hidden');
    }

    /**
     * Zeigt die 3D Display-Bereiche (für später)
     */
    showDisplayAreas() {
        this.displayArea1.classList.remove('hidden', 'centered', 'intro-brain');
        this.displayArea2.classList.remove('hidden', 'centered', 'intro-brain');
        console.log('3D Display-Bereiche angezeigt');
    }

    /**
     * Zeigt ein einzelnes Gehirn (zentriert)
     */
    showSingleBrain(animal) {
        // Nur Display-Area 1, zentriert
        this.displayArea1.classList.remove('hidden', 'intro-brain');
        this.displayArea1.classList.add('centered');
        this.displayArea2.classList.remove('intro-brain');
        this.displayArea2.classList.add('hidden');
        
        // Lade 3D-Modell
        this.load3DModel(this.displayArea1, animal, 1);
        
        // Note: Rotation is NOT reset here - it will be set from Arduino data
        
        console.log(`Zeige einzelnes Gehirn: ${animal}`);
    }

    /**
     * Zeigt zwei Gehirne (links/rechts)
     * @param {boolean} isComparisonTwo - if true, applies special positioning for _2 comparison slides
     */
    showDualBrains(animal1, animal2, isComparisonTwo = false) {
        // Beide Areas, nicht zentriert
        this.displayArea1.classList.remove('hidden', 'centered', 'intro-brain', 'comparison-two');
        this.displayArea2.classList.remove('hidden', 'centered', 'intro-brain', 'comparison-two');
        
        // Add comparison-two class if this is a _2 comparison view
        if (isComparisonTwo) {
            this.displayArea1.classList.add('comparison-two');
            this.displayArea2.classList.add('comparison-two');
        }
        
        // Lade beide 3D-Modelle
        this.load3DModel(this.displayArea1, animal1, 1);
        this.load3DModel(this.displayArea2, animal2, 2);
        
        // Note: Rotation is NOT reset here - it will be set from Arduino data
        
        console.log(`Zeige zwei Gehirne: ${animal1} + ${animal2}${isComparisonTwo ? ' (comparison _2)' : ''}`);
    }

    /**
     * Zeigt drei Gehirne für Intro-Screen (Ant, Human, Vogel)
     */
    showTripleBrains() {
        // Erst alle Areas sichtbar machen und CSS anwenden
        this.displayArea1.classList.remove('hidden', 'centered', 'intro-brain');
        this.displayArea1.classList.add('intro-brain');
        // Setze initiale Position sofort
        this.displayArea1.style.transform = 'translateY(-50%)';
        
        this.displayArea2.classList.remove('hidden', 'centered', 'intro-brain');
        this.displayArea2.classList.add('intro-brain');
        this.displayArea2.style.transform = 'translateY(-50%)';
        
        this.displayArea3.classList.remove('hidden', 'centered', 'intro-brain');
        this.displayArea3.classList.add('intro-brain');
        this.displayArea3.style.transform = 'translateY(-50%)';
        
        // Warte auf Browser-Reflow, dann lade Modelle
        requestAnimationFrame(() => {
            this.load3DModel(this.displayArea1, 'ameise', 1);
            this.load3DModel(this.displayArea2, 'mensch', 2);
            this.load3DModel(this.displayArea3, 'vogel', 3);
            
            // Disable zoom for intro brains
            setTimeout(() => {
                if (this.brainViewer1) this.brainViewer1.setZoomEnabled(false);
                if (this.brainViewer2) this.brainViewer2.setZoomEnabled(false);
                if (this.brainViewer3) this.brainViewer3.setZoomEnabled(false);
            }, 100);
            
            console.log('Zeige drei Intro-Gehirne: Ameise, Mensch, Vogel');
            
            // Auto-Rotation wird von main.js über handleBackgroundChange gestartet
        });
    }

    /**
     * Startet die automatische Rotations-Animation für Intro-Gehirne
     */
    startIntroAutoRotation() {
        if (this.introRotationActive) return;
        
        this.introRotationActive = true;
        
        // Ameisen-Gehirn initial auf 180 Grad setzen
        if (this.brainViewer1) {
            this.brainViewer1.setRotation(180);
        }
        
        let currentBrain = 1; // 1=Ameise, 2=Mensch, 3=Vogel
        let rotationAngle = 180; // Start bei 180 für Ameise
        const rotationSpeed = 0.3; // Grad pro Frame (langsamer = kleinerer Wert)
        let floatTime = 0; // Zeit für Schwebe-Animation
        
        const animate = () => {
            if (!this.introRotationActive) return;
            
            // Aktuelles Gehirn und Container
            const viewer = currentBrain === 1 ? this.brainViewer1 : 
                          currentBrain === 2 ? this.brainViewer2 : 
                          this.brainViewer3;
            const container = currentBrain === 1 ? this.displayArea1 :
                             currentBrain === 2 ? this.displayArea2 :
                             this.displayArea3;
            
            if (viewer) {
                rotationAngle += rotationSpeed;
                viewer.setRotation(rotationAngle % 360);
            }
            
            // Schwebe-Effekt nur für aktuelles Gehirn
            if (container) {
                floatTime += 0.01; // Langsamer für sanftere Bewegung
                const floatOffset = Math.sin(floatTime * 2) * 15; // 15px Amplitude, langsame Bewegung
                container.style.transform = `translateY(calc(-50% + ${floatOffset}px))`;
            }
            
            // Andere Gehirne auf Standardposition setzen
            if (currentBrain !== 1 && this.displayArea1) {
                this.displayArea1.style.transform = 'translateY(-50%)';
            }
            if (currentBrain !== 2 && this.displayArea2) {
                this.displayArea2.style.transform = 'translateY(-50%)';
            }
            if (currentBrain !== 3 && this.displayArea3) {
                this.displayArea3.style.transform = 'translateY(-50%)';
            }
            
            // Prüfe ob 360° Rotation abgeschlossen (relative zum Start)
            const startAngle = currentBrain === 1 ? 180 : 0;
            if (rotationAngle >= startAngle + 360) {
                // Wechsel zum nächsten Gehirn
                currentBrain++;
                if (currentBrain > 3) {
                    currentBrain = 1; // Zurück zur Ameise
                    rotationAngle = 180; // Reset auf 180 für Ameise
                } else {
                    rotationAngle = 0; // Mensch und Vogel starten bei 0
                }
                floatTime = 0; // Reset Schwebe-Animation für neues Gehirn
            }
            
            this.introRotationInterval = requestAnimationFrame(animate);
        };
        
        animate();
        console.log('Auto-Rotation für Intro-Gehirne gestartet');
    }

    /**
     * Stoppt die automatische Rotations-Animation
     */
    stopIntroAutoRotation() {
        this.introRotationActive = false;
        if (this.introRotationInterval) {
            cancelAnimationFrame(this.introRotationInterval);
            this.introRotationInterval = null;
        }
        console.log('Auto-Rotation gestoppt');
    }

    /**
     * Startet simultane Rotation für _2 Slides (alle sichtbaren Gehirne drehen sich gleichzeitig)
     */
    startSimultaneousRotation() {
        if (this.simultaneousRotationActive) return;
        
        this.simultaneousRotationActive = true;
        let rotationAngle = 0;
        const rotationSpeed = 0.3; // Same speed as intro rotation
        let floatTime = 0;
        
        const animate = () => {
            if (!this.simultaneousRotationActive) return;
            
            rotationAngle += rotationSpeed;
            const normalizedAngle = rotationAngle % 360;
            floatTime += 0.01;
            
            // Calculate floating offset (up and down movement)
            const floatOffset = Math.sin(floatTime * 2) * 15; // 15px amplitude
            
            // Rotate all active viewers simultaneously and apply floating effect
            if (this.brainViewer1) {
                this.brainViewer1.setRotation(normalizedAngle);
                this.displayArea1.style.transform = `translate(-50%, calc(-50% + ${floatOffset}px))`;
            }
            if (this.brainViewer2) {
                this.brainViewer2.setRotation(normalizedAngle);
                this.displayArea2.style.transform = `translate(-50%, calc(-50% + ${floatOffset}px))`;
            }
            if (this.brainViewer3) {
                this.brainViewer3.setRotation(normalizedAngle);
                this.displayArea3.style.transform = `translate(-50%, calc(-50% + ${floatOffset}px))`;
            }
            
            this.simultaneousRotationInterval = requestAnimationFrame(animate);
        };
        
        animate();
        console.log('Simultane Rotation mit Floating-Effekt für _2 Slides gestartet');
    }

    /**
     * Stoppt die simultane Rotation
     */
    stopSimultaneousRotation() {
        this.simultaneousRotationActive = false;
        if (this.simultaneousRotationInterval) {
            cancelAnimationFrame(this.simultaneousRotationInterval);
            this.simultaneousRotationInterval = null;
        }
        console.log('Simultane Rotation gestoppt');
    }

    /**
     * Startet nur Floating-Effekt ohne Rotation (für general views)
     */
    startFloatingOnly() {
        if (this.floatingOnlyActive) return;
        
        this.floatingOnlyActive = true;
        let floatTime = 0;
        
        const animate = () => {
            if (!this.floatingOnlyActive) return;
            
            floatTime += 0.01;
            
            // Calculate floating offset (up and down movement)
            const floatOffset = Math.sin(floatTime * 2) * 15; // 15px amplitude
            
            // Schweben über `translate`: lässt top/transform aus dem CSS unangetastet
            // (vorher top: 50% – das hat z. B. das höher gesetzte Menschengehirn nach unten geschoben)
            if (this.brainViewer1 && !this.displayArea1.classList.contains('hidden')) {
                this.displayArea1.style.translate = `0 ${floatOffset}px`;
            }
            if (this.brainViewer2 && !this.displayArea2.classList.contains('hidden')) {
                this.displayArea2.style.translate = `0 ${floatOffset}px`;
            }
            if (this.brainViewer3 && !this.displayArea3.classList.contains('hidden')) {
                this.displayArea3.style.translate = `0 ${floatOffset}px`;
            }
            
            this.floatingOnlyInterval = requestAnimationFrame(animate);
        };
        
        animate();
        console.log('Floating-Effekt (ohne Rotation) für general views gestartet');
    }

    /**
     * Stoppt den Floating-only Effekt
     */
    stopFloatingOnly() {
        this.floatingOnlyActive = false;
        if (this.floatingOnlyInterval) {
            cancelAnimationFrame(this.floatingOnlyInterval);
            this.floatingOnlyInterval = null;
        }
        [this.displayArea1, this.displayArea2, this.displayArea3].forEach((el) => { if (el) el.style.translate = ''; });
        console.log('Floating-Effekt gestoppt');
    }

    /**
     * Versteckt die 3D Display-Bereiche
     */
    hideDisplayAreas() {
        // Stoppe alle Auto-Rotationen und Animationen
        this.stopIntroAutoRotation();
        this.stopSimultaneousRotation();
        this.stopFloatingOnly();
        
        this.displayArea1.classList.remove('intro-brain');
        this.displayArea1.classList.add('hidden');
        this.displayArea2.classList.remove('intro-brain');
        this.displayArea2.classList.add('hidden');
        if (this.displayArea3) {
            this.displayArea3.classList.remove('intro-brain');
            this.displayArea3.classList.add('hidden');
        }
    }

    /**
     * Zeigt das dritte Gehirn für _2 Slides (andere Position/Größe)
     * @param {string} animal - e.g., 'ameise', 'mensch'
     * @param {string} sequenceName - optional full sequence name e.g., 'ant_emotion_2'
     */
    showSecondaryBrain(animal, sequenceName = null) {
        if (!this.displayArea3) return;
        
        // Verstecke die anderen beiden Display-Areas explizit
        // Entferne intro-brain Klasse zuerst, da sie !important display rules hat
        this.displayArea1.classList.remove('intro-brain');
        this.displayArea1.classList.add('hidden');
        this.displayArea2.classList.remove('intro-brain');
        this.displayArea2.classList.add('hidden');
        
        // Zeige nur display-area-3
        this.displayArea3.classList.remove('hidden', 'intro-brain');
        // Clear any inline styles from intro view
        this.displayArea3.style.transform = '';
        this.displayArea3.style.left = '';
        
        this.load3DModel(this.displayArea3, animal, 3, sequenceName);
        
        // Rotation zurücksetzen (nicht vom intro-background übernehmen)
        setTimeout(() => {
            if (this.brainViewer3) {
                this.brainViewer3.setRotation(0);
            }
        }, 100);
        
        console.log(`Zeige sekundäres Gehirn für _2 Slide: ${animal}`, sequenceName ? `(sequence: ${sequenceName})` : '');
    }

    /**
     * Versteckt das sekundäre Gehirn
     */
    hideSecondaryBrain() {
        if (!this.displayArea3) return;
        
        this.displayArea3.classList.add('hidden');
        if (this.brainViewer3) {
            this.brainViewer3.dispose();
            this.brainViewer3 = null;
        }
    }

    /**
     * Lädt 3D-Modell
     * @param {string} sequenceName - optional full sequence name for highlighting (e.g., 'ant_emotion_2')
     */
    load3DModel(containerElement, animal, viewerNumber = 1, sequenceName = null) {
        // Entferne alten Viewer falls vorhanden
        if (viewerNumber === 1 && this.brainViewer1) {
            this.brainViewer1.dispose();
            this.brainViewer1 = null;
        } else if (viewerNumber === 2 && this.brainViewer2) {
            this.brainViewer2.dispose();
            this.brainViewer2 = null;
        } else if (viewerNumber === 3 && this.brainViewer3) {
            this.brainViewer3.dispose();
            this.brainViewer3 = null;
        }
        
        // Leere Container
        containerElement.innerHTML = '';
        
        // Erstelle neuen Viewer
        const viewer = new Brain3DViewer(containerElement);
        
        // Bestimme Modell-Pfad (zuerst aus `tiere`-Metadata, sonst Fallback)
        const modelPath = (tiere[animal] && tiere[animal].model3D) ? tiere[animal].model3D : `assets/models/${animal}_brain/scene.gltf`;
        
        // Lade Modell
        // apply default palette after model has loaded (viewer exposes onModelLoaded)
        viewer.onModelLoaded = (v) => {
            // Apply sequence-specific highlighting if provided (for viewer 3 / _2 sequences)
            if (sequenceName && v.applySequenceHighlighting) {
                try {
                    v.applySequenceHighlighting(sequenceName);
                    console.log(`Applied sequence highlighting: ${sequenceName}`);
                } catch (e) {
                    console.warn('Failed to apply sequence highlighting', e);
                }
            } else if (this.defaultPalette && this.defaultPalette.length) {
                // Otherwise apply default palette for non-highlighted brains
                try { 
                    this.applyPaletteToViewer(v, this.defaultPalette); 
                } catch (e) {}
            }
        };
        viewer.loadModel(modelPath);
        
        // Speichere Viewer-Referenz
        if (viewerNumber === 1) {
            this.brainViewer1 = viewer;
        } else if (viewerNumber === 2) {
            this.brainViewer2 = viewer;
        } else if (viewerNumber === 3) {
            this.brainViewer3 = viewer;
        }
        
        console.log(`3D-Modell geladen: ${animal} in Viewer ${viewerNumber}`);
    }

    /**
     * Set the default palette (persists to localStorage) and apply to currently loaded viewers.
     * `palette` accepts the same formats as `parsePalette`.
     */
    setDefaultBrainPalette(palette) {
        const parsed = this.parsePalette(palette || []);
        if (!parsed || parsed.length === 0) {
            console.warn('setDefaultBrainPalette: empty palette');
            return;
        }
        this.defaultPalette = parsed;
        try { localStorage.setItem('defaultBrainPalette', JSON.stringify(parsed)); } catch (e) {}
        // apply immediately to existing viewers
        if (this.brainViewer1) this.applyPaletteToViewer(this.brainViewer1, parsed);
        if (this.brainViewer2) this.applyPaletteToViewer(this.brainViewer2, parsed);
        if (this.brainViewer3) this.applyPaletteToViewer(this.brainViewer3, parsed);
        if (this.brainViewer3) this.applyPaletteToViewer(this.brainViewer3, parsed);
        console.log('Default brain palette set and applied');
    }

    /**
     * Entfernt 3D-Viewer
     */
    dispose3DViewers() {
        if (this.brainViewer1) {
            this.brainViewer1.dispose();
            this.brainViewer1 = null;
        }
        if (this.brainViewer2) {
            this.brainViewer2.dispose();
            this.brainViewer2 = null;
        }
        if (this.brainViewer3) {
            this.brainViewer3.dispose();
            this.brainViewer3 = null;
        }
        
        // Leere Container
        this.displayArea1.innerHTML = '';
        this.displayArea2.innerHTML = '';
        if (this.displayArea3) this.displayArea3.innerHTML = '';
        
        console.log('3D-Viewer entfernt');
    }

    /**
     * Set uniform scale for a viewer (1,2,3). multiplier >1 enlarges, <1 shrinks.
     */
    setViewerScale(viewerNumber, multiplier) {
        const m = Number(multiplier) || 1;
        try {
            if (viewerNumber === 1 && this.brainViewer1) {
                this.brainViewer1.setUniformScale(m);
            } else if (viewerNumber === 2 && this.brainViewer2) {
                this.brainViewer2.setUniformScale(m);
            } else if (viewerNumber === 3 && this.brainViewer3) {
                this.brainViewer3.setUniformScale(m);
            } else {
                console.warn('setViewerScale: viewer not available', viewerNumber);
            }
        } catch (e) {
            console.warn('setViewerScale failed', e);
        }
    }

    /**
     * Reset - versteckt alle UI-Elemente
     */
    reset() {
        this.hideCategoryInfo();
        this.hideDisplayAreas();
        this.dispose3DViewers();
    }

    /**
     * Parse various palette formats into an array of hex strings starting with '#'
     * Accepts: comma/CSV string, array of hex (with/without '#'), object (name->hex), or extended array of objects.
     */
    parsePalette(palette) {
        if (!palette) return [];
        // If string CSV
        if (typeof palette === 'string') {
            return palette.split(',').map(s => s.trim().replace(/^#?/, '#'));
        }
        // If array of strings or objects
        if (Array.isArray(palette)) {
            // array of hex strings
            if (palette.length && typeof palette[0] === 'string') {
                return palette.map(s => String(s).trim().replace(/^#?/, '#'));
            }
            // array of objects with hex property
            return palette.map((p) => {
                if (p && p.hex) return `#${String(p.hex).replace(/^#?/, '')}`;
                return null;
            }).filter(Boolean);
        }
        // If object mapping names to hex
        if (typeof palette === 'object') {
            return Object.values(palette).map(h => `#${String(h).replace(/^#?/, '')}`);
        }
        return [];
    }

    /**
     * Apply a palette (array of hex strings) to a single Brain3DViewer instance.
     * Parts are assigned sequentially to available mesh names.
     */
    applyPaletteToViewer(viewer, paletteArray) {
        if (!viewer || !viewer.getPartNames) return;
        const parts = viewer.getPartNames();
        if (!parts || parts.length === 0) return;
        const palette = this.parsePalette(paletteArray);
        if (!palette || palette.length === 0) return;
        try {
            // apply sequentially with force to ensure color overrides textures
            for (let i = 0; i < parts.length; i++) {
                const color = palette[i % palette.length];
                try { viewer.setPartColor(parts[i], color, { force: true }); } catch (e) {}
            }
            console.log('Applied palette to viewer:', parts.length, 'parts (force)');
        } catch (e) {
            console.warn('applyPaletteToViewer failed', e);
        }
    }

    /**
     * Apply palette to both viewers (if present). Accepts same formats as `parsePalette`.
     */
    applyPaletteToAll(palette) {
        const parsed = this.parsePalette(palette);
        if (!parsed || parsed.length === 0) {
            console.warn('No palette provided');
            return;
        }
        if (this.brainViewer1) this.applyPaletteToViewer(this.brainViewer1, parsed);
        if (this.brainViewer2) this.applyPaletteToViewer(this.brainViewer2, parsed);
    }
}
