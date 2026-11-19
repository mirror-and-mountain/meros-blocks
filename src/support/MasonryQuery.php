<?php

namespace MM\Meros\Blocks\Support;

use MM\Meros\Contracts\Features\Components\DynamicBlock;

final class MasonryQuery {
    public static function attributes(): array {
        $attributes = [];
        foreach ([
            'columns_desktop' => [__('Desktop columns', 'meros-blocks'), 3, 1, 6],
            'columns_tablet' => [__('Tablet columns', 'meros-blocks'), 2, 1, 6],
            'columns_mobile' => [__('Mobile columns', 'meros-blocks'), 1, 1, 6],
            'gap' => [__('Card gap (px)', 'meros-blocks'), 24, 0, 96],
        ] as $key => [$label, $default, $min, $max]) {
            $attributes["masonry_{$key}"] = [
                'type' => 'number',
                'default' => $default,
                'label' => $label,
                'masonry_control' => ['min' => $min, 'max' => $max],
            ];
        }
        return $attributes + [
            'masonry_varied' => ['type' => 'boolean', 'default' => false],
            'masonry_prioritise_sticky' => ['type' => 'boolean', 'default' => false],
            'masonry_sticky_shared_rows' => ['type' => 'boolean', 'default' => false],
            'masonry_vary_columns' => ['type' => 'boolean', 'default' => false],
            'masonry_column_variation' => ['type' => 'string', 'default' => 'subtle', 'enum' => ['subtle', 'broad']],
        ];
    }

    public static function boot(): void {
        add_filter('render_block_data', [self::class, 'prepareQueries']);
        add_filter('query_loop_block_query_vars', [self::class, 'queryVars'], 10, 2);
        add_filter('rest_post_query', static function (array $args, \WP_REST_Request $request): array {
            return $request->get_param('meros_masonry_priority') ? self::prioritise($args) : $args;
        }, 10, 2);
        add_filter('rest_post_collection_params', static function (array $params): array {
            $params['meros_masonry_priority'] = ['type' => 'boolean', 'default' => false];
            return $params;
        });
        add_filter('posts_orderby', [self::class, 'orderBy'], 10, 2);
        add_filter('post_class', static function (array $classes, array $css, int $id): array {
            if (is_sticky($id)) $classes[] = 'meros-masonry-sticky';
            return $classes;
        }, 10, 3);
    }

    public static function prepareQueries(array $parsed): array {
        if (($parsed['blockName'] ?? '') !== 'meros-blocks/masonry-query') return $parsed;
        foreach ($parsed['innerBlocks'] as &$query) {
            if ($query['blockName'] !== 'core/query' || !isset($query['attrs']['query'])) continue;
            if (($parsed['attrs']['masonry_prioritise_sticky'] ?? false) === true && empty($query['attrs']['query']['inherit'])) {
                $query['attrs']['query']['meros_masonry_priority'] = true;
            } else {
                unset($query['attrs']['query']['meros_masonry_priority']);
            }
        }
        unset($query);
        return $parsed;
    }

    public static function queryVars(array $args, \WP_Block $block): array {
        return !empty($block->context['query']['meros_masonry_priority']) ? self::prioritise($args) : $args;
    }

    public static function prioritise(array $args): array {
        if (($args['post_type'] ?? 'post') !== 'post') return $args;
        $args['meros_masonry_priority'] = true;
        $args['ignore_sticky_posts'] = true;
        return $args;
    }

    public static function orderBy(string $orderBy, \WP_Query $query): string {
        if (!$query->get('meros_masonry_priority')) return $orderBy;
        $ids = array_filter(array_map('absint', (array) get_option('sticky_posts', [])));
        if (!$ids) return $orderBy;
        global $wpdb;
        $priority = "CASE WHEN {$wpdb->posts}.ID IN (" . implode(',', $ids) . ') THEN 0 ELSE 1 END ASC';
        return $priority . ($orderBy !== '' ? ", {$orderBy}" : '') . ", {$wpdb->posts}.ID DESC";
    }

    public static function register(DynamicBlock $block): void {
        foreach (self::attributes() as $key => $definition) {
            $block->attribute($key, $definition);
        }
        $block->supports([
            'align' => ['wide', 'full'],
            'spacing' => ['margin' => true, 'padding' => true],
        ]);
        $block->variations([[
            'name' => 'starter',
            'title' => __('Masonry Query', 'meros-blocks'),
            'isDefault' => true,
            'scope' => ['inserter'],
            'innerBlocks' => [
                ['core/query', [
                    'query' => [
                        'perPage' => 6,
                        'pages' => 0,
                        'offset' => 0,
                        'postType' => 'post',
                        'order' => 'desc',
                        'orderBy' => 'date',
                        'author' => '',
                        'search' => '',
                        'exclude' => [],
                        'sticky' => '',
                        'inherit' => false,
                    ],
                ], [
                    ['core/post-template', ['layout' => ['type' => 'grid', 'columnCount' => 3]], [
                        ['core/post-featured-image', ['isLink' => true]],
                        ['core/post-title', ['level' => 3, 'isLink' => true]],
                        ['core/post-excerpt', ['excerptLength' => 24]],
                    ]],
                    ['core/query-pagination', ['layout' => ['type' => 'flex', 'justifyContent' => 'center']], [
                        ['core/query-pagination-previous'],
                        ['core/query-pagination-numbers'],
                        ['core/query-pagination-next'],
                    ]],
                    ['core/query-no-results', [], [
                        ['core/paragraph', ['content' => __('No posts found.', 'meros-blocks')]],
                    ]],
                ]],
            ],
        ]]);
    }

    public static function wrapper(array $attributes): string {
        $styles = [];
        foreach (self::attributes() as $key => $definition) {
            if (!isset($definition['masonry_control'])) continue;
            $value = $attributes[$key] ?? $definition['default'];
            if ((!is_int($value) && !is_float($value)) || !is_finite((float) $value)) {
                $value = $definition['default'];
            }
            $value = (int) max($definition['masonry_control']['min'], min($definition['masonry_control']['max'], round($value)));
            $property = str_replace('_', '-', $key);
            $styles[] = "--meros-{$property}:{$value}" . ($key === 'masonry_gap' ? 'px' : '');
        }
        $wrapper = [
            'class' => 'meros-masonry-query',
            'style' => implode(';', $styles) . ';',
        ];
        if (($attributes['masonry_varied'] ?? false) === true) $wrapper['data-meros-masonry-varied'] = 'true';
        if (($attributes['masonry_prioritise_sticky'] ?? false) === true) {
            $wrapper['data-meros-masonry-sticky'] = 'true';
            if (($attributes['masonry_sticky_shared_rows'] ?? false) === true) $wrapper['data-meros-masonry-sticky-shared'] = 'true';
        }
        if (($attributes['masonry_vary_columns'] ?? false) === true) {
            $wrapper['data-meros-masonry-vary-columns'] = 'true';
            $wrapper['data-meros-masonry-column-variation'] = ($attributes['masonry_column_variation'] ?? '') === 'broad' ? 'broad' : 'subtle';
        }
        return get_block_wrapper_attributes($wrapper);
    }
}
