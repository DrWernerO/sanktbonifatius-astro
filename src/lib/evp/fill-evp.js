// Füllt das amtliche Ehevorbereitungsprotokoll (evp-vorlage, echte AcroForm-Felder) mit den
// Angaben aus dem Web-Formular (EvpForm.astro). Reine JS (pdf-lib) — läuft auch serverless.
//
// Stand: Teil 1 (Seite 1: Kopf + Abschnitt A, Nr. 1–6, je Bräutigam/Braut). Weitere Teile
// (Nr. 7ff, Seiten 2–4) folgen — die Feldnamen der Vorlage sind bereits vorhanden.
//
// Feldnamen des Web-Formulars: `mann_*` / `frau_*` (Vertrag mit EvpForm.astro, NICHT umbenennen).
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { evpVorlageB64 } from './evp-vorlage.b64.js';

const TEMPLATE_BYTES = Uint8Array.from(atob(evpVorlageB64), (c) => c.charCodeAt(0));

const ORT_DATUM = 'Frankfurt am Main, ';
const BISTUM = 'Bistum Limburg';
const PFARREI = 'Pfarrei Sankt Bonifatius Frankfurt\nHolbeinstr. 70, 60596 Frankfurt am Main\nTelefon 069 / 6959 7585-0';

const t = (v) => (typeof v === 'string' ? v.trim() : '');
const join = (sep, ...parts) => parts.map(t).filter(Boolean).join(sep);

/** 2026-05-17 → 17.05.2026 (andere Eingaben bleiben unverändert). */
export function datum(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t(v));
  return m ? `${m[3]}.${m[2]}.${m[1]}` : t(v);
}

/** Zeichen, die Helvetica (WinAnsi) nicht kennt, durch Grundbuchstaben ersetzen (z. B. ł → l). */
function sanitize(text, font) {
  const cs = new Set(font.getCharacterSet());
  let out = '';
  for (const ch of String(text).replace(/\r/g, '')) {
    const cp = ch.codePointAt(0);
    if (ch === '\n' || cs.has(cp)) { out += ch; continue; }
    const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const m = { 'ł': 'l', 'Ł': 'L', 'đ': 'd', 'Đ': 'D', 'ø': 'o', 'Ø': 'O', 'ı': 'i', 'ß': 'ss' }[ch];
    const rep = m ?? base;
    out += [...rep].every((c) => cs.has(c.codePointAt(0))) ? rep : '?';
  }
  return out;
}

/** Zeilenumbruch wie ein PDF-Viewer (Wortgrenzen), liefert Zeilenanzahl. */
function zeilen(text, font, size, maxW) {
  let n = 0;
  for (const absatz of text.split('\n')) {
    let cur = '';
    n += 1;
    for (const wort of absatz.split(/\s+/)) {
      const probe = cur ? `${cur} ${wort}` : wort;
      if (font.widthOfTextAtSize(probe, size) <= maxW || !cur) cur = probe;
      else { n += 1; cur = wort; }
    }
  }
  return n;
}

/** Text setzen; Schrift (max. 8 pt) verkleinern, bis er ins Feld passt. */
function setze(form, font, name, wert) {
  const text = sanitize(t(wert), font);
  if (!text) return;
  let field;
  try { field = form.getTextField(name); } catch { return; }
  const w = field.acroField.getWidgets()[0].getRectangle();
  const multi = field.isMultiline();
  const maxW = w.width - 4;
  let size = 8;
  while (size > 5) {
    const lh = size * 1.15;
    const passt = multi
      ? zeilen(text, font, size, maxW) * lh <= w.height - 2
      : font.widthOfTextAtSize(text, size) <= maxW;
    if (passt) break;
    size -= 0.5;
  }
  field.setText(text);
  field.setFontSize(size);
  field.defaultUpdateAppearances(font);
}

/** Antworten einer Person (Präfix mann_/frau_) → PDF-Feldwerte (Suffix _Mann/_Frau). */
function person(d, p) {
  const g = (k) => t(d[`${p}_${k}`]);
  const vornamen = g('vornamen');
  const ruf = g('rufname');
  const vorname = ruf && ruf !== vornamen && vornamen.split(/\s+/).length > 1
    ? `${vornamen} (Rufname: ${ruf})` : vornamen;

  // Taufe (Datum + Pfarrei mit Anschrift) und Nachweis in einem Feld
  let taufe = '';
  if (g('getauft') === 'Nein') taufe = 'nicht getauft';
  else {
    const a = join(', ', datum(g('taufdatum')), g('taufpfarrei'));
    const n = g('taufnachweis') ? `Nachweis: ${g('taufnachweis')}` : '';
    taufe = join('\n', a, n);
  }

  let firmung = '';
  if (g('gefirmt') === 'Ja') firmung = join(', ', datum(g('firmdatum')), g('firmort'));
  else if (g('gefirmt') === 'Nein') firmung = 'nicht gefirmt';
  else if (g('gefirmt') === 'Weiß nicht') firmung = 'nicht bekannt';

  let austritt = '';
  if (g('austritt') === 'Ja') {
    austritt = join('\n',
      `Austritt: ${join(', ', datum(g('austritt_datum')), g('austritt_ort'), g('austritt_weise'))}`,
      g('wiederaufnahme') === 'Ja'
        ? `Wiederaufnahme: ${join(', ', datum(g('wiederaufnahme_datum')), g('wiederaufnahme_ort'))}`
        : 'Keine Wiederaufnahme');
  }

  const wohnsitz = join('\n',
    join(', ', join(' ', g('plz'), g('ort')), g('strasse')),
    g('nebenwohnsitz') ? `Nebenwohnsitz/Aufenthalt im letzten Monat: ${g('nebenwohnsitz')}` : '');

  const elter = (k) => ({
    name: join(' ', g(`${k}_vorname`), g(`${k}_name`)),
    geb: join(', ', g(`${k}_geburtsname`) ? `geb. ${g(`${k}_geburtsname`)}` : '', g(`${k}_konfession`)),
  });
  const v = elter('vater');
  const m = elter('mutter');

  return {
    Name: g('familienname'),
    Geburtsname: g('geburtsname'),
    Vorname: vorname,
    Geburtsdatum: datum(g('geburtsdatum')),
    Geburtsort: join(', ', g('geburtsort'), g('geburtsland')),
    Staatsangehoerigkeit: g('staatsangehoerigkeit'),
    Konfession: join(', ', g('konfession'), g('konfession_zusatz')),
    Taufe: taufe,
    Firmung: firmung,
    Religion_Alt: g('frueher_konfession'),
    Austritt: austritt,
    Wohnsitz: wohnsitz,
    Standortpfarrer: g('soldat') === 'Ja' ? g('militaerpfarramt') : '',
    Vatername: v.name,
    Vatergeburtsname: v.geb,
    Muttername: m.name,
    Muttergeburtsname_: m.geb, // Feld heißt in der Vorlage „01_Muttergeburtsname__Mann" (Doppel-_)
    Ledigenstand: g('ledigennachweis'),
    Ehename: g('ehename'),
  };
}

/**
 * @param {Record<string,string>} d  Formulardaten (FormData als Objekt)
 * @returns {Promise<Uint8Array>}    fertig ausgefülltes PDF (alle 8 Seiten des amtlichen Formulars)
 */
export async function fillEvpForm(d = {}) {
  const pdf = await PDFDocument.load(TEMPLATE_BYTES);
  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  // Kopf: Bistum + Pfarrei, „Ort, Datum"-Zeilen (Datum handschriftlich ergänzen)
  setze(form, font, '01_Dioezese', BISTUM);
  setze(form, font, '01_Pfarrei', PFARREI);
  for (const f of form.getFields()) {
    if (f.getName().includes('Ort_Datum')) {
      const tf = form.getTextField(f.getName());
      tf.setText(ORT_DATUM);
      tf.defaultUpdateAppearances(font);
    }
  }

  // Abschnitt A: je Bräutigam / Braut
  for (const [prefix, suffix] of [['mann', 'Mann'], ['frau', 'Frau']]) {
    const werte = person(d, prefix);
    for (const [feld, wert] of Object.entries(werte)) {
      const name = feld === 'Muttergeburtsname_' ? `01_Muttergeburtsname__${suffix}` : `01_${feld}_${suffix}`;
      setze(form, font, name, wert);
    }
    const soldat = t(d[`${prefix}_soldat`]);
    if (soldat === 'Ja' || soldat === 'Nein') {
      try { form.getRadioGroup(`01_Soldat_${suffix}`).select(soldat); } catch { /* ignore */ }
    }
  }

  // Nur die selbst gesetzten Textfelder bekommen neue Darstellungen (oben); die Kästchen/Radios
  // behalten ihr Original-Aussehen (pdf-lib würde sie sonst durch eigene Symbole ersetzen).
  return pdf.save({ updateFieldAppearances: false });
}
