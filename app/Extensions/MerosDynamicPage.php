<?php

namespace App\Extensions;

use MM\Meros\DynamicPage\Feature;

class MerosDynamicPage extends Feature
{
    protected function override(): void
    {
        $this->enabled = true;
        add_filter( 'meros_' . $this->name . '_settings_section_title', function ( $_title ) {
            return 'Dynamic Page';
        });
    }
}