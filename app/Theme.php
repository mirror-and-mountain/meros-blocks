<?php 

namespace MM\Meros\App;

use MM\Meros\Contracts\Meros;

use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Blade;
use Illuminate\Contracts\Foundation\Application;

class Theme extends Meros
{
    const version = '1.0.0';

    protected string $assetsPath;
    protected array  $appStyles  = [];
    protected array  $appScripts = [];

    public function bootstrap(): void
    {
        $features = Arr::dot( $this->features );

        foreach ( $features as $feature ) {

            if ( is_callable( $feature ) ) {
                call_user_func( $feature );
            } 

            else {
                $feature->initialise();
            }

        }
    }
}