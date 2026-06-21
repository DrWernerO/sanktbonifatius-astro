# Sankt Bonifatius — Astro-Frontend

Neues Frontend für die Website der Pfarrei **Sankt Bonifatius Frankfurt**.
Die Inhalte bleiben in **WordPress** (Backend/CMS); das Aussehen baut **Astro** aus eigenen
Komponenten („Headless WordPress"). Entwickelt wird lokal, der Code wird über **GitHub**
ausgetauscht, später geht die Seite über **Netlify** öffentlich live.

> **Vor jeder Arbeit an einer Seite:** zuerst [`docs/ASTRO-HANDBUCH.md`](docs/ASTRO-HANDBUCH.md)
> lesen. Ergänzende Referenz (Seiten-IDs, Design-System, Zugänge) liegt in
> [`docs/team-handbuch/`](docs/team-handbuch/).

---

## ✅ Schon gebaute Seiten

| Adresse | Seite |
|---------|-------|
| `/` | Startseite |
| `/jugend/` | Jugend |
| `/kontakt/` | Kontakt |
| `/segen-sakramente/` | Segen & Sakramente (Übersicht) |
| `/segen-sakramente/taufe/` | Taufe (inkl. Anmeldeformular) |
| `/gottesdienst-glaube/` | Gottesdienst & Glaube |
| `/gottesdienst-glaube/gottesdienstordnung/` | Gottesdienstordnung |
| `/terminkalender/` | Terminkalender |
| `/ueberuns/` | Über uns |
| `/ueberuns/kirchorte/st-bonifatius/` | Kirchort St. Bonifatius |
| `/ueberuns/kirchorte/st-bonifatius/kirche/` | … dessen Kirche |
| `/boniblog/` | BoniBlog |

Dazu **automatisch je WordPress-Eintrag**: `/blog/<name>/` (pro Beitrag) und
`/termine/<name>/` (pro Termin).

**Wo steht die Wahrheit?** Der Ordner [`src/pages/`](src/pages/) ist maßgeblich:
Jede `.astro`-Datei dort ist eine fertige Seite. Dateiname = Adresse
(`jugend.astro` → `/jugend/`, `segen-sakramente/taufe.astro` → `/segen-sakramente/taufe/`).

## 🔜 Noch zu bauen (Auswahl)

Diese Seiten werden von bereits gebauten Seiten verlinkt, existieren aber noch nicht in Astro
(laufen daher vorerst ins Leere — vgl. Handbuch Abschnitt 12):

- Sakramente: `/segen-sakramente/firmung/`, `…/erstkommunion/`, `…/trauung/`, `…/beichte/`, `…/krankensalbung/`
- Jugend: `/jugend/kinder-und-jugendfreizeiten/`
- weitere Kirchorte (St. Aposteln, St. Wendel, Herz Jesu), `/spenden/`, diverse Nav-Unterseiten

Die **vollständige Seiten-Liste mit WordPress-IDs** steht im Team-Handbuch:
[`docs/team-handbuch/07-seiten-inventar.md`](docs/team-handbuch/07-seiten-inventar.md).

---

## 🚀 Lokale Vorschau starten

Voraussetzung: **Git** und **Node.js 22+**.

```sh
git clone https://github.com/DrWernerO/sanktbonifatius-astro.git
cd sanktbonifatius-astro
npm install
npm run dev
```

Dann im Browser **http://localhost:4321/** öffnen (z. B. `/jugend`). Zum Ansehen ist **kein
Passwort** nötig — die Inhalte zieht die Vorschau automatisch aus WordPress.

| Befehl | Wirkung |
|--------|---------|
| `npm run dev` | Lokale Vorschau auf `localhost:4321` |
| `npm run build` | Baut die fertige Seite nach `./dist/` |
| `npm run preview` | Zeigt den Build lokal an |

> Hinweis: `npm run dev` setzt automatisch `NODE_TLS_REJECT_UNAUTHORIZED=0` (WordPress-Server
> mit selbst-signiertem Zertifikat). Für `npm run build` dieses Flag bei Bedarf voranstellen.

## 🤝 Zusammenarbeit (Werner & Lovis)

Eine Regel gegen Konflikte:

- **Bevor** du anfängst: `git pull` (holt die Änderungen des anderen)
- **Wenn du fertig bist:** `git commit` + `git push` (lädt deine hoch)

Solange ihr nicht gleichzeitig dieselbe Datei bearbeitet, gibt es praktisch nie Konflikte.

## 🧱 Neue Seite mit Claude Code bauen

Claude Code im Projektordner öffnen und sinngemäß anweisen:

> Lies zuerst `CLAUDE.md` und `docs/ASTRO-HANDBUCH.md`. Baue dann die Seite **»Name«**
> (WordPress Page-ID **…**, Slug `/…/`) vollständig mit eigenen `astro-`-Komponenten neu auf —
> nach demselben Muster wie Kontakt, Taufe, Segen & Sakramente und Jugend. Prüfe am Ende mit
> Build und lokaler Vorschau, dass alles passt.

Die **Page-ID** und passende **Event-Kategorie** stehen im
[`docs/team-handbuch/`](docs/team-handbuch/) (Seiten-Inventar bzw. Veranstaltungskalender).

---

## 📚 Dokumentation

- [`docs/ASTRO-HANDBUCH.md`](docs/ASTRO-HANDBUCH.md) — Architektur, Komponenten, Fallstricke
- [`docs/team-handbuch/`](docs/team-handbuch/) — Projekt-Überblick, WP-Zugang, Design-System,
  Seiten-Inventar (IDs), Event-Kategorien, technische Lösungen, Fonts
- [`CLAUDE.md`](CLAUDE.md) — Kurzregeln & Schlüsseldateien für die Arbeit mit Claude Code
