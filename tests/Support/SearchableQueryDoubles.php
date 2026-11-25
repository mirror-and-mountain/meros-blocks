<?php

const WEEK_IN_SECONDS = 604800;
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
