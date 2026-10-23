// Seitentexte für Landing und About. Alles in [Klammern] ist Platzhalter.
export const copy = {
  de: {
    name: 'Cosima Bühler',
    role: 'Interaction Design Studentin · HfG Schwäbisch Gmünd',
    claim: '[CLAIM – z. B. „Interaction Design zwischen Bildschirm und Hand.“]',
    interestsTitle: 'Mich interessiert',
    interests: ['Tangible Interfaces', 'UX/UI & Product Design', 'Invention Design', 'Speculative / Social Design', 'Neue KI-Tools'],
    photo: '[Foto – Perspektive]',
    about: {
      intro: '[Kurzer Text über mich: was mich antreibt, wie ich zum Interaction Design gekommen bin.]',
      skillsTitle: 'Skills',
      skills: ['Konzeption', 'Interaktionsdesign', 'UI Design', 'Prototyping', '[weitere Skills]'],
      toolsTitle: 'Tools',
      tools: ['Figma', '[weitere Tools]'],
      contactTitle: 'Kontakt',
      mail: 'mail@example.com',
    },
    legal: {
      imprint: { title: 'Impressum', body: '[Impressum-Text hier einsetzen, z. B. aus einem Generator. Angaben nach § 5 DDG.]' },
      privacy: { title: 'Datenschutz', body: '[Datenschutzerklärung hier einsetzen, z. B. aus einem Generator.]' },
    },
  },
  en: {
    name: 'Cosima Bühler',
    role: 'Interaction Design Student · HfG Schwäbisch Gmünd',
    claim: '[EN] [CLAIM – e.g. “Interaction design between screen and hand.”]',
    interestsTitle: 'Interested in',
    interests: ['Tangible Interfaces', 'UX/UI & Product Design', 'Invention Design', 'Speculative / Social Design', 'New AI tools'],
    photo: '[Photo – perspective]',
    about: {
      intro: '[EN] [Short text about me: what drives me, how I got into interaction design.]',
      skillsTitle: 'Skills',
      skills: ['Concept development', 'Interaction design', 'UI design', 'Prototyping', '[more skills]'],
      toolsTitle: 'Tools',
      tools: ['Figma', '[more tools]'],
      contactTitle: 'Contact',
      mail: 'mail@example.com',
    },
    legal: {
      imprint: { title: 'Imprint', body: '[EN] [Insert imprint text here.]' },
      privacy: { title: 'Privacy', body: '[EN] [Insert privacy policy here.]' },
    },
  },
} as const;
