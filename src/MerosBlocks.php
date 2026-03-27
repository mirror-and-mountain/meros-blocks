<?php

namespace MM\Meros\Blocks;

use MM\Meros\App\Package;

class MerosBlocks extends Package {
    public string $author           = "Meros";
    public string $authorUri        = "https://merosblocks.com";
    public string $authorSupportUri = "https://merosblocks.com/support";
    public string $description      = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

    protected bool $discoverBlocks = true;
    protected bool $discoverAssets = true;

    protected function configure(): void {
        // add_filter($this->prefix . '_blocks_mega_menu_column_is_switchable', '__return_false');
        // add_filter($this->prefix . '_blocks_swiper_slide_is_switchable', '__return_false');
        
        // // Nav filters
        add_filter('render_block', [Filters::class, 'renderAdvancedNav'], 10, 2);
        add_filter('render_block', [Filters::class, 'renderAdvancedNavSubmenu'], 10, 2);
        add_filter('render_block', [Filters::class, 'renderAdvancedNavLink'], 10, 2);

        // // Block args filters
        add_filter('register_block_type_args', [Filters::class, 'registerAdditionalArgs'], 10, 2);

        // // Block FX filters
        add_filter('render_block', [Filters::class, 'renderBlockFxBlocks'], 10, 2);

        // // Form Filters
        add_filter('allowed_block_types_all', [Filters::class, 'restrictFormBlocks'], 10, 2);
    }
}