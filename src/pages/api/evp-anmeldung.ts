// API-Route: nimmt das Formular zum Ehevorbereitungsprotokoll (versteckte Seite /evp/, EvpForm.astro)
// entgegen, füllt das amtliche EVP-PDF (src/lib/evp/) und verschickt es als Mail-Anhang.
//
// Gleiche Lösung wie Taufe (src/pages/api/taufe-anmeldung.ts, Handbuch 13b): SMTP-Zugangsdaten aus
// Umgebungsvariablen (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM), Empfänger EVP_TO
// (Standard: w.otto@sanktbonifatius.de, bis auf Weiteres). Ohne SMTP-Konfiguration läuft ein
// DEV-Modus: das PDF wird unter ./.evp-eingaben/ gespeichert (gitignored).
//
// Datenschutz: Formularinhalte werden NIE geloggt (console.* nur ohne Personendaten).
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { fillEvpForm, datum } from '../../lib/evp/fill-evp.js';
import { makeA3Booklet } from '../../lib/evp/a3-broschuere.js';

export const prerender = false;

// process.env statt import.meta.env (Fix vom 29.08.2026, siehe taufe-anmeldung.ts).
const E = process.env;
const EMPFAENGER_STD = 'w.otto@sanktbonifatius.de';

// Anti-Spam wie bei der Taufe: Honeypot „webseite" leer + mind. 3 s zwischen Laden und Absenden.
const MIN_AUSFUELLZEIT_MS = 3000;
// Absicherung gegen übergroße Eingaben (KDG-Daten, Mail-Größe)
const MAX_FELDLAENGE = 500;

function istBot(d: Record<string, string>): boolean {
  if (d.webseite?.trim()) return true;
  const ts = Number(d.astro_ts);
  return !ts || Date.now() - ts < MIN_AUSFUELLZEIT_MS;
}

function jsonAntwort(success: boolean, data: string, status = 200) {
  return new Response(JSON.stringify({ success, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const nm = (d: Record<string, string>, p: string) =>
  [d[`${p}_vornamen`], d[`${p}_familienname`]].map((s) => (s || '').trim()).filter(Boolean).join(' ');

const j = (...p: (string | undefined)[]) => p.map((x) => (x || '').trim()).filter(Boolean).join(', ');

/** Kurzangaben je Person für den Mailtext: Name, Geburtsdatum, Konfession (+ Hinweis Austritt), Anschrift. */
function personText(d: Record<string, string>, p: string): string {
  const z = (label: string, v?: string) => (v && v.trim() ? `${label}: ${v.trim()}\n` : '');
  let konf = j(d[`${p}_konfession`], d[`${p}_konfession_zusatz`]);
  if (d[`${p}_austritt`] === 'Ja') {
    konf += `${konf ? ' ' : ''}(aus der Kirche ausgetreten${d[`${p}_wiederaufnahme`] === 'Ja' ? ', später wiederaufgenommen' : ''})`;
  }
  return (
    z('Name', nm(d, p)) +
    z('Geboren am', datum(d[`${p}_geburtsdatum`])) +
    z('Konfession', konf) +
    z('Anschrift', j(d[`${p}_strasse`], [d[`${p}_plz`], d[`${p}_ort`]].filter(Boolean).join(' ')))
  );
}

/** Lesbarer Mailtext als Kurzfassung (das vollständige Formular liegt als PDF im Anhang). */
function mailText(d: Record<string, string>): string {
  const z = (label: string, v?: string) => (v && v.trim() ? `${label}: ${v.trim()}\n` : '');
  return (
    'Neue Angaben zum Ehevorbereitungsprotokoll über sanktbonifatius.de/evp\n' +
    '(Im Anhang: das ausgefüllte Formular als A4-PDF und als A3-Broschüre.)\n\n' +
    '— Bräutigam —\n' + personText(d, 'mann') +
    '\n— Braut —\n' + personText(d, 'frau') +
    '\n— Geplante Eheschließung —\n' +
    z('Standesamt', j(datum(d.zivil_datum), d.zivil_ort)) +
    z('Kirchlich', j(datum(d.kath_datum), d.kath_uhrzeit, d.kath_ort)) +
    '\n— Traugespräch —\n' +
    z('Gewünscht mit', d.seelsorger) +
    '\n— Kontakt für Rückfragen —\n' +
    z('Telefon', d.kontakt_telefon) +
    z('E-Mail', d.kontakt_email)
  );
}

export const POST: APIRoute = async ({ request }) => {
  // 1) Daten einlesen (FormData), Feldlängen begrenzen
  let d: Record<string, string>;
  try {
    const fd = await request.formData();
    d = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, MAX_FELDLAENGE) : '']));
  } catch {
    return jsonAntwort(false, 'Die Daten konnten nicht gelesen werden.', 400);
  }

  // 2) Anti-Spam: Bots stumm abweisen (Erfolgsmeldung, aber kein PDF/Mailversand)
  if (istBot(d)) {
    console.warn('[evp] Spam-Verdacht verworfen (Honeypot/Zeit-Check).');
    return jsonAntwort(true, 'Vielen Dank! Ihre Angaben sind eingegangen. Wir melden uns bei Ihnen.');
  }

  // 3) Pflichtfelder: Name + Vorname(n) beider Brautleute, E-Mail für Rückfragen
  if (!d.mann_familienname?.trim() || !d.mann_vornamen?.trim() || !d.frau_familienname?.trim() || !d.frau_vornamen?.trim()) {
    return jsonAntwort(false, 'Bitte Familienname und Vorname(n) von Bräutigam und Braut angeben.', 400);
  }
  if (!/^\S+@\S+\.\S+$/.test((d.kontakt_email || '').trim())) {
    return jsonAntwort(false, 'Bitte eine gültige E-Mail-Adresse für Rückfragen angeben.', 400);
  }

  // 4) PDF erzeugen
  let pdfBytes: Uint8Array;
  let a3Bytes: Uint8Array;
  try {
    pdfBytes = await fillEvpForm(d);
    a3Bytes = await makeA3Booklet(pdfBytes);
  } catch (err) {
    console.error('[evp] PDF-Erzeugung fehlgeschlagen:', err instanceof Error ? err.message : 'unbekannt');
    return jsonAntwort(false, 'Das PDF konnte nicht erstellt werden.', 500);
  }

  const safe = (s: string) => (s || '').replace(/[^\w.-]+/g, '_');
  const basis = `Ehevorbereitungsprotokoll_${safe(d.mann_familienname)}_${safe(d.frau_familienname)}`;
  const dateiname = `${basis}_A4.pdf`;
  const dateinameA3 = `${basis}_A3-Broschuere.pdf`;

  // 5a) DEV-Modus: keine SMTP-Konfiguration → PDF lokal ablegen
  if (!E.SMTP_HOST || !E.SMTP_USER || !E.SMTP_PASS) {
    try {
      const dir = path.resolve(process.cwd(), '.evp-eingaben');
      fs.mkdirSync(dir, { recursive: true });
      const ziel = path.join(dir, `${Date.now()}_${dateiname}`);
      fs.writeFileSync(ziel, pdfBytes);
      fs.writeFileSync(path.join(dir, `${Date.now()}_${dateinameA3}`), a3Bytes);
      console.warn('[evp] DEV-Modus: keine SMTP-Daten — PDF gespeichert unter', ziel);
      return jsonAntwort(true, 'Angaben verarbeitet (Testmodus: PDF lokal gespeichert, kein Mailversand).');
    } catch {
      return jsonAntwort(false, 'Fehler beim Verarbeiten (Testmodus).', 500);
    }
  }

  // 5b) Produktiv: Mail mit PDF-Anhang verschicken
  try {
    const transporter = nodemailer.createTransport({
      host: E.SMTP_HOST,
      port: Number(E.SMTP_PORT || 587),
      secure: Number(E.SMTP_PORT) === 465,
      auth: { user: E.SMTP_USER, pass: E.SMTP_PASS },
    });
    await transporter.sendMail({
      from: E.SMTP_FROM || E.SMTP_USER,
      to: E.EVP_TO || EMPFAENGER_STD,
      replyTo: d.kontakt_email.trim(),
      subject: `Ehevorbereitungsprotokoll: ${nm(d, 'mann')} / ${nm(d, 'frau')}`,
      text: mailText(d),
      attachments: [
        { filename: dateiname, content: Buffer.from(pdfBytes), contentType: 'application/pdf' },
        { filename: dateinameA3, content: Buffer.from(a3Bytes), contentType: 'application/pdf' },
      ],
    });
    return jsonAntwort(true, 'Vielen Dank! Ihre Angaben sind eingegangen. Wir melden uns bei Ihnen.');
  } catch (err) {
    console.error('[evp] Mailversand fehlgeschlagen:', err instanceof Error ? err.message : 'unbekannt');
    return jsonAntwort(false, 'Die Angaben konnten nicht versendet werden. Bitte rufen Sie uns an.', 502);
  }
};
