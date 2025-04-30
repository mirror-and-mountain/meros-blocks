<?php

$theme_path   = get_theme_file_path();
$theme_uri    = get_theme_file_uri();
$autoloader   = wp_normalize_path( $theme_path . '/vendor/autoload.php' );
$bootstrapper = wp_normalize_path( $theme_path . '/includes/bootstrap.php' );

require_once( $autoloader );
require_once( $bootstrapper );

// Enqueue Theme Stylesheet.
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'meros-theme-styles', 
        get_stylesheet_uri()
    );
});


