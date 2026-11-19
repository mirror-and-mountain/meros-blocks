<?php

namespace MM\Meros\Blocks\Support;

use MM\Meros\Contracts\Features\Components\DynamicBlock;

/**
 * Provides styling attributes and wrapper styles for Mega Menu blocks.
 */
final class MegaMenuStyles {
    public static function register(DynamicBlock $block): void {
        foreach (self::definitions() as $key => $definition) {
            $block->attribute($key, $definition);
        }
        foreach (self::legacyKeys() as $key) {
            $block->attribute($key, ['type' => 'string', 'default' => '']);
        }
    }

    private static function definitions(): array {
        $roles = [
            'color' => [
                'panel_background' => __('Panel background', 'meros-blocks'),
                'group' => __('Group label', 'meros-blocks'),
                'group_link' => __('Group link', 'meros-blocks'),
                'group_link_hover' => __('Group link hover', 'meros-blocks'),
                'group_link_current' => __('Group link current', 'meros-blocks'),
                'column_heading' => __('Column heading', 'meros-blocks'),
                'panel_link' => __('Panel link', 'meros-blocks'),
                'panel_link_hover' => __('Panel link hover', 'meros-blocks'),
                'panel_link_current' => __('Panel link current', 'meros-blocks'),
            ],
            'font_size' => [
                'group' => __('Group size', 'meros-blocks'),
                'column_heading' => __('Column heading size', 'meros-blocks'),
                'panel_link' => __('Panel link size', 'meros-blocks'),
            ],
            'decoration' => [
                'group' => __('Group decoration', 'meros-blocks'),
                'column_heading' => __('Column heading decoration', 'meros-blocks'),
                'panel_link' => __('Panel link decoration', 'meros-blocks'),
                'group_link_current' => __('Group link current decoration', 'meros-blocks'),
                'panel_link_current' => __('Panel link current decoration', 'meros-blocks'),
            ],
        ];
        $fallbacks = [
            'menu_color_group' => ['menu_color_group_label'],
            'menu_color_group_link' => ['menu_color_group_label'],
            'menu_color_group_link_current' => ['menu_color_current'],
            'menu_color_panel_link' => ['menu_color_link'],
            'menu_color_panel_link_hover' => ['menu_color_link_hover'],
            'menu_color_panel_link_current' => ['menu_color_current'],
            'menu_font_size_panel_link' => ['menu_font_size_link'],
            'menu_decoration_group' => ['menu_decoration_text', 'menu_decoration_link'],
            'menu_decoration_column_heading' => ['menu_decoration_text'],
            'menu_decoration_panel_link' => ['menu_decoration_link'],
            'menu_decoration_group_link_current' => ['menu_decoration_current'],
            'menu_decoration_panel_link_current' => ['menu_decoration_current'],
        ];
        $definitions = [];
        foreach ($roles as $kind => $labels) {
            foreach ($labels as $role => $label) {
                $key = "menu_{$kind}_{$role}";
                $definitions[$key] = [
                    'type' => 'string',
                    'default' => '',
                    'label' => $label,
                    'style_fallbacks' => $fallbacks[$key] ?? [],
                ];
            }
        }
        return $definitions;
    }

    private static function legacyKeys(): array {
        return [
            'menu_color_group_label', 'menu_color_panel_text', 'menu_color_link',
            'menu_color_link_hover', 'menu_color_current', 'menu_font_size_link',
            'menu_decoration_text', 'menu_decoration_link', 'menu_decoration_current',
        ];
    }

    /**
     * Generates the wrapper attributes for the Mega Menu block, including inline styles.
     *
     * @param string $class
     * @param array  $attributes
     *
     * @return string
     */
    public static function wrapper(string $class, array $attributes): string {
        $styles = [];
        $wrapper = ['class' => $class];

        $duration = match ($attributes['menu_animation_speed'] ?? null) {
            'fast'  => 150,
            'slow'  => 400,
            'off'   => 0,
            default => null,
        };
        if ($duration !== null) {
            $styles[] = "--meros-menu-animation-duration:{$duration}ms";
        }

        // Keep old saved styles readable until the inspector replaces them.
        $definitions = self::definitions();
        $definitions['menu_color_panel_text'] = ['style_fallbacks' => []];
        foreach ($definitions as $key => $definition) {
            $value = $attributes[$key] ?? '';
            foreach ($definition['style_fallbacks'] as $fallback) {
                if ($value !== '') break;
                $value = $attributes[$fallback] ?? '';
            }
            if (!is_string($value) || $value === '') continue;

            if (str_starts_with($key, 'menu_color_')) {
                if (!preg_match('/\A(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|[a-z]+|(?:rgba?|hsla?)\([0-9.,% +\/-]+\))\z/i', $value)) continue;
                $kind = 'color';
                $role = str_replace('_', '-', substr($key, strlen('menu_color_')));
                $styles[] = "--meros-menu-{$role}:{$value}";
            } elseif (str_starts_with($key, 'menu_font_size_')) {
                if (!preg_match('/\A[a-z0-9][a-z0-9-]*\z/i', $value)) continue;
                $kind = 'font-size';
                $role = str_replace('_', '-', substr($key, strlen('menu_font_size_')));
                $styles[] = "--meros-menu-{$role}-font-size:var(--wp--preset--font-size--{$value})";
            } else {
                if (!in_array($value, ['none', 'underline', 'line-through'], true)) continue;
                $kind = 'decoration';
                $role = str_replace('_', '-', substr($key, strlen('menu_decoration_')));
                $styles[] = "--meros-menu-{$role}-decoration:{$value}";
            }
            $wrapper["data-meros-menu-{$kind}-{$role}"] = 'true';
        }

        if ($styles !== []) {
            $wrapper['style'] = implode(';', $styles) . ';';
        }

        return get_block_wrapper_attributes($wrapper);
    }
}
