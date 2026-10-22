// YouTube-Vorschaubilder der News-Kacheln (Startseite, Boniblog) unter eigener Adresse:
// /yt-vorschau/<video-id>.jpg. Gleiches Prinzip wie downloads/highlights-cover.jpg.ts: Das Bild
// wird beim Build von img.youtube.com geholt und unter der Hauptdomain eingefroren. Besucher
// laden es von sanktbonifatius.de und bauen keine Verbindung zu Google auf, bevor sie ein Video
// starten (Datenschutzerklärung C.6). Neues Video-Pin in WordPress → nächster Rebuild → neues Bild.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getYoutubeVorschauIds } from '../../lib/wordpress.js';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = await getYoutubeVorschauIds();
  return ids.map((id) => ({ params: { id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const res = await fetch(`https://img.youtube.com/vi/${params.id}/hqdefault.jpg`);
  if (!res.ok) {
    return new Response('Vorschaubild derzeit nicht verfügbar.', { status: 404 });
  }
  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
};
