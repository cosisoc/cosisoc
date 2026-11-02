/**
 * Tier-Definitionen und Metadaten
 * 
 * Jedes Tier hat:
 * - id: eindeutiger Identifier
 * - name: Anzeigename
 * - model3D: Pfad zum GLTF-Modell (für spätere 3D-Integration)
 * - categories: Inhalte für Intelligence, Emotion, Environment
 */

export const tiere = {
    ameise: {
        id: 'ameise',
        name: 'Ameise',
        model3D: 'assets/models/ant_brain/scene.gltf',
        categories: {
            intelligence: {
                title: 'Ameise - Intelligence',
                content: 'Ameisen zeigen bemerkenswerte kollektive Intelligenz. Sie kommunizieren über Pheromone und können komplexe Aufgaben als Kolonie lösen.'
            },
            emotion: {
                title: 'Ameise - Emotion',
                content: 'Das emotionale Leben von Ameisen ist primär auf Instinkt basiert. Sie reagieren auf chemische Signale und zeigen soziales Verhalten innerhalb ihrer Kolonie.'
            },
            environment: {
                title: 'Ameise - Environment',
                content: 'Ameisen sind in nahezu allen terrestrischen Ökosystemen zu finden. Sie bauen komplexe unterirdische Strukturen und beeinflussen ihre Umgebung aktiv.'
            }
        }
    },
    
    mensch: {
        id: 'mensch',
        name: 'Mensch',
        model3D: 'assets/models/human_brain/scene.gltf',
        categories: {
            intelligence: {
                title: 'Mensch - Intelligence',
                content: 'Menschen besitzen hochentwickelte kognitive Fähigkeiten: abstraktes Denken, Problemlösung, Sprache und kulturelle Weitergabe von Wissen.'
            },
            emotion: {
                title: 'Mensch - Emotion',
                content: 'Das menschliche Gehirn verfügt über komplexe emotionale Systeme. Limbisches System und präfrontaler Cortex ermöglichen differenzierte Gefühlsregulation.'
            },
            environment: {
                title: 'Mensch - Environment',
                content: 'Menschen haben sich an nahezu alle Klimazonen angepasst und gestalten ihre Umwelt aktiv durch Technologie und Infrastruktur.'
            }
        }
    },
    
    elefant: {
        id: 'elefant',
        name: 'Elefant',
        model3D: 'assets/models/elephant_brain/scene.gltf',
        categories: {
            intelligence: {
                title: 'Elefant - Intelligence',
                content: 'Elefanten haben ein außergewöhnlich großes Gehirn und zeigen komplexes Sozialverhalten, Werkzeuggebrauch und Selbsterkennung.'
            },
            emotion: {
                title: 'Elefant - Emotion',
                content: 'Elefanten zeigen ausgeprägte emotionale Intelligenz: Trauer, Empathie, Freude und starke soziale Bindungen charakterisieren ihr Verhalten.'
            },
            environment: {
                title: 'Elefant - Environment',
                content: 'Elefanten sind Schlüsselarten in ihren Ökosystemen. Sie gestalten Landschaften durch Bewegung und Nahrungsaufnahme und beeinflussen andere Arten.'
            }
        }
    },
    
    vogel: {
        id: 'vogel',
        name: 'Vogel',
        model3D: 'assets/models/scarlet_macaw_endocast_mobile_-_ouvc_10633/scene.gltf',
        categories: {
            intelligence: {
                title: 'Vogel - Intelligence',
                content: 'Vögel, besonders Raben und Papageien, zeigen erstaunliche kognitive Fähigkeiten: Werkzeuggebrauch, Planung und komplexe Kommunikation.'
            },
            emotion: {
                title: 'Vogel - Emotion',
                content: 'Vögel haben ein entwickeltes limbisches System. Sie zeigen Partnerbindungen, territoriales Verhalten und können Freude durch Gesang ausdrücken.'
            },
            environment: {
                title: 'Vogel - Environment',
                content: 'Vögel bewohnen nahezu alle Lebensräume der Erde. Ihre Fähigkeit zu fliegen ermöglicht Migration über große Distanzen und Anpassung an wechselnde Bedingungen.'
            }
        }
    }
};
