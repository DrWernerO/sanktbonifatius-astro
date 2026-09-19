// API-Route für das Gästebuch der 100-Jahr-Rundgang-Seite (Prototyp, s. jubilaeum-gaestebuch.js).
import type { APIRoute } from 'astro';
import { eintragHinzufuegen, eintraegeLesen } from '../../lib/jubilaeum-gaestebuch.js';

export const prerender = false;

export const GET: APIRoute = async () => {
  const eintraege = await eintraegeLesen();
  return new Response(JSON.stringify(eintraege), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const eintrag = await eintragHinzufuegen(body);
    return new Response(JSON.stringify(eintrag), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Ungültiger Eintrag' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
