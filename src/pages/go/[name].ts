// QR-Kurzlinks: sanktbonifatius.de/go/<name> → Zielseite mit UTM-Etiketten (Handbuch 1h).
// Läuft bei jedem Aufruf als Netlify-Function (prerender = false): zählt den Scan
// (qr-counter.js) und leitet dann weiter. Bewusst 302 statt 301 — Handys/Browser sollen sich
// das Ziel nicht merken, damit `ziel` in qr-links.js später geändert werden kann, ohne dass
// gedruckte Codes veralten. Unbekannte Namen → Startseite statt 404 (Weinflaschen,
// Schaukästen bleiben jahrelang im Umlauf).
import type { APIRoute } from 'astro';
import { QR_LINKS, qrZiel } from '../../lib/qr-links.js';
import { zaehleScan } from '../../lib/qr-counter.js';

export const prerender = false;

function weiter(ziel: string) {
  return new Response(null, {
    status: 302,
    headers: { Location: ziel, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

export const GET: APIRoute = async ({ params }) => {
  const name = (params.name || '').toLowerCase();
  const eintrag = QR_LINKS[name];
  if (!eintrag) return weiter('/');

  // Zählen darf die Weiterleitung nie verhindern (z. B. lokal ohne Netlify-Blobs-Kontext).
  try {
    await zaehleScan(name);
  } catch (err) {
    console.error('[go] Zählung fehlgeschlagen:', name, err);
  }
  return weiter(qrZiel(eintrag));
};
