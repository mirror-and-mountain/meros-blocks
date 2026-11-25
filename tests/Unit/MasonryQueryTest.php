<?php

namespace MM\Meros\Blocks\Tests\Unit;

use MM\Meros\Blocks\Support\MasonryQuery;
use MM\Meros\Contracts\Features\Components\DynamicBlock;
use PDO;
use PHPUnit\Framework\TestCase;
use WP_Block;
use WP_Query;

/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class MasonryQueryTest extends TestCase {
    protected function setUp(): void {
        require_once dirname(__DIR__) . '/Support/BlockStyleDoubles.php';
    }

    private function wrapper(array $attributes): array {
        return json_decode(MasonryQuery::wrapper($attributes), true, flags: JSON_THROW_ON_ERROR);
    }

    public function testStarterUsesNativeEditableBlocks(): void {
        $block = new DynamicBlock();
        MasonryQuery::register($block);
        $query = $block->variations[0]['innerBlocks'][0];
        self::assertSame('core/query', $query[0]);
        self::assertArrayNotHasKey('queryId', $query[1]);
        self::assertFalse($query[1]['query']['inherit']);
        self::assertSame(['core/post-template', 'core/query-pagination', 'core/query-no-results'], array_column($query[2], 0));
        self::assertSame(['core/post-featured-image', 'core/post-title', 'core/post-excerpt'], array_column($query[2][0][2], 0));
    }

    public function testWrapperSanitizesLayoutAndFeatureControls(): void {
        $wrapper = $this->wrapper([
            'masonry_columns_desktop' => 999,
            'masonry_columns_tablet' => -5,
            'masonry_columns_mobile' => '1;color:red',
            'masonry_gap' => INF,
            'style' => ['spacing' => ['padding' => '24px']],
        ]);
        self::assertSame('meros-masonry-query', $wrapper['class']);
        self::assertSame('--meros-masonry-columns-desktop:6;--meros-masonry-columns-tablet:1;--meros-masonry-columns-mobile:1;--meros-masonry-gap:24px;', $wrapper['style']);
        self::assertStringContainsString('--meros-masonry-gap:0px;', $this->wrapper(['masonry_gap' => 0])['style']);
        $enabled = $this->wrapper(['masonry_varied' => true, 'masonry_prioritise_sticky' => true]);
        self::assertSame('true', $enabled['data-meros-masonry-varied']);
        self::assertSame('true', $enabled['data-meros-masonry-sticky']);
        self::assertArrayNotHasKey('data-meros-masonry-sticky-shared', $enabled);
        $shared = $this->wrapper(['masonry_prioritise_sticky' => true, 'masonry_sticky_shared_rows' => true]);
        self::assertSame('true', $shared['data-meros-masonry-sticky']);
        self::assertSame('true', $shared['data-meros-masonry-sticky-shared']);
        self::assertArrayNotHasKey('data-meros-masonry-sticky-shared', $this->wrapper(['masonry_sticky_shared_rows' => true]));
        $density = $this->wrapper(['masonry_vary_columns' => true, 'masonry_column_variation' => 'broad']);
        self::assertSame('true', $density['data-meros-masonry-vary-columns']);
        self::assertSame('broad', $density['data-meros-masonry-column-variation']);
        self::assertSame('subtle', $this->wrapper(['masonry_vary_columns' => true, 'masonry_column_variation' => 'bad"value'])['data-meros-masonry-column-variation']);
    }

    public function testPrepareQueriesOnlyChangesDirectCustomQueries(): void {
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
        self::assertTrue($prepared['innerBlocks'][0]['attrs']['query']['meros_masonry_priority']);
        self::assertArrayNotHasKey('meros_masonry_priority', $prepared['innerBlocks'][1]['attrs']['query']);
        self::assertSame($parsed['innerBlocks'][2], $prepared['innerBlocks'][2]);
        self::assertArrayNotHasKey('meros_masonry_priority', $parsed['innerBlocks'][0]['attrs']['query']);
        self::assertSame(['blockName' => 'core/query'], MasonryQuery::prepareQueries(['blockName' => 'core/query']));
    }

    public function testStickyPriorityPreservesFiltersAndPagination(): void {
        $args = ['post_type' => 'post', 'tax_query' => [['terms' => [3]]], 'post__not_in' => [4], 'posts_per_page' => 2, 'offset' => 2, 'orderby' => 'date'];
        $priority = MasonryQuery::queryVars($args, new WP_Block(['query' => ['meros_masonry_priority' => true]]));
        self::assertSame($args, array_diff_key($priority, array_flip(['meros_masonry_priority', 'ignore_sticky_posts'])));
        self::assertTrue($priority['ignore_sticky_posts']);
        self::assertSame($args, MasonryQuery::queryVars($args, new WP_Block([])));
        self::assertSame(['post_type' => 'page'], MasonryQuery::prioritise(['post_type' => 'page']));
        $GLOBALS['wpdb'] = (object) ['posts' => 'wp_posts'];
        $order = MasonryQuery::orderBy('wp_posts.post_date DESC', new WP_Query($priority));
        self::assertSame('wp_posts.post_date DESC', MasonryQuery::orderBy('wp_posts.post_date DESC', new WP_Query([])));
        $db = new PDO('sqlite::memory:');
        $db->exec('CREATE TABLE wp_posts (ID INTEGER, post_date INTEGER, category INTEGER)');
        $db->exec('INSERT INTO wp_posts VALUES (1, 6, 3), (2, 3, 3), (3, 5, 3), (4, 4, 8), (5, 2, 3)');
        $select = "SELECT ID FROM wp_posts WHERE category = 3 ORDER BY {$order} LIMIT 2 OFFSET ";
        self::assertSame([2, 1], $db->query($select . '0')->fetchAll(PDO::FETCH_COLUMN));
        self::assertSame([3, 5], $db->query($select . '2')->fetchAll(PDO::FETCH_COLUMN));
        self::assertSame([1, 3], $db->query("SELECT ID FROM wp_posts WHERE category = 3 AND ID NOT IN (2) ORDER BY {$order} LIMIT 2")->fetchAll(PDO::FETCH_COLUMN));
    }
}
