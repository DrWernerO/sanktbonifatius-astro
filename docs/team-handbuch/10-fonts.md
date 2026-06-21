# 10 · Schriften (Fonts) und Datenschutz

**Stand:** 26. Mai 2026 · Variante C Hybrid, zentral in `style.css`
**Verantwortung:** Werner Otto + Claude (Anthropic)
**Status:** Seit Go-Live (19.06.2026) produktiv auf **www** (Live). Geltungsbereich: **alle bh3a-Seiten automatisch** via `body:has(.bh3a-hdr)`. Klassische Alt-Seiten ohne bh3a-Nav nutzen weiterhin den Theme-Default (Futura LT).

---

## 1. Zusammenfassung in einem Satz

Alle bh3a-Redesign-Seiten nutzen **Georgia** für Überschriften, **Futura LT** für Brand-Akzente (Eyebrows, Buttons, Lead-Texte) und **Source Sans 3** fürs Body — DSGVO-konform über Bunny Fonts, zentral gesteuert über *einen* CSS-Block in der `style.css` des Child-Themes `ursprung-bonifatius`. Neue Seiten bekommen die Schriften **automatisch**, sobald sie `body:has(.bh3a-hdr)` erfüllen — keine manuelle Pflege von Seiten-IDs nötig.

---

## 2. Schrift-Zuordnung („Variante C Hybrid")

| Element | Schrift | Quelle | Charakter |
|---|---|---|---|
| **Headings** H1–H6 | **Georgia, serif** | System-Schrift | warm, robust, Renaissance, auf jedem Gerät installiert |
| **Section-H2** (Größe) | 40px Desktop / 30px Mobile | — | außer Kalender-Headlines `.bh2-vt__hl` (bleiben klein) |
| **Eyebrows / Badges** | **'Futura LT', 'Futura', 'Jost', sans-serif** | Theme + Fallback | Bauhaus, ALL CAPS, Letter-Spacing 0.12em, Pfarrei-Brand |
| **Buttons / CTAs** | 'Futura LT', sans-serif | Theme | Letter-Spacing 0.02em |
| **Lead-Texte** (Hero-Intro, Section-Intro) | 'Futura LT', sans-serif | Theme | für kurze, markante Statement-Texte |
| **Body / Fließtext** | **'Source Sans 3', system-ui, sans-serif** | Bunny Fonts | humanistisch, bildschirmoptimiert, lese-freundlich |

**Designprinzip:** Drei klar getrennte Welten — Renaissance-Serif für Headings, Bauhaus-Sans für Brand-Akzente, humanistische Sans für lange Texte. Das Pattern stammt aus moderner Editorial-Typografie (NYT, Atlantic, Süddeutsche).

---

## 3. Wo das CSS liegt (zentrale Quelle)

**Datei:** `/wp-content/themes/ursprung-bonifatius/style.css` (Child-Theme)
**Zugriff:** WP-Admin → Design → Theme-Editor → `ursprung-bonifatius` → `style.css`
**Position:** Ganz am Ende der Datei, eingerahmt von Kommentar-Markern.

### Anker-Marker (zum Wiederfinden)

```css
/* === START PFARREI-FONTS === */
   …gesamter Block…
/* === END PFARREI-FONTS === */
```

### Vollständiger CSS-Block (aktueller Stand)

```css
/* === START PFARREI-FONTS === */
@import url('https://fonts.bunny.net/css?family=Source+Sans+3:400,500,600,400i,500i');

/* Headings: Georgia */
body:has(.bh3a-hdr) h1,body:has(.bh3a-hdr) h2,body:has(.bh3a-hdr) h3,
body:has(.bh3a-hdr) h4,body:has(.bh3a-hdr) h5,body:has(.bh3a-hdr) h6
{font-family:Georgia,serif!important;font-weight:700!important;letter-spacing:0!important}

/* H2-Größe: 40px Desktop, 30px Mobil */
body:has(.bh3a-hdr) h2:not(.bh2-vt__hl):not(.us_title)
{font-size:40px!important;line-height:1.15!important;letter-spacing:-.01em!important}
@media(max-width:760px){
  body:has(.bh3a-hdr) h2:not(.bh2-vt__hl):not(.us_title){font-size:30px!important}
}

/* Eyebrows + Badges: Futura LT */
body:has(.bh3a-hdr) [class*="eyebrow"],
body:has(.bh3a-hdr) [class*="badge"]
{font-family:'Futura LT','Futura','Jost',system-ui,sans-serif!important;
 font-style:normal!important;font-weight:500!important;
 text-transform:uppercase!important;letter-spacing:.12em!important}

/* Buttons + CTAs: Futura LT */
body:has(.bh3a-hdr) .w-btn,body:has(.bh3a-hdr) .wp-block-button__link,
body:has(.bh3a-hdr) .bh3a-btn,body:has(.bh3a-hdr) .bf-btn,
body:has(.bh3a-hdr) .bh2-vt__more,body:has(.bh3a-hdr) .bh2-vt-card__cta,
body:has(.bh3a-hdr) .bh2-vt-list-item__cta
{font-family:'Futura LT','Futura','Jost',system-ui,sans-serif!important;letter-spacing:.02em!important}

/* Hero-Untertitel: Futura LT */
body:has(.bh3a-hdr) .el-welcome p,body:has(.bh3a-hdr) p.el-sh-sub,
body:has(.bh3a-hdr) [class*="hero-sub"],body:has(.bh3a-hdr) [class*="hero__sub"]
{font-family:'Futura LT','Futura','Jost',system-ui,sans-serif!important;letter-spacing:.01em!important}

/* Fließtext: Source Sans 3 */
body:has(.bh3a-hdr) .l-canvas,body:has(.bh3a-hdr) .frame-content,
body:has(.bh3a-hdr) .frame-content p,body:has(.bh3a-hdr) .frame-content li,
body:has(.bh3a-hdr) .bf-text,body:has(.bh3a-hdr) .w-text,body:has(.bh3a-hdr) .bf-faq-a
{font-family:'Source Sans 3',system-ui,-apple-system,Segoe UI,Roboto,sans-serif!important}
/* === END PFARREI-FONTS === */
```

**Hinweise zur Technik:**
- `body:has(.bh3a-hdr)` trifft jede Seite, die den bh3a-Navigationsbalken enthält — automatisch, ohne Aufzählung von Seiten-IDs.
- Gilt für Draft- **und** Live-Seiten, sobald sie das bh3a-Layout haben. Klassische Seiten ohne `.bh3a-hdr` bleiben unberührt (Theme-Default Futura LT).
- `@import` nur für Source Sans 3 (Bunny Fonts) — Futura LT lädt das Theme global, Georgia ist System-Font.

---

## 4. Geltungsbereich

Die Schrift-Regeln gelten **automatisch für jede Seite mit `.bh3a-hdr`** im Inhalt — egal ob Draft oder Live, egal welche Page-ID. Eine Pflege einer Seiten-ID-Liste ist nicht mehr nötig.

Klassische Seiten ohne bh3a-Navigation (alter Theme-Header, Live-Seiten vor Umstellung) sind **nicht betroffen** und behalten Theme-Default (Futura LT / Cormorant Garant-Fallback).

---

## 5. Backup vor Eingriff

**Datei:** `style-css-backup-2026-05-16.css`
**Speicherort (initial):** `~/Downloads/`
**Größe:** 121.518 Zeichen
**Zustand:** Unveränderte `style.css` des Child-Themes **vor** dem PFARREI-FONTS-Block

Empfehlung: Datei in `/Users/wernerotto/Library/Mobile Documents/com~apple~CloudDocs/Claude/Code/` verschieben für sichere Langzeit-Archivierung (Downloads kann gelegentlich ausgeräumt werden).

---

## 6. Workflow für neue Seiten

**Keine manuelle Pflege nötig.** Jede neue Seite, die den bh3a-Nav-Block enthält (`<div class="bh3a-hdr">`), erhält die Schriften automatisch — der `body:has(.bh3a-hdr)`-Selektor greift ohne weiteren Eingriff.

Checkliste beim Erstellen einer neuen bh3a-Seite:
1. Seite als Draft anlegen (via Klonen von home6 oder einer bestehenden bh3a-Seite)
2. Vorschau im Inkognito-Tab prüfen: `?page_id=NEUE_ID&preview=true`
3. Headings in Georgia? Body in Source Sans 3? → fertig.

### Seiten ohne bh3a-Nav
Falls eine Seite die Schriften **nicht** bekommen soll (z. B. reine Archivseiten), einfach keinen bh3a-Nav-Block einfügen. Der CSS-Selektor greift dann nicht.

---

## 7. Rückgängig machen (Reversal)

### Komplett (alle bh3a-Seiten gleichzeitig)
1. WP-Admin → Design → Theme-Editor → `style.css`
2. Cmd+F → `=== START PFARREI-FONTS`
3. Den **gesamten Block** bis einschließlich `=== END PFARREI-FONTS ===` markieren und löschen
4. „Datei aktualisieren"

→ Alle bh3a-Seiten fallen sofort auf Theme-Default zurück (Futura LT Body, Cormorant Garant → Georgia Fallback als Heading).

### Notfall: Backup wiederherstellen
1. Backup-Datei (`style-css-backup-2026-05-16.css`) im Editor öffnen, Inhalt kopieren
2. WP-Admin → Theme-Editor → `style.css` öffnen
3. Vorhandenen Inhalt komplett ersetzen mit Backup-Inhalt
4. „Datei aktualisieren"

### Einzelne Seite ausschließen
Für eine einzelne Seite ohne Redesign-Schriften: entweder den bh3a-Nav-Block nicht einbetten, oder eine seitenspezifische Überschreibungsregel in `style.css` ergänzen:
```css
.page-id-XXXXX h1, .page-id-XXXXX h2 { font-family: inherit !important; }
```

---

## 8. Datenschutz-Status (DSGVO)

| Quelle | Status |
|---|---|
| **Georgia** | System-Schrift, keine externe Verbindung ✅ |
| **Futura LT** | Vom Theme selbst gehostet (siehe `@font-face` in `style.css`, `assets/fonts/...`) ✅ |
| **Source Sans 3** | Über Bunny Fonts (`fonts.bunny.net`, EU-Server, keine IP-Logs) ✅ |
| **Google Fonts CDN** | KEIN direkter Aufruf — würde gegen DSGVO verstoßen (LG München I, 20.01.2022) |

### Externer Check
- [webbkoll.dataskydd.net](https://webbkoll.dataskydd.net/) → URL eingeben → keine Anfragen an `fonts.googleapis.com` / `fonts.gstatic.com` erwartet
- Chrome DevTools → Network → Filter „font" → nur `fonts.bunny.net` + eigene Domain erlaubt

### Pflicht: Datenschutzerklärung ergänzen
Vor dem Go-Live der Redesign-Drafts auf der Live-Seite (`/datenschutz/`):

> **Schriftarten:** Diese Website nutzt die Schriftart *Georgia* (System-Schrift), *Futura LT* (lokal von unserem Server ausgeliefert) und *Source Sans 3* (über den europäischen Dienst Bunny Fonts, fonts.bunny.net). Es findet keine Verbindung zu Google-Servern statt; IP-Adressen werden nicht an Google übertragen.

### Stufe 2 (optional, später): Selbst-Hosting von Source Sans 3
Wer Bunny Fonts nicht akzeptiert (strenge DSGVO-Auslegung), kann Source Sans 3 lokal hosten:
1. functions.php-Snippet einfügen (siehe Abschnitt 9), um WOFF/WOFF2-Upload zu erlauben
2. Source Sans 3 von [gwfh.mranftl.com/fonts](https://gwfh.mranftl.com/fonts) herunterladen (Charset: Latin Extended; Weights: 400, 500, 600 normal + italic)
3. Per Media Library hochladen, URLs notieren
4. Im PFARREI-FONTS-Block den `@import`-Aufruf durch lokale `@font-face`-Definitionen ersetzen
5. webbkoll-Check: 0 externe Requests

---

## 9. Technische Anhang

### functions.php-Snippet für späteres Selbst-Hosting

```php
// === Pfarrei-Fonts: WOFF/WOFF2-Upload erlauben (für Selbst-Hosting) ===
add_filter('upload_mimes', function ($mimes) {
    $mimes['woff']  = 'font/woff';
    $mimes['woff2'] = 'font/woff2';
    return $mimes;
});
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {
    if (preg_match('/\.(woff2?)$/i', $filename)) {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return ['ext' => $ext, 'type' => "font/$ext", 'proper_filename' => $filename];
    }
    return $data;
}, 10, 4);
```

### Lokale `@font-face` Vorlage (nach Selbst-Hosting)

```css
@font-face {
  font-family: 'Source Sans 3';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/wp-content/uploads/fonts/source-sans-3-v15-latin-regular.woff2') format('woff2');
}
/* analog für 500, 600, italic */
```

---

## 10. Was NICHT (mehr) zu tun ist

- ❌ **Keine Inline-`<style>`-Blöcke mehr in einzelne Pages einbauen.** Die zentrale `style.css` ist die einzige Schrift-Quelle. Seitenindividuelle Font-Regeln verursachen inkonsistente Ergebnisse.
- ❌ **Keine Seiten-IDs mehr in den PFARREI-FONTS-Block eintragen.** Seit 26.05.2026 gilt `body:has(.bh3a-hdr)` global — das Hinzufügen einzelner IDs ist überflüssig und fehleranfällig.
- ❌ **Keine direkten Google-Fonts-Aufrufe** (`fonts.googleapis.com`, `fonts.gstatic.com`) — verstößt gegen DSGVO.
- ❌ **Keine neuen Schriftarten** einführen ohne Eintrag in dieser Datei + Backup der `style.css`.
- ❌ **Keine `<!-- wp:html -->`-Marker** in den Custom-HTML-Block der Page bonfamily2 (Post 45898) einfügen — bricht den Block (siehe `bonfamily2-handoff.md`).
- ❌ **Keine Theme-`@font-face`-Definitionen anfassen** (die existierenden `Futura LT` Definitionen in `style.css` brauchen die Live-Seiten).

---

## 11. Historie / Entscheidungsweg

Kurzfassung, falls jemand später nachvollziehen will, warum die Wahl auf Variante C fiel:

1. **Ist-Zustand vor Mai 2026:** Cormorant Garant (= Georgia-Fallback, da Cormorant nicht geladen) + Futura LT, alles über Bunny/Theme.
2. **Test Variante A** (alles Futura LT) — zu kühl für lange Texte, abgelehnt.
3. **Test Variante B** (EB Garamond + Source Sans 3) — schöne harmonische Paarung, aber Pfarrer fand EB Garamond „zu dünn / Skelett". Verworfen.
4. **Test Variante C / Hybrid** (Georgia für H1–H6, Futura LT für Eyebrows/Buttons/Lead, Source Sans 3 für Body) — Konsens mit `/ui-ux-pro-max` Empfehlung. Behält Pfarrei-Brand-Charakter UND optimiert Lesbarkeit. Übernommen.
5. **Umstellung 16.05.2026:** Inline-Versuche auf 46764 + 46769 entfernt; zentrale `style.css` als Quelle eingerichtet; 28 Drafts erfasst.
6. **Konsolidierung 26.05.2026:** Alle 28 Seiten-IDs aus dem PFARREI-FONTS-Block entfernt. Ersetzt durch einzeiligen `body:has(.bh3a-hdr)`-Selektor. Der Block schrumpfte von ~32 KB auf ~15 Zeilen. Neue Seiten bekommen die Schriften automatisch, ohne Handbuchpflege.

Wichtige Erkenntnis aus dem Weg: **„Cormorant Garamond" hieß im Theme `'Cormorant Garant'` (Tippfehler) und wurde nie geladen.** Was visuell gut aussah, war die ganze Zeit Georgia als Fallback. → Bewusst auf Georgia umgestiegen, weil System-Schrift, robuster, DSGVO-trivial.
