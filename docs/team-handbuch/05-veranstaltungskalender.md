# 05 · Veranstaltungskalender — Event-Kategorien (Referenz)

> Der Kalender selbst ist in Astro als eigene Komponente `EventCalendar.astro`
> (Präfix `astro-ev`) implementiert — siehe `ASTRO-HANDBUCH.md` §7. Diese Datei ist nur
> noch die Referenztabelle für die Kategorie-IDs, die beim Bau neuer Seiten gebraucht
> werden (siehe `ASTRO-QUICKREF.md`, „Typisches Vorgehen neue Seite").

## Event-Kategorien (Term-IDs)

| Kategorie | Term-ID |
|---|---|
| Allgemein | 2584 |
| BonFamily | 2586 |
| Gottesdienst + Glaube | 2587 |
| Kultur & Begegnung | 2588 |
| Jugend | 2589 |
| Engagiert Leben | 2590 |

## Wie man die Kategorie-ID einer (neuen) Kategorie findet

1. Im WP-Admin einen beliebigen Event öffnen (`post_type=event`).
2. In der Seitenleiste sind die Kategorie-Checkboxen Input-Felder mit
   `name="tax_input[event-category][]"`.
3. Der `value` jeder Checkbox ist die Term-ID.

```javascript
// Im Event-Editor-Tab (Browser-Konsole):
Array.from(document.querySelectorAll('input[name*="tax_input"]'))
  .map(cb => ({label: cb.parentElement.textContent.trim(), id: cb.value}));
```

## Event-Felder aus der WP-REST-API

Falls für eine neue Astro-Komponente direkt gebraucht (`event_meta`):

```json
{
  "id": 41228,
  "title": {"rendered": "Kreativgottesdienst"},
  "event-category": [2584, 2586],
  "event_meta": {
    "start_date": "20260528",
    "end_date": "",
    "times": "20:00 Uhr",
    "subtitle": "Untertitel des Events",
    "location": "St. Bonifatius",
    "church": "bonifatius",
    "image": "45594"
  }
}
```

Datumsformat `YYYYMMDD` — direkt lexikografisch sortierbar.

---

## Neue Termine anlegen (Redaktions-Workflow im WordPress)

> Dies beschreibt das **Eintragen** neuer Termine (`post_type=event`) direkt im WordPress
> (nicht Astro). **Erprobt am 02.07.2026** am kompletten Halbjahresprogramm H2/2026
> (~85 neue + ~9 ergänzte Termine); die Regeln sind das Ergebnis mehrerer Korrekturschleifen
> mit Werner — bitte genau so einhalten. WP-Zugang/App-Passwort: siehe `02-zugang-wordpress.md`.

### ⚠️ Voraussetzung: Werner muss Claude einloggen (immer zuerst ansprechen!)
Das WordPress-Backend liegt auf **`cms.sanktbonifatius.de`** (nicht www). Die Terminfelder gehen **nur übers Formular** — dafür muss Claude in einem eingeloggten Browser sein. Claude hat **keinen** eigenen Login (nur das REST-App-Passwort; Passwörter/Captchas darf Claude nicht eintippen).

**Claude sagt Werner ganz zu Beginn:** _„Bitte logg dich im cms in meinem (eingebauten) Browser ein, damit ich Termine hochladen kann."_ Ablauf (verifiziert 2026-09-06):
1. Claude öffnet die **versteckte Login-Seite** im eingebauten Browser: **`https://cms.sanktbonifatius.de/heimat`** (die normale `wp-login.php` gibt 404 — Login ist durch das Sicherheits-Plugin AIOS verlegt).
2. **Werner** tippt Benutzername + Passwort und löst die kleine Rechen-Captcha, klickt „Anmelden".
3. Danach übernimmt Claude im selben Fenster: `post-new.php?post_type=event` öffnen, Felder füllen, veröffentlichen.

Alternativ: Werners echtes Chrome mit der Claude-in-Chrome-Erweiterung (die Erweiterung muss verbunden sein). Test-Ergebnis 2026-09-06: Anlegen/Speichern übers Formular funktioniert einwandfrei (`event_meta` wird korrekt gebaut).

### Grundregeln
- **Ein eigener Eintrag pro Datum.** Serientermine (Fiat Lux 5×, Taizé 5×, Ökumene, Familiengottesdienste, St. Martin, Klettertag …) werden je Datum ein eigener Event — der Kalender zeigt/sortiert pro Termin nur *ein* `start_date`.
- **Direkt veröffentlichen** (Standard). Ausnahme: **kein Datum bekannt → als Entwurf** speichern (`#save-post` statt `#publish`) und auf die Fehlliste.
- Datum-Speicherformat: **`JJJJMMTT`** (z. B. `20261004`). Mehrtägig zusätzlich `end_date` (z. B. Skifreizeit, Bücherflohmarkt).

### Textregeln (wichtig — mehrfach von Werner korrigiert)
- **Beschreibung = wortwörtlich** aus der Quelldatei. **Nicht** kürzen, umformulieren oder zusammenfassen.
- **Unter die Beschreibung** kommt die **Termin-/Zeit-/Ort-Angabe in FETT** (`<p><strong>…</strong></p>`), in der Formatierung der Quelldatei.
- Bei **Reihen**: unter der Beschreibung steht **nur der aktuelle Termin** (die eine Datumszeile dieses Eintrags), fett.
- **Ausnahme „100 Jahre"**: dort stehen ausdrücklich **beide** Datumszeilen (Eröffnung + Abschluss) in jedem der zwei Einträge.
- **Untertitel**: vorhandenen aus der Quelle übernehmen; sonst einen einladenden generieren.
- **SEO**: Titel + Meta-Description (150–160 Zeichen) füllen.
- Redaktionsnotizen der Quelle (z. B. „(fehlt hier noch!!!)", „(MKö)") **nicht** übernehmen → auf die Fehlliste.

### ⚠️ Kritisch: `event_meta` ist per REST nur LESBAR
Die Terminfelder liegen im ACF-Meta bzw. in `event_meta`. Ein `POST` auf `event_meta` (oder die ACF-`meta`) via REST wird mit HTTP 200 quittiert, aber **nicht gespeichert** (kommt leer zurück). Die Terminfelder **müssen über das Admin-Formular** (ACF-Metabox „Termine") gespeichert werden — erst der Formular-Speichervorgang baut `event_meta` korrekt auf. REST/curl nur für **Foto-Upload, Verschieben, Kategorie und Verifikation** nutzen.

### Vorab: Bestand prüfen (Dubletten vermeiden!)
**Ein Teil der Termine existiert oft schon** (frühere Durchgänge). **Vor** dem Anlegen je Sparte den Bestand abfragen und mit der Quelle abgleichen:
```bash
curl -s -u "$WP_USER:$WP_PASS" \
  "$WP_API/wp/v2/event?per_page=100&context=edit&event-category=<CAT-ID>&_fields=id,title,event_meta&orderby=date&order=asc" \
  | python3 -c "import sys,json;[print((e.get('event_meta') or {}).get('start_date'),e['id'],e['title']['rendered']) for e in json.load(sys.stdin)]"
```
- **Existiert schon** → nicht neu anlegen, sondern prüfen, ob **Beschreibung, Bild, Datum, SEO vollständig** sind; sonst im Formular ergänzen/überschreiben. Beim Nachtragen unbedingt das **Bild-Feld** setzen — bei manchen Altbeständen ist das ACF-Bildfeld leer, obwohl `event_meta.image` gefüllt ist; sonst wird das Bild beim Speichern gelöscht!
- **Kategorie** ist per REST setzbar (Taxonomie, anders als `event_meta`): `POST /wp/v2/event/<ID>` mit `{"event-category":[2587]}`.
- **Nicht** existent → neu anlegen.

### Formularfelder (ACF-Metabox „Termine", klassischer Editor)
`post-new.php?post_type=event` — Felder und ihre ACF-Keys:

| Feld | ACF-Key | Typ |
|---|---|---|
| Untertitel | `field_61763ed2a0c67` | text |
| Beschreibung | `field_61763eaaa0c66` | wysiwyg (TinyMCE) |
| Bild | `field_61763e69a0c65` | image (Attachment-ID) |
| Start Datum | `field_5a3b7cb95aed5` | date_picker (`JJJJMMTT`) |
| End Datum | `field_5a3b7d3e5aed6` | date_picker |
| Zeiten | `field_5a3b7d655aed8` | textarea |
| Ort | `field_5a3b7d755aed9` | textarea |
| Kirchort | `field_5a7c64aa7896f` | select: `bonifatius` / `aposteln` / `wendel` / `herz_jesu` |

Kategorie-Häkchen: `input[name="tax_input[event-category][]"]` (Term-IDs siehe Tabelle oben).
SEO (SEOPress): `_seopress_titles_title`, `_seopress_titles_desc`.
Speichern: Button **„Veröffentlichen"** (`#publish`). Danach per REST verifizieren (`event_meta` lesen).

Fill-Beispiel (im Admin-Tab, ACF-JS-API):
```javascript
acf.getField('field_61763ed2a0c67').val('Untertitel …');           // Untertitel
acf.getField('field_5a3b7cb95aed5').val('20261004');               // Start Datum
acf.getField('field_5a7c64aa7896f').val('bonifatius');             // Kirchort
acf.getField('field_61763e69a0c65').val(50886);                    // Bild (Attachment-ID)
// Beschreibung (wysiwyg): Textarea setzen UND tinymce.get(id).setContent(html); .save();
// Kategorie: input[value="2587"].checked = true;
```

### Effizienter Ablauf mit „Claude in Chrome"
Pro Event **ein `browser_batch`** mit `navigate → wait(2s) → javascript(füllen + #publish)`. Das Füll-Script setzt alle Felder, prüft per Rücklesen (`ok = Titel && start_date && Kategorie`) und klickt nur bei `ok` auf `#publish`. Danach per REST verifizieren.
- **Zwei Events pro `browser_batch`** gehen zuverlässig, wenn nach dem `#publish`-Klick **`wait(3s)`** vor dem nächsten `navigate` eingebaut wird (sonst bricht der Speichern-POST ab).
- Nach `#publish` landet der Tab auf `post-new.php?…wp-post-new-reload=true` → für den nächsten Event neu zu `post-new.php` navigieren.
- wysiwyg: **Textarea setzen UND** `tinymce.get(id).setContent(...); .save()` (sonst überschreibt der leere Editor beim Submit).

### Foto-Upload (REST — Browser-Upload ist gesperrt)
Die Claude-in-Chrome-Erweiterung erlaubt kein Hochladen lokaler Dateien über den „Bild hinzufügen"-Dialog (nur an den Chat angehängte Dateien). Daher **Foto per REST hochladen** und danach im Bild-Feld die Attachment-ID setzen:
```bash
# 1) Upload → gibt Attachment-ID zurück
curl -u "$WP_USER:$WP_PASS" -X POST "$WP_API/wp/v2/media" \
  -H "Content-Disposition: attachment; filename=slug.jpg" \
  -H "Content-Type: image/jpeg" --data-binary @foto.jpg
# 2) Titel/Alt (und ggf. Quelle als caption) setzen
curl -u "$WP_USER:$WP_PASS" -X POST "$WP_API/wp/v2/media/<ID>" \
  -H "Content-Type: application/json" -d '{"title":"…","alt_text":"…"}'
```

### Foto in den Mediathek-Ordner „Termine" einsortieren
Die Mediathek nutzt **Real Media Library (RML)**. Termin-Fotos gehören in den Ordner **„Termine" = ID 98**. Hochgeladene Bilder landen sonst in „Unorganisiert" (ID `-1`).
```bash
# In Ordner 98 verschieben — Parameter heißt "to" (nicht "folder")
curl -u "$WP_USER:$WP_PASS" -X PUT \
  "$WP_API/realmedialibrary/v1/attachments/bulk/move" \
  -H "Content-Type: application/json" -d '{"ids":[<ID>],"to":98}'
# Kontrolle: Zähler von Ordner 98 muss steigen
curl -u "$WP_USER:$WP_PASS" "$WP_API/realmedialibrary/v1/folders/content/counts"
```
RML-Ordner-IDs: `GET /realmedialibrary/v1/tree` (Name↔ID) bzw. `.../folders/content/counts` (ID↔Anzahl).

### Quellen-Hinweis bei Stock-Fotos
Bei Fotos aus **Pixabay / Unsplash / Pexels** ist eine Namensnennung **rechtlich nicht Pflicht**, aber empfohlen (DE-Rechtsklima). Werners Wunsch: Hinweis **in der Mediathek als Beschriftung**, nur die Plattform. Die Beschriftung (`caption`) ist bei Medien **per REST setzbar**:
```bash
curl -u "$WP_USER:$WP_PASS" -X POST "$WP_API/wp/v2/media/<ID>" \
  -H "Content-Type: application/json" -d '{"caption":"Foto: Pixabay"}'
```
Quelle steht meist im Dateinamen (z. B. „…-Unsplash", „Fasching-Pixabay") oder in beiliegenden `Linkangaben.txt`/`Quelle-Links.txt`.

### Abschluss-Checkliste
1. Pro Sparte: Bestand geprüft, Dubletten vermieden, unvollständige Altbestände ergänzt.
2. Alle Fotos in Ordner „Termine" (98), Stock-Fotos mit `caption`.
3. Pro Kategorie per REST gegenzählen (`event-category=<ID>`, `event_meta.start_date >= heute`).
4. Undatierte Termine als Entwurf; Entwürfe per `?status=draft` auflisten.
5. **Fehlliste als Word-Datei** (python-docx): Tabellen „Foto fehlt" / „Infos/Anmeldung/Datum folgt" / „Foto externe Quelle". Ablage im jeweiligen Highlights-Ordner.

### Netz-Falle (dokumentiert 01.07.2026)
Chrome **und** die REST-/curl-Zugriffe erreichten das WordPress zeitweise nicht (`ERR_CONNECTION_TIMED_OUT` bzw. curl HTTP 000), während **Safari** die Seite lud — Ursache war ein Router-/IPv6-Problem im lokalen Netz, nicht WordPress. **Lösung:** Mac über einen anderen Zugang (Handy-Hotspot) verbinden. Reihenfolge zur Eingrenzung: andere Seite in Chrome testen → `chrome://policy` (verwaltet?) → Inkognito → Secure DNS/QUIC aus → **anderes Netzwerk**.
