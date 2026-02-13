<?php 

add_filter('render_block', function ($block_content, $block) {
    $hasScrollFx = isset($block['attrs']['merosScrollFx']['enabled']) &&
        $block['attrs']['merosScrollFx']['enabled'] === true;

    if ($hasScrollFx) {
        return '<div class="meros-animation-wrapper">' . $block_content . '</div>';
    }

    return $block_content;
}, 10, 2);