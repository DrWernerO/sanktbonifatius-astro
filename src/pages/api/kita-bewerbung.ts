// API-Route: nimmt das Kita-Bewerbungsformular entgegen, erzeugt eine PDF-Zusammenfassung
// und verschickt sie zusammen mit hochgeladenen Dateien (Lebenslauf, Anschreiben usw.) als
// Mail-Anhang an die zentrale Bewerbungsadresse.
//
// Analog zur Taufanmeldung (src/pages/api/taufe-anmeldung.ts): SMTP-Zugangsdaten kommen aus
// Umgebungsvariablen (.env, NIE ins Repo): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
// Ohne SMTP-Konfiguration läuft ein DEV-Modus: PDF + Anhänge werden lokal gespeichert.
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { buildBewerbungPdf } from '../../lib/bewerbung/build-bewerbung-pdf.js';

export const prerender = false;

// process.env statt import.meta.env: Astro 6 friert import.meta.env beim Build ein — echte
// Laufzeit-Secrets (Netlify-Umgebungsvariablen) kommen dadurch nie an, obwohl sie in Netlify
// korrekt hinterlegt sind (Fix vom 29.08.2026, betraf auch middleware.ts/taufe-anmeldung.ts).
const E = process.env;
// ⚠️ TEMPORÄR für den ersten Live-Test auf Werners eigene Adresse gestellt (statt der echten
// bewerbungen-kita@…) — nach erfolgreichem Test zurück auf die echte Adresse stellen!
const BEWERBUNG_TO_STD = 'w.otto@sanktbonifatius.de';
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB je Datei
const MAX_TOTAL_BYTES = 8 * 1024 * 1024; // Netlify-Funktionen haben ein Payload-Limit im Bereich weniger MB
const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

function jsonAntwort(success: boolean, data: string, status = 200) {
  return new Response(JSON.stringify({ success, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function safeFilename(name: string) {
  return (name || 'anhang').replace(/[^\w.\-]+/g, '_').slice(0, 120);
}

function mailText(d: Record<string, string>): string {
  const z = (label: string, v?: string) => (v && v.trim() ? `${label}: ${v.trim()}\n` : '');
  return (
    'Neue Bewerbung über sanktbonifatius.de\n' +
    '(Zusammenfassung als PDF im Anhang, ggf. weitere Dateien des Bewerbers/der Bewerberin.)\n\n' +
    z('Stelle', d.job_titel) +
    '\n— Bewerber:in —\n' +
    z('Name', `${d.bew_vorname ?? ''} ${d.bew_name ?? ''}`) +
    z('E-Mail', d.bew_email) +
    z('Telefon', d.bew_telefon) +
    z('Frühester Eintritt', d.bew_eintritt) +
    (d.bew_nachricht ? `\n— Nachricht —\n${d.bew_nachricht}\n` : '')
  );
}

export const POST: APIRoute = async ({ request }) => {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return jsonAntwort(false, 'Die Daten konnten nicht gelesen werden.', 400);
  }

  const d: Record<string, string> = {};
  const files: File[] = [];
  for (const [key, value] of fd.entries()) {
    if (value instanceof File) {
      if (value.size > 0) files.push(value);
    } else {
      d[key] = value;
    }
  }

  // Pflichtfeld-Prüfung
  if (!d.bew_vorname?.trim() || !d.bew_name?.trim() || !d.bew_email?.trim()) {
    return jsonAntwort(false, 'Bitte Vorname, Name und E-Mail-Adresse angeben.', 400);
  }
  if (!d.bew_datenschutz) {
    return jsonAntwort(false, 'Bitte den Datenschutzhinweisen zustimmen.', 400);
  }

  // Datei-Prüfung (Client prüft bereits, hier nochmal serverseitig gegen manipulierte Anfragen)
  let totalSize = 0;
  for (const f of files) {
    const ext = path.extname(f.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return jsonAntwort(false, `Dateityp "${ext || '(unbekannt)'}" wird nicht unterstützt.`, 400);
    }
    if (f.size > MAX_FILE_BYTES) {
      return jsonAntwort(false, `"${f.name}" ist zu groß (max. 4 MB je Datei).`, 400);
    }
    totalSize += f.size;
  }
  if (totalSize > MAX_TOTAL_BYTES) {
    return jsonAntwort(false, 'Die Anhänge sind zusammen zu groß (max. 8 MB). Bitte weniger oder kleinere Dateien anhängen.', 400);
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await buildBewerbungPdf(d);
  } catch (err) {
    console.error('[bewerbung] PDF-Erzeugung fehlgeschlagen:', err);
    return jsonAntwort(false, 'Die Bewerbung konnte nicht verarbeitet werden.', 500);
  }

  const bewerberSlug = `${d.bew_vorname || ''}_${d.bew_name || ''}`.replace(/[^\w.-]+/g, '_') || 'bewerbung';
  const pdfName = `Bewerbung_${bewerberSlug}.pdf`;

  const attachments: { filename: string; content: Buffer; contentType?: string }[] = [
    { filename: pdfName, content: Buffer.from(pdfBytes), contentType: 'application/pdf' },
  ];
  for (const f of files) {
    attachments.push({ filename: safeFilename(f.name), content: Buffer.from(await f.arrayBuffer()) });
  }

  // DEV-Modus: keine SMTP-Konfiguration → Dateien lokal ablegen
  if (!E.SMTP_HOST || !E.SMTP_USER || !E.SMTP_PASS) {
    try {
      const dir = path.resolve(process.cwd(), '.bewerbung-eingaben');
      fs.mkdirSync(dir, { recursive: true });
      const stamp = Date.now();
      for (const att of attachments) {
        fs.writeFileSync(path.join(dir, `${stamp}_${att.filename}`), att.content);
      }
      console.warn('[bewerbung] DEV-Modus: keine SMTP-Daten — Dateien gespeichert unter', dir);
      return jsonAntwort(true, 'Bewerbung verarbeitet (Testmodus: Dateien lokal gespeichert, kein Mailversand).');
    } catch (err) {
      console.error('[bewerbung] DEV-Speichern fehlgeschlagen:', err);
      return jsonAntwort(false, 'Fehler beim Verarbeiten (Testmodus).', 500);
    }
  }

  // Produktiv: Mail mit PDF + Anhängen verschicken
  try {
    const transporter = nodemailer.createTransport({
      host: E.SMTP_HOST,
      port: Number(E.SMTP_PORT || 587),
      secure: Number(E.SMTP_PORT) === 465,
      auth: { user: E.SMTP_USER, pass: E.SMTP_PASS },
    });
    await transporter.sendMail({
      from: E.SMTP_FROM || E.SMTP_USER,
      to: E.BEWERBUNG_TO || BEWERBUNG_TO_STD,
      replyTo: d.bew_email || undefined,
      subject: `Bewerbung: ${d.bew_vorname} ${d.bew_name}${d.job_titel ? ' – ' + d.job_titel : ''}`,
      text: mailText(d),
      attachments,
    });
    return jsonAntwort(true, 'Vielen Dank! Ihre Bewerbung ist eingegangen. Wir melden uns bei Ihnen.');
  } catch (err) {
    console.error('[bewerbung] Mailversand fehlgeschlagen:', err);
    return jsonAntwort(false, 'Die Bewerbung konnte nicht versendet werden. Bitte senden Sie sie per E-Mail.', 502);
  }
};
