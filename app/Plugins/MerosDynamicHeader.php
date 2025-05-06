<?php

namespace App\Plugins;

use MM\Meros\Contracts\Plugin;

class MerosDynamicHeader extends Plugin
{
    protected function configure(): void
    {
        $this->usePluginConfig = true;
    }
}