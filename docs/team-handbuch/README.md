# Team-Handbuch · Pfarrei Sankt Bonifatius Frankfurt

**Stand:** Juni 2026 · **Go-Live der neuen Seiten: 19.06.2026** (Details in [06-technische-loesungen.md](06-technische-loesungen.md), Abschnitt 25)
**Autoren:** Werner Otto + Claude (Anthropic)
**Zweck:** Alle Informationen, die für die gemeinsame Weiterarbeit an der Website nötig sind.

> ### 🌐 NEU (28.06.2026) — Vorschau jetzt über Netlify
> Die neue **Astro-Version** der Website läuft als Test-Deploy unter
> **https://sage-cupcake-956dae.netlify.app/**.
> Neue oder geänderte Astro-Seiten werden ab sofort **dort** angeschaut und abgenommen
> (nicht mehr nur lokal auf `localhost`). Die Adresse ist von überall erreichbar und
> aktualisiert sich automatisch bei jedem Upload zu GitHub.
> Die echte Adresse `sanktbonifatius.de` bleibt bis zum endgültigen Go-Live **unberührt**.
> Technische Details: [`ASTRO-HANDBUCH.md`](../ASTRO-HANDBUCH.md) Abschnitt 1b.

---

## Worum es geht

Dieses Handbuch bündelt die Ergebnisse von rund einem Dutzend Arbeits-Sessions mit Claude (Anthropic AI). Es beschreibt:

- Wie die Website https://www.sanktbonifatius.de redesignt wird (Startseite, Kirchorte, BonFamily)
- Welche Erkenntnisse aus Google Search Console + Google Analytics in das Design eingeflossen sind
- Das **Design-System**, das für alle neuen Seiten verbindlich ist (home6, bonfamily2)
- Die **technischen Lösungen**, die in den Sessions erarbeitet wurden (Veranstaltungskalender, FAQ-Modal, Chrome-Filter-Workarounds)


---

## Lesereihenfolge

| # | Datei | Für wen besonders wichtig |
|---|---|---|
| 1 | [01-projekt-ueberblick.md](01-projekt-ueberblick.md) | **alle** – was wurde gemacht, was kommt als nächstes |
| 2 | [02-zugang-wordpress.md](02-zugang-wordpress.md) | **technisch Aktive** – Admin-Login, REST-API-Workflow |
| 3 | [03-gsc-ga-erkenntnisse.md](03-gsc-ga-erkenntnisse.md) | **alle** – warum die Seite so aussieht, wie sie aussieht |
| 4 | [04-design-system.md](04-design-system.md) | **Design/Texter** – Farben, Typo, Komponenten, Präfix-Konvention |
| 5 | [05-veranstaltungskalender.md](05-veranstaltungskalender.md) | **technisch Aktive** – automatischer Kalender home6/bonfamily2 |
| 6 | [06-technische-loesungen.md](06-technische-loesungen.md) | **technisch Aktive** – FAQ-Modal, Header, Hamburger-Nav, Mobile-Grid-Fixes, Fallstricke |
| 7 | [07-seiten-inventar.md](07-seiten-inventar.md) | **alle** – Post-IDs und Status aller Seiten |
| 8 | [09-skills-workflows.md](09-skills-workflows.md) | **Claude-Nutzer:innen** – `/ui-ux-pro-max`, Prompts, Vorgehen |
| 10 | [10-fonts.md](10-fonts.md) | **Design/Datenschutz** – EB Garamond + Source Sans 3, Bunny Fonts, DSGVO-Workflow, Reversal |

---

## Mit Claude weiterarbeiten

1. **Neuen Dialog starten** in Claude Code, Claude.ai oder in der Claude-Chrome-Extension.
2. Als erste Aufgabe: *"Lies das Team-Handbuch unter `/Users/wernerotto/Library/Mobile Documents/com~apple~CloudDocs/Claude/Code/team-handbuch/` — beginne mit `README.md` und den nummerierten Dateien."*
3. Claude liest alles nacheinander und hat dann den vollen Kontext (WordPress-Zugänge, Design-System, bisherige Arbeit).
4. **Design-Aufgaben** immer mit dem Skill `/ui-ux-pro-max` starten — das ist unser verbindlicher Design-Rahmen.

---

## Wichtige Leitplanken (nicht vergessen!)

- **Zielgruppe ≠ aktive Mitglieder.** Die Website ist für **Externe** (Taufe, Hochzeit, Beerdigung, Orientierung). Aktive Gemeindemitglieder haben andere Kanäle (Pfarrbrief, Gottesdienst, WhatsApp).
- **Design-Vorbild:** home6 (Post 45758) + bonfamily2 (Post 45898). Alle neuen Seiten folgen deren Farben, Typografie, Component-Stil.
- **Veränderungen nie direkt an der Live-Startseite.** Immer über Draft-Kopien (homeneuX, kirchort-Entwurf etc.).
- **Seit Go-Live (19.06.2026)** sind alle Seiten produktiv auf **www**. Es gibt **nur noch den Live-Server www** — der frühere Dev-Server ist stillgelegt (Go-Live war ein vollständiger UpdraftPlus-Klon dev→www). PHP/CSS im Theme (`functions.php`, `style.css`) direkt auf www pflegen. Kurz-URLs (`/taufe/` …) sind als 301-Redirects in functions.php definiert (06, Abschnitt 25).
- **Seitentitel auf bh3a-Seiten** immer per CSS ausblenden (`h1.us_title { display:none }`) — Meta `#ursprung_hide_page_title` ist per REST nicht setzbar.

---

## Kontakt / Projektverantwortung

- **Inhaltlich:** Werner Otto (w.otto@sanktbonifatius.de)
- **Technischer Admin:** Werner (eingeschränkte Rechte — kein Super-Admin)
- **KI-Unterstützung:** Claude (Anthropic), primär Opus 4.x über Claude Code CLI
