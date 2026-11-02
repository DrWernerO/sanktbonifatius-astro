// Bild-Attribute für Foto-Laufbänder (Marquees): verkleinerte WebP-Kopie + echte Pixelmaße.
// Erzeugt von scripts/marquee-bilder.mjs (Quelle: src/data/marquee-quellen.json).
//
// width/height auf JEDEM <img> sind Pflicht: Der Track (width:max-content) und damit der
// -50%-Endpunkt der Loop-Animation hängen von der Gesamtbreite aller Bilder ab. Ohne bekannte
// Maße ändert sich die Breite, während die Bilder laden → der Loop „wandert" (Startseite 23.09.2026,
// Kirchort Herz Jesu 02.11.2026).
//
// Verwendung:  <img {...mq('/uploads/2022/04/x.jpg')} alt="…" />
import manifest from '../data/marquee-bilder.json';

export function mq(src) {
  const m = manifest[src];
  if (!m) {
    console.warn(`[marquee] Kein verkleinertes Bild für ${src} — in src/data/marquee-quellen.json eintragen und "node scripts/marquee-bilder.mjs" ausführen.`);
    return { src };
  }
  return { src: m.src, width: m.w, height: m.h };
}
