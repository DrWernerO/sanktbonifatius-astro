# 02 · WordPress-Zugang (Anwendungspasswort)

> Seit der Umstellung auf Astro werden Seiten nicht mehr direkt in WordPress gebaut.
> Dieser Zugang wird nur noch für gelegentliche Backend-Pflege gebraucht — z. B. Termine
> korrigieren, Plugin-Einstellungen ändern, oder Content-Fixes wie in `ASTRO-HANDBUCH.md`
> §13c beschrieben (Bearbeiten per Anwendungspasswort).

## Anmeldung

- **Admin:** https://www.sanktbonifatius.de/wp-admin/
- **Benutzer:** Frank Hoffmann (`f.hoffmann@sanktbonifatius.de`, WP-Slug `frankh`)
- **Theme:** „Sankt Bonifatius" (Child-Theme von „Ursprung"), Slug `ursprung-bonifatius`

## Anwendungspasswort (WordPress Application Password)

- Benutzer-Login: `f.hoffmann@sanktbonifatius.de` (E-Mail-Adresse, nicht Slug!)
- **Das Passwort steht NICHT im Handbuch.** Es liegt lokal in der Datei
  `~/.config/sb-wp/wp_pass` — bewusst **außerhalb** des iCloud-synchronisierten
  `Documents`-Ordners, mit Rechten `chmod 600` (nur der eigene Nutzer kann lesen).
- Vor REST-/curl-Arbeit einmal pro Terminal-Sitzung laden (gibt das Passwort **nicht** aus):
  ```bash
  export WP_USER="f.hoffmann@sanktbonifatius.de"
  export WP_PASS="$(cat ~/.config/sb-wp/wp_pass)"
  ```
- Verwendung: HTTP Basic Auth — **immer nur die Variablen** verwenden, das Passwort
  nie wörtlich in einen Befehl schreiben:
  ```bash
  curl -u "$WP_USER:$WP_PASS" \
    "https://www.sanktbonifatius.de/wp-json/wp/v2/pages/POST_ID?context=edit&_fields=content"
  # Hinweis: Auch Draft-Seiten sind mit diesem Account lesbar (context=edit)
  ```
- Passwort ändern / Datei neu anlegen:
  ```bash
  mkdir -p ~/.config/sb-wp
  printf '%s\n' 'NEUES ANWENDUNGSPASSWORT' > ~/.config/sb-wp/wp_pass
  chmod 600 ~/.config/sb-wp/wp_pass
  ```

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
  "https://www.sanktbonifatius.de/wp-json/wp/v2/media?slug=BILD-SLUG&_fields=id,slug,source_url"
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
