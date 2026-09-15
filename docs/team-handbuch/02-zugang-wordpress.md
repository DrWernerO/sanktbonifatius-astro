# 02 · WordPress-Zugang (Anwendungspasswort)

> Seit der Umstellung auf Astro werden Seiten nicht mehr direkt in WordPress gebaut.
> Dieser Zugang wird nur noch für gelegentliche Backend-Pflege gebraucht — z. B. Termine
> korrigieren, Plugin-Einstellungen ändern, oder Content-Fixes wie in `ASTRO-HANDBUCH.md`
> §13c beschrieben (Bearbeiten per Anwendungspasswort).

## Anmeldung

- **Backend liegt auf `cms.sanktbonifatius.de`** (nicht mehr www — die Hauptdomain zeigt seit
  dem Go-Live 2026-08-03 auf Netlify/Astro, siehe `CLAUDE.md` Regel 1).
- **Admin-Login:** https://cms.sanktbonifatius.de/heimat (versteckte Adresse — `wp-login.php`
  gibt 404, Login ist durch das Sicherheits-Plugin AIOS verlegt; siehe `05-veranstaltungskalender.md`
  für den Browser-Login-Ablauf mit Claude).
- **Benutzer für Claude/REST-Arbeit:** `Werner` (Administrator) — **nicht** `f.hoffmann`/Frank
  Hoffmann, dessen Anwendungspasswort seit dem Domain-Umzug nicht mehr funktioniert
  (2026-09-07 stundenlang fehlgesucht: es lag **nicht** an der URL oder an `.htaccess`,
  sondern schlicht am falschen Benutzernamen).
- **Theme:** „Sankt Bonifatius" (Child-Theme von „Ursprung"), Slug `ursprung-bonifatius`

## Anwendungspasswort (WordPress Application Password)

- Benutzer-Login: `Werner`
- **Das Passwort steht NICHT im Handbuch.** Es liegt lokal in der Datei
  `~/.config/sb-wp/wp_pass` — bewusst **außerhalb** des iCloud-synchronisierten
  `Documents`-Ordners, mit Rechten `chmod 600` (nur der eigene Nutzer kann lesen).
- Vor REST-/curl-Arbeit einmal pro Terminal-Sitzung laden (gibt das Passwort **nicht** aus):
  ```bash
  export WP_USER="Werner"
  export WP_PASS="$(cat ~/.config/sb-wp/wp_pass)"
  ```
- Verwendung: HTTP Basic Auth — **immer nur die Variablen** verwenden, das Passwort
  nie wörtlich in einen Befehl schreiben:
  ```bash
  curl -u "$WP_USER:$WP_PASS" \
    "https://cms.sanktbonifatius.de/wp-json/wp/v2/pages/POST_ID?context=edit&_fields=content"
  # Hinweis: Auch Draft-Seiten sind mit diesem Account lesbar (context=edit)
  ```
- Passwort ändern / Datei neu anlegen:
  ```bash
  mkdir -p ~/.config/sb-wp
  printf '%s\n' 'NEUES ANWENDUNGSPASSWORT' > ~/.config/sb-wp/wp_pass
  chmod 600 ~/.config/sb-wp/wp_pass
  ```
  Neues Anwendungspasswort erzeugen: im Backend unter `/heimat` einloggen → Profil →
  Anwendungspasswörter → altes löschen, neues mit Namen (z. B. „Claude") anlegen.

## Rechte-Einschränkungen

| Bereich | Zugriff |
|---|---|
| Seiten (Pages) | ✅ Voller Zugriff |
| Beiträge (Posts) | ✅ Voller Zugriff |
| Medien-Upload | ✅ Ja |
| Gutenberg-Editor | ✅ Ja |
| **Plugin-Verwaltung** | ❌ gesperrt |
| **Plugin-Editor** | ❌ gesperrt |
| **Theme-Editor (functions.php)** | ✅ zugänglich |
| Settings/Benutzer | ❌ gesperrt |

## Medien per REST finden

`?search=` ist unzuverlässig (liefert oft „Seitennummer zu groß"-Fehler), `?slug=` funktioniert zuverlässig:

```bash
curl -u "$WP_USER:$WP_PASS" \
  "https://cms.sanktbonifatius.de/wp-json/wp/v2/media?slug=BILD-SLUG&_fields=id,slug,source_url"
```

## Andere Post-Typen (REST)

```
/wp/v2/event     — Events (siehe 05-veranstaltungskalender.md)
/wp/v2/posts     — Beiträge
/wp/v2/pages     — Seiten
/wp/v2/media     — Medien
```

Nützliche Parameter: `?context=edit` (liefert `content.raw`, nur eingeloggt) ·
`?_fields=id,title,content` · `?_embed` (Medien/Autoren inline) · `?status=draft` ·
`?slug=xyz` (zuverlässiger als `search=`).

## Weiteres

Für die technische Astro-Anbindung (Rebuild-Webhook, Datenfelder, Content-Bearbeitung
per Anwendungspasswort) siehe `ASTRO-HANDBUCH.md` §1c und §13c.
