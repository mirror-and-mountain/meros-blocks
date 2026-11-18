<?php

namespace MM\Meros\Blocks;

class Filters {
    /**
     * Registers additional attributes for template-part blocks related to sticky elements and header animations.
     *
     * @param array  $args
     * @param string $name
     *
     * @return array
     */
    public static function registerTemplatePartFxAttributes(array $args, string $name): array {
        if ($name === 'core/template-part') {
            $args['attributes']['merosStickyElement'] = ['type' => 'object'];
            $args['attributes']['merosHeaderFx'] = ['type' => 'object'];
        }

        return $args;
    }

    /**
     * Renders the template-part block with sticky element and header animation classes and styles.
     *
     * @param string $html
     * @param array  $block
     *
     * @return string
     */
    public static function renderTemplatePartFx(string $html, array $block): string {
        $attributes = $block['attrs'] ?? [];
        $sticky = $attributes['merosStickyElement'] ?? [];
        $fx = $attributes['merosHeaderFx'] ?? [];
        $isSticky = ($sticky['enabled'] ?? false) === true;
        $hasFx = ($fx['enabled'] ?? false) === true;

        if (($attributes['tagName'] ?? '') !== 'header' || (!$isSticky && !$hasFx)) {
            return $html;
        }

        $processor = new \WP_HTML_Tag_Processor($html);
        if (!$processor->next_tag() || $processor->get_tag() !== 'HEADER') {
            return $html;
        }

        if ($isSticky) {
            $processor->add_class('meros-sticky-element');
            if (($sticky['removeHeaderBottomMargin'] ?? false) === true) {
                $processor->add_class('meros-header-no-bottom-margin');
            }
            if (($sticky['headerOffset'] ?? false) === true) {
                $processor->add_class('meros-header-offset');
            }
        }

        $styles = [];
        if ($hasFx) {
            $processor->add_class('meros-has-block-animation');
            $processor->add_class('meros-has-header-animation');
            foreach (['Bg' => 'bg', 'Text' => 'text', 'Link' => 'link', 'LinkHover' => 'link-hover'] as $setting => $role) {
                $start = $fx["headerAnimate{$setting}Color"] ?? '';
                $end = $fx["headerAnimate{$setting}ColorEnd"] ?? '';
                if (!is_string($start) || trim($start) === '' || strpbrk($start, ';{}') !== false) {
                    continue;
                }
                $startStyle = safecss_filter_attr("--meros-header-animate-{$role}-color-start:{$start}");
                if ($startStyle === '') {
                    continue;
                }
                $processor->add_class("meros-has-animated-{$role}-color");
                $styles[] = $startStyle;
                $end = is_string($end) && trim($end) !== '' && strpbrk($end, ';{}') === false ? $end : $start;
                $endStyle = safecss_filter_attr("--meros-header-animate-{$role}-color-end:{$end}");
                if ($endStyle !== '') {
                    $styles[] = $endStyle;
                }
            }

            $logo = $fx['headerAnimateLogoWidth'] ?? 1;
            if (is_numeric($logo) && (float) $logo > 0) {
                $factor = (float) $logo > 10 ? (float) $logo / 100 : (float) $logo;
                if (is_finite($factor) && abs($factor - 1) > 0.0001) {
                    $processor->add_class('meros-has-animated-logo-width');
                    $styles[] = "--meros-header-animated-logo-width:{$factor}";
                }
            }
        }

        if ($styles !== []) {
            $existing = rtrim((string) $processor->get_attribute('style'), "; \t\n\r");
            $processor->set_attribute('style', implode(';', array_filter([$existing, ...$styles])) . ';');
        }

        return $processor->get_updated_html();
    }

    /**
     * Renders blocks with Block FX enabled.
     *
     * @param string $block_content
     * @param array $block
     * @return string The modified block content.
     */
    public static function renderBlockFxBlocks(string $block_content, array $block): string {
        $hasScrollFx = isset($block['attrs']['merosScrollFx']['enabled']) &&
        $block['attrs']['merosScrollFx']['enabled'] === true;

        if ($hasScrollFx) {
            $swiperClass = $block['attrs']['merosScrollFx']['animateOnSlideChange'] ? 'meros-animate-on-slide-change' : '';
            return '<div class="meros-animation-wrapper ' . $swiperClass . '">' . $block_content . '</div>';
        }

        return $block_content;
    }
}