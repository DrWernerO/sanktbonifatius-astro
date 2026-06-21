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
   *„Ich möchte mit dir am Redesign der Kirchort-Seite Herz Jesu arbeiten. Nutze den Skill `/ui-ux-pro-max` als Rahmen. Wir folgen dem Design-System aus `/Users/wernerotto/Library/Mobile Documents/com~apple~CloudDocs/Claude/Code/team-handbuch/04-design-system.md`."*

2. Claude ruft `/ui-ux-pro-max` auf, stellt Fragen zu:
   - Produkt-Typ (Kirchort-Seite, thematische Seite, Event-Seite …)
   - Stilvorgabe (editorial, warm, Playfair-basiert)
   - Farbpalette (→ unsere `--bf-*` Tokens)

3. Wir antworten kurz: *„Editorial, warme Erdtöne wie bonfamily2, max-width 1280 px, home6-Header."*

4. Claude liefert einen strukturierten Design-Brief, den wir mit diesem Handbuch abgleichen, bevor die Umsetzung startet.

### Wichtig
Der Skill liefert allgemeine Best Practices. Die **Sankt-Bonifatius-spezifischen Entscheidungen** (Post-IDs, WP-Zugang, REST-Workflow) kommen aus diesem Handbuch. Beide Quellen zusammen ergeben den verbindlichen Rahmen.

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

## Arbeits-Workflow für eine neue Seite

### Schritt 1 — Kontext laden (einmalig pro Dialog)

Erste Nachricht an Claude:

> *„Bitte lies das Team-Handbuch unter `/Users/wernerotto/Library/Mobile Documents/com~apple~CloudDocs/Claude/Code/team-handbuch/` — beginne mit `README.md` und arbeite die nummerierten Dateien durch. Danach sind wir bereit für die Arbeit an [konkrete Seite]."*

Claude liest alle Dateien mit `Read`, hat dann den vollen Projekt-Kontext.

### Schritt 2 — Aufgabe definieren

Kurz und konkret:
- Welche Seite? (Slug + Post-ID falls bekannt)
- Was soll geändert werden? (Liste)
- Worauf achten? (z.B. „BonFamily2-Stil übernehmen, Accent-Farbe wie dort")

### Schritt 3 — Browser vorbereiten

- Chrome offen
- WordPress Admin eingeloggt (Werner)
- Tab auf dem **Edit-URL der betroffenen Seite** (`/wp-admin/post.php?post=XXX&action=edit`)
- Claude fragt per `mcp__Claude_in_Chrome__tabs_context_mcp` ab, welche Tabs verfügbar sind

### Schritt 4 — Iterativ ändern und testen

1. Claude lädt aktuellen Content per `wp.apiFetch`
2. Ändert per String-Operationen
3. Speichert zurück
4. Öffnet Preview-Tab (`/?page_id=XXX&preview=true&nocache=N`)
5. Prüft per DOM-Abfrage, ob alles aussieht wie gewollt
6. Berichtet zurück, Nutzer:in gibt Feedback, Schleife von vorn

### Schritt 5 — Memory aktualisieren

Nach wichtigen Meilensteinen:
- Falls neuer Trick/Lösung → in `06-technische-loesungen.md` ergänzen
- Falls neue Seite → in `07-seiten-inventar.md` eintragen
- Falls neues Design-Muster → in `04-design-system.md` ergänzen

---

## Tipps für gute Claude-Prompts (in diesem Projekt)

### DO
- **Konkrete Post-ID** nennen, wenn möglich (*„bonfamily2 ist Post 45898"*)
- **Vorbild-Seite** benennen (*„im Stil von home6"*)
- **Strategische Intention** mitgeben (*„…damit Externe sofort den Weg zur Taufe-Seite finden"*)
- **Format** verlangen (*„als Gutenberg-Block"* oder *„als Custom-HTML im wp:html-Block"*)

### DON'T
- „Mach's schöner" (ohne Referenz) — Claude rät dann wild
- Live-Seite direkt ändern ohne Backup/Draft
- Mehr als 3–4 Änderungen in einer Iteration — unüberschaubar
- Gutenberg-Accordions für FAQ (→ Theme-Bug, siehe 06-technische-loesungen.md § FAQ)

---

## Nützliche Einstiegsformulierungen

**Für Redesign einer bestehenden Seite:**
> „Ich möchte die Seite [URL oder Slug] im Stil von home6/bonfamily2 redesignen. Bitte dupliziere sie als Entwurf, übernimm den Home6-Header und das Farbsystem `--bf-*`, und baue die Inhalte gemäß Team-Handbuch 04 in das neue Layout ein."

**Für neue Seite:**
> „Bitte lege eine neue Draft-Seite `[slug]` an, Parent: [parent-id]. Verwende den Home6-Header, ein Hero mit Foto [URL], einen Willkommens-Block und danach [Struktur]. Design-Vorbild: bonfamily2."

**Für Analyse:**
> „Analysiere die Seite [URL]. Welche GSC-Suchbegriffe würden hier landen? Welche Blöcke fehlen für die Zielgruppe [Persona]?"

**Für Veranstaltungskalender-Einbau:**
> „Füge auf Seite [ID] den dynamischen Veranstaltungskalender aus home6 ein, gefiltert auf die Kategorie [Name] (Term-ID: [zzz])."

---

## Claude-Speicher (Auto-Memory)

Claude speichert wichtige Erkenntnisse automatisch in:
```
~/.claude/projects/-Users-wernerotto-Library-Mobile-Documents-com~apple~CloudDocs-Claude-Code/memory/
```

Das ist **nicht** Teil des Team-Handbuchs, sondern Claudes persönliches Gedächtnis zwischen Sessions. Falls eine Info dort steht, aber nicht im Handbuch → Claude bitten, sie ins Handbuch zu übernehmen.

---

## Notfall-Checkliste

Wenn eine Änderung etwas kaputt macht:

1. **Nicht speichern!** Erst Preview überprüfen.
2. WordPress hat **Revisions** — letzte funktionierende Version wiederherstellen:
   ```javascript
   wp.apiFetch({path:'/wp/v2/pages/POST_ID/revisions?per_page=5&_fields=id,date'});
   ```
3. Im WP-Admin: Editor → rechts „Beitrag" → „Überarbeitungen" → wiederherstellen.
4. Oder: Draft-Status setzen, damit Live-Seite intakt bleibt, während debuggt wird.

---

## Wo Code liegt

- **Handbuch-Quellen:** `/Users/wernerotto/Library/CloudStorage/OneDrive-KatholischeKirchengemeindeSt.BonifatiusFrankfurt/0_Pfarreiaustausch/Claude/team-handbuch/`
- **Dieses Handbuch als Markdown:** lesbar in VS Code, Typora, GitHub, Obsidian, …
- **Versions-Kontrolle:** Ordner ist derzeit nicht als Git-Repo initialisiert. Falls gewünscht:
  ```bash
  cd "/Users/wernerotto/Library/Mobile Documents/com~apple~CloudDocs/Claude/Code"
  git init && git add team-handbuch/ && git commit -m "Initial team handbook"
  ```
