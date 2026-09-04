<?php

namespace MM\Meros\Blocks\App\Assets;

use MM\Meros\Contracts\Features\Assets\AssetGroup;

final class Navigation extends AssetGroup {
    protected function configure(): void {
        $editorAssets = [
            'meros-blocks-navigation-editor' => 'navigation/editor/index.js',
            'meros-blocks-navigation-editor-style' => 'navigation/editor/style-index.css'
        ];

        $siteAssets = [
            'meros-blocks-navigation-site' => 'navigation/site/index.js',
            'meros-blocks-navigation-site-style' => 'navigation/site/style-index.css'
        ];

        $this->add($editorAssets, ['editor']);
        $this->add($siteAssets, ['site']);
        $this->name('meros_blocks_navigation_assets');
        $this->description('Assets registered by Meros Blocks for enhanced Navigation Block capabilities.');
    }
}