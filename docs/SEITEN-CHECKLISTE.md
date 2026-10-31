# Seiten-Checkliste (neue oder geänderte Seite)

> Vor jedem Commit, der eine Seite neu baut oder strukturell ändert, abarbeiten.
> **Funde dem Redakteur (Werner/Lovis) mit einer Empfehlung nennen — umgesetzt wird nur, was freigegeben ist.**
> Entstanden am 31.10.2026 beim Umbau der Seite „Begleitung auf dem Lebensweg“ (`/segen-sakramente/`).

## 1. Ablauf
- [ ] `git fetch` vor Arbeitsbeginn und vor dem Push (Werner und Lovis pushen parallel auf `main`).
- [ ] `npm run build` lokal, nicht nur `npm run dev`.
- [ ] Code und `docs/` in **getrennten** Commits (`Doku:`-Präfix für Dokumentation).
- [ ] Nie committen/pushen ohne ausdrückliche Freigabe (begrenzte Netlify-Deploys pro Monat).
- [ ] Menü (`Nav.astro`) nur auf ausdrückliche Anweisung ändern; neue Seite ≠ neuer Menüpunkt.
- [ ] Nach CSS-Änderungen zeigt der Dev-Server manchmal altes CSS: Server neu starten, **bevor** man misst.

## 2. Design-Review (Desktop und 375 px)
- [ ] Kontrast Text/Hintergrund mindestens **4,5:1** (große Schrift 3:1), auch bei Gold auf Foto.
- [ ] Tippflächen mindestens **44 px** hoch, Abstand mindestens 8 px, sichtbarer Fokus-Rahmen.
- [ ] Überschriften ohne Sprung (h1 → h2 → h3), genau eine h1.
- [ ] Kein Querscrollen; Seitenlänge mobil messen und dem Redakteur nennen.
- [ ] Texte umbrechen, nicht abschneiden (kein `line-clamp`); Fließtext mobil mindestens 15 px.
- [ ] Sanftes Scrollen nur mit `@media (prefers-reduced-motion: no-preference)`.
- [ ] Ruhige Themen (Trauer, Krankheit): zurückhaltende Fläche, wenig/kein Foto, würdevoller Ton.
- [ ] Der digiAccess-Button sitzt rechts-mittig (höchster z-index): dort nichts Wichtiges platzieren.
- [ ] Skill `ui-ux-pro-max` laden und ehrlich sagen, was gemessen und was nur geprüft wurde.

## 3. Bilder und Sprünge (CLS)
- [ ] Fotos immer lokal aus `public/uploads/…`, nie WP-Bild-URLs (PDFs bleiben im WP).
- [ ] Neue Fotos als **WebP** in passender Größe: Kachel ca. 800 px, Hero 1600 px (+ 800 px für `srcset`), Qualität ca. 82. Über 200 KB = Warnung, über 500 KB = kritisch.
- [ ] Originale in `uploads/` nicht überschreiben (andere Seiten nutzen sie); neue Dateien daneben ablegen.
- [ ] Als `<img>` mit `alt`, `width`, `height`; **nicht** als CSS-Hintergrund (sonst unsichtbar für Bildsuche, kein Lazy-Loading).
- [ ] Bild direkt unter dem Hero lädt sofort, alles darunter `loading="lazy"`; Hero mit `fetchpriority="high"`.
- [ ] Alt-Text beschreibt, was auf dem Foto zu **sehen** ist — Foto vorher ansehen, nicht raten.
- [ ] Jedes Bild hat einen festen Platz (Breite/Höhe oder feste CSS-Höhe), damit nichts springt.

## 4. SEO (statische Seiten: **nicht** SEOPress)
- [ ] SEO-Head liegt in `src/lib/seo-static.js` (Handbuch 1e), nicht mehr in WordPress/SEOPress.
- [ ] Titel ca. 50–60 Zeichen, Beschreibung 150–160 Zeichen, Suchbegriff vorn.
- [ ] Titel, Beschreibung, `og:*`, `twitter:*` **und** JSON-LD gemeinsam nachziehen (alter Text bleibt sonst irgendwo stehen).
- [ ] Vorschaubild siehe eigener Abschnitt **4a**.
- [ ] Ortsbezug im sichtbaren Text (z. B. „Frankfurt“), nicht nur im Titel.
- [ ] Keine unwahren Angaben im Text (Beispiel: „Alle 7 Sakramente“ bei 6 aufgeführten).
- [ ] Skill `seo-page` über die gerenderte Seite laufen lassen.
- [ ] **FAQ-/HowTo-Schema nicht** einsetzen (für Kirchengemeinden nicht zulässig bzw. veraltet).

## 4a. Vorschaubild (`og:image`, erscheint bei WhatsApp, Facebook, Google)
Wo ändern: `src/lib/seo-static.js`, Eintrag der Adresse. Pro Seite alle Stellen gemeinsam anpassen:
`og:image`, `og:image:secure_url`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image`.
Beiträge und Termine: kommen aus WordPress (SEOPress), dort im Beitrag ändern.
- [ ] Das Bild **passt zum Thema der Seite** (Foto ansehen, nicht nur den Dateinamen glauben). Nicht blind das Standardbild oder ein Bild einer anderen Seite übernehmen.
- [ ] Bekannte Fehlgriffe vermeiden: Chor-Foto (`startseite-fotogalerie-00043.jpg`) auf Beratungs-/Ehrenamtsseiten, Grafik „Aktueller Gottesdienstplan“ (`Gottesdienste-aktuell.jpg`) auf Nicht-Gottesdienst-Seiten, Kita-Foto der falschen Kita.
- [ ] Format: **1200 × 630 px, JPG, möglichst unter 300 KB** (WhatsApp zeigt zu große Bilder oft nicht). Zuschnitt prüfen, Gesichter nicht abschneiden. Ablage: `public/uploads/og/`, Originale nicht überschreiben.
- [ ] `og:image:alt` beschreibt, was zu **sehen** ist (nicht leer lassen), Breite/Höhe stimmen mit der Datei überein.
- [ ] Ruhige Themen (Trauerfall): kein Gesicht als Vorschau, ruhiges Standardbild.
- [ ] Jede Seite braucht ein Vorschaubild (Beispiel: `/kontakt/seelsorge/` hatte keines).
- [ ] Nach dem Push: Facebook/WhatsApp merken sich alte Vorschauen; ggf. im Facebook-Sharing-Debugger den Zwischenspeicher leeren.
- [ ] Beim Review kurz prüfen, ob ein altes Bild noch in `twitter:image` oder im JSON-LD steht.

## 5. Pflege nach dem Bau
- [ ] `public/llms.txt`: neue/verschobene Seite eintragen, **endgültige** Adressen statt Kurzadressen (`_redirects`), Datum „Stand“ aktualisieren.
- [ ] `public/_redirects`: nur anfassen, wenn Adressen verschoben wurden.
- [ ] `docs/SEITENVERZEICHNIS.md` (Zeile + Zähler oben) als eigener `Doku:`-Commit.
- [ ] Alle internen Links der Seite auf Antwort 200 prüfen (nicht auf Kurzadressen zeigen lassen).

## 6. Bericht an den Redakteur
Kurz und in einfacher Sprache: Was ist gut, was sind die Funde (nach Wichtigkeit), was empfehle ich, was ist nicht geprüft.
