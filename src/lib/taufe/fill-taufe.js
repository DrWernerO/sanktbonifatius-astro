// Füllt die ausfüllbare Taufe-Vorlage (taufe-vorlage.pdf) mit den Formulardaten
// und gibt die fertigen PDF-Bytes zurück. Reine JS (pdf-lib) — läuft auch serverless.
//
// Die Feldnamen des Web-Formulars (TaufeForm.astro) werden hier auf die PDF-Felder
// abgebildet. Wo das amtliche Formular Felder zusammenfasst (z. B. „Name, Vorname"
// oder „Straße, Hausnummer, Wohnort"), fügen wir die Einzelfelder zusammen.
import { PDFDocument } from 'pdf-lib';
import { taufeVorlageB64 } from './taufe-vorlage.b64.js';

// Vorlage als eingebettete Bytes (siehe scripts/build-taufe-vorlage.mjs) — host-unabhängig.
const TEMPLATE_BYTES = Uint8Array.from(atob(taufeVorlageB64), (c) => c.charCodeAt(0));

const join = (...parts) => parts.map((p) => (p || '').trim()).filter(Boolean).join(', ');

/**
 * @param {Record<string,string>} d  Formulardaten (FormData als Objekt)
 * @returns {Promise<Uint8Array>}    fertig ausgefülltes PDF
 */
export async function fillTaufeForm(d = {}) {
  const pdf = await PDFDocument.load(TEMPLATE_BYTES);
  const form = pdf.getForm();

  // Wunschtermin + Kontakt stehen NICHT auf dem amtlichen Formular → in die Bemerkungen.
  const zusatz = [];
  if (d.wunsch1_datum || d.wunsch1_ort) zusatz.push(`Wunschtermin 1: ${join(d.wunsch1_datum, d.wunsch1_ort)}`);
  if (d.wunsch2_datum || d.wunsch2_ort) zusatz.push(`Wunschtermin 2: ${join(d.wunsch2_datum, d.wunsch2_ort)}`);
  if (d.kontakt_telefon || d.kontakt_email) zusatz.push(`Kontakt: ${join(d.kontakt_telefon, d.kontakt_email)}`);
  const bemerkungen = [d.bemerkungen, zusatz.join('\n')].filter(Boolean).join('\n');

  const map = {
    // Täufling
    tauf_name: d.tauf_name,
    tauf_vorname: d.tauf_vorname,
    tauf_rufname: d.tauf_rufname,
    tauf_geschlecht: d.tauf_geschlecht,
    tauf_gebdat: d.tauf_gebdat,
    tauf_geburtsort: d.tauf_geburtsort,
    tauf_standesamt: d.tauf_standesamt,
    tauf_register: d.tauf_register,
    tauf_strasse: join(d.tauf_strasse, d.tauf_wohnort),
    // Vater / Mutter (Formular trennt Name/Vorname; Formular-PDF fasst zusammen)
    vater_name: join(d.vater_name, d.vater_vorname),
    vater_gebdat: d.vater_gebdat,
    vater_famstand: d.vater_famstand,
    vater_geburtsname: d.vater_geburtsname,
    vater_konfession: d.vater_konfession,
    mutter_name: join(d.mutter_name, d.mutter_vorname),
    mutter_gebdat: d.mutter_gebdat,
    mutter_famstand: d.mutter_famstand,
    mutter_geburtsname: d.mutter_geburtsname,
    mutter_konfession: d.mutter_konfession,
    // Paten
    pate1_name: d.pate1_name,
    pate1_konfession: d.pate1_konfession,
    pate1_strasse: d.pate1_strasse,
    pate2_name: d.pate2_name,
    pate2_konfession: d.pate2_konfession,
    pate2_strasse: d.pate2_strasse,
    // Weitere Angaben
    eltern_wohnung: join(d.eltern_strasse, d.eltern_wohnort),
    trauung: join(d.trauung, d.traudatum, d.trauort),
    bemerkungen,
  };

  for (const [name, value] of Object.entries(map)) {
    if (!value) continue;
    try { form.getTextField(name).setText(String(value)); } catch { /* Feld fehlt → überspringen */ }
  }

  // Einverständnis Veröffentlichung (Ja/Nein)
  if (d.veroeffentlichung === 'Ja' || d.veroeffentlichung === 'Nein') {
    try { form.getRadioGroup('veroeffentlichung').select(d.veroeffentlichung); } catch { /* ignore */ }
  }

  return pdf.save();
}
