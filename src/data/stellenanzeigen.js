// Stellenanzeigen der Kita-Stellenbörse — Inhalte 1:1 aus den alten WordPress-Draft-Seiten
// (cms.sanktbonifatius.de/kitas/stellenboerse/<slug>/) übernommen, dort noch aus der WP-Migration
// liegen geblieben und nie als Astro-Seite gebaut worden (Links auf der Übersichtsseite liefen
// deshalb ins Leere — Meldung Jeannine 21.08.2026). Struktur pro Stelle: title, kita, pills (Meta-
// Zeile), sections (Freitext oder Liste je Abschnitt), contact (Rückfragen), applyEmail.
// Kleine Tippfehler aus der WP-Quelle (Zeilenumbruch-Bindestriche wie "Fach-kraft") korrigiert.

export const STELLEN = [
  {
    slug: 'fachkraft-st-bonifatius',
    kita: 'Kita St. Bonifatius',
    title: 'Erzieher(in) / Pädagogische Fachkraft / Heilerziehungspfleger(in) (Ü3) (w/m/d)',
    pills: ['Frankfurt am Main', 'Vollzeit (39h/Woche)', 'Teilzeit'],
    sections: [
      {
        h2: 'Über die Stelle',
        paras: [
          'Die Pfarrei St. Bonifatius sucht ab 01.08.2026 oder später für die katholische Kita Sankt Bonifatius ein(e) Erzieher(in) / Pädagogische Fachkraft / Heilerziehungspfleger(in) (Ü3) (w/m/d) in Vollzeit (39h/Woche) oder Teilzeit, unbefristet. In unserer Kindertageseinrichtung St. Bonifatius in Frankfurt Sachsenhausen begleiten und fördern wir 100 Kinder und Familien mit sozialem und christlichem Umfeld in zwei Krippen- und vier Kindergartengruppen.',
        ],
      },
      {
        h2: 'Das sind Ihre Aufgaben',
        items: [
          'Sie begleiten Kinder im Alter von 3 bis 6 Jahren liebevoll und professionell in ihrer Entwicklung. Sie gestalten den pädagogischen Alltag gemeinsam mit den Kindern und unterstützen sie in ihrer individuellen Entwicklung.',
          'Sie arbeiten mit Kindern aus unterschiedlichen kulturellen Hintergründen und fördern ein respektvolles Miteinander.',
          'Sie machen christliche, soziale und kulturelle Werte im Alltag der Kita erlebbar.',
          'Sie planen, gestalten und reflektieren pädagogische Angebote und Projekte.',
          'Sie beobachten und dokumentieren die Entwicklungsprozesse der Kinder.',
          'Sie arbeiten nach dem situationsorientierten Ansatz auf Grundlage des Hessischen Bildungs- und Erziehungsplans.',
          'Sie bringen Ihre eigenen Ideen, Stärken und Interessen aktiv in die pädagogische Arbeit ein.',
        ],
      },
      {
        h2: 'Das zeichnet Sie aus',
        items: [
          'Sie verfügen über eine abgeschlossene pädagogische Ausbildung oder ein abgeschlossenes pädagogisches Hochschul- bzw. Fachhochschulstudium.',
          'Sie sind offen für pädagogische Reflexion im Team, z. B. in kollegialer Fallberatung oder bei der Weiterentwicklung des pädagogischen Konzepts.',
          'Sie interessieren sich für eine situationsorientierte Pädagogik, die sich an den Bedürfnissen, Fragen und Themen der Kinder orientiert.',
          'Sie arbeiten gerne im Team und bringen sich aktiv in konzeptionelle Prozesse ein.',
          'Sie haben Freude daran, sich fachlich und persönlich weiterzuentwickeln – unterstützt durch interne und externe Fortbildungsangebote.',
        ],
      },
      {
        h2: 'Das bieten wir Ihnen',
        items: [
          'Eine freundliche, wertschätzende und lebendige Arbeitsatmosphäre in einem engagierten Team',
          'Arbeiten nach klaren Qualitätsstandards sowie die Möglichkeit, an deren Weiterentwicklung aktiv mitzuwirken',
          'Bis zu sechs Team- und Konzeptionstage pro Jahr',
          '30 Tage Urlaub sowie zusätzlich vier arbeitsfreie Tage bei einer 5-Tage-Woche',
          'Ein kostenfreies Deutschlandticket sowie die Möglichkeit zum Job Rad-Leasing',
          'Eine attraktive arbeitgeberunterstützte Altersvorsorge über die kirchliche Zusatzversorgungskasse',
          'Die Möglichkeit, die Weiterentwicklung der Kita aktiv mitzugestalten',
          'Regelmäßige Teambesprechungen sowie kollegiale Fallberatung',
          'Vielfältige Fort- und Weiterbildungsmöglichkeiten sowie Fachberatung, Coaching und Supervision',
        ],
      },
    ],
    contact: { name: 'Frank Neumann', role: 'Leitung der Einrichtung', tel: '069 63 68 18', telHref: '069636818' },
    hinweis: 'Schwerbehinderte Menschen werden bei gleicher Eignung bevorzugt eingestellt.',
  },
  {
    slug: 'fachkraft-deutschorden',
    kita: 'Kita Deutschorden',
    title: 'Pädagogische Fachkraft (w/m/d)',
    pills: ['Frankfurt am Main', 'Vollzeit', 'Teilzeit'],
    sections: [
      {
        h2: 'Über die Stelle',
        paras: [
          'Die Kita Deutschorden ist eine von fünf Kitas der Pfarrei St. Bonifatius. In der Einrichtung werden bis zu 63 Kinder in 3 altersgemischten Kindergartengruppen betreut.',
        ],
      },
      {
        h2: 'Ihr Profil',
        items: [
          'Befähigung zur Tätigkeit als pädagogische Fachkraft gemäß HKJGB §25b',
          'Sie haben Freude an der Arbeit mit Kindern und ihren Familien und setzen sich mit viel Empathie für die Umsetzung des frühkindlichen Bildungsauftrags ein',
          'Sie besitzen die Fähigkeit im Team zu agieren und konzeptionell zu arbeiten',
          'Sie haben eine aufgeschlossene und wertschätzende Persönlichkeit und bauen tragfähige Erziehungspartnerschaften mit Eltern auf',
          'In der Regel gehören Sie der katholischen Kirche an und identifizieren sich mit deren Grundsätzen und Zielen',
        ],
      },
      {
        h2: 'Wir bieten',
        items: [
          'Eine lebendige und wertschätzende Arbeitsatmosphäre',
          'Einen sicheren und attraktiven Arbeitsplatz mit einer Vielzahl an weiteren Leistungen wie z. B. Weihnachtsgeld und Leistungszulage, betriebliche Altersvorsorge, Jobticket, große Einkaufsplattform mit Mitarbeiterrabatten',
          '30 Urlaubstage plus zusätzliche kirchliche Feiertage',
          'Vergütung nach TVöD (SuE) S8b',
        ],
      },
    ],
    contact: { name: 'Kim Sänger', role: 'Kita-Leitung', tel: '069 27 27 79 87', telHref: '+496927277987', email: 'kita-deutschorden@sanktbonifatius.de' },
  },
  {
    slug: 'leitung-deutschorden',
    kita: 'Kita Deutschorden',
    title: 'Kita-Leitung (w/m/d)',
    pills: ['Frankfurt am Main', 'Vollzeit', 'Teilzeit (mind. 30 Std./Woche)'],
    sections: [
      {
        h2: 'Über die Stelle',
        paras: [
          'Die Pfarrei St. Bonifatius Frankfurt sucht zum 1.8.2026 für die katholische Kita Deutschorden eine Kita-Leitung (w/m/d). Vergütung nach TVöD (SuE) S15, Vollzeit bzw. Teilzeit (mind. 30 Stunden/Woche). In unserer Kita begleiten und fördern wir rund 60 Kinder im Alter von drei bis sechs Jahren in drei altersgemischten Gruppen. Die Kita Deutschorden ist eine von fünf Kitas der Pfarrei St. Bonifatius. Zu Ihren Aufgaben gehört neben der pädagogischen, personellen und organisatorischen Leitung der Einrichtung die Sicherstellung und Weiterentwicklung der pädagogischen Qualität und die vertrauensvolle Zusammenarbeit mit Familien, Träger und Kooperationspartnern.',
        ],
      },
      {
        h2: 'Das bringen Sie mit',
        items: [
          'Abgeschlossene pädagogische Ausbildung oder pädagogisches Studium gemäß HKJGB §25b',
          'Idealerweise haben Sie erste Leitungserfahrung im Bereich Kindertagesbetreuung',
          'Organisationsgeschick, Verantwortungsbewusstsein und Kommunikationsstärke',
          'Hohe Methoden- und Fachkompetenz',
          'Interesse an moderner Pädagogik und konzeptioneller Weiterentwicklung',
          'Gute Kenntnisse in MS Office und digitalen Anwendungen',
          'Identifikation mit den Grundsätzen der katholischen Kirche',
        ],
      },
      {
        h2: 'Unser Angebot',
        items: [
          'Vergütung nach TVöD SuE 15',
          'Unbefristete Stelle in Vollzeit oder Teilzeit',
          '30 Urlaubstage plus zusätzliche kirchliche Feiertage',
          'Jahressonderzahlung, betriebliche Altersvorsorge',
          'Kostenfreies Deutschlandticket und Möglichkeit zum JobRad-Leasing',
          'Umfangreiche Fort- und Weiterbildungsmöglichkeiten sowie gezielte Fachberatungen, Coachings und Supervisionen',
        ],
      },
    ],
    hinweis: 'Schwerbehinderte Menschen werden bei gleicher Eignung bevorzugt eingestellt. Bewerbungen von Menschen aller Nationalitäten sind ausdrücklich erwünscht.',
  },
  {
    slug: 'fachkraft-herz-jesu',
    kita: 'Kita Herz Jesu',
    title: 'Pädagogische Fachkraft (w/m/d)',
    pills: ['Frankfurt am Main', 'Vollzeit', 'Teilzeit'],
    sections: [
      {
        h2: 'Über die Stelle',
        paras: [
          'Die Kita Herz Jesu ist eine von fünf Kitas der Pfarrei St. Bonifatius. In der Einrichtung werden bis zu 60 Kinder in 3 altersgemischten Kindergartengruppen betreut.',
        ],
      },
      {
        h2: 'Ihr Profil',
        items: [
          'Befähigung zur Tätigkeit als pädagogische Fachkraft gemäß HKJGB §25b',
          'Sie haben Freude an der Arbeit mit Kindern und ihren Familien und setzen sich mit viel Empathie für die Umsetzung des frühkindlichen Bildungsauftrags ein',
          'Sie besitzen die Fähigkeit im Team zu agieren und konzeptionell zu arbeiten',
          'Sie haben eine aufgeschlossene und wertschätzende Persönlichkeit und bauen tragfähige Erziehungspartnerschaften mit Eltern auf',
          'In der Regel gehören Sie der katholischen Kirche an und identifizieren sich mit deren Grundsätzen und Zielen',
        ],
      },
      {
        h2: 'Wir bieten',
        items: [
          'Eine lebendige und wertschätzende Arbeitsatmosphäre',
          'Einen sicheren und attraktiven Arbeitsplatz mit einer Vielzahl an weiteren Leistungen wie z. B. Weihnachtsgeld und Leistungszulage, betriebliche Altersvorsorge, Jobticket, große Einkaufsplattform mit Mitarbeiterrabatten',
          '30 Urlaubstage plus zusätzliche kirchliche Feiertage',
          'Vergütung nach TVöD (SuE) S8b',
        ],
      },
    ],
    contact: { name: 'Dorota Wieckowska', role: 'Kita-Leitung', tel: '0157-35700669', telHref: '+4915735700669', email: 'kita-herzjesu@sanktbonifatius.de' },
  },
];

export const BEWERBUNG_EMAIL = 'bewerbungen-kita@sanktbonifatius.de';
