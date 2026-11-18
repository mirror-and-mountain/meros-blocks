<?php

namespace MM\Meros\Blocks\App\Assets;

use MM\Meros\Contracts\Features\Assets\AssetGroup;

final class MegaMenu extends AssetGroup {
    protected function configure(): void {
        $this->add([
            'meros-blocks-mega-menu-style' => 'mega-menu/style-index.css',
        ], ['site', 'editor']);
        $this->add([
            'meros-blocks-mega-menu-script' => 'mega-menu/index.js',
        ], ['site']);
        $this->add([
            'meros-blocks-mega-menu-editor' => 'mega-menu/editor/index.js',
        ], ['editor']);
        $this->name('meros_blocks_mega_menu_assets');
        $this->description('Styles and dropdown behavior for the dynamic mega menu.');
    }
}
