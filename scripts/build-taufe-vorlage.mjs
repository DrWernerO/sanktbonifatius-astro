// Erzeugt die ausfüllbare Taufe-Vorlage aus dem leeren Diözesan-Rohling.
//   Eingang:  scripts/taufe-assets/taufe-rohling.pdf  +  logo-rgb.png
//   Ausgang:  src/lib/taufe/taufe-vorlage.pdf  (AcroForm, 36 Felder, neuer Pfarrei-Kopf)
//
// Aufruf:  node scripts/build-taufe-vorlage.mjs
//
// Die Feld-Koordinaten stammen aus dem echten Linienraster des Formulars
// (per `pdftocairo -svg` ausgemessen) — siehe ASTRO-HANDBUCH 13b.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT    = path.resolve(__dirname, '..');
const SRC     = path.join(ROOT, 'scripts/taufe-assets/taufe-rohling.pdf');
const LOGO    = path.join(ROOT, 'scripts/taufe-assets/logo-rgb.png');
const OUT     = path.join(ROOT, 'src/lib/taufe/taufe-vorlage.pdf');
const OUT_B64 = path.join(ROOT, 'src/lib/taufe/taufe-vorlage.b64.js');

const PAGE_H = 842;

const pdf  = await PDFDocument.load(fs.readFileSync(SRC));
const page = pdf.getPages()[0];
const helv  = await pdf.embedFont(StandardFonts.Helvetica);
const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
const form  = pdf.getForm();

// 1) Kopfbereich links leeren (NICHT bis zur Trennlinie x=426,5!)
page.drawRectangle({ x: 41.5, y: PAGE_H - (23 + 74.5), width: 383, height: 74.5, color: rgb(1, 1, 1) });
// Trennlinie Pfarrei | Nummern-Box sauber durchziehen
page.drawLine({ start: { x: 426.5, y: PAGE_H - 16.2 }, end: { x: 426.5, y: PAGE_H - 134.5 }, thickness: 0.75, color: rgb(0, 0, 0) });
// Feste „0000" bei Seite / Lfd. Nr. entfernen (werden unten zu Feldern)
page.drawRectangle({ x: 428,  y: PAGE_H - 97, width: 60.5, height: 20, color: rgb(1, 1, 1) }); // Seite
page.drawRectangle({ x: 490,  y: PAGE_H - 97, width: 61.8, height: 20, color: rgb(1, 1, 1) }); // Lfd. Nr.

// 2) Logo + Pfarrei-Text
const logoImg = await pdf.embedPng(fs.readFileSync(LOGO));
const logoH = 40, logoW = logoH * (logoImg.width / logoImg.height);
page.drawImage(logoImg, { x: 48, y: PAGE_H - (27 + logoH), width: logoW, height: logoH });
const tx = 48 + logoW + 16;
const T = (txt, ytop, font, size, col) =>
  page.drawText(txt, { x: tx, y: PAGE_H - ytop, size, font, color: col || rgb(0.1, 0.1, 0.1) });
T('Pfarrei Sankt Bonifatius Frankfurt', 34, helvB, 9.5);
T('Holbeinstr. 70, 60596 Frankfurt am Main', 47, helv, 8.5);
T('Telefon 069 / 6959 7585-0', 59, helv, 8.5);
T('info@sanktbonifatius.de', 71, helv, 8.5);
T('Diözese Limburg', 83, helv, 8.5, rgb(0.45, 0.45, 0.45));

// 3) Felder exakt in die Zellen (xL..xR, top..bottom in top-origin)
const mk = (name, xL, xR, top, bottom, opts = {}) => {
  const f = form.createTextField(name);
  if (opts.multiline) f.enableMultiline();
  f.addToPage(page, { x: xL, y: PAGE_H - bottom, width: xR - xL, height: bottom - top, borderWidth: 0 });
  f.setFontSize(opts.size || 10);
};
const XL = 112, XDIV = 426.5, XR = 551, X_GEB = 201.8, X_FAM = 498.5;

mk('tauf_name', XL, XDIV, 147.3, 161.5);
mk('tauf_geschlecht', XDIV, XR, 147.3, 161.5);
mk('tauf_vorname', XL, XDIV, 174.3, 188.5);
mk('tauf_rufname', XDIV, XR, 174.3, 188.5);
mk('tauf_gebdat', XL, X_GEB, 201.3, 215.4);
mk('tauf_geburtsort', X_GEB, XR, 201.3, 215.4);
mk('tauf_standesamt', XL, XDIV, 228.3, 242.4);
mk('tauf_register', XDIV, XR, 228.3, 242.4);
mk('tauf_strasse', XL, XR, 255.3, 269.4);

mk('vater_name', XL, XDIV, 290.5, 305.4);
mk('vater_gebdat', XDIV, X_FAM, 290.5, 305.4);
mk('vater_famstand', X_FAM, XR, 290.5, 305.4, { size: 9 });
mk('vater_geburtsname', XL, XDIV, 317.8, 333.2);
mk('vater_konfession', XDIV, XR, 317.8, 333.2);

mk('mutter_name', XL, XDIV, 345.4, 361.9);
mk('mutter_gebdat', XDIV, X_FAM, 345.4, 361.9);
mk('mutter_famstand', X_FAM, XR, 345.4, 361.9, { size: 9 });
mk('mutter_geburtsname', XL, XDIV, 377.6, 392.3);
mk('mutter_konfession', XDIV, XR, 377.6, 392.3);

mk('pate1_name', XL, XDIV, 415.6, 429.5);
mk('pate1_konfession', XDIV, XR, 415.6, 429.5);
mk('pate1_strasse', XL, XR, 443.2, 457.2);
mk('pate2_name', XL, XDIV, 469.8, 483.6);
mk('pate2_konfession', XDIV, XR, 469.8, 483.6);
mk('pate2_strasse', XL, XR, 497.4, 511.3);

mk('eltern_wohnung', XL, XR, 534.7, 547.6);
mk('trauung', XL, XR, 560.8, 574.7);

mk('taufdatum', XL, X_GEB, 598.6, 612.2);
mk('name_taufender', X_GEB, XR, 627.0, 640.6, { size: 9 });
mk('bemerkungen', XL, XR, 654.4, 685.9, { multiline: true, size: 9 });

const rg = form.createRadioGroup('veroeffentlichung');
rg.addOptionToPage('Ja',   page, { x: 451.9, y: PAGE_H - 710.5, width: 11, height: 11, borderWidth: 0 });
rg.addOptionToPage('Nein', page, { x: 486.9, y: PAGE_H - 710.5, width: 11, height: 11, borderWidth: 0 });

// Nummern-Box oben rechts (vom Pfarrbüro auszufüllen)
mk('seite', 428, 488.5, 77, 96, { size: 9 });
mk('lfd_nr', 490, 551, 77, 96, { size: 9 });

mk('unterschrift_datum', 120.4, 255.3, 724.0, 738.2, { size: 9 });
mk('anmeldedatum', 42, 156.8, 772.3, 789);
mk('eintragung_taufbuch', 156.8, 291.6, 772.3, 789);
mk('name_eintragenden', 291.6, 435.4, 772.3, 789);
mk('zu_den_akten', 435.4, 551, 772.3, 789);

const bytes = await pdf.save();
fs.writeFileSync(OUT, bytes);
// Zusätzlich als eingebettetes Base64-Modul, damit die Vorlage in jedem Build/Host
// (node, Netlify-Serverless) sicher mitgebündelt wird — ohne Datei-System-Abhängigkeit.
const b64 = Buffer.from(bytes).toString('base64');
fs.writeFileSync(OUT_B64,
  '// AUTO-GENERIERT von scripts/build-taufe-vorlage.mjs — NICHT von Hand bearbeiten.\n' +
  'export const taufeVorlageB64 =\n  "' + b64 + '";\n');
console.log('OK ->', path.relative(ROOT, OUT), '+ .b64.js | Felder:', form.getFields().length);
