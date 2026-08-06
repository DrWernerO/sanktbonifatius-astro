# 09 · Claude-Skills und Arbeitsabläufe

Wie wir mit Claude arbeiten — konkrete Skills, Muster, Prompts.

---

## Pflicht-Skill: `/ui-ux-pro-max`

**Verbindlich für alle Design-Arbeiten.**

### Was der Skill leistet
- UI/UX-Design-Intelligenz für Web und Mobile
- 50+ Design-Stile
- 161 Farbpaletten
- 57 Font-Pairings
- 161 Produkt-Typologien
- Komponentenvorschläge auf Basis des gewählten Rahmens

### Wie wir ihn einsetzen

1. **Neuer Dialog, erste Aufgabe:**
   *„Ich möchte mit dir am Redesign der Kirchort-Seite Herz Jesu arbeiten. Nutze den Skill `/ui-ux-pro-max` als Rahmen. Wir folgen dem Design-System aus `docs/team-handbuch/04-design-system.md`."*

2. Claude ruft `/ui-ux-pro-max` auf, stellt Fragen zu:
   - Produkt-Typ (Kirchort-Seite, thematische Seite, Event-Seite …)
   - Stilvorgabe (editorial, warm, Playfair-basiert)
   - Farbpalette (→ unsere `--bf-*` Tokens)

3. Wir antworten kurz: *„Editorial, warme Erdtöne wie bonfamily2, max-width 1280 px, home6-Header."*

4. Claude liefert einen strukturierten Design-Brief, den wir mit diesem Handbuch abgleichen, bevor die Umsetzung startet.

### Wichtig
Der Skill liefert allgemeine Best Practices. Die **Sankt-Bonifatius-spezifischen Entscheidungen** (Post-IDs, Design-Tokens, Event-Kategorien) kommen aus diesem Handbuch. Beide Quellen zusammen ergeben den verbindlichen Rahmen.

---

## Weitere nützliche Skills (optional)

| Skill | Wann einsetzen |
|---|---|
| `/seo-audit` | Wenn Google-Ranking oder Indexierung analysiert werden soll |
| `/seo-content` | Für Texte, die auf Keywords optimiert werden (Taufe, Hochzeit, …) |
| `/seo-geo` | Für Optimierung auf AI-Suchen (ChatGPT, Perplexity, Google AI Overviews) |
| `/seo-local` | Für Google-My-Business-Optimierung der 4 Kirchorte |
| `/copywriting` | Wenn wir neue Texte für Landing-Pages brauchen |
| `/marketing-psychology` | Für CTA-Formulierungen, emotionale Ansprache |
| `/frontend-design` | Wenn wir einzelne UI-Komponenten neu entwerfen |

---

## Arbeits-Workflow für eine neue Astro-Seite

### Schritt 1 — Kontext laden (einmalig pro Dialog)

Erste Nachricht an Claude:

> *„Bitte lies zuerst `docs/ASTRO-QUICKREF.md`, danach bei Bedarf den passenden Abschnitt in `docs/ASTRO-HANDBUCH.md`. Für Design/Post-IDs/Event-Kategorien ergänzend `docs/team-handbuch/`. Danach sind wir bereit für die Arbeit an [konkrete Seite]."*

### Schritt 2 — Aufgabe definieren

Kurz und konkret:
- Welche Seite? (Astro-Pfad + WP-Page-ID falls bekannt, siehe `07-seiten-inventar.md`)
- Was soll geändert werden? (Liste)
- Worauf achten? (z. B. „BonFamily2-Stil übernehmen, Accent-Farbe wie dort")

### Schritt 3 — Umsetzen (siehe `ASTRO-QUICKREF.md`, „Typisches Vorgehen neue Seite")

1. Page-ID und ggf. Event-Kategorie-ID nachschlagen (`07-seiten-inventar.md`, `05-veranstaltungskalender.md`)
2. Eigene `.astro`-Komponente(n) mit `astro-`-Präfix bauen
3. `npm run dev`, im privaten Browser-Fenster testen
4. `docs/SEITENVERZEICHNIS.md` mitpflegen, als eigenen `Doku:`-Commit

### Schritt 4 — Memory aktualisieren

Nach wichtigen Meilensteinen:
- Falls neue Seite → in `07-seiten-inventar.md` eintragen
- Falls neues Design-Muster → in `04-design-system.md` ergänzen

---

## Tipps für gute Claude-Prompts (in diesem Projekt)

### DO
- **Konkrete Page-ID** nennen, wenn möglich (*„bonfamily2 ist WP-Post 45898"*)
- **Vorbild-Seite** benennen (*„im Stil von home6/bonfamily2"*)
- **Strategische Intention** mitgeben (*„…damit Externe sofort den Weg zur Taufe-Seite finden"*)
- **Format** verlangen (*„als eigene Astro-Komponente mit Präfix astro-XX"*)

### DON'T
- „Mach's schöner" (ohne Referenz) — Claude rät dann wild
- Mehr als 3–4 Änderungen in einer Iteration — unüberschaubar
- Eigene JS-Accordions für FAQ bauen (→ natives `<details>`-Element nutzen, siehe `04-design-system.md` §4.8)

---

## Nützliche Einstiegsformulierungen

**Für eine neue Astro-Seite:**
> „Bitte baue die Seite [Slug] als eigene Astro-Komponente(n) mit Präfix `astro-XX`. Design-Vorbild: bonfamily2/home6 (siehe 04-design-system.md). WP-Page-ID für den Content: [ID] (siehe 07-seiten-inventar.md)."

**Für Analyse:**
> „Analysiere die Seite [URL]. Welche GSC-Suchbegriffe würden hier landen? Welche Blöcke fehlen für die Zielgruppe [Persona]?"

**Für Veranstaltungskalender-Einbau:**
> „Füge auf Seite [Astro-Pfad] den `EventCalendar` ein, gefiltert auf die Kategorie [Name] (Term-ID: [zzz], siehe 05-veranstaltungskalender.md)."

---

## Notfall: etwas ist kaputt

Bei Astro/Git läuft das anders als früher in WordPress (dort gab es Revisions):

1. **Nicht committen/pushen!** Erst lokal (`npm run dev`) prüfen.
2. Letzten funktionierenden Stand ansehen/zurückholen: `git diff`, `git checkout -- <datei>`, oder im Zweifel `git log` und einen früheren Commit auschecken.
3. Bei einem fehlerhaften Netlify-Deploy: im Netlify-Dashboard auf den letzten funktionierenden Deploy zurückrollen.

---

## Claude-Speicher (Auto-Memory)

Claude speichert wichtige Erkenntnisse automatisch in:
```
~/.claude/projects/-Users-wernerotto-Claude-Code/memory/
```

Das ist **nicht** Teil des Team-Handbuchs, sondern Claudes persönliches Gedächtnis zwischen Sessions — gebunden an den Arbeitsordner `/Users/wernerotto/Claude/Code/`. Falls eine Info dort steht, aber nicht im Handbuch → Claude bitten, sie ins Handbuch zu übernehmen.

---

## Wo das Handbuch liegt

- **Einzige gepflegte Kopie:** `docs/team-handbuch/` im Astro-Projekt (`Senior Web Developer/`), GitHub-Repo `DrWernerO/sanktbonifatius-astro`. Wird auch von Lovis gelesen/aktualisiert.
- Änderungen als eigene `Doku:`-Commits, nie mit Astro-Code-Commits mischen.
