// Zählt einen Abruf der PDF-Datei selbst (Pfarrbrief/Highlights), unabhängig davon, woher der
// Besucher kam. Wird NICHT vom Browser, sondern von der Netlify Edge Function
// netlify/edge-functions/count-download.ts aufgerufen (Handbuch 1d). Nur POST, damit
// Vorab-Lader/Crawler den Zähler nicht per GET hochtreiben. Zählt nur die feste Whitelist aus
// download-counter.js.
import type { APIRoute } from 'astro';
import { zaehleAbruf } from '../../lib/download-counter.js';

export const prerender = false;

export const POST: APIRoute = async ({ url }) => {
  await zaehleAbruf(url.searchParams.get('file') || '');
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
};
