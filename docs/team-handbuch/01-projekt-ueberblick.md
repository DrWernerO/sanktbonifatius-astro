# 01 · Projekt-Überblick

## Gesamtziel

**Modernisierung der Website der Pfarrei Sankt Bonifatius Frankfurt** (Stadtteil Sachsenhausen), sodass sie für externe Suchende (Taufe, Hochzeit, Beerdigung, Orientierung) eine einladende, informative erste Begegnung bietet — ohne die aktiven Gemeindemitglieder zu vergraulen.

Parallel: Ein **Vortrag + Präsentation** für das Pastoralteam, der die Designstrategie nachvollziehbar macht.

---

## Design-Herkunft (kurz)

Das heutige Design (Farben, Typografie, Komponenten) stammt aus den WordPress-Redesigns
**home6** (Startseite, Post 45758) und **bonfamily2** (Post 45898) sowie dem
Kirchort-Entwurf **st-aposteln-entwurf** (Post 45941), entstanden in mehreren
Arbeitssessions 2026. Diese WordPress-Seiten sind heute nur noch als **Design-Vorbild**
relevant — das Design selbst lebt jetzt in den Astro-Komponenten (siehe
[04-design-system.md](04-design-system.md) und `ASTRO-HANDBUCH.md`). Vollständige
Post-ID-Übersicht (auch der alten/gelöschten Entwürfe) in
[07-seiten-inventar.md](07-seiten-inventar.md).

---

## Aktueller Stand: Astro-Frontend auf Netlify (28.06.2026)

Die Seiten werden inzwischen in ein eigenständiges **Astro-Frontend** überführt (Headless:
WordPress liefert nur noch die Inhalte). Dieses Frontend läuft seit dem **28.06.2026** als
**Netlify-Test-Deploy**:

- **Vorschau-Adresse:** https://sage-cupcake-956dae.netlify.app/ — von überall erreichbar.
- **So wird gearbeitet:** Neue/geänderte Astro-Seiten werden **dort** angeschaut und
  abgenommen, nicht mehr nur lokal. Netlify baut bei jedem Upload zu GitHub automatisch neu.
- **Risiko = null:** Die echte Adresse `sanktbonifatius.de` bleibt bis zum endgültigen
  Go-Live unberührt.
- **Endgültiger Go-Live** (DNS-Umstellung) erst, wenn alle Seiten fertig sind; dann zieht
  WordPress auf `cms.sanktbonifatius.de` um. Details: [`ASTRO-HANDBUCH.md`](../ASTRO-HANDBUCH.md)
  Abschnitt 1b.

---

## Arbeitsumgebung

- **Lokaler Arbeitsordner:** `/Users/wernerotto/Claude/Code/`
- **Astro-Projekt (Git-Repo):** `/Users/wernerotto/Claude/Code/Senior Web Developer/` — GitHub `DrWernerO/sanktbonifatius-astro`. Dieses Handbuch liegt darin unter `docs/team-handbuch/` — die **einzige** gepflegte Kopie (wird auch von Lovis gelesen/aktualisiert).
- **Formulare/PDFs:** `/Users/wernerotto/Documents/BONI/Formulare und Papiere/`
- **Claude-Memory-Ordner:** `~/.claude/projects/-Users-wernerotto-Claude-Code/memory/`
- **Claude-Modelle:** Opus/Sonnet 5.x

## WordPress-Backend-Zugang (nur noch selten benötigt)

Seiten werden nicht mehr in WordPress gebaut — WordPress liefert nur noch Inhalte
(Termine, Beiträge) an Astro. Für gelegentliche Backend-Pflege (Termine korrigieren,
Plugin-Einstellungen) siehe [02-zugang-wordpress.md](02-zugang-wordpress.md).
