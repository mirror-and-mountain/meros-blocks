<?php

namespace MM\Meros\Blocks\Support;

use MM\Meros\Contracts\Features\Components\DynamicBlock;

/**
 * Provides styling attributes and wrapper styles for Mega Menu blocks.
 */
final class MegaMenuStyles {
    public static function register(DynamicBlock $block, string $part = 'menu'): void {
        $block->supports([
            'typography' => [
                'fontSize' => true,
                'lineHeight' => true,
                '__experimentalFontFamily' => true,
                '__experimentalFontStyle' => true,
                '__experimentalFontWeight' => true,
                '__experimentalLetterSpacing' => true,
                '__experimentalTextTransform' => true,
                '__experimentalDefaultControls' => [
                    'fontFamily' => true,
                    'fontSize' => true,
                    'fontAppearance' => true,
                ],
            ],
        ]);
        foreach (self::definitions($part) as $key => $definition) {
            $block->attribute($key, $definition);
        }
        foreach (self::legacyKeys($part) as $key) {
            $block->attribute($key, ['type' => 'string', 'default' => '']);
        }
    }

    private static function definitions(string $part): array {
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
            'decoration' => [
                'group' => __('Group decoration', 'meros-blocks'),
                'panel_link' => __('Panel link decoration', 'meros-blocks'),
                'group_link_current' => __('Group link current decoration', 'meros-blocks'),
                'panel_link_current' => __('Panel link current decoration', 'meros-blocks'),
            ],
        ];
        if ($part === 'column') {
            $roles['color'] = [];
            $roles['decoration'] = array_intersect_key($roles['decoration'], array_flip(['panel_link', 'panel_link_current']));
        }
        $fallbacks = [
            'menu_color_group' => ['menu_color_group_label'],
            'menu_color_group_link' => ['menu_color_group_label'],
            'menu_color_group_link_current' => ['menu_color_current'],
            'menu_color_panel_link' => ['menu_color_link'],
            'menu_color_panel_link_hover' => ['menu_color_link_hover'],
            'menu_color_panel_link_current' => ['menu_color_current'],
            'menu_decoration_group' => ['menu_decoration_text', 'menu_decoration_link'],
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

    private static function legacyKeys(string $part): array {
        if ($part === 'column') {
            return ['menu_decoration_link', 'menu_decoration_current'];
        }
        return [
            'menu_color_group_label', 'menu_color_panel_text', 'menu_color_link',
            'menu_color_link_hover', 'menu_color_current',
            'menu_decoration_text', 'menu_decoration_link', 'menu_decoration_current',
        ];
    }

    /**
     * Generates the wrapper attributes for the Mega Menu block, including inline styles.
     *
     * @param string $class
     * @param array  $attributes
     * @param string $part
     *
     * @return string
     */
    public static function wrapper(string $class, array $attributes, string $part = 'menu'): string {
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
        $definitions = self::definitions($part);
        if ($part !== 'column') {
            $definitions['menu_color_panel_text'] = ['style_fallbacks' => []];
        }
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
