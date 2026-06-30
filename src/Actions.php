<?php

namespace MM\Meros\Blocks;

class Actions {
    public static function enqueueHtmlEditor(): void {
        wp_enqueue_code_editor( [
            'type' => 'text/html',
        ]);
    }
}