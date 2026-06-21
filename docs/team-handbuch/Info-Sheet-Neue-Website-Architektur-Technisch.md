# Neue Website-Architektur — die technische Version

*Für technisch versierte Leser (Grundkenntnisse Web/Programmieren, ggf. Erfahrung mit Claude).
Erklärt Build, Hosting, die Rolle von All-inkl und Netlify sowie die Umstellung der Domain.*

---

## 1. Das Grundprinzip: Headless

Wir trennen **Inhalt** und **Darstellung** in zwei Systeme:

| Schicht | Technik | Aufgabe |
|---------|---------|---------|
| **Backend (CMS)** | WordPress (bleibt auf All-inkl) | Inhalte pflegen, REST-API liefert Daten als JSON |
| **Frontend** | Astro (neues System) | baut die öffentliche Website, holt Daten aus der WP-API |

WordPress rendert also **nicht mehr** die öffentliche Seite. Es wird zum reinen
Daten-Lieferanten („headless"). Astro fragt die WordPress-REST-API ab
(`/wp-json/wp/v2/posts`, `/event`, `/pages/{id}` …) und erzeugt daraus statisches HTML.

---

## 2. Was sich bei All-inkl ändert — und was nicht

**All-inkl (KAS / kasserver.com)** ist unser bisheriger Hoster. Dort läuft die
WordPress-Installation inkl. MySQL-Datenbank.

### Bleibt bei All-inkl
- Die **WordPress-Installation** selbst (PHP + MySQL).
- Der **WP-Admin** für die Sekretärinnen — Login, Termine, Beiträge: alles unverändert.
- Die Datenbank mit allen Inhalten.

### Ändert sich bei All-inkl
- WordPress ist **nicht mehr** unter `sanktbonifatius.de` öffentlich erreichbar, sondern
  zieht auf eine **Subdomain** um, z.B. `cms.sanktbonifatius.de` (nur noch Backend/API).
- Die öffentliche Domain `sanktbonifatius.de` zeigt künftig **nicht mehr** auf All-inkl,
  sondern auf den neuen Frontend-Hoster (siehe Abschnitt 5).

> **Kurz:** All-inkl bleibt das „Lagerhaus" (WordPress + DB). Es verliert nur seine Rolle
> als öffentliches Schaufenster.

---

## 3. Wo die Seite gebaut und "gelagert" wird (Build)

Astro erzeugt eine **statische Website** — beim Build entstehen fertige HTML-/CSS-/JS-Dateien.
Der Ablauf:

```
 Quellcode (Astro-Projekt)  ──►  Git-Repository (GitHub)
                                      │
                                      ▼
                          Build-Server (Netlify) führt aus:
                              npm install && astro build
                                      │
                                      ▼
                       fertiges /dist  (statisches HTML/CSS/JS)
                                      │
                                      ▼
                        Auslieferung über Netlify-CDN
```

- **Quellcode** liegt versioniert in **Git/GitHub** (gleichzeitig unser Backup des Frontends).
- Der **Build** (`astro build`) kann lokal laufen — produktiv übernimmt ihn aber der
  Frontend-Hoster automatisch: Bei jedem Git-Push zieht er den Code und baut neu.
- Beim Build fragt Astro die WordPress-API ab und „backt" die aktuellen Inhalte in
  statische Seiten ein. Ergebnis: ein Ordner `dist/` mit reinem HTML — keine PHP-Logik,
  keine DB-Abfrage zur Laufzeit.

---

## 4. Warum ein zusätzlicher Provider (Netlify o. Ä.)?

All-inkl ist auf **PHP/MySQL-Hosting** (klassisches WordPress) ausgelegt. Für eine moderne
statische Astro-Seite braucht es einen Hoster, der zwei Dinge gut kann:

1. **Automatischer Build aus Git** — bei jedem Push (oder per Webhook aus WordPress) wird
   `astro build` ausgeführt. Das ist eine CI/CD-Pipeline, die klassisches Webhosting nicht bietet.
2. **Globales CDN** — die fertigen Dateien werden weltweit verteilt ausgeliefert, sehr schnell.

Dafür eignen sich **Netlify, Vercel oder Cloudflare Pages**. Sie sind für statische Seiten
optimiert, haben kostenlose Einstiegstarife und integrieren GitHub direkt.

### Wie kommt der Content „hoch"?
- **Bei Code-Änderungen:** Git-Push → Netlify baut & deployt automatisch.
- **Bei Inhalts-Änderungen im WordPress:** Da Astro die Inhalte beim Build einbäckt, muss
  nach neuen Terminen/Beiträgen **neu gebaut** werden. Das löst ein **Webhook** aus:
  WordPress (z.B. per Plugin „Save → Trigger") ruft eine Netlify-Build-Hook-URL auf →
  Netlify baut die Seite mit den frischen Daten neu. Alternativ ein zeitgesteuerter Rebuild
  (z.B. nächtlich) oder ein manueller Knopf.

> So bleibt die Redaktionsarbeit gleich: Sekretärin speichert im WP-Admin → Webhook →
> Netlify baut neu → kurze Zeit später ist die Änderung live.

---

## 5. Wie das "Internet" erfährt, wo die Seite jetzt liegt (DNS)

Welcher Server unter `sanktbonifatius.de` antwortet, steht im **DNS** (Domain Name System) —
dem „Telefonbuch des Internets". Aktuell zeigen die DNS-Einträge der Domain auf All-inkl.

### Die Umstellung
1. **Frontend bei Netlify einrichten** und dort die Domain `sanktbonifatius.de` als
   Custom Domain hinterlegen (Netlify nennt die Ziel-Adresse, z.B. einen Hostnamen oder
   eine IP/Anycast-Adresse).
2. **DNS-Einträge ändern** (beim Domain-Verwalter — Registrar bzw. All-inkl-DNS):
   - `A`/`AAAA`- oder `CNAME`-Record für `sanktbonifatius.de` → auf **Netlify** zeigen lassen
     (statt auf All-inkl).
   - Einen Eintrag für die **CMS-Subdomain** anlegen: `cms.sanktbonifatius.de` → **All-inkl**
     (damit WordPress/API erreichbar bleibt).
3. **TLS/HTTPS:** Netlify stellt automatisch ein Let's-Encrypt-Zertifikat für die Domain aus.
4. **Propagation:** DNS-Änderungen brauchen wegen Zwischenspeicherung (TTL) typischerweise
   Minuten bis ~24-48 Stunden, bis sie weltweit greifen.

```
Vorher:   sanktbonifatius.de ──► All-inkl (WordPress rendert öffentlich)

Nachher:  sanktbonifatius.de       ──► Netlify  (statisches Astro-Frontend)
          cms.sanktbonifatius.de   ──► All-inkl (WordPress, nur Backend + API)
```

> **Wichtig:** Die Domain selbst bleibt unsere; es ändert sich nur, **wohin** sie zeigt.
> Für Besucher bleibt die Adresse `sanktbonifatius.de` identisch.

---

## 6. Zusammenspiel auf einen Blick

```
 Sekretärin                                 Besucher
     │ pflegt Inhalte                            │ ruft sanktbonifatius.de auf
     ▼                                           ▼
 WordPress (All-inkl)                       Netlify-CDN  ◄── statische Astro-Seite
 cms.sanktbonifatius.de                          ▲
     │  REST-API (JSON)                           │ astro build
     └──────────────►  Astro-Build  ──────────────┘
                    (zieht Daten, backt HTML)
                          ▲
                          │ Webhook bei WP-Speichern / Git-Push
                       GitHub (Quellcode + Backup)
```

---

## 7. Offene Punkte / To-dos für die Umsetzung

- [ ] Git-Repository (GitHub) für das Astro-Projekt anlegen — dient zugleich als Backup.
- [ ] Netlify-Account + Projekt mit dem Repo verbinden, Build-Command `astro build` setzen.
- [ ] WordPress auf `cms.sanktbonifatius.de` umziehen (Subdomain + ggf. `WP_HOME`/`WP_SITEURL`).
- [ ] Build-Webhook: WP-Plugin → Netlify-Build-Hook bei „Beitrag/Termin gespeichert".
- [ ] DNS umstellen (A/CNAME für Domain → Netlify; CMS-Subdomain → All-inkl).
- [ ] Backups: UpdraftPlus für WordPress (DB+Uploads); Git für das Frontend.
- [ ] Barrierefreiheit prüfen (semantisches HTML statt DigiAccess-Overlay).

---

*Technische Detail-Dokumentation der Komponenten (Nav, Kacheln, WP-Anbindung) im
Astro-Projekt unter `docs/ASTRO-HANDBUCH.md`.*
