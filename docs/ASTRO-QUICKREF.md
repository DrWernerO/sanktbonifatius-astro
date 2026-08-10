# Astro-Frontend Quickref — Sankt Bonifatius

> Kompakte Sessionreferenz. Für Details zum Aufbau einzelner Seiten/Komponenten
> den passenden Abschnitt in [`ASTRO-HANDBUCH.md`](ASTRO-HANDBUCH.md) nachlesen.

> ## 🌐 Die neue Seite im Browser ansehen
> ### 👉 **https://sanktbonifatius.de**
> Das ist jetzt die **echte, live geschaltete** Astro-Website (Go-Live 2026-08-03, DNS zeigt auf
> Netlify). Aktualisiert sich automatisch bei jedem Push auf `main` sowie bei WP-Inhaltsänderungen
> über den Rebuild-Webhook (Handbuch 1c). WordPress läuft als Backend unter `cms.sanktbonifatius.de`.

---

## Sofort-Start

```bash
npm run dev   # Port 4321
```

**Server-seitige Änderungen** (`lib/*.js`, `.astro`-Frontmatter) → Dev-Server neu starten.
CSS/Client-JS lädt per HMR. Hartnäckiger JS-Cache → privates Browser-Fenster.

---

## Die 5 wichtigsten Regeln

1. **`astro-`-Präfix** für ALLE eigenen CSS-Klassen — nie WP-Theme-Klassen (`bh2-…`, `bh3a-…`) wiederverwenden, sonst überschreibt WP-CSS unsere Styles. (Handbuch Abschnitt 3)
2. **Inhalte kommen von WordPress unter** `https://cms.sanktbonifatius.de` (seit Go-Live 2026-08-03). Quell-Domains in `src/lib/wordpress.js` (`WP_API`, `WP_RENDER_ORIGIN`) und `astro.config.mjs` (`WP_LIVE`).
3. **Nav (`Nav.astro`) NUR mit Werners ausdrücklicher Freigabe ändern.** Neue Seiten werden gebaut, aber nicht automatisch ins Menü aufgenommen.
4. **Seitenverzeichnis (`docs/SEITENVERZEICHNIS.md`) sofort mitpflegen** — bei jeder neuen oder geänderten Seite als eigener `Doku:`-Commit.
5. **Nie löschen/senden/veröffentlichen ohne Franks Rückfrage.**

---

## Schlüsseldateien

| Datei | Zweck |
|-------|-------|
| `src/lib/wordpress.js` | WP-Anbindung, Content-Bereinigung, `removeRange`, `ASTRO_SLOT`, `getSeoHead` |
| `src/layouts/Base.astro` | Rahmen mit Nav + Footer — pro Seite nicht nochmal einbinden |
| `src/components/Nav.astro` | Hauptnavigation (nur mit Werners OK ändern) |
| `src/components/EventCalendar.astro` | Termin-Kacheln (`astro-ev`), Props: `heading`, `category`, `categoryLabel`, `moreHref` |
| `src/components/NewsGrid.astro` | Beitrags-Kacheln (`astro-news`), Startseite |
| `astro.config.mjs` | Vite-Proxy `/wp-proxy` → `cms.sanktbonifatius.de`, `@astrojs/netlify`-Adapter |
| `src/pages/api/taufe-anmeldung.ts` | Taufe-Formular API-Route (`prerender = false`) |
| `docs/kirchort-routine.md` | **Pflichtlektüre vor Kirchort-Seiten** (4-Phasen-Routine) |

---

## Hosting-Stand

| Was | Wo | Status |
|-----|----|----|
| WordPress (CMS) | `cms.sanktbonifatius.de` (All-inkl) | läuft — reines Backend/REST-API |
| **Astro-Frontend (LIVE)** | **`sanktbonifatius.de`** → Netlify (DNS) | ✅ **live**, baut autom. bei Push |
| Astro-Frontend (Entwicklung) | lokal (`npm run dev`) | für die laufende Arbeit |
| Adapter | `@astrojs/netlify` | ✅ umgestellt |
| Rebuild bei Code-Push | Netlify | ✅ automatisch |
| Rebuild bei WP-Inhaltsänderung (Webhook) | Netlify Build Hook | ✅ läuft (Handbuch 1c) |
| Go-Live (eigene Domain via DNS) | — | ✅ erledigt 2026-08-03 |

**SMTP fürs Taufe-Formular** läuft über das All-inkl-Postfach `formular@mail.sanktbonifatius.de`
(nicht Microsoft 365) — Env-Vars in Netlify (`.env.example`, Handbuch 13b).

**Kurz-URLs + llms.txt** sind in `public/_redirects` und `public/llms.txt` **vorbereitet** (greifen automatisch beim Netlify-Deploy, lokal inaktiv). Pflege bei neuen/verschobenen Seiten → Handbuch **Abschnitt 1f**.

---

## Seitenstand (Stand 2026-08-03)

**86 Live-Seiten · 85 erledigt · 1 offen** (vollständige Liste in `docs/SEITENVERZEICHNIS.md`)

### Fertig (Auswahl)
- Startseite, Über uns + Unterseiten, Kirchorte (St. Bonifatius, St. Aposteln, Herz Jesu, St. Wendel + je Unterseiten)
- Kontakt + alle Unterseiten (Pfarrbüro, Engagement, Beratung, Trauerfall, Seelsorge, Newsletter, Kath. werden)
- Segen & Sakramente + alle Unterseiten (Taufe inkl. PDF-Formular, Firmung, Erstkommunion, Trauung, Beichte, Krankensalbung)
- Gottesdienst & Glaube + Unterseiten (Gottesdienstordnung, Gottesdienste die berühren)
- BonFamily, Engagiert Leben + Unterseiten (Hilfenetz, Offener Kühlschrank)
- Kitas-Bereich (Übersicht + 5 Kita-Unterseiten + Stellenbörse)
- Kirchen-Detailseiten St. Bonifatius (Altar, Orgel, Taufstein …) per Redirect auf den Kirchenführer
- BoniBlog (`/blog/`), Terminkalender, Spenden

### Noch offen
- Pfarrer Dr. Werner Otto (Über uns)

---

## Typisches Vorgehen neue Seite

1. **Page-ID** in `docs/team-handbuch/07-seiten-inventar.md` nachschlagen.
2. **Event-Kategorie-ID** in `docs/team-handbuch/05-veranstaltungskalender.md` (falls EventCalendar gebraucht).
3. **Hero prüfen:** Hat die WP-Seite ein Foto-Hero? → Bild lokal nach `public/uploads/<jahr>/<monat>/` laden. Nicht stillschweigend durch Farbverlauf ersetzen. (Handbuch Abschnitt 10, Punkt 7)
4. **Präfix wählen** (eindeutig `astro-XX`, nicht mit bestehenden Seiten kollidieren).
5. **Kirchort-Seite?** → zuerst `docs/kirchort-routine.md` lesen (4-Phasen-Routine).
6. Server neu starten, im privaten Fenster testen, `SEITENVERZEICHNIS.md` + Commit.

---

## Häufige Fallstricke (Handbuch Abschnitt 8)

| Symptom | Ursache | Fix |
|---------|---------|-----|
| CSS wirkt nicht | Klassenname kollidiert mit WP-Theme | `astro-`-Präfix nutzen |
| Keine Wirkung trotz Änderung | Server-seitiger Code, kein HMR | Dev-Server neu starten |
| Inhalte verschwinden | `removeRange`-Schnitt zu weit | Start-/End-Marker prüfen |
| Bilder dunkel/leer | Absolute Dev-URL nicht auf `/wp-proxy` umgeschrieben | URL-Rewrite prüfen |
| Elemente riesig | CSS-`<style>`-Block weggeschnitten | `<style>`-Blöcke aus entferntem Bereich bewahren |
| Server hängt 30s+ | Endlosschleife in `while` | Marker-basiert + Abbruch-Counter |
| Kein Emoji in der UI | UI-Regel | SVG nutzen |
