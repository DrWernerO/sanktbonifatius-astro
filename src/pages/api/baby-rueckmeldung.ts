// API-Route: nimmt den Rückmeldeblock der Landingpage /baby/ entgegen (BbFeedback.astro)
// und schickt die Angaben als reine Text-Mail an Werner Otto (bis auf Weiteres, vorher Pfarrbüro info@).
//
// Gleiche Lösung wie Kita-Bewerbung/Taufe (src/pages/api/kita-bewerbung.ts, Handbuch 13b):
// SMTP-Zugangsdaten aus Umgebungsvariablen (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM),
// Empfänger BABY_TO (Standard: w.otto@sanktbonifatius.de). Ohne SMTP-Konfiguration läuft ein
// DEV-Modus: die Mail wird als Textdatei unter ./.baby-eingaben/ abgelegt (gitignored).
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
const THEMEN = ['Familienangebote', 'Taufe', 'Etwas anderes'];
// Festgelegt von Werner am 2026-10-01. Mit Netlify-Env BABY_TO überschreibbar (Komma-getrennt).
const EMPFAENGER_STD = 'w.otto@sanktbonifatius.de'; // bis auf Weiteres an Werner (Festlegung 2026-10-05); vorher info@
const SEITE = '/baby/';
const MIN_AUSFUELLZEIT_MS = 3000;
const HEFT_WERTE = ['Sehr gut', 'Ganz gut', 'Eher nicht'];

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
    'Neue Rückmeldung über die Baby-Seite (sanktbonifatius.de/baby)\n' +
    '(QR-Code im Brief zum Gutscheinheft für Eltern nach der Geburt)\n\n' +
    z('Wie war das Gutscheinheft?', d.bb_heft || '(keine Angabe)') +
    (d.bb_nachricht ? `\nNachricht:\n${d.bb_nachricht}\n` : '') +
    '\n— Rückrufwunsch —\n' +
    (kontakt
      ? 'JA – bitte zurückrufen; die Person hat eingewilligt.\n' +
        z('Thema', d.bb_thema) + z('Name', d.bb_name) + z('Telefon', d.bb_telefon)
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
    console.warn('[baby] Spam-Verdacht verworfen (Honeypot/Zeit-Check).');
    return antwort(request, true, 'Herzlichen Dank für Ihre Rückmeldung!');
  }

  const kontakt = roh.bb_rueckruf === 'ja';
  const d: Record<string, string> = {
    bb_heft: HEFT_WERTE.includes(roh.bb_heft) ? roh.bb_heft : '',
    bb_nachricht: kurz(roh.bb_nachricht, 2000),
    // Kontaktdaten nur mit Einwilligung übernehmen — sonst verwerfen.
    bb_name: kontakt ? kurz(roh.bb_name, 120) : '',
    bb_telefon: kontakt ? kurz(roh.bb_telefon, 40) : '',
    bb_thema: kontakt && THEMEN.includes(roh.bb_thema) ? roh.bb_thema : '',
  };

  if (!d.bb_heft && !d.bb_nachricht && !kontakt) {
    return antwort(request, false, 'Bitte wählen Sie eine Antwort aus oder schreiben Sie uns ein paar Worte.', 400);
  }
  if (kontakt && !d.bb_telefon) {
    return antwort(request, false, 'Damit wir Sie zurückrufen können, geben Sie bitte Ihre Telefonnummer an.', 400);
  }

  const betreff = 'Rückmeldung Gutscheinheft Baby' + (kontakt ? ' – bitte zurückrufen' : '');
  const text = mailText(d, kontakt);
  const danke = kontakt
    ? 'Herzlichen Dank! Wir rufen Sie gern zurück.'
    : 'Herzlichen Dank für Ihre Rückmeldung!';

  // DEV-Modus: keine SMTP-Konfiguration → Mail lokal als Textdatei ablegen
  if (!E.SMTP_HOST || !E.SMTP_USER || !E.SMTP_PASS) {
    try {
      const dir = path.resolve(process.cwd(), '.baby-eingaben');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${Date.now()}.txt`), `Betreff: ${betreff}\n\n${text}`);
      console.warn('[baby] DEV-Modus: keine SMTP-Daten — Rückmeldung lokal gespeichert.');
      return antwort(request, true, danke + ' (Testmodus: lokal gespeichert, kein Mailversand.)');
    } catch {
      console.error('[baby] DEV-Speichern fehlgeschlagen.');
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
      to: E.BABY_TO || EMPFAENGER_STD,
      subject: betreff,
      text,
    });
    return antwort(request, true, danke);
  } catch (err) {
    // Nur Fehlercode/-art loggen, nicht das komplette Fehlerobjekt (könnte Mail-Inhalt enthalten).
    const code = (err as { code?: string })?.code || 'unbekannt';
    console.error('[baby] Mailversand fehlgeschlagen, Code:', code);
    return antwort(request, false, 'Das hat leider nicht geklappt. Bitte schreiben Sie uns an info@sanktbonifatius.de.', 502);
  }
};
