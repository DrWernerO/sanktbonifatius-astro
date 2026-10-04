// Passwortschutz für nicht-öffentliche Seiten (Raumbuchung, Download-Statistik,
// 100 Jahre, Pause für die Seele).
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

const GESCHUETZTE_PFADE: Record<string, { envVar: string; zusatzEnvVar?: string; benutzername?: string; realm: string }> = {
  '/kontakt/raumbuchung': {
    envVar: 'RAUMBUCHUNG_PASSWORD',
    benutzername: 'anfrage',
    realm: 'Raumbuchung Sankt Bonifatius',
  },
  '/downloads/statistik': {
    // Seit 03.10.2026 gemeinsames Passwort mit der Jubiläumsseite, Benutzername egal.
    envVar: 'INTERNE_SEITEN_PASSWORD',
    realm: 'Download-Statistik Sankt Bonifatius',
  },
  '/exerzitien2027': {
    // Seit 03.10.2026 gemeinsames Passwort wie Jubiläum/Statistik, Benutzername egal.
    envVar: 'INTERNE_SEITEN_PASSWORD',
    realm: 'Pause fuer die Seele 2027',
  },
  '/100-jahre': {
    // Ohne `benutzername`: Benutzername wird ignoriert, nur das Passwort zählt.
    envVar: 'INTERNE_SEITEN_PASSWORD',
    // Vorübergehendes ZWEITES Passwort (04.10.2026), damit Werner die Seite einer Gruppe zeigen kann,
    // ohne das interne Passwort herauszugeben. Gilt NUR für diese Seite (nicht für /rundgang, Statistik
    // usw.). Zurückziehen: Variable in Netlify löschen (kein Code nötig) — ist sie nicht gesetzt, wird
    // sie ignoriert.
    zusatzEnvVar: 'JUBILAEUM_GRUPPE_PASSWORD',
    realm: '100 Jahre Sankt Bonifatius',
  },
  '/100-jahre/rundgang': {
    envVar: 'INTERNE_SEITEN_PASSWORD',
    realm: '100 Jahre Sankt Bonifatius (Prototyp)',
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
  // Lokal in `astro dev` befüllt Vite .env-Werte dagegen NUR in import.meta.env, NICHT in
  // process.env — deshalb hier als reiner Lokal-Fallback zusätzlich geprüft (in Produktion
  // liefert process.env ohnehin schon den echten Wert, der Fallback greift dort also nie).
  const sollPasswort = process.env[schutz.envVar] || import.meta.env[schutz.envVar];
  const zusatzPasswort = schutz.zusatzEnvVar ? process.env[schutz.zusatzEnvVar] || import.meta.env[schutz.zusatzEnvVar] : undefined;
  const gueltige = [sollPasswort, zusatzPasswort].filter((p): p is string => !!p).map((p) => p.normalize('NFC'));
  const authHeader = context.request.headers.get('authorization');

  if (gueltige.length > 0 && authHeader?.startsWith('Basic ')) {
    // Basic-Auth kommt Base64-kodiert; moderne Browser schicken die Zugangsdaten als UTF-8
    // (wir fordern charset="UTF-8" an). atob() liefert aber nur Einzelbytes — ohne das
    // Zurückdekodieren würden Passwörter mit Umlaut (z. B. „ü") nie passen. Fällt die
    // UTF-8-Dekodierung durch (alter Browser mit Latin-1), bleibt der atob()-Wert stehen.
    const roh = atob(authHeader.slice(6));
    let eingabe = roh;
    try {
      eingabe = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(roh, (c) => c.charCodeAt(0)));
    } catch {}
    const trennstelle = eingabe.indexOf(':');
    const eingabeBenutzername = eingabe.slice(0, trennstelle);
    const eingabePasswort = eingabe.slice(trennstelle + 1);
    if ((!schutz.benutzername || eingabeBenutzername.toLowerCase() === schutz.benutzername) && gueltige.includes(eingabePasswort.normalize('NFC'))) {
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
