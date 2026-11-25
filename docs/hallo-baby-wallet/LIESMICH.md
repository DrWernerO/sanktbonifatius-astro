# Hallo Baby! – Vorlagen für die Wallet-Gutscheine

Inhaltliche Vorlagen für die drei Gutscheine (Buch, BonFriday, Kaffee), noch **nicht signiert** und damit noch nicht installierbar. Gehört zu `docs/2026-11-Hallo-Baby-Website-Briefing.md`, Abschnitt 2a.

- `apple-*.pass.json` – Apple Wallet, Passtyp `coupon`. Zum Fertigstellen fehlen: Pass Type ID und Team ID (aus dem Apple-Developer-Account), Signatur mit dem Pass-Type-ID-Zertifikat, dann als `.pkpass` verpacken (MIME `application/vnd.apple.pkpass`).
- `google-*.object.json` – Google Wallet, Generic-Objekte. Zum Fertigstellen fehlen: Issuer-ID, eine passende Klasse `[ISSUER_ID].hallobaby`, öffentliche Logo-URL, Signatur des „Save“-JWT mit dem Servicekonto-Schlüssel (nur serverseitig, Schlüssel nie ins Repo).

Die Bilder `icon*.png` (29/58/87 px) und `logo*.png` (50/100/150 px, bunter Bonifatius-Ring mit transparentem Hintergrund) liegen bereit und gehören in jedes Pass-Paket. Für Google kann `logo@3x.png` öffentlich unter `public/` abgelegt und als Logo-URL genutzt werden.

Alle Angaben in eckigen Klammern sind offen und müssen von Frank geklärt werden. Keine personenbezogenen Daten auf den Pässen.
