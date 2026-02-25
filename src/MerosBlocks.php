<?php

namespace MM\Meros\Blocks;

use MM\Meros\Contracts\Extension;

class MerosBlocks extends Extension {
    protected string $authorName = "Meros";
    protected string $authorUrl = "https://merosblocks.com";
    protected string $authorSupportUrl = "https://merosblocks.com/support";
    protected string $description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

    protected function boot(): void {
        // Register filters    
        $featureFilters = MerosBlocksFilters::init($this->hookPrefix);
        $featureFilters->register();

        // Load assets and blocks
        $this->loadAssets();
        $this->loadBlocks();
    }
}