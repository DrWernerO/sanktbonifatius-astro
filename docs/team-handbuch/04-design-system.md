# 04 · Design-System (home6 + bonfamily2)

**Verbindlich für alle neuen Seiten.** Nicht frei erfinden — diese Tokens/Komponenten nutzen oder konsistent erweitern.

Design-Vorbilder live im Browser:
- https://www.sanktbonifatius.de/?page_id=45758&preview=true (home6)
- https://www.sanktbonifatius.de/?page_id=45898&preview=true (bonfamily2)

---

## 1. Farbpalette

### Globale Tokens (home6-Stil, benutzt auch von Aposteln-Entwurf und Vortrag-PDFs)

```css
:root {
  --bf-bg:       #f7f3ef;   /* Crème-Hintergrund */
  --bf-bg-alt:   #ede4d5;   /* warmes Sand-Beige */
  --bf-ink:      #1e1512;   /* Tief-Braun (Haupttext) */
  --bf-ink-60:   #6b5c52;   /* Muted-Text */
  --bf-accent:   #9a2d2d;   /* Weinrot (Accent, CTAs) */
  --bf-gold:     #b88a3a;   /* Gold für Dark-Sections und Hero-Eyebrow */
  --bf-border:   #e0d8cf;   /* dezenter Border */
  --bf-radius:   14px;
  --bf-shadow:    0 4px 20px rgba(30,21,18,.06);
  --bf-shadow-lg: 0 10px 32px rgba(30,21,18,.1);
}
```

### Vortrag/Print (passend, aber andere Hex-Werte)

```python
C_DARK   = '#2c2420'  # Tief-Braun (Hauptfarbe)
C_GOLD   = '#928269'  # Warm-Gold (Akzent)
C_LIGHT  = '#f7f3ef'  # Crème (Hintergrund)
C_BORDER = '#ede8e1'  # Border
C_MUTED  = '#7a6d59'  # Muted Text
```

Diese Print-Farben sind in den Vortrag-PDFs verbaut (siehe 08-vortrag-projekt.md) und sollen für Print-Materialien wiederverwendet werden.

---

## 2. Typografie

| Element | Font | Beispielstil |
|---|---|---|
| H1/H2 | `'Playfair Display', Georgia, serif` | 700, clamp(32px–72px), letter-spacing: -0.01em |
| H3 | `'Playfair Display', Georgia, serif` | 700, 20–24 px |
| Eyebrow (kleines Label) | `Playfair Display italic` | 14–17 px, color: `--bf-accent`, letter-spacing: .02em, UPPERCASE — **nur im Hero** (Standort/Kontext-Zeile über H1), **nie** über Section-H2s |
| Body | System-Stack (Inter/System) | 15–17 px, line-height 1.6 |
| Links (in Text) | – | `--bf-accent`, underline on hover |

**Regel:** Playfair Display immer für Überschriften. Eyebrows ausschließlich im Hero erlaubt — niemals als Über-Überschrift über Body-Sections (`<h2>`). Niemals für Fließtext.

---

## 3. CSS-Präfix-Konvention

| Präfix | Kontext | Beispiele |
|---|---|---|
| `bh2-` | Startseiten-Iterationen + home6-Erbe | `bh2-vt`, `bh2-editorial`, `bh2-news` |
| `bh3a-` | home6-Header (Navigation, Dropdowns) | `bh3a-hdr`, `bh3a-dd`, `bh3aSrch` |
| `bh4-` | homeneu4-Ergänzungen | `bh4-ziel`, `bh4-formate` |
| `boni-` | globale Komponenten (Programmzeilen, QuickLinks) | `boni-prog`, `boni-ql2` |
| `bf-` | **bonfamily2-Komponenten** | `bf-hero`, `bf-strip`, `bf-section`, `bf-faq-item` |
| `apos-` | **Kirchort-Aposteln-Entwurf** | `apos-hero-section`, `apos-tile`, `apos-modal` |

**Regel:** Für eine neue Kirchort-Seite (z.B. Herz Jesu) entweder `apos-`-Klassen wiederverwenden ODER eigenen kurzen Präfix (`hj-`) und dieselbe Struktur übernehmen.

---

## 4. Komponenten-Katalog

### 4.1 Header (home6 bh3a-hdr) ⭐ PFLICHTSTANDARD

**Verbindlich für ALLE Seiten im Entwurfsmodus und alle künftigen Seiten.**
Referenz-Implementierung: home6 (Post 45758) und jugend2.

---

#### 4.1.1 Visuelle Spezifikation (exakte Werte)

| Element | Eigenschaft | Wert |
|---------|------------|------|
| **Nav-Hintergrund** | background (immer) | `rgba(20,10,2,0.55)` |
| **Nav-Effekt** | backdrop-filter | `blur(8px)` |
| **Nav-Höhe** | .bh3a-hdr__in height | `80px` |
| **Logo-Kreis** | Größe | `80×80px` (.bh3a-brand__ring + img je 80px) |
| **Logo-Kreis** | Bilddatei | `sanktbonifatius-favicon.png` (WP-Mediathek 2025/09) |
| **Logo-Kreis** | background | `transparent` (Favicon hat transp. Hintergrund!) |
| **Logo-Kreis** | box-shadow | `none` (kein äußerer Ring!) |
| **Pfarreiname** | font-size / color | `18px` / `#f0e8d8` |
| **Social-Icons** | color (Link + SVG) | `#d4c9b5` (Cremeweiß — NICHT `#5a4a3a`!) |
| **Spenden-Button** | background | `#9a2d2d!important` |
| **Spenden-Button** | color | `#fff!important` (Theme überschreibt sonst!) |
| **Spenden-Button** | display | `inline-flex!important; align-items:center` |
| **Spenden-Button** | Form | `border-radius:50px` (Pill) |
| **Scroll-Effekt** | Grau-Glas nach Scrollen | via style.css Regel (s.u.) — KEIN JavaScript! |

#### 4.1.2 Globale Nav-Scrolled-Regel (seit 2026-05-16)

Der Scroll-Effekt (Glas-Optik beim Scrollen) ist **global** in `style.css` geregelt und gilt automatisch für alle bh3a-Seiten:

```css
body:has(.bh3a-hdr) .bh3a-hdr.nav-scrolled {
  background: rgba(20,10,2,0.55) !important;
  backdrop-filter: blur(8px) !important;
}
```

Es sind **keine page-id-spezifischen nav-scrolled-Regeln** mehr nötig. Auch kein MutationObserver oder Scroll-JavaScript im Seiteninhalt — das würde mit dem bh3a-Scroll-Script interferieren.

#### 4.1.3 Pflicht-Korrekturen im Seiteninhalt (navBereinigen)

Bei **jedem** `wp.apiFetch`-Save muss `navBereinigen(c)` aufgerufen werden:

```javascript
function navBereinigen(c) {
  c = c.replace('Frankfurt &middot; Sachsenhausen', 'Frankfurt am Main');
  c = removeSvgBefore(c, 'Kitas');      // SVG-Schmuck-Icon entfernen
  c = removeSvgBefore(c, 'Trauerfall'); // SVG-Schmuck-Icon entfernen
  return c;
}
```

#### 4.1.4 Social-Icons & Spenden-Button — häufige Fehler

```css
/* ❌ FALSCH – dunkle Icons auf dunkler Nav unsichtbar */
.bh3a-soc a { color: #5a4a3a; }

/* ✅ RICHTIG – cremeweiß, gut sichtbar auf transparenter Nav */
.bh3a-soc a { color: #d4c9b5; }
.bh3a-soc a svg { fill: #d4c9b5; }

/* ❌ FALSCH – Theme überschreibt color:#fff ohne !important */
.bh3a-btn-spd { background:#9a2d2d; color:#fff; border-radius:50px; }

/* ✅ RICHTIG – !important verhindert Theme-Override */
.bh3a-btn-spd { display:inline-flex!important; align-items:center;
  background:#9a2d2d!important; color:#fff!important;
  border-radius:50px; padding:9px 22px; font-size:12px; font-weight:600;
  text-decoration:none!important; white-space:nowrap; }
```

#### 4.1.5 Logo — häufiger Fehler (korrigiert 2026-05-20)

```html
<!-- ❌ FALSCH — veraltete Dateien (aus uploads/2025/xx/ oder uploads/2026/05/) -->
<img src=".../logo-kreis-st-bonifatius.png" ...>
<img src=".../logokreis-stbonifatius-klein.jpg" ...>

<!-- ✅ RICHTIG — einzig gültiges Pfarrei-Logo -->
<img src=".../wp-content/uploads/2025/09/sanktbonifatius-favicon.png" ...>
```

```css
/* ❌ FALSCH — falscher Hintergrund erzeugt sichtbaren Außenkreis */
.bh3a-brand__ring { width:58px; height:58px; background:rgba(255,255,255,0.12); box-shadow:0 0 0 2px rgba(255,255,255,0.3); }
.bh3a-brand__ring { width:48px; height:48px; background:#fff; }
.bh3a-brand__ring { width:44px; height:44px; background:rgba(255,255,255,0.12); }

/* ✅ RICHTIG — transparent, kein box-shadow, damit Favicon ohne Außenkreis erscheint */
.bh3a-brand__ring{width:80px;height:80px;border-radius:50%;overflow:hidden;background:transparent;flex-shrink:0}
.bh3a-brand__ring img{width:80px;height:80px;object-fit:cover;border-radius:50%;display:block}
```

**Hintergrund (2026-05-20):** Massenkorrektur über alle 108 Seiten der Website (damals noch auf dem dev-Server, vor dem Go-Live). 29 Seiten hatten noch `logo-kreis-st-bonifatius.png` oder `logokreis-stbonifatius-klein.jpg`, darunter alle größeren Entwürfe (home6 48305, Segen&Sakramente2, alle Kita-Seiten, Kasualienseiten, Jugend2, Kontakt2 u.v.m.). Zusätzlich hatte `st-aposteln-entwurf` (45941) zwar das richtige Bild, aber `44px` statt `48px` — ebenfalls korrigiert. Referenz-Seite für korrekte Größe: 46764 (Kultur und Begegnung 2) und 46769 (Engagiert Leben3).

#### 4.1.7 Code-Location

- Code-Quelle: home6 (Post 45758), Zeichen 0–9771 (Style + HTML)
- Übernahme in neue Seite:

```javascript
const h6Header = window._h6_header;  // ersten 9771 chars aus home6
// In neuen Content prependen als <!-- wp:html -->{h6Header}<!-- /wp:html -->
```

### 4.2 Hero (Full-Bleed mit Foto)

Muster aus `st-aposteln-entwurf` (Post 45941):

```css
.apos-hero-section{
  position:relative; width:100vw;
  margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw);
  height:min(68vh, 600px); overflow:hidden;
}
.apos-hero-section::before{
  content:""; position:absolute; inset:0;
  background-image:url('FOTO_URL');
  background-size:cover; background-position:center;
}
.apos-hero-section::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(180deg,rgba(30,21,18,.10),rgba(30,21,18,.55) 65%,rgba(30,21,18,.88));
}
.apos-hero-inner{
  position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end;
  padding:64px 40px; max-width:1280px; left:50%; transform:translateX(-50%); color:#fff;
}
```

**Innenstruktur:** Gold-Eyebrow → großer Titel (Playfair, bis 72 px) → Subtitle (weiß 88 %).

### 4.3 Welcome-Block

Zentriert, Crème-Gradient, max-width 900 px, 2 Buttons (primary + secondary outline).

### 4.4 Media-Text-Karten (Gutenberg wp:media-text)

Rechteckige Karten mit Foto links/rechts, Text und CTA-Button. In bonfamily2 und Aposteln als 4er-Reihe eingesetzt.

CSS-Tweaks (Pflicht):
- `.wp-block-media-text` wird alignwide genutzt (max-width: 1280 px)
- `.wp-block-media-text__content` padding: 36 px 44 px
- `h2`: Playfair, 22–32 px
- Button: `.wp-block-button__link`-Override auf `--bf-accent` Hintergrund, 24 px Border-Radius

### 4.5 Kachel-Raster (apos-tiles)

2-Spalten-Grid, Foto oben + Text + Link-CTA. Einsatz: „Gebetszeiten + Steyler Missionarinnen".

### 4.6 Fotogalerie mit Lightbox

3 Vorschau-Kacheln + "Alle Fotos anzeigen →" Button → öffnet Lightbox mit 6–12 Fotos, Tastatur-Navigation (← → Esc), Full-Screen Overlay mit Blur-Backdrop.

Code siehe 06-technische-loesungen.md § Lightbox.

### 4.7 Ansprechpartner-Karten

2-Spalten-Grid, rundes Foto (128 px) + Name (Playfair) + Rolle (italic) + Mail + Telefon. Hintergrund `--bf-bg`.

### 4.8 FAQ als natives `<details>`

**Wichtig:** Nicht mit CSS + JS nachbauen — Theme-Bug zwingt DIV-basierte Answer-Boxen auf `height: 0`. Lösung:

```html
<details class="bf-faq-item">
  <summary class="bf-faq-q">
    <span class="bf-faq-q-text">Frage …</span>
    <span class="icon" aria-hidden="true">+</span>
  </summary>
  <div class="bf-faq-a">Antwort …</div>
</details>
```

CSS setzt `summary::-webkit-details-marker { display:none }`, `[open] .icon { transform: rotate(45deg) }`.

### 4.9 Modal-Dialog (z.B. „Geschichte der Kirche")

Fixed overlay + dialog, Fade+Slide in, schließt bei ×-Klick / Overlay-Klick / Esc. Body-Scroll wird gesperrt während offen.

Code-Muster siehe 06-technische-loesungen.md § Modal.

### 4.10 Dunkler Footer-Block

Drei Spalten (BonFamily-Info, Kontakt, Social), Gradient-Hintergrund `#2a1f1a → #1e1512`, goldener Accent-Balken oben, H4-Titel in `--bf-gold`, Social-Buttons als abgerundete Pills mit Hover.

### 4.11 Beitrags-/Blog-Detailseite (Musterseite) ⭐

**Verbindliche Vorlage für alle Beiträge** (BoniBlog, News, PGR-Berichte etc.).
Referenz-Implementierung: Post 49909 („Musterseite: PGR-Sitzung 10.03.2026"), `?page_id=49909&preview=true`.

**Aufbau (von oben):**

1. **Hero** (`pbm-hero`) — Full-Bleed mit Beitragsbild, läuft hinter die transparente bh3a-Nav.
   - **Kein `margin-top`!** Der Hero startet bei `top:0` hinter der Glas-Nav (sonst Spalt oben).
   - Gradient-Overlay: `linear-gradient(180deg,rgba(30,21,18,.30) 0%,…,.88 100%)` — oben etwas dunkler für Nav-Lesbarkeit.
   - Inhalt unten ausgerichtet: **Eyebrow „Beitrag"** (Playfair italic, Gold) → **Titel** (Playfair, weiß, clamp bis 54px) → **Subtitle** (weiß 85 %).
2. **Meta-Zeile** (`pbm-meta`) — `display:flex; justify-content:space-between` mit **einer** durchgehenden Hairline (`border-bottom:1px solid #e0d8cf`) als Trenner.
   - Links: **Datum** (Inter, uppercase, `letter-spacing:.08em`, `#6b5c52`) — reine Info.
   - Rechts: **„Alle Beiträge →"** als Outline-Pill (`pbm-allposts`) → führt zum BoniBlog. Border `#d8b3b3`, Text `--bf-accent`; Hover füllt weinrot + Pfeil gleitet.
   - **Anti-Pattern:** Link nicht unterstreichen, wenn direkt darunter ein Divider-Strich steht → konkurrierender Doppelstrich. Stattdessen Pill-Button + **eine** Hairline.
3. **Fließtext** (`pbm-body-inner`, max-width **760px**) — Inter 17px, line-height 1.75, `--bf-ink`. Hintergrund crème `--bf-bg`.

**Wiederverwendbare Platzhalter:** Hero-Bild-URL · Eyebrow (generisch „Beitrag") · Titel · Subtitle/Teaser · Datum · Textabsätze.

**Technik:** Ein einziger `<!-- wp:freeform -->`-Block (CSS + HTML zusammen), wie bei Aposteln. Nav-CSS+HTML aus Aposteln (45941) übernehmen — die bh3a-Grundregeln liegen ohnehin global in der `style.css`.

#### SEO-Checkliste pro Beitrag

Beim Anlegen jedes neuen Beitrags abarbeiten (Referenz: Musterseite 49909):

1. **Beitrag als Post anlegen**, nicht als Page — dann greifen Kategorie/Datum/Autor automatisch.
2. **Genau eine sichtbare H1** = der Hero-Titel. (`h1.us_title` ist global versteckt.)
3. **SEO-Titel** ≤ ~60 Zeichen, Schema `Beitragstitel – St. Bonifatius`. Keinen Arbeitstitel wie „Musterseite (neues Design)" stehen lassen.
   - *Vorlage-Beispiel:* `BoniBlog – Aktuelles aus der Pfarrei Sankt Bonifatius Frankfurt` (63 Z.)
4. **Meta-Description handschriftlich**, 120–160 Zeichen. **Nicht** das Auto-Excerpt nehmen — es zieht den Nav-Menütext aus dem Freeform-Block und wird zu lang/verschmutzt.
   - *Vorlage-Beispiel (159 Z.):* „Aktuelle Berichte, Fotos und Neuigkeiten aus der katholischen Pfarrei Sankt Bonifatius Frankfurt-Sachsenhausen. Entdecken Sie Geschichten aus unserer Gemeinde."
5. **Beitragsbild mit Alt-Text** pflegen — der Hero ist ein CSS-`background-image` und damit nicht crawlbar; og:image/Bildsuche greift nur über das gesetzte WP-Beitragsbild + Alt.
6. **BlogPosting-JSON-LD** einbinden (`<script type="application/ld+json">` im Freeform-Block): `headline`, `datePublished`, `image`, `author`, `publisher` (+ Logo `sanktbonifatius-favicon.png`), `mainEntityOfPage`, `inLanguage:"de-DE"`.
7. Bei längeren Beiträgen **H2-Zwischenüberschriften** für Struktur & Snippet-Chancen.

---

## 5. Bänder-Prinzip (farbliche Abwechslung)

**Problem:** Wenn alle Sections weiß sind, wirkt die Seite langweilig.

**Lösung:** Jede Section bekommt einen eigenen Full-Bleed-Hintergrund (über CSS `::before` oder direkt), die sich **abwechseln**.

Reihenfolge wie in Aposteln-Entwurf:

| # | Section | Hintergrund |
|---|---|---|
| 1 | Hero | dunkel (Foto mit Gradient) |
| 2 | Welcome | weiß → Crème-Gradient |
| 3 | Media-Text 1 | weiß |
| 4 | Media-Text 2 | Crème (`--bf-bg`) |
| 5 | Media-Text 3 | Sand-Gradient (`#fbf7f1 → --bf-bg`) |
| 6 | Media-Text 4 | Sand (`--bf-bg-alt`) |
| 7 | Fotogalerie | Sand |
| 8 | Kacheln | Beige → Weiß Gradient |
| 9 | Ansprechpartner | weiß |
| 10 | Kirchen-Intro | warmer Gold-Gradient (`--bf-bg-alt → #e8d8b8`) |

**Umsetzung:** Jeder Section-Container bekommt `position: relative; z-index: 1` und ein `::before` mit `position: absolute; inset: 0; z-index: -1; background: …`.

**Pflichtregeln (ergänzt April 2026):**
- Zwei benachbarte Sections dürfen **nie dieselbe Farbe** haben — auch wenn eine Section mit einem Gradient auf `--bf-bg` endet, muss die nächste Section mit `#fff` (weiß) beginnen.
- **Kein Schwarz** (`#000`, `#111` oder near-black wie `#1e1512`) als Hintergrund für normale Seiten-Sections. Schwarz nur im Hero (mit Foto-Overlay).
- Für dunkle Abschluss-CTA-Banner: warmes Braun `linear-gradient(135deg,#4a2e1a,#3a2315)` statt Near-Black.

---

## 6. Full-Bleed-Technik

Das Ursprung-Theme hat einen 780 px-Content-Container (`.frame-content` / `.us_content`). Für ganzseitige Bänder:

**Option A — einzelne Section:**
```css
.my-section {
  width: 100vw;
  position: relative;
  left: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
```

**Option B — page-weit:** In bonfamily2/aposteln wird der Container selbst entsperrt:
```css
.us_content, .frame-content {
  max-width: none !important;
  width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
```

Dann hat jeder Block 100 % Breite und kann über `max-width + margin:0 auto` nach innen begrenzt werden.

---

## 7. Responsive Breakpoints

| Breakpoint | Was passiert |
|---|---|
| `@media (max-width: 1360px)` | Container-Padding reduzieren |
| `@media (max-width: 760px)` | Grid 2-Spalten → 1-Spalte (Kacheln, Kontakte) |
| `@media (max-width: 720px)` | Fotogalerie 3-Spalten → 2 |
| `@media (max-width: 460px)` | Fotogalerie → 1-Spalte, Kontakt-Photo kleiner |

---

## 8. Design-Skill verbindlich

**Für alle Design-Arbeiten den Skill `/ui-ux-pro-max` nutzen.**

Der Skill bringt 50+ Design-Stile, 161 Farbpaletten, 57 Font-Pairings, 161 Produkt-Typologien. Er soll als **Rahmen** für neue Seiten dienen:

1. Im neuen Dialog: `/ui-ux-pro-max` aufrufen
2. Der Skill fragt nach Produkt-Typ, Stil, Farbpalette → wir wählen den Sankt-Bonifatius-Rahmen (warme Erdtöne, editorial, Playfair Display)
3. Claude erzeugt einen Design-Brief, der mit diesem Handbuch abgeglichen wird

Details zum Einsatz des Skills siehe 09-skills-workflows.md.
