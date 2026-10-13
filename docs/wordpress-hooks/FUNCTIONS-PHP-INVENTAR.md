# Inventar der WP-`functions.php` (Child-Theme `ursprung-bonifatius`)

Stand 2026-10-12, 1385 Zeilen / 74 KB. Gelesen im WP-Theme-Editor, **nichts verändert**.
Zeilennummern beziehen sich auf diesen Stand. Einstufung „vermutlich" = aus dem Code geschlossen, nicht getestet.

Parent-Theme: **URSPRUNG** (muss bleiben, solange das Child-Theme aktiv ist). Weitere Themes:
Twenty Twenty-Five (aktuell), -Four, -Three, -Two (unbenutzt, mit offenen Updates).
ACF-Feldgruppen liegen in der **Datenbank** (nicht im Theme) → überleben einen Theme-Wechsel.

## A · Wird von Astro gebraucht — muss erhalten bleiben
| Zeilen | Was | Warum wichtig |
|---|---|---|
| 201–444 | Post-Types `event`, `pin`, `podcast` + Taxonomie `event-category` | **Datenmodell.** Fehlt das, verschwinden Termine/News aus Admin und API |
| 737–746 | `rest_prepare_event` → `event_meta` | Terminfelder in der API (Astro liest sie) |
| 1196–1203 | REST-Feld `subtitle` für Beiträge | Untertitel der Beiträge |
| 1273–1315 | REST-Feld `pin_data` für News | Bild/Typ/Galerie/Video der News |
| 1237–1271 | Netlify-Rebuild bei Beitrag/Seite (Build-Hook-URL steht als Klartext in Zeile ~1247 — geheim behandeln) | Automatischer Rebuild |
| 1322–1352 | Rebuild bei Upload Pfarrbrief/Highlights/Monatsbrief/Tauftermine | dito |
| 1354–1385 | `sb_release_attachments` | verhindert 401 auf Termin-Bildern |
| 990 | Anwendungspasswörter aktiv | REST-Zugang für Claude/Skripte |
| 1127–1155 | Spalten/Sortierung der Termin-Liste im Admin | Bedienkomfort der Sekretärinnen |
| 471–480 | Login-Seitenstil | Optik der Anmeldung (`/heimat`) |

## B · Nur fürs frühere WP-Frontend — vermutlich überflüssig
`cms.` ist öffentlich als Frontend gesperrt (leitet auf die Hauptdomain um). Dazu gehören:
Stylesheet-/Script-Einbindung (11–52), jQuery entfernen (59), Menüs + Nav-Walker (91–112), Block-Stile
(119–175), Suche-Icon (451), `bh3a`-Seitenlogik (482–500), **Taufe-Anmeldung per WP-AJAX (504–703; Astro hat
eine eigene Route `/api/taufe-anmeldung`)**, Social-Header (705–731), 301-Weiterleitungen (748–765 und
1206–1235, wirken nur auf `cms.`), Lazy-Loading/Footer-Skripte (766–978), Dropdown-Fix (964–988),
robots.txt/llms.txt für `cms.` (992–1077), Download-Fix (1156–1194).
Dazu die Theme-Dateien `header.php`, `footer.php`, `single*.php`, `page.php`, Blöcke (`blocks/*`).

## C · Unklar — vor dem Entfernen prüfen
`1080–1125`: zwei `template_redirect`/`template_include`-Hooks und ein AJAX-Hook `rest-nonce`
(könnte vom Admin oder vom Termin-Editor gebraucht werden).

## Empfehlung zum Theme
**Nicht das Theme wechseln**, sondern Gruppe A in ein kleines eigenes Plugin („SB Headless") auslagern:
1. Backup (DB + Dateien), idealerweise erst auf einer Kopie (Staging) ausprobieren.
2. Plugin mit Gruppe A anlegen. **Im selben Schritt** die gleichen Blöcke aus der `functions.php`
   entfernen, sonst gibt es doppelte Funktionsnamen → Fatal Error (weiße Seite).
3. Prüfen: `/wp-json/wp/v2/event|pin|posts` liefern Daten, Termin im Admin öffnen/speichern,
   ein Test-Beitrag löst den Rebuild aus.
4. Erst dann Theme durch ein minimales ersetzen (Gruppe B entfällt).
Aufwand: ein halber Tag mit Staging; ohne Staging nur mit frischem, getestetem Backup.

## Bereinigung der unbenutzten Standard-Themes
Twenty Twenty-Two/-Three/-Four sind unbenutzt (Updates offen) → löschen entfernt Angriffsfläche.
**Twenty Twenty-Five und das Parent-Theme URSPRUNG behalten.** Löschen nur auf Werners Freigabe.

## Aufräum-Protokoll (Stilllegung per `if ( false ) { … }`, nichts gelöscht)
Rückgängig: die erste Zeile `if ( false ) { // SB-STILLGELEGT-N …` und die Zeile `} // ENDE SB-STILLGELEGT-N` löschen.
Zusätzlicher Rückweg: KAS → Tools → Backups → Webspace-Backup (Einzeldatei wiederherstellen).
Gespeichert wurde jeweils von Werner im Theme-Editor (Skript-Speichern wird von der Umgebung blockiert).

| Datum | Schritt | Inhalt | Ergebnis |
|---|---|---|---|
| 2026-10-12 | 0 | Benutzerliste der REST-API nur für Angemeldete (neuer Block am Dateiende) | ✅ `/wp/v2/users` ohne Login → 404 |
| 2026-10-12 | 1 | `SB-STILLGELEGT-1`: alte WP-Taufe-Anmeldung (AJAX, nonce, PDF) | ✅ API/Admin/Website ok |
| 2026-10-12 | 2a | `SB-STILLGELEGT-2`: Social-Leiste · `SB-STILLGELEGT-3`: Core Web Vitals, bh3a-Skripte, Panel, Fancybox, Dropdown-Fix, reCAPTCHA | ✅ API/Admin/Website ok |
| 2026-10-12 | 2b | `SB-STILLGELEGT-4`: robots.txt/llms.txt von cms · `-5`: digiaccess-Skripte + Downloads-Menü (altes Frontend) · `-6`: Kurz-URL-Weiterleitungen auf cms | ✅ API/Admin/Website ok (Datei jetzt 75.703 Zeichen) |
| 2026-10-12 | 3 | `SB-STILLGELEGT-7`: Template-Hooks `single.php`/`single-event.php` (nur altes Frontend) | ✅ API/Admin/Website ok (Datei 75.921 Zeichen) |
| 2026-10-13 | 4 | `SB-STILLGELEGT-8`: `/termine/`- + Pfarrbrief-Weiterleitung · `-9`: QR-Weiterleitungen `/qr/…` (alle 9 live über Netlify geprüft; Reliquie + Orgel am 13.10. in `_redirects` ergänzt, Commit 853332b) | ✅ API/Admin/Website ok (Datei 76.392 Zeichen) |

Nach der Stilllegung der Frontend-Hooks gilt: in 2–4 Wochen ohne Auffälligkeiten dürfen die stillgelegten Blöcke endgültig gelöscht werden.

### Vorfall 2026-10-12 (Plugin „SB Headless")
Plugin-Versuch → „Cannot redeclare" → API/Admin ~15 Min. down; behoben über phpMyAdmin (`active_plugins`). Siehe `sb-headless/README.md`.

### Noch nicht stillgelegt (bewusst, Stand 2026-10-12)
`rest-nonce`-AJAX (`wp_ajax_rest-nonce`, Zweck unklar), Stylesheet-/Script-Einbindung, Menü-Setup + Nav-Walker,
Block-Registrierung, Login-Stil. Vorgehen wie bisher: Block für Block, Schalter, Prüfung.
**Geklärt (Werner, 2026-10-12):** digiaccess wird nicht mehr gebraucht — Astro hat ein eigenes Barrierefreiheitstool.

### Themes
Twenty Twenty-Two/-Three/-Four wurden am 2026-10-12 von Werner gelöscht. Übrig: Sankt Bonifatius (aktiv), URSPRUNG (Parent), Twenty Twenty-Five (Notfall).
