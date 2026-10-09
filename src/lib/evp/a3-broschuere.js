// Macht aus dem (ausgefüllten) 8-seitigen A4-EVP die A3-Broschüre: Seiten 1–4 des Formulars auf zwei
// A3-Querblättern (je zwei A4-Seiten im Maßstab 1:1 nebeneinander), so dass sich das Blatt doppelseitig
// (Wenden an der kurzen Kante) ausdrucken und in der Mitte falten lässt wie das gefaltete A3-Original:
//   Blatt 1 (außen):  Seite 4 | Seite 1      Blatt 2 (innen):  Seite 2 | Seite 3
// Die ausfüllbaren Felder bleiben erhalten: die vorhandenen Feld-Widgets (samt Darstellung und Inhalt)
// werden auf die neuen Seiten verschoben; die Seiteninhalte werden als Form-XObjects eingebettet.
// Die Anmerkungen (Seiten 5–8 des Originals) gehören nicht in die Broschüre.
import { PDFDocument, PDFName, PDFArray, PDFNumber, PDFDict } from 'pdf-lib';

const A3_W = 1190.55;
const A3_H = 841.89;
const HALF = A3_W / 2;

// [links, rechts] als 0-basierte Seitenindizes des A4-Originals
const BLAETTER = [[3, 0], [1, 2]];

/**
 * @param {Uint8Array} a4Bytes  fertig ausgefülltes A4-EVP (Original, 8 Seiten)
 * @returns {Promise<Uint8Array>} A3-Broschüre (2 Seiten, ausfüllbar)
 */
export async function makeA3Booklet(a4Bytes) {
  const pdf = await PDFDocument.load(a4Bytes);
  const ctx = pdf.context;
  const alt = pdf.getPages();
  const anzahlAlt = alt.length;

  for (const [links, rechts] of BLAETTER) {
    const neu = pdf.addPage([A3_W, A3_H]);
    const annots = ctx.obj([]);
    for (const [idx, dx] of [[links, 0], [rechts, HALF]]) {
      const quelle = alt[idx];
      const eingebettet = await pdf.embedPage(quelle);
      neu.drawPage(eingebettet, { x: dx, y: 0, width: quelle.getWidth(), height: quelle.getHeight() });

      // Widgets/Anmerkungen der Quellseite auf die neue Seite verschieben
      const a = quelle.node.Annots();
      if (!a) continue;
      for (let i = 0; i < a.size(); i++) {
        const ref = a.get(i);
        const dict = ctx.lookup(ref, PDFDict);
        const rect = dict.lookup(PDFName.of('Rect'), PDFArray);
        const [x1, y1, x2, y2] = [0, 1, 2, 3].map((k) => rect.lookup(k, PDFNumber).asNumber());
        dict.set(PDFName.of('Rect'), ctx.obj([x1 + dx, y1, x2 + dx, y2]));
        dict.set(PDFName.of('P'), neu.ref);
        annots.push(ref);
      }
    }
    neu.node.set(PDFName.of('Annots'), annots);
  }

  // Originalseiten entfernen (von hinten, damit die Indizes stimmen)
  for (let i = anzahlAlt - 1; i >= 0; i--) pdf.removePage(i);
  return pdf.save({ updateFieldAppearances: false });
}
