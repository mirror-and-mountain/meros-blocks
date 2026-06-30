<?php

namespace MM\Meros\Blocks;

use MM\Meros\App\Package;

class MerosBlocks extends Package {
    public string $name             = "Meros Blocks";
    public string $author           = "Meros";
    public string $handle           = "meros_blocks";
    public string $authorUri        = "https://merosblocks.com";
    public string $authorSupportUri = "https://merosblocks.com/support";
    public string $description      = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua';

    protected function configure(): void {
        $this->blocks()->discover();
        $this->assets()->discover();
        
        // Nav filters
        add_filter('render_block', [Filters::class, 'renderAdvancedNav'], 10, 2);
        add_filter('render_block', [Filters::class, 'renderAdvancedNavSubmenu'], 10, 2);
        add_filter('render_block', [Filters::class, 'renderAdvancedNavLink'], 10, 2);

        // Block args filters
        add_filter('register_block_type_args', [Filters::class, 'registerAdditionalArgs'], 10, 2);

        // Block FX filters
        add_filter('render_block', [Filters::class, 'renderBlockFxBlocks'], 10, 2);

        // Enqueue HTML editor
        add_action('enqueue_block_editor_assets', [Actions::class, 'enqueueHtmlEditor']);
    }
}