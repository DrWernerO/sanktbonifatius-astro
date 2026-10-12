# WordPress-Wartung (Backend `cms.sanktbonifatius.de`)

> WordPress liefert nur noch Daten (Termine, Beiträge, News, Medien, Tauftermine, Stellen-PDFs).
> Fällt es aus oder wird gehackt, bleibt die statische Seite online, aber Termine/Beiträge
> aktualisieren sich nicht — und ein gehacktes WP kann Schadcode ausliefern oder Daten abgreifen.
> Stand der Checkliste: 2026-10-12 (erstellt aus einer Außenprüfung + Code-Durchsicht).

## Regelmäßig (monatlich, ~15 Min.)
1. **Updates** einspielen: WordPress-Kern, Plugins (ACF, SEOPress, Real Media Library, AIOS, Gravity Forms,
   Duplicate Post, Simple Page Ordering …), Theme. Vorher Backup. Danach prüfen: `/terminkalender/`,
   Startseite-Kacheln, ein Beitrag, ein News-Eintrag.
2. **Nicht mehr benötigte Plugins löschen** (z. B. Gravity Forms, Contextual Related Posts, wpmudev_*,
   erecht24 — jeweils prüfen, ob das Frontend sie noch braucht; Astro nutzt nur `wp/v2` + `realmedialibrary`).
3. **Benutzer prüfen:** nur aktive Personen, Rolle so klein wie möglich, Zwei-Faktor-Anmeldung (AIOS kann das).
4. **Backup-Test:** prüfen, dass das letzte Backup (DB + `wp-content/uploads`) vorhanden ist und lesbar.

## Einmalig zu erledigen (siehe Abschlussbericht 2026-10-12)
- Backups: ✅ **geprüft 2026-10-12** — All-inkl sichert automatisch täglich ~04:20 Uhr, je 10 Stände (KAS → Tools → Backups):
  Datenbank-Backup (ALT, DEV, **LIVE** ~35 MB; LIVE = vermutlich die cms-Datenbank, Zuordnung noch bestätigen) und Webspace-Backup (~50 GB,
  ältere Stände nur wöchentlich). **Offen: Wiederherstellung einmal testen** (z. B. Datenbank-Backup auf den Webspace ablegen statt
  zu überschreiben — die Funktion bietet KAS ausdrücklich an).
- PHP-Version in KAS auf die aktuelle unterstützte Version stellen (Kompatibilität mit Plugins testen).
- **Plugin „SB Headless"** einspielen (`docs/wordpress-hooks/sb-headless/`, Anleitung dort in `README.md`). Es enthält
  auch die beiden Einzel-Snippets (`termine-rest-schreiben.php`, `rest-benutzer-absichern.php`) — diese dann **nicht**
  zusätzlich in die `functions.php` kopieren.
- Theme „Ursprung" auf das Nötigste reduzieren oder durch minimales Theme ersetzen — **Achtung:** die
  `functions.php`-Snippets (Rebuild-Hook, `pin_data`, `sb_release_attachments`) müssen in ein
  Child-/Plugin-Verzeichnis umziehen, sonst gehen sie beim Theme-Wechsel verloren.

## Befunde der Außenprüfung (2026-10-12)
| Prüfung | Ergebnis |
|---|---|
| `xmlrpc.php`, `readme.html`, `.git/config`, `wp-config`-Backups | leiten auf die Hauptdomain um (Astro: 404) — ok |
| `wp-login.php` | 404 (Login auf `/heimat` verlegt) — ok |
| `wp-content/debug.log` | 403 — ok |
| `/wp-json/wp/v2/users` | **öffentlich lesbar, 4 Benutzer-Kennungen** → Snippet `rest-benutzer-absichern.php` |
| REST-Routen insgesamt | 333 öffentlich sichtbare Routen (Plugins) — Plugin-Aufräumen reduziert das |
