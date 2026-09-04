<?php

namespace MM\Meros\Blocks;

use MM\Meros\App\Package;
use MM\Meros\Blocks\App\Assets\Orchestrator as AssetsOrchestrator;

final class MerosBlocks extends Package {
    protected function init(): void {
        $this->setAuthor('Meros');
        $this->setAuthorUrl('https://merosblocks.com');
        $this->setSupportUrl('https://merosblocks.com/support');
        $this->setDescription('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua');
    }

    public function configure(): void {
        $this->initialise(AssetsOrchestrator::class);
        $this->blocks()->make(function ($block) {
            $block->path($this->getPath('resources/blocks/build/mega-menu-column'));
        });

        $this->applyNavFilters();
        $this->applyFxFilters();
    }

    private function applyNavFilters(): void {
        add_filter('render_block', [Filters::class, 'renderAdvancedNav'], 10, 2);
        add_filter('render_block', [Filters::class, 'renderAdvancedNavSubmenu'], 10, 2);
        add_filter('render_block', [Filters::class, 'renderAdvancedNavLink'], 10, 2);

        // Block args filters
        add_filter('register_block_type_args', [Filters::class, 'registerAdditionalArgs'], 10, 2);
    }

    private function applyFxFilters(): void {
        add_filter('render_block', [Filters::class, 'renderBlockFxBlocks'], 10, 2);
        add_action('enqueue_block_editor_assets', [Actions::class, 'enqueueHtmlEditor']);
    }
}