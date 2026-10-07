// Bettet das amtliche, bereits ausfüllbare Ehevorbereitungsprotokoll (Deutsche Bischofskonferenz,
// Stand 05/2022, 8 Seiten, echte AcroForm-Felder) als Base64-Modul ein — host-unabhängig, wie bei
// der Taufe-Vorlage (scripts/build-taufe-vorlage.mjs). Das PDF wird NICHT verändert.
//
// Aufruf:  node scripts/build-evp-vorlage.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'scripts/evp-assets/evp-rohling.pdf');
const OUT = path.join(ROOT, 'src/lib/evp/evp-vorlage.b64.js');

const b64 = fs.readFileSync(SRC).toString('base64');
fs.writeFileSync(OUT,
  '// AUTO-GENERIERT von scripts/build-evp-vorlage.mjs — NICHT von Hand bearbeiten.\n' +
  'export const evpVorlageB64 =\n  "' + b64 + '";\n');
console.log('OK ->', path.relative(ROOT, OUT));
