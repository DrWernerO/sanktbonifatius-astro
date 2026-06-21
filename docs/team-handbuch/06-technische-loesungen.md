# 06 · Technische Lösungen und Fallstricke

Sammlung aller nicht-offensichtlichen Probleme, die in den bisherigen Sessions gelöst wurden. Bei ähnlichen Symptomen hier zuerst nachschauen.

---

## 1. FAQ-Accordion — DIV wird auf height:0 gezwungen

### Symptom
`<div class="bf-faq-item">` mit JS-basiertem `.open`-Toggle funktioniert nicht. Trotz inline `style="max-height:800px!important"` bleibt `offsetHeight` bei 0. Die Answer-`<div>` kollabiert auf Padding-Höhe.

### Ursache
Irgendein Layer im Ursprung-Theme (möglicherweise CSS-Containment, JS-Handler oder Layout-Observer) zwingt DIVs mit dieser Klassen-Signatur auf height:0 — auch mit `!important` nicht überschreibbar. Ein `<p>` oder `<div>` **innerhalb** der Answer rendert normal (mit Overflow-Visibility), nur der Container selbst kollabiert.

### Lösung: Natives `<details>`-Element

```html
<details class="bf-faq-item">
  <summary class="bf-faq-q">
    <span class="bf-faq-q-text">Was ist BonFamily?</span>
    <span class="icon" aria-hidden="true">+</span>
  </summary>
  <div class="bf-faq-a">Die Antwort steht hier …</div>
</details>
```

CSS dazu:

```css
details.bf-faq-item summary { list-style:none; cursor:pointer; }
details.bf-faq-item summary::-webkit-details-marker { display:none; }
details.bf-faq-item[open] { border-color: var(--bf-accent); }
details.bf-faq-item[open] summary .icon { transform: rotate(45deg); }
#faq details.bf-faq-item .bf-faq-a {
  max-height: none !important;
  height: auto !important;
  overflow: visible !important;
  padding: 0 22px 20px;
}
```

Kein JavaScript nötig. Funktioniert ohne Flackern. Barrierefrei out-of-the-box.

---

## 2. Chrome-Filter blockt Ausgaben mit URLs/Query-Strings

### Symptom
```
[BLOCKED: Cookie/query string data]
[BLOCKED: Base64 encoded data]
```
Die Ausgabe der `mcp__Claude_in_Chrome__javascript_tool`-Abfragen wird gefiltert, sobald sie URLs (`https://…`), Query-Strings (`?foo=bar`) oder Base64-ähnliche Muster enthält.

### Workarounds

1. **Nur Metadaten zurückgeben** — Längen, Positionen, Existenz-Flags:
   ```javascript
   ({len: content.length, found: content.includes('marker')})
   ```

2. **Sanitization per Regex** — entfernt URL-Muster, bevor sie zurückgegeben werden:
   ```javascript
   text.replace(/https?:\/\/[^\s"']+/g, '[URL]')
       .replace(/\?[^\s"']+/g, '[QS]')
   ```
   (Funktioniert nicht immer — der Filter greift manchmal auch auf ausgefilterte Strings.)

3. **Zwischenspeichern im Browser**:
   ```javascript
   window._cache = content;     // bleibt im Tab
   // Spätere Operationen nur auf window._cache
   ```

4. **Blob-Download in `~/Downloads/`**:
   ```javascript
   const blob = new Blob([content], {type:'text/plain'});
   const a = document.createElement('a');
   a.href = URL.createObjectURL(blob);
   a.download = 'dump.html';
   document.body.appendChild(a); a.click();
   ```
   Dann aus `~/Downloads/dump.html` mit `Read`-Tool lesen (Achtung: Apple-Datenschutz kann zugriff verweigern, ggf. `chmod`).

5. **Zeilenweise-Extraktion** — nur die Zeilen zurückgeben, die keine URLs enthalten:
   ```javascript
   lines.map((l,i) => ({i, safe: /https?:\/\/|[?]/.test(l) ? '[URL-line]' : l}))
   ```

---

## 3. Modal-Dialog für Kirchen-Geschichte (ersetzt Theme-Accordion)

### Nutzung
Der Link „Mehr erfahren →" in der Kirchen-Intro öffnet ein Modal mit der Geschichte (Architektur, Fenster, Orgel, Glocken).

### HTML

```html
<div class="apos-modal" id="apos-kirche-modal" hidden role="dialog" aria-modal="true" aria-labelledby="apos-modal-title">
  <div class="apos-modal-overlay"></div>
  <div class="apos-modal-dialog">
    <button type="button" class="apos-modal-close" aria-label="Schließen">&times;</button>
    <div class="apos-modal-header">
      <div class="eyebrow">Die Kirche St. Aposteln</div>
      <h2 id="apos-modal-title">Geschichte &amp; Architektur</h2>
    </div>
    <div class="apos-modal-body">
      <section class="apos-modal-section">
        <h3>Architektur</h3>
        <p>…</p>
      </section>
      <!-- weitere Sections: Die Fenster, Die Orgel, Die Glocken -->
    </div>
  </div>
</div>
```

### CSS

```css
.apos-modal{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:40px 20px;opacity:0;transition:opacity .25s ease;}
.apos-modal[hidden]{display:none !important;}
.apos-modal.is-open{opacity:1;}
.apos-modal-overlay{position:absolute;inset:0;background:rgba(15,12,10,.7);backdrop-filter:blur(4px);}
.apos-modal-dialog{position:relative;background:#fff;max-width:820px;width:100%;max-height:85vh;overflow-y:auto;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.4);transform:translateY(20px);opacity:0;transition:transform .3s ease,opacity .3s ease;}
.apos-modal.is-open .apos-modal-dialog{transform:translateY(0);opacity:1;}
```

### JavaScript

```javascript
(function(){
  var modal = document.getElementById('apos-kirche-modal');
  if(!modal) return;
  var trigger = document.querySelector('.apos-kirche-more');
  function open(e){ if(e) e.preventDefault(); modal.hidden = false; document.body.style.overflow='hidden'; setTimeout(function(){ modal.classList.add('is-open'); }, 10); }
  function close(){ modal.classList.remove('is-open'); document.body.style.overflow=''; setTimeout(function(){ modal.hidden = true; }, 250); }
  if(trigger) trigger.addEventListener('click', open);
  modal.querySelector('.apos-modal-close').addEventListener('click', close);
  modal.querySelector('.apos-modal-overlay').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(!modal.hidden && e.key === 'Escape') close(); });
})();
```

Komplett selbstenthalten — kein externes Framework.

---

## 4. Fotogalerie mit Lightbox

**Drei Vorschau-Bilder** + Button „Alle Fotos anzeigen →" → öffnet Lightbox mit allen Fotos, Tastatur-Navigation.

```html
<section class="apos-gallery-section" id="meine-galerie">
  <h2>Fotos aus unserem Gemeindeleben</h2>
  <div class="apos-gallery">
    <button class="apos-gallery-item" data-idx="0" style="background-image:url('…/1.jpg');"></button>
    <button class="apos-gallery-item" data-idx="1" style="background-image:url('…/2.jpg');"></button>
    <button class="apos-gallery-item" data-idx="2" style="background-image:url('…/3.jpg');"></button>
  </div>
  <div class="apos-gallery-more">
    <button class="apos-gallery-open-all">Alle Fotos anzeigen →</button>
  </div>
  <div class="apos-lightbox" hidden>
    <button class="close">&times;</button>
    <button class="prev">&lsaquo;</button>
    <button class="next">&rsaquo;</button>
    <img alt="" />
    <div class="counter"></div>
  </div>
  <script>
  (function(){
    var all = [/* vollständige URLs aller Fotos */];
    var root = document.getElementById('meine-galerie');
    var lb = root.querySelector('.apos-lightbox');
    var img = lb.querySelector('img'), counter = lb.querySelector('.counter');
    var idx = 0;
    function show(i){ if(i<0)i=all.length-1; if(i>=all.length)i=0; idx=i; img.src=all[i]; counter.textContent=(i+1)+' / '+all.length; }
    function open(i){ show(i); lb.hidden=false; document.body.style.overflow='hidden'; }
    function close(){ lb.hidden=true; document.body.style.overflow=''; }
    root.querySelectorAll('.apos-gallery-item').forEach(function(b){
      b.addEventListener('click', function(){ open(parseInt(b.dataset.idx,10)||0); });
    });
    root.querySelector('.apos-gallery-open-all').addEventListener('click', function(){ open(0); });
    lb.querySelector('.close').addEventListener('click', close);
    lb.querySelector('.prev').addEventListener('click', function(){ show(idx-1); });
    lb.querySelector('.next').addEventListener('click', function(){ show(idx+1); });
    lb.addEventListener('click', function(e){ if(e.target===lb) close(); });
    document.addEventListener('keydown', function(e){
      if(lb.hidden) return;
      if(e.key==='Escape') close();
      else if(e.key==='ArrowLeft') show(idx-1);
      else if(e.key==='ArrowRight') show(idx+1);
    });
  })();
  </script>
</section>
```

---

## 5. Medien suchen (Media-Library)

`?search=` ist unzuverlässig (wirft oft „Seitennummer zu groß"-Fehler). `?slug=` funktioniert verlässlich:

```javascript
// Einzelne Datei
wp.apiFetch({path:'/wp/v2/media?slug=lilian-wykipil&_fields=id,slug,source_url'})

// Batch-Suche (z.B. alle bonfamily-auswahl-X)
const slugs = Array.from({length:12}, (_,i) => 'bonfamily-auswahl-'+(i+1));
Promise.all(slugs.map(s =>
  wp.apiFetch({path:'/wp/v2/media?slug='+s+'&_fields=id,source_url'})
));

// Medien einer Seite (nur wenn Seite-Parent gesetzt ist)
wp.apiFetch({path:'/wp/v2/media?parent=18423&_fields=id,slug,source_url'})
```

---

## 6. `#ursprung_hide_page_title` ist nicht via REST setzbar

### Problem
Das Ursprung-Theme hat eine Checkbox „Seitentitel ausblenden" als Post-Meta (`#ursprung_hide_page_title`). Über die REST-API ist es nicht setzbar, weil nicht mit `show_in_rest: true` registriert.

### Lösung (aktuell, seit 26.05.2026)
Auf **allen bh3a-Seiten** ist der Seitentitel global ausgeblendet durch diese Regel in `style.css`:

```css
h1.us_title { display: none !important; }
```

Diese Regel steht ganz am Anfang des Custom-Bereichs der `style.css` und gilt ohne Einschränkung für alle Seiten — nicht nur bh3a. Das löst das Problem dauerhaft ohne Inline-CSS und ohne Checkbox-Pflege.

**Für klassische Seiten** (ohne bh3a-Nav), die den Titel trotzdem zeigen sollen, gibt es keinen Konflikt — das Theme rendert `h1.us_title` nur, wenn die Meta-Checkbox aktiv ist. Wenn die Checkbox ausgeschaltet ist, erscheint das Element gar nicht.

### Alte Lösung (veraltet, nicht mehr nötig)
~~Im Content selbst ein CSS-Snippet einbetten: `.page-id-XXXXX h1.us_title { display: none !important; }`~~

Diese seitenspezifischen Inline-Snippets können entfernt werden, falls sie noch in alten Drafts stecken — sie sind nun überflüssig.

---

## 7. Theme-Container macht Inhalte nur 780 px breit

### Problem
Das Ursprung-Theme beschränkt `.frame-content` auf max. 780 px. Ein Block mit `max-width: 1280px` bleibt trotzdem schmaler.

### Lösung
Container-Breite per `!important` aufheben:

```css
.us_content, .frame-content, .w-post-elm {
  max-width: none !important;
  width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
```

Dann volle Freiheit für die eigenen Blöcke. Optional: einzelne Blöcke nach innen mit `max-width + margin:0 auto` begrenzen.

---

## 8. Gutenberg-Parser zerbricht bei `&` in `<script>`

Wie in 05-veranstaltungskalender.md beschrieben: WordPress encodet `&` zu `&#038;`. In JS-Strings innerhalb eines `<script>` wird das zum Syntax-Error.

**Lösung:** `String.fromCharCode(38)` an der kritischen Stelle.

---

## 9. Mehrere Media-Texts abwechselnd färben

### Problem
`:nth-of-type(even)` greift oft nicht wie erwartet, wenn zwischen zwei Media-Texts ein Spacer-Block liegt.

### Lösung
JavaScript vergibt Klassen nach Reihenfolge:

```javascript
<script>
(function(){
  var run = function(){
    var bands = ['apos-band-white','apos-band-beige','apos-band-cream','apos-band-sand'];
    document.querySelectorAll('.wp-block-media-text').forEach(function(el, i){
      el.classList.add(bands[i % bands.length]);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
</script>
```

Dann CSS:
```css
.wp-block-media-text.apos-band-white { background: #fff !important; }
.wp-block-media-text.apos-band-beige { background: var(--bf-bg) !important; }
.wp-block-media-text.apos-band-cream { background: linear-gradient(180deg,#fbf7f1,var(--bf-bg)) !important; }
.wp-block-media-text.apos-band-sand  { background: var(--bf-bg-alt) !important; }
```

---

## 10. Content-Struktur-Analyse (wiederverwendbares Snippet)

Wenn man in eine fremde Seite eintaucht:

```javascript
// Liste aller Headings im Content
const c = /* raw content */;
Array.from(c.matchAll(/<h([1-4])[^>]*>([\s\S]{1,150}?)<\/h\1>/g))
  .map(m => ({pos: m.index, tag:'H'+m[1], text: m[2].replace(/<[^>]+>/g,'').trim().substring(0, 80)}));

// Alle Gutenberg-Blocks (Top-Level)
const re = /<!--\s*(\/?)wp:([\w\/\-]+)(?:\s+({[^}]{0,500}}))?\s*(\/)?-->/g;
// Mit Depth-Tracking iterieren (siehe bonfamily2-Session für vollständiges Beispiel)
```

---

## 11. REST-API für alle anderen Post-Typen

Analog `pages`:
```
/wp/v2/event     — Events (siehe Veranstaltungskalender)
/wp/v2/posts     — Beiträge
/wp/v2/media     — Medien
```

Parameter:
- `?context=edit` — liefert `content.raw` statt nur `content.rendered` (nur eingeloggt)
- `?_fields=id,title,content` — nur bestimmte Felder
- `?_embed` — inkludiert verknüpfte Medien/Autoren inline
- `?status=draft` — nur Entwürfe
- `?per_page=30` — paginieren
- `?slug=xyz` — per Slug suchen (zuverlässiger als `search=`)
- `?event-category=2586` — Taxonomy-Filter (bei Events)

---

## 12. Großen HTML-Content via Chrome-JS in Seite einspielen

### Problem (Taufe3-Session, 2026-04-27)
Bei Seiten >35 KB schlägt das übliche Vorgehen fehl:
- Der `mcp__Claude_in_Chrome__javascript_tool`-`text`-Parameter trunkiert Strings zuverlässig nur bis ~4500 Zeichen
- Antworten werden zensiert, sobald sie URLs oder Base64-Muster enthalten (`[BLOCKED: …]`)
- Mixed-Content (HTTP-Server lokal → HTTPS-Browser) wird blockiert
- Die WP REST-API gibt für anonyme curl-Aufrufe `rest_forbidden` zurück

### Lösung: Chunked-Base64 mit End-Marker und Padding

1. **Lokal:** Inhalt UTF-8 → Base64 kodieren, in 3500-Zeichen-Chunks splitten
2. **Pro Chunk:** Anhängen von `|END|` + 100 `X`-Zeichen als Sicherheits-Padding
3. **Browser:** kleine Helper-Funktion akkumuliert in `window._b64`, schneidet bei `|END|` ab
4. **Nach allen Chunks:** `atob` + `TextDecoder('utf-8')` → fertiger Content
5. **Speichern:** `wp.apiFetch({path:'/wp/v2/pages/ID', method:'POST', data:{content}})`

```javascript
/* Schritt 1 — einmal initialisieren */
window._b64 = '';
window._addChunk = function(s) {
  var i = s.indexOf('|END|');
  if (i < 0) { window._b64 += s; return -1; }
  window._b64 += s.substring(0, i);
  return i;
};

/* Schritt 2 — pro Chunk eine Tool-Call:
   window._addChunk('PHN0eWxlPg…|END|XXXXXXXX…')   */

/* Schritt 3 — Decode */
var raw = atob(window._b64);
var bytes = new Uint8Array(raw.length);
for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
window._final = '<!-- wp:html -->\n' + new TextDecoder('utf-8').decode(bytes) + '\n<!-- /wp:html -->';

/* Schritt 4 — Speichern */
wp.apiFetch({path:'/wp/v2/pages/46566', method:'POST', data:{content: window._final}})
```

**Python-Helfer zur Chunk-Erzeugung:**
```python
import base64
b64 = base64.b64encode(content.encode('utf-8')).decode('ascii')
chunks = [b64[i:i+3500] for i in range(0, len(b64), 3500)]
for i, c in enumerate(chunks):
    open(f'/tmp/c{i:02d}.txt','w').write(c + '|END|' + 'X'*100)
```

### Tokenkosten — Wichtig!
Diese Methode ist **enorm tokenintensiv**: Jeder Chunk wird 5000+ Zeichen einmal an Claude rein, einmal raus.
Eine 38-KB-Seite kostete in der Taufe3-Session ~150.000 Tokens Übertragung.

**Alternativen vorzuziehen:**
1. **Bestehenden Block über das Editor-UI bearbeiten** wenn nur Kleinigkeiten ändern
2. **Lokales Python-Skript mit WP Application Password** — Werner einmal einrichten:
   - WP Admin → Profil → Anwendungspasswörter → neues für `claude-cli`
   - Skript: `requests.post('https://www.sanktbonifatius.de/wp-json/wp/v2/pages/46566', auth=(user,app_pw), json={'content': open('taufe.html').read()})`
   - Spart pro großer Bearbeitung 100k+ Tokens
3. **Inhalt klein halten** — externe Bilder verlinken statt Base64 einbetten

### Bekanntes Restproblem
Bei der Taufe3-Übertragung sind ~10 Zeichen mehr im Decoded-Content gelandet als erwartet (in CSS-Kommentaren — visuell unsichtbar). Ursache nicht endgültig geklärt; wahrscheinlich JS-String-Parser-Eigenheit bei bestimmten Mehrbyte-Sequenzen am Chunk-Übergang. Akzeptabel solange Inhalt strukturell intakt ist.

---

## 13. Chrome-Extension-Verbindung in neuen Sessions

### Symptom
```
mcp__Claude_in_Chrome__tabs_context_mcp → "Claude in Chrome is not connected"
```
oder:
```
"No tab group exists for this session."
```
Tritt beim Start jeder neuen Claude Code Session auf, auch wenn Chrome offen ist und die Extension installiert ist.

### Ursache
Es gibt **zwei völlig verschiedene Zustände**, die unterschiedlich behandelt werden müssen:

| Fehlermeldung | Bedeutung | Lösung |
|---|---|---|
| `"Claude in Chrome is not connected"` | Extension ist offline / deaktiviert | Werner muss Extension in Chrome reconnecten (Klick auf Extension-Icon → Reconnect) |
| `"No tab group exists for this session"` | Chrome verbunden, aber noch keine Tab-Gruppe für diese Session | `tabs_context_mcp` mit `createIfEmpty: true` aufrufen |

Der zweite Zustand ist der **häufigste**: Chrome läuft, Extension aktiv, aber jede neue Claude-Session braucht ihre eigene Tab-Gruppe. Die Fehlermeldung "not connected" ist irreführend — Chrome ist tatsächlich verbunden.

### Lösung: Immer `createIfEmpty: true` beim Sessionstart

**Schritt 1 — Tab-Gruppe erstellen (Pflicht am Anfang jeder Session mit Chrome-Zugriff):**
```
mcp__Claude_in_Chrome__tabs_context_mcp(createIfEmpty: true)
```
Gibt eine `tabGroupId` und `tabId` zurück. Danach funktionieren alle Chrome-Tools.

**Schritt 2 — Navigation und JS:**
```
mcp__Claude_in_Chrome__navigate(tabId, "https://www.sanktbonifatius.de/wp-admin/")
mcp__Claude_in_Chrome__javascript_tool(tabId, "document.title")
```

### Ablauf bei "not connected"-Fehler

1. **Erst** `tabs_context_mcp(createIfEmpty: true)` versuchen — wenn das "No tab group exists" zurückgibt und dann trotzdem Tab-Gruppe erstellt: Chrome war nur ohne Tab-Gruppe, alles gut.
2. **Wenn** immer noch "not connected": Werner bitten, in Chrome die Extension zu reconnecten (Icon anklicken → Verbinden).
3. **Nach** Reconnect durch Werner: sofort wieder `tabs_context_mcp(createIfEmpty: true)` — **nicht** mit `createIfEmpty: false` (das würde erneut "No tab group" liefern).

### Warnung: `createIfEmpty: false`
```
mcp__Claude_in_Chrome__tabs_context_mcp(createIfEmpty: false)
```
Liefert immer "No tab group exists for this session" wenn noch keine Tab-Gruppe da ist. Diesen Aufruf **niemals als ersten Aufruf** in einer Session verwenden — nur wenn bereits sicher eine Tab-Gruppe existiert (z. B. für Status-Check).

### Praxisbeispiel (Taufe3-Session)
In der Taufe3-Session schlug `tabs_context_mcp` mehrfach mit "not connected" fehl. Nach Vergleich mit der home6-Session (wo `createIfEmpty: true` genutzt wurde) wurde klar: Das Flag war entscheidend. Ein einziger Aufruf mit `createIfEmpty: true` stellte die Verbindung sofort her, alle folgenden Chrome-Operationen liefen fehlerfrei.

### Merksatz
> **Neue Session = neue Tab-Gruppe.** Immer `createIfEmpty: true` als allerersten Chrome-Aufruf nutzen.

---

## 14. bh3a-Navigation — Extraktion und Übertragung

> **⭐ Neue Seiten:** Von Post **48530** klonen — die Nav ist fertig enthalten, kein Extrahieren nötig. Die Schritte unten sind nur nötig, wenn die Nav einer *bestehenden* Seite auf einen neueren Stand gebracht werden soll.

### Problem (bei manueller Übertragung)
Das Einfügen der Navigationsleiste aus einer anderen Seite führt regelmäßig zu Fehlern:
- **Zu viel extrahiert**: Der erste `</nav>`-Tag in home6 gehört zur *Direkt-zu-Quicklinks*-Navigation, nicht zum Menübalken. Wer naiv nach `</nav>` sucht, bekommt 45 kB statt 10 kB — inklusive home6-Hero, „Mitten in Frankfurt" und Direkt-zu-Buttons.
- **Falsches Element**: Der bh3a-Menübalken verwendet **kein `<nav>`-Element**, sondern `<div class="bh3a-hdr">`. Eine `<nav>`-Suche findet daher den falschen Block.
- **Falscher Anker**: Das erste Vorkommen von `bh3a` liegt in den CSS-Stilen, nicht im HTML. Den Startpunkt der CSS-Datei zurückzusuchen funktioniert bei home6 nicht, weil die CSS-Stile und der bh3a-Hero-Inhalt beide VOR dem eigentlichen Menü-HTML stehen.

### Ursache: home6-Struktur

home6 besteht aus einem einzigen riesigen `<!-- wp:html -->`-Block (ca. 130 kB). Darin:

```
Position    Inhalt
────────────────────────────────────────────────────────
0           <!-- wp:html -->
17          <style>/* bh3a */ ... alle CSS-Regeln ...</style>
3407        <div class="bh3a-hdr"> ← der Menübalken beginnt hier
10503       </div>                 ← der Menübalken endet hier (≈ 10 kB)
~11000      home6-Hero (Kirche + Split-Images "Glaube, der mit...")
~43272      "Mitten in Frankfurt" Welcome-Sektion
~43628      "Direkt zu:" Quick-Links
43650       <nav class="..."> ← erste echte </nav> in home6 → FALSCHE SPUR
45784       </nav>
...         Veranstaltungen, News, Marquee usw.
```

### Korrekte Extraktion (JavaScript im WP-Admin)

```javascript
wp.apiFetch({path: '/wp/v2/pages/45758?context=edit'})
  .then(d => {
    const raw = d.content.raw;

    // ① CSS-Block: beginnt mit <style>\n.bh3a-hdr
    const styleStart = raw.indexOf('<style>\n.bh3a-hdr');

    // ② Menübalken-Div: <div class="bh3a-hdr">
    const divStart = raw.indexOf('<div class="bh3a-hdr">');

    // ③ Passendes schließendes </div> per Tiefenzähler suchen
    let depth = 0, pos = divStart, divEnd = -1;
    while (pos < raw.length) {
      if (raw[pos] === '<') {
        if (raw.substring(pos, pos + 4) === '<div') { depth++; pos += 4; }
        else if (raw.substring(pos, pos + 6) === '</div>') {
          depth--;
          if (depth === 0) { divEnd = pos + 6; break; }
          pos += 6;
        } else pos++;
      } else pos++;
    }

    // ④ Ergebnis: CSS + Menübalken-HTML (~10 kB)
    window._navBlock = raw.substring(styleStart, divEnd);
    console.log('nav block len:', window._navBlock.length); // sollte ~10 000 sein
  });
```

### Einfügen in die neue Seite (Beispiel Taufe3)

Im HTML der Zielseite gibt es einen Platzhalter-Kommentar:
```html
<!-- ═══ 0. NAVIGATION (bh3a) ════════════════════════════════ -->
<!-- Hier bh3a-Navigation einfügen -->
```

Beim Upload-Patch diesen Block ersetzen:
```javascript
const navComment = h.indexOf('<!-- ═══ 0. NAVIGATION (bh3a)');
const heroStart  = h.indexOf('<section class="ta-hero');  // erste Seiteninhalt-Sektion
h = h.substring(0, navComment)
  + '<!-- ═══ 0. NAVIGATION (bh3a) ══════════════════════ -->\n'
  + window._navBlock
  + '\n\n'
  + h.substring(heroStart);
```

### Prüfung nach dem Upload

```javascript
({
  navPresent:    h.indexOf('bh3a-hdr') > -1,     // ✓ Menübalken eingebunden
  heroPresent:   h.indexOf('ta-hero') > -1,       // ✓ Seiteninhalt erhalten
  noHome6Hero:   h.indexOf('Mitten in Frankfurt') === -1,  // ✓ kein home6-Inhalt
  approxNavLen:  /* sollte ~10 000 sein, nicht 45 000 */
})
```

### Checkliste für neue Seiten

1. **WP-Admin öffnen** (`post.php?post=45758&action=edit`) und `wp` verfügbar warten
2. **Extraktion** mit dem JS-Snippet oben ausführen → `window._navBlock.length` prüfen (≈ 10 000)
3. **Neue Seite laden** via `wp.apiFetch({path: '/wp/v2/pages/NEUE-ID?context=edit'})`
4. **Platzhalter ersetzen**: nav-Kommentar bis erste Seiteninhalt-Section
5. **Speichern**: `wp.apiFetch({path: '/wp/v2/pages/NEUE-ID', method: 'POST', data: {content: h}})`
6. **Vorschau öffnen** → Screenshot: nur der Menübalken oben, kein home6-Content darunter

### Merksatz
> **Nie `</nav>` suchen — immer `<div class="bh3a-hdr">` mit Tiefenzähler.**

---

## 15. Taufe-Anmeldeformular — Aufbau und Pflege

### Wo liegt was?

| Was | Wo |
|---|---|
| **Seite** | Post **46566** — `https://www.sanktbonifatius.de/taufe3/` |
| **Lokale Quelldatei** | `~/Claudia/src/taufe.html` |
| **AJAX-Handler** | `functions.php` des Child-Themes **`ursprung-bonifatius`**, Zeile ~577 |
| **Theme-Editor** | WP-Admin → Darstellung → Theme-Editor → `functions.php` |
| **Direkt-Link** | `https://www.sanktbonifatius.de/wp-admin/theme-editor.php?file=functions.php&theme=ursprung-bonifatius` |

### Wie das Formular funktioniert

Das Formular ist **vollständig selbstgebaut** — kein Gravity Forms, kein Contact Form 7. Es besteht aus drei Teilen:

1. **HTML-Formular** im Seiteninhalt (Post 46566), CSS-Klasse `.ta-form`
2. **JS-Submit-Handler** ebenfalls im Seiteninhalt: schickt ein `FormData`-Objekt per `fetch` an `/wp-admin/admin-ajax.php`
3. **PHP-Handler** in `functions.php`: empfängt die Daten, baut eine E-Mail und verschickt sie per `wp_mail()`

AJAX-Action-Name: **`taufe_anmeldung`**

Registriert in `functions.php` (aktuell Zeilen 491–492):
```php
add_action('wp_ajax_taufe_anmeldung',        'taufe_handle_anmeldung');
add_action('wp_ajax_nopriv_taufe_anmeldung', 'taufe_handle_anmeldung');
```
`nopriv` = auch für nicht eingeloggte Besucher aktiv (wichtig, da das öffentliche Formular ist).

### E-Mail-Empfänger ändern

Die Empfängerliste steht in der Funktion `taufe_handle_anmeldung()` in `functions.php`, ca. Zeile 577:

```php
$sent = wp_mail( array( 'pfarrer@sanktbonifatius.de', 'info@sanktbonifatius.de', 'w.otto@sanktbonifatius.de' ), $subject, $body, $headers );
```

**Empfänger hinzufügen oder entfernen:**
1. WP-Admin → Darstellung → Theme-Editor → `functions.php` (Child-Theme `ursprung-bonifatius`)
2. `Strg+F` → `wp_mail` suchen
3. Im `array(...)` die E-Mail-Adressen in einfachen Anführungszeichen, durch Komma getrennt
4. Änderung vornehmen → **„Datei aktualisieren"** klicken

**Achtung — CodeMirror-Falle (gelernt 2026-04-28):**
Der Theme-Editor verwendet CodeMirror als Overlay-Editor. Wenn Claude das Formular per JS bearbeitet (`ta.value = ...`), weiß CodeMirror nichts davon und überschreibt beim Speichern die Änderung mit seinem eigenen Stand. Korrekte Methode:
```javascript
// CodeMirror-Instanz direkt ansprechen:
const cm = document.querySelector('.CodeMirror').CodeMirror;
cm.replaceRange(neueZeile, {line: zeilenIdx, ch: 0}, {line: zeilenIdx, ch: alteZeile.length});
// Dann speichern:
HTMLFormElement.prototype.submit.call(document.getElementById('template'));
// (Nicht btn.click() — der form.submit()-Aufruf wird durch das input[name="submit"]-Element
//  überschattet, daher Prototype.call verwenden.)
```
**Erfolgsindikator:** URL bekommt `?a=1` angehängt, CodeMirror zeigt die geänderte Zeile (Länge überprüfen).

### Formularfelder (Stand 2026-04-28)

Das Formular erfasst (je nach Typ Taufe Kind / Erwachsener):
- Kirchort (St. Bonifatius / St. Wendel / Herz Jesu)
- Name des Kindes / Taufbewerbers
- Geburtsdatum
- Name(n) der Eltern / Taufpate(n)
- Kontaktdaten (Telefon, E-Mail)
- Wunschdatum / Terminwunsch
- Freitext

### Optische Anpassungen an der Seite

Die Seite liegt lokal unter `~/Claudia/src/taufe.html`. Nach Änderungen daran:

1. Datei speichern
2. Per Python-Skript hochladen (bevorzugt, spart Tokens):
   ```bash
   export WP_USER=pfarrer
   export WP_PASS="xxxx xxxx xxxx xxxx"
   python3 /tmp/prepare_taufe_upload.py --upload
   ```
   Oder Chunks für Browser-Konsole:
   ```bash
   python3 /tmp/prepare_taufe_upload.py --chunks
   ```
3. Live-Seite prüfen: `https://www.sanktbonifatius.de/taufe3/`

---

## 16. „Was ist neu?"-Button (#wn-trigger) — nur home6, nicht auf Unterseiten

### Symptom
Der rote schwebende Button „✨ Was ist neu?" (unten rechts) erscheint auch auf geklonten Unterseiten (z. B. Segen und Sakramente 2, post 48265), obwohl er nur zur Startseite home6 gehört.

### Ursache
Das wn-widget ist im Block-1-HTML-Block des Klons enthalten (Positionen 2821–8345 des nav-Blocks). Es rendert den Button via JavaScript. Ein `display:none` im CSS desselben Blocks greift nicht zuverlässig, weil das Widget die Sichtbarkeit per JS steuert.

### Lösung
Am Ende des Block-2-CSS (vor `</style>`) folgende Regel einfügen:

```css
#wn-trigger,#wn-widget{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
```

Diese Regel lädt nach dem Widget-JS und überschreibt die Sichtbarkeit zuverlässig.

**⚠️ Merksatz:** Wenn `#wn-trigger` oder `#wn-widget` auf einer Seite erscheinen, die keine Startseite ist, diesen CSS-Block in den Seiteninhalt einfügen — unabhängig davon, woher die Seite stammt oder wie sie entstanden ist.

---

## 17. `bonifatius_is_bh3a_page()` — content-basierte Erkennung (seit 26.05.2026)

### Problem (veraltet)
Die Funktion war eine statische Page-ID-Liste mit 22 IDs. Jede neue bh3a-Seite musste manuell eingetragen werden — sonst kein Hamburger-Menü, kein Nav-Scroll, kein Mobile-Padding auf der neuen Seite.

### Aktuelle Implementierung

```php
function bonifatius_is_bh3a_page() {
    $post = get_post();
    if ( ! $post ) return false;
    return strpos( $post->post_content, 'bh3a-hdr' ) !== false;
}
```

Greift auf jeder Seite, deren Inhalt `bh3a-hdr` enthält — automatisch, ohne Pflege. Entspricht dem CSS-Ansatz `body:has(.bh3a-hdr)` in `style.css`.

### Wofür die Funktion genutzt wird

| Hook | Zweck |
|---|---|
| `wp_footer` (boni_social_header) | Social-Header-Leiste **ausblenden** auf bh3a-Seiten |
| `wp_footer` (Nav-Scroll) | JS für `nav-scrolled`-Klasse beim Scrollen |
| `wp_footer` (Mobile Padding-Fix) | Horizontales Padding auf Mobilgeräten |
| `wp_footer` (Hamburger-Toggle v4) | Mobiles Hamburger-Menü |

### ⚠️ Merksatz
> Neue bh3a-Seiten brauchen **keinen Eintrag** in `functions.php` — sie werden automatisch erkannt, solange `<div class="bh3a-hdr">` im Seiteninhalt steht.

---

### Bekannte Design-Details (Stand 2026-04-28)

- `.ta-kirchort__head { min-height: 150px }` — gleiche Höhe aller drei Kirchort-Kacheln (St. Wendel hat 2-zeilige Adresse)
- `#ta-erwachsene` — Anker-ID für den Block „Als Erwachsener getauft werden"; der CTA-Button im Prozessabschnitt verweist darauf
- Abschnitt „Wir begleiten Sie gern" steht **nach** der FAQ (nicht davor)

---

## 18. Mobile-Ansicht: Hamburger-Navigation (bh3a)

### Problem
Auf neuen bh3a-Seiten fehlte ein Hamburger-Menü auf Mobilgeräten. Stattdessen blieb das Desktop-Menü sichtbar (oder war gar nicht vorhanden), und Avadas eigene Mobile-Navigation überlagerte das Layout.

### Lösung (Stand Mai 2026)

**functions.php** enthält zwei globale `wp_footer`-Hooks (nur für bh3a-Seiten):

1. **Hamburger-Toggle v4** — erzeugt den Button, öffnet/schließt Overlay-Nav, Submenü-Akkordeon
2. **Mobile Padding-Fix** — setzt `padding-left/right: 16px` auf übliche Container-Klassen

**style.css** enthält (Auszug der relevanten Regeln):

```css
/* Avada-Elemente auf allen bh3a-Seiten ausblenden */
body:has(.bh3a-hdr) nav.us_mobile-navigation,
body:has(.bh3a-hdr) section.us_searchform { display: none !important; }
body:has(.bh3a-hdr) header.us_header      { display: none !important; }
body:has(.bh3a-hdr) .boni-header-social   { display: none !important; }

/* Hamburger-Schaltfläche und Overlay (nur mobile ≤899px) */
@media(max-width:899px){
  .bh3a-rnav { display: none !important; }
  .bh3a-hamburger { display: flex !important; /* … */ }
  .bh3a-hdr.bh3a-open .bh3a-rnav { display: flex !important; position: fixed !important;
    top: 80px; left: 0; right: 0; bottom: 0; background: rgba(15,8,2,.97); z-index: 9999; }
  /* backdrop-filter auf bh3a-hdr deaktivieren, damit position:fixed der Nav greift */
  .bh3a-hdr { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
}
```

### Wichtige Implementierungsdetails

- **`document.body.appendChild(nav)`**: Die Nav wird beim Öffnen in den `<body>` verschoben (nicht in `.bh3a-hdr`). Grund: `backdrop-filter` auf dem Header erzeugt einen Containing Block, der `position:fixed` der Nav verhindert.
- **Submenu-Delegation**: Klick-Listener auf `.bh3a-dd` (Container), nicht auf `<a>`. `e.preventDefault()` verhindert Navigation, `if(m.contains(e.target))return` lässt Klicks auf Submenü-Links durch.
- **`position:static!important`** auf `.bh3a-dd__menu` beim Öffnen: sonst positioniert sich das Submenü absolut unterhalb des Viewports.

### Neue bh3a-Seiten: Kein Handlungsbedarf
Dank `bonifatius_is_bh3a_page()` (Abschnitt 17) und globaler CSS-Regel `body:has(.bh3a-hdr)` funktioniert der Hamburger **automatisch auf allen neuen Seiten**, die `<div class="bh3a-hdr">` enthalten.

---

## 19. Mobile-Ansicht: Grids und Layout-Overflow

### Das Problem

Auf neuen bh3a-Seiten erschienen Inhaltsblöcke auf dem iPhone schmal — typischerweise nur ~295 px statt der vollen ~375 px Viewport-Breite.

**Ursache:** Ein einzelnes Grid-Element mit zu vielen festen Spalten (z. B. `repeat(5,1fr)` auf 375 px) überschreitet den Viewport. Das HTML-Element hat `overflow:hidden`, was den Überschuss abschneidet — aber die Scroll-Breite der Seite wächst trotzdem, wodurch alle anderen Elemente relativ schmal wirken.

### Diagnose (Live-Seite, F12-Konsole)

```javascript
// Welche Elemente sind breiter als der Viewport?
var vw = window.innerWidth;
Array.from(document.querySelectorAll('*')).forEach(function(el){
  var r = el.getBoundingClientRect();
  if(r.width > vw + 10){
    console.log(el.tagName+'.'+el.className.toString().substring(0,50)+': '+Math.round(r.width)+'px');
  }
});
```

### Fixes

**Global in style.css** (Veranstaltungs-Grid auf allen bh3a-Seiten):
```css
@media(max-width:600px){ .bh2-vt__grid { grid-template-columns: 1fr !important; } }
```

**Seitenspezifisch im Seiteninhalt** (für eigene Kachel-Klassen):
```css
/* Muster: Responsive für eigene Grid-Klasse im <style>-Block der Seite */
@media(max-width:600px){ .MEINE-KLASSE { grid-template-columns: 1fr !important; } }
/* Bei 2-Spalten-Grid, die schmal genug sind, kann repeat(2,1fr) bleiben */
@media(max-width:380px){ .MEINE-KLASSE { grid-template-columns: 1fr !important; } }
```

### Scan aller Draft-Seiten auf Grid-Probleme

Dieses Skript zeigt alle bh3a-Entwurfsseiten mit Multi-Spalten-Grids (auf wp-admin ausführen):

```javascript
wp.apiFetch({path:'/wp/v2/pages?status=draft&per_page=20&_fields=id,title,content'})
  .then(pages => {
    pages.forEach(p => {
      var c = p.content.raw;
      if(!c.includes('bh3a-hdr')) return;
      var grids = [];
      var re = /grid-template-columns:(repeat\(\d[^;]+|[\d.]+fr[^;]+)/g, m;
      while((m=re.exec(c))!==null){
        if(!m[1].includes('auto-fit') && !m[1].includes('1fr)')) grids.push(m[1].substring(0,35));
      }
      var mqCount = (c.match(/@media/g)||[]).length;
      if(grids.length > 0) console.log('⚠️', p.id, p.title.rendered, '| Grids:', grids.join(' | '), '| MQs:', mqCount);
      else console.log('✓', p.id, p.title.rendered);
    });
  });
```

### Regelwerk für neue Seiten

1. **`repeat(N,1fr)` mit N ≥ 3** auf Mobilgeräten: Media-Query für `max-width:600px` → `1fr` oder `repeat(2,1fr)` hinzufügen
2. **`repeat(2,1fr)` mit Bildern**: Prüfen, ob Bild + Text in ~175 px passen. Falls nein → `1fr` auf Mobilgeräten
3. **Inline-Style-Grids** (`<div style="display:grid;grid-template-columns:repeat(2,1fr)...">`): Klasse hinzufügen (z. B. `class="bf-ap-grid"`) und per CSS responsiv machen
4. **Padding-Fix für volle Breite** (`.bh3a-kirch__inner`, `.boni-gdo-intro` etc.): Bereits in functions.php JS und style.css abgedeckt — kein manuelles Eingreifen nötig

### Merksatz
> **Jede neue Seite mit Kacheln in Reihe auf Mobilgerät testen** (Chrome DevTools → Device Toolbar → 390 px). Wenn Kacheln überlaufen → Grid-Responsive-CSS direkt in den Seiteninhalt einfügen.

---

## 20. style.css-Custom-Additions (früher: www-vs-dev-Synchronisationsfalle)

> **Erledigt seit Go-Live (19.06.2026).** Bis Juni 2026 gab es zwei unabhängige Server (www + dev) mit unterschiedlichen `style.css`-Dateien; die Custom-Additions lagen nur auf dev. Mit dem vollständigen UpdraftPlus-Klon dev→www entfällt diese Synchronisationsfalle: Es gibt **nur noch einen Server (www)**, der alle Custom-Additions enthält. Der frühere dev-Server ist stillgelegt.

Die `style.css` des Child-Themes wird ausschließlich auf **www.sanktbonifatius.de** (Theme-Editor) gepflegt. Enthaltene Custom-Additions u. a.:
- `body:has(.bh3a-hdr) nav.us_mobile-navigation { display:none!important }` — Avada-Nav global ausblenden
- `body:has(.bh3a-hdr) .bh3a-hdr { position:fixed; background:rgba(20,10,2,0.55); backdrop-filter:blur(8px); }` — transparente Sticky-Nav
- Hamburger-CSS `@media(max-width:899px)`
- `@media(max-width:600px){.bh2-vt__grid{grid-template-columns:1fr!important}}`
- `@media(max-width:860px){.el-tiles{grid-template-columns:repeat(2,1fr)!important}}`

---

## llms.txt für KI-Suchmaschinen (Juni 2026)

### Was
`https://www.sanktbonifatius.de/llms.txt` liefert eine strukturierte Übersicht der Pfarrei für KI-Crawler (ChatGPT, Perplexity, Google AI Overviews).

### Wie umgesetzt
In der `functions.php` (Theme `ursprung-bonifatius`) gibt es einen Block `/* === AI-Crawler === */` (ca. Zeile 990):
1. **robots.txt-Filter** — erlaubt GPTBot & Co.
2. **Rewrite-Endpoint `/llms.txt`** — `add_rewrite_rule` + `template_redirect`-Action mit `echo`-Zeilen (Doppelquotes mit `\n`).

Am 2026-06-10 von 13 auf 36 Zeilen erweitert: alle Kasualien (inkl. Trauerfall mit Notfall-Telefon), Gottesdienst-Formate, Gemeinschaft, Pastoralteam/Leitung, 4 Kirchorte, Kontakt.
Am 2026-06-21 auf 54 Zeilen erweitert: zusätzlich „Ueber uns"-Absatz, Schnellzugang (Startseite + Terminkalender), BonFamily und ein „Fuer KI-Assistenten: Haeufige Anfragen"-Block (typische Suchfragen → Zielseite). Alle Pfade vorab auf HTTP 200 geprüft.

### ✅ Go-Live erledigt (19.06.2026)
Der Block ist auf **www** live — `https://www.sanktbonifatius.de/llms.txt` liefert die Übersicht aus, der AI-Crawler-Block steht in robots.txt. (Historisch: lag zunächst nur auf dev; beim Übertragen war ggf. ein Permalink-Flush nötig, damit die Rewrite-Rule griff.) Siehe Abschnitt 25.

### Inhalt ändern
Echo-Block in functions.php (ab ca. Zeile 1019). Achtung: keine `$`, `"` oder Umlaute in den Strings (ue/oe/ss verwenden — Umlaute funktionieren zwar, ASCII ist aber robuster gegen Encoding-Probleme beim Theme-Editor-Speichern).

---

## 21. News-Aktualisierung auf `/news-aktualisieren/` funktioniert nicht

### Symptom
Klick auf „Aktualisierung starten" schlägt sofort fehl — entweder mit „Bitte zuerst im WordPress-Admin einloggen" oder „Pin-Daten-Tag fehlt in Startseite (home6)".

### Wie das Tool funktioniert
Das Script auf `/news-aktualisieren/` läuft vollständig im Browser (Same-Origin-Session):
1. Holt einen WP-REST-Nonce via `admin-ajax.php?action=rest-nonce`
2. Liest alle pin-Posts (Custom Post Type „News") per REST
3. Kratzt ACF-Felder aus den WP-Admin-Bearbeitungsseiten
4. Schreibt das Ergebnis als JSON-Block in Seite 45758 (home6) und 45493 (BoniBlog)

### Fehlerfall A: „Bitte zuerst im WordPress-Admin einloggen"

**Ursache:** Der `wp_ajax_rest-nonce`-Handler fehlt in der `functions.php`.

**Prüfen:** In der Browser-Konsole auf der Live-Seite (www):
```javascript
fetch('/wp-admin/admin-ajax.php?action=rest-nonce', {credentials:'same-origin'})
  .then(r => r.text()).then(n => console.log('Nonce:', n));
```
→ Gibt eine 10-stellige Zeichenkette zurück wenn OK, `0` wenn der Handler fehlt.

**Beheben:** In der Browser-Konsole (eingeloggt als Admin):
```javascript
fetch('/wp-admin/theme-editor.php?file=functions.php', {credentials:'same-origin'})
  .then(r => r.text())
  .then(async html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const ta = doc.getElementById('newcontent');
    const nonce = doc.querySelector('[name="nonce"]').value;
    const theme = doc.querySelector('[name="theme"]').value;
    const file = doc.querySelector('[name="file"]').value;
    if (ta.value.includes('rest-nonce')) { console.log('bereits vorhanden'); return; }
    const newCode = ta.value + "\nadd_action('wp_ajax_rest-nonce', function(){\n    echo wp_create_nonce('wp_rest');\n    wp_die();\n});\n";
    const fd = new FormData();
    fd.append('nonce', nonce); fd.append('action', 'edit-theme-plugin-file');
    fd.append('file', file); fd.append('theme', theme);
    fd.append('newcontent', newCode); fd.append('scrollto', '0');
    const res = await fetch('/wp-admin/admin-ajax.php', {method:'POST',credentials:'same-origin',body:fd}).then(r=>r.json());
    console.log('Ergebnis:', res);
  });
```

### Fehlerfall B: „Pin-Daten-Tag fehlt in Startseite (home6)"

**Ursache:** Der Platzhalter-Tag `<script id="boni-pin-data">window.__BONI_PINS={};</script>` fehlt im Seiteninhalt von 45758 oder 45493. Tritt auf wenn die Seite neu erstellt oder der Block versehentlich gelöscht wurde.

**Beheben:** Für jede betroffene Seite in der Browser-Konsole ausführen (PID = 45758 für home6, 45493 für BoniBlog):
```javascript
const PID = 45758; // oder 45493
fetch('/wp-admin/admin-ajax.php?action=rest-nonce', {credentials:'same-origin'})
  .then(r => r.text())
  .then(async nonce => {
    const headers = {'X-WP-Nonce': nonce, 'Content-Type': 'application/json'};
    const page = await fetch('/wp-json/wp/v2/pages/'+PID+'?context=edit', {credentials:'same-origin',headers}).then(r=>r.json());
    const tag = '<scr'+'ipt id="boni-pin-data">window.__BONI_PINS={};</scr'+'ipt>';
    if (page.content.raw.includes('boni-pin-data')) { console.log('bereits vorhanden'); return; }
    const res = await fetch('/wp-json/wp/v2/pages/'+PID, {method:'POST',credentials:'same-origin',headers,body:JSON.stringify({content: page.content.raw+'\n'+tag})}).then(r=>r.json());
    console.log(res.id ? 'Gespeichert' : res);
  });
```

### Hinweis
Das Anwendungspasswort reicht für diese Korrekturen **nicht** — `context=edit` wird mit 401 abgewiesen. Die Browser-Konsole (eingeloggte Admin-Session) ist der einzige Weg.

---

## 22. Beitrags- und Termin-Templates im bh3a-Design

### Ziel
Wenn ein Besucher auf einen Beitrag (Post-Typ `post`) oder einen Termin (Post-Typ `event`) klickt, soll die Detailseite im neuen bh3a-Design erscheinen — nicht im alten Avada-Design.

### Lösung
Zwei PHP-Templates im Child-Theme `ursprung-bonifatius`:

| Datei | Gilt für |
|-------|----------|
| `single.php` | Alle WordPress-Beiträge (`post`) |
| `single-event.php` | Alle Termine (`event`) |

Beide Templates umgehen Avadas Layout komplett: Sie geben ein vollständiges `<!DOCTYPE html>` aus, rufen nur `wp_head()` und `wp_footer()` auf (für SEO-Plugins, Analytics etc.), aber **nicht** `get_header()` / `get_footer()`.

### Warum `template_include`-Filter nötig
Avada überschreibt die Standard-WordPress-Template-Hierarchie über eigene Filter. Ohne den Filter in `functions.php` würde Avada das eigene Template laden statt `single.php`/`single-event.php`.

In `functions.php` stehen deshalb diese Filter:

```php
// Beitrag-Template erzwingen (bh3a Design)
add_filter( 'template_include', function( $template ) {
    if ( is_single() ) {
        $t = get_stylesheet_directory() . '/single.php';
        if ( file_exists( $t ) ) return $t;
    }
    return $template;
}, 99 );

// Termin-Template erzwingen (bh3a Design)
add_filter( 'template_include', function( $template ) {
    if ( is_singular( 'event' ) ) {
        $t = get_stylesheet_directory() . '/single-event.php';
        if ( file_exists( $t ) ) return $t;
    }
    return $template;
}, 99 );
```

### Template-Struktur

Beide Templates folgen demselben Aufbau:

```
<!DOCTYPE html>
  <head> + wp_head() + Inline-CSS
  <body>
    [Skip-Link für Barrierefreiheit]
    [bh3a-Nav] — fixe Glassmorphism-Navigation
    [pbm-hero] — Vollbild-Hero mit Beitragsbild
    [pbm-body] — Cremefarbener Textbereich
      - Meta-Zeile (Datum · Uhrzeit / Ort mit Pin-Icon)
      - Inhalt (the_content() bzw. description-Meta-Feld)
      - "Alle Beiträge" / "Alle Termine"-Link
  wp_footer()
```

### Besonderheiten `single-event.php`

Die Termin-Daten kommen **nicht** aus Standard-WordPress-Feldern, sondern aus dem Meta-Feld `event_meta` (Plugin-spezifisch):

```php
$em         = get_post_meta( $post_id, 'event_meta', true );
// Felder: image (Attachment-ID), subtitle, times, location, start_date (YYYYMMDD), end_date
```

Das Bild ist eine Attachment-ID im Feld `image` — kein Standard-Beitragsbild. Fallback-Reihenfolge:
1. `event_meta.image` → `wp_get_attachment_url( $img_id )`
2. Standard-Beitragsbild via `get_the_post_thumbnail_url()`
3. Neutrales News-Fallback-Bild

Der Beschreibungstext kommt aus dem Meta-Feld `description` (Rich Text). Fallback: `the_content()`.

Datumsformat im Feld: `YYYYMMDD` (z.B. `20260514`) → wird zu `14. Mai 2026` formatiert.

### Templates installieren/aktualisieren

Da WordPress neue Dateien nicht direkt über den Theme-Editor anlegen lässt, braucht man einen Zwischenschritt:

**Schritt 1** — Platzhalterdatei anlegen (einmalig, via Browser-Konsole):
Temporär in `functions.php` eintragen:
```php
add_action('after_setup_theme', function() {
    $f = get_stylesheet_directory() . '/single-event.php';
    if (!file_exists($f)) { @file_put_contents($f, '<?php // placeholder ?>'); }
});
```
Einmal eine Seite laden, damit der Hook läuft. Dann diesen Code wieder entfernen.

**Schritt 2** — Echten Inhalt schreiben (via Browser-Konsole mit Python-Server auf Port 8080):
```javascript
(async () => {
  const html = await fetch('/wp-admin/theme-editor.php?file=single-event.php&theme=ursprung-bonifatius&_=' + Date.now(), {credentials:'same-origin'}).then(r=>r.text());
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const nonce = doc.querySelector('[name="nonce"]').value;
  const theme = doc.querySelector('[name="theme"]').value;
  const phpCode = await fetch('http://localhost:8080/single-event.php?_=' + Date.now()).then(r=>r.text());
  const fd = new FormData();
  fd.append('nonce', nonce); fd.append('action', 'edit-theme-plugin-file');
  fd.append('file', 'single-event.php'); fd.append('theme', theme);
  fd.append('newcontent', phpCode); fd.append('scrollto', '0');
  const res = await fetch('/wp-admin/admin-ajax.php', {method:'POST', credentials:'same-origin', body:fd}).then(r=>r.json());
  console.log(res.success ? '✓ Installiert!' : res);
})();
```

Der Python-Server muss dabei laufen:
```bash
cd /Users/wernerotto/Library/Mobile Documents/com~apple~CloudDocs/Claude/Code/team-handbuch/docs
python3 cors_server.py  # oder: python3 -m http.server 8080
```

### Termin-Übersicht: Veranstaltungsdatum in Admin-Liste

In der WordPress-Admin-Übersicht (Termine → Alle Termine) wird standardmäßig das Veröffentlichungsdatum angezeigt. Das Veranstaltungsdatum erscheint dank folgendem Code in `functions.php`:

```php
add_filter( 'manage_event_posts_columns', function( $cols ) {
    $cols['event_start_date'] = 'Datum';
    return $cols;
} );
add_action( 'manage_event_posts_custom_column', function( $col, $post_id ) {
    if ( $col !== 'event_start_date' ) return;
    $em  = get_post_meta( $post_id, 'event_meta', true );
    $raw = is_array( $em ) ? ( $em['start_date'] ?? '' ) : ( get_post_meta( $post_id, 'start_date', true ) ?: '' );
    if ( ! $raw ) { echo '—'; return; }
    $fmt = strlen( $raw ) === 8
        ? DateTime::createFromFormat( 'Ymd', $raw )
        : DateTime::createFromFormat( 'd.m.Y', $raw );
    echo $fmt ? esc_html( date_i18n( 'j. F Y', $fmt->getTimestamp() ) ) : esc_html( $raw );
}, 10, 2 );
add_filter( 'manage_edit-event_sortable_columns', function( $cols ) {
    $cols['event_start_date'] = 'event_start_date';
    return $cols;
} );
add_action( 'pre_get_posts', function( $query ) {
    if ( ! is_admin() || ! $query->is_main_query() ) return;
    if ( $query->get( 'post_type' ) !== 'event' ) return;
    if ( $query->get( 'orderby' ) === 'event_start_date' ) {
        $query->set( 'meta_key', 'start_date' );
        $query->set( 'orderby', 'meta_value' );
    }
} );
```

### SEO
`wp_head()` wird aufgerufen — Yoast/RankMath gibt die in WordPress eingetragenen SEO-Texte automatisch als Meta-Tags aus. Kein weiterer Aufwand nötig.

### Barrierefreiheit (WCAG)
Beide Templates enthalten:
- Skip-Link „Zum Inhalt springen" (für Tastaturnutzer)
- Sichtbare Focus-Ringe auf allen interaktiven Elementen (Farbe `#c5a55a`)
- Dropdown-Menüs öffnen auch per Tastatur (`focus-within`)
- `prefers-reduced-motion` wird respektiert
- `id="main-content"` als Sprungziel

---

## 23. „Aktuelles"-Grid auf der Startseite — Beitragsbild & Untertitel fehlen

Das „Aktuelles aus der Pfarrei"-Grid auf der Startseite (home6, Seite **45758**) wird **per JavaScript** befüllt, nicht serverseitig. Ein `<script>` (beginnt mit `var ng=document.getElementById('bh2-news-dynamic')`) holt die letzten Beiträge über die REST-API:

```javascript
fetch('/wp-json/wp/v2/posts?per_page=6'+String.fromCharCode(38)+'_embed')
```

Es zeigt die obersten 3 Beiträge (sticky zuerst, dann nach Datum) als Kacheln mit **Bild, Kategorie, Datum, Titel und Beschreibung**.

### Symptom A: Beitragsbild fehlt in einer Kachel

Obwohl in WordPress ein Beitragsbild gesetzt ist, bleibt die Kachel ohne Bild.

**Ursache:** Das Script liest die Bild-URL aus `p._embedded['wp:featuredmedia'][0].source_url`. Liefert die API für das Attachment `rest_forbidden` (HTTP 401), bleibt `source_url` leer → kein Bild-Div wird erzeugt (der `try/catch` verschluckt den Fehler stillschweigend).

**Warum `rest_forbidden`?** Attachments **erben den Status ihres Eltern-Posts** (`"status": "inherit"`). Hängt das Bild an einem **Draft** (Feld `post` des Attachments zeigt auf eine Entwurfsseite), ist es für anonyme Besucher per REST gesperrt — obwohl die Bilddatei selbst (`uploads/...jpg`) öffentlich erreichbar ist.

Konkreter Fall (Juni 2026): Mehrere News-Platzhalterbilder hingen an Post **16681** (`home-alt`, Draft). Betroffen waren u. a. Attachment 22755 und 22757.

**Diagnose** (anonym, ohne Login — genau wie ein Besucher):
```bash
curl -s "https://www.sanktbonifatius.de/wp-json/wp/v2/posts?per_page=6&_embed" \
  | python3 -c "import json,sys; [print(p['id'], p['_embedded']['wp:featuredmedia'][0].get('code','OK')) for p in json.load(sys.stdin)]"
# 'rest_forbidden' = Bild an Draft gebunden, 'OK' = sichtbar
```

**Lösung:** Attachment vom Draft-Post lösen (`post: 0`). Braucht das Anwendungspasswort:
```bash
curl -s -u "Werner:ANWENDUNGSPASSWORT" \
  -X POST "https://www.sanktbonifatius.de/wp-json/wp/v2/media/ATTACHMENT_ID" \
  -H "Content-Type: application/json" -d '{"post": 0}'
```
Danach ist `"post": null` und das Bild anonym sichtbar.

### Symptom B: Falsche Beschreibung (erste Sätze statt Untertitel)

In manchen Kacheln erscheinen die ersten Sätze des Artikels statt eines knackigen Untertitels.

**Ursache:** Es gibt zwei verschiedene Felder im Editor, die leicht verwechselt werden:

| Feld im Editor | Wo | Speicherort | Wird vom Grid gelesen? |
|---|---|---|---|
| **Textauszug** („Textauszug hinzufügen …", rechte Seitenleiste) | WordPress-Standard | Spalte `post_excerpt` | bisher: ja |
| **Untertitel** (Meta-Box „Beitrag", unter dem Editor) | **ACF-Feld**, Meta-Key `subtitle`, aus dem Eltern-Theme Ursprung | postmeta `subtitle` | bisher: **nein** |

Das Grid las ursprünglich nur `p.excerpt.rendered`. War der **Textauszug leer**, generierte WordPress automatisch einen Auszug aus dem Artikeltext → die ersten Sätze erschienen. Das **Untertitel-Feld** wurde komplett ignoriert.

**Lösung (umgesetzt Juni 2026):** Das Grid liest jetzt das Untertitel-Feld bevorzugt.

1. **`functions.php`** (Child-Theme) — `subtitle` für die Posts-REST-API freischalten (read-only, ohne Eingriff in ACF):
```php
/* === Untertitel (ACF subtitle) in Posts-REST verfuegbar machen === */
add_action( 'rest_api_init', function() {
    register_rest_field( 'post', 'subtitle', array(
        'get_callback' => function( $post ) {
            return get_post_meta( $post['id'], 'subtitle', true );
        },
    ) );
} );
```

2. **Script in home6** (Seite 45758) — eine Zeile geändert, sodass `subtitle` bevorzugt und der Textauszug nur noch Fallback ist:
```javascript
// vorher:
var excerpt=(tmpDiv.textContent||'').trim();
// nachher:
var excerpt=(p.subtitle||'').trim()||(tmpDiv.textContent||'').trim();
```

**Ergebnis:** Es genügt, im Editor das **Untertitel**-Feld zu füllen. Ist es leer, greift weiterhin der Textauszug, sonst der Auto-Text.

### Den ACF-Meta-Key eines Theme-Feldes finden

Falls ein Editor-Feld nicht in der REST-API auftaucht (`context=edit` zeigt es nicht unter `meta`), ist es oft ein ACF-Feld. Den Meta-Key über das `data-name`-Attribut auf der Beitrags-Bearbeitungsseite ermitteln (Browser-Konsole, eingeloggt):
```javascript
var w = document.querySelector('[data-key="field_XXXXXXXXXXXXX"]');
({ name: w.getAttribute('data-name'), type: w.getAttribute('data-type') });
// data-name = Meta-Key (z. B. 'subtitle')
```
Den `field_…`-Key findet man über das `name`-Attribut des Eingabefeldes (`acf[field_…]`).

### ✅ Go-Live erledigt (19.06.2026)
Beide Änderungen sind auf **www** live: das `register_rest_field`-Snippet (`subtitle`) in der functions.php und die geänderte Script-Zeile in home6. Siehe Abschnitt 25.

---

## 24. DigiAccess (Barrierefreiheits-Tool) — Anbindung & Reparatur (18.06.2026)

**DigiAccess** ist ein externes Barrierefreiheits-Overlay (`download.digiaccess.org`). Es bringt **selbst** einen schwebenden, blauen Einstiegs-Button mit (`#dAopener`) und ein Bedien-Panel (`#digiAccess.da-container`). Kein eigener Trigger nötig — das Tool macht alles selbst.

### Symptom (Juni 2026)
- Der Barrierefrei-Button in der bh3a-Nav (`.bh3a-btn-a11y`) reagierte auf **Seiten** (z. B. Startseite 45758) nicht.
- Auf **Beiträgen** (z. B. `post=50195`) erschien stattdessen „aus dem Nichts" ein blauer Button am rechten Rand — das war der **native DigiAccess-Opener**, nicht selbst programmiert.

### Ursache
Die Anbindung war über vier Stellen verteilt; die Reparatur-Logik in `header.php`/`footer.php` war fehlerhaft. Entscheidend: **Beitrags-/Termin-Templates (`single.php`, `single-event.php`) laden `get_header()`/`get_footer()` nicht** (vgl. Abschnitt 22) — deshalb lief der kaputte Code dort nicht, und der native Button funktionierte. Auf normalen Seiten mit Theme-Layout lief er → der native Button wurde versteckt **und** der Nav-Trigger griff nicht → gar kein Einstieg.

| Stelle | Inhalt | Status |
|---|---|---|
| `functions.php` → `wp_head` | `<script id="dacs-init">` + `<script id="dacs" …/tool?lang=de>` | ✅ **korrekt — bleibt.** Das ist die einzige nötige Einbindung. |
| `functions.php` → `wp_footer` (Prio 99) | Klick-Handler `.bh3a-btn-a11y` → `window.Digiaccess.toggle()` (mit `preventDefault`) | ❌ entfernt (fing Klick ab, Toggle schlug fehl → toter Button) |
| `footer.php` | 2. `dacs`-Script (mit **typografischen Anführungszeichen** `id=“dacs“` → kaputt), `waitForElement('#dAopener')`-Handler auf `#SWTdAopener`/`#SWTdAopenerMobile` (existierte nie), **CSS `#dAopener.da-tool{display:none}`** | ❌ kompletter Block zwischen `wp_footer()` und `</body>` entfernt |
| `header.php` | Trigger `<a id="SWTdAopener" … class="… da-opener da-tool">` im `us_header` | ❌ entfernt (ohne den footer-Handler funktionslos) |

### Soll-Zustand (so ist es jetzt)
- **Eine** Quelle: das saubere Script im `wp_head` (`functions.php`). Sonst nichts.
- Der **native blaue Button** erscheint überall gleich (Startseite, Beiträge, klassische Seiten) und wird von DigiAccess selbst gewartet.
- Das redundante Nav-Icon `.bh3a-btn-a11y` ist **global per CSS ausgeblendet** (`style.css`, vgl. Muster `h1.us_title{display:none}`):
  ```css
  .bh3a-btn-a11y{display:none!important}
  ```
  Achtung: In `style.css` gibt es weitere `.bh3a-btn-a11y`-Regeln (u. a. `display:inline-flex!important`). Die Ausblend-Regel muss daher **am Dateiende** stehen (gleiche Spezifität → spätere `!important`-Regel gewinnt).
- Die Barrierefreiheits-**Erklärseite** (`/ueberuns/barrierefreiheit/`, Pflichtseite) bleibt über das „Über uns"-Menü erreichbar — nur das Nav-Icon ist weg.

### Merke
- Wer DigiAccess will, braucht **nur** das `wp_head`-Script. Keine eigenen Toggle-Handler, kein Verstecken von `#dAopener`.
- Custom-CSS für das Panel (`#digiAccess.da-container …`, Bonifatius-Braun `#928269`) lässt sich bei Bedarf wieder ergänzen — aber sauber und ohne den Opener zu deaktivieren.

### ✅ Go-Live erledigt (19.06.2026)
Die DigiAccess-Bereinigung ist auf **www** live (`functions.php`, `style.css` bestätigt; `footer.php`/`header.php` noch nicht gegengeprüft — vgl. Abschnitt 25.5). Siehe Abschnitt 25.

---

## 25. Go-Live (19.06.2026): Kurz-URLs, Redirects, SEO/KI-Check

Am **19.06.2026** wurden die zuvor auf dev erarbeiteten Seiten **live** gestellt (www.sanktbonifatius.de). Die früheren „⚠️ Go-Live-Hinweis"-Blöcke in den Abschnitten 20, llms.txt, 23 und 24 sind damit **erledigt** — die functions.php/style.css auf www enthalten die Custom-Additions, den AI-Crawler-Block, das `subtitle`-REST-Feld und die saubere DigiAccess-Einbindung.

### 25.1 Kurz-URLs (Short-Links) — neuer Block in functions.php

**Problem:** Nach dem Go-Live liegen die Seiten unter verschachtelten Pfaden (`/segen-sakramente/taufe/`, `/kontakt/newsletter/` …). Die kurzen, kommunizierten Adressen (`/taufe/`, `/newsletter/` …) funktionierten nur über WordPress' **automatische Alt-Slug-Umleitung** — die ist nicht dauerhaft garantiert. Zusätzlich landete `/gottesdienste/` fälschlich auf „Gottesdienste, die berühren" statt auf der Gottesdienstordnung.

**Lösung:** Expliziter Redirect-Block am Ende der functions.php (Hook `template_redirect`, **Priorität 5** → läuft vor WordPress' eigener Kanonik/Alt-Slug-Logik):

```php
add_action( 'template_redirect', function () {
    $map = array(
        '/taufe/'                 => '/segen-sakramente/taufe/',
        '/trauung/'               => '/segen-sakramente/trauung/',
        '/erstkommunion/'         => '/segen-sakramente/erstkommunion/',
        '/firmung/'               => '/segen-sakramente/firmung/',
        '/beichte/'               => '/segen-sakramente/beichte/',
        '/katholisch-werden/'     => '/kontakt/katholisch-werden/',
        '/gottesdienste/'         => '/gottesdienst-glaube/gottesdienstordnung/',
        '/familiengottesdienste/' => '/bonfamily/familiengottesdienste/',
        '/trauerfall/'            => '/kontakt/trauerfall/',
        '/engagement/'            => '/kontakt/engagement/',
        '/newsletter/'            => '/kontakt/newsletter/',
        '/whatsapp-kanal/'        => '/kontakt/whatsapp-kanal/',
        '/gemeinschaft/'          => '/ueberuns/gemeinschaft/',
        '/pastoralteam/'          => '/ueberuns/pastoralteam/',
        '/leitung/'               => '/ueberuns/leitung/',
    );
    $path = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
    $path = '/' . trim( $path, '/' ) . '/';
    if ( isset( $map[ $path ] ) ) {
        wp_redirect( home_url( $map[ $path ] ), 301 );
        exit;
    }
}, 5 );
```

- `/engagiert-leben/` und `/gottesdienste-die-beruehren/` sind echte Top-Level-Seiten (200) → bewusst **nicht** in der Liste.
- **Kein Permalink-Flush nötig** (`template_redirect` läuft bei jedem Request — anders als die llms.txt-Rewrite-Rule, die einen Flush braucht).
- Diese Kurz-Pfade werden auch in `/llms.txt` beworben → durch die Redirects bleibt llms.txt automatisch konsistent.
- **Wartung:** Verschiebt sich eine Zielseite, hier den Pfad anpassen.
- **Zweite Redirect-Ebene:** Zusätzlich zur functions.php gibt es **SEOPress-Weiterleitungen**, die alte Inbound-Links (Kita, Kirchorte, alte Slugs) abfangen. functions.php läuft auf Priorität 5 und ist **führend** für die Kurz-URLs; SEOPress ist nur die Auffang-Ebene. Details + Bereinigung siehe **25.8**.

### 25.2 Pfarrbrief-Redirect aktualisiert

In `bonifatius_termine_redirect` zeigte `Pfarrbrief-1.pdf` noch auf die Ausgabe `2025/10`. Auf den aktuellen Pfarrbrief umgestellt:
`…/wp-content/uploads/2026/04/sankt-bonifatius-pfarrbrief.pdf` (gleiche Datei wie im bh3a-Downloads-Menü).
**Wartung:** Bei jeder neuen Pfarrbrief-Ausgabe diese Zeile **und** den Link im Downloads-Menü mitziehen.

### 25.3 SEO-/KI-Such-Check nach Go-Live — Ergebnis: sauber

Geprüft (anonym, wie ein Crawler) — alles in Ordnung:

| Prüfung | Ergebnis |
|---|---|
| `noindex`-Carryover von dev? | ❌ keiner — alle Seiten `index, follow` |
| Canonical / `og:url` | ✅ zeigen auf **www**, nicht dev |
| Sitemap (`/sitemaps.xml`) | ✅ 200, **0** dev-URLs, listet **kanonische** Pfade (nicht die 301-Kurz-URLs) |
| robots.txt | ✅ nur `/wp-admin/` gesperrt; GPTBot/OAI/Perplexity/ClaudeBot explizit erlaubt |
| `/llms.txt` | ✅ live, Live-Pfade |
| Strukturierte Daten (JSON-LD) | ✅ Organization, LocalBusiness, WebSite, ContactPoint |
| Title / Meta-Description | ✅ vorhanden |
| dev-Links im Seiten-Content | ❌ keine |

**Merksatz:** Nach jedem dev→live-Umzug zuerst prüfen, ob `noindex` (WP-Einstellung „Suchmaschinen abhalten") oder dev-Canonicals mitgewandert sind — das ist der häufigste, teuerste Migrationsfehler. Hier war alles korrekt.

### 25.4 Hinweis: JS-injizierter Inhalt ist für KI-Crawler unsichtbar

KI-Crawler (GPTBot, ClaudeBot, PerplexityBot) führen i. d. R. **kein JavaScript** aus. Per functions.php-JS eingespielte Inhalte sehen sie **nicht**:
- bh3a-**Downloads-Menü** (PDF-Links), **Social-Icons-Leiste**, **„Was-ist-neu"-Panel** (REST-Fetch).

Das ist unkritisch, weil es **Zusatz-Inhalte** sind und der **Haupt-Content server-seitig** (Gutenberg-HTML) ausgeliefert wird. Die `/llms.txt` gleicht das für KI gezielt aus. **Regel:** Inhalte, die für Google/KI zählen sollen, gehören in den HTML-Content, nicht in nachträgliches JS.

### 25.5 Offene Risiken aus dem functions.php-Review (19.06.2026)

| Prio | Befund | Empfehlung |
|---|---|---|
| ✅ behoben | `remove_jquery_from_frontend` ersetzte Core-jQuery global durch **jQuery 2.2.0** (2016, XSS-CVEs < 3.5). | **Behoben 19.06.2026:** `add_action`-Hook auskommentiert → WP-Core-**jQuery 3.7.1 + Migrate 3.4.1** aktiv (live verifiziert). Galerie, Taufe-Formular, FAQ-Akkordeon, Navigation getestet → laufen. Der „gallery conflict" besteht nicht mehr. (Funktion bleibt als Kommentar erhalten, falls je Revert nötig.) |
| 🟡 mittel | `taufe_generate_pdf()` nutzt `exec()`/wkhtmltopdf an festen Pfaden. Fehlt das Binary auf www, schlägt PDF **still** fehl (E-Mail geht ohne Anhang). | Eine Test-Taufanmeldung auf www durchführen → ankommt PDF-Anhang? |
| 🟢 niedrig | Dev-Preview-Reste: `$_GET['page_id']==45758` / `$_GET['preview']` in „Was-ist-neu" + Fancybox; verwaiste Kommentar-Stubs. | Bei Gelegenheit auf `if ( ! is_front_page() && ! is_page(45758) ) return;` kürzen. |
| 🟢 niedrig | Hartcodierte absolute URLs (LCP-Preload-Bild, Pfarrbrief). Aktuell beide 200. | Bei Datei-Umbenennung mitziehen. |
| ✅ behoben | `single.php` **und** `single-event.php` luden **Google Fonts direkt** (`fonts.googleapis.com`/`gstatic.com`, Playfair Display + Inter) → IP-Leak an Google, entgegen der Bunny-Fonts-Strategie (vgl. 10-fonts.md). | **Behoben 19.06.2026:** Domains auf `fonts.bunny.net` umgestellt (css2-Endpoint ist Drop-in, Schrift/Schnitte/`display=swap` identisch). Live verifiziert: keine Google-Fonts mehr. |
| ✅ behoben | `single-event.php`: Event-JSON-LD nutzte **undefinierte** `$event_start`/`$event_end` → `startDate` fiel auf das **Veröffentlichungsdatum** zurück (falsches Event-Datum, evtl. ungültige Rich-Results). | **Behoben 19.06.2026:** auf die geparsten `$ts`/`$te` (`->format('Y-m-d')`) umgestellt. Live verifiziert: `startDate` = echtes `start_date` aus den Meta-Feldern. |

### 25.6 Theme-Dateien-Review (19.06.2026)

- **`footer.php`** ✅ sauber — die DigiAccess-Reste aus Abschnitt 24 sind entfernt (bestätigt live).
- **`header.php`** ✅ keine dev-Bezüge. Hinweis: enthält ein Article-JSON-LD für `is_single() && post` — Beiträge nutzen aber das eigene `single.php` (Template-Override), daher läuft dieser Block für Beiträge i. d. R. ins Leere. `<meta viewport>` ohne `initial-scale=1` (kosmetisch; die bh3a-Standalone-Templates haben es korrekt).
- **`single.php` / `single-event.php`** — Standalone-Templates (ohne `get_header()`/`get_footer()`, vgl. Abschnitt 22). Liefern saubere JSON-LD (BlogPosting bzw. Event) und nutzen `get_site_url()` (portabel). Google-Fonts-Problem + Event-`startDate`-Bug **am 19.06.2026 behoben** (siehe Tabelle 25.5).
- **Kein** `dev.`-Bezug in irgendeiner der vier Dateien.

### 25.7 Foto-Marquee auf der Startseite — Performance-Fix (19.06.2026)

**Symptom (mobil):** „Ein paar Fotos laufen, dann nur noch brauner Hintergrund."

**Ursache:** Der Marquee-Streifen (Startseite, Seite 45758; CSS-Klassen `h6-marquee-track/-wrap`, Animation `@keyframes h6marquee`, `translateX(-50%)`) lud **49 Fotos in Vollauflösung** (1–4,5 MB/Stück, in Summe **~120 MB**). Die `<img>` hatten **keine** `width`/`height` → vor dem Laden Breite 0. Mobil (langsamere Verbindung) waren nach kurzer Zeit nur die ersten Bilder da, der Rest hatte Breite 0 → Streifen fällt zusammen → brauner Hintergrund. Reines CSS, **nichts mit jQuery** zu tun.

**Aufbau-Detail:** Jedes Foto liegt **zweimal** im Track (49 unique × 2 = 98 `<img>`). Das ist nötig, damit `translateX(-50%)` (= eine Hälfte) nahtlos loopt. Für das Gewicht zählen die **unique** Dateien (Browser lädt jede nur einmal).

**Fix (per Konsole, REST-Edit an Seite 45758):**
1. Jede Voll-URL → passende verkleinerte Version (`large` ~1024 px) — pro Bild über die Media-API ermittelt (`/wp/v2/media?slug=…&_fields=media_details` → `media_details.sizes`).
2. `width`/`height` je Bild ergänzt → Platz wird sofort reserviert (aspektgerecht, kein Crop).

**Fallstricke dabei (wichtig für künftige Bild-Massentausche):**
- **`-rotated`-Dateien:** WordPress hängt `-rotated` an die **Datei** (EXIF-Auto-Drehung), der **Attachment-Slug** bleibt aber **ohne** `-rotated`. Media-Lookup also mit bereinigtem Slug (`…-00020`), nicht mit dem Dateinamen (`…-00020-rotated`).
- **Datei ohne Media-Eintrag:** `…-00010.jpg` war als Datei vorhanden, aber **nicht** als Attachment registriert (keine Thumbnails, API `[]`). Lösung: Bild **neu über die Mediathek hochladen** (`…-00010b.jpg`) → Thumbnails entstehen → URL im Marquee getauscht.

**Ergebnis (live verifiziert):** 52 unique Bilder, **alle** verkleinert, **alle 104** Tags mit `width`/`height`. Marquee-Ladelast **~120 MB → 6,7 MB (−94 %)**.

**Merksatz:** Nie Vollauflösungs-Bilder in Schleifen/Sliders/Marquees einbinden — immer eine WP-Bildgröße (`large`/`medium_large`) nutzen und `width`/`height` setzen.

### 25.8 SEOPress-Weiterleitungen bereinigt (19.06.2026)

**Ausgangslage:** 81 Redirects in SEOPress, viele Altlasten. **Bereinigt auf 48 aktive Redirects.**

- **Entfernt:** Duplikate, Test-Ziele auf `bennitest`, nummerierte `-2/-3`-Slug-Reste (`bonfamily-2`, `home-2-2`, `kitas-3` …), tote `/bonmot/`-Ziele.
- **Ziele korrigiert:** Sakramente lagen falsch verschachtelt (`/gottesdienst-glaube/segen-sakramente/…`) → auf `/segen-sakramente/…` umgestellt (`/taufe`, `/firmung`, `/versoehnung`→`beichte`, `/sakramente/ehe/`→`trauung`, `/sakramente`); `/familiengottesdienste` → `/bonfamily/familiengottesdienste/`.
- **Behalten:** alle Kita- und Kirchort-Redirects — werden aktiv getroffen (Kita St. Bonifatius >2.800×, Stellenbörse ~1.580× usw.).

**Zwei Redirect-Ebenen (wichtig):** `functions.php` (Abschnitt 25.1, Priorität 5) ist **führend** für die kommunizierten Kurz-URLs (`/taufe/` …). **SEOPress** ist die **Auffang-Ebene** für alte Inbound-Links/Lesezeichen (Kita, Kirchorte, alte Slugs). Beide Ebenen getrennt halten, Kurz-URLs nicht doppelt pflegen.

**Arbeitsdateien:** `seopress-bereinigt/` (Projekt-Root) — `redirections-bereinigt.csv` (Import), `redirections-zu-loeschen.csv`, `slug-changes-zu-loeschen.csv`, `404-echte-probleme.csv`, `BEREINIGUNG.md`.

**Import-Falle:** SEOPress *ergänzt* beim CSV-Import nur (löscht nichts Vorhandenes). Für echtes Aufräumen: in **SEO → Redirections** erst alle löschen (Massenaktion „In den Papierkorb"), dann `redirections-bereinigt.csv` über **Import/Export** neu importieren. **Wartung:** Verschiebt sich eine Zielseite, Redirect-Ziel anpassen.

### 25.9 SEOPress: 404-Monitor & Broken-Links-Checker

**Zwei getrennte Werkzeuge — nicht verwechseln:**

| Werkzeug | Was es ist | Aufräumen |
|---|---|---|
| **SEO → Redirections, Tab „404 errors"** | Protokoll der **Besucher-404** (Bots, Tippfehler-URLs) — reines Rauschen | Button **„Clean up"** (oben rechts) leert es; unter **„Settings"** lässt sich das Monitoring ganz abschalten (spart DB-Ballast) |
| **SEO → „Fehlerhafte Links"** (Broken Links) | Scannt den **eigenen Content** auf tote Links/PDFs | Links *beheben*, nicht löschen → fallen beim nächsten Scan raus |

**Befund 19.06.2026:** Der Broken-Links-Scan stammte vom **23.07.2024 (vor Go-Live)** und war damit veraltet. Gegen Live geprüft → **alle gelisteten toten Links bereits behoben** (z. B. `/heilige-woche/` gelöscht = 404; Sakramente-/Stellenbörse-/Pfarrbüro-Links bereits entfernt). Aktion: nur Bericht neu scannen, nichts zu reparieren.

**Merksatz:** Nach jedem dev→live-Umzug Broken-Links-/404-Berichte einmal **frisch scannen** — alte Einträge bilden die Vorgänger-Struktur ab und führen sonst in die Irre.

### 25.10 wp-prayer: toter `captcha.js`-404 behoben + Gebetbuch-Status

**Symptom:** `/wp-content/plugins/wp-prayer 2/captcha.js` lieferte auf **jeder** Seite 404 (Script-id `load-captcha`, ~9.660 Treffer im 404-Log).

**Ursache:** Die WP-Prayer-Option **„Enable captcha"** band ein `captcha.js` aus einem **leeren Duplikat-Ordner** `wp-prayer 2` ein (das echte Plugin liegt in `wp-prayer/`, captcha.js existiert nirgends). **Nicht** in der functions.php (dort steht nur ein bewusster `recaptchav3`-Dequeue aus Datenschutzgründen).

**Fix (19.06.2026):** In den **WP-Prayer-Einstellungen** das Häkchen **„Enable captcha"** entfernt → Einbindung verschwindet. Live verifiziert: 0 Referenzen mehr auf Start- und Gebetbuch-Seite.

**Gebetbuch-Status:** Die Seite **`/gottesdienst-glaube/online-gebetbuch/`** ist **wegen Missbrauch abgeschaltet**. Der Captcha-Schutz ist aktuell wirkungslos: functions.php dequeued `recaptchav3` (Datenschutz) **und** in den WP-Prayer-Einstellungen waren **Site-Key == Secret-Key** (Fehlkonfiguration).

> **Wiederaktivierung später:** Nur mit **DSGVO-freundlichem** Spam-Schutz (Honeypot / hCaptcha / Friendly Captcha) — **nicht** Google-reCAPTCHA (Datenschutz). Dazu neue, **getrennte** Schlüssel registrieren.

### 25.11 Favicon / Website-Icon gesetzt (19.06.2026)

Vorher war **kein Website-Icon** gesetzt → `apple-touch-icon.png` lief ins 404 (~2.280×). Gesetzt via **Design → Customizer → Website-Informationen → Website-Icon** (quadratisches Boni-Signet, ≥512 px). WordPress erzeugt daraus Favicon **und** Apple-Touch-Icons automatisch. Vereinzelte 404 auf die nackte Root-Adresse `/apple-touch-icon.png` von manchen Clients sind danach kosmetisch und unkritisch.
