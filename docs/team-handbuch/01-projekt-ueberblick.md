# 01 · Projekt-Überblick

## Gesamtziel

**Modernisierung der Website der Pfarrei Sankt Bonifatius Frankfurt** (Stadtteil Sachsenhausen), sodass sie für externe Suchende (Taufe, Hochzeit, Beerdigung, Orientierung) eine einladende, informative erste Begegnung bietet — ohne die aktiven Gemeindemitglieder zu vergraulen.

Parallel: Ein **Vortrag + Präsentation** für das Pastoralteam, der die Designstrategie nachvollziehbar macht.

---

## Bisher umgesetzte Arbeitsstränge

### 1. Startseiten-Iterationen (homeneu → home7)
Sukzessive Entwürfe. Status **gegen die Live-REST-API verifiziert (19.06.2026)** — die maßgebliche Statusliste steht in [07-seiten-inventar.md](07-seiten-inventar.md):

| Slug | Post-ID | Status | Highlights |
|---|---|---|---|
| `homeneu` | 45176 | ❌ gelöscht | Editorial-Layout „Groß + 2 Kleine", Full-Bleed-Technik |
| `homeneu2` | 45281 | ❌ gelöscht | Custom-Nav, zweistufige Utility-Bar, dynamische Termine |
| `homeneu3` | 45633 | ❌ gelöscht | Vorläufer von homeneu3a |
| `homeneu3a` | 45650 | ❌ gelöscht | CTA, Zielgruppen-Section, Gottesdienst-Formate, Kirchorte-Karten |
| `homeneu4` | 45648 | ❌ gelöscht | Zielgruppen-Kacheln + Gottesdienst-Formate |
| **`home6`** | **45758** | **publish — Live-Startseite** | **DESIGN-VORBILD — bh3a-Header, editorial, bh2-vt-Kalender** |
| `home7` | 45759 | 🗑️ Papierkorb | Variante von home6 |

**Wichtig:** home6 ist das **verbindliche Design-Vorbild** für alle weiteren Seiten und seit Go-Live die Live-Startseite (`page_on_front`=45758). Nicht zurück zu älteren Versionen springen.

### 2. BonFamily-Redesign
- `bonfamily2` · Post **45898** · publish
- Home6-Header + dynamischer Veranstaltungskalender (Kategorie-Filter „BonFamily") übernommen
- Eigenes Farbschema `--bf-*` mit Accent `#9a2d2d`
- FAQ als natives `<details>`-Element (Theme-Bug-Umgehung, siehe 06-technische-loesungen.md)
- Fotogalerie mit Lightbox + 2 Ansprechpartner-Karten

### 3. Kirchort-Seiten
- `st-aposteln-entwurf` · Post **45941** · publish
- Vorlage für künftige Kirchort-Seiten (Herz Jesu, St. Bonifatius, St. Wendel)
- Home6-Header + Kirchen-Foto-Hero + Ansprechpartner-Karten + Geschichte-Modal

### 4. Bestehende Funktionsseiten
- **Taufe-Formular** (Post 19236) — AJAX-Submit, E-Mail an w.otto@sanktbonifatius.de

### 5. Vollständiger bh3a-Ausbau (Mai 2026)

In intensiven Arbeitssessions im Mai 2026 entstanden über 30 neue Seiten im einheitlichen bh3a-Design:

**Kasualien & Sakramente:** Trauung (47394), Erstkommunion (47424), Krankensalbung (47431), Beichte (**47511** — live; 47521 ist Entwurf `beichte-2`), Taufe3 (46566)

**Pfarrei-Info:** Pastoralteam (48534), Leitung (48782), Finanzen & Transparenz (48786)

**Gemeinschaft:** Gemeinschaft2 (48254), Engagement (48449), Ich bleibe! (48677), Kath. werden (48544)

**Gottesdienste:** Gottesdienstordnung2 (46977), Kinder- & Familiengottesdienste (48268)

**Digital:** WhatsApp-Kanal (48333), Newsletter (48663)

**Technisch:** Alle Seiten nutzen dieselbe CSS-Architektur via `body:has(.bh3a-hdr)` — zentral in `style.css`, kein Page-ID-Management mehr nötig. Vollständige Übersicht in `07-seiten-inventar.md`.

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

- **Lokaler Arbeitsordner:** `/Users/wernerotto/Library/Mobile Documents/com~apple~CloudDocs/Claude/Code/`
- **Formulare/PDFs:** `/Users/wernerotto/Documents/BONI/Formulare und Papiere/`
- **Claude-Memory-Ordner:** `~/.claude/projects/-Users-wernerotto-Library-Mobile-Documents-com~apple~CloudDocs-Claude-Code/memory/`
- **Claude-Modelle:** Opus 4.x (für Design/Strategie), Sonnet 4.x (für technische Details)

## Browser-Setup

Für alle Live-Arbeiten an WordPress:
- **Chrome-Tab mit WordPress Admin** eingeloggt als Werner
- Claude nutzt `mcp__Claude_in_Chrome__javascript_tool`, um per `wp.apiFetch` Inhalte direkt zu lesen/zu schreiben
- Details siehe 02-zugang-wordpress.md
