# 02 · WordPress-Zugang und Bearbeitungstechnik

## Anmeldung

- **Admin:** https://www.sanktbonifatius.de/wp-admin/
  - Seit dem Go-Live (19.06.2026) gibt es **nur noch den Live-Server www**; es wird direkt auf www gearbeitet. Der frühere Dev-Server (`dev.sanktbonifatius.de`) ist stillgelegt und ohne Funktion.
  - Der Go-Live war ein vollständiger **UpdraftPlus-Klon dev→www** (Datenbank + Uploads + Theme-Dateien). Daher sind Post-IDs und Benutzerkonten identisch geblieben.
- **Benutzer:** Werner (eingeschränkte Rechte — **kein Super-Admin**)
- **Anwendungspasswort (WordPress Application Password):**
  - Benutzer: `Werner`
  - **Das Passwort steht NICHT im Handbuch.** Es liegt lokal in der Datei
    `~/.config/sb-wp/wp_pass` — bewusst **außerhalb** des iCloud-synchronisierten
    `Documents`-Ordners, mit Rechten `chmod 600` (nur der eigene Nutzer kann lesen).
  - Vor REST-/curl-Arbeit einmal pro Terminal-Sitzung laden (gibt das Passwort **nicht** aus):
    ```bash
    export WP_USER="Werner"
    export WP_PASS="$(cat ~/.config/sb-wp/wp_pass)"
    ```
  - Verwendung: HTTP Basic Auth — **immer nur die Variablen** verwenden, das Passwort
    nie wörtlich in einen Befehl schreiben (sonst landet es über die „immer erlauben"-
    Funktion in `.claude/settings.local.json`):
    ```bash
    curl -u "$WP_USER:$WP_PASS" \
      "https://www.sanktbonifatius.de/wp-json/wp/v2/pages/POST_ID?context=edit&_fields=content"
    ```
  - Passwort ändern / Datei neu anlegen:
    ```bash
    mkdir -p ~/.config/sb-wp
    printf '%s\n' 'NEUES ANWENDUNGSPASSWORT' > ~/.config/sb-wp/wp_pass
    chmod 600 ~/.config/sb-wp/wp_pass
    ```
- **Theme:** „Sankt Bonifatius" (Child-Theme von „Ursprung")
  - Theme-Slug: `ursprung-bonifatius`
  - Theme-Editor: `theme-editor.php?file=functions.php&theme=ursprung-bonifatius`

## Rechte-Einschränkungen

| Bereich | Zugriff |
|---|---|
| Seiten (Pages) | ✅ Voller Zugriff |
| Beiträge (Posts) | ✅ Voller Zugriff |
| Medien-Upload | ✅ Ja |
| Gutenberg-Editor | ✅ Ja |
| **Plugin-Verwaltung** | ❌ gesperrt |
| **Plugin-Editor** | ❌ gesperrt |
| **Theme-Editor (functions.php)** | ✅ zugänglich (Hauptweg für PHP) |
| Settings/Benutzer | ❌ gesperrt |

---

## Empfohlener Workflow (mit Claude)

### Primärmethode: Direkte REST-API-Bearbeitung

**Voraussetzung:** Chrome-Tab muss auf einer WP-Admin-URL sein (`/wp-admin/post.php?post=POST_ID&action=edit`). Nur dort ist `wp.apiFetch` verfügbar.

**Vorteil:** Kein Copy-Paste, Claude schreibt Inhalte direkt in die Datenbank.

```javascript
// 1. Content laden
wp.apiFetch({path:'/wp/v2/pages/POST_ID?context=edit&_fields=content'})
  .then(r => { window._c = r.content.raw; console.log('len:', r.content.raw.length); });

// 2. Änderungen vornehmen (String-Operationen auf window._c)
window._cNew = window._c.replace('ALT', 'NEU');

// 3. Speichern
wp.apiFetch({
  path:'/wp/v2/pages/POST_ID',
  method:'POST',
  data:{content: window._cNew, status:'publish'}
}).then(r => console.log('SAVED', r.content.raw.length));

// Parallel mehrere Seiten speichern:
Promise.all([45281, 45176, 45633].map(id =>
  wp.apiFetch({
    path:'/wp/v2/pages/'+id,
    method:'POST',
    data:{content: /*...*/, status:'publish'}
  })
));
```

### Neue Seite anlegen (als Draft)

```javascript
wp.apiFetch({
  path:'/wp/v2/pages',
  method:'POST',
  data:{
    title: 'Meine neue Seite',
    slug: 'meine-neue-seite',
    status: 'draft',
    parent: 46786,         // optional: Parent-Page (z. B. „Über uns" 46786)
    content: window._neuerContent
  }
}).then(r => ({id: r.id, slug: r.slug, link: r.link}));
```

### Medien suchen

`?search=` funktioniert oft nicht, aber `?slug=` zuverlässig:

```javascript
// Einzelnes Bild per Slug
wp.apiFetch({path:'/wp/v2/media?slug=bonfamily-auswahl-5&_fields=id,slug,source_url'})

// Mehrere Bilder einer Serie
Promise.all(Array.from({length:12}, (_,i) => 'bonfamily-auswahl-'+(i+1)).map(s =>
  wp.apiFetch({path:'/wp/v2/media?slug='+s+'&_fields=id,slug,source_url,media_details'})
));

// Media einer Seite (wenn als Attachment verknüpft)
wp.apiFetch({path:'/wp/v2/media?parent=18423&_fields=id,slug,source_url'})
```

---

## Fallstricke (kritisch!)

### 1. `&&` in Script-Inhalten → BROKEN
WordPress encodet `&` zu `&#038;`. In JavaScript-Strings innerhalb von `<script>`-Tags führt das zu Syntax-Fehlern.

**Lösung:** `String.fromCharCode(38)` statt `&`.

```javascript
// Original-VT-Script nutzt diesen Workaround:
fetch('/wp-json/wp/v2/event?per_page=30'+String.fromCharCode(38)+'_embed')
```

### 2. `font-family:'Inter'` mit Quotes → BROKEN
Einfache Quotes brechen JS-Strings. **Lösung:** `font-family:Inter` ohne Quotes.

### 3. `String.replace()` ohne `/g` → nur erstes Vorkommen
Kontext per `indexOf` prüfen, bevor man ersetzt.

### 4. `wp.apiFetch` nur im Admin-Tab
Auf der Live-Seite ist es nicht verfügbar. Zum Speichern immer im Admin-Tab bleiben.

### 5. `#ursprung_hide_page_title` NICHT per REST
Die Meta-Checkbox „Seitentitel ausblenden" ist nicht als `show_in_rest: true` registriert.

**Für bh3a-Seiten (seit 26.05.2026):** Nicht mehr nötig — `h1.us_title { display:none!important }` gilt global in `style.css` für alle Seiten.

**Für klassische Seiten** (ohne bh3a-Nav): CSS im Content verwenden:
```css
.page-id-45176 h1.us_title { display:none !important; }
```

Nach jedem Gutenberg-Speichern prüfen, ob die Checkbox noch aktiv ist.

> **✅ Gegenstück — SEO-Titel & Meta-Description GEHEN per REST (SEOPress).**
> Anders als bei der WhatsApp-Seite (`functions.php`-Lösung) ist für SEO-Titel und
> Meta-Description **kein** `functions.php`-Eingriff nötig: Die Website nutzt das Plugin
> **SEOPress**, dessen Felder als `meta` per REST setzbar sind:
> ```javascript
> wp.apiFetch({
>   path: '/wp/v2/pages/POST_ID',
>   method: 'POST',
>   data: { meta: {
>     _seopress_titles_title: 'Seiten-Titel – St. Bonifatius Frankfurt',
>     _seopress_titles_desc:  'Eigene Meta-Description, 150–160 Zeichen.'
>   }}
> });
> ```
> Per curl analog mit `-u "$WP_USER:$WP_PASS"` und JSON-Body `{"meta":{…}}`.
> `og:title`/`og:description` übernimmt SEOPress automatisch aus diesen Feldern
> (Social-Bild separat: `_seopress_social_fb_img`). Bewährt 22.06.2026 an Seite 48312.

### 6. Draft-Preview-URL
Entwürfe sind für Nicht-Eingeloggte nur sichtbar via:
```
https://www.sanktbonifatius.de/?page_id=POST_ID&preview=true
```
(Seit dem Go-Live sind alle bestehenden Seiten auf `publish` — relevant also nur noch für künftige neue Entwürfe.)

### 7. Medien-Suche schlägt fehl mit „Seitennummer zu groß"
```
wp.apiFetch({path:'/wp/v2/media?search=bonfamily'})  // ❌ liefert oft Fehler
wp.apiFetch({path:'/wp/v2/media?slug=bonfamily-auswahl-5'})  // ✅ zuverlässig
```

---

## Chrome-Filter (Ausgaben werden blockiert)

Claude-in-Chrome blockt Ausgaben, die **URLs oder Query-Strings** enthalten (`?foo=bar`, `https://...`). Das macht das Debuggen schwer.

**Workarounds:**
- Nur Positionen und Längen zurückgeben (`.length`, `.indexOf()`)
- Tags/Klassen-Namen extrahieren, aber nicht deren Werte mit URLs
- Inhalte in `window.*` zwischenspeichern und dort manipulieren — nicht zurück in den Chat geben
- Zum Download-in-Datei: `URL.createObjectURL(blob)` + programmatischer Klick — dann aus `~/Downloads/` lesen

Details in 06-technische-loesungen.md.

---

## Notfall: Speichern über CodeMirror (functions.php)

Falls REST-API nicht geht (z.B. für PHP):

```javascript
const cm = document.querySelector('.CodeMirror').CodeMirror;
cm.setValue(neuerPhpCode);
// Textarea via nativeSetter syncen
const ta = document.querySelector('textarea[name="newcontent"]');
const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
nativeSetter.call(ta, neuerPhpCode);
ta.dispatchEvent(new Event('input', {bubbles:true}));
// Speichern via fetch mit FormData (NICHT form.submit() - blockiert durch gleichnamiges Element)
const fd = new FormData();
fd.append('action', 'update');
fd.append('file', 'functions.php');
fd.append('theme', 'ursprung-bonifatius');
fd.append('nonce', document.querySelector('#nonce').value);
fd.append('_wp_http_referer', location.pathname + location.search);
fd.append('newcontent', neuerPhpCode);
fetch('/wp-admin/theme-editor.php', {method:'POST', body:fd, credentials:'include'});
// Nach Speichern: Seite neu laden und content.includes() zur Verifikation
```

## Navigation (falls beforeunload blockiert)
```javascript
window.onbeforeunload = null;
window.location.href = '/wp-admin/post.php?post=45898&action=edit';
// Notfall: mcp__Claude_in_Chrome__tabs_create_mcp öffnet neuen Tab
```
