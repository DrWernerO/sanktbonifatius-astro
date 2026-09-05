// Eigener, GA4-unabhängiger Zähler für Pfarrbrief/Highlights-Downloads (Handbuch 1d).
// Wird per navigator.sendBeacon() aus Nav.astro angestoßen (blockiert den eigentlichen
// Download nicht). Zählt nur die feste Whitelist aus download-counter.js — kein beliebiger
// Schlüssel von außen erzeugbar.
import type { APIRoute } from 'astro';
import { zaehleDownload } from '../../lib/download-counter.js';

export const prerender = false;

const NO_CONTENT = new Response(null, {
  status: 204,
  headers: { 'Cache-Control': 'no-store' },
});

const handle: APIRoute = async ({ url }) => {
  const datei = url.searchParams.get('file') || '';
  await zaehleDownload(datei);
  return NO_CONTENT;
};

export const GET = handle;
export const POST = handle;
