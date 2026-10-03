// API-Route: nimmt Erfahrungsberichte für die „virtuelle Pfarrkirche" entgegen (Formular „IHR St.
// Bonifatius" auf /100-jahre/, Komponente JubMitmachen.astro) und verschickt sie samt optionalem
// Foto als Mail an Werner (Standard w.otto@sanktbonifatius.de, überschreibbar via
// JUBILAEUM_ERFAHRUNG_TO).
//
// Gleiche Mail-Funktion wie Taufanmeldung/Kita-Bewerbung: nodemailer mit SMTP-Zugangsdaten aus
// Umgebungsvariablen (.env, NIE ins Repo): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
// Ohne SMTP-Konfiguration läuft ein DEV-Modus: Mailtext + Foto werden lokal gespeichert
// (.jubilaeum-eingaben/, per .gitignore ausgeschlossen).
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

export const prerender = false;

// process.env statt import.meta.env (Astro 6 friert import.meta.env beim Build ein, s. middleware.ts)
const E = process.env;
const TO_STD = 'w.otto@sanktbonifatius.de';
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB (Netlify-Funktionen: Payload-Limit im Bereich weniger MB)
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_TEXT = 5000;

// Anti-Spam wie bei Taufe/Kita: Honeypot "webseite" muss leer bleiben, mind. 3 s zwischen Laden
// des Formulars (astro_ts) und Absenden.
const MIN_AUSFUELLZEIT_MS = 3000;
function istBot(d: Record<string, string>): boolean {
  if (d.webseite?.trim()) return true;
  const ts = Number(d.astro_ts);
  return !ts || Date.now() - ts < MIN_AUSFUELLZEIT_MS;
}

function jsonAntwort(success: boolean, data: string, status = 200) {
  return new Response(JSON.stringify({ success, data }), { status, headers: { 'Content-Type': 'application/json' } });
}
function safeFilename(name: string) {
  return (name || 'foto').replace(/[^\w.\-]+/g, '_').slice(0, 120);
}
// Mail-Header-Injektion vermeiden: keine Zeilenumbrüche in Betreff/Reply-To
const einzeilig = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export const POST: APIRoute = async ({ request }) => {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return jsonAntwort(false, 'Die Daten konnten nicht gelesen werden.', 400);
  }
  const d: Record<string, string> = {};
  let foto: File | null = null;
  for (const [key, value] of fd.entries()) {
    if (value instanceof File) {
      if (value.size > 0 && !foto) foto = value;
    } else {
      d[key] = value;
    }
  }

  if (istBot(d)) {
    console.warn('[erfahrung] Spam-Verdacht verworfen (Honeypot/Zeit-Check).');
    return jsonAntwort(true, 'Vielen Dank! Ihr Beitrag ist angekommen.');
  }
  if (!d.name?.trim() || !d.email?.trim() || !d.nachricht?.trim()) {
    return jsonAntwort(false, 'Bitte Name, E-Mail-Adresse und Ihre Nachricht angeben.', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) {
    return jsonAntwort(false, 'Bitte eine gültige E-Mail-Adresse angeben.', 400);
  }
  if (!d.einverstaendnis) {
    return jsonAntwort(false, 'Bitte dem Hinweis zur Veröffentlichung zustimmen.', 400);
  }
  if (d.nachricht.length > MAX_TEXT) {
    return jsonAntwort(false, `Die Nachricht ist zu lang (max. ${MAX_TEXT} Zeichen).`, 400);
  }
  if (foto) {
    const ext = path.extname(foto.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return jsonAntwort(false, `Bildformat "${ext || '(unbekannt)'}" wird nicht unterstützt (JPG, PNG oder WebP).`, 400);
    if (foto.size > MAX_FILE_BYTES) return jsonAntwort(false, 'Das Foto ist zu groß (max. 4 MB).', 400);
  }

  const name = einzeilig(d.name);
  const text =
    'Neuer Beitrag „IHR St. Bonifatius“ über sanktbonifatius.de/100-jahre/\n\n' +
    `Name: ${name}\n` +
    `E-Mail: ${einzeilig(d.email)}\n` +
    `Einverständnis zur Veröffentlichung auf der Website: ja (${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })})\n` +
    `Foto: ${foto ? 'im Anhang' : 'keines'}\n\n` +
    `— Nachricht —\n${d.nachricht.trim()}\n`;
  const attachments = foto ? [{ filename: safeFilename(foto.name), content: Buffer.from(await foto.arrayBuffer()) }] : [];

  // DEV-Modus: keine SMTP-Konfiguration → lokal ablegen
  if (!E.SMTP_HOST || !E.SMTP_USER || !E.SMTP_PASS) {
    try {
      const dir = path.resolve(process.cwd(), '.jubilaeum-eingaben');
      fs.mkdirSync(dir, { recursive: true });
      const stamp = Date.now();
      fs.writeFileSync(path.join(dir, `${stamp}_beitrag.txt`), text);
      for (const a of attachments) fs.writeFileSync(path.join(dir, `${stamp}_${a.filename}`), a.content);
      console.warn('[erfahrung] DEV-Modus: keine SMTP-Daten — gespeichert unter', dir);
      return jsonAntwort(true, 'Vielen Dank! (Testmodus: lokal gespeichert, kein Mailversand.)');
    } catch (err) {
      console.error('[erfahrung] DEV-Speichern fehlgeschlagen:', err);
      return jsonAntwort(false, 'Fehler beim Verarbeiten (Testmodus).', 500);
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
      to: E.JUBILAEUM_ERFAHRUNG_TO || TO_STD,
      replyTo: einzeilig(d.email),
      subject: `IHR St. Bonifatius: Beitrag von ${name}`,
      text,
      attachments,
    });
    return jsonAntwort(true, 'Vielen Dank! Ihr Beitrag ist angekommen. Wir melden uns bei Ihnen.');
  } catch (err) {
    console.error('[erfahrung] Mailversand fehlgeschlagen:', err);
    return jsonAntwort(false, 'Der Beitrag konnte nicht versendet werden. Bitte schreiben Sie uns eine E-Mail an w.otto@sanktbonifatius.de.', 502);
  }
};
