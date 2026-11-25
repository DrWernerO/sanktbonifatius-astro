// Nächster Termin, dessen Titel mit einem bestimmten Wort beginnt — clientseitig über /wp-proxy.
// Genutzt vom BonFriday-Gutschein auf /baby/ (BbGutschein.astro): Link zeigt auf den nächsten
// BonFriday-Termin; ohne Treffer bleibt der Rückfall-Link (Terminkalender) stehen.
// Vorbild: naechsterBtTermin() in better-together.ts (dort zusätzlich auf Kategorie BonFamily begrenzt).

function dekodiere(html: string) {
  const t = document.createElement('textarea');
  t.innerHTML = html;
  return t.value;
}

// titel: Muster für den Titelanfang. Liefert den Pfad des nächsten Termins ab heute oder null.
// ⚠️ Die WP-Volltextsuche (`search=`) findet beim Termin-CPT nichts (Antwort 400) — deshalb werden
// die 100 neuesten Termine geladen und hier gefiltert (Stand 25.11.2026: 66 Termine insgesamt).
// Wächst der Bestand über 100, ggf. auf mehrere Seiten erweitern.
export async function naechsterTerminPfad(titel: RegExp): Promise<string | null> {
  const d = new Date();
  const heute = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  try {
    const res = await fetch(`/wp-proxy/wp-json/wp/v2/event?per_page=100&_fields=link,title,event_meta`);
    if (!res.ok) return null;
    const liste: { link: string; title: { rendered: string }; event_meta?: Record<string, string> }[] = await res.json();
    const t = liste
      .filter((e) => e.event_meta?.start_date && e.event_meta.start_date >= heute && titel.test(dekodiere(e.title.rendered)))
      .sort((a, b) => a.event_meta!.start_date.localeCompare(b.event_meta!.start_date))[0];
    if (!t) return null;
    try { return new URL(t.link).pathname; } catch { return t.link; }
  } catch {
    return null;
  }
}
