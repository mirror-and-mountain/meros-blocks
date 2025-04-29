<?php

namespace MM\Meros\App\Facades;

use Illuminate\Support\Facades\Facade;
use MM\Meros\App\Services\Meros as BaseClass;

class Meros extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return BaseClass::class;
    }
}
