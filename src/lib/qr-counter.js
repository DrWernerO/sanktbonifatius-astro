// Eigener, GA4-unabhängiger Zähler für QR-Kurzlinks /go/<name> (Handbuch 1h), nach dem Muster
// von download-counter.js. Speicher: Netlify Blobs, Store `qr-scans`.
// Zählt JEDEN Aufruf, unabhängig von der Cookie-Einwilligung — über GA4 allein fehlten gerade
// Handy-Scans, bei denen das Banner abgelehnt oder weggeklickt wird. Kein Personenbezug:
// gespeichert wird nur eine Zahl pro Kurzlink und Monat (Schlüssel z. B.
// "boni-wein-weinflasche-2026:2026-10").
import { getStore } from '@netlify/blobs';
import { QR_LINKS } from './qr-links.js';

function store() {
  return getStore('qr-scans');
}

async function leseZahl(s, schluessel) {
  return parseInt((await s.get(schluessel, { type: 'text' })) || '0', 10) || 0;
}

export async function zaehleScan(name) {
  if (!QR_LINKS[name]) return;
  const s = store();
  const schluessel = `${name}:${new Date().toISOString().slice(0, 7)}`;
  await s.set(schluessel, String((await leseZahl(s, schluessel)) + 1));
}

// Eine Zeile pro Kurzlink aus QR_LINKS (auch ohne Scans), mit Summe je Jahr und je Monat:
// [{ name, titel, quelle, kampagne, jahre: { 2026: 13 }, monate: { '2026-10': 13 }, gesamt: 13 }, ...]
export async function leseQrZaehler() {
  const s = store();
  const { blobs } = await s.list();
  const zeilen = new Map(
    Object.entries(QR_LINKS).map(([name, e]) => [
      name,
      { name, titel: e.titel, quelle: e.quelle, kampagne: e.kampagne, aktiv: !!e.aktiv, jahre: {}, monate: {}, gesamt: 0 },
    ])
  );
  for (const blob of blobs) {
    const trenn = blob.key.lastIndexOf(':');
    const zeile = zeilen.get(blob.key.slice(0, trenn));
    if (!zeile) continue;
    const monat = blob.key.slice(trenn + 1); // "YYYY-MM"
    const jahr = monat.slice(0, 4);
    const wert = await leseZahl(s, blob.key);
    zeile.jahre[jahr] = (zeile.jahre[jahr] || 0) + wert;
    zeile.monate[monat] = (zeile.monate[monat] || 0) + wert;
    zeile.gesamt += wert;
  }
  return [...zeilen.values()];
}
