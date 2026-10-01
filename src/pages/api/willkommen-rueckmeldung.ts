// API-Route: nimmt den Rückmeldeblock der Landingpage /willkommen/ entgegen (WkFeedback.astro)
// und schickt die Angaben als reine Text-Mail ans Pfarrbüro (info@).
//
// Gleiche Lösung wie Kita-Bewerbung/Taufe (src/pages/api/kita-bewerbung.ts, Handbuch 13b):
// SMTP-Zugangsdaten aus Umgebungsvariablen (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM),
// Empfänger WILLKOMMEN_TO (Standard: info@sanktbonifatius.de). Ohne SMTP-Konfiguration läuft ein
// DEV-Modus: die Mail wird als Textdatei unter ./.willkommen-eingaben/ abgelegt (gitignored).
//
// Datenschutz: Formularinhalte werden NIE geloggt (console.* nur ohne Personendaten). Kontaktdaten
// werden nur übernommen, wenn das Einwilligungs-Häkchen gesetzt ist (Datensparsamkeit, KDG).
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

export const prerender = false;

// process.env statt import.meta.env (Fix vom 29.08.2026, siehe kita-bewerbung.ts).
const E = process.env;
// Festgelegt von Werner am 2026-10-01. Mit Netlify-Env WILLKOMMEN_TO überschreibbar (Komma-getrennt).
const EMPFAENGER_STD = 'info@sanktbonifatius.de';
const SEITE = '/willkommen/';
const MIN_AUSFUELLZEIT_MS = 3000;
const FLYER_WERTE = ['Sehr gut', 'Ganz gut', 'Eher nicht'];

function istBot(d: Record<string, string>): boolean {
  if (d.webseite?.trim()) return true;
  const ts = Number(d.astro_ts);
  if (!ts || Date.now() - ts < MIN_AUSFUELLZEIT_MS) return true;
  return false;
}

// Antwort für fetch (JSON) oder — ohne JavaScript — Rücksprung auf die Seite (#danke / #fehler).
function antwort(request: Request, success: boolean, data: string, status = 200) {
  if ((request.headers.get('accept') || '').includes('application/json')) {
    return new Response(JSON.stringify({ success, data }), {
      status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(null, { status: 303, headers: { Location: SEITE + (success ? '#danke' : '#fehler') } });
}

const kurz = (v: string | undefined, max: number) => (v || '').trim().slice(0, max);

function mailText(d: Record<string, string>, kontakt: boolean): string {
  const z = (label: string, v?: string) => (v ? `${label}: ${v}\n` : '');
  return (
    'Neue Rückmeldung über die Willkommens-Seite (sanktbonifatius.de/willkommen)\n' +
    '(QR-Code im Brief zum Willkommens-Flyer für Neuzugezogene)\n\n' +
    z('Wie hat der Flyer gefallen?', d.wk_flyer || '(keine Angabe)') +
    (d.wk_nachricht ? `\nNachricht:\n${d.wk_nachricht}\n` : '') +
    '\n— Kontaktwunsch —\n' +
    (kontakt
      ? 'JA – die Person freut sich über eine Kontaktaufnahme und hat eingewilligt.\n' +
        z('Name', d.wk_name) + z('Telefon', d.wk_telefon) + z('E-Mail', d.wk_email)
      : 'nein\n') +
    '\nHinweis: Bitte nur für diese Rückmeldung bzw. Kontaktaufnahme verwenden und danach löschen.\n'
  );
}

export const POST: APIRoute = async ({ request }) => {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return antwort(request, false, 'Die Daten konnten nicht gelesen werden.', 400);
  }
  const roh: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string') roh[k] = v;

  if (istBot(roh)) {
    console.warn('[willkommen] Spam-Verdacht verworfen (Honeypot/Zeit-Check).');
    return antwort(request, true, 'Herzlichen Dank für Ihre Rückmeldung!');
  }

  const kontakt = roh.wk_kontakt === 'ja';
  const d: Record<string, string> = {
    wk_flyer: FLYER_WERTE.includes(roh.wk_flyer) ? roh.wk_flyer : '',
    wk_nachricht: kurz(roh.wk_nachricht, 2000),
    // Kontaktdaten nur mit Einwilligung übernehmen — sonst verwerfen.
    wk_name: kontakt ? kurz(roh.wk_name, 120) : '',
    wk_telefon: kontakt ? kurz(roh.wk_telefon, 40) : '',
    wk_email: kontakt ? kurz(roh.wk_email, 160) : '',
  };

  if (!d.wk_flyer && !d.wk_nachricht && !kontakt) {
    return antwort(request, false, 'Bitte wählen Sie eine Antwort aus oder schreiben Sie uns ein paar Worte.', 400);
  }
  if (kontakt && !d.wk_telefon && !d.wk_email) {
    return antwort(request, false, 'Damit wir Sie erreichen können, geben Sie bitte Telefon oder E-Mail an.', 400);
  }

  const betreff = 'Rückmeldung Willkommens-Flyer' + (kontakt ? ' – bitte Kontakt aufnehmen' : '');
  const text = mailText(d, kontakt);
  const danke = kontakt
    ? 'Herzlichen Dank! Wir freuen uns und melden uns bald bei Ihnen.'
    : 'Herzlichen Dank für Ihre Rückmeldung!';

  // DEV-Modus: keine SMTP-Konfiguration → Mail lokal als Textdatei ablegen
  if (!E.SMTP_HOST || !E.SMTP_USER || !E.SMTP_PASS) {
    try {
      const dir = path.resolve(process.cwd(), '.willkommen-eingaben');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${Date.now()}.txt`), `Betreff: ${betreff}\n\n${text}`);
      console.warn('[willkommen] DEV-Modus: keine SMTP-Daten — Rückmeldung lokal gespeichert.');
      return antwort(request, true, danke + ' (Testmodus: lokal gespeichert, kein Mailversand.)');
    } catch {
      console.error('[willkommen] DEV-Speichern fehlgeschlagen.');
      return antwort(request, false, 'Fehler beim Verarbeiten (Testmodus).', 500);
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: E.SMTP_HOST,
      port: Number(E.SMTP_PORT || 587),
      secure: Number(E.SMTP_PORT) === 465,
      auth: { user: E.SMTP_USER, pass: E.SMTP_PASS },
    });
    await transporter.sendMail({
      from: E.SMTP_FROM || E.SMTP_USER,
      to: E.WILLKOMMEN_TO || EMPFAENGER_STD,
      replyTo: d.wk_email || undefined,
      subject: betreff,
      text,
    });
    return antwort(request, true, danke);
  } catch (err) {
    // Nur Fehlercode/-art loggen, nicht das komplette Fehlerobjekt (könnte Mail-Inhalt enthalten).
    const code = (err as { code?: string })?.code || 'unbekannt';
    console.error('[willkommen] Mailversand fehlgeschlagen, Code:', code);
    return antwort(request, false, 'Das hat leider nicht geklappt. Bitte schreiben Sie uns an info@sanktbonifatius.de.', 502);
  }
};
