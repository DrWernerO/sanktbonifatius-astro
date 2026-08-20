# Sankt Bonifatius — Astro-Frontend (Headless WordPress)

> **VOR jeder Arbeit zuerst [`docs/ASTRO-QUICKREF.md`](docs/ASTRO-QUICKREF.md) lesen** —
> kompakte Sessionreferenz mit allen wichtigen Regeln, Seitenstand und Fallstricken.
> Für Details zu einzelnen Seiten/Komponenten den passenden Abschnitt in
> [`docs/ASTRO-HANDBUCH.md`](docs/ASTRO-HANDBUCH.md) gezielt nachlesen.
>
> **Für Kirchort-Seiten und deren Unterseiten** gilt zusätzlich die verbindliche
> **[`docs/kirchort-routine.md`](docs/kirchort-routine.md)** — 4-Phasen-Routine:
> WP-CSS extrahieren → Checkliste beim Bauen → CSS-Verifikation → Doku.
> Diese Routine MUSS vor dem ersten Code einer neuen Kirchortseite gelesen werden.
>
> **Ergänzend** liegt das **Team-Handbuch** unter [`docs/team-handbuch/`](docs/team-handbuch/):
> WordPress-Seiten-IDs ([`07-seiten-inventar.md`](docs/team-handbuch/07-seiten-inventar.md)),
> Design-System/Farben/Fonts ([`04-design-system.md`](docs/team-handbuch/04-design-system.md)),
> Event-Kategorien ([`05-veranstaltungskalender.md`](docs/team-handbuch/05-veranstaltungskalender.md))
> und der WordPress-Zugang ([`02-zugang-wordpress.md`](docs/team-handbuch/02-zugang-wordpress.md)).
> Beim Bau einer neuen Seite dort die **Page-ID** und passende **Event-Kategorie** nachschlagen.

## Die wichtigsten Regeln in Kürze

0. ⚠️ **Astro holt sich KEINE Seiteninhalte mehr live aus `cms.sanktbonifatius.de`** — einzige
   erlaubte Ausnahmen: **Termine, News/Pins, Beiträge, Tauftermine** (echte, laufend wechselnde
   Daten). Alles andere (SEO-Head aller statischen Seiten, der Rechtstext „Reisebedingungen")
   liegt seit 2026-08-20 fest im Repo (`src/lib/seo-static.js`, `src/lib/content/`). Grund: cms
   ist per `.htaccess` auf dem All-inkl-Server (nicht in diesem Repo) als öffentliches Frontend
   geschlossen — nur noch Datenlager (`wp-json`) + Medien-Host. Neue statische Seite bauen →
   **keine** neue `getSeoHead()`/`getPageById()`-Live-Abhängigkeit einführen, sondern SEO-Text
   einmalig besorgen und in `seo-static.js` eintragen (Handbuch 1e).
1. **Echter Go-Live vollzogen (2026-08-03):** `sanktbonifatius.de` zeigt per DNS auf **Netlify**
   und liefert live das Astro-Frontend. **Inhalte kommen von WordPress unter
   `https://cms.sanktbonifatius.de`** (Backend auf die `cms.`-Subdomain umgezogen, dort per
   `.htaccess` als Frontend gesperrt — siehe Regel 0). Server-seitig fetcht Astro direkt zu
   `cms.` (nur `wp-json` + die erlaubten Ausnahmen), client-seitig weiterhin über
   Vite-/Netlify-Proxy `/wp-proxy/...` (gleiche Origin, kein SSL/CORS-Problem). Quell-Domains
   zentral in `src/lib/wordpress.js` (`WP_API`, `WP_RENDER_ORIGIN`) und `astro.config.mjs`
   (`WP_LIVE`).
2. **Eigene Komponenten IMMER mit Präfix `astro-`** — nie WP-Theme-Klassen (`bh2-…`)
   wiederverwenden, sonst überschreibt das WP-CSS unsere Styles.
3. **Server-seitige Änderungen (`lib/*.js`, `.astro`-Frontmatter) → Dev-Server neu starten.**
   CSS/Client-JS lädt per HMR. Bei zähem JS-Cache: privates Browser-Fenster.
4. **WP-Sektionen ersetzen** via `removeRange` + `ASTRO_SLOT` in `src/lib/wordpress.js`;
   `<style>`-Blöcke aus dem Schnitt bewahren.
5. **Seitenübersicht immer aktuell halten:** Bei jeder neu gebauten, verschobenen oder
   strukturell geänderten Seite sofort `docs/SEITENVERZEICHNIS.md` mitpflegen (Astro-Pfad,
   Status ✅/offen, Bemerkung **und** den Zähler oben) — als eigenen `Doku:`-Commit.
6. ⚠️ **Navigationsmenü (`src/components/Nav.astro`) NUR auf ausdrückliche Anweisung von Werner
   ändern.** Top-Level-Punkte, Reihenfolge und Dropdown-Einträge dürfen NICHT eigenmächtig
   erweitert oder umsortiert werden — auch nicht "passend" beim Bau neuer Seiten. Neue Seiten
   werden gebaut, aber **nicht automatisch ins Menü aufgenommen**. Vor jeder Menü-Änderung
   Werners ausdrückliche Freigabe einholen.

## Hosting-Stand (Details in Handbuch 1b–1d, 1g)
- **WordPress** läuft auf **All-inkl** (kasserver.com), erreichbar unter **`cms.sanktbonifatius.de`**
  → bleibt dort als reines Backend/REST-API.
- **Astro-Frontend ist LIVE** unter der echten Domain **`sanktbonifatius.de`** (DNS → Netlify,
  Go-Live 2026-08-03), baut autom. bei jedem Push auf `main`; lokal via `npm run dev`.
- **Fotos immer lokal** (`public/uploads/…`, relativer Pfad) — **keine** WP-Bild-URLs mehr (Handbuch 1g).
  Ausnahme: PDFs bleiben in WordPress (Links zeigen auf `cms.sanktbonifatius.de`).
- **Rebuild-Webhook** (WP-Änderung → Netlify-Build): ✅ läuft (Handbuch 1c), end-to-end getestet.
- **Taufe-Formular**: versendet live über `formular@mail.sanktbonifatius.de` (All-inkl), SMTP als
  Netlify-Env-Vars (Handbuch 13b).
- **Pfarrbrief/Datei-Cache** (frische PDF trotz gleichem Namen): ✅ umgesetzt via `withVersion()` in
  `Nav.astro` (Handbuch 1d).

## Start
```bash
npm run dev   # läuft mit NODE_TLS_REJECT_UNAUTHORIZED=0 auf Port 4321
```

## Schlüsseldateien
- `src/lib/wordpress.js` — WP-Anbindung (nur noch Termine/News/Beiträge/Tauftermine + `getSeoHead`
  für Beiträge, siehe Regel 0), Content-Bereinigung
- `src/lib/seo-static.js` — eingefrorener SEO-Head je statischer Route (Handbuch 1e), ersetzt
  `getSeoHead()` für alle Seiten außer Beiträgen/Terminen
- `src/lib/content/reisebedingungen.js` — eingefrorener Rechtstext „Jugend/Reisebedingungen"
- `src/components/Nav.astro` — Hauptnavigation (Logo 80px, Social, Dropdowns, Spenden)
- `src/components/EventCalendar.astro` — Termin-Kacheln (`astro-ev`), client-seitig
- `src/components/NewsGrid.astro` — Beitrags-Kacheln (`astro-news`), server-seitig
- `src/pages/index.astro` — Startseite, vollständig aus eigenen Komponenten (kein WP-`set:html` mehr)
- `src/pages/kontakt.astro` — Kontakt-Seite (Page-ID 46800), 100 % eigene `Kontakt*`-Komponenten (Handbuch 11)
- `src/pages/segen-sakramente/index.astro` — Übersicht „Segen und Sakramente" (Page-ID 48265), 100 % eigene `Segen*`-Komponenten (Handbuch 14)
- `src/pages/segen-sakramente/taufe.astro` — Taufe-Seite (Page-ID 46566), 100 % eigene `Taufe*`-Komponenten; Anmeldeformular postet an eigene Route `/api/taufe-anmeldung` (Handbuch 13/13b)
- `src/pages/api/taufe-anmeldung.ts` — API-Route: füllt das amtliche Taufe-PDF + verschickt es als Mail-Anhang (`prerender = false`)
- `src/lib/taufe/` — `fill-taufe.js` (Formulardaten → PDF) + `taufe-vorlage.pdf` (ausfüllbare Vorlage); Generator: `scripts/build-taufe-vorlage.mjs`
- `astro.config.mjs` — Vite-Proxy `/wp-proxy`; Server-Modus via `@astrojs/netlify` (für `/api/*`)
