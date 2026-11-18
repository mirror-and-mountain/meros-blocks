<?php

namespace MM\Meros\Blocks;

use MM\Meros\App\Package;

use MM\Meros\Blocks\App\Assets\Orchestrator as AssetsOrchestrator;
use MM\Meros\Blocks\App\Components\Orchestrator as ComponentsOrchestrator;

final class MerosBlocks extends Package {
    protected function init(): void {
        $this->setAuthor('Meros');
        $this->setAuthorUrl('https://merosblocks.com');
        $this->setSupportUrl('https://merosblocks.com/support');
        $this->setDescription('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua');
    }

    public function configure(): void {
        $this->initialise(AssetsOrchestrator::class);
        $this->initialise(ComponentsOrchestrator::class);
        $this->applyFxFilters();
    }

    private function applyFxFilters(): void {
        add_filter('register_block_type_args', [Filters::class, 'registerTemplatePartFxAttributes'], 10, 2);
        add_filter('render_block_core/template-part', [Filters::class, 'renderTemplatePartFx'], 10, 2);
        add_filter('render_block', [Filters::class, 'renderBlockFxBlocks'], 10, 2);
        add_action('enqueue_block_editor_assets', [Actions::class, 'enqueueHtmlEditor']);
    }
}