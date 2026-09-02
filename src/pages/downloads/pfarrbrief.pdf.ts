// Stabile Adresse für den Pfarrbrief unter der Hauptdomain: /downloads/pfarrbrief.pdf
// ändert sich NIE, auch wenn die Sekretärin eine neue Ausgabe in einen neuen Jahr/Monats-
// Ordner in WordPress lädt (Handbuch 1d). Läuft als prerenderte Route: bei jedem Build wird
// die aktuell in WP hinterlegte Datei geholt und unter dieser Adresse "eingefroren", bis zum
// nächsten Rebuild (Webhook bei WP-Änderung, s. Handbuch 1c).
import type { APIRoute } from 'astro';
import { getLatestDokument } from '../../lib/wordpress.js';

export const prerender = true;

export const GET: APIRoute = async () => {
  const doc = await getLatestDokument('pfarrbrief');
  if (!doc?.source_url) {
    return new Response('Pfarrbrief derzeit nicht verfügbar.', { status: 404 });
  }
  const res = await fetch(doc.source_url);
  if (!res.ok) {
    return new Response('Pfarrbrief derzeit nicht verfügbar.', { status: 502 });
  }
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="sankt-bonifatius-pfarrbrief.pdf"',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
};
