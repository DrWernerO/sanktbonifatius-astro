# Seitenverzeichnis sanktbonifatius.de

Live-Seiten der Pfarrei Sankt Bonifatius (Frankfurt am Main) und Stand der Übernahme in das neue Astro-Frontend.

> **79 Live-Seiten erfasst · 30 bereits in Astro übernommen bzw. per Direktlink erledigt · 49 offen.** Stand: 24.06.2026.

> Quelle: page-/jobs-Sitemap. Dieses Verzeichnis ersetzt die frühere Word-Datei und wird im Repo gepflegt.


## 1 · Startseite

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Startseite | [Link](https://www.sanktbonifatius.de/) | `src/pages/index.astro` | Werner | ✅ erledigt | Page-ID 45758, vollständig auf Astro-Komponenten umgestellt |

## 2 · Über uns (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Über uns | [Link](https://www.sanktbonifatius.de/ueberuns/) | `src/pages/ueberuns.astro` | Werner | ✅ erledigt |  |
| Barrierefreiheit | [Link](https://www.sanktbonifatius.de/ueberuns/barrierefreiheit/) | `src/pages/ueberuns/barrierefreiheit.astro` | Werner | ✅ erledigt | Page-ID 49119, eigene Bar*-Komponenten; Original-Foto-Hero, 4 Kirchorte als aufklappbare Zugänglichkeits-Infos |
| ChurchDesk-Registrierung | [Link](https://www.sanktbonifatius.de/ueberuns/churchdesk-registrierung/) | `src/pages/ueberuns/churchdesk-registrierung.astro` | Werner | ✅ erledigt | Page-ID 49146, eigene ChurchDesk*-Komponenten (Präfix `astro-cd`); ChurchDesk-Anmeldeformular als Embed (forms.churchdesk.com), FAQ + Hilfe-Karten |
| Finanzen | [Link](https://www.sanktbonifatius.de/ueberuns/finanzen/) | `src/pages/ueberuns/finanzen.astro` | Werner | ✅ erledigt | Page-ID 48786, eigene Fin*-Komponenten; Bistum-/Pfarrei-Haushalt als Balkengrafiken, Finanzbericht-PDF-Download (PDF in public/uploads) |
| Gemeinschaft | [Link](https://www.sanktbonifatius.de/ueberuns/gemeinschaft/) | `src/pages/ueberuns/gemeinschaft.astro` | Werner | ✅ erledigt | Eigene Gem*-Komponenten (Hero, Stats, Welcome, Gruppen, FAQ, CTA) |
| Leitung | [Link](https://www.sanktbonifatius.de/ueberuns/leitung/) | `src/pages/ueberuns/leitung.astro` | Werner | ✅ erledigt | Eigene Lt*-Komponenten; Pfarrgemeinderat & Verwaltungsrat mit Gremien-Listen |
| Pastoralteam | [Link](https://www.sanktbonifatius.de/ueberuns/pastoralteam/) | `src/pages/ueberuns/pastoralteam.astro` | Werner | ✅ erledigt | Eigene Pt*-Komponenten; 11 Team-Karten + Foto-Hero (seelsorge-stbonifatius.jpg) |
| Pfarrer Dr. Werner Otto | [Link](https://www.sanktbonifatius.de/ueberuns/pfarrer-dr-werner-otto/) | — | — | offen |  |

## 3 · Kontakt (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Kontakt | [Link](https://www.sanktbonifatius.de/kontakt/) | `src/pages/kontakt.astro` | Werner | ✅ erledigt | Page-ID 46800, eigene Kontakt*-Komponenten |
| Beratung und Hilfe | [Link](https://www.sanktbonifatius.de/kontakt/beratung-und-hilfe/) | `src/pages/kontakt/beratung-und-hilfe.astro` | Werner | ✅ erledigt | Page-ID 48312, eigene Beratung*-Komponenten (Präfix `astro-ber`); Notfall-Banner (Telefonseelsorge), Angebote, Ansprechpersonen mit Foto (Doly Kadavil, Martin Kestler), externe Beratungsstellen, Hinweisgeberschutz |
| Engagement | [Link](https://www.sanktbonifatius.de/kontakt/engagement/) | `src/pages/kontakt/engagement.astro` | Werner | ✅ erledigt | Page-ID 48449, eigene Engagement*-Komponenten (Präfix `astro-eng`); 6 Engagement-Kacheln, Schritte, CTA (WP-Türkis bewusst auf Astro-Bordeaux umgestellt) |
| Katholisch werden | [Link](https://www.sanktbonifatius.de/kontakt/katholisch-werden/) | — | — | offen |  |
| Newsletter | [Link](https://www.sanktbonifatius.de/kontakt/newsletter/) | `src/pages/kontakt/newsletter.astro` | Werner | ✅ erledigt | Page-ID 48663, eigene Nl*-Komponenten (Präfix `astro-nl`); Hero, Bordeaux-Streifen (3 Argumente), Intro, ChurchDesk-Abo-Formular als Embed (`forms.churchdesk.com/f/Duf7gO_IQC`, postMessage-Resize wie ChurchDeskForm), Datenschutz-Box |
| Pfarrbüro | [Link](https://www.sanktbonifatius.de/kontakt/pfarrbuero/) | `src/pages/kontakt/pfarrbuero.astro` | Werner | ✅ erledigt | Page-ID 47815, eigene Pb*-Komponenten (Präfix `astro-pb`); Hero, Anlaufstelle + Büro-Infokarte (Adresse/Telefon/Öffnungszeiten/E-Mail), Verwaltungsteam (6 Fotos lokal `public/uploads/2026/06`), Raumvermietung (raum@), 5 FAQ, CTA + SEO-Text |
| Seelsorge | [Link](https://www.sanktbonifatius.de/kontakt/seelsorge/) | — | — | offen |  |
| Trauerfall | [Link](https://www.sanktbonifatius.de/kontakt/trauerfall/) | — | — | offen |  |
| WhatsApp-Kanal | [Link](https://www.sanktbonifatius.de/kontakt/whatsapp-kanal/) | — (Nav-Direktlink) | Werner | ✅ erledigt | Keine eigene Astro-Seite nötig — Nav verlinkt direkt auf den WhatsApp-Kanal (Abo): `whatsapp.com/channel/0029VbB7E1CLikgAZ8cyHk1a` |

## 4 · Segen und Sakramente (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Segen und Sakramente | [Link](https://www.sanktbonifatius.de/segen-sakramente/) | `src/pages/segen-sakramente/index.astro` | Werner | ✅ erledigt | Page-ID 48265, Übersichtsseite |
| Beichte | [Link](https://www.sanktbonifatius.de/segen-sakramente/beichte/) | — | — | offen |  |
| Erstkommunion | [Link](https://www.sanktbonifatius.de/segen-sakramente/erstkommunion/) | — | — | offen |  |
| Firmung | [Link](https://www.sanktbonifatius.de/segen-sakramente/firmung/) | — | — | offen |  |
| Krankensalbung | [Link](https://www.sanktbonifatius.de/segen-sakramente/krankensalbung/) | — | — | offen |  |
| Taufe | [Link](https://www.sanktbonifatius.de/segen-sakramente/taufe/) | `src/pages/segen-sakramente/taufe.astro` | Werner | ✅ erledigt | Page-ID 46566; Anmeldeformular postet an eigene Route `/api/taufe-anmeldung` → erzeugt ausgefülltes amtliches PDF + Mailversand ans Pfarrbüro (Handbuch 13b). Offen erst beim Netlify-Go-Live: SMTP-Daten + Adapter |
| Tauftermine | [Link](https://www.sanktbonifatius.de/segen-sakramente/taufe/tauftermine/) | — | Werner | ✅ erledigt | WP-Datenquelle (Page 50101) für den Tauftermine-Block; keine eigene Astro-Seite |
| Trauung | [Link](https://www.sanktbonifatius.de/segen-sakramente/trauung/) | — | — | offen |  |

## 5 · Kirchorte (mit Unterseiten)

> **Astro-Strukturänderung (22.06.2026):** Kirchorte liegen im neuen Frontend auf der Hauptebene (`/kirchorte/…`, eigener Menüpunkt) statt unter „Über uns". Die Live-WordPress-URLs unten bleiben vorerst unverändert.

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Kirchorte (Übersicht) | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/) | — | — | offen |  |
| Herz Jesu | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/herz-jesu/) | — | — | offen |  |
| St. Aposteln | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-aposteln/) | — | — | offen |  |
| St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/) | `src/pages/kirchorte/st-bonifatius.astro` | Werner | ✅ erledigt | Astro-Pfad jetzt `/kirchorte/st-bonifatius/` |
| Bücherei St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/buecherei-st-bonifatius/) | — | — | offen |  |
| Gruppen St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/gruppen-st-bonifatius/) | — | — | offen |  |
| Kirche St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/) | `src/pages/kirchorte/st-bonifatius/kirche.astro` | Werner | ✅ erledigt | Astro-Pfad jetzt `/kirchorte/st-bonifatius/kirche/` |
| Kirche – Altar | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/altar/) | — | — | offen |  |
| Kirche – Beleuchtung | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/beleuchtung/) | — | — | offen |  |
| Kirche – Bonifatius-Reliquie | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/bonifatius-reliquie/) | — | — | offen |  |
| Kirche – Chorraum | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/chorraum/) | — | — | offen |  |
| Kirche – Engelbilder | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/engelbilder/) | — | — | offen |  |
| Kirche – Madonna | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/madonna/) | — | — | offen |  |
| Kirche – Marienbild | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/marienbild/) | — | — | offen |  |
| Kirche – Marienfigur | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/marienfigur/) | — | — | offen |  |
| Kirche – Orgel | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/orgel/) | — | — | offen |  |
| Kirche – Osterkerze | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/osterkerze/) | — | — | offen |  |
| Kirche – Sakristei | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/sakristei/) | — | — | offen |  |
| Kirche – Taufstein | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/taufstein/) | — | — | offen |  |
| St. Wendel | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-wendel/) | — | — | offen |  |

## 6 · Gottesdienst & Glaube (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Gottesdienst & Glaube | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/) | `src/pages/gottesdienst-glaube.astro` | Werner | ✅ erledigt | Page-ID 45667 |
| Gottesdienste, die berühren | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/gottesdienste-die-beruehren/) | `src/pages/gottesdienst-glaube/gottesdienste-die-beruehren.astro` | Werner | ✅ erledigt | Page-ID 47578, eigene Gdb*-Komponenten (Präfix `astro-gdb`); Foto-Hero, Intro, 3 Format-Karten (Fiat Lux/Taizé/BonEsprit mit Terminen), CTA, „Wo wir feiern" (Maps-Link) |
| Gottesdienstordnung | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/gottesdienstordnung/) | `src/pages/gottesdienst-glaube/gottesdienstordnung.astro` | Werner | ✅ erledigt |  |
| Online-Gebetbuch | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/online-gebetbuch/) | — | — | offen |  |
| Taufanmeldung | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/taufanmeldung/) | — | — | offen | Inhaltlich von der Taufe-Seite (Abschnitt 4) abgedeckt |

## 7 · BonFamily (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| BonFamily | [Link](https://www.sanktbonifatius.de/bonfamily/) | `src/pages/bonfamily.astro` | Frank | ✅ erledigt | Page-ID 45898; eigene Bf*-Komponenten (Präfix `astro-bf`); Hero, Strip, Welcome, EventCalendar (Kat. 2586), Gottesdienste, Taufe-Teaser, Lounge-Karten, Fotogalerie (11 Fotos), Ansprechpartner, FAQ, CTA |
| Familiengottesdienste | [Link](https://www.sanktbonifatius.de/bonfamily/familiengottesdienste/) | `src/pages/bonfamily/familiengottesdienste.astro` | Frank | ✅ erledigt | Page-ID 48268; eigene Kfg*-Komponenten (Präfix `astro-kfg`); Foto-Hero, Info-Strip (1.&3. Sonntag), Intro, 2 Format-Kacheln (Bilderbuch-/Kreativ-/Familiengottesdienst) mit Fotos, Terminliste 3-spaltig, 6 FAQ, CTA |
| Familientreffpunkte | [Link](https://www.sanktbonifatius.de/bonfamily/familientreffpunkte/) | `src/pages/bonfamily/familientreffpunkte.astro` | Frank | ✅ erledigt | Page-ID 49158; eigene Fm*-Komponenten (Präfix `astro-fm`); Hero, Intro, 2 Treffpunkt-Karten (Baby-Lounge + Familien-Lounge St. Bonif. / Eltern-Kind-Gruppe St. Wendel) mit Fotos, Schnell-Links, Kontakt-Section |
| WhatsApp-Kanal | [Link](https://www.sanktbonifatius.de/bonfamily/whatsapp-kanal/) | `src/pages/bonfamily/whatsapp-kanal.astro` | Frank | ✅ erledigt | Page-ID 49171; eigene Wa*-Komponenten (Präfix `astro-wa`); grüner WA-Farbverlauf-Hero, 3 Vorteils-Karten, CTA-Box „Heißer Draht", 5 FAQ |

## 8 · Jugend (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Jugend | [Link](https://www.sanktbonifatius.de/jugend/) | `src/pages/jugend.astro` | Werner | ✅ erledigt | Eigene Jugend*-Komponenten (Page 46717) |
| Kinder- und Jugendfreizeiten | [Link](https://www.sanktbonifatius.de/jugend/kinder-und-jugendfreizeiten/) | — | — | offen |  |
| Ministranten St. Bonifatius | [Link](https://www.sanktbonifatius.de/jugend/ministranten-st-bonifatius/) | — | — | offen |  |
| Reisebedingungen | [Link](https://www.sanktbonifatius.de/jugend/reisebedingungen/) | — | — | offen |  |

## 9 · Engagiert leben (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Engagiert leben | [Link](https://www.sanktbonifatius.de/engagiert-leben/) | — | — | offen |  |
| Nachbarschaftliches Hilfenetz | [Link](https://www.sanktbonifatius.de/engagiert-leben/nachbarschaftliches-hilfenetz/) | — | — | offen |  |
| Offener Kühlschrank | [Link](https://www.sanktbonifatius.de/engagiert-leben/offener-kuehlschrank/) | — | — | offen |  |

## 10 · Kultur & Begegnung (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Kultur & Begegnung | [Link](https://www.sanktbonifatius.de/kultur-begegnung/) | — | — | offen |  |
| Büchereien | [Link](https://www.sanktbonifatius.de/kultur-begegnung/buechereien/) | — | — | offen |  |
| Chöre | [Link](https://www.sanktbonifatius.de/kultur-begegnung/choere/) | — | — | offen |  |

## 11 · Kitas (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Kitas | [Link](https://www.sanktbonifatius.de/kitas/) | — | — | offen | Im Astro-Menü jetzt eigener Hauptpunkt (`/kitas/`); Seite noch zu bauen |
| Kita Deutschorden | [Link](https://www.sanktbonifatius.de/kitas/deutschorden-cs/) | — | — | offen |  |
| Kita Herz Jesu | [Link](https://www.sanktbonifatius.de/kitas/herz-jesu-cs/) | — | — | offen |  |
| Kita St. Aposteln | [Link](https://www.sanktbonifatius.de/kitas/st-aposteln-cs/) | — | — | offen |  |
| Kita St. Bonifatius | [Link](https://www.sanktbonifatius.de/kitas/st-bonifatius-cs/) | — | — | offen |  |
| Kita St. Wendel | [Link](https://www.sanktbonifatius.de/kitas/st-wendel-cs/) | — | — | offen |  |
| Stellenbörse | [Link](https://www.sanktbonifatius.de/kitas/stellenboerse/) | — | — | offen |  |

## 12 · Alle anderen Seiten

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| BoniBlog | [Link](https://www.sanktbonifatius.de/boniblog/) | `src/pages/boniblog.astro` | Werner | ✅ erledigt | Beiträge dynamisch via src/pages/blog/[slug].astro |
| Terminkalender | [Link](https://www.sanktbonifatius.de/terminkalender/) | `src/pages/terminkalender.astro` | Werner | ✅ erledigt | Termin-Detailseiten dynamisch via src/pages/termine/[slug].astro |
| Spenden | [Link](https://www.sanktbonifatius.de/spenden/) | — | — | offen | Spenden-Button in der Nav |
| Suche | [Link](https://www.sanktbonifatius.de/suche/) | — | — | offen |  |
| Datenschutz | [Link](https://www.sanktbonifatius.de/datenschutz/) | — | — | offen |  |
| Impressum | [Link](https://www.sanktbonifatius.de/impressum/) | — | — | offen |  |
| Ich bleibe | [Link](https://www.sanktbonifatius.de/ich-bleibe/) | — | — | offen |  |
