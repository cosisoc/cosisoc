/**
 * Hinweis unter dem Tisch: sagt, was man als Nächstes tun kann.
 */

const HINTS = {
    start: 'Drag a figure onto a circle',
    turn: 'Turn the figure: drag the handle around it',
    more: 'Try a topic on the right, or add the second figure',
    page: 'Turn the figure on the topic to see the next page',
};

export function updateHint(hintEl, figures, hasTurned) {
    const placed = figures.some((f) => f.point);
    const onTopic = figures.some((f) => f.point >= 3);
    if (!placed) hintEl.textContent = HINTS.start;
    else if (onTopic) hintEl.textContent = HINTS.page;
    else hintEl.textContent = hasTurned ? HINTS.more : HINTS.turn;
}
