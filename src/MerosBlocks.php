<?php

namespace MM\Meros\Blocks;

use MM\Meros\App\Services\Theme\Package;

class MerosBlocks extends Package {
    protected string $authorName = "Meros";
    protected string $authorUrl = "https://merosblocks.com";
    protected string $authorSupportUrl = "https://merosblocks.com/support";
    protected string $description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

    protected function configure(): void {
        $this->addFilter($this->prefix . '_blocks_mega_menu_column_is_switchable', '__return_false');
        $this->addFilter($this->prefix . '_blocks_swiper_slide_is_switchable', '__return_false');
        
        // Nav filters
        $this->addFilter('render_block', [Filters::class, 'renderAdvancedNav'], 10, 2);
        $this->addFilter('render_block', [Filters::class, 'renderAdvancedNavSubmenu'], 10, 2);
        $this->addFilter('render_block', [Filters::class, 'renderAdvancedNavLink'], 10, 2);

        // Block args filters
        $this->addFilter('register_block_type_args', [Filters::class, 'registerAdditionalArgs'], 10, 2);

        // Block FX filters
        $this->addFilter('render_block', [Filters::class, 'renderBlockFxBlocks'], 10, 2);

        // Form Filters
        $this->addFilter('allowed_block_types_all', [Filters::class, 'restrictFormBlocks'], 10, 2);
    }

    protected function loadFeatures(): void {
        // Register Form Post Type
        Actions::createFormPostType();

        // Load assets and blocks
        $this->loadAssets();
        $this->loadBlocks();
    }
}