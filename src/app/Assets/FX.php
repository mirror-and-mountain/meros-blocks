<?php

namespace MM\Meros\Blocks\App\Assets;

use MM\Meros\Contracts\Features\Assets\AssetGroup;

final class FX extends AssetGroup {
    protected function configure(): void {
        $editorAssets = [
            'meros-blocks-fx-editor' => 'fx/editor/index.js',
            'meros-blocks-fx-editor-style' => 'fx/editor/style-index.css'
        ];

        $siteAssets = [
            'meros-blocks-site-fx' => 'fx/site/index.js',
            'meros-blocks-fx-site-style' => 'fx/site/style-index.css'
        ];

        $this->add($editorAssets, ['editor']);
        $this->add($siteAssets, ['site']);
        $this->name('meros_blocks_fx_assets');
        $this->description('Assets registered by Meros Blocks for block fx capabilities.');
    }
}