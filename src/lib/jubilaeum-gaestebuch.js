// Gästebuch für die 100-Jahr-Rundgang-Seite (/100-jahre/) — Prototyp.
// Speicher: Netlify Blobs, gleiches Prinzip wie der Download-Zähler (download-counter.js).
import { getStore } from '@netlify/blobs';

const MAX_NAME = 60;
const MAX_TEXT = 800;

function store() {
  return getStore('jubilaeum-gaestebuch');
}

export async function eintragHinzufuegen({ name, text }) {
  const sauberName = String(name || '').trim().slice(0, MAX_NAME) || 'Anonym';
  const sauberText = String(text || '').trim().slice(0, MAX_TEXT);
  if (!sauberText) throw new Error('Text fehlt');

  const eintrag = {
    name: sauberName,
    text: sauberText,
    datum: new Date().toISOString(),
  };
  const schluessel = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await store().setJSON(schluessel, eintrag);
  return eintrag;
}

// Neueste zuerst, auf die letzten 200 begrenzt (Prototyp — reicht für den Anfang).
export async function eintraegeLesen() {
  const s = store();
  const { blobs } = await s.list();
  const schluessel = blobs.map((b) => b.key).sort().reverse().slice(0, 200);
  const eintraege = await Promise.all(schluessel.map((k) => s.get(k, { type: 'json' })));
  return eintraege.filter(Boolean);
}
