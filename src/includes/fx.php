<?php 

add_filter('render_block', function ($block_content, $block) {
    $hasScrollFx = isset($block['attrs']['merosScrollFx']['enabled']) &&
        $block['attrs']['merosScrollFx']['enabled'] === true;

    if ($hasScrollFx) {
        $swiperClass = $block['attrs']['merosScrollFx']['animateOnSlideChange'] ? 'meros-animate-on-slide-change' : '';
        return '<div class="meros-animation-wrapper ' . $swiperClass . '">' . $block_content . '</div>';
    }

    return $block_content;
}, 10, 2);