<?php
/**
 * Plugin Name: SB Headless
 * Description: Datenmodell + REST-/Rebuild-Logik für das Astro-Frontend (Sankt Bonifatius). Ausgelagert aus der functions.php des Child-Themes "ursprung-bonifatius", damit das Theme ersetzt werden kann, ohne Termine/News/API zu verlieren.
 * Version:     1.0.0
 * Author:      Pfarrei Sankt Bonifatius
 *
 * ENTWURF vom 2026-10-12 — NICHT getestet (auf dem Entwicklungsrechner steht kein PHP zur Verfuegung).
 * ⚠️ Lehre aus dem 1. Einspielversuch (2026-10-12, Fatal Error "Cannot redeclare ..."): Plugins laden VOR dem
 * Theme. Steht dieselbe Funktion ungeschuetzt in der functions.php, stuerzt WP ab. Deshalb tragen ALLE Funktionen
 * dieses Plugins den eindeutigen Praefix sb_hl_ (kein Namenskonflikt mit der functions.php moeglich).
 * Die Sperre 'sb_netlify_build_lock' wird bewusst mit der functions.php GETEILT (Entprellung, kein Doppel-Build).
 * Doppelt registrierte Hooks (Closures) sind harmlos; einzig die Termin-Spalte "Datum" erscheint waehrend der
 * Uebergangszeit doppelt (rein optisch).
 * Einspielen/Test/Aufraeumen: siehe README.md im selben Ordner.
 *
 * Inhalt (Gruppe A aus FUNCTIONS-PHP-INVENTAR.md):
 *   1. Post-Types event / pin / podcast + Taxonomie event-category
 *   2. ACF-Optionsseite "Optionen"
 *   3. REST: event_meta (lesen), event_input (schreiben, NEU), subtitle (Beitraege), pin_data (News)
 *   4. Netlify-Rebuild (Beitrag/Seite/News + Pfarrbrief/Highlights/Monatsbrief/Tauftermine)
 *   5. Medien freigeben (sb_hl_medien_freigeben)
 *   6. Anwendungspasswoerter, Termin-Spalten im Admin
 *   7. REST-Benutzerliste nur fuer Angemeldete (NEU)
 */
if ( ! defined( 'ABSPATH' ) ) exit;

/* ---------------------------------------------------------------------------
 * 1. Post-Types + Taxonomie (Beschriftungen wie bisher; Slugs/Optionen unveraendert)
 * ------------------------------------------------------------------------- */
if ( ! function_exists( 'sb_hl_labels' ) ) {
    // $S/$P = Einzahl/Mehrzahl am Satzanfang, $s/$p = mitten im Satz, $ctx = Kontext fuer _x()
    function sb_hl_labels( $name, $S, $P, $s, $p, $ctx ) {
        return array(
            'name'                     => _x( $name, 'post type general name', 'bonifatius' ),
            'singular_name'            => _x( $S, 'post type singular name', 'bonifatius' ),
            'add_new'                  => _x( 'Add New', $ctx, 'bonifatius' ),
            'add_new_item'             => __( "Add New $S", 'bonifatius' ),
            'edit_item'                => __( "Edit $S", 'bonifatius' ),
            'new_item'                 => __( "New $S", 'bonifatius' ),
            'view_item'                => __( "View $S", 'bonifatius' ),
            'view_items'               => __( "View $P", 'bonifatius' ),
            'search_items'             => __( "Search $P", 'bonifatius' ),
            'not_found'                => __( "No $p found.", 'bonifatius' ),
            'not_found_in_trash'       => __( "No $p found in Trash.", 'bonifatius' ),
            'parent_item_colon'        => __( "Parent $S:", 'bonifatius' ),
            'all_items'                => __( "All $P", 'bonifatius' ),
            'archives'                 => __( "$S Archives", 'bonifatius' ),
            'attributes'               => __( "$S Attributes", 'bonifatius' ),
            'insert_into_item'         => __( "Insert into $s", 'bonifatius' ),
            'uploaded_to_this_item'    => __( "Uploaded to this $s", 'bonifatius' ),
            'filter_items_list'        => __( "Filter $p list", 'bonifatius' ),
            'filter_by_date'           => __( 'Filter by date', 'bonifatius' ),
            'items_list_navigation'    => __( "$P list navigation", 'bonifatius' ),
            'items_list'               => __( "$P list", 'bonifatius' ),
            'item_published'           => __( "$S published.", 'bonifatius' ),
            'item_published_privately' => __( "$S published privately.", 'bonifatius' ),
            'item_reverted_to_draft'   => __( "$S reverted to draft.", 'bonifatius' ),
            'item_scheduled'           => __( "$S scheduled.", 'bonifatius' ),
            'item_updated'             => __( "$S updated.", 'bonifatius' ),
            'item_link'                => _x( "$S Link", 'navigation link block title', 'bonifatius' ),
            'item_link_description'    => _x( "A link to a $s.", 'navigation link block description', 'bonifatius' ),
        );
    }
}

if ( ! function_exists( 'sb_hl_register_types' ) ) {
    function sb_hl_register_types() {
        $common = array(
            'hierarchical' => false, 'public' => true, 'show_ui' => true, 'show_in_menu' => true,
            'show_in_admin_bar' => true, 'show_in_nav_menus' => true, 'can_export' => true,
            'has_archive' => true, 'exclude_from_search' => false, 'publicly_queryable' => true,
            'capability_type' => 'post', 'show_in_rest' => true,
        );
        $rw = function ( $slug ) {
            return array( 'slug' => $slug, 'with_front' => true, 'pages' => true, 'feeds' => true );
        };

        // Termine
        $l = sb_hl_labels( 'Events', 'Event', 'Events', 'event', 'events', 'event' );
        register_post_type( 'event', array_merge( $common, array(
            'label' => __( 'Event', 'bonifatius' ), 'labels' => $l, 'supports' => array( 'title', 'revisions' ),
            'menu_position' => 20, 'menu_icon' => 'dashicons-calendar-alt', 'rewrite' => $rw( 'termine' ),
        ) ) );

        // News ("Pin") -- Beschriftung wie bisher, inkl. "Newss"
        $l = sb_hl_labels( 'News', 'News', 'Newss', 'News', 'Newss', 'pin' );
        register_post_type( 'pin', array_merge( $common, array(
            'label' => __( 'Pin', 'bonifatius' ), 'labels' => $l, 'supports' => array( 'title', 'revisions' ),
            'menu_position' => 9, 'menu_icon' => 'dashicons-admin-post', 'rewrite' => $rw( 'pins' ),
        ) ) );

        // Podcasts
        $l = sb_hl_labels( 'Podcasts', 'Podcast', 'Podcasts', 'podcast', 'podcasts', 'podcast' );
        register_post_type( 'podcast', array_merge( $common, array(
            'label' => __( 'Podcast', 'bonifatius' ), 'labels' => $l, 'supports' => array( 'title', 'revisions', 'thumbnail' ),
            'menu_position' => 18, 'menu_icon' => 'dashicons-format-audio', 'rewrite' => $rw( 'podcasts' ),
        ) ) );

        // Termin-Kategorien
        register_taxonomy( 'event-category', array( 'event' ), array(
            'labels' => array(
                'name' => _x( 'Categories', 'taxonomy general name', 'bonifatius' ),
                'singular_name' => _x( 'Category', 'taxonomy singular name', 'bonifatius' ),
                'search_items' => __( 'Search Categories', 'bonifatius' ),
                'all_items' => __( 'All Categories', 'bonifatius' ),
                'parent_item' => __( 'Parent Category', 'bonifatius' ),
                'parent_item_colon' => __( 'Parent Category:', 'bonifatius' ),
                'edit_item' => __( 'Edit Category', 'bonifatius' ),
                'view_item' => __( 'View Category', 'bonifatius' ),
                'update_item' => __( 'Update Category', 'bonifatius' ),
                'add_new_item' => __( 'Add New Category', 'bonifatius' ),
                'new_item_name' => __( 'New Category Name', 'bonifatius' ),
                'not_found' => __( 'No categories found.', 'bonifatius' ),
                'no_terms' => __( 'No categories', 'bonifatius' ),
                'filter_by_item' => __( 'Filter by category', 'bonifatius' ),
                'items_list_navigation' => __( 'Categories list navigation', 'bonifatius' ),
                'items_list' => __( 'Categories list', 'bonifatius' ),
                'most_used' => _x( 'Most Used', 'categories', 'bonifatius' ),
                'back_to_items' => __( '&larr; Go to Categories', 'bonifatius' ),
                'item_link' => _x( 'Category Link', 'navigation link block title', 'bonifatius' ),
                'item_link_description' => _x( 'A link to a category.', 'navigation link block description', 'bonifatius' ),
            ),
            'hierarchical' => true, 'public' => true, 'show_ui' => true, 'show_admin_column' => true,
            'show_in_nav_menus' => true, 'show_tagcloud' => false, 'show_in_rest' => true,
            'rewrite' => array( 'slug' => 'termin-kategorie', 'with_front' => true, 'hierarchical' => false ),
        ) );
    }
}
add_action( 'init', 'sb_hl_register_types', 0 );

/* ---------------------------------------------------------------------------
 * 2. ACF-Optionsseite
 * ------------------------------------------------------------------------- */
add_action( 'acf/init', function () {
    if ( function_exists( 'acf_add_options_page' ) ) {
        acf_add_options_page( array( 'page_title' => 'Optionen' ) );
    }
} );

/* ---------------------------------------------------------------------------
 * 3. REST-Felder
 * ------------------------------------------------------------------------- */
// 3a. event_meta (lesend) -- unveraendert uebernommen
add_filter( 'rest_prepare_event', function ( $response, $post, $request ) {
    $fields = array( 'start_date', 'end_date', 'times', 'location', 'church', 'subtitle', 'image' );
    $meta   = array();
    foreach ( $fields as $f ) {
        $meta[ $f ] = get_post_meta( $post->ID, $f, true );
    }
    $response->data['event_meta'] = $meta;
    return $response;
}, 10, 3 );

// 3b. event_input (schreibend, NEU) -- Doku im Kopf von termine-rest-schreiben.php
if ( ! function_exists( 'sb_event_datum' ) ) {
    function sb_event_datum( $v ) {
        $v = preg_replace( '/\D/', '', (string) $v );
        if ( $v === '' ) return '';
        if ( strlen( $v ) !== 8 || ! checkdate( (int) substr( $v, 4, 2 ), (int) substr( $v, 6, 2 ), (int) substr( $v, 0, 4 ) ) ) {
            return new WP_Error( 'sb_event_date', 'Datum muss JJJJMMTT sein (z. B. 20261104).', array( 'status' => 400 ) );
        }
        return $v;
    }
}
if ( ! function_exists( 'sb_event_kirchort' ) ) {
    function sb_event_kirchort( $v ) {
        $erlaubt = array( 'bonifatius', 'aposteln', 'wendel', 'herz_jesu' );
        if ( $v === '' || in_array( $v, $erlaubt, true ) ) return $v;
        return new WP_Error( 'sb_event_church', 'church muss bonifatius, aposteln, wendel oder herz_jesu sein.', array( 'status' => 400 ) );
    }
}
add_action( 'rest_api_init', function () {
    register_rest_field( 'event', 'event_input', array(
        'get_callback'    => null,
        'update_callback' => function ( $value, $post ) {
            if ( ! is_array( $value ) || ! function_exists( 'update_field' ) ) {
                return new WP_Error( 'sb_event_input', 'event_input muss ein Objekt sein (ACF noetig).', array( 'status' => 400 ) );
            }
            if ( ! current_user_can( 'edit_post', $post->ID ) ) {
                return new WP_Error( 'sb_event_forbidden', 'Keine Berechtigung.', array( 'status' => 403 ) );
            }
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
            // erst alles pruefen, dann schreiben (sonst bleibt bei Fehler ein halber Termin)
            $clean = array();
            foreach ( $value as $name => $wert ) {
                if ( ! isset( $felder[ $name ] ) ) {
                    return new WP_Error( 'sb_event_field', "Unbekanntes Feld: $name", array( 'status' => 400 ) );
                }
                $wert = call_user_func( $felder[ $name ][1], $wert );
                if ( $wert instanceof WP_Error ) return $wert;
                $clean[ $felder[ $name ][0] ] = $wert;
            }
            foreach ( $clean as $key => $wert ) {
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

// 3c. Untertitel der Beitraege
add_action( 'rest_api_init', function () {
    register_rest_field( 'post', 'subtitle', array(
        'get_callback' => function ( $post ) {
            return get_post_meta( $post['id'], 'subtitle', true );
        },
    ) );
} );

// 3d. pin_data (News) -- unveraendert uebernommen
if ( ! function_exists( 'sb_hl_pin_bild_url' ) ) {
    function sb_hl_pin_bild_url( $img, $sizes = array( 'medium_large', 'large', 'medium' ) ) {
        if ( ! $img || empty( $img['url'] ) ) return '';
        if ( ! empty( $img['sizes'] ) ) {
            foreach ( $sizes as $s ) {
                if ( ! empty( $img['sizes'][ $s ] ) ) return $img['sizes'][ $s ];
            }
        }
        return $img['url'];
    }
}
add_action( 'rest_api_init', function () {
    register_rest_field( 'pin', 'pin_data', array(
        'get_callback' => function ( $post_arr ) {
            $id = $post_arr['id'];
            $image   = get_field( 'image', $id );
            $gallery = get_field( 'gallery', $id );
            $gallery_out = array();
            if ( is_array( $gallery ) ) {
                foreach ( $gallery as $g ) {
                    $gallery_out[] = array(
                        'u' => sb_hl_pin_bild_url( $g, array( 'large', 'medium_large' ) ),
                        'a' => $g['alt'] ?? '',
                    );
                }
            }
            $desc = get_field( 'description', $id );
            $desc_text = $desc ? trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( $desc ) ) ) : '';
            return array(
                'typ'         => get_field( 'typ', $id ) ?: 'image',
                'subtitle'    => get_field( 'subtitle', $id ),
                'description' => $desc_text,
                'image'       => sb_hl_pin_bild_url( $image ),
                'gallery'     => $gallery_out,
                'video'       => get_field( 'video', $id ),
            );
        },
    ) );
} );

/* ---------------------------------------------------------------------------
 * 4. Netlify-Rebuild
 *    Build-Hook-URL ist GEHEIM und steht bewusst NICHT in dieser Datei (liegt im oeffentlichen Repo).
 *    Beim Einspielen entweder die Zeile in der functions.php stehen lassen (define(...) dort gilt weiter)
 *    oder in wp-config.php:  define( 'SB_NETLIFY_BUILD_HOOK', 'https://api.netlify.com/build_hooks/...' );
 *    Ist die Konstante nicht gesetzt, tut der Rebuild nichts (kein Fehler).
 * ------------------------------------------------------------------------- */
if ( ! function_exists( 'sb_hl_build_ausloesen' ) ) {
    function sb_hl_build_ausloesen( $post_id ) {
        if ( ! defined( 'SB_NETLIFY_BUILD_HOOK' ) || ! SB_NETLIFY_BUILD_HOOK ) return;
        if ( ! in_array( get_post_type( $post_id ), array( 'post', 'page', 'pin' ), true ) ) return;
        if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) return;
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( get_transient( 'sb_netlify_build_lock' ) ) return;   // max. 1 Build / 90 Sek.
        set_transient( 'sb_netlify_build_lock', 1, 90 );
        wp_remote_post( SB_NETLIFY_BUILD_HOOK, array(
            'blocking' => false, 'timeout' => 5,
            'headers'  => array( 'Content-Type' => 'application/json' ), 'body' => '{}',
        ) );
    }
}
add_action( 'transition_post_status', function ( $new, $old, $post ) {
    if ( 'publish' === $new || 'publish' === $old ) sb_hl_build_ausloesen( $post->ID );
}, 10, 3 );
add_action( 'trashed_post', 'sb_hl_build_ausloesen' );
add_action( 'delete_post',  'sb_hl_build_ausloesen' );

if ( ! function_exists( 'sb_hl_in_rml_ordner' ) ) {
    function sb_hl_in_rml_ordner( $post_id, $folder_id ) {
        $request = new WP_REST_Request( 'GET', '/wp/v2/media' );
        $request->set_query_params( array( 'include' => array( $post_id ), 'rml_folder' => $folder_id, '_fields' => 'id' ) );
        $response = rest_do_request( $request );
        $data = $response->get_data();
        return ! empty( $data );
    }
}
if ( ! function_exists( 'sb_hl_build_bei_download' ) ) {
    function sb_hl_build_bei_download( $post_id ) {
        $title = strtolower( get_the_title( $post_id ) );
        $ist_pfarrbrief_highlights = strpos( $title, 'pfarrbrief' ) !== false || strpos( $title, 'highlights' ) !== false;
        $ist_monatsbrief_aposteln  = sb_hl_in_rml_ordner( $post_id, 205 ); // Astro-Upload/Monatsbrief Aposteln
        $ist_tauftermine           = strpos( $title, 'tauftermin' ) !== false || sb_hl_in_rml_ordner( $post_id, 206 ); // Astro-Upload/Tauftermine
        if ( ! $ist_pfarrbrief_highlights && ! $ist_monatsbrief_aposteln && ! $ist_tauftermine ) return;
        if ( ! defined( 'SB_NETLIFY_BUILD_HOOK' ) || ! SB_NETLIFY_BUILD_HOOK ) return;
        if ( get_transient( 'sb_netlify_build_lock' ) ) return;
        set_transient( 'sb_netlify_build_lock', 1, 90 );
        wp_remote_post( SB_NETLIFY_BUILD_HOOK, array(
            'blocking' => false, 'timeout' => 5,
            'headers'  => array( 'Content-Type' => 'application/json' ), 'body' => '{}',
        ) );
    }
}
add_action( 'add_attachment', 'sb_hl_build_bei_download' );
add_action( 'edit_attachment', 'sb_hl_build_bei_download' );

/* ---------------------------------------------------------------------------
 * 5. Medien freigeben, wenn ihr Eltern-Eintrag verschwindet (Hintergrund: Handbuch 05, 2026-10-11)
 * ------------------------------------------------------------------------- */
if ( ! function_exists( 'sb_hl_medien_freigeben' ) ) {
    function sb_hl_medien_freigeben( $post_id ) {
        if ( ! in_array( get_post_type( $post_id ), array( 'event', 'post', 'page', 'pin' ), true ) ) return;
        $ids = get_posts( array(
            'post_type' => 'attachment', 'post_parent' => $post_id, 'post_status' => 'any',
            'fields' => 'ids', 'posts_per_page' => -1,
        ) );
        global $wpdb;
        foreach ( $ids as $att_id ) {
            $wpdb->update( $wpdb->posts, array( 'post_parent' => 0 ), array( 'ID' => $att_id ) );
            clean_post_cache( $att_id );
        }
    }
}
add_action( 'wp_trash_post', 'sb_hl_medien_freigeben' );
add_action( 'before_delete_post', 'sb_hl_medien_freigeben' );
add_action( 'transition_post_status', function ( $new_status, $old_status, $post ) {
    if ( 'publish' === $old_status && 'publish' !== $new_status ) sb_hl_medien_freigeben( $post->ID );
}, 10, 3 );

/* ---------------------------------------------------------------------------
 * 6. Anwendungspasswoerter + Termin-Spalten im Admin
 * ------------------------------------------------------------------------- */
add_filter( 'wp_is_application_passwords_available', '__return_true' );

add_filter( 'manage_event_posts_columns', function ( $cols ) {
    $cols['event_start_date'] = 'Datum';
    return $cols;
} );
add_action( 'manage_event_posts_custom_column', function ( $col, $post_id ) {
    if ( $col !== 'event_start_date' ) return;
    $em  = get_post_meta( $post_id, 'event_meta', true );
    $raw = is_array( $em ) ? ( $em['start_date'] ?? '' ) : ( get_post_meta( $post_id, 'start_date', true ) ?: '' );
    if ( ! $raw ) { echo '—'; return; }
    $fmt = strlen( $raw ) === 8
        ? DateTime::createFromFormat( 'Ymd', $raw )
        : DateTime::createFromFormat( 'd.m.Y', $raw );
    echo $fmt ? esc_html( date_i18n( 'j. F Y', $fmt->getTimestamp() ) ) : esc_html( $raw );
}, 10, 2 );
add_filter( 'manage_edit-event_sortable_columns', function ( $cols ) {
    $cols['event_start_date'] = 'event_start_date';
    return $cols;
} );
add_action( 'pre_get_posts', function ( $query ) {
    if ( ! is_admin() || ! $query->is_main_query() ) return;
    if ( $query->get( 'post_type' ) !== 'event' ) return;
    if ( $query->get( 'orderby' ) === 'event_start_date' ) {
        $query->set( 'meta_key', 'start_date' );
        $query->set( 'orderby', 'meta_value' );
    }
} );

/* ---------------------------------------------------------------------------
 * 7. Benutzerliste der REST-API nur fuer Angemeldete (Befund 2026-10-12)
 * ------------------------------------------------------------------------- */
add_filter( 'rest_endpoints', function ( $endpoints ) {
    if ( ! is_user_logged_in() ) {
        unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
    }
    return $endpoints;
} );
