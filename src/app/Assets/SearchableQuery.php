<?php

namespace MM\Meros\Blocks\App\Assets;

use MM\Meros\Contracts\Features\Assets\AssetGroup;

final class SearchableQuery extends AssetGroup {
    protected function configure(): void {
        $this->add([
            'meros-blocks-searchable-query-style' => 'searchable-query/style-index.css',
        ], ['site']);
        $this->add([
            'meros-blocks-searchable-query-script' => 'searchable-query/index.js',
        ], ['site']);
        $this->add([
            'meros-blocks-searchable-query-editor' => 'searchable-query/editor/index.js',
        ], ['editor']);
        $this->name('meros_blocks_searchable_query_assets');
        $this->description('Live title search within native Query Loop filters.');
    }
}
