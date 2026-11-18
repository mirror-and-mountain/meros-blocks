<?php

namespace MM\Meros\Blocks\Support;

use MM\Meros\Contracts\Features\Components\DynamicBlock;

/**
 * Provides styling attributes and wrapper styles for Mega Menu blocks.
 */
final class MegaMenuStyles {
    /**
     * Registers colour attributes for the specified part of the Mega Menu block.
     *
     * @param DynamicBlock $block
     * @param string       $part
     *
     * @return void
     */
    public static function colours(DynamicBlock $block, string $part): void {
        $colours = [
            'group-label'      => __('Group label', 'meros-blocks'),
            'panel-background' => __('Panel background', 'meros-blocks'),
            'panel-text'       => __('Panel text', 'meros-blocks'),
            'column-heading'   => __('Column headings', 'meros-blocks'),
            'link'             => __('Links', 'meros-blocks'),
            'link-hover'       => __('Link hover and focus', 'meros-blocks'),
        ];

        if ($part === 'column') {
            $colours = array_intersect_key($colours, array_flip(['column-heading', 'link', 'link-hover']));
        }

        foreach ($colours as $role => $label) {
            $block->attribute('menu_color_' . str_replace('-', '_', $role), [
                'type' => 'string',
                'default' => '',
                'label' => $label,
            ]);
        }
    }

    public static function fontSizes(DynamicBlock $block): void {
        foreach ([
            'column_heading' => __('Column heading size', 'meros-blocks'),
            'link' => __('Column link size', 'meros-blocks'),
        ] as $role => $label) {
            $block->attribute('menu_font_size_' . $role, [
                'type' => 'string',
                'default' => '',
                'label' => $label,
            ]);
        }
    }

    public static function textDecorations(DynamicBlock $block): void {
        foreach ([
            'text' => __('Text decoration', 'meros-blocks'),
            'link' => __('Link decoration', 'meros-blocks'),
        ] as $role => $label) {
            $block->attribute('menu_decoration_' . $role, [
                'type' => 'string',
                'default' => '',
                'label' => $label,
            ]);
        }
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

        foreach (['group-label', 'panel-background', 'panel-text', 'column-heading', 'link', 'link-hover'] as $role) {
            $value = $attributes['menu_color_' . str_replace('-', '_', $role)] ?? '';
            if (!is_string($value) || !preg_match('/\A(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|[a-z]+|(?:rgba?|hsla?)\([0-9.,% +\/-]+\))\z/i', $value)) {
                continue;
            }

            $styles[] = "--meros-menu-{$role}:{$value}";
            $wrapper["data-meros-menu-color-{$role}"] = 'true';
        }

        foreach (['column-heading', 'link'] as $role) {
            $slug = $attributes['menu_font_size_' . str_replace('-', '_', $role)] ?? '';
            if (is_string($slug) && preg_match('/\A[a-z0-9][a-z0-9-]*\z/i', $slug)) {
                $styles[] = "--meros-menu-{$role}-font-size:var(--wp--preset--font-size--{$slug})";
                $wrapper["data-meros-menu-font-size-{$role}"] = 'true';
            }
        }

        foreach (['text', 'link'] as $role) {
            $value = $attributes['menu_decoration_' . $role] ?? '';
            if (in_array($value, ['none', 'underline', 'line-through'], true)) {
                $styles[] = "--meros-menu-{$role}-decoration:{$value}";
                $wrapper["data-meros-menu-decoration-{$role}"] = 'true';
            }
        }

        if ($styles !== []) {
            $wrapper['style'] = implode(';', $styles) . ';';
        }

        return get_block_wrapper_attributes($wrapper);
    }
}
