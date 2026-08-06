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
