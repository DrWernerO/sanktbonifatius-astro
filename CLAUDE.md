# Sankt Bonifatius — Astro-Frontend (Headless WordPress)

> **VOR jeder Arbeit an einer Seitenübernahme zuerst [`docs/ASTRO-HANDBUCH.md`](docs/ASTRO-HANDBUCH.md) lesen.**
> Dort steht alles zu Architektur, Nav-Aufbau, Beitrags-/Termin-Kacheln und den
> wiederkehrenden Fallstricken.
>
> **Ergänzend** liegt das **Team-Handbuch** unter [`docs/team-handbuch/`](docs/team-handbuch/):
> WordPress-Seiten-IDs ([`07-seiten-inventar.md`](docs/team-handbuch/07-seiten-inventar.md)),
> Design-System/Farben/Fonts ([`04-design-system.md`](docs/team-handbuch/04-design-system.md)),
> Event-Kategorien ([`05-veranstaltungskalender.md`](docs/team-handbuch/05-veranstaltungskalender.md))
> und der WordPress-Zugang ([`02-zugang-wordpress.md`](docs/team-handbuch/02-zugang-wordpress.md)).
> Beim Bau einer neuen Seite dort die **Page-ID** und passende **Event-Kategorie** nachschlagen.

## Die wichtigsten Regeln in Kürze

1. **Inhalte kommen vom Dev-Server** `dev.sanktbonifatius.de.w021941a.kasserver.com`
   (live ist veraltet). Server-seitig direkt (`NODE_TLS_REJECT_UNAUTHORIZED=0`),
   client-seitig über Vite-Proxy `/wp-proxy/...` (selbst-signiertes SSL).
2. **Eigene Komponenten IMMER mit Präfix `astro-`** — nie WP-Theme-Klassen (`bh2-…`)
   wiederverwenden, sonst überschreibt das WP-CSS unsere Styles.
3. **Server-seitige Änderungen (`lib/*.js`, `.astro`-Frontmatter) → Dev-Server neu starten.**
   CSS/Client-JS lädt per HMR. Bei zähem JS-Cache: privates Browser-Fenster.
4. **WP-Sektionen ersetzen** via `removeRange` + `ASTRO_SLOT` in `src/lib/wordpress.js`;
   `<style>`-Blöcke aus dem Schnitt bewahren.

## Hosting-Stand (Details in Handbuch 1b–1d)
- **WordPress** läuft auf **All-inkl** (kasserver.com) → bleibt dort (Backend/CMS).
- **Astro-Frontend** läuft derzeit **nur lokal**; produktiv geplant auf **Netlify** (noch nicht eingerichtet).
- **Rebuild-Webhook** (WP-Änderung → Netlify-Build): **noch NICHT gebaut**, nur Konzept (Handbuch 1c).
- **Pfarrbrief/Datei-Cache** (frische PDF trotz gleichem Namen): Lösung dokumentiert (Handbuch 1d), Helfer noch zu bauen.

## Start
```bash
npm run dev   # läuft mit NODE_TLS_REJECT_UNAUTHORIZED=0 auf Port 4321
```

## Schlüsseldateien
- `src/lib/wordpress.js` — WP-Anbindung, Content-Bereinigung, Sektions-Ersatz
- `src/components/Nav.astro` — Hauptnavigation (Logo 80px, Social, Dropdowns, Spenden)
- `src/components/EventCalendar.astro` — Termin-Kacheln (`astro-ev`), client-seitig
- `src/components/NewsGrid.astro` — Beitrags-Kacheln (`astro-news`), server-seitig
- `src/pages/index.astro` — Startseite, Page-ID 45758, splittet Content am `ASTRO_SLOT`
- `src/pages/kontakt.astro` — Kontakt-Seite (Page-ID 46800), 100 % eigene `Kontakt*`-Komponenten (Handbuch 11)
- `src/pages/segen-sakramente/index.astro` — Übersicht „Segen und Sakramente" (Page-ID 48265), 100 % eigene `Segen*`-Komponenten (Handbuch 14)
- `src/pages/segen-sakramente/taufe.astro` — Taufe-Seite (Page-ID 46566), 100 % eigene `Taufe*`-Komponenten; Anmeldeformular sendet an WP-Handler `taufe_anmeldung` (Handbuch 13/13b)
- `astro.config.mjs` — Vite-Proxy `/wp-proxy`
