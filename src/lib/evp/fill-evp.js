// Füllt das amtliche Ehevorbereitungsprotokoll (evp-vorlage, echte AcroForm-Felder) mit den
// Angaben aus dem Web-Formular (EvpForm.astro). Reine JS (pdf-lib) — läuft auch serverless.
//
// Stand: kompletter Abschnitt A (Nr. 1–9, je Bräutigam/Braut) + geplante Eheschließung im Kopf.
// Die weiteren Teile (Abschnitt B ff.) werden beim Traugespräch ausgefüllt.
//
// Feldnamen des Web-Formulars: `mann_*` / `frau_*` (Vertrag mit EvpForm.astro, NICHT umbenennen).
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { evpVorlageB64 } from './evp-vorlage.b64.js';

const TEMPLATE_BYTES = Uint8Array.from(atob(evpVorlageB64), (c) => c.charCodeAt(0));

const ORT_DATUM = 'Frankfurt am Main, ';
const BISTUM = 'Bistum Limburg';
const PFARREI = 'Pfarrei Sankt Bonifatius Frankfurt\nHolbeinstr. 70\n60596 Frankfurt am Main\nTelefon 069 / 6959 7585-0';

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

/** Text setzen; Schrift (max. `max` pt, Standard 10) verkleinern, bis er ins Feld passt. */
function setze(form, font, name, wert, max = 10) {
  const text = sanitize(t(wert), font);
  if (!text) return;
  let field;
  try { field = form.getTextField(name); } catch { return; }
  const w = field.acroField.getWidgets()[0].getRectangle();
  const multi = field.isMultiline();
  const maxW = w.width - 4;
  let size = max;
  while (size > 6) {
    const lh = size * 1.15;
    const passt = multi
      ? zeilen(text, font, size, maxW) * lh <= w.height - 2
      : font.widthOfTextAtSize(text, size) <= maxW && size * 1.2 <= w.height;
    if (passt) break;
    size -= 0.5;
  }
  field.setText(text);
  field.setFontSize(size);
  field.defaultUpdateAppearances(font);
}

/** Antworten einer Person (Präfix mann_/frau_) → PDF-Feldwerte (Feldname ohne Suffix _Mann/_Frau). */
function person(d, p) {
  const g = (k) => t(d[`${p}_${k}`]);
  const vornamen = g('vornamen');
  const ruf = g('rufname');
  const vorname = ruf && ruf !== vornamen && vornamen.split(/\s+/).length > 1
    ? `${vornamen} (Rufname: ${ruf})` : vornamen;

  // Taufe (Datum + Pfarrei mit Anschrift). Der Nachweis wird vom Pfarrbüro ergänzt.
  const taufe = g('getauft') === 'Nein' ? 'nicht getauft' : join(', ', datum(g('taufdatum')), g('taufpfarrei'));

  let firmung = '';
  if (g('gefirmt') === 'Ja') firmung = join(', ', datum(g('firmdatum')), g('firmort'));
  else if (g('gefirmt') === 'Nein') firmung = 'nicht gefirmt';
  else if (g('gefirmt') === 'Weiß nicht') firmung = 'nicht bekannt';

  let austritt = '';
  if (g('austritt') === 'Ja') {
    austritt = join('\n',
      `Austritt: ${join(', ', datum(g('austritt_datum')), g('austritt_ort'))}`,
      g('wiederaufnahme') === 'Ja'
        ? `Wiederaufnahme: ${join(', ', datum(g('wiederaufnahme_datum')), g('wiederaufnahme_ort'))}`
        : 'Keine Wiederaufnahme');
  }

  const wohnsitz = join(', ', join(' ', g('plz'), g('ort')), g('strasse'));

  const elter = (k) => ({
    name: join(' ', g(`${k}_vorname`), g(`${k}_name`)),
    geb: join(', ', g(`${k}_geburtsname`) ? `geb. ${g(`${k}_geburtsname`)}` : '', g(`${k}_konfession`)),
  });
  const v = elter('vater');
  const m = elter('mutter');

  // Nr. 7: frühere Ehe(n)
  let vorehe = '', voreheTod = '', voreheNichtigkeit = '';
  if (g('vorehe') === 'Ja') {
    const ende = g('vorehe_ende');
    vorehe = g('vorehe_partner');
    if (ende === 'Scheidung (standesamtlich)') vorehe = join('; ', vorehe, `standesamtlich geschieden${g('vorehe_datum') ? ` am ${datum(g('vorehe_datum'))}` : ''}`);
    if (ende === 'Tod des Partners' && g('vorehe_datum')) voreheTod = `Sterbedatum: ${datum(g('vorehe_datum'))}`;
    if (ende === 'Kirchliche Nichtigkeitserklärung') voreheNichtigkeit = g('vorehe_nichtigkeit');
  } else if (g('vorehe') === 'Nein') vorehe = 'Keine frühere Eheschließung';

  // Nr. 8a: Kinder aus früherer Verbindung (Verpflichtungen/Gefährdung 8a/8b beurteilt das Pfarrbüro)
  let verp1 = '';
  if (g('kinder_frueher') === 'Ja') {
    verp1 = join('; ', ...g('kinder_frueher_liste').split(/\n+/));
    verp1 = verp1 ? `Kinder aus früherer Verbindung: ${verp1}` : 'Kinder aus früherer Verbindung: ja';
  }

  return {
    '01_Name': g('familienname'),
    '01_Geburtsname': g('geburtsname'),
    '01_Vorname': vorname,
    '01_Geburtsdatum': datum(g('geburtsdatum')),
    '01_Geburtsort': join(', ', g('geburtsort'), g('geburtsland')),
    '01_Staatsangehoerigkeit': g('staatsangehoerigkeit'),
    '01_Konfession': join(', ', g('konfession'), g('konfession_zusatz')),
    '01_Taufe': taufe,
    '01_Firmung': firmung,
    '01_Religion_Alt': g('frueher_konfession'),
    '01_Austritt': austritt,
    '01_Wohnsitz': wohnsitz,
    '01_Vatername': v.name,
    '01_Vatergeburtsname': v.geb,
    '01_Muttername': m.name,
    '01_Muttergeburtsname_': m.geb, // in der Vorlage „01_Muttergeburtsname__Mann" (Doppel-_)
    '01_Ehename': g('ehename'),
    '02_Vorehe': vorehe,
    '02_Vorehe_Tod': voreheTod,
    '02_Vorehe_Nichtigkeit': voreheNichtigkeit,
    '02_Verpflichtung1': verp1,
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
  setze(form, font, '01_Pfarrei', PFARREI, 10.5);
  for (const f of form.getFields()) {
    if (f.getName().includes('Ort_Datum')) {
      const tf = form.getTextField(f.getName());
      tf.setText(ORT_DATUM);
      tf.defaultUpdateAppearances(font);
    }
  }

  // Abschnitt A: je Bräutigam / Braut
  for (const [prefix, suffix] of [['mann', 'Mann'], ['frau', 'Frau']]) {
    for (const [feld, wert] of Object.entries(person(d, prefix))) {
      setze(form, font, `${feld}_${suffix}`, wert);
    }
    // Soldat/Soldatin: kommt praktisch nicht vor → im Formular immer „nein" angekreuzt
    try { form.getRadioGroup(`01_Soldat_${suffix}`).select('Nein'); } catch { /* ignore */ }
  }

  // Nr. 9: gemeinsame Kinder (ein Feld für beide)
  if (t(d.kinder) === 'Ja') setze(form, font, '02_Kinder', join('; ', ...t(d.kinder_liste).split(/\n+/)));
  else if (t(d.kinder) === 'Nein') setze(form, font, '02_Kinder', 'Nein');

  // Kopf: Wohnsitz nach der Eheschließung (Adresse + Telefon)
  const adresse = (p) => join(', ', t(d[`${p}_strasse`]), join(' ', d[`${p}_plz`], d[`${p}_ort`]));
  const wohnsitz = t(d.ehewohnsitz) === 'Bräutigam' ? adresse('mann')
    : t(d.ehewohnsitz) === 'Braut' ? adresse('frau')
    : t(d.ehewohnsitz) === 'Neu' ? join(', ', d.ehewohnsitz_strasse, join(' ', d.ehewohnsitz_plz, d.ehewohnsitz_ort)) : '';
  // Das Feld der Vorlage überdeckt auch die gedruckte Beschriftung: auf eine einzeilige Fläche über der
  // ersten Schreiblinie zurechtgestutzt, Adresse und Telefon in einer Zeile.
  if (wohnsitz) {
    const f = form.getTextField('01_Ehewohnsitz');
    f.disableMultiline();
    f.acroField.getWidgets()[0].setRectangle({ x: 58, y: 554, width: 246, height: 11.5 });
    setze(form, font, '01_Ehewohnsitz', join(', ', wohnsitz, t(d.kontakt_telefon) ? `Tel. ${t(d.kontakt_telefon)}` : ''), 9);
  }

  // Seite 4: Trauzeugen (Name + Anschrift)
  setze(form, font, '04_Trauzeuge1a', d.zeuge1_name);
  setze(form, font, '04_Trauzeuge1b', d.zeuge1_anschrift);
  setze(form, font, '04_Trauzeuge2a', d.zeuge2_name);
  setze(form, font, '04_Trauzeuge2b', d.zeuge2_anschrift);

  // Kopf: geplante Eheschließung (soweit bekannt)
  setze(form, font, '01_Zivilehe_Datum', datum(d.zivil_datum));
  setze(form, font, '01_Zivilehe_Ort', d.zivil_ort);
  setze(form, font, '01_Kath_Ehe_Datum', datum(d.kath_datum));
  setze(form, font, '01_Kath_Ehe_Uhrzeit', d.kath_uhrzeit);
  setze(form, font, '01_Kath_Ehe_Ort', d.kath_ort);

  // Nur die selbst gesetzten Textfelder bekommen neue Darstellungen (oben); die Kästchen/Radios
  // behalten ihr Original-Aussehen (pdf-lib würde sie sonst durch eigene Symbole ersetzen).
  return pdf.save({ updateFieldAppearances: false });
}
