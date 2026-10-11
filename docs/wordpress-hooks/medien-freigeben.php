/* ===== Medien freigeben, wenn ihr Eltern-Eintrag verschwindet ================
 * Hintergrund (2026-10-11): Ein Bild, das im Termin-Formular hochgeladen wurde, hängt als
 * "Anhang" an diesem Termin und erbt dessen Status. Wird der Termin (z. B. das Original einer
 * duplizierten Serie wie "Fiat Lux") in den Papierkorb verschoben, gelöscht oder auf Entwurf
 * gesetzt, liefert die öffentliche REST-API fuer das Bild 401 -> alle anderen Termine/Beitraege,
 * die dasselbe Bild nutzen, erscheinen im Astro-Frontend ohne Vorschaubild.
 * Loesung: Beim Verlassen des Status "veroeffentlicht" (und beim Papierkorb/Loeschen) werden
 * die Anhaenge vom Eltern-Eintrag geloest (post_parent = 0) -> Bild bleibt oeffentlich abrufbar.
 * ========================================================================== */
function sb_release_attachments( $post_id ) {
    if ( ! in_array( get_post_type( $post_id ), array( 'event', 'post', 'page', 'pin' ), true ) ) return;
    $ids = get_posts( array(
        'post_type'      => 'attachment',
        'post_parent'    => $post_id,
        'post_status'    => 'any',
        'fields'         => 'ids',
        'posts_per_page' => -1,
    ) );
    global $wpdb;
    foreach ( $ids as $att_id ) {
        $wpdb->update( $wpdb->posts, array( 'post_parent' => 0 ), array( 'ID' => $att_id ) );
        clean_post_cache( $att_id );
    }
}
add_action( 'wp_trash_post', 'sb_release_attachments' );
add_action( 'before_delete_post', 'sb_release_attachments' );
add_action( 'transition_post_status', function ( $new_status, $old_status, $post ) {
    if ( 'publish' === $old_status && 'publish' !== $new_status ) {
        sb_release_attachments( $post->ID );
    }
}, 10, 3 );
