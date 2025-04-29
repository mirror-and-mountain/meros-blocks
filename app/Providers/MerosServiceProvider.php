<?php

namespace MM\Meros\App\Providers;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;


use MM\Meros\App\Theme;
use MM\Meros\Contracts\Plugin;
use MM\Meros\Helpers\ClassInfo;
use MM\Meros\Helpers\PluginInfo;
// use MM\Meros\App\Features\DynamicPage\MerosDynamicPage as DynamicPage;
// use MM\Meros\App\Features\DynamicStyles\MerosDynamicStyles as DynamicStyles;
// use MM\Meros\App\Features\BlockAnimations\MerosBlockAnimations as BlockAnimations;

class MerosServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(
            Theme::class, fn($app) => new Theme($app)
        );

        define('MEROS', true);
    }

    public function boot(): void
    {
        $this->loadPlugins();
        // $features = apply_filters('meros_default_features', $this->defaultFeatures);
        $theme = $this->app->make(Theme::class);
        // $theme->addFeatures($features);
        do_action('meros_add_features', $theme);
        $theme->bootstrap();
    }

    private function loadPlugins(): void
    {
        $featuresDir = app_path('Features');
        $pluginsDir  = base_path('plugins');
        $pluginPaths = File::glob( $pluginsDir . '/*', GLOB_ONLYDIR );

        foreach ( $pluginPaths as $pluginPath ) {
            $pluginInfo = PluginInfo::get( $pluginPath );

            if (
                !$pluginInfo ||
                !isset($pluginInfo['Plugin Name']) ||
                !isset($pluginInfo['Author']) ||
                !isset($pluginInfo['File'])
            ) {
                continue;
            }

            $className = Str::studly( basename($pluginPath) );
            $classPath = "{$featuresDir}/{$className}.php";
            $class     = ClassInfo::getFromPath( $classPath );

            if ( $class->extends( Plugin::class ) ) {

                add_action('meros_add_features', function ( $theme ) use ( $pluginInfo, $class ) {
                    $name     = $pluginInfo['Plugin Name'];
                    $category = $pluginInfo['MEROS Category'] ?? 'miscellaneous';
                    $author   = $pluginInfo['Author'];
                    $path     = base_path( $pluginInfo['File'] );

                    $args     = [
                        'path'       => $path,
                        'uri'        => Str::replace( get_theme_file_path(), get_theme_file_uri(), $path ),
                        'pluginInfo' => $pluginInfo
                    ];
        
                    $theme->addFeature( $name, $category, $class->name, $author, $args );

                });
            }
        }
    }
}
