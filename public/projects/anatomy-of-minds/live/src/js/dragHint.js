/**
 * Handlungsaufforderung (Web-Version): Eine Hand (wie beim Bob-3D-Modell) zieht eine halbdurchsichtige Kopie
 * der Menschenfigur vom Podest auf ihren Kreis, danach pulsiert der Kreis. Läuft ein paar Mal und hört auf,
 * sobald jemand selbst eine Figur anfasst. Die echte Figur bleibt stehen, platzieren muss man selbst.
 */

const HAND_W = 25, HAND_H = 36, TIP_X = 11, TIP_Y = 9; // Fingerspitze im SVG
const SCALE = 1.6;
const ROUNDS = 3, PAUSE = 2200; // ms zwischen zwei Durchgängen

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class DragHint {
    constructor(table, center, figure, spot) {
        this.table = table;
        this.center = center; // (el) => { x, y } relativ zum Tisch, wie in figureDrag.js
        this.figure = figure;
        this.spot = spot;
        this.stopped = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.stopped) return;
        this.ghost = document.createElement('div');
        this.ghost.className = 'drag-ghost';
        this.ghost.append(figure.querySelector('.face img').cloneNode());
        this.hand = document.createElement('img');
        this.hand.className = 'drag-hand';
        this.hand.src = 'assets/hand.svg';
        this.hand.alt = '';
        this.hand.style.width = `${HAND_W * SCALE}px`;
        this.table.append(this.ghost, this.hand);
        this.run();
    }

    stop() {
        if (this.stopped) return;
        this.stopped = true;
        this.ghost.remove();
        this.hand.remove();
        this.spot.classList.remove('is-hint');
    }

    at(p, el) {
        return el === this.hand
            ? `translate(${p.x - TIP_X * SCALE}px, ${p.y - TIP_Y * SCALE}px)`
            : `translate(calc(${p.x}px - 50%), calc(${p.y}px - 50%))`;
    }

    async run() {
        await wait(900);
        for (let i = 0; i < ROUNDS && !this.stopped; i++) {
            await this.round();
            await wait(PAUSE);
        }
        this.stop();
    }

    async round() {
        const from = this.center(this.figure);
        const to = this.center(this.spot);
        const near = { x: from.x + 40, y: from.y + 50 };
        const hand = this.hand, ghost = this.ghost;
        const step = (el, frames, ms, easing = 'ease-in-out') =>
            this.stopped ? null : el.animate(frames, { duration: ms, easing, fill: 'forwards' }).finished.catch(() => {});

        // Hand kommt, greift (drückt kurz), zieht die Kopie zum Kreis, lässt los
        await step(hand, [{ opacity: 0, transform: this.at(near, hand) }, { opacity: 1, transform: this.at(from, hand) }], 500, 'ease-out');
        ghost.style.transform = this.at(from, ghost);
        await Promise.all([
            step(hand, [{ transform: this.at(from, hand) }, { transform: `${this.at(from, hand)} scale(0.88)` }], 180),
            step(ghost, [{ opacity: 0 }, { opacity: 0.75 }], 180),
        ]);
        await Promise.all([
            step(hand, [{ transform: `${this.at(from, hand)} scale(0.88)` }, { transform: `${this.at(to, hand)} scale(0.88)` }], 1200),
            step(ghost, [{ opacity: 0.75, transform: this.at(from, ghost) }, { opacity: 0.75, transform: this.at(to, ghost) }], 1200),
        ]);
        if (this.stopped) return;
        this.spot.classList.add('is-hint');
        await step(hand, [{ transform: `${this.at(to, hand)} scale(0.88)` }, { transform: this.at(to, hand) }], 180);
        await Promise.all([
            step(hand, [{ opacity: 1 }, { opacity: 0 }], 500, 'ease-in'),
            step(ghost, [{ opacity: 0.75 }, { opacity: 0 }], 700, 'ease-in'),
        ]);
        await wait(900);
        this.spot.classList.remove('is-hint');
    }
}
