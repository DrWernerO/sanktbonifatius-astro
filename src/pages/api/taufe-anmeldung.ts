// API-Route: nimmt das Taufe-Anmeldeformular entgegen, erzeugt das ausgefüllte
// amtliche PDF und verschickt es als Mail-Anhang ans Pfarrbüro.
//
// Endzustand laut ASTRO-HANDBUCH 13b (B): ersetzt die frühere WordPress-AJAX-Anbindung.
// Benötigt Server-Modus (@astrojs/node) — siehe astro.config.mjs.
//
// SMTP-Zugangsdaten kommen aus Umgebungsvariablen (.env, NIE ins Repo):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, TAUFE_TO
// Ohne SMTP-Konfiguration läuft ein DEV-Modus: das PDF wird lokal in
//   ./.taufe-eingaben/ gespeichert (zum Testen ohne Postfach).
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { fillTaufeForm } from '../../lib/taufe/fill-taufe.js';

export const prerender = false;

const E = import.meta.env;
const EMPFAENGER_STD = 'pfarrer@sanktbonifatius.de, info@sanktbonifatius.de, w.otto@sanktbonifatius.de';

function jsonAntwort(success: boolean, data: string, status = 200) {
  return new Response(JSON.stringify({ success, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Lesbarer Mailtext als Zusammenfassung der Anmeldung. */
function mailText(d: Record<string, string>): string {
  const z = (label: string, v?: string) => (v && v.trim() ? `${label}: ${v.trim()}\n` : '');
  return (
    'Neue Taufanmeldung über sanktbonifatius.de\n' +
    '(Das vollständige amtliche Formular liegt als PDF im Anhang.)\n\n' +
    '— Täufling —\n' +
    z('Name', `${d.tauf_vorname ?? ''} ${d.tauf_name ?? ''}`) +
    z('Geburtsdatum', d.tauf_gebdat) +
    z('Geburtsort', d.tauf_geburtsort) +
    '\n— Wunschtermin —\n' +
    z('1. Wahl', [d.wunsch1_datum, d.wunsch1_ort].filter(Boolean).join(', ')) +
    z('2. Wahl', [d.wunsch2_datum, d.wunsch2_ort].filter(Boolean).join(', ')) +
    '\n— Kontakt —\n' +
    z('Telefon', d.kontakt_telefon) +
    z('E-Mail', d.kontakt_email) +
    (d.bemerkungen ? `\n— Bemerkungen —\n${d.bemerkungen}\n` : '')
  );
}

export const POST: APIRoute = async ({ request }) => {
  // 1) Daten einlesen (FormData)
  let d: Record<string, string>;
  try {
    const fd = await request.formData();
    d = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));
  } catch {
    return jsonAntwort(false, 'Die Daten konnten nicht gelesen werden.', 400);
  }

  // 2) Pflichtfeld-Prüfung (wie im Formular: Name + Vorname des Täuflings)
  if (!d.tauf_name?.trim() || !d.tauf_vorname?.trim()) {
    return jsonAntwort(false, 'Bitte Name und Vornamen des Täuflings angeben.', 400);
  }

  // 3) PDF erzeugen
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await fillTaufeForm(d);
  } catch (err) {
    console.error('[taufe] PDF-Erzeugung fehlgeschlagen:', err);
    return jsonAntwort(false, 'Das Anmelde-PDF konnte nicht erstellt werden.', 500);
  }

  const dateiname = `Taufanmeldung_${(d.tauf_name || 'kind').replace(/[^\w.-]+/g, '_')}.pdf`;

  // 4a) DEV-Modus: keine SMTP-Konfiguration → PDF lokal ablegen
  if (!E.SMTP_HOST || !E.SMTP_USER || !E.SMTP_PASS) {
    try {
      const dir = path.resolve(process.cwd(), '.taufe-eingaben');
      fs.mkdirSync(dir, { recursive: true });
      const ziel = path.join(dir, `${Date.now()}_${dateiname}`);
      fs.writeFileSync(ziel, pdfBytes);
      console.warn('[taufe] DEV-Modus: keine SMTP-Daten — PDF gespeichert unter', ziel);
      return jsonAntwort(true, 'Anmeldung verarbeitet (Testmodus: PDF lokal gespeichert, kein Mailversand).');
    } catch (err) {
      console.error('[taufe] DEV-Speichern fehlgeschlagen:', err);
      return jsonAntwort(false, 'Fehler beim Verarbeiten (Testmodus).', 500);
    }
  }

  // 4b) Produktiv: Mail mit PDF-Anhang verschicken
  try {
    const transporter = nodemailer.createTransport({
      host: E.SMTP_HOST,
      port: Number(E.SMTP_PORT || 587),
      secure: Number(E.SMTP_PORT) === 465,
      auth: { user: E.SMTP_USER, pass: E.SMTP_PASS },
    });
    await transporter.sendMail({
      from: E.SMTP_FROM || E.SMTP_USER,
      to: (E.TAUFE_TO || EMPFAENGER_STD),
      replyTo: d.kontakt_email || undefined,
      subject: `Taufanmeldung: ${d.tauf_vorname} ${d.tauf_name}`,
      text: mailText(d),
      attachments: [{ filename: dateiname, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }],
    });
    return jsonAntwort(true, 'Vielen Dank! Ihre Anmeldung ist eingegangen. Wir melden uns bei Ihnen.');
  } catch (err) {
    console.error('[taufe] Mailversand fehlgeschlagen:', err);
    return jsonAntwort(false, 'Die Anmeldung konnte nicht versendet werden. Bitte rufen Sie uns an.', 502);
  }
};
