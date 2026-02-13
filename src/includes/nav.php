<?php

add_filter('render_block', function ($block_content, $block) {
    if ($block['blockName'] !== 'core/navigation') {
        return $block_content;
    }

    $wrapperClasses = ['meros-navigation-wrapper'];
    $wrapperStyles  = [];

    $merosMenu = isset($block['attrs']['merosMenu'])
        ? $block['attrs']['merosMenu']
        : [];

    if ($merosMenu === []) {
        return $block_content;
    }

    $submenuType = $merosMenu['submenuType'] ?? 'dropdown';
    $submenuOpenOnClick = $block['attrs']['openSubmenusOnClick'] ?? false;

    if ($submenuOpenOnClick) {
        $wrapperClasses[] = 'meros-open-submenus-on-click';
    }
    
    $megaMenu = $submenuType === 'mega-menu' 
        ? ($merosMenu['megaMenu'] ?? [])
        : [];

    $mobileSettings = $merosMenu['mobileSettings'] ?? [];
    $mobileEnabled = $mobileSettings['enabled'] ?? false;

    if ($mobileEnabled) {
        $wrapperClasses[] = 'meros-has-mobile-menu';
        $animationDirection = $mobileSettings['direction'] ?? 'left';
        $wrapperClasses[] = 'meros-mobile-menu-direction-' . esc_attr($animationDirection);
        
        $defaultStyles = [
            'bgColor'               => '#ffffff',
            'iconColor'             => '#000000',
            'iconColorOpen'         => '#000000',
            'itemAlignment'         => 'flex-start',
            'itemBgColor'           => '#ffffff00',
            'itemHoverBgColor'      => '#ffffff00',
            'itemPaddingX'          => '15px',
            'itemPaddingY'          => '10px',
            'itemsGap'              => '0px',
            'submenuBgColor'        => '#ffffff00',
            'submenuHoverBgColor'   => '#e9e9e9',
            'submenuItemBgColor'    => '#ffffff00',
            'submenuTextColor'      => '#000000',
            'submenuTextHoverColor' => '#222222',
            'textColor'             => '#000000',
            'textHoverColor'        => '#000000',
        ];

        $savedStyles = $mobileSettings['styles'] ?? [];
        foreach ($savedStyles as $key => $value) {
            if (in_array($key, array_keys($defaultStyles), true)) {
                if ($value === $defaultStyles[$key]) {
                    continue;
                }
                $property = '--' . \Illuminate\Support\Str::kebab('merosMobileMenu' . ucfirst($key));
                $wrapperStyles[$property] = $value;
            }
        }
    }

    return '<div class="' . esc_attr(implode(' ', $wrapperClasses)) . '" style="' . 
        esc_attr(
            implode(
                '; ',
                array_map(
                    function ($k, $v) {
                        return $k . ': ' . $v;
                    },
                    array_keys($wrapperStyles),
                    $wrapperStyles
                )
            )
        ) . '">' . $block_content . '</div>';
}, 10, 2);


add_filter('render_block', function ($block_content, $block) {
    if ($block['blockName'] !== 'core/navigation-submenu') {
        return $block_content;
    }

    // Handle link
    $url = $block['attrs']['url'] ?? '';
    $openInNewTab = $block['attrs']['opensInNewTab'] ?? false;

    // Outer wrapper classes and mega menu titles.
    $wrapperClasses  = ['meros-submenu-wrapper'];
    $megaMenuTitles  = [];
    $isMerosMegaMenu = $block['attrs']['merosSubmenu']['type'] === 'mega-menu' ?? false;
    if ($isMerosMegaMenu) {
        $wrapperClasses[] = 'meros-mega-menu-wrapper';
        $megaMenuColumns = $block['attrs']['merosSubmenu']['megaMenu']['columns'] ?? 3;
        $megaMenuTitles = $block['attrs']['merosSubmenu']['megaMenu']['columnTitles'] ?? [];
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $block_content);
    libxml_clear_errors();

    $wrapper = $dom->getElementsByTagName('li')->item(0);
    
    if (!$wrapper) {
        return $block_content;
    }

    // Add classes to the wrapper <li> element
    $existingClasses = $wrapper->getAttribute('class');
    $classes = preg_split('/\s+/', $existingClasses, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    foreach ($wrapperClasses as $new_class) {
        if (!in_array($new_class, $classes, true)) {
            $classes[] = $new_class;
        }
    }
    $wrapper->setAttribute('class', implode(' ', $classes));

    // Add link to button if URL exists
    if ($url !== '') {
        $button = $wrapper->getElementsByTagName('button')->item(0);
        if ($button) {
            $button->setAttribute('role', 'link');
            if ($openInNewTab) {
                $button->setAttribute('data-action', 'window.open("' . esc_url($url) . '", "_blank")');
            } else {
                $button->setAttribute('data-action', 'window.location.href="' . esc_url($url) . '"');
            }
        }
    }

    
    // Add column titles to mega menu submenus.
    if ($isMerosMegaMenu) {
        $xpath = new DOMXPath($dom);
        $uls = $xpath->query(
            '//ul[contains(concat(" ", normalize-space(@class), " "), " wp-block-navigation__submenu-container ")]'
        );

        foreach ($uls as $ul) {
            // Add a wrapper around the container
            $innerWrapper = $dom->createElement('div');
            $innerWrapper->setAttribute('class', 'meros-mega-menu-submenu-container');
            $wrapper->appendChild($innerWrapper);
            $innerWrapper->appendChild($ul);

            // If mega menu, add titles.
            if ($megaMenuTitles !== []) {
                for ($i = 1; $i <= $megaMenuColumns; $i++) {
                    $text = $megaMenuTitles['column' . $i] ?? '';
                    if ($text === '') {
                        continue;
                    }
                    
                    $title_li = $dom->createElement('li', htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
                    $title_li->setAttribute('class', 'meros-mega-menu-column-title');
                    $title_li->setAttribute('style', 'grid-column: ' . ($i) . ';');
                    $ul->appendChild($title_li);
                }
            }
        }
    }

    // Save and return the modified block content
    $block_content = $dom->saveHTML($wrapper);
    return $block_content;
}, 10, 2);

add_filter('render_block', function ($block_content, $block) {
    if ($block['blockName'] !== 'core/navigation-link') {
        return $block_content;
    }
    
    $isInMegaMenu = $block['attrs']['merosMenuItem']['type'] === 'mega-menu-item' ?? false;
    if ($isInMegaMenu) {
        $megaMenuColumnIndex = $block['attrs']['merosMenuItem']['megaMenu']['columnIndex'] ?? 1;

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $block_content);
        libxml_clear_errors();

        // The block renders a single root <li>, so just grab that element.
        $li = $dom->getElementsByTagName('li')->item(0);

        if ($li instanceof DOMElement) {
            // Append the CSS custom property to the existing style attribute.
            $style = $li->getAttribute('style');
            $style .= ($style ? ' ' : '');
            $style .= 'grid-column: ' . intval($megaMenuColumnIndex) . ';';
            $li->setAttribute('style', $style);
            $existing_classes = $li->getAttribute('class');
            $classes = preg_split('/\s+/', $existing_classes, -1, PREG_SPLIT_NO_EMPTY) ?: [];

            if (!in_array('meros-submenu-item', $classes, true)) {
                $classes[] = 'meros-submenu-item';
                $classes[] = 'meros-mega-menu-item';
            }

            $li->setAttribute('class', implode(' ', $classes));

            // Save only the <li> node so we avoid any wrapper markup.
            $block_content = $dom->saveHTML($li);
        }
    }

    return $block_content;
}, 10, 2);


add_filter( 'register_block_type_args', function( $args, $name ) {
    if ( 'core/navigation-link' !== $name ) {
        return $args;
    }

    $args['attributes']['merosMenuItem'] = [
        'type'    => 'object',
        'default' => [
            'type' => 'dropdown-item',
            'megaMenu' => [
                'columnIndex' => 1
            ]
        ],
    ];

    return $args;
}, 10, 2 );