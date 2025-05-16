<?php

namespace App\Extensions;

use MM\Meros\DynamicPage\Feature as Feature;

class MerosDynamicPage extends Feature
{
    protected function override(): void
    {
        $this->author = [
            'name'    => 'MIRROR AND MOUNTAIN',
            'link'    => 'https://mirrorandmountain.com',
            'support' => 'https://mirrorandmountain.com/support'
        ];

        $this->enabled = true;
    }
}