// Eigener, GA4-unabhängiger Download-Zähler für Pfarrbrief/Highlights (Handbuch 1d).
// Speicher: Netlify Blobs (im bestehenden Netlify-Konto enthalten, kein Zusatzdienst nötig).
// Zählt JEDEN Klick, unabhängig von der Cookie-Einwilligung — im Gegensatz zu GA4 „Datei-
// Downloads" (dort fehlen Besucher ohne Analytics-Zustimmung, s. Doku).
//
// Zählung erfolgt wochenweise (Kalenderwoche Montag–Sonntag, Schlüssel z. B.
// "pfarrbrief:2026-09-01" = Montag dieser Woche). Seit 2026-09-07 so, davor gab es nur einen
// einzigen Gesamtzähler pro Datei ("pfarrbrief"/"highlights") — dessen Stand wird beim ersten
// Lesen automatisch einmalig in die dann aktuelle Woche übernommen (migriereAlteGesamtzaehler),
// damit die ersten ~2 Tage Zählung (seit Start am 2026-09-05) nicht verloren gehen.
import { getStore } from '@netlify/blobs';

export const ZAEHLBARE_DATEIEN = ['pfarrbrief', 'highlights'];

function store() {
  return getStore('download-counters');
}

// Montag (UTC) der Kalenderwoche von `datum`, als "YYYY-MM-DD".
function wochenStart(datum = new Date()) {
  const d = new Date(Date.UTC(datum.getUTCFullYear(), datum.getUTCMonth(), datum.getUTCDate()));
  const tag = d.getUTCDay(); // 0 = Sonntag, 1 = Montag, ...
  const diffZuMontag = tag === 0 ? -6 : 1 - tag;
  d.setUTCDate(d.getUTCDate() + diffZuMontag);
  return d.toISOString().slice(0, 10);
}

function wochenSchluessel(datei, datum) {
  return `${datei}:${wochenStart(datum)}`;
}

async function leseZahl(s, schluessel) {
  return parseInt((await s.get(schluessel, { type: 'text' })) || '0', 10) || 0;
}

export async function zaehleDownload(datei) {
  if (!ZAEHLBARE_DATEIEN.includes(datei)) return;
  const s = store();
  const schluessel = wochenSchluessel(datei);
  const aktuell = await leseZahl(s, schluessel);
  await s.set(schluessel, String(aktuell + 1));
}

// Einmalige Migration von den alten Gesamtzählern (Schlüssel ohne Wochen-Suffix, Stand vor
// 2026-09-07) in die aktuelle Woche. Läuft bei jedem Aufruf von leseWochenZaehler(), hat aber
// nach dem ersten Mal nichts mehr zu tun (Gesamtzähler wird danach gelöscht).
async function migriereAlteGesamtzaehler(s) {
  for (const datei of ZAEHLBARE_DATEIEN) {
    const alterWert = await leseZahl(s, datei);
    if (alterWert > 0) {
      const schluessel = wochenSchluessel(datei);
      const aktuell = await leseZahl(s, schluessel);
      await s.set(schluessel, String(aktuell + alterWert));
      await s.delete(datei);
    }
  }
}

// Liefert ein Array, eine Zeile pro Kalenderwoche mit mindestens einem Download, neueste
// Woche zuerst: [{ woche: "2026-09-01", pfarrbrief: 3, highlights: 1 }, ...]
export async function leseWochenZaehler() {
  const s = store();
  await migriereAlteGesamtzaehler(s);

  const wochen = new Map();
  for (const datei of ZAEHLBARE_DATEIEN) {
    const { blobs } = await s.list({ prefix: `${datei}:` });
    for (const blob of blobs) {
      const woche = blob.key.slice(datei.length + 1);
      const wert = await leseZahl(s, blob.key);
      if (!wochen.has(woche)) wochen.set(woche, { woche, pfarrbrief: 0, highlights: 0 });
      wochen.get(woche)[datei] = wert;
    }
  }
  return [...wochen.values()].sort((a, b) => b.woche.localeCompare(a.woche));
}
