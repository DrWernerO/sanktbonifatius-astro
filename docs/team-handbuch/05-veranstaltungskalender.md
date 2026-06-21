# 05 · Veranstaltungskalender (selbst aktualisierend)

**Kritisch wichtig.** Der Kalender ist der einzige Inhaltsblock, der sich ohne Redaktions-Eingriff aktuell hält.

Live im Einsatz in:
- **home6** (Post 45758) — alle Termine
- **bonfamily2** (Post 45898) — gefiltert auf Kategorie „BonFamily"

Er kann ebenso einfach in jede neue Seite eingebaut werden.

---

## Aufbau

### HTML (statisch, in der Seite)

```html
<section class="bh2-vt">
  <div class="bh2-vt__inner">
    <div class="bh2-vt__head">
      <h2 class="bh2-vt__hl">Unsere nächsten Veranstaltungen</h2>
      <a href="/terminkalender/" class="bh2-vt__more">Alle Termine →</a>
    </div>
    <div class="bh2-vt__grid">
      <div id="bh2-vt-card1" class="bh2-vt-card bh2-vt-card--loading">Lädt …</div>
      <div id="bh2-vt-card2" class="bh2-vt-card bh2-vt-card--loading">Lädt …</div>
      <div id="bh2-vt-list"  class="bh2-vt-list">
        <h3 class="bh2-vt-list__hl">Weitere Termine</h3>
        <div id="bh2-vt-list-items" class="bh2-vt-list__items">Lädt …</div>
      </div>
    </div>
  </div>
</section>
```

Drei Platzhalter: zwei große Karten + eine Liste. Das JavaScript füllt sie beim Seitenaufruf.

### CSS
Aus home6 (Zeichen ~47859–48828 im Raw-Content). Enthält `.bh2-vt*`-Regeln mit 61 Deklarationen. Kann per Script-Extraktor herausgefiltert werden:

```javascript
// Extrahiere nur bh2-vt-Regeln aus home6-Stylesheet
function extractCssRules(cssText, prefixes) {
  const rules = [];
  let pos = 0;
  while (pos < cssText.length) {
    const open = cssText.indexOf('{', pos);
    if (open < 0) break;
    let depth = 1, i = open + 1;
    while (i < cssText.length && depth > 0) {
      if (cssText[i] === '{') depth++;
      else if (cssText[i] === '}') depth--;
      i++;
    }
    const selector = cssText.substring(pos, open).trim();
    const body = cssText.substring(open, i);
    if (selector && prefixes.some(p => selector.includes(p)))
      rules.push(selector + body);
    pos = i;
  }
  return rules.join('\n');
}
```

### JavaScript (selbst aktualisierend)

Das Script fetcht WordPress-Events per REST-API und rendert sie. Technische Eckpunkte:

**Endpoint:**
```
/wp-json/wp/v2/event?per_page=30&_embed
```

**Wichtig:** Der `&`-Separator zwischen Query-Parametern muss über `String.fromCharCode(38)` erzeugt werden, weil WordPress `&` im Content zu `&#038;` encoden und dann den Fetch brechen würde.

```javascript
fetch('/wp-json/wp/v2/event?per_page=30'+String.fromCharCode(38)+'_embed')
  .then(r => r.json())
  .then(function(all){ /* filtern, sortieren, rendern */ });
```

**Event-Felder aus der API-Response:**

```json
{
  "id": 41228,
  "title": {"rendered": "Kreativgottesdienst"},
  "link": "...",
  "event-category": [2584, 2586],        // Array von Term-IDs
  "event_meta": {
    "start_date": "20260528",             // YYYYMMDD
    "end_date": "",
    "times": "20:00 Uhr",
    "subtitle": "Untertitel des Events",
    "location": "St. Bonifatius",
    "church": "bonifatius",
    "image": "45594"                      // Featured-Media-ID
  }
}
```

**Pipeline des Scripts:**
1. `fetch` → Array aller Events
2. Filter: Nur Events mit gültigem `start_date` **und** Datum ≥ heute
3. Sort: aufsteigend nach `start_date`
4. Erste 2 Events → Cards (mit Bild, Titel, Datum, Uhrzeit, Ort, Link)
5. Bild per separatem Fetch: `/wp-json/wp/v2/media/{image-id}`
6. Restliche Events (3–8) → Liste rechts

---

## Kategorie-Filter (BonFamily-Variante)

Auf bonfamily2 sollen nur Events mit Kategorie „BonFamily" (Term-ID **2586**) angezeigt werden. Lösung: Query-Parameter anhängen:

```javascript
fetch(
  '/wp-json/wp/v2/event?per_page=30'
  + String.fromCharCode(38) + 'event-category=2586'
  + String.fromCharCode(38) + '_embed'
)
```

**Term-IDs der Event-Kategorien** (ermittelt aus einem Termin im Editor):

| Kategorie | Term-ID |
|---|---|
| Allgemein | 2584 |
| BonFamily | 2586 |
| Gottesdienst + Glaube | 2587 |
| Kultur & Begegnung | 2588 |
| Jugend | 2589 |
| Engagiert Leben | 2590 |

Für andere Kirchort-/Thema-Seiten einfach die passende ID einsetzen.

---

## Wie man die Kategorie-ID einer Kategorie findet

1. Im WP-Admin einen beliebigen Event öffnen (`post_type=event`).
2. In der Seitenleiste die Kategorie-Checkboxen sind alle Input-Felder mit `name="tax_input[event-category][]"`.
3. Der `value` jeder Checkbox ist die Term-ID.

```javascript
// Im Event-Editor-Tab:
Array.from(document.querySelectorAll('input[name*="tax_input"]'))
  .map(cb => ({label: cb.parentElement.textContent.trim(), id: cb.value}));
```

---

## Einbau in eine neue Seite

1. Im WP-Admin: Seite bearbeiten → Custom-HTML-Block am gewünschten Ort einfügen.
2. Content = **Style + HTML + Script** (ca. 10 KB) — komplett aus home6 übernehmen.
3. **Optional:** Script um `event-category=XXXX` erweitern.
4. Speichern.
5. Live-Seite im Inkognito-Tab öffnen → Termine werden dynamisch geladen.

**Niemals:** Termine händisch in die Seite schreiben. Das bricht mit jedem neuen Event.

---

## News-Script (verwandt, aber anders)

Neben `bh2-vt-*` gibt es in home6 auch einen News-Loader, der die WordPress-Beiträge für den Aktuelles-Grid holt. Das ist ein separates `<script>` (beginnt mit `var ng`). **Nicht** mit dem Veranstaltungs-Script vermischen — sie sind funktional unterschiedlich.

Indikatoren:
- `script.includes('bh2-vt-card')` → Veranstaltungen
- `script.includes('bh2-news')` → News

**Details zum News-Grid** (Beitragsbild- und Untertitel-Logik, Fehlerbehebung): siehe `06-technische-loesungen.md`, Abschnitt 23.

---

## Fehleranalyse

- **Kein Termin wird geladen** → In der Browser-Konsole nach Fetch-Fehlern schauen. Oft ist der `&`-Separator schuld (siehe oben).
- **Falsche Events** → Prüfen, ob der Kategorie-Filter stimmt (IDs oben).
- **Alte Events erscheinen** → Filter `start_date >= heute` prüfen. `YYYYMMDD` wird direkt lexikografisch sortierbar.
- **Bilder fehlen** → `event_meta.image` ID muss stimmen. Falls leer, Fallback auf Platzhalter.
