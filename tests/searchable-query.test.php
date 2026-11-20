<?php

use MM\Meros\Blocks\Support\SearchableQuery;

require dirname(__DIR__) . '/src/support/SearchableQuery.php';

const WEEK_IN_SECONDS = 604800;
$transients = [];
function __(string $text, string $domain): string { return $text; }
function wp_json_encode(mixed $value): string { return json_encode($value, JSON_THROW_ON_ERROR); }
function wp_salt(string $scheme): string { return 'test-only-signing-key'; }
function set_transient(string $key, array $value, int $expiry): void { $GLOBALS['transients'][$key] = $value; }
function get_transient(string $key): mixed { return $GLOBALS['transients'][$key] ?? false; }
function sanitize_text_field(string $text): string { return trim(strip_tags($text)); }
function wp_parse_url(string $url): array { return parse_url($url); }
function get_post(int $id): object { return (object) ['ID' => $id]; }
function setup_postdata(object $post): void { $GLOBALS['restored_post'] = $post; }
function esc_attr(string $value): string { return htmlspecialchars($value, ENT_QUOTES); }

class WP_Error {
    public function __construct(public string $code, public string $message, public array $data) {}
}
class WP_Query {
    public ?object $post = null;
    public array $query_vars;
    public function __construct(array $args = []) { $this->query_vars = $args; }
    public function get(string $key): mixed { return $this->query_vars[$key] ?? null; }
    public function query(array $args): void {
        $GLOBALS['archive_was_main'] = $GLOBALS['wp_the_query'] === $this && $GLOBALS['wp_query'] === $this;
        if (!empty($GLOBALS['fail_query'])) throw new RuntimeException('Archive query failed');
        $this->query_vars = $args;
        $this->post = (object) ['ID' => 501];
    }
}
class WP_Block_Type_Registry {
    public static function get_instance(): self { return new self(); }
    public function get_registered(string $name): object {
        return (object) ['attributes' => ['query' => ['default' => ['inherit' => true, 'perPage' => null, 'pages' => 0, 'offset' => 0, 'postType' => 'post', 'order' => 'desc', 'orderBy' => 'date']]]];
    }
}
class WP_REST_Request implements ArrayAccess {
    public function __construct(private array $args) {}
    public function offsetExists(mixed $offset): bool { return isset($this->args[$offset]); }
    public function offsetGet(mixed $offset): mixed { return $this->args[$offset]; }
    public function offsetSet(mixed $offset, mixed $value): void { $this->args[$offset] = $value; }
    public function offsetUnset(mixed $offset): void { unset($this->args[$offset]); }
}
class WP_Block {
    public function __construct(public array $parsed_block, public array $context = []) {}
    public function render(): string {
        $GLOBALS['rendered'] = ['block' => $this->parsed_block, 'context' => $this->context, 'get' => $_GET, 'uri' => $_SERVER['REQUEST_URI'], 'resetPostId' => $GLOBALS['wp_query']->post->ID, 'query' => $GLOBALS['wp_query']->query_vars];
        if (!empty($GLOBALS['fail_render'])) throw new RuntimeException('Render failed');
        return '<div>Native results</div>';
    }
}
function expect(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
function block(string $name, array $attributes = [], array $children = []): array {
    return ['blockName' => $name, 'attrs' => $attributes, 'innerBlocks' => $children, 'innerHTML' => '', 'innerContent' => []];
}

$query = block('core/query', [
    'merosLiveSearch' => true, 'queryId' => 12, 'enhancedPagination' => true,
    'query' => ['inherit' => false, 'postType' => 'book', 'taxQuery' => ['genre' => [3]], 'perPage' => 2, 'offset' => 1, 'orderBy' => 'title', 'exclude' => [7], 'search' => 'existing constraint'],
], [
    block('core/group', [], [block('core/search'), block('core/query-pagination')]),
    block('core/post-template', [], [block('core/search')]),
    block('core/query-no-results'),
    block('core/query', ['query' => ['inherit' => false]], [block('core/search'), block('core/post-template')]),
]);
$prepared = SearchableQuery::prepare($query);
expect($prepared['attrs']['enhancedPagination'] === false, 'Do not mix the native navigation router with AJAX search.');
expect($prepared['innerBlocks'][0]['innerBlocks'][0]['attrs']['merosLiveQuerySearch'] === true, 'Search blocks inside a layout group must be wired.');
expect($prepared['innerBlocks'][0]['innerBlocks'][1]['attrs']['merosLiveQuerySlot'] === '0', 'Pagination must be replaceable even outside the main result layout.');
expect($prepared['innerBlocks'][1]['attrs']['merosLiveQuerySlot'] === '1', 'Post Template must have its own stable result slot.');
expect(!isset($prepared['innerBlocks'][1]['innerBlocks'][0]['attrs']['merosLiveQuerySearch']), 'Per-card searches must not drive the containing query.');
expect($prepared['innerBlocks'][3] === $query['innerBlocks'][3], 'Nested queries must retain their own independent configuration.');
expect(SearchableQuery::markup('Card contents', block('core/null', ['merosLiveQuerySlot' => '1']), new WP_Block([])) === 'Card contents', 'Native Post Template clones must not gain per-card result slots.');
expect(SearchableQuery::markup('', block('core/post-template', ['merosLiveQuerySlot' => '1']), new WP_Block([])) === '<template data-meros-live-query-slot="1"></template><template data-meros-live-query-end="1"></template>', 'Even empty native results must retain anchors for subsequent searches without adding layout wrappers.');
$inheritedDefault = SearchableQuery::prepare(block('core/query', ['merosLiveSearch' => true]));
expect($inheritedDefault['attrs']['query']['inherit'] === true && $inheritedDefault['attrs']['query']['perPage'] === null && $inheritedDefault['attrs']['query']['pages'] === 0, 'Adding runtime search context must preserve inherited native defaults.');
$inheritedPrepared = SearchableQuery::prepare(block('core/query', ['merosLiveSearch' => true, 'query' => ['inherit' => true]], [block('core/search'), block('core/post-template')]));
expect($inheritedPrepared['attrs']['query']['inherit'] === true && $inheritedPrepared['innerBlocks'][0]['attrs']['merosLiveQuerySearch'] === true, 'Inherited queries must be wired without converting their saved query to a custom query.');
expect(SearchableQuery::prepare(block('core/query', ['query' => ['inherit' => true]])) === block('core/query', ['query' => ['inherit' => true]]), 'Ordinary inherited queries must remain untouched.');
$wp_rewrite = (object) ['pagination_base' => 'page'];
expect(SearchableQuery::archivePage('https://example.test/category/books/page/3/') === 3, 'Pretty archive pagination must resolve the selected page.');
expect(SearchableQuery::archivePage('https://example.test/?cat=3&amp;paged=2') === 2, 'Plain archive pagination must preserve its page number.');
expect(SearchableQuery::archivePage('https://example.test/category/books/') === 1, 'Archive page-one links must reset to page one.');
$wp_rewrite->pagination_base = 'seite';
expect(SearchableQuery::archivePage('https://example.test/genre/history/seite/4/') === 4, 'Custom pagination rewrite bases must be respected.');

$args = ['post_type' => 'book', 'tax_query' => [['taxonomy' => 'genre', 'terms' => [3]]], 'offset' => 3, 'posts_per_page' => 2, 'orderby' => 'title', 'post__not_in' => [7], 's' => 'existing constraint'];
$context = new WP_Block([], ['query' => ['meros_live_search' => true, 'meros_live_search_title' => 'Title']]);
$scoped = SearchableQuery::queryVars($args, $context);
expect(array_diff_key($scoped, array_flip(['post_status', 'ignore_sticky_posts', 'meros_live_search_title'])) === $args, 'Title search must preserve every existing native query constraint.');
expect($scoped['post_status'] === 'publish', 'Visitors, including authenticated visitors, must not receive private/draft results.');
expect($scoped['ignore_sticky_posts'] === true, 'Native sticky injection must not append posts outside the configured filters or search.');
expect(SearchableQuery::queryVars($args, new WP_Block([], ['query' => []])) === $args, 'Unrelated query arguments must not change.');

$wpdb = new class {
    public string $posts = 'wp_posts';
    public function esc_like(string $value): string { return addcslashes($value, '_%\\'); }
    public function prepare(string $sql, string $value): string { return str_replace('%s', "'" . str_replace("'", "''", $value) . "'", $sql); }
};
$where = SearchableQuery::where(' WHERE post_type = \'book\' AND genre = 3', new WP_Query(['meros_live_search_title' => "A_%'"]));
expect(str_contains($where, "post_title LIKE '%A\\_\\%''%'"), 'Title matching must escape SQL wildcard characters and quotes.');
expect(SearchableQuery::where('original', new WP_Query([])) === 'original', 'Ordinary queries must retain native search behavior.');
expect(SearchableQuery::where('original', new WP_Query(['meros_live_search_title' => ''])) === 'original', 'Clearing the input must restore the full configured query.');
$db = new PDO('sqlite::memory:');
$db->exec('CREATE TABLE wp_posts (ID INTEGER, post_title TEXT, post_content TEXT, post_type TEXT, genre INTEGER);');
$db->exec("INSERT INTO wp_posts VALUES (1,'Alpha book','','book',3),(2,'Beta book','Alpha body','book',3),(3,'Alpha news','','post',3),(4,'Alpha other genre','','book',4);");
$sql = SearchableQuery::where(" WHERE post_type = 'book' AND genre = 3", new WP_Query(['meros_live_search_title' => 'Alpha']));
expect($db->query("SELECT ID FROM wp_posts {$sql}")->fetchAll(PDO::FETCH_COLUMN) === [1], 'Actual SQL must match titles only, within both post-type and taxonomy bounds.');

$snapshot = ['block' => $query, 'context' => ['postId' => 139, 'postType' => 'page'], 'url' => 'https://example.test/home/?other=kept'];
$token = SearchableQuery::remember($snapshot);
expect(SearchableQuery::recall($token) === $snapshot, 'The browser token must resolve only to server-held query configuration.');
expect(SearchableQuery::recall(str_replace(substr($token, -1), substr($token, -1) === 'a' ? 'b' : 'a', $token)) instanceof WP_Error, 'A changed signature must not authorize query rendering.');
expect(SearchableQuery::recall('invalid') instanceof WP_Error, 'Malformed tokens must return an explicit error.');
$_GET = ['original' => 'value'];
$_SERVER['REQUEST_URI'] = '/wp-json/meros-blocks/v1/query-search';
$post = (object) ['ID' => 10];
$wp_query = new WP_Query([]);
$wp_the_query = $wp_query;
$originalQuery = $wp_query;
$result = SearchableQuery::search(new WP_REST_Request(['token' => $token, 'search' => '<b>Alpha</b>', 'page' => 2]));
expect($result['html'] === '<div>Native results</div>', 'The endpoint must return native-rendered HTML.');
expect($rendered['block']['attrs']['query']['meros_live_search_title'] === 'Alpha', 'Only sanitized title text must be added to the saved query.');
expect($rendered['block']['attrs']['query']['taxQuery'] === ['genre' => [3]], 'Client search input must not replace saved taxonomy constraints.');
expect($rendered['get'] === ['other' => 'kept', 'query-12-page' => 2], 'Pagination must use the query-specific page key and saved page URL.');
expect($rendered['resetPostId'] === 139, 'Native postdata resets must restore the original page during every card/pagination render.');
expect($_GET === ['original' => 'value'] && $_SERVER['REQUEST_URI'] === '/wp-json/meros-blocks/v1/query-search' && $post->ID === 10, 'Rendering must restore the original request and post context.');
$fail_render = true;
try {
    SearchableQuery::search(new WP_REST_Request(['token' => $token, 'search' => '', 'page' => 1]));
    throw new RuntimeException('Expected the rendering failure to propagate.');
} catch (RuntimeException $error) {
    expect($error->getMessage() === 'Render failed', 'Rendering failures must not become success-shaped responses.');
}
expect($_GET === ['original' => 'value'] && $post->ID === 10, 'Request state must also be restored after rendering failures.');
expect($wp_query === $originalQuery, 'Native global query context must be restored on success and failure.');
$fail_render = false;
$archiveArgs = [
    'post_type' => 'book', 'tax_query' => [['taxonomy' => 'genre', 'terms' => [3]]],
    'author' => 9, 'date_query' => [['year' => 2025]], 'post__not_in' => [7],
    'posts_per_page' => 2, 'order' => 'ASC', 'orderby' => 'title', 's' => 'configured',
    'paged' => 3, 'ignore_sticky_posts' => false,
];
$archiveSnapshot = [
    'block' => block('core/query', ['merosLiveSearch' => true, 'queryId' => 4, 'query' => ['inherit' => true]], [block('core/post-template')]),
    'context' => [], 'url' => 'https://example.test/genre/history/', 'archiveQuery' => $archiveArgs,
];
$archiveToken = SearchableQuery::remember($archiveSnapshot);
SearchableQuery::search(new WP_REST_Request(['token' => $archiveToken, 'search' => 'Alpha', 'page' => 2, 'post_type' => 'post']));
expect($rendered['block']['attrs']['query']['inherit'] === true, 'Archive searches must continue using the native inherited render path.');
expect($archive_was_main, 'Inherited rendering and main-query filters must see the captured archive as the active main query.');
expect(array_diff_key($rendered['query'], array_flip(['paged', 'post_status', 'meros_live_search_title', 'ignore_sticky_posts', 'suppress_filters'])) === array_diff_key($archiveArgs, array_flip(['paged', 'ignore_sticky_posts'])), 'Search must retain the captured post type, taxonomy, author, date, exclusions, ordering and page size rather than accepting client filters.');
expect($rendered['query']['paged'] === 2 && $rendered['query']['meros_live_search_title'] === 'Alpha' && $rendered['query']['ignore_sticky_posts'] === true, 'Archive pagination must apply within the title-filtered results without sticky injection.');
expect($rendered['get'] === ['paged' => 2], 'Archive requests must use the native main-query pagination key.');
SearchableQuery::search(new WP_REST_Request(['token' => $archiveToken, 'search' => '', 'page' => 1]));
expect($rendered['query']['paged'] === 1 && $rendered['query']['meros_live_search_title'] === '' && $rendered['query']['ignore_sticky_posts'] === false, 'Clearing an archive search must restore its original constraints and sticky behavior at page one.');
expect($wp_query === $originalQuery && $wp_the_query === $originalQuery && $post->ID === 10, 'Archive rendering must restore both main query globals and post context.');
$fail_query = true;
try {
    SearchableQuery::search(new WP_REST_Request(['token' => $archiveToken, 'search' => 'Alpha', 'page' => 1]));
    throw new RuntimeException('Expected archive querying to fail.');
} catch (RuntimeException $error) {
    expect($error->getMessage() === 'Archive query failed', 'Archive query failures must propagate.');
}
expect($wp_query === $originalQuery && $wp_the_query === $originalQuery && $_GET === ['original' => 'value'] && $post->ID === 10, 'Archive query failures must restore all request globals.');
$transients = [];
expect(SearchableQuery::recall($token)->data['status'] === 410, 'Missing or expired server configuration must report a reload-required error.');
echo "Searchable Query PHP tests passed.\n";
