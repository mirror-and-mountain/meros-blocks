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
    public function __construct(private array $args) {}
    public function get(string $key): mixed { return $this->args[$key] ?? null; }
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
        $GLOBALS['rendered'] = ['block' => $this->parsed_block, 'context' => $this->context, 'get' => $_GET, 'uri' => $_SERVER['REQUEST_URI'], 'resetPostId' => $GLOBALS['wp_query']->post->ID];
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
expect(SearchableQuery::prepare(block('core/query', ['merosLiveSearch' => true])) === block('core/query', ['merosLiveSearch' => true]), 'Missing query settings must retain inherited native defaults.');
expect(SearchableQuery::prepare(block('core/query', ['merosLiveSearch' => true, 'query' => ['inherit' => true]])) === block('core/query', ['merosLiveSearch' => true, 'query' => ['inherit' => true]]), 'Inherited queries must not be opted in.');

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
$transients = [];
expect(SearchableQuery::recall($token)->data['status'] === 410, 'Missing or expired server configuration must report a reload-required error.');
echo "Searchable Query PHP tests passed.\n";
