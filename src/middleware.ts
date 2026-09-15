// Passwortschutz für nicht-öffentliche Seiten (Raumbuchung, Download-Statistik).
// Läuft als Netlify-Function (HTTP-Basic-Auth), NICHT nur clientseitig — dadurch bekommt
// Google/jeder Crawler ohne Zugangsdaten grundsätzlich nur ein 401, nie den Seiteninhalt.
// Betroffene Route muss `export const prerender = false` setzen (sonst liefert Netlify die
// Seite als fertige statische Datei aus, an der Middleware/Function vorbei).
//
// Passwort kommt jeweils aus einer eigenen Umgebungsvariable (.env lokal / Netlify
// Environment Variables produktiv) — steht NIE im Quellcode (Sicherheitsregel CLAUDE.md).
// Benutzername ist pro Seite fest hinterlegt — kein Geheimnis, nur zur Orientierung im
// Browser-Login-Fenster, daher fest im Code statt in einer Umgebungsvariable.
import { defineMiddleware } from 'astro:middleware';

const GESCHUETZTE_PFADE: Record<string, { envVar: string; benutzername: string; realm: string }> = {
  '/kontakt/raumbuchung': {
    envVar: 'RAUMBUCHUNG_PASSWORD',
    benutzername: 'anfrage',
    realm: 'Raumbuchung Sankt Bonifatius',
  },
  '/downloads/statistik': {
    envVar: 'DOWNLOADS_STATS_PASSWORD',
    benutzername: 'statistik',
    realm: 'Download-Statistik Sankt Bonifatius',
  },
};

function findeSchutz(pathname: string) {
  const ohneSlash = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return GESCHUETZTE_PFADE[ohneSlash];
}

export const onRequest = defineMiddleware(async (context, next) => {
  const schutz = findeSchutz(context.url.pathname);
  if (!schutz) {
    return next();
  }

  // process.env statt import.meta.env: Astro 6 friert import.meta.env beim Build ein — für
  // echte Laufzeit-Secrets (Netlify-Umgebungsvariable) braucht es process.env (s. Handbuch/Fix
  // vom 29.08.2026, betraf auch die SMTP-Zugangsdaten in taufe-anmeldung.ts/kita-bewerbung.ts).
  const sollPasswort = process.env[schutz.envVar];
  const authHeader = context.request.headers.get('authorization');

  if (sollPasswort && authHeader?.startsWith('Basic ')) {
    const eingabe = atob(authHeader.slice(6));
    const trennstelle = eingabe.indexOf(':');
    const eingabeBenutzername = eingabe.slice(0, trennstelle);
    const eingabePasswort = eingabe.slice(trennstelle + 1);
    if (eingabeBenutzername.toLowerCase() === schutz.benutzername && eingabePasswort === sollPasswort) {
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
        'WWW-Authenticate': `Basic realm="${schutz.realm}", charset="UTF-8"`,
        'X-Robots-Tag': 'noindex, nofollow',
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
});
