<?php

namespace MM\Meros\Contracts\Features\Components {
    final class DynamicBlock {
        public array $attributes = [];
        public array $supports = [];
        public array $variations = [];

        public function attribute(string $key, array $definition): void {
            $this->attributes[$key] = $definition;
        }

        public function supports(array $supports): void {
            $this->supports = $supports;
        }

        public function variations(array $variations): void {
            $this->variations = $variations;
        }
    }
}

namespace {
    use MM\Meros\Blocks\Support\MasonryQuery;
    use MM\Meros\Contracts\Features\Components\DynamicBlock;

    function __(string $value, string $domain): string {
        return $value;
    }

    function get_block_wrapper_attributes(array $attributes): string {
        return json_encode($attributes, JSON_THROW_ON_ERROR);
    }

    class WP_Query {
        public function __construct(private array $args) {}
        public function get(string $key): mixed {
            return $this->args[$key] ?? null;
        }
    }

    class WP_Block {
        public function __construct(public array $context) {}
    }

    function absint(mixed $value): int {
        return abs((int) $value);
    }

    function get_option(string $key, mixed $default): mixed {
        return $key === 'sticky_posts' ? [2, 4] : $default;
    }

    require dirname(__DIR__) . '/src/support/MasonryQuery.php';

    function expect(bool $condition, string $message): void {
        if (!$condition) throw new \RuntimeException($message);
    }

    $block = new DynamicBlock();
    MasonryQuery::register($block);
    $query = $block->variations[0]['innerBlocks'][0];
    expect($query[0] === 'core/query' && !array_key_exists('queryId', $query[1]), 'WordPress must allocate unique query IDs.');
    expect($query[1]['query']['inherit'] === false, 'The starter must expose its own native query settings.');
    expect(array_column($query[2], 0) === ['core/post-template', 'core/query-pagination', 'core/query-no-results'], 'Keep native cards, pagination and no-results blocks.');
    expect(array_column($query[2][0][2], 0) === ['core/post-featured-image', 'core/post-title', 'core/post-excerpt'], 'The starter cards must remain native editable blocks.');

    $wrapper = json_decode(MasonryQuery::wrapper([
        'masonry_columns_desktop' => 999,
        'masonry_columns_tablet' => -5,
        'masonry_columns_mobile' => '1;color:red',
        'masonry_gap' => INF,
        'style' => ['spacing' => ['padding' => '24px']],
    ]), true, flags: JSON_THROW_ON_ERROR);
    expect($wrapper['class'] === 'meros-masonry-query', 'The frontend layout root must be identifiable.');
    expect($wrapper['style'] === '--meros-masonry-columns-desktop:6;--meros-masonry-columns-tablet:1;--meros-masonry-columns-mobile:1;--meros-masonry-gap:24px;', 'Clamp numeric settings and reject invalid CSS values.');
    $zero = json_decode(MasonryQuery::wrapper(['masonry_gap' => 0]), true, flags: JSON_THROW_ON_ERROR);
    expect(str_contains($zero['style'], '--meros-masonry-gap:0px;'), 'A zero gap must not fall back to the default.');

    $enabled = json_decode(MasonryQuery::wrapper(['masonry_varied' => true, 'masonry_prioritise_sticky' => true]), true, flags: JSON_THROW_ON_ERROR);
    expect($enabled['data-meros-masonry-varied'] === 'true' && $enabled['data-meros-masonry-sticky'] === 'true', 'Feature toggles must reach the frontend without changing numeric controls.');
    expect(!isset($enabled['data-meros-masonry-sticky-shared']), 'Existing sticky layouts must retain full-width rows by default.');
    $shared = json_decode(MasonryQuery::wrapper(['masonry_prioritise_sticky' => true, 'masonry_sticky_shared_rows' => true]), true, flags: JSON_THROW_ON_ERROR);
    expect($shared['data-meros-masonry-sticky'] === 'true' && $shared['data-meros-masonry-sticky-shared'] === 'true', 'Shared rows must retain sticky priority while enabling normal packing.');
    $inactiveShared = json_decode(MasonryQuery::wrapper(['masonry_sticky_shared_rows' => true]), true, flags: JSON_THROW_ON_ERROR);
    expect(!isset($inactiveShared['data-meros-masonry-sticky-shared']), 'Shared rows must only apply when sticky priority is enabled.');
    $density = json_decode(MasonryQuery::wrapper(['masonry_vary_columns' => true, 'masonry_column_variation' => 'broad']), true, flags: JSON_THROW_ON_ERROR);
    expect($density['data-meros-masonry-vary-columns'] === 'true' && $density['data-meros-masonry-column-variation'] === 'broad', 'The frontend must receive the selected density mode.');
    $invalidDensity = json_decode(MasonryQuery::wrapper(['masonry_vary_columns' => true, 'masonry_column_variation' => 'bad"value']), true, flags: JSON_THROW_ON_ERROR);
    expect($invalidDensity['data-meros-masonry-column-variation'] === 'subtle', 'An unsupported density mode must use the documented subtle default.');
    $parsed = [
        'blockName' => 'meros-blocks/masonry-query',
        'attrs' => ['masonry_prioritise_sticky' => true],
        'innerBlocks' => [
            ['blockName' => 'core/query', 'attrs' => ['query' => ['inherit' => false]]],
            ['blockName' => 'core/query', 'attrs' => ['query' => ['inherit' => true]]],
            ['blockName' => 'core/query', 'attrs' => []],
        ],
    ];
    $prepared = MasonryQuery::prepareQueries($parsed);
    expect($prepared['innerBlocks'][0]['attrs']['query']['meros_masonry_priority'] === true, 'Direct custom queries must receive the sticky ordering flag.');
    expect(!isset($prepared['innerBlocks'][1]['attrs']['query']['meros_masonry_priority']), 'Inherited queries must preserve their native ordering.');
    expect($prepared['innerBlocks'][2] === $parsed['innerBlocks'][2], 'A missing query attribute must retain the native Query Loop defaults.');
    expect(!isset($parsed['innerBlocks'][0]['attrs']['query']['meros_masonry_priority']), 'Rendering must not mutate saved attributes.');
    expect(MasonryQuery::prepareQueries(['blockName' => 'core/query']) === ['blockName' => 'core/query'], 'Unrelated queries must not be modified.');

    $args = ['post_type' => 'post', 'tax_query' => [['terms' => [3]]], 'post__not_in' => [4], 'posts_per_page' => 2, 'offset' => 2, 'orderby' => 'date'];
    $priority = MasonryQuery::queryVars($args, new WP_Block(['query' => ['meros_masonry_priority' => true]]));
    expect(array_diff_key($priority, array_flip(['meros_masonry_priority', 'ignore_sticky_posts'])) === $args, 'Priority must retain filters, exclusions, offsets and page sizes.');
    expect($priority['ignore_sticky_posts'] === true, 'Disable native sticky injection, which could bypass filters and duplicate posts.');
    expect(MasonryQuery::queryVars($args, new WP_Block([])) === $args, 'Priority must be opt-in.');
    expect(MasonryQuery::prioritise(['post_type' => 'page']) === ['post_type' => 'page'], 'Sticky ordering applies only to WordPress posts.');

    $wpdb = (object) ['posts' => 'wp_posts'];
    $order = MasonryQuery::orderBy('wp_posts.post_date DESC', new WP_Query($priority));
    expect(MasonryQuery::orderBy('wp_posts.post_date DESC', new WP_Query([])) === 'wp_posts.post_date DESC', 'Other WordPress queries must not receive custom SQL.');
    $db = new \PDO('sqlite::memory:');
    $db->exec('CREATE TABLE wp_posts (ID INTEGER, post_date INTEGER, category INTEGER)');
    $db->exec('INSERT INTO wp_posts VALUES (1, 6, 3), (2, 3, 3), (3, 5, 3), (4, 4, 8), (5, 2, 3)');
    $select = "SELECT ID FROM wp_posts WHERE category = 3 ORDER BY {$order} LIMIT 2 OFFSET ";
    $first = $db->query($select . '0')->fetchAll(\PDO::FETCH_COLUMN);
    $second = $db->query($select . '2')->fetchAll(\PDO::FETCH_COLUMN);
    expect($first === [2, 1] && $second === [3, 5], 'Sticky ordering must work across pages without injecting non-matching sticky posts or duplicating results.');
    expect($db->query("SELECT ID FROM wp_posts WHERE category = 3 AND ID NOT IN (2) ORDER BY {$order} LIMIT 2")->fetchAll(\PDO::FETCH_COLUMN) === [1, 3], 'Excluding a sticky post must still be respected.');

    echo "Masonry Query PHP tests passed.\n";
}
