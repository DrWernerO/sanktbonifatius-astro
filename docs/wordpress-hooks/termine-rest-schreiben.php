/* ===== Termine (event) per REST-API anlegen/ändern ==============================
 * Problem (Handbuch team-handbuch/05): `event_meta` ist per REST nur LESBAR. Ein POST darauf
 * wird mit HTTP 200 quittiert, aber nicht gespeichert. Termine liessen sich deshalb nur ueber
 * das Admin-Formular (ACF-Metabox "Termine") anlegen -> Browser-Login noetig, keine Automatisierung.
 *
 * Loesung: ein eigenes, NUR SCHREIBENDES REST-Feld `event_input`. Es schreibt die ACF-Felder
 * ueber ihre Feld-Keys (gleiche Keys wie im Formular, siehe 05-veranstaltungskalender.md) mit
 * update_field(). Gelesen wird weiterhin wie bisher ueber `event_meta` (unveraendert).
 *
 * Aufruf (Beispiel, Anwendungspasswort-Nutzer mit Recht edit_posts):
 *   POST /wp-json/wp/v2/event
 *   { "title": "Fiat Lux", "status": "draft", "event-category": [2587],
 *     "event_input": { "start_date": "20261104", "times": "20:00 Uhr", "location": "St. Bonifatius",
 *                      "church": "bonifatius", "subtitle": "…", "description": "<p>…</p>", "image": 50886 } }
 *
 * Sicherheit: nur wer den Termin bearbeiten darf (edit_post), nur die unten gelisteten Felder,
 * Werte werden bereinigt (Datum JJJJMMTT, Kirchort aus fester Liste, HTML ueber wp_kses_post).
 *
 * Warum das funktionieren sollte (geprueft 2026-10-12 an der echten functions.php): `event_meta` wird in
 * `rest_prepare_event` aus get_post_meta($id, 'start_date'|'end_date'|'times'|'location'|'church'|'subtitle'|'image')
 * gebaut. ACF legt seine Werte genau unter diesen Feldnamen ab -> update_field() schreibt an dieselbe Stelle.
 *
 * ⚠️ NOCH NICHT EINGESPIELT / NICHT GETESTET (Stand 2026-10-12). Vor dem Einspielen:
 *   1. Backup der functions.php (Kopie des Inhalts lokal sichern).
 *   2. Ans ENDE der functions.php einfuegen (nach sb_release_attachments).
 *   3. Test: einen Entwurf per REST anlegen, dann im Admin-Formular oeffnen und kontrollieren,
 *      ob ALLE Felder gefuellt sind und `event_meta` per REST gelesen den gleichen Stand zeigt.
 *      Falls event_meta leer bleibt, baut das Plugin es erst beim Formular-Speichern auf
 *      (siehe Handbuch-Hinweis) -> dann Abschnitt "Fallback" unten.
 * ========================================================================== */
add_action( 'rest_api_init', function () {
    register_rest_field( 'event', 'event_input', array(
        'get_callback'    => null, // bewusst nicht lesbar -> Lesen weiter ueber event_meta
        'update_callback' => function ( $value, $post ) {
            if ( ! is_array( $value ) || ! function_exists( 'update_field' ) ) {
                return new WP_Error( 'sb_event_input', 'event_input muss ein Objekt sein (ACF noetig).', array( 'status' => 400 ) );
            }
            if ( ! current_user_can( 'edit_post', $post->ID ) ) {
                return new WP_Error( 'sb_event_forbidden', 'Keine Berechtigung.', array( 'status' => 403 ) );
            }

            // Feld-Name => [ACF-Key, Bereinigung]
            $felder = array(
                'subtitle'    => array( 'field_61763ed2a0c67', 'sanitize_text_field' ),
                'description' => array( 'field_61763eaaa0c66', 'wp_kses_post' ),
                'image'       => array( 'field_61763e69a0c65', 'absint' ),
                'start_date'  => array( 'field_5a3b7cb95aed5', 'sb_event_datum' ),
                'end_date'    => array( 'field_5a3b7d3e5aed6', 'sb_event_datum' ),
                'times'       => array( 'field_5a3b7d655aed8', 'sanitize_textarea_field' ),
                'location'    => array( 'field_5a3b7d755aed9', 'sanitize_textarea_field' ),
                'church'      => array( 'field_5a7c64aa7896f', 'sb_event_kirchort' ),
            );

            foreach ( $value as $name => $wert ) {
                if ( ! isset( $felder[ $name ] ) ) {
                    return new WP_Error( 'sb_event_field', "Unbekanntes Feld: $name", array( 'status' => 400 ) );
                }
                list( $key, $clean ) = $felder[ $name ];
                $wert = call_user_func( $clean, $wert );
                if ( $wert instanceof WP_Error ) return $wert;
                update_field( $key, $wert, $post->ID );
            }
            return true;
        },
        'schema' => array(
            'description' => 'Termin-Felder schreiben (start_date JJJJMMTT, end_date, times, location, church, subtitle, description, image).',
            'type'        => 'object',
            'context'     => array( 'edit' ),
        ),
    ) );
} );

// Datum muss JJJJMMTT sein und ein echtes Datum (oder leer, z. B. bei end_date).
function sb_event_datum( $v ) {
    $v = preg_replace( '/\D/', '', (string) $v );
    if ( $v === '' ) return '';
    if ( strlen( $v ) !== 8 || ! checkdate( (int) substr( $v, 4, 2 ), (int) substr( $v, 6, 2 ), (int) substr( $v, 0, 4 ) ) ) {
        return new WP_Error( 'sb_event_date', 'Datum muss JJJJMMTT sein (z. B. 20261104).', array( 'status' => 400 ) );
    }
    return $v;
}

// Kirchort nur aus der festen Liste des Auswahlfelds.
function sb_event_kirchort( $v ) {
    $erlaubt = array( 'bonifatius', 'aposteln', 'wendel', 'herz_jesu' );
    if ( $v === '' || in_array( $v, $erlaubt, true ) ) return $v;
    return new WP_Error( 'sb_event_church', 'church muss bonifatius, aposteln, wendel oder herz_jesu sein.', array( 'status' => 400 ) );
}
