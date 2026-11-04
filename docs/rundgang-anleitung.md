# 360°-Rundgang St. Bonifatius – Anleitung

Stand: 30.10.2026 · Seite: `/100-jahre/rundgang/` (passwortgeschützt, noindex, nicht im Menü)

## Wo was liegt

| Was | Datei |
|-----|-------|
| Alle Inhalte (Stationen, Wege, Infopunkte, Geschichten, Führung, Schatzkammer) | `src/data/rundgang.json` |
| Der Rundgang selbst (Viewer, Grundriss, Führung, Liste) | `src/components/Rundgang.astro` |
| Die Seite | `src/pages/100-jahre/rundgang.astro` |
| Kachel-Werkzeug | `scripts/rundgang-kacheln.py` |
| Kacheln in halber Auflösung (ca. 86 MB, 3.276 Dateien, im Projekt) | `public/rundgang/kacheln/<station>/` |
| Vorschaubilder für die Ortsliste | `public/rundgang/vorschau/<station>.jpg` |
| Grundriss für die Kartenansicht | `public/rundgang/grundriss.png` |
| Viewer-Programm Pannellum 2.5.6 (selbst gehostet, MIT-Lizenz) | `public/vendor/pannellum/` |
| Original-Panoramen (Insta360 X6, HDR) | `iClaude/Inputs/Rundgang-Panoramen/` |

## Texte ändern

Alles steht in `src/data/rundgang.json`. Nur die Texte zwischen den Anführungszeichen ändern, Kommas
und Klammern stehen lassen.

- **Begleittext einer Station** (erscheint im geführten Rundgang und in der Ortsliste): Feld `begleittext`.
- **Titel einer Station:** `titel`, kurze Ortsangabe darunter: `ort`.
- **Infopunkt-Text:** beim Infopunkt `"text": null` ersetzen durch `"text": "Ihr Text …"` (zwei bis
  drei Sätze, gleich sichtbar). Ausführlicheres optional als Liste `"mehr": ["Absatz 1", "Absatz 2"]`
  – erscheint aufklappbar unter „Mehr erfahren“; das Infofenster scrollt dann.
- **Detailfoto zum Infopunkt:** Foto nach `public/uploads/jubilaeum/rundgang/` legen und
  `"foto": null` ersetzen durch `"foto": "/uploads/jubilaeum/rundgang/A-taufstein.jpg"`.
- **Reihenfolge des geführten Rundgangs:** Liste `fuehrung` (Stations-IDs in Wunschreihenfolge).

## Geschichten ergänzen

Unter `geschichten` einen Eintrag nach diesem Muster anlegen:

```json
{
  "id": "taufe-1972", "titel": "Meine Taufe", "person": "Maria K.", "jahr": "1972",
  "medium": "audio", "station": "taufstein", "yaw": 28, "pitch": 4,
  "vorschaubild": "/uploads/jubilaeum/geschichten/maria-k.jpg",
  "datei": "/uploads/jubilaeum/geschichten/maria-k.mp3",
  "text": "Abschrift der Tonaufnahme …"
}
```

- `medium`: `text`, `audio` oder `video`. Bei Video und Ton gehört die Abschrift in `text`.
- `yaw`/`pitch`: Position im Panorama (Grad, 0/0 = Bildmitte; `yaw` positiv = nach rechts,
  `pitch` positiv = nach oben). Am einfachsten Claude bitten, die Stelle einzutragen.
- Ohne `vorschaubild` erscheinen die Initialen.
- `"beispiel": true` nur für Platzhalter – solche Einträge vor der Veröffentlichung löschen.
- **Vor dem Einstellen:** schriftliche Einwilligung (KDG) der Person, bei Kindern der Eltern.

## Blick von der Empore

Von der Empore (Station 14) sieht man den ganzen Raum. Dort erscheinen deshalb zusätzlich:

- **Infopunkte**, bei denen `"empore"` in `sichtbarVon` steht. Taufstein, Mariengemälde und
  JONA-Wohnzimmer fehlen, weil sie unter der Empore bzw. hinter der Brüstung liegen. Wo die
  berechnete Lage von oben nicht genau passt, steht beim Infopunkt eine eigene Lage im Bild:
  `"ansichten": { "empore": { "yaw": 162.3, "pitch": -8.0 } }`.
- **Geschichten** aller Stationen, die in `geschichtenVon` der Empore stehen. Sie schweben
  automatisch über ihrem Standort und müssen nicht eigens eingetragen werden.
- Wegpunkte gibt es von oben nur zurück zum Taufstein.

Die Kameraposition der Empore (`position`, `boden`, `blickrichtung`) wurde am 30.10.2026 aus Altar,
Ambo, Treppenfuß und „Fenster zum Himmel“ im Panorama errechnet. Im Grundriss steht der Punkt an der
Stelle `karte`, damit er nicht auf dem Taufstein liegt.

## Ein Panorama ersetzen oder eine Station ergänzen

1. In Insta360 Studio als JPG exportieren (Projektion „360°/equirektangulär“, volle Auflösung)
   und nach `iClaude/Inputs/Rundgang-Panoramen/` legen.
2. **Neue Station:** in `rundgang.json` unter `stationen` einen Eintrag ergänzen
   (`nr`, `id`, `titel`, `ort`, `datei`, `position`, `blickrichtung`, `startblick`, `verbindungen`,
   `begleittext`). `position` = Lage im Grundriss in Prozent (x von links/Westen, y von oben/Norden),
   `blickrichtung` = wohin die Bildmitte zeigt (0 Osten/Altar, 90 Süden, -90 Norden, 180 Westen).
   Die neue Station auch bei den Nachbarn unter `verbindungen` eintragen.
3. Kacheln erzeugen (im Projektordner, ca. 30 Sekunden pro Station):
   ```bash
   python3 scripts/rundgang-kacheln.py "../Inputs/Rundgang-Panoramen" taufstein
   ```
   Ohne Stations-ID werden alle Stationen neu erzeugt. Standard ist die halbe Auflösung; `--voll`
   erzeugt die volle Auflösung (erst sinnvoll mit eigenem Kachel-Speicher, s. unten).
4. Lokal prüfen (`npm run dev`, dann `http://localhost:4321/100-jahre/rundgang/`), danach committen und pushen.

Die Richtung der Wegpunkte und Infopunkte wird aus den Positionen im Grundriss berechnet. Zeigt ein
Wegpunkt daneben, lässt er sich bei der Verbindung mit `{ "ziel": "…", "yaw": 40, "pitch": -12 }`
von Hand festlegen.

`sichtbarVon` sagt, von wo ein Objekt im Panorama wirklich zu sehen ist (seit 04.11.2026 mit
Bildausschnitten aus allen Panoramen geprüft). **Angezeigt** wird davon nur, was in der Nähe ist
(Franks Wunsch, damit der Blick nicht überladen wirkt), eingestellt oben in `infopunktAnzeige`:
bis `vollBisMeter` (5 m, „direkt davor“) volle Größe, bis `reichweiteMeter` (15 m) deutlich kleiner
und mit der Entfernung weiter schrumpfend, weiter weg ausgeblendet. Von der Empore erscheinen alle
sichtbaren Infopunkte, ebenfalls nach Entfernung abgestuft. Die Ortsliste unter dem Bild folgt derselben Regel.
Ausnahmen je Station: `"zusaetzlicheInfopunkte": ["J", "K", "L"]` zeigt diese Infopunkte dort auch
jenseits der Reichweite in kleinster Größe (so bei Station 4 „Vor dem Altar“: Engelbilder, Osterkerze und Marienfigur).
Seitennischen (Mariengemälde, Madonna, Trauernische) bleiben bewusst nur aus der Nähe sichtbar, weil
Pfeiler und Nischenwände sie sonst verdecken; Osterkerze und Marienfigur sind von Station 8 nicht zu
sehen. Wo die berechnete Lage danebenliegt, steht beim Infopunkt unter `ansichten.<station-id>` die
gemessene Lage im Bild (`yaw`, `pitch`), genau wie für die Empore.

## Lage der Stationen (Stand 30.10.2026)

Die Lage der Stationen im Grundriss ist entscheidend: Aus ihr werden Wegpunkte, Bodenlinien und
Infopunkte berechnet. Am 30.10.2026 präzisiert: Stationen 3, 4, 5 und der Altar nach Franks Plan
(Inputs/„Rundgang-Stationen-St-Bonifatius präzisiert.pdf“), Ambo, Station 7, 8, 11 und die Empore aus
den Panoramen nachgemessen. Die Kamera stand bei allen Aufnahmen etwa **1,85 m** über dem Boden
(`kamerahoeheMeter`), das ergab der Vergleich von Empore, Ambo und Treppe. Sitzt ein Wegpunkt
daneben, ist meist die Lage der Station ungenau. Dann lieber die Station korrigieren als den
Wegpunkt von Hand verschieben.

Am 04.11.2026 Station 10 (JONA-Nischen) neu eingemessen: Lage und Blickrichtung gemeinsam aus acht
Objekten (Taufstein, Mariengemälde, Madonna, Altar, Ambo, Engelbild Süd, JONA-Wohnzimmer, Fenster zum
Himmel) bestimmt, mittlere Abweichung 1,7° (vorher bis 20°). Neu: `position` (46.4, 27.6),
`blickrichtung` −87 (vorher 44.5/26.75 und −74).

## Wege und Bodenlinien

Jede Verbindung erscheint im Panorama als weißer Wegpunkt und als schmales Band auf dem Fußboden
(seit 30.10.2026). Die Bänder werden aus Grundriss, Kamerahöhe (`kamerahoeheMeter`) und Bodenhöhe
(`boden`) berechnet. Sie liegen immer obenauf, Möbel verdecken sie also nicht. Liegt ein Hindernis im
Weg (Altar, Taufstein), führt man das Band mit Zwischenpunkten herum:

```json
{ "ziel": "hinter-dem-altar", "ueber": [{ "x": 50.0, "y": 43.0 }], "wegpunkt": "umweg" }
```

- `ueber`: Zwischenpunkte in Grundriss-Prozent, **in Laufrichtung**. In der Gegenrichtung also umgekehrte Reihenfolge.
- `"wegpunkt": "umweg"`: Der Wegpunkt sitzt am letzten Zwischenpunkt statt am Ziel. Das ist nötig, wenn
  das Ziel verdeckt ist (hinter dem Altar) oder der Wegpunkt sonst auf einem Infopunkt läge (Ambo, Taufstein).
- Zur Empore gibt es keine Bänder, weil sie auf einer anderen Ebene liegt.

Farben im Bild: **Wege weiß, Infopunkte rot, Geschichten gold.** Unter dem Bild lassen sich die drei
Gruppen einzeln ein- und ausblenden.
Wegpunkte und Geschichten werden mit der Entfernung im Raum kleiner (bis ca. 6 m volle Größe, ab ca.
25 m die Mindestgröße); für Infopunkte gilt die eigene Regel aus `infopunktAnzeige` (siehe oben). Geschichten zeigen nur Bild bzw. Initialen. Der Titel erscheint beim Drüberfahren mit
der Maus, auf Handy und Tablet beim ersten Antippen. Erst der zweite Tipp öffnet die Geschichte.

## Testcheckliste

**Computer (Chrome, Safari, Firefox, Edge)**
- [ ] Seite lädt, Taufstein erscheint nach wenigen Sekunden scharf
- [ ] Ziehen mit der Maus dreht, Mausrad und +/− zoomen
- [ ] Wegpunkte führen zur richtigen Station, der Wechsel wirkt wie ein paar Schritte
- [ ] Bodenlinien liegen auf dem Boden und enden am Wegpunkt; beim Drüberfahren leuchtet die Linie auf
- [ ] Legende unter dem Bild: Wege, Infopunkte, Geschichten einzeln aus- und einblenden
- [ ] Empore: Infopunkte sitzen an ihren Objekten, Geschichten schweben über ihren Orten, beide öffnen sich
- [ ] Grundriss öffnet sich, Klick auf eine Station springt dorthin, Blickkegel dreht mit
- [ ] Geschichten: Titel erst beim Drüberfahren; am Handy 1. Tipp Titel, 2. Tipp öffnet
- [ ] „Rundgang starten“: Weiter/Zurück, Station 1 bis 14, „Rundgang beenden“
- [ ] Infopunkt, Geschichte (Video spielt) und Schatzkammer öffnen und mit × oder Esc schließen
- [ ] Vollbild ein und aus
- [ ] Nur Tastatur: Tab erreicht Wegpunkte und Punkte, Enter öffnet, Pfeiltasten drehen
- [ ] Liste „Alle Orte im Überblick“: „Hier umschauen“ springt zur Station

**Handy (iPhone und Android, hoch und quer)**
- [ ] Wischen dreht, zwei Finger zoomen, die Seite selbst verrutscht nicht seitlich
- [ ] Wegpunkte, Punkte und Knöpfe lassen sich gut antippen
- [ ] Bewegungssteuerung (Symbol im Viewer, erst auf der echten Website mit https sichtbar):
      iPhone fragt einmal um Erlaubnis, danach folgt das Bild dem Handy
- [ ] Geführter Rundgang: Begleittext und Weiter-Knopf gut erreichbar
- [ ] Ladezeit im Mobilfunknetz akzeptabel (erste Station unter ca. 5 Sekunden)

**Tablet**
- [ ] Wie Handy, zusätzlich Grundriss gut lesbar

## Kacheln: heutige Lösung und spätere Umstellung

Seit 28.10.2026 liegen die Kacheln in **halber Auflösung** direkt im Website-Projekt
(`public/rundgang/kacheln/`), damit der Rundgang ohne eigenen Speicher online gehen kann.
Scharfes Zoomen etwa bis zur doppelten Vergrößerung.

Sobald es ein eigenes Netlify-Projekt für die Kacheln gibt (anlegen kann das nur, wer Zugang zum
Netlify-Konto hat):
1. Kacheln mit `--voll` erzeugen und dort hochladen; das Projekt muss den Header
   `Access-Control-Allow-Origin: *` für die Bilder senden (sonst zeigt der Viewer nichts).
2. In `rundgang.json` `kachelBasis` auf die neue Adresse setzen (z. B. `https://rundgang-medien….netlify.app`).
3. Ordner `public/rundgang/kacheln/` aus dem Website-Projekt entfernen.

## Noch offen

- Detailfotos und Texte für D Trauernische, E JONA-Wohnzimmer, F Fenster zum Himmel, H Ambo
  (A–C, G, I–M seit 04.11.2026 aus dem Kirchenführer übernommen und gekürzt); Begleittexte gegenlesen.
- Echte Geschichten statt der drei Beispiele; Einwilligungen.
- Rechte: Kunstwerke (Künstler/Bistum), Sommerfreizeit-Video.
