# Seitenverzeichnis sanktbonifatius.de

Live-Seiten der Pfarrei Sankt Bonifatius (Frankfurt am Main) und Stand der Übernahme in das neue Astro-Frontend.

> **81 Live-Seiten erfasst · 16 bereits in Astro übernommen (erledigt) · 65 offen.** Stand: 21.06.2026.

> Quelle: page-/jobs-Sitemap. Dieses Verzeichnis ersetzt die frühere Word-Datei und wird im Repo gepflegt.


## 1 · Startseite

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Startseite | [Link](https://www.sanktbonifatius.de/) | `src/pages/index.astro` | Werner | ✅ erledigt | Page-ID 45758, vollständig auf Astro-Komponenten umgestellt |

## 2 · Über uns (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Über uns | [Link](https://www.sanktbonifatius.de/ueberuns/) | `src/pages/ueberuns.astro` | Werner | ✅ erledigt |  |
| Barrierefreiheit | [Link](https://www.sanktbonifatius.de/ueberuns/barrierefreiheit/) | — | — | offen |  |
| ChurchDesk-Registrierung | [Link](https://www.sanktbonifatius.de/ueberuns/churchdesk-registrierung/) | — | — | offen |  |
| Finanzen | [Link](https://www.sanktbonifatius.de/ueberuns/finanzen/) | — | — | offen |  |
| Gemeinschaft | [Link](https://www.sanktbonifatius.de/ueberuns/gemeinschaft/) | `src/pages/ueberuns/gemeinschaft.astro` | Werner | ✅ erledigt | Eigene Gem*-Komponenten (Hero, Stats, Welcome, Gruppen, FAQ, CTA) |
| Leitung | [Link](https://www.sanktbonifatius.de/ueberuns/leitung/) | `src/pages/ueberuns/leitung.astro` | Werner | ✅ erledigt | Eigene Lt*-Komponenten; Pfarrgemeinderat & Verwaltungsrat mit Gremien-Listen |
| Pastoralteam | [Link](https://www.sanktbonifatius.de/ueberuns/pastoralteam/) | `src/pages/ueberuns/pastoralteam.astro` | Werner | ✅ erledigt | Eigene Pt*-Komponenten; 11 Team-Karten + Foto-Hero (seelsorge-stbonifatius.jpg) |
| Pfarrer Dr. Werner Otto | [Link](https://www.sanktbonifatius.de/ueberuns/pfarrer-dr-werner-otto/) | — | — | offen |  |

## 3 · Kontakt (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Kontakt | [Link](https://www.sanktbonifatius.de/kontakt/) | `src/pages/kontakt.astro` | Werner | ✅ erledigt | Page-ID 46800, eigene Kontakt*-Komponenten |
| Beratung und Hilfe | [Link](https://www.sanktbonifatius.de/kontakt/beratung-und-hilfe/) | — | — | offen |  |
| Engagement | [Link](https://www.sanktbonifatius.de/kontakt/engagement/) | — | — | offen |  |
| Katholisch werden | [Link](https://www.sanktbonifatius.de/kontakt/katholisch-werden/) | — | — | offen |  |
| Newsletter | [Link](https://www.sanktbonifatius.de/kontakt/newsletter/) | — | — | offen |  |
| Pfarrbüro | [Link](https://www.sanktbonifatius.de/kontakt/pfarrbuero/) | — | — | offen |  |
| Seelsorge | [Link](https://www.sanktbonifatius.de/kontakt/seelsorge/) | — | — | offen |  |
| Trauerfall | [Link](https://www.sanktbonifatius.de/kontakt/trauerfall/) | — | — | offen |  |
| WhatsApp-Kanal | [Link](https://www.sanktbonifatius.de/kontakt/whatsapp-kanal/) | — | — | offen |  |

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

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| Kirchorte (Übersicht) | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/) | — | — | offen |  |
| Herz Jesu | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/herz-jesu/) | — | — | offen |  |
| St. Aposteln | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-aposteln/) | — | — | offen |  |
| St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/) | `src/pages/ueberuns/kirchorte/st-bonifatius.astro` | Werner | ✅ erledigt |  |
| Bücherei St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/buecherei-st-bonifatius/) | — | — | offen |  |
| Gruppen St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/gruppen-st-bonifatius/) | — | — | offen |  |
| Kirche St. Bonifatius | [Link](https://www.sanktbonifatius.de/ueberuns/kirchorte/st-bonifatius/kirche/) | `src/pages/ueberuns/kirchorte/st-bonifatius/kirche.astro` | Werner | ✅ erledigt |  |
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
| Gottesdienste, die berühren | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/gottesdienste-die-beruehren/) | — | — | offen |  |
| Gottesdienstordnung | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/gottesdienstordnung/) | `src/pages/gottesdienst-glaube/gottesdienstordnung.astro` | Werner | ✅ erledigt |  |
| Online-Gebetbuch | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/online-gebetbuch/) | — | — | offen |  |
| Taufanmeldung | [Link](https://www.sanktbonifatius.de/gottesdienst-glaube/taufanmeldung/) | — | — | offen | Inhaltlich von der Taufe-Seite (Abschnitt 4) abgedeckt |

## 7 · BoniFamily (mit Unterseiten)

| Name der Seite | URL | Neue Astro-Seite | Zuständig | Status | Bemerkungen |
|---|---|---|---|---|---|
| BoniFamily | [Link](https://www.sanktbonifatius.de/bonfamily/) | — | — | offen |  |
| Familiengottesdienste | [Link](https://www.sanktbonifatius.de/bonfamily/familiengottesdienste/) | — | — | offen |  |
| Familientreffpunkte | [Link](https://www.sanktbonifatius.de/bonfamily/familientreffpunkte/) | — | — | offen |  |
| WhatsApp-Kanal | [Link](https://www.sanktbonifatius.de/bonfamily/whatsapp-kanal/) | — | — | offen |  |

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
| Kitas | [Link](https://www.sanktbonifatius.de/kitas/) | — | — | offen |  |
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
| Was ist neu | [Link](https://www.sanktbonifatius.de/was-ist-neu/) | — | — | offen |  |
| News aktualisieren | [Link](https://www.sanktbonifatius.de/news-aktualisieren/) | — | — | offen | Interne/technische Seite |
