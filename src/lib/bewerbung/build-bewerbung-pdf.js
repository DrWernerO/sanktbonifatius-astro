// Baut eine einfache PDF-Zusammenfassung einer Kita-Bewerbung (Freitext-Layout mit
// pdf-lib) — anders als bei der Taufanmeldung gibt es hier keine amtliche Formularvorlage.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const A4 = [595.28, 841.89];
const MARGIN = 56;

function wrapText(text, font, size, maxWidth) {
  const lines = [];
  for (const rawLine of String(text || '').split('\n')) {
    const words = rawLine.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(test, size) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * @param {Record<string,string>} d  Formulardaten (FormData als Objekt)
 * @returns {Promise<Uint8Array>}
 */
export async function buildBewerbungPdf(d = {}) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = A4[0] - MARGIN * 2;
  const ink = rgb(0.16, 0.14, 0.13);

  let page = pdf.addPage(A4);
  let y = A4[1] - MARGIN;

  function ensureSpace(h) {
    if (y < MARGIN + h) {
      page = pdf.addPage(A4);
      y = A4[1] - MARGIN;
    }
  }

  function draw(text, { size = 11, useFont = font, gap = 6 } = {}) {
    for (const line of wrapText(text, useFont, size, maxWidth)) {
      ensureSpace(size + gap);
      page.drawText(line, { x: MARGIN, y, size, font: useFont, color: ink });
      y -= size + gap;
    }
  }

  function heading(text, size = 14) {
    y -= 4;
    draw(text, { size, useFont: bold, gap: 10 });
  }

  function field(label, value) {
    if (!value || !String(value).trim()) return;
    draw(`${label}: ${value}`.trim());
  }

  heading('Bewerbung über sanktbonifatius.de', 16);
  field('Stelle', d.job_titel);

  heading('Bewerber:in');
  field('Name', `${d.bew_vorname || ''} ${d.bew_name || ''}`.trim());
  field('E-Mail', d.bew_email);
  field('Telefon', d.bew_telefon);
  field('Frühester Eintritt', d.bew_eintritt);

  if (d.bew_nachricht?.trim()) {
    heading('Nachricht');
    draw(d.bew_nachricht);
  }

  return pdf.save();
}
