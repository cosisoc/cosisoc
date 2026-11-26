// Seitentexte. Alles in [Klammern] ist Platzhalter.
export const copy = {
  de: {
    name: 'Cosima Bühler',
    logo: 'COSI',
    headline: ['Hey, ich bin Cosima,', 'Interaktions-', 'gestalterin.'],
    subline: 'aktuell studiere ich im 4. Semester an der Hochschule für Gestaltung',
    photo: 'Porträt von Cosima Bühler',
    work: { label: '01 - Hauptprojekte', title: 'Projekte, auf die ich stolz bin' },
    side: { label: '02 - Sidequests', title: 'Nebenprojekte' },
    about: {
      label: '03 - Über mich',
      title: 'Gute Gestaltung beginnt für mich mit der richtigen Frage.',
      // Erster Absatz groß als Einstieg, die übrigen als Fließtext
      text: [
        'Ich studiere Interaktionsgestaltung an der HfG und bin im 4. Semester. Schon bevor ich wusste, dass es dafür einen Namen gibt, ist mir aufgefallen, wenn etwas besonders gut oder besonders schlecht gestaltet war. Aktuelles Beispiel: meine Mikrowelle, mit der ich einfach nicht klarkomme.',
        'Am meisten Spaß macht mir der Prozess selbst: Fragen stellen, recherchieren, ein Problem wirklich verstehen und daraus eine schlüssige Lösung entwickeln. Erkenntnisse aus User Research und Tests fließen dabei immer wieder zurück ins Konzept. Ideen bringe ich früh in Prototypen, um sie sichtbar und testbar zu machen. Vieles erarbeite ich mir erst im Prozess, und genau das liegt mir.',
        'Mich interessiert, welche Wirkung Gestaltung auf Menschen und Gesellschaft hat, zum Beispiel bei Themen wie Einsamkeit und Gemeinschaft.',
        'Außerhalb der Projekte bin ich gern draußen und zeichne, was mir unterwegs auffällt. Und ich verbringe viel Zeit im Prototyping Lab der HfG, wo man Neues ausprobiert, sich über Projekte austauscht und auch mal eine Nachtschicht einlegt.',
      ],
    },
    // Mail und LinkedIn stehen unten im Über-mich-Abschnitt; linkedin leer = Link wird nicht angezeigt
    contact: { mail: 'cosimabuehler06@gmail.com', linkedin: '' },
  },
  en: {
    name: 'Cosima Bühler',
    logo: 'COSI',
    headline: ['Hey, I’m Cosima,', 'interaction', 'designer.'],
    subline: 'currently in my 4th semester at the Hochschule für Gestaltung',
    photo: 'Portrait of Cosima Bühler',
    work: { label: '01 - Main Projects', title: 'Projects I’m proud of' },
    side: { label: '02 - Sidequests', title: 'Side projects' },
    about: {
      label: '03 - About me',
      title: 'For me, good design starts with the right question.',
      text: [
        'I study Interaction Design at the HfG and am in my 4th semester. Even before I knew there was a name for it, I noticed when something was designed especially well or especially badly. Current example: my microwave, which I just can’t get along with.',
        'What I enjoy most is the process itself: asking questions, researching, really understanding a problem and developing a coherent solution from it. Insights from user research and testing keep feeding back into the concept. I turn ideas into prototypes early to make them visible and testable. A lot of things I only work out during the process, and that’s exactly what suits me.',
        'I’m interested in the effect design has on people and society, for example on topics like loneliness and community.',
        'Outside of projects, I like being outdoors and drawing what catches my eye along the way. And I spend a lot of time in the HfG’s Prototyping Lab, where people try out new things, talk about their projects and sometimes pull an all-nighter.',
      ],
    },
    contact: { mail: 'cosimabuehler06@gmail.com', linkedin: '' },
  },
} as const;
