// Eigener, GA4-unabhängiger Download-Zähler für Pfarrbrief/Highlights (Handbuch 1d).
// Speicher: Netlify Blobs (im bestehenden Netlify-Konto enthalten, kein Zusatzdienst nötig).
// Zählt JEDEN Klick, unabhängig von der Cookie-Einwilligung — im Gegensatz zu GA4 „Datei-
// Downloads" (dort fehlen Besucher ohne Analytics-Zustimmung, s. Doku).
import { getStore } from '@netlify/blobs';

export const ZAEHLBARE_DATEIEN = ['pfarrbrief', 'highlights'];

function store() {
  return getStore('download-counters');
}

export async function zaehleDownload(datei) {
  if (!ZAEHLBARE_DATEIEN.includes(datei)) return;
  const s = store();
  const aktuell = parseInt((await s.get(datei, { type: 'text' })) || '0', 10) || 0;
  await s.set(datei, String(aktuell + 1));
}

export async function leseDownloadZaehler() {
  const s = store();
  const werte = await Promise.all(
    ZAEHLBARE_DATEIEN.map(async (datei) => {
      const wert = parseInt((await s.get(datei, { type: 'text' })) || '0', 10) || 0;
      return [datei, wert];
    })
  );
  return Object.fromEntries(werte);
}
