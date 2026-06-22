# 07 · Seiten-Inventar (Post-IDs)

**Stand:** 19.06.2026, **gegen die Live-REST-API verifiziert** (www.sanktbonifatius.de). Bei neuen Seiten bitte hier ergänzen.

> **Stand nach Go-Live (verifiziert 19.06.2026):** Beim Go-Live (UpdraftPlus-Klon dev→www, **IDs unverändert**) haben die **Redesign-Seiten die sauberen Slugs übernommen und stehen auf `publish`**. Die **abgelösten Alt-Seiten** wurden entweder auf `draft` gesetzt (mit `…-alt`-Slug) oder gelöscht/in den Papierkorb verschoben. „Status" unten = tatsächlicher Live-Status. Legende: `publish` = live · `draft` = Entwurf (nicht öffentlich) · 🗑️ **Papierkorb** = im Trash · ❌ **gelöscht** = per REST nicht mehr auffindbar (404).

> **Technische Grundregel für alle bh3a-Seiten:** Fonts, transparente Nav, Padding-Fix und Hamburger-Menü greifen automatisch, sobald `<div class="bh3a-hdr">` im Seiteninhalt steht — keine Einträge in style.css oder functions.php nötig.

---

## ⭐ Vorlage für neue bh3a-Seiten

| Slug | Post-ID | Status | Zweck |
|---|---|---|---|
| `dummy` (Live-Slug) | **48530** | draft | Saubere Basis: Nav + leerer brauner Hero. **Von hier klonen**, nicht von home6 — vermeidet wn-Widget und home6-Inhalt. Bleibt bewusst `draft` (Vorlage). |

**Workflow:** 48530 klonen → Slug/Titel anpassen → eigenen Inhalt einfügen → fertig.

---

## Design-Vorbilder

| Slug | Post-ID | Status | Rolle |
|---|---|---|---|
| **`home6`** ⭐ | **45758** | publish | **HAUPT-VORBILD + Live-Startseite** (Live-Slug `home`, `page_on_front`=45758) — bh3a-Header, bh2-vt-Kalender, alle CSS-Klassen |
| **`bonfamily2`** ⭐ | **45898** | publish | **VORBILD für thematische Unterseiten** (Live-Slug `bonfamily`) |
| `taufe3` ⭐ | 46566 | publish | **VORBILD für Kasualien-Seiten** — AJAX-Formular, 11 Sections (Live-Slug `taufe`) |

---

## Startseiten (Archiv)

*Durch home6 (45758) abgelöst. Live-Status verifiziert 19.06.2026:*

| Slug | Post-ID | Status |
|---|---|---|
| `home-alt` (frühere Live-Startseite) | 16681 | draft (Entwurf-Backup der alten Startseite) |
| `homeneu` | 45176 | ❌ gelöscht |
| `homeneu2` | 45281 | ❌ gelöscht |
| `homeneu3` | 45633 | ❌ gelöscht |
| `homeneu3a` / `home5` | 45650 | ❌ gelöscht |
| `homeneu4` | 45648 | ❌ gelöscht |
| `home7` | 45759 | 🗑️ Papierkorb (`home7__trashed`) |
| `home6_Frank` | 46570 | 🗑️ Papierkorb (`home6__trashed`) |

---

## Kasualien & Sakramente

| Slug | Post-ID | Status | Besonderheit |
|---|---|---|---|
| `taufe3` ⭐ | **46566** | publish | Live-Slug `taufe`. AJAX-Anmeldeformular, Vorbild für alle Kasualien |
| `taufe` (alt) | 19236 | draft | Alte Live-Seite, abgelöst |
| `trauung` | **47394** | publish | 3 Kirchorte, 7 FAQ, Präfix `tr-` |
| `erstkommunion2` | **47424** | publish | Live-Slug `erstkommunion`. Kurs A+B, Anmeldehinweis, Präfix `ek-` |
| `krankensalbung-2` | **47431** | publish | Live-Slug `krankensalbung`. Notfall-Box, Präfix `ks-` |
| `beichte` (live) | **47511** | publish | **Live-Beichte-Seite** (Live-Slug `beichte`) — ⚠️ Achtung: gegenüber älterem Stand getauscht |
| `beichte-2` (Entwurf) | 47521 | draft | Live-Slug `beichte-2`, nicht öffentlich |
| `beichte (alt, klassisch)` | 19372 | ❌ gelöscht | |
| `gottesdienste-beruehren2` | 47578 | publish | Live-Slug `gottesdienste-die-beruehren` |
| `trauerfall2` | 47631 | publish | Live-Slug `trauerfall` |
| `hochzeit` | — | — | Keine eigene Seite mit Slug `hochzeit` gefunden |
| `beerdigung` | — | — | Keine eigene Seite mit Slug `beerdigung` gefunden |

---

## Kirchort-Seiten

| Slug | Post-ID | Status | Zweck |
|---|---|---|---|
| `st-aposteln` (alt) | 18423 | draft | Alte Seite, abgelöst |
| `st-aposteln-entwurf` ⭐ | 45941 | publish | **Live** (Live-Slug `st-aposteln`). Redesign-Vorlage für alle Kirchorte |
| `st-bonifatius` (alt) | 18519 | draft | Alte Seite, abgelöst |
| `st-bonifatius (2)` | 47279 | publish | **Live** (Live-Slug `st-bonifatius`) |
| `st-wendel (2)` | 47880 | publish | **Live** (Live-Slug `st-wendel`) |
| `herz-jesu` | 47906 | publish | **Live** |

---

## Gottesdienste & Glaube

| Slug | Post-ID | Status | Inhalt |
|---|---|---|---|
| `gottesdienstordnung2` | **46977** | publish | Live-Slug `gottesdienstordnung`. 5 Format-Kacheln + ChurchDesk-Widget — Hero: `image-fotos-stbonifatius-00047` |
| `kinder-familiengottesdienste` | **48268** | publish | Live-Slug `familiengottesdienste`. Rot-Theme, 1.+3. Sonntag |
| `segen-sakramente2` | **48265** | publish | Live-Slug `segen-sakramente` (löst alte 17686 ab). Gelb-Theme, 6 Sakramente-Kacheln |
| `gottesdienst-glaube2` | 45667 | publish | Live-Slug `gottesdienst-glaube` |

---

## Gemeinschaft & Engagement

| Slug | Post-ID | Status | Inhalt |
|---|---|---|---|
| `gemeinschaft2` | **48254** | publish | Türkis-Theme, 4 Gruppen-Kacheln |
| `engagement` | **48449** | publish | Türkis-Theme, 6 Engagement-Kacheln |
| `ich-bleibe` | **48677** | publish | 7 Testimonial-Karten |
| `jugend2` | 46717 | publish | Live-Slug `jugend` (löst alte 16690 ab) |
| `kultur-begegnung2` | 46764 | publish | Live-Slug `kultur-begegnung` |
| `engagiert-leben3` | 46769 | publish | Live-Slug `engagiert-leben` |
| `boniblog` | 45493 | publish | |

---

## Pfarrei & Organisation

| Slug | Post-ID | Status | Inhalt |
|---|---|---|---|
| `pastoralteam` | **48534** | publish | 11 Team-Karten mit Initialen-Circles — Hero: einfarbig `#2c2420` (Tief-Braun), siehe Analyse unten |
| **`leitung`** ⭐ | **48782** | publish | Pfarrer + Pastoralteam, PGR/VR, Protokoll-PDFs |
| `leitung (alt)` | 48750 | ❌ gelöscht | War durch 48782 ersetzt — inzwischen entfernt |
| `finanzen-transparenz` | **48786** | publish | Live-Slug `finanzen`. Haushalt 2026, 8 Kirchensteuer-Kacheln |
| `ueber-uns2` | 46786 | publish | **Ist jetzt DIE Über-uns-Seite** (Live-Slug `ueberuns`, löst alte 16740 ab) |

---

## Digital & Mitglieder

| Slug | Post-ID | Status | Inhalt |
|---|---|---|---|
| `whatsapp-kanal` | **48333** | publish | SEO-Title gesetzt via functions.php |
| `newsletter` | **48663** | publish | ChurchDesk-Abo-Formular |
| `katholischwerden` | **48544** | publish | Live-Slug `katholisch-werden`. 3 Wege: Taufe / Aufnahme / Wiederaufnahme |
| `kontakt2` | 46800 | publish | Live-Slug `kontakt` |
| `beratung-und-hilfe` | **48312** | publish | Unterseite von `/kontakt/`. Seelsorge/Beratung, Notfall-Banner, Ansprechpersonen, externe Stellen, Hinweisgeberschutz. **SEO (22.06.2026):** eigener SEOPress-Titel + Meta-Description gesetzt (vorher Startseiten-Default); JSON-LD WebPage+BreadcrumbList+CatholicChurch ergänzt; Hero-H1 auf „Beratung und Hilfe" vereinheitlicht |
| `terminkalender2` | 47024 | publish | Live-Slug `terminkalender` |
| `firmung` (alt) | 46776 | ❌ gelöscht | Durch 46778 abgelöst |
| `firmung2` | 46778 | publish | **Live** (Live-Slug `firmung`) |
| `pfarrbuero` | 47815 | publish | |

---

## Frühere klassische Seiten — Status nach Go-Live (verifiziert 19.06.2026)

Diese alten Top-Level-Seiten wurden durch bh3a-Redesigns abgelöst. Die Redesigns haben die sauberen Slugs übernommen; die Alt-Seiten sind gelöscht oder als Entwurf geparkt.

| Alte Seite | Post-ID | Status | Abgelöst durch |
|---|---|---|---|
| `ueberuns` (Über uns, alte Parent-Page) | 16740 | ❌ gelöscht | 46786 (`ueber-uns2`, jetzt Slug `ueberuns`) |
| `gottesdienst-und-glaube` | 16683 | draft (`gottesdienst-glaube-alt`) | 45667 (`gottesdienst-glaube`) |
| `segen-sakramente` | 17686 | ❌ gelöscht | 48265 (`segen-sakramente`) |
| `jugend` | 16690 | draft (`jugend-alt`) | 46717 (`jugend`) |
| `barrierefreiheit` (Pflichtseite, alt) | 22508 | draft (`barrierefreiheit-alt`) | **49119** (`barrierefreiheit`, **publish** — Pflichtseite ist live ✅) |
| `terminkalender` (Ziel für „Alle Termine →") | — | — | 47024 (`terminkalender2`, jetzt Slug `terminkalender`) |

---

## Event-Kategorien (Term-IDs)

Wichtig für den dynamischen Kalender (siehe 05-veranstaltungskalender.md).

| Kategorie | Term-ID |
|---|---|
| Allgemein | 2584 |
| BonFamily | 2586 |
| Gottesdienst + Glaube | 2587 |
| Kultur & Begegnung | 2588 |
| Jugend | 2589 |
| Engagiert Leben | 2590 |

---

## Häufig benötigte Medien (Foto-IDs)

### Aposteln
| Slug | ID | Verwendung |
|---|---|---|
| `leben-staposteln-frankfurt-1` | 16456 | Kirchen-Innenraum Teaser |
| `leben-staposteln-frankfurt-2` | 16457 | Galerie |
| `leben-staposteln-frankfurt-3` | 16458 | Galerie |
| `StAposteln_KleiCa` | 11369 | Kleider-Café |
| `pommesbude-staposteln-frankfurt` | 15175 | Pommesbude |
| `Gebet_St_Aposteln` | 11367 | Gebetszeiten-Kachel |

### BonFamily
| Slug | ID | Verwendung |
|---|---|---|
| `bonfamily-auswahl-1` bis `-12` | 18337–18348 | Fotogalerie (12 Fotos) |

### Pastoralteam
| Slug | ID | Verwendung |
|---|---|---|
| `dsc00850-2` | — | Teamfoto Hero (Pastoralteam-Seite) |
| `Bonifatius_Pastoralteam_Werner-edited-1` | — | Werner Otto (Taufe3) |

### Kasualien
| Dateiname | Verwendung |
|---|---|
| `taufe-stbonifatius-5.jpg` | Taufe3 Hero |
| `erstkommunion2024-stbonifatius.jpeg` | Erstkommunion + KFG Hero |
| `sakramente-krankensalbung-stbonifatius.jpg` | Krankensalbung Hero |
| `sakramente-beichte-stbonifatius.jpg` | Beichte Hero |
| `header-ichbleibe.png` | Ich bleibe! Hero |
| `st-bonifatius-bei-whatsapp.jpg` | WhatsApp-Kanal Hero |

---

## Seiten-Analyse: pastoralteam (48534)

*Analyse-Stand: Juni 2026 — UX/UI + SEO*

### Hero-Empfehlung (einfarbig)

Kein Foto verfügbar / kein Foto-Hero gewünscht. Empfehlung: **einfarbiger Hero mit warmem Tief-Braun**, analog zur Vorlage 48530.

```css
/* Hero für 48534 — einfarbig, kein Bild */
.pastoralteam-hero {
  position: relative; width: 100vw;
  margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw);
  height: min(52vh, 480px);                   /* etwas kürzer als Foto-Hero */
  background: #2c2420;                         /* Tief-Braun — gleicher Wert wie C_DARK */
  display: flex; flex-direction: column;
  justify-content: flex-end;
}
.pastoralteam-hero__inner {
  padding: 56px 40px;
  max-width: 1280px; width: 100%;
  margin: 0 auto;
  color: #fff;
}
/* Gold-Akzentlinie oben — ersetzt das fehlende Foto visuell */
.pastoralteam-hero::before {
  content: "";
  position: absolute; top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #b88a3a 0%, #d4aa5a 50%, #b88a3a 100%);
}
```

**Innenstruktur (identisch zu Foto-Hero):**
- Eyebrow: `Pfarrei St. Bonifatius Frankfurt` — Playfair italic, `--bf-gold`, 15 px
- H1: `Unser Pastoralteam` — Playfair 700, weiß, clamp(36px, 5vw, 60px)
- Subtitle: `Menschen, die Gemeinde gestalten.` — weiß 85 %, 18 px

**Warum `#2c2420` statt `--bf-ink` (`#1e1512`)?** `#1e1512` ist near-black und laut Design-System nur für Foto-Heroes (mit Overlay) erlaubt. `#2c2420` ist das Print-Pendant — warm, würdevoll, nicht reines Schwarz.

---

### UX/UI-Analyse (ui-ux-pro-max)

**Profil:** Kirchliche Institutionsseite, Zielgruppe Gemeindemitglieder aller Altersgruppen → WCAG AA Pflicht, große Touch-Targets, klare Hierarchie.

#### Stärken der aktuellen Seite
- Initialen-Circles sind ein guter Ersatz für fehlende Fotos — konsistent und würdevoll.
- 11 Karten-Grid funktioniert auf Desktop gut.

#### Kritische Punkte (beheben vor Go-Live)

| Priorität | Problem | Lösung |
|---|---|---|
| **CRITICAL** | Kein Hero → Seite beginnt direkt mit dem Nav-Header, kein visueller Einstieg | Einfarbigen Hero (s.o.) einbauen — kein `margin-top` auf Hero! |
| **CRITICAL** | Initialen-Circles ohne `aria-label` → Screenreader liest nur Buchstaben | `aria-label="Foto von [Name]"` oder `role="img" aria-label="…"` ergänzen |
| **HIGH** | H1 fehlt oder ist `h1.us_title` (global hidden) | Genau eine sichtbare H1 = Hero-Titel `Unser Pastoralteam` |
| **HIGH** | Karten-Grid auf Mobile: Mindestbreite prüfen — bei 11 Karten Gefahr von zu kleinen Touch-Targets | Grid-Breakpoint: 1 Spalte < 480 px, 2 Spalten 480–768 px, 3+ Spalten ≥ 768 px; Card min-height 44 px |
| **MEDIUM** | Kein Intro-Text unter dem Hero → Besucher wissen nicht sofort, wen sie hier sehen | Welcome-Block (§ 4.3) mit 2–3 Sätzen ergänzen |
| **MEDIUM** | Bänder-Prinzip: wenn Hero dunkel → nächste Section muss hell beginnen (weiß/Crème) | Section 2 auf `background: #fff` oder `--bf-bg` setzen |
| **LOW** | Kein verlinktes Foto / kein Klick auf Karte → kein Engagement-Anker | Optional: Karte verlinkt auf Leitungs-Seite 48782 oder Anker |

#### Layout-Empfehlung Bandreihenfolge

| # | Zone | Farbe |
|---|---|---|
| 1 | Hero (einfarbig) | `#2c2420` dunkel |
| 2 | Welcome-Intro | `#fff` weiß |
| 3 | Team-Karten-Grid | `--bf-bg` Crème |
| 4 | CTA-Banner (→ Leitung 48782) | `linear-gradient(135deg,#4a2e1a,#3a2315)` |

---

### SEO-Analyse

**Seitentyp:** Institutional Team Page — lokal relevant, kein E-Commerce, kein Blog.

#### On-Page-Empfehlungen

| Element | Empfehlung |
|---|---|
| **SEO-Titel** | `Pastoralteam – St. Bonifatius Frankfurt` (43 Z.) — klar, lokal, ≤ 60 Z. |
| **Meta-Description** | `Lernen Sie das Pastoralteam der Pfarrei Sankt Bonifatius Frankfurt kennen – Priester, Diakone und hauptamtliche Mitarbeiterinnen im Porträt.` (148 Z.) |
| **H1** | `Unser Pastoralteam` (im Hero) |
| **H2** | z.B. `Priester & Diakone`, `Pastorale Mitarbeiterinnen` zur Strukturierung |
| **Slug** | `/pastoralteam` ist gut — kurz, sprechend, kein Keyword-Stuffing |
| **Beitragsbild + Alt** | Pflicht: WP-Beitragsbild setzen (z.B. Teamfoto `dsc00850-2`) für og:image |

#### Strukturierte Daten (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Pastoralteam – St. Bonifatius Frankfurt",
  "url": "https://www.sanktbonifatius.de/pastoralteam/",
  "description": "Das Pastoralteam der Pfarrei Sankt Bonifatius Frankfurt.",
  "isPartOf": {
    "@type": "CatholicChurch",
    "name": "Pfarrei Sankt Bonifatius Frankfurt",
    "url": "https://www.sanktbonifatius.de"
  }
}
```

Für jede Person zusätzlich `Person`-Schema (Name, jobTitle, worksFor) — entweder inline je Karte oder als Array im gleichen `<script>`-Block.

#### Interne Verlinkung

- Von **48534** → **48782** (Leitung): CTA-Banner „Zur Leitungsseite"
- Von **48782** → **48534**: Rückverlinkung im Einleitungstext
- Von **Startseite / Navigation** → 48534: Menüeintrag unter „Pfarrei & Team"

#### Keyword-Strategie (lokal)

| Keyword | Intention | Priorität |
|---|---|---|
| `Pastoralteam Sankt Bonifatius Frankfurt` | navigational | hoch |
| `Pfarrei Frankfurt Sachsenhausen Team` | local info | mittel |
| `katholische Kirche Frankfurt Mitarbeiter` | local info | mittel |
| `Pfarrer Frankfurt Sachsenhausen` | local info | mittel (→ 48782 besser geeignet) |

> **Hinweis:** Seite ist seit Go-Live auf `publish` und damit indexierbar. SEO-Titel + Meta-Description in Yoast/RankMath prüfen/eintragen; sicherstellen, dass kein `noindex` aus der dev-Zeit übrig ist (vgl. 06, Abschnitt 25.3 — beim Go-Live war der Stand sauber).

---

## Externe Links (häufig gebraucht)

| Link | Ziel |
|---|---|
| Newsletter abonnieren | ChurchDesk-Formular `form__64fe16eb3ccecf0007c1775c` |
| Steyler Missionarinnen | steyler-missionsschwestern.de |
| WhatsApp-Kanal | whatsapp.com/channel/0029VbB7E1CLikgAZ8cyHk1a |
