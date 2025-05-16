<?php

return [
    'theme_class'          => 'App\\Theme',
    'features_namespace'   => 'App\\Features',
    'extensions_namespace' => 'App\\Extensions',
    'plugins_namespace'    => 'App\\Plugins',

    // Installed features
    'features' => [
    ],

    // Installed extensions
    'extensions' => [
        'App\\Extensions\\MerosDynamicPage' => 'MerosDynamicPage.php',
    ],

    // Installed plugins
    'plugins' => [
        'App\\Plugins\\MerosCarousel' => [
            'config' => 'MerosCarousel.php',
            'src' => 'plugins/meros-carousel/meros-carousel.php',
        ],
        'App\\Plugins\\MerosDynamicHeader' => [
            'config' => 'MerosDynamicHeader.php',
            'src' => 'plugins/meros-dynamic-header/meros-dynamic-header.php',
        ],
    ]
];
