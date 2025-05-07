<?php 

namespace App;

use MM\Meros\Contracts\ThemeManager;

class Theme extends ThemeManager
{
    protected function configure(): void
    {
        $this->enable_smooth_scrolling = true;
        $this->use_unified_settings_pages = true;
    }
}