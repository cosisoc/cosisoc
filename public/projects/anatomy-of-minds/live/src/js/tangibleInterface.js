/**
 * Tangible Interface
 * Abstraktion für Arduino/Tangible Inputs
 */

export class TangibleInterface {
    constructor() {
        this.handlers = [];
    }

    /**
     * Registriert einen Handler für Tangible-Events
     */
    onEvent(callback) {
        this.handlers.push(callback);
    }

    /**
     * Verarbeitet ein Tangible-Event
     * @param {Object} event - { point, animal, rotation, action: 'place'|'rotate'|'remove' }
     */
    handleEvent(event) {
        console.log('Tangible Event:', event);
        this.handlers.forEach(handler => handler(event));
    }

    /**
     * Simuliert ein Tangible-Input (für Tests ohne Arduino)
     */
    simulate(point, animal, rotation = 0, action = 'place') {
        this.handleEvent({
            point: parseInt(point),
            animal,
            rotation,
            action
        });
    }

    /**
     * Parst Arduino-Daten (Format: "PLACE:1:ameise:0" oder "ROTATE:1:90" oder "REMOVE:1")
     */
    parseArduinoData(data) {
        const parts = data.split(':');
        const action = parts[0].toLowerCase();
        const point = parseInt(parts[1]);

        switch (action) {
            case 'place':
                const animal = parts[2];
                const rotation = parseInt(parts[3]) || 0;
                this.handleEvent({ point, animal, rotation, action: 'place' });
                break;

            case 'rotate':
                const angle = parseInt(parts[2]) || 0;
                this.handleEvent({ point, rotation: angle, action: 'rotate' });
                break;

            case 'remove':
                this.handleEvent({ point, action: 'remove' });
                break;

            default:
                console.warn('Unbekanntes Arduino-Format:', data);
        }
    }
}

// Globale Instanz für einfachen Zugriff
export const tangibleInterface = new TangibleInterface();
