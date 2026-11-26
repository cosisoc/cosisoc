/**
 * Figure Drag (Web-Version)
 * Ersetzt den echten Tisch: Figuren werden vom Podest auf die Kreise gezogen und am Griff gedreht.
 * Schickt dieselben Events wie früher der Arduino ({ point, animal, rotation, action }).
 * Zwei Hauptkreise unten (data-point="main", data-only = welche Figur): erste Figur dort ist Punkt 1, zweite Punkt 2,
 * egal auf welchem Kreis. Themen sind Punkte 3–5. Pro Kreis eine Figur, nie zwei Themen gleichzeitig.
 * Figuren mit .is-disabled (Papagei) liegen nur auf dem Podest.
 */

import { updateHint } from './hints.js';
import { DragHint } from './dragHint.js';

export class FigureDrag {
    constructor(tangibleInterface) {
        this.tangible = tangibleInterface;
        this.table = document.getElementById('table');
        this.hint = document.getElementById('hint');
        this.spots = [...document.querySelectorAll('.spot')];
        this.figures = [...document.querySelectorAll('.figure:not(.is-disabled)')].map((el) => ({
            el, animal: el.dataset.animal, spot: null, point: null, angle: 0, sent: 0, dragging: false, raf: 0,
        }));
        this.parked = [...document.querySelectorAll('.figure.is-disabled')].map((el) => ({ el, animal: el.dataset.animal }));
        this.hasTurned = false;
        this.figures.forEach((f) => this.bind(f));
        // Beim Laden und bei Größenänderungen stehen die Figuren sofort an ihrem Platz, statt hineinzufliegen
        new ResizeObserver(() => this.layout(true)).observe(this.table);
        this.layout(true);
        // Hand zeigt einmal vor, wie man die Menschenfigur auf ihren Kreis zieht; stoppt beim ersten eigenen Anfassen
        const human = this.figures.find((f) => f.animal === 'mensch');
        this.dragHint = new DragHint(this.table, (el) => this.center(el), human.el, document.querySelector('.spot[data-only="mensch"]'));
        this.updateSpots();
        updateHint(this.hint, this.figures, this.hasTurned);
    }

    // --- Positionen (in px relativ zum Tisch) ---
    center(el) {
        const t = this.table.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - t.left, y: r.top + r.height / 2 - t.top };
    }

    homeOf(f) {
        return this.center(document.querySelector(`.slot[data-animal="${f.animal}"]`));
    }

    moveTo(f, pos) {
        f.el.style.setProperty('--x', `${pos.x}px`);
        f.el.style.setProperty('--y', `${pos.y}px`);
    }

    // instant = ohne Bewegungs-Animation (figures.css: #table.is-snapping)
    layout(instant = false) {
        if (instant) this.table.classList.add('is-snapping');
        [...this.figures, ...this.parked].forEach((f) => {
            if (!f.dragging) this.moveTo(f, f.spot ? this.center(f.spot) : this.homeOf(f));
        });
        if (!instant) return;
        this.table.offsetWidth; // neue Position übernehmen, solange die Animation aus ist
        requestAnimationFrame(() => this.table.classList.remove('is-snapping'));
    }

    // --- Regeln ---
    isTopic(spot) {
        return spot.dataset.point !== 'main';
    }

    allowed(f, spot) {
        if (spot.dataset.only && spot.dataset.only !== f.animal) return false;
        const other = this.figures.find((o) => o !== f);
        if (other.spot === spot) return false;
        return !(this.isTopic(spot) && other.point >= 3);
    }

    // Kreise ausgrauen: beim Ziehen alle, die für diese Figur verboten sind; sonst die übrigen Themen
    updateSpots(dragged = null) {
        const topicTaken = this.figures.some((f) => f.point >= 3);
        this.spots.forEach((s) => {
            const taken = this.figures.some((f) => f.spot === s && f !== dragged);
            const blocked = dragged ? !this.allowed(dragged, s) : this.isTopic(s) && topicTaken && !taken;
            s.classList.toggle('is-taken', taken);
            s.classList.toggle('is-blocked', blocked);
        });
    }

    spotAt(pos, f) {
        let best = null;
        let bestDist = Infinity;
        this.spots.forEach((s) => {
            if (!this.allowed(f, s)) return;
            const c = this.center(s);
            const d = Math.hypot(c.x - pos.x, c.y - pos.y);
            if (d < s.offsetWidth * 0.8 && d < bestDist) { best = s; bestDist = d; }
        });
        return best;
    }

    // --- Events an die App ---
    // Umsetzen ohne Zwischenschritt „leer“: place() räumt den alten Punkt selbst ab
    setSpot(f, spot) {
        const other = this.figures.find((o) => o !== f);
        const point = !spot ? null : this.isTopic(spot) ? Number(spot.dataset.point) : other.point === 1 ? 2 : 1;
        const from = f.point;
        f.spot = spot;
        f.point = point;
        f.angle = f.sent = 0;
        f.el.style.setProperty('--angle', '0deg');
        f.el.classList.toggle('is-placed', Boolean(point));
        if (!point) this.tangible.handleEvent({ point: from, action: 'remove' });
        else if (point !== from) this.tangible.handleEvent({ point, animal: f.animal, rotation: 0, action: 'place' });
    }

    // Höchstens ein Dreh-Event pro Frame, nur bei ganzen Grad-Änderungen (0–359 wie der Drehgeber).
    // Auf Themen erst beim Einrasten (snap), damit die Seite nicht beim Drehen hin- und herspringt.
    queueRotate(f) {
        if (f.raf) return;
        f.raf = requestAnimationFrame(() => {
            f.raf = 0;
            const deg = Math.round(((f.angle % 360) + 360) % 360);
            if (!f.point || f.point >= 3 || deg === f.sent) return;
            f.sent = deg;
            this.tangible.handleEvent({ point: f.point, animal: f.animal, rotation: deg, action: 'rotate' });
        });
    }

    // Themen rasten alle 90° ein (wie die Magnete am Tisch); die Raste bestimmt die Seite
    snap(f) {
        f.angle = Math.round(f.angle / 90) * 90;
        f.el.style.setProperty('--angle', `${f.angle}deg`);
        f.sent = ((f.angle % 360) + 360) % 360;
        this.tangible.handleEvent({ point: f.point, animal: f.animal, rotation: f.sent, action: 'rotate' });
    }

    // --- Maus / Touch ---
    bind(f) {
        f.el.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            this.dragHint.stop();
            f.el.setPointerCapture(e.pointerId);
            if (f.point && e.target.closest('.ring')) this.turn(f, e);
            else this.drag(f, e);
        });
    }

    track(f, onMove, onEnd) {
        const end = () => {
            f.el.removeEventListener('pointermove', onMove);
            f.el.removeEventListener('pointerup', end);
            f.el.removeEventListener('pointercancel', end);
            onEnd();
        };
        f.el.addEventListener('pointermove', onMove);
        f.el.addEventListener('pointerup', end);
        f.el.addEventListener('pointercancel', end);
    }

    drag(f, e) {
        const t = this.table.getBoundingClientRect();
        const start = this.center(f.el);
        const offset = { x: e.clientX - t.left - start.x, y: e.clientY - t.top - start.y };
        let target = null;
        f.dragging = true;
        f.el.classList.add('is-dragging');
        this.table.classList.add('is-dragging');
        this.updateSpots(f);

        this.track(f, (ev) => {
            const rect = this.table.getBoundingClientRect();
            const pos = { x: ev.clientX - rect.left - offset.x, y: ev.clientY - rect.top - offset.y };
            this.moveTo(f, pos);
            target = this.spotAt(pos, f);
            this.spots.forEach((s) => s.classList.toggle('is-target', s === target));
        }, () => {
            f.dragging = false;
            f.el.classList.remove('is-dragging');
            this.table.classList.remove('is-dragging');
            this.spots.forEach((s) => s.classList.remove('is-target'));
            if (target !== f.spot) this.setSpot(f, target);
            this.layout();
            this.updateSpots();
            updateHint(this.hint, this.figures, this.hasTurned);
        });
    }

    turn(f, e) {
        const angleOf = (ev) => {
            const r = f.el.getBoundingClientRect();
            return Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
        };
        let last = angleOf(e);
        f.el.classList.add('is-turning');

        this.track(f, (ev) => {
            const a = angleOf(ev);
            const delta = ((a - last + 540) % 360) - 180;
            last = a;
            f.angle += delta;
            f.el.style.setProperty('--angle', `${f.angle}deg`);
            this.queueRotate(f);
            if (!this.hasTurned && Math.abs(f.angle) > 20) {
                this.hasTurned = true;
                this.table.classList.add('has-turned');
                updateHint(this.hint, this.figures, this.hasTurned);
            }
        }, () => {
            f.el.classList.remove('is-turning');
            if (f.point >= 3) this.snap(f);
        });
    }
}
