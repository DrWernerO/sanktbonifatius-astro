// Erzeugt verkleinerte Kopien (WebP, 480 px hoch) für alle Foto-Laufbänder (Marquees) und die
// Datei src/data/marquee-bilder.json mit den echten Pixelmaßen je Bild.
//
// Warum: Die Laufbänder zeigen die Fotos nur ca. 200–240 px hoch, luden aber die Originale
// (bis 21 MB). Außerdem braucht jedes <img> width/height, sonst „wandert" der Loop-Endpunkt der
// CSS-Animation, solange die Bilder laden (Fehler wie auf der Startseite, siehe PhotoMarquee.astro).
//
// Aufruf:  node scripts/marquee-bilder.mjs
// Quellen: src/data/marquee-quellen.json (Pfade der ORIGINALE, z. B. /uploads/2022/04/x.jpg).
//          Neues Foto ins Laufband → Pfad dort eintragen, Skript laufen lassen, committen.
// Ergebnis: public/uploads/marquee/<name>.webp (Originale bleiben unberührt) + marquee-bilder.json.
// Genutzt über src/lib/marquee.js (mq()).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const QUELLEN = path.join(ROOT, 'src/data/marquee-quellen.json');
const MANIFEST = path.join(ROOT, 'src/data/marquee-bilder.json');
const OUT_DIR = path.join(ROOT, 'public/uploads/marquee');
const HOEHE = 480; // 2 × die größte Anzeigehöhe (240 px) für scharfe Darstellung auf Retina

const quellen = JSON.parse(fs.readFileSync(QUELLEN, 'utf8'));
fs.mkdirSync(OUT_DIR, { recursive: true });

const manifest = {};
const namen = new Map();
let vorher = 0;
let nachher = 0;

for (const src of quellen) {
  const datei = path.join(ROOT, 'public', src);
  if (!fs.existsSync(datei)) {
    console.warn('FEHLT:', src);
    continue;
  }
  const name = path.basename(src, path.extname(src)).replace(/[^\w.-]+/g, '-');
  if (namen.has(name)) throw new Error(`Namenskollision: ${src} und ${namen.get(name)}`);
  namen.set(name, src);

  const ziel = path.join(OUT_DIR, name + '.webp');
  const info = await sharp(datei)
    .rotate() // EXIF-Drehung einrechnen (Browser tun das beim Anzeigen ebenfalls)
    .resize({ height: HOEHE, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(ziel);

  manifest[src] = { src: `/uploads/marquee/${name}.webp`, w: info.width, h: info.height };
  vorher += fs.statSync(datei).size;
  nachher += info.size;
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
const mb = (b) => (b / 1048576).toFixed(1) + ' MB';
console.log(`${Object.keys(manifest).length} Bilder: ${mb(vorher)} → ${mb(nachher)}`);
