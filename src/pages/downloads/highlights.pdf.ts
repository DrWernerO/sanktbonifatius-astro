// Stabile Adresse für die Bonifatius Highlights unter der Hauptdomain:
// /downloads/highlights.pdf — Details siehe pfarrbrief.pdf.ts.
// X-Robots-Tag: noindex (Auftrag Werner, 2026-09-22) — Google soll die eigene Landingpage
// /downloads/bonifatius-highlights/ ranken statt dieser PDF direkt. Für Netlify-Auslieferung
// zusätzlich in public/_headers erzwungen (gilt hier nur lokal im Dev-Server).
import type { APIRoute } from 'astro';
import { getLatestDokument, BUILD_UA } from '../../lib/wordpress.js';

export const prerender = true;

export const GET: APIRoute = async () => {
  const doc = await getLatestDokument('highlights');
  if (!doc?.source_url) {
    return new Response('Highlights derzeit nicht verfügbar.', { status: 404 });
  }
  // BUILD_UA zwingend — Begründung siehe pfarrbrief.pdf.ts.
  const res = await fetch(doc.source_url, { headers: { 'User-Agent': BUILD_UA } });
  if (!res.ok) {
    return new Response('Highlights derzeit nicht verfügbar.', { status: 502 });
  }
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Sankt Bonifatius Highlights.pdf"',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
};
