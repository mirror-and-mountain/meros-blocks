<?php

namespace MM\Meros\Blocks\Support;

final class SearchableQuery {
    private const ROUTE = 'meros-blocks/v1/query-search';

    public static function boot(): void {
        add_filter('register_block_type_args', static function (array $args, string $name): array {
            if ($name === 'core/query') {
                $args['attributes']['merosLiveSearch'] = ['type' => 'boolean', 'default' => false];
                $args['attributes']['merosLiveSearchSpinnerPosition'] = ['type' => 'string', 'default' => 'above', 'enum' => ['above', 'below']];
                $args['uses_context'] = array_values(array_unique([...($args['uses_context'] ?? []), 'postId']));
            }
            return $args;
        }, 10, 2);
        add_filter('render_block_data', [self::class, 'prepare'], 20);
        add_filter('render_block', [self::class, 'markup'], 20, 3);
        add_filter('query_loop_block_query_vars', [self::class, 'queryVars'], 20, 2);
        add_filter('posts_where', [self::class, 'where'], 10, 2);
        add_action('rest_api_init', static function (): void {
            register_rest_route('meros-blocks/v1', '/query-search', [
                'methods' => 'POST',
                'permission_callback' => '__return_true',
                'callback' => [self::class, 'search'],
                'args' => [
                    'token' => ['type' => 'string', 'required' => true, 'maxLength' => 129],
                    'search' => ['type' => 'string', 'default' => '', 'maxLength' => 200],
                    'page' => ['type' => 'integer', 'default' => 1, 'minimum' => 1, 'maximum' => 10000],
                ],
            ]);
        });
    }

    public static function prepare(array $block): array {
        if (($block['blockName'] ?? '') !== 'core/query' || ($block['attrs']['merosLiveSearch'] ?? false) !== true) return $block;
        $defaults = \WP_Block_Type_Registry::get_instance()->get_registered('core/query')->attributes['query']['default'];
        $block['attrs']['query'] = array_replace($defaults, $block['attrs']['query'] ?? []);
        $block['attrs']['enhancedPagination'] = false;
        $block['attrs']['query']['meros_live_search'] = true;
        if (isset($block['attrs']['merosLiveSearchTerm'])) {
            $block['attrs']['query']['meros_live_search_title'] = $block['attrs']['merosLiveSearchTerm'];
        }
        $slot = 0;
        self::markChildren($block['innerBlocks'], $slot);
        return $block;
    }

    private static function markChildren(array &$blocks, int &$slot): void {
        foreach ($blocks as &$block) {
            if ($block['blockName'] === 'core/query') continue;
            if ($block['blockName'] === 'core/search') $block['attrs']['merosLiveQuerySearch'] = true;
            if (in_array($block['blockName'], ['core/post-template', 'core/query-pagination', 'core/query-no-results'], true)) {
                $block['attrs']['merosLiveQuerySlot'] = (string) $slot++;
                continue;
            }
            self::markChildren($block['innerBlocks'], $slot);
        }
        unset($block);
    }

    public static function queryVars(array $args, \WP_Block $block): array {
        if (empty($block->context['query']['meros_live_search'])) return $args;
        // AJAX must never broaden the public listing to drafts/private posts, even for signed-in visitors.
        $args['post_status'] = 'publish';
        $args['ignore_sticky_posts'] = true;
        if (isset($block->context['query']['meros_live_search_title'])) {
            $args['meros_live_search_title'] = $block->context['query']['meros_live_search_title'];
        }
        return $args;
    }

    public static function where(string $where, \WP_Query $query): string {
        $term = $query->get('meros_live_search_title');
        if (!is_string($term) || $term === '') return $where;
        global $wpdb;
        return $where . $wpdb->prepare(" AND {$wpdb->posts}.post_title LIKE %s", '%' . $wpdb->esc_like($term) . '%');
    }

    public static function markup(string $html, array $parsed, \WP_Block $block): string {
        if (in_array($parsed['blockName'], ['core/query-pagination-previous', 'core/query-pagination-next', 'core/query-pagination-numbers'], true)
            && !empty($block->context['query']['meros_live_search']) && !empty($block->context['query']['inherit'])) {
            $links = new \WP_HTML_Tag_Processor($html);
            while ($links->next_tag('A')) {
                $href = $links->get_attribute('href');
                if (is_string($href)) $links->set_attribute('data-meros-live-query-page', self::archivePage($href));
            }
            $html = $links->get_updated_html();
        }
        if (isset($parsed['attrs']['merosLiveQuerySlot'])
            && in_array($parsed['blockName'], ['core/post-template', 'core/query-pagination', 'core/query-no-results'], true)) {
            $slot = esc_attr($parsed['attrs']['merosLiveQuerySlot']);
            // Hidden sibling anchors preserve native direct-child layout selectors, including empty result regions.
            return '<template data-meros-live-query-slot="' . $slot . '"></template>' . $html . '<template data-meros-live-query-end="' . $slot . '"></template>';
        }
        if ($parsed['blockName'] === 'core/search' && !empty($parsed['attrs']['merosLiveQuerySearch'])) {
            $tags = new \WP_HTML_Tag_Processor($html);
            if ($tags->next_tag('FORM')) $tags->set_attribute('data-meros-live-query-search', '');
            return $tags->get_updated_html();
        }
        if (($parsed['blockName'] ?? '') !== 'core/query' || empty($parsed['attrs']['query']['meros_live_search'])) return $html;
        $tags = new \WP_HTML_Tag_Processor($html);
        if (!$tags->next_tag()) return $html;
        $tags->set_attribute('data-meros-live-query', '');
        $tags->set_attribute('data-meros-live-query-spinner-position', ($parsed['attrs']['merosLiveSearchSpinnerPosition'] ?? '') === 'below' ? 'below' : 'above');
        $inherited = !empty($parsed['attrs']['query']['inherit']);
        $tags->set_attribute('data-meros-live-query-page-key', $inherited ? 'paged' : (isset($parsed['attrs']['queryId']) ? 'query-' . $parsed['attrs']['queryId'] . '-page' : 'query-page'));
        if (!isset($parsed['attrs']['merosLiveSearchTerm'])) {
            $context = array_intersect_key($block->context, array_flip(['postId', 'postType', 'templateSlug']));
            $snapshot = ['block' => $parsed, 'context' => $context, 'url' => get_pagenum_link(1, false)];
            if ($inherited) $snapshot['archiveQuery'] = $GLOBALS['wp_query']->query_vars;
            $tags->set_attribute('data-meros-live-query-token', self::remember($snapshot));
            $tags->set_attribute('data-meros-live-query-endpoint', rest_url(self::ROUTE));
            $tags->set_attribute('data-meros-live-query-loading', __('Searching…', 'meros-blocks'));
            $tags->set_attribute('data-meros-live-query-complete', __('Results updated.', 'meros-blocks'));
            $tags->set_attribute('data-meros-live-query-error', __('Search failed. Please try again or reload the page.', 'meros-blocks'));
        }
        return $tags->get_updated_html();
    }

    public static function archivePage(string $url): int {
        $parts = wp_parse_url(html_entity_decode($url, ENT_QUOTES, 'UTF-8'));
        parse_str($parts['query'] ?? '', $query);
        if (isset($query['paged']) && is_scalar($query['paged'])) return max(1, (int) $query['paged']);
        global $wp_rewrite;
        $base = preg_quote($wp_rewrite->pagination_base, '~');
        if (preg_match("~/(?:{$base})/([0-9]+)/?$~", $parts['path'] ?? '', $matches)) return max(1, (int) $matches[1]);
        return 1;
    }

    public static function remember(array $snapshot): string {
        $id = hash('sha256', wp_json_encode($snapshot));
        set_transient('meros_query_' . $id, $snapshot, WEEK_IN_SECONDS);
        return $id . '.' . hash_hmac('sha256', $id, wp_salt('auth'));
    }

    public static function recall(string $token): array|\WP_Error {
        $parts = explode('.', $token);
        if (count($parts) !== 2 || !preg_match('/^[a-f0-9]{64}$/D', $parts[0])
            || !hash_equals(hash_hmac('sha256', $parts[0], wp_salt('auth')), $parts[1])) {
            return new \WP_Error('meros_query_invalid', __('Invalid search configuration. Reload the page.', 'meros-blocks'), ['status' => 403]);
        }
        $snapshot = get_transient('meros_query_' . $parts[0]);
        if (!is_array($snapshot)) return new \WP_Error('meros_query_expired', __('Search configuration expired. Reload the page.', 'meros-blocks'), ['status' => 410]);
        return $snapshot;
    }

    public static function search(\WP_REST_Request $request): array|\WP_Error {
        $snapshot = self::recall($request['token']);
        if ($snapshot instanceof \WP_Error) return $snapshot;
        $parsed = $snapshot['block'];
        $parsed['attrs']['merosLiveSearchTerm'] = sanitize_text_field($request['search']);
        $inherited = $parsed['attrs']['query']['inherit'] ?? true;
        if ($inherited && !isset($snapshot['archiveQuery'])) {
            return new \WP_Error('meros_query_invalid', __('Missing archive search configuration. Reload the page.', 'meros-blocks'), ['status' => 403]);
        }
        $key = $inherited ? 'paged' : (isset($parsed['attrs']['queryId']) ? 'query-' . $parsed['attrs']['queryId'] . '-page' : 'query-page');
        $previousGet = $_GET;
        $previousUri = $_SERVER['REQUEST_URI'] ?? '';
        $previousPost = $GLOBALS['post'] ?? null;
        $previousQuery = $GLOBALS['wp_query'];
        $previousMainQuery = $GLOBALS['wp_the_query'];
        $url = wp_parse_url($snapshot['url']);
        parse_str($url['query'] ?? '', $query);
        try {
            $_GET = $query;
            $_GET[$key] = $request['page'];
            $_SERVER['REQUEST_URI'] = ($url['path'] ?? '/') . '?' . http_build_query($_GET);
            if ($inherited) {
                $args = $snapshot['archiveQuery'];
                $args['paged'] = $request['page'];
                $args['post_status'] = 'publish';
                $args['meros_live_search_title'] = $parsed['attrs']['merosLiveSearchTerm'];
                if ($args['meros_live_search_title'] !== '') {
                    $args['ignore_sticky_posts'] = true;
                    $args['suppress_filters'] = false;
                }
                // Give native inherited cards and pagination a real main query with the captured archive constraints.
                $archive = new \WP_Query();
                $GLOBALS['wp_query'] = $GLOBALS['wp_the_query'] = $archive;
                $archive->query($args);
                $GLOBALS['post'] = $archive->post;
            } else {
                $GLOBALS['post'] = isset($snapshot['context']['postId']) ? get_post($snapshot['context']['postId']) : null;
                // Native cards/pagination reset postdata between renders. Keep exclude-current anchored to the page.
                $GLOBALS['wp_query'] = clone $previousQuery;
                $GLOBALS['wp_query']->post = $GLOBALS['post'];
            }
            if ($GLOBALS['post']) setup_postdata($GLOBALS['post']);
            $html = (new \WP_Block(self::prepare($parsed), $snapshot['context']))->render();
        } finally {
            $_GET = $previousGet;
            $_SERVER['REQUEST_URI'] = $previousUri;
            $GLOBALS['post'] = $previousPost;
            $GLOBALS['wp_query'] = $previousQuery;
            $GLOBALS['wp_the_query'] = $previousMainQuery;
            if ($previousPost) setup_postdata($previousPost);
        }
        return ['html' => $html];
    }
}
