// Stabile Adresse für den Monatsbrief St. Aposteln unter der Hauptdomain:
// /downloads/monatsbrief-aposteln.pdf — analog Pfarrbrief/Highlights (s. pfarrbrief.pdf.ts,
// Handbuch 1d). Holt bei jedem Build die aktuelle Ausgabe aus dem Mediathek-Ordner
// "Astro-Upload/Monatsbrief Aposteln" (RML-Ordner-ID 205).
import type { APIRoute } from 'astro';
import { getLatestMonatsbriefAposteln } from '../../lib/wordpress.js';

export const prerender = true;

export const GET: APIRoute = async () => {
  const doc = await getLatestMonatsbriefAposteln();
  if (!doc?.source_url) {
    return new Response('Monatsbrief derzeit nicht verfügbar.', { status: 404 });
  }
  const res = await fetch(doc.source_url);
  if (!res.ok) {
    return new Response('Monatsbrief derzeit nicht verfügbar.', { status: 502 });
  }
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Monatsbrief St. Aposteln.pdf"',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
};
