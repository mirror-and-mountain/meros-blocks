<?php

namespace MM\Meros\Blocks\Tests\Unit;

use MM\Meros\Blocks\Support\SearchableQuery;
use PDO;
use PHPUnit\Framework\TestCase;
use RuntimeException;
use WP_Block;
use WP_Error;
use WP_Query;
use WP_REST_Request;

/**
 * Tests Searchable Query wiring, pagination, title search, token validation and request context restoration.
 *
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class SearchableQueryTest extends TestCase {
    protected function setUp(): void {
        require_once dirname(__DIR__) . '/Support/SearchableQueryDoubles.php';
        $GLOBALS['transients'] = [];
    }

    private function block(string $name, array $attributes = [], array $children = []): array {
        return ['blockName' => $name, 'attrs' => $attributes, 'innerBlocks' => $children, 'innerHTML' => '', 'innerContent' => []];
    }

    private function query(): array {
        return $this->block('core/query', [
            'merosLiveSearch' => true, 'queryId' => 12, 'enhancedPagination' => true,
            'query' => ['inherit' => false, 'postType' => 'book', 'taxQuery' => ['genre' => [3]], 'perPage' => 2, 'offset' => 1, 'orderBy' => 'title', 'exclude' => [7], 'search' => 'existing constraint'],
        ], [
            $this->block('core/group', [], [$this->block('core/search'), $this->block('core/query-pagination')]),
            $this->block('core/post-template', [], [$this->block('core/search')]),
            $this->block('core/query-no-results'),
            $this->block('core/query', ['query' => ['inherit' => false]], [$this->block('core/search'), $this->block('core/post-template')]),
        ]);
    }

    public function testPreparationWiresOnlySearchAndResultSlotsInTheCurrentQuery(): void {
        $query = $this->query();
        $prepared = SearchableQuery::prepare($query);
        self::assertFalse($prepared['attrs']['enhancedPagination']);
        self::assertTrue($prepared['innerBlocks'][0]['innerBlocks'][0]['attrs']['merosLiveQuerySearch']);
        self::assertSame('0', $prepared['innerBlocks'][0]['innerBlocks'][1]['attrs']['merosLiveQuerySlot']);
        self::assertSame('1', $prepared['innerBlocks'][1]['attrs']['merosLiveQuerySlot']);
        self::assertArrayNotHasKey('merosLiveQuerySearch', $prepared['innerBlocks'][1]['innerBlocks'][0]['attrs']);
        self::assertSame($query['innerBlocks'][3], $prepared['innerBlocks'][3]);
        self::assertSame('Card contents', SearchableQuery::markup('Card contents', $this->block('core/null', ['merosLiveQuerySlot' => '1']), new WP_Block([])));
        self::assertSame('<template data-meros-live-query-slot="1"></template><template data-meros-live-query-end="1"></template>', SearchableQuery::markup('', $this->block('core/post-template', ['merosLiveQuerySlot' => '1']), new WP_Block([])));
        $inherited = SearchableQuery::prepare($this->block('core/query', ['merosLiveSearch' => true]));
        self::assertTrue($inherited['attrs']['query']['inherit']);
        self::assertNull($inherited['attrs']['query']['perPage']);
        self::assertSame(0, $inherited['attrs']['query']['pages']);
        $inherited = SearchableQuery::prepare($this->block('core/query', ['merosLiveSearch' => true, 'query' => ['inherit' => true]], [$this->block('core/search'), $this->block('core/post-template')]));
        self::assertTrue($inherited['attrs']['query']['inherit']);
        self::assertTrue($inherited['innerBlocks'][0]['attrs']['merosLiveQuerySearch']);
        $ordinary = $this->block('core/query', ['query' => ['inherit' => true]]);
        self::assertSame($ordinary, SearchableQuery::prepare($ordinary));
    }

    public function testArchivePaginationRespectsNativeAndCustomRewriteBases(): void {
        $GLOBALS['wp_rewrite'] = (object) ['pagination_base' => 'page'];
        self::assertSame(3, SearchableQuery::archivePage('https://example.test/category/books/page/3/'));
        self::assertSame(2, SearchableQuery::archivePage('https://example.test/?cat=3&amp;paged=2'));
        self::assertSame(1, SearchableQuery::archivePage('https://example.test/category/books/'));
        $GLOBALS['wp_rewrite']->pagination_base = 'seite';
        self::assertSame(4, SearchableQuery::archivePage('https://example.test/genre/history/seite/4/'));
    }

    public function testTitleSearchPreservesConstraintsAndEscapesSql(): void {
        $args = ['post_type' => 'book', 'tax_query' => [['taxonomy' => 'genre', 'terms' => [3]]], 'offset' => 3, 'posts_per_page' => 2, 'orderby' => 'title', 'post__not_in' => [7], 's' => 'existing constraint'];
        $scoped = SearchableQuery::queryVars($args, new WP_Block([], ['query' => ['meros_live_search' => true, 'meros_live_search_title' => 'Title']]));
        self::assertSame($args, array_diff_key($scoped, array_flip(['post_status', 'ignore_sticky_posts', 'meros_live_search_title'])));
        self::assertSame('publish', $scoped['post_status']);
        self::assertTrue($scoped['ignore_sticky_posts']);
        self::assertSame($args, SearchableQuery::queryVars($args, new WP_Block([], ['query' => []])));
        $GLOBALS['wpdb'] = new class {
            public string $posts = 'wp_posts';
            public function esc_like(string $value): string { return addcslashes($value, '_%\\'); }
            public function prepare(string $sql, string $value): string { return str_replace('%s', "'" . str_replace("'", "''", $value) . "'", $sql); }
        };
        $where = SearchableQuery::where(' WHERE post_type = \'book\' AND genre = 3', new WP_Query(['meros_live_search_title' => "A_%'"]));
        self::assertStringContainsString("post_title LIKE '%A\\_\\%''%'", $where);
        self::assertSame('original', SearchableQuery::where('original', new WP_Query([])));
        self::assertSame('original', SearchableQuery::where('original', new WP_Query(['meros_live_search_title' => ''])));
        $db = new PDO('sqlite::memory:');
        $db->exec('CREATE TABLE wp_posts (ID INTEGER, post_title TEXT, post_content TEXT, post_type TEXT, genre INTEGER);');
        $db->exec("INSERT INTO wp_posts VALUES (1,'Alpha book','','book',3),(2,'Beta book','Alpha body','book',3),(3,'Alpha news','','post',3),(4,'Alpha other genre','','book',4);");
        $sql = SearchableQuery::where(" WHERE post_type = 'book' AND genre = 3", new WP_Query(['meros_live_search_title' => 'Alpha']));
        self::assertSame([1], $db->query("SELECT ID FROM wp_posts {$sql}")->fetchAll(PDO::FETCH_COLUMN));
    }

    public function testTokenVerificationAndRenderRestoreRequestContext(): void {
        $snapshot = ['block' => $this->query(), 'context' => ['postId' => 139, 'postType' => 'page'], 'url' => 'https://example.test/home/?other=kept'];
        $token = SearchableQuery::remember($snapshot);
        self::assertSame($snapshot, SearchableQuery::recall($token));
        self::assertInstanceOf(WP_Error::class, SearchableQuery::recall(str_replace(substr($token, -1), substr($token, -1) === 'a' ? 'b' : 'a', $token)));
        self::assertInstanceOf(WP_Error::class, SearchableQuery::recall('invalid'));
        $_GET = ['original' => 'value'];
        $_SERVER['REQUEST_URI'] = '/wp-json/meros-blocks/v1/query-search';
        $GLOBALS['post'] = (object) ['ID' => 10];
        $GLOBALS['wp_query'] = new WP_Query([]);
        $GLOBALS['wp_the_query'] = $GLOBALS['wp_query'];
        $original = $GLOBALS['wp_query'];
        $result = SearchableQuery::search(new WP_REST_Request(['token' => $token, 'search' => '<b>Alpha</b>', 'page' => 2]));
        self::assertSame('<div>Native results</div>', $result['html']);
        self::assertSame('Alpha', $GLOBALS['rendered']['block']['attrs']['query']['meros_live_search_title']);
        self::assertSame(['genre' => [3]], $GLOBALS['rendered']['block']['attrs']['query']['taxQuery']);
        self::assertSame(['other' => 'kept', 'query-12-page' => 2], $GLOBALS['rendered']['get']);
        self::assertSame(139, $GLOBALS['rendered']['resetPostId']);
        self::assertSame(['original' => 'value'], $_GET);
        self::assertSame('/wp-json/meros-blocks/v1/query-search', $_SERVER['REQUEST_URI']);
        self::assertSame(10, $GLOBALS['post']->ID);
        $GLOBALS['fail_render'] = true;
        try {
            SearchableQuery::search(new WP_REST_Request(['token' => $token, 'search' => '', 'page' => 1]));
            self::fail('Expected rendering to fail.');
        } catch (RuntimeException $error) {
            self::assertSame('Render failed', $error->getMessage());
        }
        self::assertSame(['original' => 'value'], $_GET);
        self::assertSame(10, $GLOBALS['post']->ID);
        self::assertSame($original, $GLOBALS['wp_query']);
        $GLOBALS['transients'] = [];
        self::assertSame(410, SearchableQuery::recall($token)->data['status']);
    }

    public function testArchiveSearchRestoresMainQueryOnSuccessAndFailure(): void {
        $_GET = ['original' => 'value'];
        $_SERVER['REQUEST_URI'] = '/wp-json/meros-blocks/v1/query-search';
        $GLOBALS['post'] = (object) ['ID' => 10];
        $GLOBALS['wp_query'] = new WP_Query([]);
        $GLOBALS['wp_the_query'] = $GLOBALS['wp_query'];
        $original = $GLOBALS['wp_query'];
        $archiveArgs = [
            'post_type' => 'book', 'tax_query' => [['taxonomy' => 'genre', 'terms' => [3]]],
            'author' => 9, 'date_query' => [['year' => 2025]], 'post__not_in' => [7],
            'posts_per_page' => 2, 'order' => 'ASC', 'orderby' => 'title', 's' => 'configured',
            'paged' => 3, 'ignore_sticky_posts' => false,
        ];
        $archiveSnapshot = [
            'block' => $this->block('core/query', ['merosLiveSearch' => true, 'queryId' => 4, 'query' => ['inherit' => true]], [$this->block('core/post-template')]),
            'context' => [], 'url' => 'https://example.test/genre/history/', 'archiveQuery' => $archiveArgs,
        ];
        $token = SearchableQuery::remember($archiveSnapshot);
        SearchableQuery::search(new WP_REST_Request(['token' => $token, 'search' => 'Alpha', 'page' => 2, 'post_type' => 'post']));
        self::assertTrue($GLOBALS['rendered']['block']['attrs']['query']['inherit']);
        self::assertTrue($GLOBALS['archive_was_main']);
        self::assertSame(array_diff_key($archiveArgs, array_flip(['paged', 'ignore_sticky_posts'])), array_diff_key($GLOBALS['rendered']['query'], array_flip(['paged', 'post_status', 'meros_live_search_title', 'ignore_sticky_posts', 'suppress_filters'])));
        self::assertSame(2, $GLOBALS['rendered']['query']['paged']);
        self::assertSame('Alpha', $GLOBALS['rendered']['query']['meros_live_search_title']);
        self::assertTrue($GLOBALS['rendered']['query']['ignore_sticky_posts']);
        self::assertSame(['paged' => 2], $GLOBALS['rendered']['get']);
        SearchableQuery::search(new WP_REST_Request(['token' => $token, 'search' => '', 'page' => 1]));
        self::assertSame(1, $GLOBALS['rendered']['query']['paged']);
        self::assertSame('', $GLOBALS['rendered']['query']['meros_live_search_title']);
        self::assertFalse($GLOBALS['rendered']['query']['ignore_sticky_posts']);
        self::assertSame($original, $GLOBALS['wp_query']);
        self::assertSame($original, $GLOBALS['wp_the_query']);
        self::assertSame(10, $GLOBALS['post']->ID);
        $GLOBALS['fail_query'] = true;
        try {
            SearchableQuery::search(new WP_REST_Request(['token' => $token, 'search' => 'Alpha', 'page' => 1]));
            self::fail('Expected archive querying to fail.');
        } catch (RuntimeException $error) {
            self::assertSame('Archive query failed', $error->getMessage());
        }
        self::assertSame($original, $GLOBALS['wp_query']);
        self::assertSame($original, $GLOBALS['wp_the_query']);
        self::assertSame(['original' => 'value'], $_GET);
        self::assertSame(10, $GLOBALS['post']->ID);
    }
}
