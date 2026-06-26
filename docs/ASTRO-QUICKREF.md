# Astro-Frontend Quickref — Sankt Bonifatius

> Kompakte Sessionreferenz. Für Details zum Aufbau einzelner Seiten/Komponenten
> den passenden Abschnitt in [`ASTRO-HANDBUCH.md`](ASTRO-HANDBUCH.md) nachlesen.

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
2. **Inhalte von der LIVE-Seite** `https://www.sanktbonifatius.de` (seit 2026-06-22). Quell-Domains in `src/lib/wordpress.js` (`WP_API`, `WP_RENDER_ORIGIN`) und `astro.config.mjs` (`WP_LIVE`).
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
| `astro.config.mjs` | Vite-Proxy `/wp-proxy`, `@astrojs/node`-Adapter |
| `src/pages/api/taufe-anmeldung.ts` | Taufe-Formular API-Route (`prerender = false`) |
| `docs/kirchort-routine.md` | **Pflichtlektüre vor Kirchort-Seiten** (4-Phasen-Routine) |

---

## Hosting-Stand

| Was | Wo | Status |
|-----|----|----|
| WordPress (CMS) | All-inkl (kasserver.com) | läuft, bleibt dort |
| Astro-Frontend | lokal (`npm run dev`) | nur Entwicklung |
| Astro-Frontend (geplant) | Netlify | noch nicht eingerichtet |
| Rebuild-Webhook | — | noch nicht gebaut (Handbuch 1c) |

**Beim Netlify-Go-Live:** WordPress zieht auf `cms.`-Subdomain → Quell-Domains und Adapter anpassen. SMTP-Env-Vars für Taufe-Formular setzen (`.env.example`).

---

## Seitenstand (Stand 2026-06-26)

**80 Live-Seiten · 66 erledigt · 14 offen**

### Fertig (Auswahl — vollständige Liste in `docs/SEITENVERZEICHNIS.md`)
- Startseite, Über uns + Unterseiten, Kirchorte (St. Bonifatius, St. Aposteln, Herz Jesu, St. Wendel + je Unterseiten)
- Kontakt + alle Unterseiten (Pfarrbüro, Engagement, Beratung, Trauerfall, Seelsorge, Newsletter, Kath. werden)
- Segen & Sakramente + alle Unterseiten (Taufe inkl. PDF-Formular, Firmung, Erstkommunion, Trauung, Beichte, Krankensalbung)
- Gottesdienst & Glaube + Unterseiten (Gottesdienstordnung, Gottesdienste die berühren)
- BonFamily, Engagiert Leben + Unterseiten (Hilfenetz, Offener Kühlschrank)
- BoniBlog (`/blog/`), Terminkalender, Spenden

### Noch offen
- Pfarrer Dr. Werner Otto
- Kitas-Bereich (Übersicht + 5 Kita-Unterseiten + Stellenbörse)
- Kirchen-Detailseiten St. Bonifatius (Altar, Orgel, Taufstein u.a. — 13 Seiten)

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
