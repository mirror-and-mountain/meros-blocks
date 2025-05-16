<?php

namespace App\Plugins;

use MM\Meros\Contracts\Plugin;

class MerosCarousel extends Plugin
{
    protected function configure(): void
    {
        $this->author = [
            'name'    => 'MIRROR AND MOUNTAIN',
            'link'    => 'https://mirrorandmountain.com',
            'support' => 'https://mirrorandmountain.com/support'
        ];
        
        $this->category = 'blocks';
        $this->enabled  = true;
    }
}