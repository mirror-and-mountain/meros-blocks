<?php

$theme_path = get_theme_file_path();
$autoloader = wp_normalize_path( $theme_path . '/vendor/autoload.php' );

require_once( $autoloader );

if ( class_exists( 'App\\Theme' ) ) {
    App\Theme::bootstrap();
};


