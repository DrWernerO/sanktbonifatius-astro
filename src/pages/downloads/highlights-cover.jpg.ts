// Stabile Adresse für das Deckblatt der aktuellen Bonifatius Highlights:
// /downloads/highlights-cover.jpg — Hero-Bild der Landingpage /downloads/bonifatius-highlights/.
// Gleiches Prinzip wie highlights.pdf.ts: holt beim Build das von WordPress automatisch erzeugte
// Vorschaubild (getHighlightsCover() in wordpress.js) und friert es unter der Hauptdomain ein —
// keine WP-Bild-URL im Frontend (Handbuch 1g). Neue Ausgabe hochladen → nächster Rebuild
// (functions.php-Hook auf „highlights" im Medientitel, Handbuch 1d) → neues Cover.
import type { APIRoute } from 'astro';
import { getHighlightsCover, BUILD_UA } from '../../lib/wordpress.js';

export const prerender = true;

export const GET: APIRoute = async () => {
  const cover = await getHighlightsCover();
  if (!cover) {
    return new Response('Cover derzeit nicht verfügbar.', { status: 404 });
  }
  const res = await fetch(cover.url, { headers: { 'User-Agent': BUILD_UA } });
  if (!res.ok) {
    return new Response('Cover derzeit nicht verfügbar.', { status: 502 });
  }
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
};
