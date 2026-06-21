# Unsere neue Website — verständlich erklärt

*Ein Info-Blatt für das Seelsorgeteam zur geplanten Umstellung der Pfarrei-Website*

---

## Worum geht es?

Unsere Website soll technisch auf ein moderneres, stabileres Fundament gestellt werden.
Das klingt nach IT-Kauderwelsch — ist aber mit einem einfachen Bild gut zu verstehen.

Stellen wir uns die Website als **Geschäft** vor:
- Im **Lagerhaus** (hinten) liegen alle Inhalte: Texte, Bilder, Termine, Beiträge.
- Im **Schaufenster** (vorne) sehen die Besucher die fertig dekorierte Auslage.

---

## Wie es heute ist: alles in einem Gebäude (WordPress)

Heute sind Lagerhaus und Schaufenster **dasselbe Gebäude** — das ist WordPress.
Wer etwas einräumt, dekoriert gleichzeitig das Schaufenster mit.

Das hat in der Praxis zu Problemen geführt:

- **Alles hängt zusammen.** Wird hinten im Lager etwas umgestellt, wackelt vorne das
  Schaufenster. Eine kleine Änderung kann unerwartet eine ganz andere Seite zerstören.
- **Komplizierte Spezial-Lösungen** mussten direkt ins Schaufenster gebastelt werden —
  obwohl WordPress dafür nicht gemacht ist. Genau das hat unser Dienstleister Modulart
  kritisiert: Aufwändiges gehört nicht ins WordPress hineingezwängt.
- **Langsam und schwer wartbar.** Je mehr Spezial-Einbauten, desto fehleranfälliger
  und unübersichtlicher wird das Ganze.
- **Sicherheit & Tempo.** Ein einziges großes Gebäude ist anfälliger und träger als
  ein schlankes, modernes Schaufenster.

---

## Die neue Idee: Lagerhaus und Schaufenster trennen

Die Lösung heißt **„Headless WordPress mit Astro"** — und bedeutet schlicht:

> **Wir trennen Lagerhaus und Schaufenster in zwei Gebäude.**

- **Das Lagerhaus bleibt WordPress.** Hier pflegen unsere Sekretärinnen weiterhin
  Termine, Beiträge und Inhalte — **genau wie bisher, ohne Umlernen.**
- **Das Schaufenster wird neu — mit „Astro".** Astro ist eine moderne Technik, die nur
  fürs Anzeigen zuständig ist. Es holt sich die Inhalte aus dem Lagerhaus und präsentiert
  sie schnell, schön und stabil.

„Headless" („kopflos") heißt einfach: Das Lagerhaus hat kein eigenes Schaufenster mehr —
es liefert nur noch die Waren. Das Schaufenster ist ein eigenständiges, schlankes Gebäude.

---

## Was ist eigentlich „Astro"?

Astro ist **keine Programmiersprache**, sondern ein moderner **Bausatz zum Bauen von
Websites** — wie ein Werkzeugkasten mit Bauanleitung.

- Eine *Programmiersprache* ist wie eine **Sprache** (Vokabeln + Grammatik).
- Ein *Framework* wie Astro ist ein **vorgefertigtes Bauset** in dieser Sprache: Es nimmt
  die immer gleiche Grundarbeit ab und gibt eine sinnvolle Struktur vor.

Der entscheidende Trick: **Astro baut die Seiten schon im Voraus als fertige Auslage.**
Statt bei jedem Besucher erst aufwändig eine Seite zusammenzurechnen (wie WordPress es tut),
liegt das fertige Schaufenster bereit und wird nur noch serviert. Deshalb ist eine
Astro-Seite **schnell**, **sicher** und **stabil**.

> **In einem Satz:** Astro ist ein moderner Bausatz, der aus den üblichen Web-Bausteinen ein
> besonders schnelles und robustes Schaufenster zusammensetzt — das sich die Waren aus
> unserem WordPress-Lager holt.

---

## Was haben wir davon? (Die Vorteile)

| Vorteil | Was das konkret bedeutet |
|---------|--------------------------|
| **Stabilität** | Änderungen im Lager zerstören nicht mehr das Schaufenster. Beide Gebäude sind getrennt. |
| **Tempo** | Das schlanke Astro-Schaufenster lädt deutlich schneller — gut für Besucher und für Google. |
| **Sicherheit** | Das öffentliche Schaufenster enthält keine Lager-Technik mehr, die angegriffen werden könnte. |
| **Unabhängigkeit** | Wir sind weniger von einzelnen Dienstleistern und WordPress-Eigenheiten abhängig. |
| **Vertrautheit bleibt** | Die Sekretärinnen arbeiten **unverändert im WordPress-Admin** weiter. |
| **Zukunftssicher** | Modernes Fundament, das mitwächst, statt immer fragiler zu werden. |

---

## Wie pflegen wir künftig die Inhalte?

Eine wichtige Frage — hier die klare Aufteilung:

### Inhalte, die sich oft ändern → bleiben im WordPress-Lager
- **Termine** (Veranstaltungen, Gottesdienste)
- **Beiträge / Aktuelles** aus der Pfarrei
- ggf. wechselnde Bilder

➡️ Diese pflegen die **Sekretärinnen weiterhin im WordPress-Admin**, wie gewohnt.
Das neue Schaufenster holt sich die Änderungen automatisch.

### Inhalte, die selten ändern → liegen direkt im Schaufenster
- Grundaufbau der Seiten, feste Texte (z.B. Leitbild), Menüführung, Design

➡️ Diese werden **einmal sauber gebaut** und bei Bedarf von der technischen Betreuung
angepasst. Sie müssen nicht ständig gepflegt werden.

> **Kurz gesagt:** Die tägliche Redaktionsarbeit ändert sich für niemanden.
> Was sich ändert, ist nur die Technik *hinter* dem Schaufenster.

---

## Wie kommen wir dahin? (Die Schritte)

1. **Schaufenster aufbauen** — das neue Astro-Frontend wird erstellt *(läuft bereits)*.
2. **Verbindung zum Lager herstellen** — Astro holt Termine und Beiträge automatisch
   aus dem WordPress *(funktioniert bereits)*.
3. **Seiten Stück für Stück übertragen** — jede Seite wird im neuen Schaufenster sauber
   nachgebaut. Wiederkehrende Bausteine (Navigation, Termin- und Beitragskacheln) sind
   schon fertig und werden überall wiederverwendet.
4. **Umschalten** — wenn alles geprüft ist, zeigt `sanktbonifatius.de` auf das neue,
   schnelle Schaufenster. Für Besucher ändert sich die Adresse nicht.
5. **Absichern** — regelmäßige Backups für beide Gebäude (Lager + Schaufenster) und
   gesetzeskonforme Barrierefreiheit.

---

## Das Wichtigste in einem Satz

> **Wir lassen das vertraute WordPress-Lager bestehen, in dem unsere Mitarbeiterinnen
> wie gewohnt arbeiten — und stellen davor ein modernes, schnelles und stabiles
> Schaufenster, das nichts mehr kaputtmachen kann.**

---

*Bei Fragen gerne im Seelsorgeteam ansprechen. Eine technische Detail-Dokumentation
liegt im Astro-Projekt unter `docs/ASTRO-HANDBUCH.md`.*
