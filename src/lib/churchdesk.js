// Anbindung an die ChurchDesk-API (Gottesdienstplan). Ersetzt das frühere Cross-Origin-iframe-
// Widget: Google kann dessen Inhalt nicht crawlen, ein serverseitig gerendertes HTML + JSON-LD
// aber schon. Token ist geheim → process.env (nicht import.meta.env, s. Konvention in
// middleware.ts/kita-bewerbung.ts: Astro friert import.meta.env beim Build ein, echte
// Laufzeit-Secrets brauchen process.env).
const CD_API = 'https://api.churchdesk.com/v3.0.0';
const GOTTESDIENST_CATEGORY_ID = 144769;

// Platzhalter-Titel, mit dem die Pfarrei einen ausfallenden Termin in ChurchDesk kennzeichnet
// (kein eigenes "abgesagt"-Feld in der API). Wird bewusst MIT angezeigt (Werners Wunsch,
// 2026-09-14) — sonst wissen Besucher:innen nicht, dass eine reguläre Messe entfällt.
const ENTFAELLT = 'entfällt';

// Reiner Platzhalter-Termin ohne echten Gottesdienst dahinter (Werners Wunsch, 2026-09-14) —
// wird komplett rausgefiltert, nicht nur gedämpft wie ENTFÄLLT.
const AUSGEBLENDETE_TITEL = ['taufe möglich'];

// import.meta.env als Fallback NUR für `npm run dev` lokal: Netlify setzt process.env zur
// Laufzeit der Function (Produktiv-Pfad, wird immer zuerst geprüft); im lokalen `astro dev`
// füllt Vite dagegen nur import.meta.env aus der .env, process.env bleibt leer (gleiche Lücke
// besteht auch bei RAUMBUCHUNG_PASSWORD/DOWNLOADS_STATS_PASSWORD in middleware.ts — dort bislang
// ungelöst, hier der Fallback, damit sich die ChurchDesk-Anbindung lokal testen lässt).
function config() {
  return {
    token: process.env.CHURCHDESK_API_TOKEN || import.meta.env.CHURCHDESK_API_TOKEN,
    organizationId: process.env.CHURCHDESK_ORGANIZATION_ID || import.meta.env.CHURCHDESK_ORGANIZATION_ID || '5499',
  };
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// Berlin-Datum/Zeit fürs Anzeigen (DST-sicher). dateKey gruppiert Termine desselben Kalendertags.
function berlinParts(date) {
  const dtf = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(date); // YYYY-MM-DD
  const time = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit',
  }).format(date);
  return {
    dateKey,
    dayLabel: `${parts.weekday}, ${parts.day}. ${parts.month} ${parts.year}`,
    shortDay: parts.day,
    shortMonth: parts.month.slice(0, 3),
    timeLabel: `${time} Uhr`,
    isSunday: parts.weekday === 'Sonntag',
  };
}

// Zelebrant(en) aus den Rota-Daten (Dienstplan) ziehen — Rota mit type "priests"/Titel
// "Zelebrant". Nicht jeder Termin hat schon eine Zuteilung (Dienstplan wird laufend gepflegt),
// dann bleibt das Feld leer statt einer falschen Angabe.
function extractCelebrant(rotas) {
  if (!Array.isArray(rotas)) return '';
  const rota = rotas.find((r) => r.type === 'priests' || r.title === 'Zelebrant');
  const namen = (rota?.users || []).map((u) => u.fullName).filter(Boolean);
  return namen.join(', ');
}

function normalize(raw) {
  const start = new Date(raw.startDate);
  const end = raw.endDate ? new Date(raw.endDate) : null;
  const berlin = berlinParts(start);
  return {
    id: raw.id,
    title: raw.title,
    isEntfaellt: (raw.title || '').trim().toLowerCase() === ENTFAELLT,
    summary: raw.summary || '',
    celebrant: extractCelebrant(raw.rotas),
    church: raw.locationName || raw.location || '',
    address: raw.locationObj?.address
      ? `${raw.locationObj.address}, ${raw.locationObj.zipcode ?? ''} ${raw.locationObj.city ?? ''}`.trim()
      : '',
    start,
    end,
    startISO: raw.startDate,
    endISO: raw.endDate || null,
    ...berlin,
  };
}

// NUR zur Live-Fehlersuche (2026-09-14, wird danach wieder entfernt): letzter Abruf-Status, als
// HTML-Kommentar in GdoTermine.astro sichtbar — Netlifys Function-Logs zeigten keine console.warn-
// Zeile, das ist eindeutiger als das Log-UI.
let lastDebug = { note: 'getGottesdienste wurde noch nicht aufgerufen' };
export function getLastDebug() {
  return lastDebug;
}

// Holt Gottesdienste zwischen `from` und `to` (Date-Objekte), sortiert nach Startzeit. Bricht der
// Abruf ab (fehlendes Token, API-Fehler) → [] statt den Seitenbau abzureißen (gleiche Konvention
// wie getTaufeTermine() in wordpress.js).
export async function getGottesdienste({ from, to, itemsNumber = 500 } = {}) {
  const { token, organizationId } = config();
  if (!token) {
    console.warn('ChurchDesk: CHURCHDESK_API_TOKEN ist nicht gesetzt (process.env und import.meta.env leer).');
    lastDebug = { hasToken: false, organizationId };
    return [];
  }
  try {
    const params = new URLSearchParams({
      organizationId,
      itemsNumber: String(itemsNumber),
    });
    if (from) params.set('startDate', isoDate(from));
    if (to) params.set('endDate', isoDate(to));

    const res = await fetch(`${CD_API}/events?${params.toString()}`, {
      headers: { 'X-API-Key': token, Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`ChurchDesk-API antwortete mit ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
      lastDebug = {
        hasToken: true, tokenLength: token.length, organizationId,
        httpStatus: res.status, httpStatusText: res.statusText, body: body.slice(0, 300),
      };
      return [];
    }
    const raw = await res.json();
    if (!Array.isArray(raw)) {
      lastDebug = { hasToken: true, organizationId, httpStatus: res.status, rawIsArray: false };
      return [];
    }

    const gottesdienste = raw.filter((e) => (e.categories || []).some((c) => c.id === GOTTESDIENST_CATEGORY_ID));
    const result = gottesdienste
      .filter((e) => !AUSGEBLENDETE_TITEL.includes((e.title || '').trim().toLowerCase()))
      .map(normalize)
      .sort((a, b) => a.start - b.start);

    lastDebug = {
      hasToken: true, tokenLength: token.length, organizationId,
      httpStatus: res.status, rawCount: raw.length, gottesdiensteCount: gottesdienste.length,
      resultCount: result.length, from: from?.toISOString(), to: to?.toISOString(),
    };
    return result;
  } catch (err) {
    console.warn('ChurchDesk-Gottesdienste konnten nicht geladen werden:', err);
    lastDebug = { hasToken: true, organizationId, exception: String(err) };
    return [];
  }
}
