# Team-Handbuch · Pfarrei Sankt Bonifatius Frankfurt

**Stand:** August 2026 · **Go-Live der neuen Seiten (WordPress): 19.06.2026**
**Autoren:** Werner Otto + Claude (Anthropic)
**Zweck:** Alle Informationen, die für die gemeinsame Weiterarbeit an der Website nötig sind.

> ### 🌐 Vorschau der neuen Astro-Version
> Die neue **Astro-Version** der Website läuft als Test-Deploy unter
> **https://sage-cupcake-956dae.netlify.app/**.
> Neue oder geänderte Astro-Seiten werden **dort** angeschaut und abgenommen
> (nicht mehr nur lokal auf `localhost`). Die Adresse aktualisiert sich automatisch bei
> jedem Upload zu GitHub. Die echte Adresse `sanktbonifatius.de` bleibt bis zum
> endgültigen Go-Live unberührt. **Vor jeder Arbeit an Astro-Seiten zuerst
> [`../ASTRO-QUICKREF.md`](../ASTRO-QUICKREF.md) lesen** — dieses Team-Handbuch liefert
> nur noch die Sankt-Bonifatius-spezifischen Zusatzinfos (Design-System, Post-IDs,
> Event-Kategorien, WP-Backend-Zugang).

---

## Worum es geht

Dieses Handbuch bündelt die Ergebnisse vieler Arbeits-Sessions mit Claude (Anthropic AI).
Es beschreibt:

- Welche Erkenntnisse aus Google Search Console + Google Analytics in das Design eingeflossen sind
- Das **Design-System**, das für alle Seiten verbindlich ist (Farben, Typografie, Komponenten)
- Die **WordPress-Seiten-IDs**, die Astro als Content-Quelle nutzt
- Den **WordPress-Backend-Zugang** für gelegentliche Content-Pflege

---

## Lesereihenfolge

| # | Datei | Für wen besonders wichtig |
|---|---|---|
| 1 | [01-projekt-ueberblick.md](01-projekt-ueberblick.md) | **alle** – was wurde gemacht, was kommt als nächstes |
| 2 | [02-zugang-wordpress.md](02-zugang-wordpress.md) | **technisch Aktive** – WP-Backend-Zugang (Anwendungspasswort) für gelegentliche Content-Pflege |
| 3 | [03-gsc-ga-erkenntnisse.md](03-gsc-ga-erkenntnisse.md) | **alle** – warum die Seite so aussieht, wie sie aussieht |
| 4 | [04-design-system.md](04-design-system.md) | **Design/Texter** – Farben, Typo, Komponenten-Katalog |
| 5 | [05-veranstaltungskalender.md](05-veranstaltungskalender.md) | **technisch Aktive** – Event-Kategorie-IDs für `EventCalendar.astro` |
| 6 | [07-seiten-inventar.md](07-seiten-inventar.md) | **alle** – WordPress-Post-IDs und Status aller Seiten (Content-Quelle für Astro) |
| 7 | [09-skills-workflows.md](09-skills-workflows.md) | **Claude-Nutzer:innen** – `/ui-ux-pro-max`, Prompts, Vorgehen |

> Für alles Astro-Technische (Komponenten, Build, Hosting, Deployment) gilt
> [`../ASTRO-HANDBUCH.md`](../ASTRO-HANDBUCH.md) und [`../ASTRO-QUICKREF.md`](../ASTRO-QUICKREF.md)
> als führende Quelle — dieses Team-Handbuch ergänzt nur die Sankt-Bonifatius-spezifischen Inhalte.

---

## Mit Claude weiterarbeiten

1. **Neuen Dialog starten** in Claude Code, Claude.ai oder in der Claude-Chrome-Extension.
2. Als erste Aufgabe: *"Lies `docs/ASTRO-QUICKREF.md`, dann bei Bedarf `docs/team-handbuch/README.md` und die nummerierten Dateien."*
3. Claude liest alles nacheinander und hat dann den vollen Kontext (Design-System, Post-IDs, Event-Kategorien, WP-Zugang).
4. **Design-Aufgaben** immer mit dem Skill `/ui-ux-pro-max` starten — das ist unser verbindlicher Design-Rahmen.

---

## Wichtige Leitplanken (nicht vergessen!)

- **Zielgruppe ≠ aktive Mitglieder.** Die Website ist für **Externe** (Taufe, Hochzeit, Beerdigung, Orientierung). Aktive Gemeindemitglieder haben andere Kanäle (Pfarrbrief, Gottesdienst, WhatsApp).
- **Design-Vorbild:** home6 + bonfamily2 (WordPress-Ursprung) — lebt jetzt in den Astro-Komponenten weiter. Alle Seiten folgen den Farben, der Typografie und dem Component-Stil aus [04-design-system.md](04-design-system.md).
- **Eigene CSS-Präfixe (`astro-...`)** für alle neuen Astro-Komponenten — nie alte WP-Theme-Klassen wiederverwenden (siehe `ASTRO-HANDBUCH.md` §3).
- **Nur eine Handbuch-Kopie:** Dieser Ordner (`docs/team-handbuch/` im Astro-Repo) ist die einzige gepflegte Version. Änderungen als eigene `Doku:`-Commits.

---

## Kontakt / Projektverantwortung

- **Inhaltlich:** Werner Otto (w.otto@sanktbonifatius.de)
- **Technischer Admin:** Werner (eingeschränkte Rechte — kein Super-Admin)
- **KI-Unterstützung:** Claude (Anthropic), primär über Claude Code CLI
