// Better Together — zentraler Schalter für die Unterseite + nächster Termin (clientseitig).
//
// Stand 2026-11-03 (Frank): Die Unterseite /bonfamily/better-together/ ist online, aber VERSTECKT,
// weil noch nicht alle Foto-Freigaben vorliegen: noindex, nicht in der Sitemap, und alle internen
// Links (BonFamily-Treffpunkte-Kachel, Schnell-Link auf /bonfamily/familientreffpunkte/) führen
// stattdessen zum nächsten Better-Together-Termin im Terminkalender.
// Freischalten: BT_SEITE_OEFFENTLICH = true setzen und den Sitemap-Filter in astro.config.mjs
// für '/bonfamily/better-together/' entfernen.
export const BT_SEITE_OEFFENTLICH = false;
export const BT_URL = '/bonfamily/better-together/';
// Link-Ziel beim Bauen. Solange die Seite versteckt ist: Terminkalender als Rückfall, den
// verlinkeBtTermin() im Browser durch den konkreten nächsten Termin ersetzt.
export const BT_LINK = BT_SEITE_OEFFENTLICH ? BT_URL : '/terminkalender/';

export type BtTermin = { pfad: string; datum: Date; thema: string };

const TITEL = /^\s*better[\s-]*together/i;

function dekodiere(html: string) {
  const t = document.createElement('textarea');
  t.innerHTML = html;
  return t.value;
}

// Nächster Termin: Kategorie BonFamily (2586) + Titel beginnt mit „Better together"
// (gleiche Erkennung wie BtNaechstes.astro). Ohne Treffer oder bei Fehler: null.
export async function naechsterBtTermin(): Promise<BtTermin | null> {
  const d = new Date();
  const heute = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  try {
    const res = await fetch('/wp-proxy/wp-json/wp/v2/event?per_page=100&event-category=2586&_fields=link,title,event_meta');
    if (!res.ok) return null;
    const liste: { link: string; title: { rendered: string }; event_meta?: Record<string, string> }[] = await res.json();
    const t = liste
      .filter((e) => e.event_meta?.start_date && e.event_meta.start_date >= heute && TITEL.test(dekodiere(e.title.rendered)))
      .sort((a, b) => a.event_meta!.start_date.localeCompare(b.event_meta!.start_date))[0];
    if (!t) return null;
    const s = t.event_meta!.start_date;
    let pfad = t.link;
    try { pfad = new URL(t.link).pathname; } catch { /* relativer Link bleibt */ }
    return {
      pfad,
      datum: new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`),
      // Thema = Teil nach dem Gedankenstrich („Better together – Martinsgänse backen")
      thema: dekodiere(t.title.rendered).split(/\s[–-]\s/).slice(1).join(' – '),
    };
  } catch {
    return null;
  }
}

// Solange die Seite versteckt ist: alle Links mit [data-bt-link] auf den Termin umbiegen.
export function verlinkeBtTermin(t: BtTermin | null) {
  if (BT_SEITE_OEFFENTLICH || !t) return;
  document.querySelectorAll<HTMLAnchorElement>('a[data-bt-link]').forEach((a) => { a.href = t.pfad; });
}
