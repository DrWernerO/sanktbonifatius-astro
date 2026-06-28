# Astro-Frontend Handbuch — Sankt Bonifatius

Wissensspeicher für die Übernahme von WordPress-Seiten in das Astro-Frontend.
Beim nächsten Seiten-Projekt **zuerst dieses Dokument lesen**, dann loslegen.

> **Grundprinzip Headless:** WordPress ist nur noch Inhalts-Lieferant (CMS).
> Das Aussehen macht Astro mit **eigenen** Komponenten und **eigenen** CSS-Klassen.
> WP-Theme-Styles dürfen niemals unsere Komponenten beeinflussen.

---

## 1. Architektur & warum es so gebaut ist

> **UPDATE 2026-06-22 — Quelle ist jetzt die LIVE-Seite `https://www.sanktbonifatius.de`.**
> Nach dem Go-Live ist www die aktuelle, vollständige und SEO-optimierte Quelle (der Dev-Server
> ist jetzt veraltet). Live hat ein **gültiges Zertifikat**, daher entfallen die früheren
> Dev-Notbehelfe (`NODE_TLS_REJECT_UNAUTHORIZED=0`/`secure:false` nicht mehr nötig — im
> dev-Script bleibt das Flag nur als harmloser Rest). Quell-Domains zentral in
> `src/lib/wordpress.js` (`WP_API`, `WP_RENDER_ORIGIN`) und `astro.config.mjs` (`WP_LIVE`).
> Die Code-Beispiele weiter unten nennen teils noch den alten Dev-Host — gemeint ist jetzt www.

| Thema | Lösung |
|-------|--------|
| Inhalte kommen von | **Live-Seite** `https://www.sanktbonifatius.de` (seit 2026-06-22; Dev-Server abgelöst) |
| Live hat | **gültiges** SSL-Zertifikat → direkter Zugriff möglich, kein Workaround nötig |
| Server-seitig (Astro-Build) | Fetch direkt zu www (`WP_API` / `WP_RENDER_ORIGIN`) |
| Client-seitig (Browser) | Fetch über **Vite-Proxy** `/wp-proxy/...` → www (gleiche Origin, kein CORS) |
| Beim Netlify-Go-Live | WordPress zieht auf `cms.`-Subdomain → Quell-Domains erneut anpassen (Abschnitt 1b) |
| Sekretärinnen arbeiten weiter in | WordPress-Admin, unverändert |

### Die zwei festen Bausteine (nie löschen)
- `package.json` → dev-Script: `"dev": "NODE_TLS_REJECT_UNAUTHORIZED=0 astro dev"`
- `astro.config.mjs` → Vite-Proxy `/wp-proxy` → Dev-Server mit `secure: false`

```js
// astro.config.mjs
const WP_DEV = 'https://dev.sanktbonifatius.de.w021941a.kasserver.com';
export default defineConfig({
  vite: { server: { proxy: {
    '/wp-proxy': {
      target: WP_DEV, changeOrigin: true,
      rewrite: (p) => p.replace(/^\/wp-proxy/, ''), secure: false,
    }
  }}}
});
```

**Merke:** Server-seitige Code-Änderungen (in `.astro`-Frontmatter, `lib/*.js`) brauchen
**Dev-Server-Neustart**. CSS/Client-JS-Änderungen lädt Astro per HMR automatisch (nur CMD+R).

---

## 1b. Hosting & Deployment — aktueller Stand und Plan

> Dieser Abschnitt hält fest, **wo was läuft**, damit in anderen Dialogen klar ist, was als
> Nächstes passiert. Stand: Entwicklung läuft lokal; produktives Deployment noch nicht eingerichtet.

### Wo gehostet wird
| Was | Wo | Status |
|-----|-----|--------|
| **WordPress (Backend/CMS)** | **All-inkl** (KAS / `kasserver.com`) | läuft — bleibt dort |
| Dev-WordPress | `dev.sanktbonifatius.de.w021941a.kasserver.com` (All-inkl) | läuft — unsere Datenquelle |
| Live-WordPress (alt) | `sanktbonifatius.de` (All-inkl) | läuft — veraltet, wird abgelöst |
| **Astro-Frontend** | **lokal** (`npm run dev`, Port 4321) | nur Entwicklung |
| Astro-Frontend (geplant) | **Netlify** (oder Vercel / Cloudflare Pages) | **noch nicht eingerichtet** |

### Geplanter Endzustand
- WordPress zieht auf eine Subdomain um, z.B. `cms.sanktbonifatius.de` (nur Backend + REST-API), bleibt bei All-inkl.
- `sanktbonifatius.de` zeigt per DNS auf **Netlify** → liefert das statische Astro-Frontend.
- Quellcode + Backup des Frontends in **Git/GitHub**; Netlify baut bei jedem Push automatisch (`astro build`).

### Noch offen (TODO, in keinem Dialog erledigt)
- [ ] GitHub-Repo anlegen
- [ ] Netlify-Projekt mit Repo verbinden, Build-Command `astro build`
- [ ] WordPress auf `cms.sanktbonifatius.de` umziehen
- [ ] **Rebuild-Webhook** einrichten (siehe Abschnitt 1c) — *aktuell NICHT vorhanden*
- [ ] DNS umstellen (Domain → Netlify, CMS-Subdomain → All-inkl)
- [ ] **Datei-/Bild-URLs umziehen:** Beim WP-Umzug zeigen alle fest verdrahteten WP-URLs noch auf
      `dev.sanktbonifatius.de`. Betroffen u.a. die **Download-Links** (`DOWNLOADS` in
      [`Nav.astro`](../src/components/Nav.astro), Pfarrbrief/Highlights inkl. `?v=`-Cache-Busting,
      Abschnitt 1d) sowie Bild-URLs in Hero/Kirchorte/Marquee/Feature-Blöcken. Auf die neue
      CMS-Domain (`cms.sanktbonifatius.de`) umstellen.

---

## 1c. Automatischer Rebuild bei WP-Änderungen (Webhook) — KONZEPT, noch nicht gebaut

> **Wichtig / ehrlicher Stand:** Es wurde **noch kein Webhook gebaut**. Im aktuellen
> Entwicklungsmodus (`npm run dev`) ist das auch unnötig — Astro holt die WP-Daten bei
> jedem Seitenaufruf frisch. Der Webhook wird erst **mit dem Netlify-Deployment** relevant,
> weil dort die Inhalte beim Build statisch „eingebacken" werden.

### Warum überhaupt ein Webhook?
Auf Netlify ist die Seite statisch: WP-Inhalte werden **zum Build-Zeitpunkt** abgefragt und
in fertiges HTML gegossen. Ein neuer Termin/Beitrag im WP wird also **erst nach einem neuen
Build** sichtbar. Damit das automatisch passiert, braucht es einen Auslöser.

### Geplante Umsetzung (wenn Netlify steht)
1. In Netlify einen **Build-Hook** anlegen → ergibt eine geheime URL
   (`https://api.netlify.com/build_hooks/XXXX`).
2. In WordPress bei Inhalts-Änderungen ein `POST` an diese URL senden. Optionen:
   - **Plugin** „WP Webhooks" / „Headless WP" o. Ä. (Trigger: Beitrag/Termin gespeichert/veröffentlicht), **oder**
   - kleiner Hook in `functions.php` mit `wp_remote_post()` an die Build-Hook-URL bei
     `save_post` / `publish_post`.
3. Optional zusätzlich: **zeitgesteuerter Rebuild** (Netlify Scheduled Build, z.B. nächtlich)
   als Sicherheitsnetz.

> Sobald das gebaut ist, diesen Abschnitt mit den **konkreten Werten** aktualisieren
> (welches Plugin / welcher Code, welche Trigger, Hook-URL-Verweis — **nicht die geheime URL
> selbst** ins Repo schreiben).

---

## 1d. Dateien aus WP (z.B. Pfarrbrief-PDF) frisch halten — Cache-Busting

**Problem:** Im Download-Menü („Pfarrbrief", „Bonifatius Highlights") verlinken wir feste
PDF-URLs, z.B.
`https://dev.sanktbonifatius.de/wp-content/uploads/2026/04/sankt-bonifatius-pfarrbrief.pdf`
(URL-Pfad fest in [`Nav.astro`](../src/components/Nav.astro), Konstante `DOWNLOADS`).
Lädt die Sekretärin eine **neue Datei mit gleichem Namen** hoch, sieht der Besucher oft noch
die **alte** Version — der Browser (und ggf. das CDN) liefert sie aus dem Cache.

> **Stand: UMGESETZT (Cache-Busting, Variante b).** In `Nav.astro` hängt die Funktion
> `withVersion()` beim Build automatisch `?v=<Last-Modified>` an die Download-URLs.
> **Workflow-Entscheidung: Option A** — die Sekretärinnen ersetzen die Datei in der Mediathek
> („Datei ersetzen", gleicher Dateiname → **URL bleibt stabil**). Dadurch ist der aufwändigere
> Teil (a) — dynamische URL-Ermittlung via Media-API/`getLatestMedia()` — **nicht nötig** und
> bleibt nur als Option, falls sich Dateinamen doch ändern.

**Zwei Teilprobleme, zwei Lösungen:**

### a) (OPTIONAL — nur falls Dateinamen wechseln) URL dynamisch aus WP holen
Statt die PDF-URL fest in `Nav.astro` zu schreiben, beim Build die **aktuelle** Datei aus
WordPress ermitteln. Möglichkeiten:
- **Media-API:** `/wp-json/wp/v2/media?search=pfarrbrief&per_page=1&orderby=date&order=desc`
  → liefert die zuletzt hochgeladene passende Datei inkl. `source_url` und `modified`.
- **ACF/Optionsfeld:** Ein Feld „Aktueller Pfarrbrief" im WP-Admin, das die Sekretärin setzt;
  Astro liest die gewählte Datei-URL.
- Empfehlung: ACF-Optionsfeld — eindeutig, kein Raten über Dateinamen.

So zeigt die Nav nach dem nächsten Build automatisch auf die neue Datei.

### b) Browser-Cache umgehen → Cache-Busting-Parameter an die URL hängen ✅ UMGESETZT
Auch bei gleichem Dateinamen lässt sich der Browser zum Neuladen zwingen, indem man einen
**Versions-Parameter** anhängt, der sich bei jeder neuen Datei ändert. Umgesetzt in `Nav.astro`
ohne Media-API: per **HEAD-Anfrage** wird der `Last-Modified`-Header der Datei gelesen und als
Token angehängt (funktioniert für jede stabile URL, kein Raten über Dateinamen nötig):

```js
// Nav.astro (Frontmatter) — tatsächliche Umsetzung
async function withVersion(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    const lm = res.headers.get('last-modified');
    if (!lm) return url;
    return `${url}?v=${Date.parse(lm)}`;   // ms-Timestamp als Versions-Token
  } catch { return url; }                   // Server weg → unveränderte URL, Build bricht nie ab
}
const pfarrbriefUrl = await withVersion(DOWNLOADS.pfarrbrief);
```
```astro
<a href={pfarrbriefUrl} target="_blank" rel="noopener">Pfarrbrief</a>
```
Ändert sich die Datei, ändert sich `Last-Modified` → neue `?v=...`-URL → Browser lädt frisch.

> **Hinweis:** Da die Seite statisch gebaut wird, greift das `?v=` erst nach einem **Rebuild**
> (Abschnitt 1c). Sauberer Ziel-Ablauf, sobald der Webhook steht:
> Datei ersetzen → Webhook → Rebuild → Nav verlinkt dieselbe URL mit neuem `?v=` → frische Datei.
> Bis dahin: nach einem Pfarrbrief-Wechsel die Seite neu bauen.

---

## 1e. SEO — WordPress-SEOPress-Head übernehmen (headless SEO) ✅ UMGESETZT (Startseite)

> **Grundidee:** Die Seiten wurden im WP mit **SEOPress** für Suchmaschinen + KI optimiert
> (Titel, Meta-Description, OpenGraph, Twitter, JSON-LD). Statt das in Astro nachzubauen,
> **ziehen wir den fertigen SEO-Head beim Build aus WordPress** und bauen ihn ein. So fließt
> die WP-SEO-Arbeit automatisch in die Astro-Seiten — **kein eigenes JSON-LD/Texten nötig.**

### Wie es funktioniert
- **`getSeoHead(path)`** in [`wordpress.js`](../src/lib/wordpress.js) holt die gerenderte
  Dev-Seite (`https://dev.sanktbonifatius.de` + `path`) und extrahiert nur die SEO-Tags:
  `<title>`, `meta[name=description|robots]`, `link[rel=canonical]`, alle `og:`/`article:`-
  und `twitter:`-Metas und alle `application/ld+json`-Blöcke (bei uns: WebSite, Organization,
  LocalBusiness).
- **Domain-Umschreibung:** Render-Domain `dev.sanktbonifatius.de` → Produktiv-Domain
  `PUBLIC_SITE` (`https://sanktbonifatius.de`) **für canonical/og:url** — aber **NICHT** für
  `/wp-content/`-URLs (Bilder/Dateien bleiben auf dem WP-Host, sonst bräche die OG-Vorschau).
  Beim WP-Umzug (Abschnitt 1b) `PUBLIC_SITE` + `WP_RENDER_ORIGIN` anpassen.
- **[`Base.astro`](../src/layouts/Base.astro)** nimmt einen `seo`-Prop (HTML-String). Ist er
  gesetzt → wird er per `set:html` in den `<head>` eingefügt und die Standard-Tags
  (eigener `<title>`/`description`) werden **übersprungen** (kein doppelter Titel). Ohne
  `seo` greifen die Standard-Tags (`title`/`description`-Props) als Fallback.
- **[`index.astro`](../src/pages/index.astro)**: `const seo = await getSeoHead('/')` → `<Base seo={seo}>`.
  Für neue Seiten analog mit deren WP-Pfad.

> **Fällt WP beim Build aus**, liefert `getSeoHead()` einen leeren String → Base nutzt die
> Standard-Tags, der Build bricht nie ab.

### Sitemap & robots
- **`@astrojs/sitemap`** in [`astro.config.mjs`](../astro.config.mjs) (braucht `site:` =
  Produktiv-Domain) → erzeugt beim Build `sitemap-index.xml` + `sitemap-0.xml` mit allen
  Astro-Routen.
- **[`public/robots.txt`](../public/robots.txt)** erlaubt Crawling + verweist auf die Sitemap.

### Barrierefreiheit / Bild-SEO
- CSS-Hintergrundbilder (Hero, Kirchorte, Feature-Blöcke) haben `role="img"` + `aria-label`;
  dekorative SVG-Icons `aria-hidden="true"`. Echte `<img>` (Marquee/News/Termine) tragen `alt`.
- **Offen (optional):** CSS-Hintergrundbilder werden von der Google-**Bildersuche nicht
  indexiert**. Wenn Hero/Kirchorte-Bilder dort auftauchen sollen, müssten sie als echte
  `<img>` mit `alt` umgebaut werden (Layout-Aufwand) — bewusst noch nicht gemacht.

---

## 1f. Kurz-URLs (Weiterleitungen) + llms.txt — Astro/Netlify ✅ VORBEREITET (greift beim Go-Live)

> **Hintergrund:** Viele Seiten liegen tief verschachtelt (`/segen-sakramente/taufe/`,
> `/kontakt/newsletter/` …). Die **kommunizierten, gedruckten** Adressen sind aber kurz
> (`/taufe/`, `/newsletter/` …). In WordPress lösen das 301-Redirects in der `functions.php`
> (Team-Handbuch 06, Abschnitt 25.1). **Beim Netlify-Go-Live übernimmt das die Datei
> [`public/_redirects`](../public/_redirects)** — gleiche Wirkung (echte 301), nur ohne PHP.

### Wie es funktioniert
- **[`public/_redirects`](../public/_redirects)** — Netlify-Format `quelle  ziel  301`. Jede
  Kurz-Adresse steht **zweimal** (mit/ohne Schrägstrich), damit beide Schreibweisen greifen.
- Greift **nur auf Netlify** (Server-Ebene) — im lokalen `astro dev` sind die Weiterleitungen
  inaktiv, das ist normal.
- Alle Zielpfade müssen existierende Astro-Seiten sein (sonst 301 → 404). Vor dem Eintragen
  prüfen.

### Aktuelle Kurz-URL-Liste (Quelle der Wahrheit für gedruckte Adressen)
| Kurz-Adresse | Ziel |
|---|---|
| `/taufe/` | `/segen-sakramente/taufe/` |
| `/trauung/` | `/segen-sakramente/trauung/` |
| `/erstkommunion/` | `/segen-sakramente/erstkommunion/` |
| `/firmung/` | `/segen-sakramente/firmung/` |
| `/beichte/` | `/segen-sakramente/beichte/` |
| `/krankensalbung/` | `/segen-sakramente/krankensalbung/` |
| `/trauerfall/` | `/kontakt/trauerfall/` |
| `/katholisch-werden/` | `/kontakt/katholisch-werden/` |
| `/newsletter/` | `/kontakt/newsletter/` |
| `/engagement/` | `/kontakt/engagement/` |
| `/pfarrbuero/` | `/kontakt/pfarrbuero/` |
| `/seelsorge/` | `/kontakt/seelsorge/` |
| `/pastoralteam/` | `/ueberuns/pastoralteam/` |
| `/leitung/` | `/ueberuns/leitung/` |
| `/gemeinschaft/` | `/ueberuns/gemeinschaft/` |
| `/familiengottesdienste/` | `/bonfamily/familiengottesdienste/` |
| `/whatsapp-kanal/` | `/bonfamily/whatsapp-kanal/` |
| `/gottesdienste/` | `/gottesdienst-glaube/gottesdienstordnung/` |
| `/gottesdienstordnung/` | `/gottesdienst-glaube/gottesdienstordnung/` |

- **Bewusst KEINE Kurz-URL:** `/gottesdienste-die-beruehren/` (über die Navigation gut
  erreichbar), `/kontakt/` und `/ueberuns/` (sind bereits Top-Level-Adressen).
- **Wartung:** Verschiebt sich eine Zielseite, hier den Pfad anpassen. Neue Kurz-Adresse →
  beide Schreibweisen eintragen **und** Zielseite prüfen.

### llms.txt (für KI-Suche)
- **[`public/llms.txt`](../public/llms.txt)** — strukturierte Seitenübersicht für KI-Assistenten
  (ChatGPT, Perplexity …). Wird auf Netlify automatisch unter `https://sanktbonifatius.de/llms.txt`
  ausgeliefert (wie `robots.txt`). Ersetzt die frühere WP-Variante (Rewrite-Endpoint, 06/Abschnitt 25).
- **Bewirbt die Kurz-Adressen** (konsistent mit `_redirects` + gedruckten Adressen). Wo es keine
  Kurz-URL gibt (z. B. „Gottesdienste, die berühren"), steht der echte Pfad.
- **Wartung:** Bei neuen/verschobenen Seiten `llms.txt` mitpflegen — am besten gemeinsam mit
  `_redirects` und `SEITENVERZEICHNIS.md`.

---

## 2. WordPress-Anbindung (`src/lib/wordpress.js`)

Zentrale Datei für alle WP-Zugriffe. Wichtige Bausteine:

- **`WP_API`** — Basis-URL zum Dev-Server (server-seitig, absolut).
- **`getPageById(id)` / `getPage(slug)`** — holt eine Seite, ruft `stripNavFromContent()` auf.
- **`stripNavFromContent(html)`** — bereinigt den rohen WP-HTML:
  - entfernt die **bh3a-Nav** (`<div class="bh3a-hdr">`) — sonst doppelte Navigation
  - entfernt das **Suchoverlay** (`<div class="bh3a-srch-ov">`)
  - schneidet **WP-Events + WP-News** heraus (siehe Abschnitt 4)
  - patcht relative URLs `'/wp-json/'` → `'/wp-proxy/wp-json/'` und `'/wp-content/'` → `'/wp-proxy/wp-content/'`
    damit client-seitige Scripts im WP-Content über den Proxy laufen
  - entfernt das Nav-Hamburger-Script
- **`cache: 'no-store'`** beim Fetch — sonst zeigt der Dev-Server alte Inhalte.

### Wichtige WP-Daten
| Was | Wert |
|-----|------|
| Startseite (Design „home6") | Page-ID **45758** auf dem Dev-Server |
| REST-Endpunkte | `/wp-json/wp/v2/pages/{id}`, `/posts`, `/event`, `/media/{id}` |
| Page-Content-Feld | `content.rendered` (fertiges HTML inkl. eingebetteter `<style>`-Blöcke!) |

> **Achtung:** WP liefert pro Seite einen riesigen HTML-Blob inkl. aller Theme-Styles
> in `<style>`-Blöcken. Diese Styles gelten auch für unseren eingefügten Content.
> Deshalb dürfen unsere Komponenten **nie** dieselben Klassennamen wie das WP-Theme nutzen.

---

## 3. Die goldene Regel: eigene CSS-Präfixe

**Das größte Zeitfresser-Problem war:** Unsere Komponenten nutzten anfangs WP-Theme-Klassen
(`bh2-vt`, `bh2-news`, `bh2-nc`). Da der WP-Content seine eigenen Styles für genau diese
Klassen mitliefert (teils mit `!important`), gewann immer das WP-CSS — unsere Änderungen
hatten **keine Wirkung**.

### Lösung — Präfix `astro-` für ALLE eigenen Komponenten
| WP-Theme (verboten für uns) | Unser Präfix |
|-----------------------------|--------------|
| `bh2-vt`, `bh2-vt-card` … | `astro-ev`, `astro-ev-card` … |
| `bh2-news`, `bh2-nc` … | `astro-news`, `astro-nc` … |

So kollidiert nichts mehr — WP-Theme-Änderungen können unsere Seiten nie zerstören.
**Beim Bau jeder neuen Komponente: eindeutiges `astro-...`-Präfix wählen.**

---

## 4. WP-Sektionen herausschneiden & eigene einsetzen

Die WP-Startseite enthält im Content fertige Events- und News-Blöcke, die wir durch
unsere Astro-Komponenten ersetzen. Reihenfolge im WP-Content der Startseite:

```
Hero → Quicklinks → Programm → Sakramente → [Events] → [News] → Kirchorte → Marquee → Bild-Text-Blöcke → "Neugierig" → (Footer fehlt im Content)
```

Wir schneiden **nur den mittleren Block** (Events + News) heraus und behalten alles davor
und danach. Dazu in `wordpress.js`:

- **`removeRange(html, startMarker, endMarker)`** — schneidet von `startMarker` bis
  (ausschließlich) `endMarker`. Konkret: von `<section class="bh2-vt"` bis
  `<div class="bh3a-kirch">`.
- **`<style>`-Blöcke aus dem entfernten Bereich werden bewahrt** (z.B. Lightbox-CSS,
  das spätere Sektionen brauchen) — sonst zerschießt es Inhalte weiter unten
  (Lektion: Sakrament-Symbole wurden riesig, weil ihr CSS im entfernten Teil lag).
- An der Schnittstelle wird ein Platzhalter `ASTRO_SLOT` (`<!--ASTRO-EVENTS-NEWS-SLOT-->`)
  eingesetzt.

### In `index.astro`: Content am Platzhalter teilen
```astro
const html = page?.content?.rendered ?? '';
const [beforeSlot, afterSlot] = html.includes(ASTRO_SLOT)
  ? html.split(ASTRO_SLOT) : [html, ''];
---
<div class="wp-content" set:html={beforeSlot} />
<EventCalendar />
<NewsGrid />
{afterSlot && <div class="wp-content" set:html={afterSlot} />}
```
So erscheinen die Astro-Komponenten **exakt an der richtigen Stelle** statt am Seitenende.

> **Warum nicht per Div-Matching entfernen?** Der WP-HTML ist tief verschachtelt und
> die naive `<div>`-Zählung scheitert, weil `<div` auch in `<script>`-/`<style>`-Text
> vorkommt. Marker-basiertes `removeRange` ist robuster. **Niemals** eine `while`-Schleife
> ohne Abbruch-Sicherung bauen — das hängte den Server in einer Endlosschleife auf.

---

## 4b. Nav + Footer sind global (im Base-Layout) — pro Seite NICHT nochmal einbinden

**Nav und Footer sind auf jeder Seite identisch.** Sie stehen darum **einmalig** in
[`src/layouts/Base.astro`](../src/layouts/Base.astro):

```astro
<body>
  <Nav />
  <div class="page-wrap"><slot /></div>
  <Footer />
</body>
```

→ **Jede Seite, die `Base.astro` nutzt, bekommt Nav + Footer automatisch.**
In den einzelnen `src/pages/*.astro` also **nicht** mehr `Nav`/`Footer` importieren oder
einsetzen — nur den seitenspezifischen Inhalt zwischen `<Base>…</Base>` schreiben:

```astro
---
import Base from '../layouts/Base.astro';
import PageHeader from '../components/PageHeader.astro';
---
<Base title="…">
  <PageHeader … />
  <!-- nur die einzigartigen Sektionen dieser Seite -->
</Base>
```

> **Spart Bauarbeit:** Eine neue Seite braucht nur ihren eigenen Inhalt; die wiederkehrenden
> Rahmen-Elemente (Nav, Footer) sind schon da. Beide bleiben dadurch auch garantiert konsistent.

---

## 5. Die Navigation (`src/components/Nav.astro`)

Die Nav ist die wichtigste wiederverwendbare Komponente. Aufbau (Präfix `bh3a-`,
übernommen vom Original-Design, da eigenständige Komponente ohne WP-Kollision):

### Struktur (von links nach rechts)
1. **Brand/Logo** (`.bh3a-brand`) — ganz links
   - Logo-Bild **80×80px**, `border-radius: 50%` (rund). Größe ist vorgeschrieben!
   - daneben zweizeilig: „Sankt Bonifatius" (Playfair Display) + „Frankfurt am Main"
2. **Social-Icons** (`.bh3a-soc`) — Instagram, YouTube, Facebook, WhatsApp als SVG
   - `margin-left: auto` schiebt sie + die Nav nach rechts, **Brand bleibt links**
3. **Desktop-Nav** (`.bh3a-rnav`) — Dropdown-Menüs (`.bh3a-dd` mit `.bh3a-dd__menu`):
   - „Über uns", „Kontakt", „Downloads" — je mit Untermenü
   - Dropdowns öffnen per `:hover` (Desktop)
4. **Spenden-Button** (`.bh3a-btn-spd`) — ganz rechts
   - `background: #9a2d2d`, weiße Schrift, `border-radius: 50px` (Pille)

### Verhalten & Stil
- Header `position: fixed`, halbtransparent dunkel + `backdrop-filter: blur(8px)`, `z-index: 1000`
- Höhe 80px, `max-width: 1280px`, zentriert
- **Mobil (≤860px):** Social + Desktop-Nav ausgeblendet, **Hamburger** erscheint
  (per JS erzeugt). Klick öffnet Vollbild-Overlay-Menü, Dropdowns per Klick (data-open),
  ESC + Außenklick schließen.
- Das `<style is:global>`, damit die Styles greifen; Script erzeugt Hamburger + Logik.

### Wichtige Farben (Design-Tokens)
| Zweck | Farbe |
|-------|-------|
| Akzent / Spenden / Icons (Bordeaux) | `#9a2d2d` (hover `#7e2424`) |
| Gold-Hover | `#c5a55a` |
| Helle Schrift auf dunkel | `#f0e8d8` / `#d4c9b5` |
| Dunkle Überschrift | `#2c2420` |
| Gedämpfter Text | `#928269` / `#6b5c52` |
| Warmer Karten-Hintergrund | `#f7f3ef` |

---

## 6. „Aktuelles": Beiträge + News (`NewsGrid.astro` / `BlogGrid.astro`)

**„Aktuelles" mischt zwei WP-Inhaltstypen, gleichberechtigt nach Erscheinungsdatum:**
- **Beiträge** = Standard-Posts (WP-Menü „Beiträge", `/wp/v2/posts`).
- **News** = Custom-Post-Type **`pin`** (WP-Menü „News", `/wp/v2/pin`) — Typ **Bild, Video
  oder Fotogalerie**.

### Datenquelle (`getAktuelles()` in `wordpress.js`)
- Holt alle Beiträge (`posts?per_page=100&_embed`) **und** alle News, normalisiert beide auf
  `{kind, type, date, title, link, excerpt, image, galleryCount}`, mischt + sortiert **nach
  `date` absteigend**. `getAktuelles(limit)` schneidet auf `limit` zu (0 = alle).
- **WICHTIG / Fallstrick:** Der `pin`-REST-Endpunkt liefert **kein Bild, keinen Typ, kein
  Excerpt** (ACF leer, kein `featured_media`). Diese Daten stehen **nur** im Theme-Datenblob
  **`window.__BONI_PINS`** auf der Startseite (Page 45758). `getNewsPins()` parst diesen Blob
  (Felder: `d`/Datum, `t`/Titel, `l`/Link, `e`/Excerpt, `i`/Bild, `ty`/Typ, `g`/Galerie).
  → Hängt also daran, dass die Startseite die News-Sektion (mit allen News) ausgibt.
  Aktuell vollständig (`X-WP-Total` pin = Blob-Anzahl). Bricht der Blob weg → News fehlen,
  Beiträge bleiben.

### Darstellung
- **`NewsGrid.astro`** (`astro-news`/`astro-nc`) — Startseiten-Teaser, `getAktuelles(3)`,
  3-Spalten-Grid.
- **`BlogGrid.astro`** (`astro-blog`/`astro-bc`) — BoniBlog-Seite, `getAktuelles()` (alle ~33),
  erste 9 sichtbar, „Mehr anzeigen" blendet weitere **bereits gerenderte** Karten ein
  (kein Client-Nachladen/-Mischen mehr nötig).
- **Typ-Badge** (SVG, kein Emoji) oben links auf dem Bild: Video → Play-Icon „Video";
  Galerie → Stack-Icon „N Fotos". Beiträge + Bild-News: kein Badge.
- Featured-Image Beiträge via `post._embedded['wp:featuredmedia'][0].source_url`;
  News-Bild aus dem Blob (`i`). Hintergrund `#f7f3ef`, Hover `translateY(-3px)`.
- Responsiv: 860px → 2 Spalten, 600px → 1 Spalte.

### Klickverhalten: News → Lightbox (`NewsLightbox.astro`)
- **Beiträge** verlinken auf ihre WP-Permalink-Seite (funktioniert).
- **News-Kacheln** dürfen das **nicht** — die `pin`-Permalink-Seite (`/pins/…`) ist im
  Headless-Setup **leer** (im Original wurden Galerien per Lightbox gezeigt, nie als eigene
  Seite). Daher tragen News-Kacheln `data-news-id={id}`; `NewsLightbox.astro` fängt den Klick
  ab (`preventDefault`) und öffnet eine **Lightbox**:
  - **Galerie** → alle Bilder aus `gallery` (`g`) mit Blättern (‹ ›, Pfeiltasten), Zähler „n / N".
  - **Bild** → Einzelbild + Excerpt als Untertitel.
  - **Video** → `<video>` bzw. YouTube/Vimeo-`<iframe>` (derzeit keine Video-Pins vorhanden).
  - Schließen per ✕, Hintergrundklick, ESC. Daten als JSON (`#astro-news-data`) aus `getNewsPins()`.
- `<NewsLightbox />` wird **einmal pro Seite** eingebunden (Startseite + BoniBlog).

### Beitrags-Detailseiten (`src/pages/blog/[slug].astro`)
- **Eine** dynamische Route erzeugt per **`getStaticPaths()`** beim Build **automatisch je
  Beitrag eine eigene Astro-Seite** (`getPosts()` holt alle Posts mit Volltext). Neue Beiträge
  erscheinen beim nächsten Build von selbst — **kein Programmieren pro Beitrag**, Pflege weiter
  im WP-Admin.
- Beitrags-Kacheln verlinken daher **intern** auf `/blog/<slug>/` (in `getAllPosts()` gesetzt),
  **nicht** mehr auf die WP-Permalink-Seite → Beiträge bleiben im Astro-Design.
- Aufbau: **Bild-Hero** (Beitragsbild als Hintergrund + Titel-Overlay + Datum-Eyebrow) →
  `content.rendered` in einem Prosa-Container (`.astro-post__content`, eigene Klassen). Ohne
  Beitragsbild fällt der Hero auf einen Farbverlauf zurück (`--plain`). WP-Titel-Entities werden
  dekodiert. SEO je Beitrag aus SEOPress via `getSeoHead(wpPath)`.
- **Bild-Fallstrick (wichtig):** `_embedded`/`wp:featuredmedia` ist **unzuverlässig** (mal befüllt,
  mal leer — deshalb fehlten anfangs alle Beitragsbilder). Bilder daher IMMER über die ID
  (`featured_media`) mit `resolveMediaUrls()` (gebündelter `/media?include=`-Call) auflösen.
  Gilt auch für Termine (`event_meta.image`).
- **News** dagegen haben keine Detailseite (leere WP-Permalinks) → Lightbox (siehe oben).

---

## 7. Termin-Kacheln (`EventCalendar.astro`) — Präfix `astro-ev`

> **Diese Komponente wird auch auf anderen Seiten gebraucht** (z.B. Terminkalender).
> Sauber wiederverwendbar halten.

### Props (seit „Gottesdienst & Glaube", Seite 45667)
Die Komponente ist per Props anpassbar; **Defaults = bisheriges Startseiten-Verhalten** (Startseite
bleibt ohne Props unverändert):
| Prop | Default | Wirkung |
|------|---------|---------|
| `heading` | `Unsere nächsten Veranstaltungen` | Überschrift über den Kacheln |
| `moreHref` | `/terminkalender/` | Ziel des „Alle Termine →"-Links |
| `category` | `0` | event-category-**ID**; gesetzt → zeigt **nur** Termine dieser Kategorie |
| `categoryLabel` | `''` | Klarname der Kategorie (z.B. `Engagiert Leben`) — für den Hinweistext, wenn es keine weiteren Termine gibt (siehe Regel unten) |

`category` landet als `data-category` auf `<section class="astro-ev">`; das Client-Script liest es und
filtert zusätzlich zum Datum (`per_page` auf 100 erhöht, damit eine Kategorie-Teilmenge reicht).
Kategorie-IDs liefert `/wp-json/wp/v2/event-category`. Beispiel (Seite „Gottesdienst & Glaube"):
```astro
<EventCalendar heading="Nächste Gottesdienst-Termine" category={2587} categoryLabel="Gottesdienst & Glaube" />
```

### ⭐ Regel: Verhalten bei wenigen/keinen Terminen (gilt für ALLE Terminblöcke)
Der Block hat drei Spalten (2 Vorschau-Kacheln + „Weitere Termine"). Je nach Terminzahl
**graceful degradieren** — niemals eine hängende „Lädt …"-Kachel oder leere Lücke zeigen:
- **≥ 3 Termine:** Kachel 1 + 2 = nächste zwei Termine, Spalte 3 = Liste „Weitere Termine" (`slice(2,6)`).
- **Genau 2 Termine:** beide Kacheln gefüllt, „Weitere Termine" zeigt den Hinweistext (s.u.).
- **Nur 1 Termin:** **zweite Vorschau-Kachel entfällt** (kein Platzhalter), Grid wird 2-spaltig;
  „Weitere Termine" zeigt den Hinweistext.
- **0 Termine:** beide Kacheln entfallen, nur „Weitere Termine" mit Hinweistext.

**Hinweistext** (Überschrift bleibt immer „Weitere Termine"): bei gesetztem `categoryLabel`
„*Aktuell keine weiteren Termine im Bereich „&lt;Label&gt;".*", sonst „*Aktuell keine weiteren Termine.*".
(„Bereich" statt „Programmsparte/Kategorie" — Sprachgebrauch der Seiten.) Die Spaltenzahl passt
sich automatisch der Zahl sichtbarer Kacheln an. Umgesetzt im Client-Script von `EventCalendar.astro`.

> **Wichtig — das ist Datenpflege, kein Code-Thema:** Füllen sich die zweite Kachel/Liste nicht,
> liegt es daran, dass im WordPress zu wenige Termine dieser **Kategorie** zugeordnet sind. Sobald
> das Pfarrbüro mehr Termine der Kategorie zuweist, erscheinen sie beim nächsten Build automatisch.

- **Client-seitig** (Browser-Script) Fetch über Proxy: `/wp-proxy/wp-json/wp/v2/event?per_page=30`
- Filter: nur kommende Termine (`event_meta.start_date >= heute`, Format `YYYYMMDD`), aufsteigend sortiert
- Layout: **3-Spalten-Grid**, `align-items: stretch` (alle Spalten gleich hoch!)
  - **Spalte 1 & 2:** große Kacheln (Bild **220px**, Titel, Untertitel auf 3 Zeilen geklemmt)
  - **Spalte 3:** Liste „Weitere Termine" (Einträge 3–6, also `slice(2,6)`)

### event_meta-Felder (vom WP-Plugin)
| Feld | Inhalt | Beispiel |
|------|--------|----------|
| `start_date` | Datum `YYYYMMDD` | `20260918` |
| `times` | Uhrzeit-Text | `19:30 Uhr` |
| `location` | Ort (Freitext) | `St. Bonifatius, Großer Pfarrsaal` |
| `church` | Kirchort-Kürzel | `bonifatius`, `aposteln`, `georgen`, `judas` |
| `subtitle` | Untertitel | … |
| `image` | Media-ID (separat laden) | `50079` |

- **Kirchort-Mapping:** `church`-Kürzel → voller Name (`bonifatius` → „St. Bonifatius" …)
- **Bild laden:** separater Fetch `/wp-proxy/wp-json/wp/v2/media/{id}?_fields=source_url`,
  dann absolute Dev-URL auf `/wp-proxy` umschreiben (Browser-SSL!):
  ```js
  d.source_url.replace(/^https?:\/\/dev\.sanktbonifatius\.de(\.w021941a\.kasserver\.com)?/, '/wp-proxy')
  ```
- **Meta-Zeile:** „Mo, 18. Juni 2026 · 19:30 Uhr · St. Bonifatius"
- **Liste:** kompakt — pro Eintrag eine schmale Datumszeile (SVG-Kalender + Tag + Monat + Zeit
  **nebeneinander**) + Titel darunter. `astro-ev-list__items` nutzt
  `flex-direction:column; justify-content:space-between` → füllt die Spaltenhöhe gleichmäßig.

### Termin-Detailseiten (`src/pages/termine/[slug].astro`)
- Wie bei den Beiträgen: **eine** dynamische Route erzeugt per `getStaticPaths()` beim Build
  **je Termin eine Astro-Seite** (`getEventsFull()` — alle Termine, Bild-IDs gebündelt in EINEM
  `/media`-Call aufgelöst).
- **Aufbau:** Bild-Hero (Terminbild als Hintergrund + Titel-Overlay) → Untertitel
  (`event_meta.subtitle`) → **kompakte Meta-Zeile in EINER Zeile** (Datum · Uhrzeit · Ort;
  Kirchort nur, wenn nicht schon im Ort enthalten) → **Beschreibung**. `start_date`/`end_date`
  Format `YYYYMMDD`. Ohne Bild fällt der Hero auf einen Farbverlauf zurück.
- **Beschreibung-Fallstrick:** Termine haben **keinen REST-Fließtext** (`content` ist leer).
  Die Beschreibung steht nur in der **gerenderten** WP-Seite im Theme-Container
  `pbm-body-inner` (nach dem Meta-Block). `getEventDetail(path)` holt die Seite **einmal** und
  liefert SEO-Head **und** Beschreibung (extrahiert die `<p>`/`<h*>`/`<ul>`-Blöcke, entfernt
  Meta + fette Datums-Wiederholung). Spart einen zweiten Fetch je Termin.
- **Verlinkung:** Beide Termin-Komponenten (`EventCalendar`, `CalendarOverview`) sind
  client-seitig; sie setzen den Karten-`href` jetzt via `localPath(event.link)` =
  **Pfad der WP-URL** (`/termine/<slug>/`) → interne Astro-Detailseite statt alter WP-Seite.

> **Muster (gilt für Beiträge UND Termine):** WP liefert die Liste; eine `[slug].astro`-Route
> baut die Detailseiten automatisch. Neue Inhalte erscheinen beim nächsten Build von selbst.

---

## 8. Wiederkehrende Lektionen (Zeitfresser vermeiden)

1. **CSS wirkt nicht?** → Klassenname kollidiert mit WP-Theme. **`astro-`-Präfix** nutzen.
   Prüfen mit: `curl -s http://localhost:4321/ | grep -o "klassenname[^}]*}"` (zeigt alle CSS-Regeln).
2. **Keine Browser-Wirkung trotz Server-Änderung?** → Dev-Server **neu starten**
   (server-seitiger Code wird nicht per HMR neu geladen). JS-Module hartnäckig gecacht
   → **privates Fenster** öffnen, nicht nur CMD+R.
3. **Inhalte verschwinden?** → `removeRange`/Schnitt zu großzügig. Immer prüfen, was
   **vor UND nach** dem entfernten Block steht (Reihenfolge per Positions-Scan).
4. **Bilder dunkel/leer?** → entweder kein `image` im Event ODER absolute Dev-URL nicht
   auf `/wp-proxy` umgeschrieben (Browser blockt Dev-SSL).
5. **Symbole/Elemente plötzlich riesig?** → CSS-`<style>`-Block wurde mit weggeschnitten.
   `<style>`-Blöcke aus entferntem Bereich **bewahren**.
6. **Server hängt / lädt 30s+?** → Endlosschleife (z.B. `while(includes(...))` ohne
   Abbruch). Marker-basiert + Sicherungs-Counter arbeiten.
7. **Keine Emoji als Icons** (UI-Regel) → SVG nutzen (z.B. Kalender-Icon in der Terminliste).
8. **Sektion zu breit / „klebt" am Nachbarn?** → Full-Bleed (`100vw; left:50%; margin-left:-50vw`)
   lässt den **Inhalt** bis an den Bildschirmrand laufen, während andere Sektionen ihren Inhalt
   auf `max-width:1200px` begrenzen → wirkt zu breit. Lösung: begrenzte Breite + zentrieren
   (`width:calc(100% - 80px); max-width:…; margin:48px auto`) statt Full-Bleed; `margin` oben/unten
   gegen das Aneinanderkleben. Beispiel: `PhotoMarquee.astro` (`astro-marquee`) wurde von Full-Bleed
   auf eine zentrierte, schmalere Banderole umgestellt.

---

## 9. Fonts (Design-Vorgabe)

- **Body:** „Source Sans 3" (Bunny Fonts: `fonts.bunny.net`)
- **Überschriften:** „Playfair Display" — **seit 2026-06-26 ebenfalls über Bunny Fonts** (vorher Google
  Fonts). Bewusst google-frei aus Datenschutzgründen (keine Verbindung zu Google-Servern), siehe
  Datenschutz-Abschnitt „Schriftarten". Beide Schriften in EINEM `fonts.bunny.net`-Link in `Base.astro`.
- Geladen in `src/layouts/Base.astro`; dort auch `html, body { overflow-x: hidden }`
  für Full-Bleed-Elemente (`width:100vw; left:50%; margin-left:-50vw`).

---

## 9b. Migrationsplan — Startseite zu 100 % auf Astro-Komponenten

**Ziel:** Die Startseite besteht aktuell aus 3 echten Astro-Komponenten + eingefügtem
WP-HTML (Hybrid). Sie soll vollständig aus eigenen `astro-`-Komponenten bestehen, die
nur noch **Daten** (nicht fertiges HTML) aus WordPress ziehen. Danach ist die Seite
unabhängig vom WP-Theme.

> **Stand: ABGESCHLOSSEN (2026-06-14).** Alle 9 Blöcke unten sind als `astro-`-Komponenten
> gebaut; [`index.astro`](../src/pages/index.astro) enthält **kein `set:html`** mit WP-Markup
> mehr und ist vollständig vom WP-Theme entkoppelt. Feste Inhalte direkt in den Komponenten;
> nur Termine (`EventCalendar`) und Beiträge (`NewsGrid`) ziehen live aus der WP-API.
> Die Tabelle unten bleibt als Referenz, welche Komponente welchen WP-Block ersetzt hat.

### Bereits fertig (wiederverwendbar)
- `Nav.astro` · `EventCalendar.astro` (`astro-ev`) · `NewsGrid.astro` (`astro-news`)

### Umzubauende WP-Blöcke (Reihenfolge nach Aufwand/Nutzen)
| # | WP-Block (Klasse) | Neue Komponente | Datenquelle | Hinweise |
|---|-------------------|-----------------|-------------|----------|
| 1 | Hero (`bh2-editorial` + `bh2-ed-side`) | `Hero.astro` (`astro-hero`) | Page-Felder / ACF oder feste Inhalte | Full-Bleed-Bilder, Overlay-Text; Bild-IDs aus WP |
| 2 | Quicklinks (`boni-ql2`) | `QuickLinks.astro` (`astro-ql`) | feste Linkliste (selten geändert) | evtl. einfach im Code pflegen |
| 3 | Programm (`boni-prog-wrap`) | `ProgramGrid.astro` (`astro-prog`) | feste Icon-/Text-Blöcke | Icons als SVG, kein Emoji |
| 4 | Sakramente (`boni-kasualien`) | `Sacraments.astro` (`astro-sac`) | feste Karten | war fragil wegen WP-CSS → eigene Klassen lösen das |
| 5 | Kirchorte (`bh3a-kirch`) | `ChurchLocations.astro` (`astro-kirch`) | Bilder + Namen (evtl. WP-Media) | 4 Kärtchen mit Bild/Overlay |
| 6 | Foto-Marquee (`h6-marquee-wrap`) | `PhotoMarquee.astro` (`astro-marquee`) | Bildliste (WP-Media oder fest) | CSS-Animation; `prefers-reduced-motion` beachten |
| 7 | Bild-Text-Blöcke (`sb-feat`) | `FeatureBlocks.astro` (`astro-feat`) | 4 Blöcke (Bild + Text + Link) | abwechselnd links/rechts |
| 8 | „Neugierig geworden" (CTA) | `CtaBanner.astro` (`astro-cta`) | fester Text + Button | |
| 9 | Footer (fehlt im Content!) | `Footer.astro` (`astro-footer`) | aus WP-Theme-Footer nachbauen | Kontakt, Links, Impressum, Datenschutz |

### Vorgehen je Block
1. WP-Block im Content lokalisieren (Positions-Scan, siehe Abschnitt 4).
2. Inhalte + Bild-URLs aus dem WP-HTML extrahieren (einmalig kopieren ODER per API ziehen,
   wenn sich Inhalte häufig ändern).
3. Eigene Komponente mit `astro-`-Präfix bauen (HTML + scoped/global `<style>`).
4. In `wordpress.js` den `removeRange`-Bereich erweitern, bis der Block aus dem WP-Content
   verschwindet; in `index.astro` die neue Komponente an der richtigen Stelle einsetzen.
5. Server neu starten, im privaten Fenster prüfen, Reihenfolge per Positions-Scan kontrollieren.

### Entscheidung „feste Inhalte vs. WP-Daten" pro Block
- **Selten geändert** (Hero-Text, Quicklinks, Programm, Sakramente, Footer) → Inhalte
  direkt in der Komponente pflegen (schnell, robust). Sekretärinnen müssen das nicht ändern.
- **Häufig geändert** (Termine, Beiträge, evtl. Kirchort-Bilder) → per WP-API ziehen, damit
  die Sekretärinnen es weiter im WP-Admin pflegen können.

### Endzustand
`index.astro` enthält dann **kein** `set:html` mit WP-Theme-Markup mehr, sondern nur noch:
```astro
<Hero /> <QuickLinks /> <ProgramGrid /> <Sacraments />
<EventCalendar /> <NewsGrid />
<ChurchLocations /> <PhotoMarquee /> <FeatureBlocks /> <CtaBanner /> <Footer />
```
→ Die Seite ist vollständig vom WP-Theme entkoppelt.

---

## 10. Checkliste für eine neue Seite

1. Page-ID auf dem Dev-Server ermitteln.
2. `getPageById(id)` in der neuen `.astro`-Seite nutzen.
3. Prüfen, welche WP-Sektionen durch eigene Astro-Komponenten ersetzt werden sollen
   (Positions-Scan: `curl ... | python3` nach Sektions-Klassen).
4. Bei Ersatz: `removeRange` mit Start-/End-Marker + `ASTRO_SLOT`, Content splitten.
5. Eigene Komponenten **immer mit `astro-`-Präfix**.
6. Nav + Footer kommen **automatisch** aus `Base.astro` (Abschnitt 4b) — nicht erneut einbinden;
   ggf. `EventCalendar`/`NewsGrid`/`PageHeader` wiederverwenden.
7. **Hero prüfen: Hat die WP-Seite einen eigenen Hero, muss er auch in Astro erscheinen.**
   Nicht nur den Text ansehen, sondern die **CSS-Regel** des Hero-Blocks (`.{präfix}-hero`)
   im `<style>` der WP-Seite — dort steht, ob ein **Foto** dahinterliegt:
   ```bash
   curl -sk ".../wp-json/wp/v2/pages/<id>?_fields=content" \
     | python3 -c "import sys,json,re;h=json.load(sys.stdin)['content']['rendered'];print('\n'.join(re.findall(r'\.[a-z0-9-]*hero[^{]*\{[^}]*background[^}]*\}',h)))"
   ```
   - **Foto-Hero** (`background:…url(…)` oder `<img>`) → Bild lokal nach `public/uploads/<jahr>/<monat>/`
     laden (Handbuch 1b) und als Full-Bleed-Hintergrund + Verlauf-Overlay übernehmen (Muster
     `SegenHero.astro`/`PbHero.astro`). **Nicht** stillschweigend durch einen reinen Farbverlauf
     ersetzen — das verliert das vom WP gewollte Bild.
   - **Reiner Verlauf-Hero** (kein Bild) → eigener `astro-`-Verlauf ist ok (Muster `KontaktHero`/
     `NlHero`); Farbton an die WP-Vorlage anlehnen, aber freundlich/lesbar halten.
8. Server neu starten, im **privaten Fenster** testen, Reihenfolge per Positions-Scan prüfen.

---

## 11. Seite „Kontakt" (Page 46800, `/kontakt/`) — vollständig eigene Komponenten ✅

**Stand: ABGESCHLOSSEN (2026-06-15).** Die Kontakt-Seite ist — wie „Gottesdienst & Glaube"
(Abschnitt 9b) — komplett aus eigenen `astro-`-Komponenten gebaut, **ohne `set:html` mit
WP-Markup**. Inhalte sind fest gepflegt (Kontakt-Daten ändern sich selten); nur der SEO-Head
kommt live aus WordPress.

### Aufbau ([`src/pages/kontakt.astro`](../src/pages/kontakt.astro))
```astro
<Base seo={await getSeoHead('/kontakt/')}>
  <KontaktHero />     <!-- astro-kthero  : „Kontakt aufnehmen", dunkel-warmer Verlauf (Vorlage hat kein Bild) -->
  <KontaktPaths />    <!-- astro-ktpaths : Intro-Lead + „Wie können wir Ihnen helfen?" — 6 Karten, SVG-Icons, mailto -->
  <KontaktAddress />  <!-- astro-ktaddr  : „Wie Sie uns finden" — 4 Blöcke (Pfarrbüro/Maps, Öffnungszeiten, E-Mail, Telefon) -->
  <KontaktCta />      <!-- astro-ktcta   : „Schreiben Sie uns"-CTA + SEO-Fließtext (Keywords sichtbar im Rumpf) -->
</Base>
```
Nav + Footer kommen global aus `Base.astro` (Abschnitt 4b). SEO-Head (inkl. WP-JSON-LD
`ContactPage` + `CatholicChurch`) via `getSeoHead('/kontakt/')`.

### WP-Vorlage → eigene Klassen (goldene Regel, Abschnitt 3)
Die WP-Seite nutzt die Theme-Klassen `kt-hero`, `kt-paths`, `kt-card`, `kt-address`,
`kt-addr-block`, `kt-cta`, `kt-seo`. Diese sind für uns **tabu** — die eigenen Komponenten
nutzen durchgängig `astro-kt…`. (Hier wurde der WP-Content **nicht** per `getPageById` geholt,
sondern die Inhalte einmalig in die Komponenten übernommen → kein `removeRange` nötig.)

### E-Mail-Adressen
In der WP-Vorlage waren die `mailto:` HTML-entity-verschleiert (Spamschutz). In den
Komponenten stehen sie als **klare `mailto:`** (wartbar). Falls Anti-Harvesting gewünscht ist,
nachrüstbar. Zuordnung: Pfarrbüro/Sakramente/Neu → `info@`, Seelsorge → `w.otto@`,
Familien → `f.hoffmann@`, Jugend → `l.wykipil@` (`@sanktbonifatius.de`).

### Nav-Verdrahtung ([`Nav.astro`](../src/components/Nav.astro))
- Der Top-Level-Link **„Kontakt" zeigt auf `/kontakt/`** → klickt man ihn am Desktop, landet
  man auf der neuen Seite (Dropdown öffnet nur per Hover).
- **Mobil-Fallstrick:** Bei offenem Mobil-Menü fängt das Nav-Skript den Klick auf den
  Dropdown-Kopf ab (`e.preventDefault()`) und öffnet **nur das Untermenü** — die Top-Zeile
  navigiert dort also nicht. Damit die Übersichtsseite **auf allen Geräten** erreichbar ist,
  steht als **erster Untermenü-Eintrag** `Kontakt-Übersicht → /kontakt/`.
- Die übrigen Kontakt-Untermenü-Links (`/kontakt/pfarrbuero/`, `/kontakt/engagement/` …) zeigen
  weiterhin auf **WP-Unterseiten, die in Astro noch nicht gebaut sind** — bei Bedarf später
  analog übernehmen (siehe Merkpunkt Abschnitt 12).

---

## 12. ⚠️ MERKPUNKT: Interne Links portfolioweit prüfen (vor Go-Live)

> **Offen — erst nach Fertigstellung aller Seiten erledigen.** Solange noch nicht alle WP-Seiten
> nach Astro übernommen sind, **nicht** einzeln „reparieren" — am Ende **einmal das ganze
> Seiten-Portfolio durchgehen**.

**Worum es geht:** Sowohl die **Navigation** ([`Nav.astro`](../src/components/Nav.astro)) als auch
**Inhalte innerhalb der Seiten** verlinken vielfach auf Seiten, die in Astro **noch nicht gebaut**
sind (sie existierten/existieren nur im WordPress). Solche Links laufen im Astro-Frontend aktuell
ins Leere (404), bis die Zielseite übernommen ist.

**Bekannte Beispiele (nicht abschließend):**
- Nav „Über uns"-Untermenü: `/ueberuns/`, `/ueberuns/pastoralteam/`, `/ueberuns/kirchorte/`,
  `/kitas/`, `/ueberuns/leitung/`, `/ueberuns/finanzen/`, `/ueberuns/barrierefreiheit/`
- Nav „Kontakt"-Untermenü: `/kontakt/pfarrbuero/`, `/kontakt/engagement/`,
  `/kontakt/beratung-und-hilfe/`, `/kontakt/trauerfall/`, `/kontakt/katholisch-werden/`,
  `/kontakt/newsletter/`
- `/spenden/` (Spenden-Button) sowie diverse In-Content-Links der bereits übernommenen Seiten.

**Finaler Check (wenn das Portfolio steht):**
1. Alle Astro-Routen auflisten (`src/pages/**`, inkl. dynamischer `[slug]`-Routen).
2. Alle internen `href="/..."` in `Nav.astro`, `Footer.astro` und allen Seiten/Komponenten sammeln
   (z.B. `grep -rho 'href="/[^"]*"' src | sort -u`).
3. Jeden internen Link gegen die vorhandenen Routen abgleichen → Treffer = ok, Rest = noch zu bauen
   oder umzubiegen.
4. Übrige tote Links entweder auf eine gebaute Seite umbiegen, vorerst auf die passende
   WP-Seite zeigen lassen, oder den Menüpunkt vorübergehend entfernen.
5. Erst dann Go-Live (Netlify, Abschnitt 1b) — sonst zeigen Besucher-Klicks auf 404.

---

## 13. Seite „Taufe" (Page 46566, `/segen-sakramente/taufe/`) — eigene Komponenten + Formular ✅

**Stand: ABGESCHLOSSEN (2026-06-15).** Wie „Kontakt" (Abschnitt 11) vollständig aus eigenen
`astro-`-Komponenten gebaut, **ohne `set:html` mit WP-Markup**. Feste Inhalte (Termine, Texte,
Team); nur der SEO-Head kommt live aus WordPress. **Kritisch:** Das Anmeldeformular sendet an den
bestehenden WordPress-Handler — siehe Abschnitt 13b.

### Aufbau ([`src/pages/segen-sakramente/taufe.astro`](../src/pages/segen-sakramente/taufe.astro))
```astro
<Base seo={await getSeoHead('/segen-sakramente/taufe/')}>
  <TaufeHero />        <!-- astro-tahero   : H1 + 2 Buttons (#anmeldung, #termine), dunkler Verlauf -->
  <TaufeStrip />       <!-- astro-tastrip  : 3 Vorteile (Bordeaux-Band), SVG-Icons -->
  <TaufeTermine />     <!-- astro-tatermine: „Tauftermine 2026", 3 Kirchen-Karten, id="termine" -->
  <TaufeSteps />       <!-- astro-tasteps  : „So läuft die Anmeldung", 4 Schritte + 2 CTAs -->
  <TaufeUnterlagen />  <!-- astro-taunter  : „Unterlagen & Taufpaten", 2 Infokarten -->
  <TaufeFest />        <!-- astro-tafest   : „Ein Fest…", Foto-Galerie + Lightbox (34 Fotos) -->
  <TaufeErwachsene />  <!-- astro-taerw    : „Als Erwachsener…", id="erwachsene" -->
  <TaufeFaq />         <!-- astro-tafaq    : 8 FAQ-Items (natives <details>) -->
  <TaufeTeam />        <!-- astro-tateam   : Seelsorgeteam, 8 Karten -->
  <TaufeForm />        <!-- astro-taform   : Anmeldeformular, id="anmeldung" — SIEHE 13b -->
  <TaufeEndCta />      <!-- astro-taendcta : „Fragen?" Telefon + E-Mail -->
</Base>
```
Nav + Footer global aus `Base.astro` (Abschnitt 4b). Route liegt unter `pages/segen-sakramente/`
→ erzeugt exakt den WP-Pfad `/segen-sakramente/taufe/` (wichtig für `getSeoHead` + canonical).

### Bilder
- **Team (8)** + **Galerie (34, `taufe-stbonifatius-1..34.jpg`)** liegen lokal unter
  `public/uploads/2023/03` bzw. den jeweiligen Team-Pfaden (vom Dev-WP heruntergeladen, Abschnitt 1b).
- Galerie-Lightbox als eigenständige Komponente (Muster aus `GdGallery.astro`): 6 Vorschau-Kacheln,
  „Alle Fotos anzeigen" öffnet die volle Galerie (alle 34 Fotos im `data-photos`-JSON).

---

## 13b. ⚠️ Taufe-Anmeldeformular im Headless-Setup — Übermittlung & PDF (WICHTIG)

> **Das Formular ist das kritische Element der Seite.** Es erzeugt eine **ausgefüllte PDF im Look des
> offiziellen Diözesan-Formulars „Anmeldung zur Taufe" (Limburg)** und verschickt sie ans Pfarrbüro.
> Ausfüllbare Vorlage im Projekt: [`src/lib/taufe/taufe-vorlage.pdf`](../src/lib/taufe/taufe-vorlage.pdf).

### Stand: UMGESETZT in Astro (2026-06-21) — eigenes PDF + eigener Mailversand
Das Formular ist **WP-unabhängig**: kein admin-ajax/Nonce/CORS mehr. Der Ablauf:

1. **Formular** ([`TaufeForm.astro`](../src/components/TaufeForm.astro)) postet das `FormData`
   per `fetch` an die eigene Route **`/api/taufe-anmeldung`** (kein WP-Aufruf mehr).
2. **API-Route** [`src/pages/api/taufe-anmeldung.ts`](../src/pages/api/taufe-anmeldung.ts)
   (`export const prerender = false`): liest die Felder → erzeugt das ausgefüllte PDF →
   verschickt es per `nodemailer` als **PDF-Anhang** ans Pfarrbüro → gibt JSON `{success,data}` zurück.
3. **PDF-Erzeugung** [`src/lib/taufe/fill-taufe.js`](../src/lib/taufe/fill-taufe.js): füllt die
   **ausfüllbare Vorlage** [`src/lib/taufe/taufe-vorlage.pdf`](../src/lib/taufe/taufe-vorlage.pdf)
   (echte AcroForm-Felder, 38 Stück — inkl. Seite/Lfd. Nr. oben rechts) — pixelgenau wie das amtliche Limburger Formular.
4. **Server-Modus:** [`astro.config.mjs`](../astro.config.mjs) nutzt **`@astrojs/node`** (standalone);
   nur Routen mit `prerender = false` laufen server-seitig, alle Seiten bleiben statisch.

**Vorlage neu bauen** (Kopf/Logo/Felder ändern): Quell-Rohling + Logo liegen unter
`scripts/taufe-assets/`, Generator ist [`scripts/build-taufe-vorlage.mjs`](../scripts/build-taufe-vorlage.mjs)
(`node scripts/build-taufe-vorlage.mjs`). Der Kopf links wurde geleert und durch Logo + Pfarrei-Kontakt
+ „Diözese Limburg" ersetzt; Feld-Koordinaten stammen aus dem echten Linienraster (`pdftocairo -svg`).

**Feld-Mapping (Vertrag):** Die Formular-`name`-Attribute werden in `fill-taufe.js` auf die PDF-Felder
abgebildet. Wo das amtliche Formular zusammenfasst, werden Einzelfelder gejoint (`tauf_strasse`+
`tauf_wohnort`; `vater_name`+`vater_vorname`; `eltern_strasse`+`eltern_wohnort`; `trauung`/`traudatum`/
`trauort`). **Wunschtermin + Kontakt** stehen nicht auf dem amtlichen Formular → wandern in die
**Bemerkungen**. NICHT umbenennen, sonst greift das Mapping nicht.

> **Lokaler Test ohne Postfach:** Sind keine SMTP-Daten gesetzt, läuft ein **DEV-Modus** — das PDF
> wird statt versendet unter `./.taufe-eingaben/` gespeichert (gitignored). Verifiziert 2026-06-21
> (Formular abgeschickt → PDF korrekt erzeugt).

### 🔜 Offen — erst beim Netlify-Go-Live
1. **SMTP-Zugangsdaten** des All-inkl-Postfachs als **Env-Vars** hinterlegen (NIE ins Repo):
   `SMTP_HOST/PORT/USER/PASS`, `SMTP_FROM`, `TAUFE_TO` — Muster in [`.env.example`](../.env.example).
   Empfänger wie bisher: `pfarrer@`, `info@`, `w.otto@sanktbonifatius.de` (Team-Handbuch 15).
2. **Adapter umstellen:** für Netlify `@astrojs/netlify` statt `@astrojs/node` in `astro.config.mjs`.
   Sicherstellen, dass die Vorlage `src/lib/taufe/taufe-vorlage.pdf` im Serverless-Bundle landet
   (ggf. `includeFiles`/`functionPerRoute` prüfen — die Route liest sie über `import.meta.url`).
3. Danach echten Versand mit Test-Anmeldung verifizieren (Mail kommt mit PDF-Anhang an).

> Die frühere WordPress-AJAX-Anbindung (`taufe_anmeldung`, Nonce-Abruf über `/wp-proxy`) ist abgelöst.
> Der WP-Handler in `functions.php` bleibt unangetastet und versorgt weiterhin die alte WP-Seite.

---

## 13c. Tauftermine aus WordPress pflegen (Page 50101) ✅

**Stand: UMGESETZT (2026-06-15).** Die Termine in [`TaufeTermine.astro`](../src/components/TaufeTermine.astro)
sind **nicht mehr fest im Code**, sondern kommen aus einer eigenen WordPress-Seite, die die
Sekretärinnen im normalen Editor pflegen — **ohne Code, ohne Plugin**.

### Datenquelle
- **WP-Seite 50101**, veröffentlicht unter `/segen-sakramente/taufe/tauftermine/`
  (Titel „Tauftermine"). **Muss `publish` sein** — `getPageById`/`getTaufeTermine` lesen ohne
  Auth, eine `draft`-Seite liefert die öffentliche REST-API nicht aus.
- Gelesen von **`getTaufeTermine(id = 50101)`** in [`wordpress.js`](../src/lib/wordpress.js):
  holt `content.rendered`, parst es und gibt `[{ name, adresse, termine[] }]` zurück.
  Fällt WP aus → `[]`, dann nutzt die Komponente eine feste **FALLBACK**-Liste (Build bricht nie ab,
  Sektion nie leer).

### Pflege-Konvention der WP-Seite (genau einhalten!)
Pro Kirche **ein Block aus drei Teilen** im Gutenberg-Editor:
1. **Überschrift H3** = Kirchenname (`St. Bonifatius`)
2. **ein Absatz** direkt darunter = Adresse (`Holbeinstr. 70 · 60596 Frankfurt-Sachsenhausen`)
3. **eine Liste** = Termine, **ein Datum pro Listenpunkt** (`22. August 2026`)

→ Vergangene Termine einfach als Listenpunkt **löschen**, neue als Listenpunkt **ergänzen**.
Neue Kirche = neuer H3-Block. Der Parser teilt an `<h3>`, nimmt den ersten `<p>` als Adresse und
alle `<li>` als Termine.

> **Datum-Filter:** Es wird angezeigt, was in der Liste steht — vergangene Termine werden **nicht
> automatisch** ausgeblendet (bewusst einfach gehalten: löschen statt Logik). Beim Eintragen die
> abgelaufenen Zeilen entfernen.

> **Statisch (Netlify):** Änderung erscheint erst nach **Rebuild** (Webhook, Abschnitt 1c).
> Im Dev (`npm run dev`) sofort, da pro Aufruf frisch geladen.

### Bearbeiten per Anwendungspasswort (Claude/CLI)
```bash
# Lesen
curl -sk -u "Werner:<APP-PW>" \
  "https://dev.sanktbonifatius.de.w021941a.kasserver.com/wp-json/wp/v2/pages/50101?context=edit&_fields=content"
# Schreiben: POST mit {"content": "<gutenberg-html>", "status":"publish"}
```
App-Passwort: Team-Handbuch `02-zugang-wordpress.md`. Content-Muster (H3 + Absatz + Liste) siehe
oben; Umlaute/Sonderzeichen als HTML-Entities (`&uuml;`, `&middot;`, `&ndash;`) sind ok — der
Parser dekodiert sie (`decodeEntities` in `wordpress.js`).

---

## 14. Seite „Segen und Sakramente" (Page 48265, `/segen-sakramente/`) — Übersichtsseite ✅

**Stand: ABGESCHLOSSEN (2026-06-16).** Übersichtsseite über dem bereits gebauten
`/segen-sakramente/taufe/`. Wie „Kontakt" (Abschnitt 11) und „Taufe" (Abschnitt 13) vollständig aus
eigenen `astro-`-Komponenten gebaut, **ohne `set:html` mit WP-Markup**. Feste Inhalte; nur der
SEO-Head kommt live aus WordPress (`getSeoHead('/segen-sakramente/')`).

### Aufbau ([`src/pages/segen-sakramente/index.astro`](../src/pages/segen-sakramente/index.astro))
```astro
<Base seo={await getSeoHead('/segen-sakramente/')}>
  <SegenHero />    <!-- astro-sshero  : Full-Bleed-Foto + H1 „Segen und Sakramente" + Untertitel -->
  <SegenStrip />   <!-- astro-ssstrip : dunkler Info-Streifen (7 Sakramente · die 4 Kirchorte) -->
  <SegenIntro />   <!-- astro-ssintro : Lead „In den Sakramenten…" + Benedicere-Zitat -->
  <SegenTiles … /> <!-- astro-sstiles : „Gottes Segen für Sie" — 2 Kacheln (cols=2) -->
  <SegenTiles … /> <!-- astro-sstiles : „Sakramente in unserer Pfarrei" — 6 Kacheln (cols=3) -->
  <SegenFaq />     <!-- astro-ssfaq   : „Antworten auf Ihre Fragen", 6 FAQ (natives <details>) -->
  <SegenCta />     <!-- astro-sscta   : „Fragen? Wir sind für Sie da." → /kontakt/, /gottesdienst-glaube/ -->
</Base>
```
Nav + Footer global aus `Base.astro` (Abschnitt 4b). Route als `segen-sakramente/index.astro` (das
Verzeichnis existierte schon wegen `taufe.astro`) → erzeugt den WP-Pfad `/segen-sakramente/`.

### Wiederverwendbare Kachel-Komponente `SegenTiles.astro`
Ersetzt die WP-Blöcke `ss-tiles2` **und** `ss-tiles3` mit **einer** Props-gesteuerten Komponente
(`heading`, `intro`, `cols` 2|3, `bg` creme|white, `tiles[]` mit `{img,pos?,label,title,text,href,linkText}`).
WP-Klassen `ss-…` waren tabu (goldene Regel, Abschnitt 3) → eigenes Präfix `astro-ss…`.

### Bilder
9 Bilder einmalig vom Dev-WP nach `public/uploads/<jahr>/<monat>/` geladen (lokal, WP-unabhängig,
vgl. Abschnitt 1b/13). Als CSS-Hintergrund mit optionaler `background-position` pro Kachel (`pos`).

### ⚠️ Tote Links (Abschnitt 12) — bewusst belassen
Die Sakrament-Kacheln verlinken auf `/segen-sakramente/firmung/`, `…/erstkommunion/`, `…/trauung/`,
`…/beichte/`, `…/krankensalbung/` — diese Seiten sind in Astro **noch nicht gebaut** (nur **Taufe**
existiert). Pfade zeigen schon auf den künftigen Zielort (konsistent mit `GdSacraments.astro`). Vor
Go-Live im Portfolio-Check (Abschnitt 12) abgleichen bzw. die nächsten Sakrament-Unterseiten bauen.

---

## 15. Seite „BonFamily" (Page 45898, `/bonfamily/`) — eigene Komponenten ✅

**Stand: ABGESCHLOSSEN.** Familien-/Kinder-Übersichtsseite, wie „Kontakt" (Abschnitt 11), „Taufe"
(Abschnitt 13) und „Segen und Sakramente" (Abschnitt 14) vollständig aus eigenen `astro-`-Komponenten
gebaut, **ohne `set:html` mit WP-Markup**. Feste Inhalte direkt in den Komponenten; nur **Termine**
(EventCalendar, live aus WP) und der **SEO-Head** kommen aus WordPress.

### Aufbau ([`src/pages/bonfamily.astro`](../src/pages/bonfamily.astro))
```astro
<Base seo={await getSeoHead('/bonfamily/')} title="BonFamily – Familien & Kinder · …">
  <BfHero />            <!-- astro-bfhero    : 3-zeiliger Titel („BonFamily" in Rot), Pill-Badge, Foto-Hero -->
  <BfStrip />           <!-- astro-bfstrip   : zentrierte Schnellzugriff-Leiste -->
  <BfWelcome />         <!-- astro-bfwelcome : Willkommens-Text (ein Absatz/Block) -->
  <EventCalendar … />   <!-- astro-ev        : „Nächste BonFamily-Termine", category={2586} -->
  <BfMusical />         <!-- astro-bfmusical : Musicalprojekt-Ankündigung + Plakat (id=bonfamily-musical) -->
  <BfGottesdienste />   <!-- astro-bfgd      : dunkle Band-Section, 3 Gottesdiensttypen (id=bonfamily-gottesdienste) -->
  <BfTaufe />           <!-- astro-bftaufe   : Taufe-Teaser → /segen-sakramente/taufe/ -->
  <BfLounge />          <!-- astro-bflounge  : Baby-Lounge + Familien-Lounge, 2 Karten (id=bonfamily-lounge) -->
  <BfGallery />         <!-- astro-bfgal     : 11 Fotos lokal, 3 Thumbnails + „Alle Fotos" → Lightbox -->
  <BfKontakt />         <!-- astro-bfkontakt : Ansprechpartner mit Foto (id=bonfamily-kontakt) -->
  <BfFaq />             <!-- astro-bffaq     : FAQ, natives <details> (id=bonfamily-faq) -->
  <BfCta />             <!-- astro-bfcta     : Abschluss-CTA -->
</Base>
```
Nav + Footer global aus `Base.astro` (Abschnitt 4b). Route `pages/bonfamily.astro` → WP-Pfad
`/bonfamily/` (wichtig für `getSeoHead` + canonical).

### Termine: gefilterter EventCalendar
`<EventCalendar category={2586} />` zeigt nur die BonFamily-Event-Kategorie (ID **2586**, Team-Handbuch 07).
Der Block liegt in `<div id="bonfamily-termine" class="astro-bf-anchor">`; seitenspezifisches
`<style is:global>` in `bonfamily.astro` färbt **nur hier** die Termin-Überschriften Bordeaux (`#9a2d2d`)
und setzt die Karten auf weißen Hintergrund — der EventCalendar selbst bleibt unverändert/wiederverwendbar.

### Sprung-Anker
Die Schnellzugriff-Leiste (`BfStrip`) springt zu den Section-IDs (`#bonfamily-musical`,
`-gottesdienste`, `-lounge`, `-kontakt`, `-faq`). `scroll-margin-top: 96px` gleicht die fixierte
80px-Nav aus (im globalen `<style>` der Seite).

### Bilder & Galerie
- **11 Galerie-Fotos** lokal unter `public/uploads/2023/07/bonfamily-auswahl-*.jpg` (vom WP geladen,
  Abschnitt 1b), Hero `public/uploads/2026/04/bonfamily-hero.jpg`, Musical-Plakat unter
  `public/uploads/2026/06/`.
- Galerie-Lightbox folgt dem Muster `TaufeFest.astro` / `GdGallery.astro` (3 Thumbnails →
  „Alle Fotos" öffnet die volle Galerie mit Blättern + Zähler).

> **Hinweis (goldene Regel, Abschnitt 3):** Durchgängiges Präfix `astro-bf…` (z.B. `astro-bfgd`,
> **nicht** `bf-gd-…`) — keine WP-Theme-Klassen wiederverwenden.

---

## 16. Seite „Gottesdienste, die berühren" (Page 47578, `/gottesdienst-glaube/gottesdienste-die-beruehren/`) ✅

**Stand: ABGESCHLOSSEN.** Unterseite von „Gottesdienst & Glaube". Wie Kontakt/Taufe/Segen/BonFamily
vollständig aus eigenen `astro-`-Komponenten gebaut, **ohne `set:html` mit WP-Markup**. Feste Inhalte
direkt in den Komponenten; nur der SEO-Head kommt live aus WordPress.

### Aufbau ([`src/pages/gottesdienst-glaube/gottesdienste-die-beruehren.astro`](../src/pages/gottesdienst-glaube/gottesdienste-die-beruehren.astro))
```astro
<Base seo={await getSeoHead('/gottesdienst-glaube/gottesdienste-die-beruehren/')} title="…">
  <GdbHero />     <!-- astro-gdbhero  : Full-Bleed-Foto-Hero + 2 Buttons (Gottesdienstordnung, Kontakt) -->
  <GdbIntro />    <!-- astro-gdbintro : „Wo Glaube Raum bekommt" -->
  <GdbFormate />  <!-- astro-gdbfmt   : „Unsere besonderen Formate" — 3 Karten Fiat Lux/Taizé/BonEsprit -->
  <GdbCta />      <!-- astro-gdbcta   : „Kommen Sie einfach vorbei" → Gottesdienstordnung -->
  <GdbMaps />     <!-- astro-gdbmaps  : „Wo wir feiern" — Adresse + Google-Maps-Link (kein iframe) -->
</Base>
```
Route liegt in `pages/gottesdienst-glaube/` (Verzeichnis existierte schon wegen `gottesdienstordnung.astro`)
→ erzeugt exakt den WP-Pfad (wichtig für `getSeoHead` + canonical).

### Präfix-Wahl (goldene Regel, Abschnitt 3)
Die WP-Seite nutzt `gd-hero`, `gd-intro`, `gd-fc…`, `gd-cta`, `gd-maps-wrap`. Diese sind tabu.
**Achtung doppelte Kollisionsgefahr:** Die Elternseite „Gottesdienst & Glaube" belegt bereits
`astro-gd…` (`GdHero`, `GdWelcome` …). Daher hier **eigenes Präfix `astro-gdb`** (gottesdienste-die-
berühren), damit weder WP-`gd-` noch die `astro-gd`-Klassen der Elternseite kollidieren.

### Format-Karten (`GdbFormate.astro`)
3 Karten aus einem Daten-Array (`name`, `tagline`, SVG-`icon`, `desc`, `termine[]` mit
`{date, act}`, `location`). Pro Termin Datum + optionaler Mitwirkenden-Zusatz (`act`). Farb-Akzent
je Format über `--<mod>`-Modifier (Bordeaux/Gold/Grün am oberen Kartenrand + Icon-Farbe). Symbole
als **SVG** (Kerze/Note/Gemeinschaft), kein Emoji (Abschnitt 8.7). Grid 3-spaltig, ≤860px einspaltig.

### Bild
Ein Foto-Hero (`stbonifatius-gottesdienste-die-beruehren.jpg`), einmalig vom WP nach
`public/uploads/2023/07/` geladen (Abschnitt 1b) und als Full-Bleed-Hintergrund + Verlauf-Overlay
übernommen (Muster `GdHero`/`SegenHero`). Keine weiteren Bilder auf der Seite.

> **Termine fest im Code** (nicht aus der WP-API), da es sich um wenige, planbare Sondertermine
> handelt. Ändern sie sich, in `GdbFormate.astro` im `formats`-Array pflegen.

---

## 17. Seite „Engagiert Leben" (Page 46769, `/engagiert-leben/`) + 2 Unterseiten ✅

**Stand: ABGESCHLOSSEN (2026-06-26).** Übersichtsseite „Engagiert Leben" plus die beiden
Unterseiten „Nachbarschaftliches Hilfenetz" und „Offener Kühlschrank". Wie alle bisherigen
Seiten (Kontakt/Taufe/Segen/BonFamily) vollständig aus eigenen `astro-`-Komponenten gebaut,
**ohne `set:html` mit WP-Markup**. Feste Inhalte direkt in den Komponenten; nur der SEO-Head
kommt live aus WordPress, auf der Übersicht zusätzlich die **Termine** (EventCalendar).

> **⚠️ Namens-Falle:** Es gibt zwei verschiedene Seiten — die hier (`/engagiert-leben/`, Präfix
> `astro-el`) ist **NICHT** die Seite „Engagement" (`/kontakt/engagement/`, Präfix `astro-eng`,
> Page 48449). Beim Bau eindeutig die richtige Page-ID/den richtigen Slug verwenden.

### Aufbau & Präfixe (goldene Regel, Abschnitt 3)
WP nutzt die Theme-Präfixe `el-`, `nh-`, `ok-` → tabu. Eigene Präfixe je Seite:

| Seite | Page-ID | Route | Präfix | Komponenten |
|-------|---------|-------|--------|-------------|
| Engagiert Leben (Übersicht) | 46769 | `src/pages/engagiert-leben/index.astro` | `astro-el` | `ElHero`, `ElIntro`, `ElTiles`, `ElFaq`, `ElCta` + `EventCalendar` (Kat. **2590**) |
| Nachbarschaftliches Hilfenetz | 49124 | `src/pages/engagiert-leben/nachbarschaftliches-hilfenetz.astro` | `astro-nh` | `NhHero`, `NhIntro`, `NhTestimonials`, `NhAreas`, `NhCosts`, `NhContact`, `NhFaq`, `NhCta` |
| Offener Kühlschrank | 49123 | `src/pages/engagiert-leben/offener-kuehlschrank.astro` | `astro-ok` | `OkHero`, `OkLead`, `OkIntro`, `OkCards`, `OkBg`, `OkStandort`, `OkFaq`, `OkCta` |

Route der Übersicht als `engagiert-leben/index.astro`, die Unterseiten als Geschwister-Dateien
im selben Verzeichnis → erzeugen exakt die WP-Pfade (wichtig für `getSeoHead` + canonical).

### Farben & Bilder
- **Hausfarben statt WP-Sonderfarben:** Die WP-Vorlagen nutzten Lila (Übersicht) bzw. Grün
  (Hilfenetz). Bewusst auf die Hausfarben umgestellt (Bordeaux `#9a2d2d`, Gold `#c5a55a`) —
  wie bei der Engagement-Seite (Türkis→Bordeaux). Konsistenz vor WP-Originalfarbe.
- **9 Bilder lokal** unter `public/uploads/<jahr>/<monat>/` (vom Live-WP geladen, Abschnitt 1b):
  3 Foto-Heroes (`…/2023/08/sankt-bonifatius-thema-engagiert-leben.jpg`,
  `…/2021/10/Nachbarschaftliches_Hilfenetz.jpg`, `…/2023/07/foodworkshop-2.jpg`),
  5 Kachelbilder der Übersicht und das Hochformat-Foto der Hilfenetz-Koordinatorin
  (`…/2023/12/Helga_Jantschek--1024x1434.jpg`).

### Offene Punkte (Abschnitt 12 — tote Links, bewusst belassen)
Auf der Übersicht zeigen die Kacheln **Inklusion** und **Kleider Café** noch auf
`/engagiert-leben/` (im WP-Original ebenso), **Sozialberatung** auf einen `mailto:`. Eigene
Astro-Unterseiten dafür gibt es noch nicht — beim Portfolio-Check vor Go-Live abgleichen.
