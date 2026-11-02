/**
 * Screens: vorab laden, damit ein Wechsel kein Netz mehr braucht.
 * Dateien in assets/screens (WebP, 2560 × 1440, ohne den weißen Exportrand der PNGs in assets/backgrounds).
 * Die App spricht sie weiter mit ihren .png-Namen an, die Dateinamen tragen Logik (_intro, _1, _2).
 */

const NAMES = [
    'intro-background.png',
    'ant_emotion_1.png',
    'ant_emotion_2.png',
    'ant_emotion_intro.png',
    'ant_environment_1.png',
    'ant_environment_2.png',
    'ant_environment_intro.png',
    'ant_general.png',
    'ant_human.png',
    'ant_human_emotion_1.png',
    'ant_human_emotion_2.png',
    'ant_human_emotion_intro.png',
    'ant_human_environment_1.png',
    'ant_human_environment_2.png',
    'ant_human_environment_intro.png',
    'ant_human_intelligence_1.png',
    'ant_human_intelligence_2.png',
    'ant_human_intelligence_intro.png',
    'ant_intelligence_1.png',
    'ant_intelligence_2.png',
    'ant_intelligence_intro.png',
    'human_emotion_1.png',
    'human_emotion_2.png',
    'human_emotion_intro.png',
    'human_environment_1.png',
    'human_environment_2.png',
    'human_environment_intro.png',
    'human_general.png',
    'human_intelligence_1.png',
    'human_intelligence_2.png',
    'human_intelligence_intro.png',
];

const images = new Map();

export const screenExists = (file) => NAMES.includes(file);

export function getScreen(file) {
    if (!screenExists(file)) return null;
    if (!images.has(file)) {
        const img = new Image();
        img.className = 'screen';
        img.alt = '';
        img.src = `assets/screens/${file.replace('.png', '.webp')}`;
        images.set(file, img);
    }
    return images.get(file);
}

export const preloadScreens = () => NAMES.forEach(getScreen);
