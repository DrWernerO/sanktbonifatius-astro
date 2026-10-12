/* ===== Benutzerliste der REST-API nur für Angemeldete ===========================
 * Befund 2026-10-12: https://cms.sanktbonifatius.de/wp-json/wp/v2/users ist öffentlich lesbar
 * und verrät vier Benutzer-Kennungen (frankh, lovis, manuela-koenig, werner). Das erleichtert
 * Passwort-Angriffe (Benutzername ist dann schon bekannt). Astro braucht diese Endpunkte nicht
 * (Beiträge/Termine/News werden ohne Autorenliste geholt) — Abgleich: grep -rn "wp/v2/users" src
 * → keine Treffer. Angemeldete Nutzer (Anwendungspasswort, Editor) sehen die Liste weiter.
 * Ans ENDE der functions.php einfügen. Test danach: ohne Login muss /wp/v2/users 401/404 liefern,
 * /wp/v2/posts, /event, /pin weiter 200.
 * ⚠️ Noch NICHT eingespielt (Stand 2026-10-12).
 * ========================================================================== */
add_filter( 'rest_endpoints', function ( $endpoints ) {
    if ( ! is_user_logged_in() ) {
        unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
    }
    return $endpoints;
} );
