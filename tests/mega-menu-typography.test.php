<?php

namespace MM\Meros\Contracts\Features\Components {
    final class DynamicBlock {
        public array $attributes = [];
        public array $supports = [];

        public function attribute(string $key, array $definition): void {
            $this->attributes[$key] = $definition;
        }

        public function supports(array $supports): void {
            $this->supports = $supports;
        }
    }
}

namespace {
    use MM\Meros\Blocks\Support\MegaMenuStyles;
    use MM\Meros\Contracts\Features\Components\DynamicBlock;

    function __(string $value, string $domain): string {
        return $value;
    }

    function get_block_wrapper_attributes(array $attributes): string {
        return json_encode($attributes, JSON_THROW_ON_ERROR);
    }

    require dirname(__DIR__) . '/src/support/MegaMenuStyles.php';

    function wrapperStyles(array $attributes, string $part = 'menu'): array {
        return json_decode(MegaMenuStyles::wrapper('menu', $attributes, $part), true, flags: JSON_THROW_ON_ERROR);
    }

    function expect(bool $condition, string $message): void {
        if (!$condition) {
            throw new \RuntimeException($message);
        }
    }

    $block = new DynamicBlock();
    MegaMenuStyles::register($block);
    expect(wrapperStyles([]) === ['class' => 'menu'], 'Registering typography must not introduce default inline styles.');

    $column = new DynamicBlock();
    MegaMenuStyles::register($column, 'column');
    foreach (['menu', 'column'] as $part) {
        expect(wrapperStyles([
            'menu_font_size_group' => 'large',
            'menu_font_size_column_heading' => 'custom:22px',
            'menu_font_size_panel_link' => 'small',
            'menu_font_size_link' => 'medium',
            'menu_decoration_column_heading' => 'underline',
        ], $part) === ['class' => 'menu'], 'Obsolete font/heading overrides must not mask native typography.');
    }

    $columnStyles = wrapperStyles([
        'menu_decoration_panel_link' => 'none',
        'menu_decoration_panel_link_current' => 'underline',
        'menu_decoration_group' => 'line-through',
        'menu_color_panel_link' => 'red',
        'menu_color_panel_text' => 'blue',
    ], 'column');
    expect(
        ($columnStyles['style'] ?? '') === '--meros-menu-panel-link-decoration:none;--meros-menu-panel-link-current-decoration:underline;',
        'Columns must apply only their link decorations, not group styling or colours.'
    );
    expect(
        (wrapperStyles(['menu_decoration_link' => 'underline'], 'column')['style'] ?? '') === '--meros-menu-panel-link-decoration:underline;',
        'Columns must preserve saved link decorations.'
    );
    expect(
        wrapperStyles(['menu_decoration_panel_link' => 'underline;color:red'], 'column') === ['class' => 'menu'],
        'Invalid decorations must not reach inline styles.'
    );

    echo "Mega Menu typography tests passed.\n";
}
