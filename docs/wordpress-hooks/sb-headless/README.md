# Plugin „SB Headless" — Einspielen und Aufräumen

Datei: `sb-headless.php` (Entwurf 2026-10-12, **nicht getestet** — kein PHP auf dem Entwicklungsrechner).
Ziel: den Teil der `functions.php`, den Astro braucht, in ein Plugin auslagern, damit das alte Theme
später ersetzt werden kann. Das Plugin ist so gebaut, dass es **neben** der alten `functions.php`
aktiviert werden kann (kein Fatal Error, doppelte Hooks sind harmlos).

## Vorfall 2026-10-12 (Lehre)
Erster Versuch führte zu „Fatal error: Cannot redeclare sb_trigger_netlify_build_for_download()" — WP-API und Admin waren
rund 15 Minuten nicht erreichbar. Ursache: Plugins laden vor dem Theme, die `functions.php` deklarierte dieselbe Funktion
ungeschützt. Behoben durch Entfernen von `sb-headless/sb-headless.php` aus der Option `active_plugins` in phpMyAdmin
(KAS → Datenbanken → LIVE-Anmeldesymbol). Seitdem tragen alle Plugin-Funktionen den Präfix `sb_hl_`.
**Notfall-Rückweg, falls es wieder passiert:** Ordner `wp-content/plugins/sb-headless` per FTP umbenennen, oder wie oben in
phpMyAdmin den Eintrag aus `ma_sb_options` → `active_plugins` entfernen (Original vorher sichern).
Auf dem Server liegt noch die ALTE (fehlerhafte) Plugin-Datei (deaktiviert) → beim erneuten Hochladen „ersetzen" wählen.

## Ablauf (jeweils mit Backup davor!)
1. **Backup** (Datenbank + `wp-content`) — Wiederherstellung muss möglich sein.
2. Ordner `sb-headless/` mit `sb-headless.php` per FTP/KAS nach `wp-content/plugins/` kopieren
   (oder ZIP hochladen unter Plugins → Installieren → Plugin hochladen).
3. Plugin **aktivieren**. WP aktiviert ein Plugin mit Fehler nicht, sondern zeigt eine Meldung → dann stoppen
   und mir die Meldung geben.
4. **Test** (alles muss wie vorher funktionieren):
   - `https://cms.sanktbonifatius.de/wp-json/wp/v2/event?per_page=1` → enthält `event_meta`
   - `…/wp/v2/pin?per_page=1` → enthält `pin_data`
   - `…/wp/v2/users` ohne Login → 401 (neu, gewollt); mit Anmeldung im Admin weiter erreichbar
   - Admin: Termine-Liste zeigt Spalte „Datum", Termin öffnen und speichern geht
   - Test-Beitrag speichern → in Netlify erscheint ein Deploy (Hook-URL siehe unten)
   - Per Script einen Entwurf-Termin mit `event_input` anlegen (Beispiel im Kopf von `../termine-rest-schreiben.php`),
     im Admin-Formular kontrollieren, dass alle Felder gefüllt sind
5. **Erst wenn alles geprüft ist:** den doppelten Code aus der `functions.php` entfernen (Zeilen laut
   `../FUNCTIONS-PHP-INVENTAR.md`, Gruppe A) und danach Test 4 wiederholen.
6. Erst danach das Theme austauschen (Gruppe B entfällt) — siehe Inventar.

## Build-Hook-URL (geheim)
Die Netlify-Hook-URL steht NICHT im Plugin (das Repo ist öffentlich/geteilt). Sie steht bisher als
`define( 'SB_NETLIFY_BUILD_HOOK', … )` in der `functions.php`. Beim Entfernen aus der `functions.php`
diese eine `define`-Zeile vorher in die `wp-config.php` (liegt auf dem Server, nicht im Theme) übernehmen,
sonst löst nichts mehr einen Rebuild aus.

## Rückgängig machen
Plugin deaktivieren — solange die `functions.php` noch unverändert ist, läuft alles wie vorher.
