# 10 · ChurchDesk verwalten (Termine, Anfrage-Seiten, Formulare, Kontaktfelder)

**Stand:** 17.10.2026 · **Gilt für:** ChurchDesk-Konto *Sankt Bonifatius Frankfurt* (`app.churchdesk.com/c/5499`)
**Zweck:** Wie die Website mit ChurchDesk zusammenhängt, und was sich im ChurchDesk-Admin (auch per Claude im eingebauten Browser) bearbeiten lässt.

> Für die technische Anbindung der Website (API-Token, `src/lib/churchdesk.js`) siehe
> [`../ASTRO-HANDBUCH.md`](../ASTRO-HANDBUCH.md). Dieses Kapitel beschreibt die **Admin-Seite**.

---

## 1. Was die Website aus ChurchDesk nutzt

| Bereich auf der Website | Quelle in ChurchDesk |
|---|---|
| Gottesdienstordnung, „Alle Gottesdienste", Terminkalender-Ansicht „mit Gottesdiensten" | **Kalender**: Termine der Kategorie *Gottesdienst* (ID 144769), nur lesend per API (Organisation 5499) |
| Raumbuchung (passwortgeschützt), Newsletter, Anmeldungen, Spenden | **eingebettete** Widgets/Formulare (`request.churchdesk.com`, `forms.churchdesk.com`, `donate.churchdesk.com`) |
| Highlights im Terminkalender | **nicht** ChurchDesk, sondern WordPress-Termine (`event`) |

Gottesdienst-Termine in der Kategorie *Gottesdienst* mit Sichtbarkeit „Öffentlich" erscheinen sofort auf der Website. Termine „ENTFÄLLT" werden angezeigt, „Taufe möglich" ausgeblendet.

---

## 2. Zugang für Claude

- Claude arbeitet im **eingebauten Browser** der App. **Werner loggt sich selbst ein**, Passwörter gibt Claude nie ein.
- Lesen und Ändern funktionieren. **Löschen und „Konflikte zulassen" nur auf ausdrückliche Anweisung.**
- Praktische Hinweise: Screenshots zeigen oft den Zustand *vor* der letzten Aktion (kurz warten); ein Skript-Aufruf darf max. ~45 s dauern; ungespeicherte Änderungen gehen beim Seitenwechsel verloren.

---

## 3. Termine (Kalender)

- Termin öffnen/bearbeiten: `/c/5499/calendar/event/<ID>`. Die ID steht im Kalender-HTML (`cd_event_item_<ID>`).
- **Zusatzkategorie** setzen: im Termin „+ Kategorien hinzufügen" → Kategorie wählen → „Ereignis aktualisieren".
- **Serientermine:** ChurchDesk fragt „Dieser Eintrag" oder „Dieser und folgende". Standard: **nur dieser Eintrag**, damit nichts außerhalb des Auftrags geändert wird.
- **Buchungskonflikte:** Beim Speichern erscheint ein Dialog, wenn eine Ressource doppelt belegt ist. Das sind meist schon vorhandene Doppelbuchungen. Speichern nur mit „Konflikte zulassen" und nur nach Rückfrage.
- **Kategorien:** „St. Bonifatius" (Zusatzkategorie für alle Termine mit Ressource *1 St. Bonifatius*) ist **nicht** dasselbe wie „St. Bonifatius intern".
- **Ressource „1 St. Bonifatius"** ist die Sammelressource für das ganze Haus. Sie wird auch für Platzhalter (KJF-Bus, Freizeiten, Plakate) benutzt und erzeugt dadurch viele Konflikte.
- **Stand 17.10.2026:** Alle Termine mit dieser Ressource vom 15.10. bis 31.12.2026 haben die Zusatzkategorie „St. Bonifatius". Wiederholungen ab 1.1.2027 noch nicht.

## 4. Anfrage-Seiten (Raumbuchung)

- Liste: `Einstellungen → Anfrage-Seiten` (`/settings/booking-pages`). 11 Seiten: 4× St. Bonifatius, 2× Herz Jesu, 5× St. Wendel.
- Bearbeiten: Aktionen → Bearbeiten (zweistufig: *Allgemeine Einstellungen*, *Details zur Anfrage*; gespeichert wird in Schritt 2).
- Änderungen wirken **sofort** in den Widgets der Raumbuchungsseite, kein Deploy nötig.
- **Stand 16./17.10.2026:**
  - Beschreibung bei allen: „WICHTIG: Bitte geben Sie, nachdem Sie Datum und Uhrzeit ausgewählt haben, im nächsten Fenster im Feld „Nachricht" die Gruppe bzw. die Veranstaltung ein, für die Sie den Raum buchen möchten."
  - „Automatisches Folgeformular" bei allen aus.
  - Räume von St. Bonifatius: Ereigniskategorie **St. Bonifatius**. Herz Jesu und St. Wendel: Kategorie unverändert.
  - Interne Namen „…, oben" heißen jetzt „… (oben)" (öffentlicher Titel unverändert).
- Das Anfrageformular jeder Seite (`Anfrageformular bearbeiten`) hat nur 4 Felder: Vorname\*, Nachname\*, E-Mail\*, Nachricht. Vor- und Nachname lassen sich nicht entfernen.

## 5. Formulare und die „vielen Felder"

- **Formulare:** Modulmenü *FORMULARE* (`/c/5499/forms`), derzeit 70 (33 offen, 37 geschlossen; beide Listen haben eine 2. Seite). Antworten: `/c/5499/forms/<ID>` (Button „Download" für den Export).
- Feld-Editor eines Formulars: `/c/5499/settings/forms/<ID>/edit`. Zuerst erscheint eine **Datenverlust-Warnung**, erst „Felder trotzdem bearbeiten" öffnet den Editor. Laut ChurchDesk ist nur Umbenennen unkritisch.
- **Die angesammelten Felder liegen nicht in den Formularen, sondern im Kontakte-Modul:** `KONTAKTE → Felder → Felder bearbeiten` (`/c/5499/people/fields`). Aktuell **42 eigene Felder**, jedes mit „Bearbeiten"/„Entfernen". Gespeichert wird erst mit **„Speichern" oben rechts**.
- Beim Prüfen am 17.10.2026 (alle 70 Formulare ausgelesen) fiel auf:
  - Felder aus aktiven Formularen nicht löschen. Beispiel: „Di.: 15.12." samt „Digital", „Präsenz" und den anderen Terminfeldern gehört zur offenen Anmeldung *„Gottes Karriere nach unten – Eine besondere Buchlesung"*.
  - Ohne Formular (Altlasten): „Alter des 2. Kindes", „Reliogionszugehörigkeit Vater" (Tippfehler), „Vornam Kind 2".
  - Doppelt vorhanden: „Schwimmfähigkeit", „Geschlecht", „Vorname/Nachname des Teilnehmers/der Teilnehmer\*in".
  - „Alter Kind 1/2" steckt nur in den beiden geschlossenen Taschenlampenführungen (0 Antworten).
- **Erkenntnis (korrigiert 17.10.2026):** Das Löschen eines Kontaktfelds **entfernt das Feld auch aus allen Formularen, die es verwenden**. Am 17.10.2026 wurden 12 Kontaktfelder gelöscht und gespeichert (Alter des 2. Kindes, Alter Kind 1/2, Vornam Kind 2, Digital, Präsenz, Sa.: 5.12., So.: 13.12., So.: 20.12., Mi.: 9.12., Di.: 15.12., Di.: 22.12.). Danach hatte die offene Anmeldung *„Gottes Karriere nach unten"* statt 13 nur noch 5 Felder (Termin-/Präsenz-/Digital-Auswahl weg), und die beiden Taschenlampenführungen hatten „Alter Kind 1/2" und „Vorname Kind 2" verloren. Die bereits abgegebene Antwort blieb in der Antworten-Tabelle sichtbar. (Ein früherer Test, bei dem die Felder noch da waren, war nur nicht gespeichert gewesen.)
  Deshalb: **Kein Kontaktfeld löschen, das in einem offenen oder noch gebrauchten Formular steckt.** Vorher Antworten per „Download" sichern und mit der Formular-Auswertung (`ChurchDesk-Auswertung/`) abgleichen.
- Ungespeicherte Änderungen im Felder-Editor gehen beim Seitenwechsel verloren; nach dem Löschen immer „Speichern" und danach die Liste neu laden und prüfen.

---

## 6. Faustregeln

1. Erst lesen, dann ändern; bei Massenänderungen zuerst an **einem** Eintrag testen.
2. Nur das ändern, was beauftragt ist (Serientermine: „Dieser Eintrag").
3. Löschen, „Konflikte zulassen" und Änderungen an Formularfeldern nur auf ausdrückliche Anweisung.
4. Nach Änderungen kurz nachprüfen (Neu laden, Liste ansehen).
