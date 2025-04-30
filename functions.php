<?php
// Autoloader.
require_once( __DIR__ . '/vendor/autoload.php' );

// Theme Constants.
define('MM_THEME_ROOT', get_stylesheet_directory() . '/');
define('MM_THEME_URL', get_stylesheet_directory_uri() . '/');
// Enqueue Theme Stylesheet.
add_action('wp_enqueue_scripts', function () {
    // Enqueue your main stylesheet.
    wp_enqueue_style(
        'mm-theme-styles', 
        MM_THEME_URL . 'style.css'
    );
});


