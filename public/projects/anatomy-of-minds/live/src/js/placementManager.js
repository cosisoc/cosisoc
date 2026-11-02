/**
 * Platzierungs-Manager
 * Verwaltet den State der 5 Platzierungspunkte
 */

export class PlacementManager {
    constructor() {
        // State: welches Tier ist auf welchem Punkt
        this.placements = {
            1: null,  // { animal: 'ameise', rotation: 0 }
            2: null,
            3: null,
            4: null,
            5: null
        };
        
        this.activeCategory = null;
        this.listeners = [];
    }

    /**
     * Platziert ein Tier auf einem Punkt
     */
    place(point, animal, rotation = 0) {
        // Ensure the same animal isn't placed on multiple points: clear any previous placement
        try {
            for (const p in this.placements) {
                if (this.placements[p] && this.placements[p].animal === animal && parseInt(p, 10) !== parseInt(point, 10)) {
                    this.placements[p] = null;
                    this.updatePointVisual(p, false);
                }
            }
        } catch (e) {}

        this.placements[point] = { animal, rotation };
        this.updatePointVisual(point, true);
        this.notifyListeners();
        console.log(`Platziert: ${animal} auf Punkt ${point} (Rotation: ${rotation}°)`);
    }

    /**
     * Entfernt ein Tier von einem Punkt
     */
    remove(point) {
        const removed = this.placements[point];
        this.placements[point] = null;
        this.updatePointVisual(point, false);
        this.notifyListeners();
        console.log(`Entfernt von Punkt ${point}`);
        return removed;
    }

    /**
     * Rotiert ein Tier auf einem Punkt
     */
    rotate(point, angle) {
        if (this.placements[point]) {
            this.placements[point].rotation = angle;
            this.notifyListeners();
            console.log(`Rotiert auf Punkt ${point}: ${angle}°`);
        }
    }

    /**
     * Gibt alle platzierten Tiere zurück
     */
    getPlacedAnimals() {
        return Object.entries(this.placements)
            .filter(([_, value]) => value !== null)
            .map(([point, value]) => ({ point: parseInt(point), ...value }));
    }

    /**
     * Gibt Tiere auf Punkten 1-2 zurück (Vergleichsmodus)
     */
    getCompareAnimals() {
        const animals = [];
        if (this.placements[1]) animals.push(this.placements[1].animal);
        if (this.placements[2]) animals.push(this.placements[2].animal);
        return animals;
    }

    /**
     * Gibt alle einzigartigen Tiere zurück (egal auf welchem Punkt)
     */
    getAllAnimals() {
        const animals = new Set();
        Object.values(this.placements).forEach(placement => {
            if (placement && placement.animal) {
                animals.add(placement.animal);
            }
        });
        return Array.from(animals);
    }

    /**
     * Prüft ob eine Kategorie (Punkt 3-5) aktiv ist
     */
    getActiveCategory() {
        if (this.placements[3]) return 'intelligence';
        // NOTE: swapped points: point 4 -> emotion, point 5 -> environment
        if (this.placements[4]) return 'emotion';
        if (this.placements[5]) return 'environment';
        return null;
    }

    /**
     * Aktualisiert die visuelle Darstellung eines Punktes
     */
    updatePointVisual(point, active) {
        const element = document.getElementById(`point-${point}`);
        if (element) {
            if (active) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        }
    }

    /**
     * Registriert einen Listener für State-Änderungen
     */
    onChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Benachrichtigt alle Listener
     */
    notifyListeners() {
        const state = {
            placements: { ...this.placements },
            compareAnimals: this.getCompareAnimals(),
            allAnimals: this.getAllAnimals(),
            activeCategory: this.getActiveCategory()
        };
        this.listeners.forEach(callback => callback(state));
    }

    /**
     * Reset - entfernt alle Platzierungen
     */
    reset() {
        for (let point in this.placements) {
            if (this.placements[point]) {
                this.remove(point);
            }
        }
    }
}
