// Kurzlinks für QR-Codes: sanktbonifatius.de/go/<name> (Handbuch 1h).
// Quelle der Wahrheit ist Franks Excel-Tabelle „qr-linkverzeichnis-sankt-bonifatius.xlsx"
// (OneDrive, Pastoralteam/Social Media) — eine Zeile dort = ein Eintrag hier.
//
// Spalten-Zuordnung Excel → Eintrag:
//   „Kurzlink-Name"                → Schlüssel
//   „Zielseite"                     → ziel     (Astro-Pfad, z. B. '/termine/<slug>/', oder externe
//                                               https-Adresse, z. B. WhatsApp-Kanal — dann ohne UTM)
//   „Quelle komplett"               → quelle   (utm_source, inkl. Ort, z. B. 'schaukasten-kirche')
//   „Medium"                        → medium   (utm_medium, optional, Standard 'qr')
//   „Kampagne"                      → kampagne (utm_campaign)
//   „Veranstaltung / Zweck"         → titel    (nur für die Statistikseite)
//   aktiv: true                     → Code ist wirklich gedruckt/im Umlauf; nur diese stehen oben in
//                                     der Statistik, alle anderen unter „Mögliche weitere QR-Scans"
//
// Gedruckte Codes lassen sich nicht mehr ändern → Einträge NIE löschen oder umbenennen, nur
// `ziel` anpassen, wenn sich die Zielseite ändert. Unbekannte Namen landen auf der Startseite.
export const QR_LINKS = {
  'boni-weintasting-pfarrbrief-2026': {
    titel: 'Boni Weintasting',
    ziel: '/terminkalender/', // TODO: auf /termine/<slug>/ umstellen, sobald der Termin in WP steht
    quelle: 'pfarrbrief',
    kampagne: 'boni-weintasting-2026-09',
  },
  'boni-weintasting-schaukasten-kirche-2026': {
    titel: 'Boni Weintasting',
    ziel: '/terminkalender/', // TODO: s. o.
    quelle: 'schaukasten-kirche',
    kampagne: 'boni-weintasting-2026-09',
  },
  'boni-wein-weinflasche-2026': {
    titel: 'Boni Wein',
    ziel: '/',
    quelle: 'weinflasche',
    kampagne: 'boni-wein-2026-10',
  },
  // Weinflaschen-Etikett, nächste Druckauflage (Auftrag Werner, 2026-10-01): direkt zum
  // WhatsApp-Kanal der Pfarrei (wie /kontakt/whatsapp-kanal/). Externes Ziel → keine UTM-Etiketten,
  // GA4 sieht diese Scans nicht; maßgeblich ist allein der eigene Zähler.
  // TODO: Zeile in Franks Excel nachtragen.
  'boniwein-whatsapp': {
    titel: 'Boni Wein – WhatsApp-Kanal',
    aktiv: true, // Werner, 2026-10-01: einziger bereits eingeführter QR-Code
    ziel: 'https://whatsapp.com/channel/0029VbB7E1CLikgAZ8cyHk1a',
    quelle: 'weinflasche',
    kampagne: 'boni-wein-2026-10',
  },
  // Brief mit QR-Code zum Flyer „Herzlich willkommen in Sankt Bonifatius" für Neuzugezogene
  // (Auftrag Werner, 2026-10-01). Ziel ist die versteckte Landingpage (Handbuch 18). Bewusst kurzer
  // Name, weil die Adresse auch abgetippt wird. TODO: Zeile in Franks Excel nachtragen.
  'willkommen': {
    titel: 'Willkommensbrief Neuzugezogene',
    ziel: '/willkommen/',
    quelle: 'brief-willkommensflyer',
    kampagne: 'willkommen-neuzugezogene-2026',
  },
};

// Vollständige Weiterleitungs-Adresse (relativ) inkl. UTM-Etiketten für GA4.
// Externe Ziele (WhatsApp o. Ä.) bleiben unverändert — UTM-Etiketten nützen dort nichts.
export function qrZiel(eintrag) {
  if (/^https?:\/\//i.test(eintrag.ziel)) return eintrag.ziel;
  const [pfad, vorhandeneParameter = ''] = eintrag.ziel.split('?');
  const params = new URLSearchParams(vorhandeneParameter);
  params.set('utm_source', eintrag.quelle);
  params.set('utm_medium', eintrag.medium || 'qr');
  params.set('utm_campaign', eintrag.kampagne);
  return `${pfad}?${params}`;
}
