# Kirchort-Aufbau-Routine

> Diese Routine gilt für jede neue Kirchort-Hauptseite und jede Unterseite.
> Sie verhindert die häufigsten Fehler: fehlende Grid-CSS, falsche Karten-Orientierung,
> Bilder die 404 liefern, und Abweichungen vom WP-Original-Design.

---

## Phase 1 — VOR dem Bauen: WP-CSS extrahieren

Vor dem ersten Code immer das Live-WP-CSS vollständig holen und die Schlüsselwerte notieren.

```bash
export WP_PASS="$(cat ~/.config/sb-wp/wp_pass)"
curl -s --user "f.hoffmann@sanktbonifatius.de:$WP_PASS" \
  "https://www.sanktbonifatius.de/wp-json/wp/v2/pages?slug=SLUG&per_page=1" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
content = d[0].get('content',{}).get('rendered','')
# CSS-Block ausgeben
idx = content.find('<style')
end = content.find('</style>', idx) + 8
print(content[idx:end])
"
```

**Was notieren:**
- Primärfarbe und CSS-Tokens (`--g`, `--gd`, `--gs`, `--cream`, `--ink`, `--mute`)
- Grid-Definition: `grid-template-columns`, `gap`
- Karten-Padding, `border-radius`, `box-shadow`
- Team/Personen-Grid: `grid-template-columns`, Foto-Größe
- Container: `max-width` (meist 1280px), ggf. engere max-widths für Team (`1100px`) und FAQ (`840px`)

---

## Phase 2 — BEIM Bauen: Checkliste pro Komponente

### Jede Komponente mit einem Grid-Layout:
- [ ] `.astro-XX-grid` hat `display:grid; grid-template-columns:...; gap:...` **direkt in dieser Komponente** — nie darauf verlassen, dass eine andere Komponente es mitdefiniert.
- [ ] `.two`-Variante vorhanden falls 2-spaltig gebraucht: `.astro-XX-grid.two { grid-template-columns:repeat(2,1fr) }`

### Team- / Kontaktkarten:
- [ ] Foto **links**, nicht oben oder zentriert.
- [ ] Muster: `grid-template-columns:120px 1fr; column-gap:24px; align-items:center`
- [ ] Foto-Element: `grid-row:1/span 99; width:120px; height:120px; border-radius:50%`
- [ ] Referenz: `src/components/HjTeam.astro` (Herz-Jesu) oder `src/components/ApTeam.astro` (St. Aposteln)

### Bilder:
- [ ] Für jedes verwendete Bild prüfen: `curl -o /dev/null -w "%{http_code}" http://localhost:4321/uploads/YYYY/MM/datei.jpg`
- [ ] 404 → Bild lokal spiegeln: `curl -s -o public/uploads/YYYY/MM/datei.jpg https://www.sanktbonifatius.de/wp-content/uploads/YYYY/MM/datei.jpg`
- [ ] WP liefert Thumbnail-Varianten (z.B. `-1024x683`). Diese als eigene Dateien herunterladen, nicht die Originalgröße erwarten.

### CSS-Tokens:
- [ ] Primärfarbe und Tokens als CSS-Variablen im `:root`-Block der Hauptseite definiert (z.B. `--kw-g:#...` für Kirchort Wendel).
- [ ] Alle Komponenten verwenden die Tokens — keine hardcodierten Farbwerte außer in Ausnahmen.

---

## Phase 3 — NACH dem ersten Aufbau: CSS-Verifikation

Nach dem ersten Render im Browser die berechneten Werte der Schlüssel-Elemente prüfen:

```js
// Im Browser-Preview ausführen (preview_eval):
(() => {
  const checks = [
    ['.astro-XX-grid', 'gridTemplateColumns'],
    ['.astro-XX-card', 'borderRadius'],
    ['.astro-XX-person', 'gridTemplateColumns'],
    ['.astro-XX-in', 'maxWidth'],
  ];
  return checks.map(([sel, prop]) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, error: 'nicht gefunden' };
    return { sel, [prop]: getComputedStyle(el)[prop] };
  });
})()
```

**Erwartete Werte (WP-Standard):**
- Hauptgrid: 3 gleiche Spalten (ca. `280px 280px 280px` bei 1280px Container)
- Team-Grid: `120px + Rest` (oder 96px bei kleineren Karten wie WP-Original)
- Container `astro-XX-in`: max-width 1280px, margin auto

---

## Phase 4 — Abschluss: Dokumentation aktualisieren

- [ ] `docs/SEITENVERZEICHNIS.md` ergänzen (Pfad, Status ✅, Page-ID, Bemerkung, Zähler oben)
- [ ] Commit mit Prefix `Feat:` für neue Seiten, `Fix:` für Korrekturen, `Doku:` für reine Doku-Änderungen

---

## Bekannte Fallstricke (aus bisherigen Seiten gelernt)

| Problem | Ursache | Lösung |
|---|---|---|
| Karten breiter und flacher als in WP | Grid-CSS fehlt in der Komponente | `display:grid; grid-template-columns:repeat(3,1fr)` in jede Komponente |
| Team-Foto oben statt links | `flex-direction:column` statt Grid | `grid-template-columns:120px 1fr; grid-row:1/span 99` |
| Bild zeigt graue Fläche (404) | Bild nicht in `public/uploads/` | Bild mit `curl` von WP herunterladen |
| Styles einer Komponente überschreiben eine andere | `is:global` + gleicher Klassenname | Immer eigenen Kirchort-Präfix verwenden (nie generische Namen) |
| Unterschied im Padding/Spacing | WP-CSS aus `content.rendered` nicht vollständig übernommen | Phase 1 komplett durchführen, alle Werte notieren |
