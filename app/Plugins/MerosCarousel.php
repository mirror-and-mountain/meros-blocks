<?php

namespace App\Plugins;

use MM\Meros\Contracts\Plugin;

class MerosCarousel extends Plugin
{
    protected function configure(): void
    {
        $this->usePluginConfig = true;
    }
}