// Stabile Adresse für die Bonifatius Highlights unter der Hauptdomain:
// /downloads/highlights.pdf — Details siehe pfarrbrief.pdf.ts.
import type { APIRoute } from 'astro';
import { getLatestDokument } from '../../lib/wordpress.js';

export const prerender = true;

export const GET: APIRoute = async () => {
  const doc = await getLatestDokument('highlights');
  if (!doc?.source_url) {
    return new Response('Highlights derzeit nicht verfügbar.', { status: 404 });
  }
  const res = await fetch(doc.source_url);
  if (!res.ok) {
    return new Response('Highlights derzeit nicht verfügbar.', { status: 502 });
  }
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="sankt-bonifatius-highlights.pdf"',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
};
