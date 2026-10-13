// Zählt JEDEN Abruf von Pfarrbrief/Highlights auf Dateiebene (Handbuch 1d; Spalten "Sonstige"
// auf /statistik = diese Abrufe minus Website-Klicks) — auch wenn jemand
// die PDF direkt aus Google, per WhatsApp-Link oder über eine alte, umgeleitete Adresse öffnet
// und nie auf unserer Website geklickt hat (der frühere Klick-Zähler in Nav.astro sah nur
// Klicks auf der eigenen Seite). Läuft vor der statischen Datei, liefert sie unverändert aus.
//
// Die Header aus public/_headers werden hier selbst gesetzt: ob Netlify sie auf die Antwort
// einer Edge Function anwendet, ist nicht verbürgt — der Download-Dateiname darf nicht davon
// abhängen. Werte müssen mit public/_headers übereinstimmen.
const DATEIEN: Record<string, { datei: string; headers: Record<string, string> }> = {
  '/downloads/pfarrbrief.pdf': {
    datei: 'pfarrbrief',
    headers: {
      'Content-Disposition': 'attachment; filename="Sankt Bonifatius Pfarrbrief.pdf"',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  },
  '/downloads/highlights.pdf': {
    datei: 'highlights',
    headers: {
      'Content-Disposition': 'attachment; filename="Sankt Bonifatius Highlights.pdf"',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  },
};

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|monitor|uptime|lighthouse|headless/i;

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();
  const ziel = DATEIEN[new URL(request.url).pathname];
  if (!ziel) return response;

  const antwort = new Response(response.body, response);
  for (const [name, wert] of Object.entries(ziel.headers)) antwort.headers.set(name, wert);

  const range = request.headers.get('range');
  let ergebnis = '1';
  if (request.method !== 'GET') ergebnis = '0-methode';
  else if (response.status !== 200) ergebnis = '0-status';
  else if (range && !range.startsWith('bytes=0-')) ergebnis = '0-range';
  else if (BOT.test(request.headers.get('user-agent') || '')) ergebnis = '0-bot';

  if (ergebnis === '1') {
    // Zählung läuft über unsere eigene Astro-Funktion /api/track-abruf (die kennt Netlify Blobs
    // sicher; die Edge-Laufzeit hat andere Modul-Regeln). Wir warten kurz auf die Antwort (max.
    // 3 s, Downloads sind selten) und vermerken das Ergebnis im Header X-Download-Counted —
    // scheitert der Aufruf, wird die PDF trotzdem ausgeliefert, der Download hängt nie an der
    // Zählung. Origin-Header nötig: Astro lehnt POSTs ohne passenden Origin als Cross-Site-
    // Anfrage ab (403).
    try {
      const adresse = new URL(`/api/track-abruf?file=${ziel.datei}`, request.url);
      const antwortZaehler = await fetch(adresse, {
        method: 'POST',
        headers: { Origin: adresse.origin },
        signal: AbortSignal.timeout(3000),
      });
      if (!antwortZaehler.ok) ergebnis = `0-fehler-${antwortZaehler.status}`;
    } catch (err) {
      console.error('Download-Zählung fehlgeschlagen:', err);
      ergebnis = '0-fehler';
    }
  }
  antwort.headers.set('X-Download-Counted', ergebnis);
  return antwort;
};

export const config = { path: ['/downloads/pfarrbrief.pdf', '/downloads/highlights.pdf'] };
