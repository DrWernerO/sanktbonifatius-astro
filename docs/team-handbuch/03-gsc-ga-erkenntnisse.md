# 03 · Erkenntnisse aus Google Search Console und Google Analytics

Quelle: Vortrags-Recherche + iterative Analyse über mehrere Sessions.
Ziel: Das Website-Design und die Inhaltsstrategie so an tatsächliches Sucherverhalten anpassen, dass externe Suchende schnell fündig werden.

---

## Kernbefunde

### Traffic-Zusammensetzung (GA / GSC)

- **~76 %** der Website-Besucher kommen über **Google-Suche**.
- **~15–25 %** kommen per **Direktzugriff** (Lesezeichen, manuelle URL) → das sind typischerweise **aktive Gemeindemitglieder**.
- Social/Referral ist vernachlässigbar.

### Top-Suchbegriffe (aggregiert über GSC)

Die häufigsten Suchen, die Menschen auf die Seite führen:

1. **Taufe** (in allen Varianten: „Taufe Frankfurt", „Kind taufen lassen", „Taufe katholisch Formular")
2. **Gottesdienst / Gottesdienstzeiten**
3. **Hochzeit** („katholisch heiraten Frankfurt", „kirchliche Trauung")
4. **Beerdigung / Trauerfall**
5. **Erstkommunion**
6. Daneben: Sachsenhausen-bezogene Suchen, Adressen der Kirchorte

> **Wichtige Folgerung:** Fast alle Sucher sind **Externe** — Menschen, die noch nie einen Gottesdienst besucht haben und nun ein bestimmtes Sakrament brauchen. Aktive Mitglieder googeln ihre eigene Pfarrei nicht.

---

## Strategische Konsequenz (Kernsatz des Vortrags)

> **Die Website muss primär für Externe gebaut sein.**
> **Für Externe ist sie die einzige Tür. Für Aktive eine von vielen.**

Konkret:

- Die Landing-Elemente müssen Taufe, Gottesdienst, Hochzeit, Beerdigung, Erstkommunion **above the fold** sichtbar machen.
- Verwaltungsjargon (Pastoralrat, Kirchenvorstand…) gehört tief ins Menü — nicht auf die Startseite.
- Kasualien sind der Haupteinstieg → jede Lebensphase braucht ihre eigene Tür (Quick-Link).

---

## Drei Besuchergruppen

| Gruppe | Anteil | Typische Suche | Was sie brauchen |
|---|---|---|---|
| **Lebenswende-Suchende** | ~65 % | Taufe, Hochzeit, Beerdigung, Erstkommunion | Klare Info, Formular, Kontakt |
| **Orientierungssuchende** | ~20 % | Zugezogen, Expats, spirituell interessiert | Gemeindebild, Gottesdienstzeiten, Warmes Bild |
| **Informationsholende** | ~15 % | Gelegenheit: Eltern von Erstkommunionskindern, Trauergäste | Schnelle Fakten (Anfahrt, Zeit) |

**Nicht in GSC sichtbar:** Aktive Mitglieder (die kennen die Seite, haben Lesezeichen, oder nutzen Pfarrbrief/WhatsApp/persönlichen Kontakt). Schätzung: ~15–25 % der Besuche.

---

## 6 Personas (für Design-Entscheidungen und Vortrag)

1. **Lisa & Tom (29/32)** — erstes Kind, wollen Taufe, neu in Sachsenhausen
2. **Maria (67)** — Stammgemeinde, schaut Gottesdienstzeiten
3. **Katharina & Sven** — verlobt, katholische Hochzeit gewünscht
4. **Ahmed (34)** — Expat aus Italien, sucht internationale Gemeinde
5. **Felix (22)** — Student FH Frankfurt, spirituell suchend
6. **Elisabeth (58)** — Mutter verstorben, Trauerfall, unter Zeitdruck

Jede Persona bildet eine Tür in die Navigation ab. Wer die Seite designt, soll sich fragen: „Findet Ahmed seinen Weg? Findet Elisabeth im Stress das Trauerbüro?"

---

## GSC-Prioritäten für Inhalte

### SOFORT
- **Taufe-Seite** klar strukturieren, Formular einbinden (➜ ist seit Anfang 2026 umgesetzt, Post 19236)
- **Gottesdienstzeiten** aktuell halten (aktuell in home6 automatisch via REST)
- **Kontakt** auf jeder Seite sichtbar (Pfarrbüro-Button im Header)

### KURZFRISTIG
- **Hochzeits-Seite** mit Ablauf, Voraussetzungen, Formular
- **Beerdigungs-Seite** mit Krisenmodus (klares Telefon, schnelle Kontaktaufnahme)
- **Mobile-Optimierung** aller Schlüsselseiten (375 px testen)

### MITTELFRISTIG
- **Englischsprachige Kurzinfos** für Expats (Frankfurt-Sachsenhausen gentrifiziert, internationales Milieu)
- **Erstkommunion-Seite** mit Anmeldeformular
- **Google My Business** für alle 4 Kirchorte pflegen (Öffnungszeiten, Fotos, Reviews)
- **Schema.org-Markup** für lokale Suche (siehe 06-technische-loesungen.md)

---

## Folgerungen für das Design (Gestaltungsprinzipien)

1. **Das erste Bild entscheidet.** 3–8 Sekunden Entscheidungszeit bis die Nutzer:in weiter liest oder zurückgeht → echtes Gemeindefoto, kein Stock.
2. **Jede Zielgruppe braucht eine Tür.** Quick-Links für Taufe, Hochzeit, Beerdigung, Erstkommunion direkt unter dem Hero.
3. **Aktualität schafft Vertrauen.** Gottesdienstzeiten dürfen nie veraltet sein → **dynamischer Veranstaltungskalender** (siehe 05-veranstaltungskalender.md).
4. **Wärme ist kein Luxus.** Warme Erdtöne (Braun, Beige, Gold), **Playfair Display** für Überschriften, **echte Fotos**.
5. **Mobile first.** 60 %+ aller Suchen kommen vom Smartphone.

---

## Häufige Fehler von Kirchenwebsites (Vortrag, Kapitel 3)

- Zu viel Selbstdarstellung („Unser Pastoralrat, unsere Gremien…")
- Verwaltungssprache statt Einladungssprache
- Keine oder nur Stock-Bilder
- Kontakt versteckt in 3. Menüebene
- Kalt, technisch, distanziert

Unser Gegenentwurf in home6/bonfamily2: Playfair Display, warme Farbpalette, echte Personen (Ansprechpartner-Karten), klare CTA-Buttons.

---

## Kernsätze (für Zitate und Textvorlagen)

> „Eine Kirchenwebsite ist kein Schaukasten – sie ist die erste Begegnung mit der Pfarrei für Menschen, die noch nie eine Messe besucht haben."

> „Die Website ist für Externe die einzige Tür zu uns."

> „Design ist keine Frage des Geschmacks, sondern eine Frage der Botschaft."

> „Aktive Mitglieder kommen schon. Die Website entscheidet, ob andere kommen."

---

## Sachsenhausen-Kontext (wichtig für Bildsprache + Texte)

- **Historisch:** Frankfurter Arbeiterviertel, traditionell starke Kirchenbindung
- **Heute:** Starker Wandel durch junge Familien, Akademiker, Studenten, Expats
- **Gentrifizierung:** kaufkräftiges, kulturinteressiertes Milieu
- **Hohe digitale Nutzung, hohe Erwartungen an Webauftritte**
- **Internationale Bewohner** → englischsprachige Kurz-Infos sinnvoll

Unsere Bildsprache darf also modern + warm sein, nicht betulich-traditionell.
