// Impressum und Datenschutz (DE/EN).
import { copy } from './copy';

// HIER AUSFÜLLEN. Die Mail-Adresse steht in copy.ts unter contact.mail.
const angaben = {
  name: copy.de.name,
  strasse: '[Straße und Hausnummer]',
  ort: '[PLZ und Ort]',
  telefon: '[Telefonnummer – optional, sonst leere Anführungszeichen]',
  hoster: '[Name und Anschrift des Hosting-Anbieters]',
  aufsicht: '[Datenschutz-Aufsichtsbehörde deines Bundeslandes, Name und Anschrift]',
};

const mail = copy.de.contact.mail;
const anschrift = `${angaben.name}\n${angaben.strasse}\n${angaben.ort}`;
const kontakt = (label: string, phone: string) =>
  [`${label}: ${mail}`, angaben.telefon && `${phone}: ${angaben.telefon}`].filter(Boolean).join('\n');

export const legal = {
  de: {
    imprint: {
      title: 'Impressum',
      sections: [
        { heading: 'Angaben gemäß § 5 DDG', text: [anschrift] },
        { heading: 'Kontakt', text: [kontakt('E-Mail', 'Telefon')] },
        { heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV', text: [anschrift] },
        {
          heading: 'Haftung für Inhalte',
          text: ['Ich erstelle die Inhalte dieser Website mit Sorgfalt, kann für ihre Richtigkeit, Vollständigkeit und Aktualität aber keine Gewähr übernehmen. Als Diensteanbieterin bin ich nach den allgemeinen Gesetzen für eigene Inhalte verantwortlich. Sobald ich von Rechtsverletzungen erfahre, entferne ich die betreffenden Inhalte umgehend.'],
        },
        {
          heading: 'Haftung für Links',
          text: ['Diese Website enthält Links zu externen Websites, auf deren Inhalte ich keinen Einfluss habe. Für diese Inhalte ist der jeweilige Anbieter verantwortlich. Sobald ich von Rechtsverletzungen erfahre, entferne ich die betreffenden Links umgehend.'],
        },
        {
          heading: 'Urheberrecht',
          text: ['Die von mir erstellten Inhalte auf dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der gesetzlichen Grenzen bedürfen meiner schriftlichen Zustimmung. Inhalte Dritter sind als solche gekennzeichnet.'],
        },
      ],
    },
    privacy: {
      title: 'Datenschutz',
      sections: [
        { heading: 'Verantwortliche', text: [`${anschrift}\nE-Mail: ${mail}`] },
        {
          heading: 'Das Wichtigste in Kürze',
          text: ['Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Dienste. Schriften und Programmbibliotheken liegen auf dem eigenen Server, es werden dafür keine Daten an Dritte übertragen. Fremde Inhalte werden nur geladen, wenn du den Figma-Prototyp startest (siehe unten).'],
        },
        {
          heading: 'Hosting und Server-Logdateien',
          text: [
            `Diese Website wird gehostet bei: ${angaben.hoster}. Beim Aufruf der Website verarbeitet der Hoster automatisch technische Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge, Referrer-URL sowie Browser und Betriebssystem.`,
            'Das ist technisch nötig, um die Website auszuliefern und ihre Sicherheit zu gewährleisten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden nur so lange gespeichert, wie es für diese Zwecke erforderlich ist. Soweit der Hoster Daten außerhalb der EU verarbeitet, geschieht das auf Grundlage geeigneter Garantien nach Art. 44 ff. DSGVO.',
          ],
        },
        {
          heading: 'Kontakt per E-Mail',
          text: ['Wenn du mir eine E-Mail schreibst, verarbeite ich deine Adresse und den Inhalt der Nachricht, um dir zu antworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, bei einer Anfrage zu einer möglichen Zusammenarbeit oder Anstellung Art. 6 Abs. 1 lit. b DSGVO. Ich lösche die Daten, sobald sie nicht mehr benötigt werden und keine gesetzlichen Aufbewahrungspflichten bestehen.'],
        },
        {
          heading: 'Figma-Prototyp',
          text: ['Auf einer Projektseite lässt sich ein interaktiver Prototyp von Figma, Inc. (USA) starten. Erst nach dem Klick auf den Start-Knopf wird er geladen. Dabei werden unter anderem deine IP-Adresse und technische Daten an Figma übertragen, auch in die USA, und Figma kann Cookies setzen. Rechtsgrundlage ist deine Einwilligung durch den Klick (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Du kannst sie widerrufen, indem du die Seite neu lädst und den Prototyp nicht erneut startest. Mehr dazu: https://www.figma.com/privacy/'],
        },
        {
          heading: 'Speicherung im Browser',
          text: ['Die Live-Demo „Anatomy of Minds“ speichert die eingestellte Farbpalette im lokalen Speicher deines Browsers. Dieser Wert enthält keine personenbezogenen Daten, wird nicht an den Server übertragen und dient nur der Darstellung der Demo. Du kannst ihn jederzeit über die Browser-Einstellungen löschen.'],
        },
        {
          heading: 'Deine Rechte',
          text: [
            'Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung sowie auf Datenübertragbarkeit (Art. 15–20 DSGVO). Einer Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO kannst du widersprechen (Art. 21 DSGVO), eine Einwilligung kannst du jederzeit für die Zukunft widerrufen (Art. 7 Abs. 3 DSGVO). Dafür reicht eine E-Mail an mich.',
            `Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), zum Beispiel bei der für mich zuständigen: ${angaben.aufsicht}.`,
          ],
        },
      ],
    },
  },
  en: {
    imprint: {
      title: 'Imprint',
      sections: [
        { heading: 'Information pursuant to § 5 DDG (German Digital Services Act)', text: [anschrift] },
        { heading: 'Contact', text: [kontakt('Email', 'Phone')] },
        { heading: 'Responsible for content pursuant to § 18 (2) MStV', text: [anschrift] },
        {
          heading: 'Liability for content',
          text: ['I create the content of this website with care but cannot guarantee that it is accurate, complete or up to date. As a service provider, I am responsible for my own content under general law. If I become aware of any legal violations, I will remove the content in question immediately.'],
        },
        {
          heading: 'Liability for links',
          text: ['This website contains links to external websites whose content I have no control over. The respective provider is responsible for that content. If I become aware of any legal violations, I will remove the links in question immediately.'],
        },
        {
          heading: 'Copyright',
          text: ['The content I created on this website is subject to German copyright law. Reproduction, editing and distribution beyond the limits of the law require my written consent. Third-party content is marked as such.'],
        },
      ],
    },
    privacy: {
      title: 'Privacy',
      sections: [
        { heading: 'Controller', text: [`${anschrift}\nEmail: ${mail}`] },
        {
          heading: 'Summary',
          text: ['This website sets no cookies and uses no analytics or tracking services. Fonts and code libraries are hosted on this website’s own server, so no data is sent to third parties for them. Third-party content only loads if you start the Figma prototype (see below).'],
        },
        {
          heading: 'Hosting and server log files',
          text: [
            `This website is hosted by: ${angaben.hoster}. When you visit the website, the host automatically processes technical data: IP address, date and time, page requested, amount of data transferred, referrer URL, browser and operating system.`,
            'This is technically necessary to deliver the website and keep it secure. The legal basis is Art. 6(1)(f) GDPR. The data is stored only as long as necessary for these purposes. Where the host processes data outside the EU, this is based on appropriate safeguards under Art. 44 et seq. GDPR.',
          ],
        },
        {
          heading: 'Contact by email',
          text: ['If you email me, I process your address and the content of your message in order to reply. The legal basis is Art. 6(1)(f) GDPR, or Art. 6(1)(b) GDPR for enquiries about possible collaboration or employment. I delete the data once it is no longer needed and no statutory retention obligations apply.'],
        },
        {
          heading: 'Figma prototype',
          text: ['One project page lets you start an interactive prototype by Figma, Inc. (USA). It only loads after you click the start button. Your IP address and technical data, among other things, are then sent to Figma, including to the USA, and Figma may set cookies. The legal basis is your consent given by clicking (Art. 6(1)(a) GDPR, § 25(1) TDDDG). You can withdraw it by reloading the page and not starting the prototype again. More information: https://www.figma.com/privacy/'],
        },
        {
          heading: 'Storage in your browser',
          text: ['The “Anatomy of Minds” live demo saves the selected colour palette in your browser’s local storage. This value contains no personal data, is not sent to the server and is only used to display the demo. You can delete it at any time in your browser settings.'],
        },
        {
          heading: 'Your rights',
          text: [
            'You have the right to access, rectification, erasure, restriction of processing and data portability (Art. 15–20 GDPR). You may object to processing based on Art. 6(1)(f) GDPR (Art. 21 GDPR) and withdraw consent at any time with effect for the future (Art. 7(3) GDPR). An email to me is enough.',
            `You may also lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), for example the one responsible for me: ${angaben.aufsicht}.`,
          ],
        },
      ],
    },
  },
} as const;
