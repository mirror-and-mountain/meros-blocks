<?php

namespace MM\Meros\App\Features;

use MM\Meros\Contracts\Plugin;

class MerosCarousel extends Plugin
{
    protected function configure(): void
    {
        $this->usePluginConfig = true;
    }
}