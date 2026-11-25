<?php

namespace MM\Meros\Contracts\Features\Components {
    final class DynamicBlock {
        public array $attributes = [];
        public array $supports = [];
        public array $variations = [];
        public function attribute(string $key, array $definition): void { $this->attributes[$key] = $definition; }
        public function supports(array $supports): void { $this->supports = $supports; }
        public function variations(array $variations): void { $this->variations = $variations; }
    }
}

namespace {
    function __(string $value, string $domain): string { return $value; }
    function get_block_wrapper_attributes(array $attributes): string { return json_encode($attributes, JSON_THROW_ON_ERROR); }
    function absint(mixed $value): int { return abs((int) $value); }
    function get_option(string $key, mixed $default): mixed { return $key === 'sticky_posts' ? [2, 4] : $default; }

    class WP_Query {
        public function __construct(private array $args) {}
        public function get(string $key): mixed { return $this->args[$key] ?? null; }
    }
    class WP_Block {
        public function __construct(public array $context) {}
    }
}
