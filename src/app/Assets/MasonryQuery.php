<?php

namespace MM\Meros\Blocks\App\Assets;

use MM\Meros\Contracts\Features\Assets\AssetGroup;

final class MasonryQuery extends AssetGroup {
    protected function configure(): void {
        $this->add([
            'meros-blocks-masonry-query-style' => 'masonry-query/style-index.css',
        ], ['site', 'editor']);
        $this->add([
            'meros-blocks-masonry-query-script' => 'masonry-query/index.js',
        ], ['site']);
        $this->add([
            'meros-blocks-masonry-query-editor' => 'masonry-query/editor/index.js',
        ], ['editor']);
        $this->name('meros_blocks_masonry_query_assets');
        $this->description('Responsive masonry layout for native Query Loop post grids.');
    }
}
