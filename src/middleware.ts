// Passwortschutz für die Raumbuchungsseite (nur ausgewählte Ehrenamtliche).
// Läuft als Netlify-Function (HTTP-Basic-Auth), NICHT nur clientseitig — dadurch bekommt
// Google/jeder Crawler ohne Zugangsdaten grundsätzlich nur ein 401, nie den Seiteninhalt.
// Betroffene Route muss `export const prerender = false` setzen (sonst liefert Netlify die
// Seite als fertige statische Datei aus, an der Middleware/Function vorbei).
//
// Passwort kommt aus der Umgebungsvariable RAUMBUCHUNG_PASSWORD (.env lokal / Netlify
// Environment Variables produktiv) — steht NIE im Quellcode (Sicherheitsregel CLAUDE.md).
// Benutzername ist fest "Anfrage" (Werners Vorgabe) — kein Geheimnis, nur zur Orientierung
// im Browser-Login-Fenster, daher fest im Code statt in einer Umgebungsvariable.
import { defineMiddleware } from 'astro:middleware';

const GESCHUETZTE_PFADE = ['/kontakt/raumbuchung'];
const SOLL_BENUTZERNAME = 'anfrage';

function istGeschuetzterPfad(pathname: string): boolean {
  const ohneSlash = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return GESCHUETZTE_PFADE.includes(ohneSlash);
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!istGeschuetzterPfad(context.url.pathname)) {
    return next();
  }

  // process.env statt import.meta.env: Astro 6 friert import.meta.env beim Build ein — für
  // echte Laufzeit-Secrets (Netlify-Umgebungsvariable) braucht es process.env (s. Handbuch/Fix
  // vom 29.08.2026, betraf auch die SMTP-Zugangsdaten in taufe-anmeldung.ts/kita-bewerbung.ts).
  const sollPasswort = process.env.RAUMBUCHUNG_PASSWORD;
  const authHeader = context.request.headers.get('authorization');

  if (sollPasswort && authHeader?.startsWith('Basic ')) {
    const eingabe = atob(authHeader.slice(6));
    const trennstelle = eingabe.indexOf(':');
    const eingabeBenutzername = eingabe.slice(0, trennstelle);
    const eingabePasswort = eingabe.slice(trennstelle + 1);
    if (eingabeBenutzername.toLowerCase() === SOLL_BENUTZERNAME && eingabePasswort === sollPasswort) {
      const response = await next();
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    }
  }

  // Echtes HTML-Dokument statt reinem Text: Browser zeigen bei 401 ohnehin ihren eigenen
  // Basic-Auth-Dialog (dieser Text ist für normale Besucher praktisch unsichtbar) — aber
  // Screenreader/Crawler, die die Antwort direkt lesen, bekommen so wenigstens eine gültige
  // Seite mit Titel und lang-Attribut statt nackten Fließtext ohne Struktur.
  return new Response(
    '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Passwort erforderlich | Sankt Bonifatius Frankfurt</title></head><body><p>Passwort erforderlich.</p></body></html>',
    {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Raumbuchung Sankt Bonifatius", charset="UTF-8"',
        'X-Robots-Tag': 'noindex, nofollow',
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
});
