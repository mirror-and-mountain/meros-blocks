<?php

// Filter to modify the rendered output of the Navigation block
add_filter('render_block', function ($block_content, $block) {
    if ($block['blockName'] !== 'core/navigation') {
        return $block_content;
    }

    // Default settings
    $merosDefaultSettings = [
        'submenuSettings' => [
            'type' => 'default',
            'styles' => [
                'bgColor' => '#FFFFFF',
                'borderColor' => '#ABABAB',
                'borderWidth' => '1px',
                'dropShadow' => true,
                'titleColor' => '#5B5B5B',
                'titleSize' => '0.875rem',
                'titlePaddingX' => '16px',
                'titlePaddingY' => '16px',
                'itemColor' => '#000000',
                'itemHoverColor' => '#222222',
                'itemSize' => '1rem',
                'itemPaddingX' => '0px',
                'itemPaddingY' => '0px',
                'megaMenuColumnGap' => '80px',
                'megaMenuColumnAlignment' => 'start',
                'megaMenuFillSpace' => false,
                'megaMenuItemGap' => '0px'
            ]
        ],
        'mobileSettings' => [
            'enabled' => true,
            'breakpoint' => 768,
            'direction' => 'left',
            'underHeader' => false,
            'icon' => 'hamburger-1',
            'styles' => [
                'itemsGap' => '0px',
                'iconColor' => '#000000',
                'iconColorOpen' => '#000000',
                'showLogo' => true,
                'bgColor' => '#FFFFFF',
                'itemPaddingX' => '30px',
                'itemPaddingY' => '10px',
                'itemAlignment' => 'start',
                'itemTextColor' => '#000000',
                'itemTextHoverColor' => '#222222',
                'itemHighlightType' => 'none',
                'itemHighlightColor' => '#0693E3'
            ]
        ],
        'desktopSettings' => [
            'enabled' => true,
            'styles' => [
                'textColor' => '#000000',
                'textHoverColor' => '#222222',
                'itemBgColor' => '#FFFFFF00',
                'itemHoverBgColor' => '#e9e9e9',
                'submenuBgColor' => '#FFFFFF00',
                'submenuItemBgColor' => '#FFFFFF00',
                'submenuHoverBgColor' => '#e9e9e9',
                'submenuTextColor' => '#000000',
                'submenuTextHoverColor' => '#222222'
            ]
        ]
    ];

    // Get main settings
    $merosMenuSettings = isset($block['attrs']['merosMenu'])
        ? $block['attrs']['merosMenu']
        : [];

    if ($merosMenuSettings === []) {
        return $block_content;
    }

    // Get area settings
    $merosSubmenuSettings = $merosMenuSettings['submenuSettings'] ?? [];
    $merosMobileSettings  = $merosMenuSettings['mobileSettings'] ?? [];
    $merosDesktopSettings = $merosMenuSettings['desktopSettings'] ?? [];

    if ($merosSubmenuSettings === [] || $merosMobileSettings === [] || $merosDesktopSettings === []) {
        return $block_content;
    }

    $wrapperClasses = ['meros-navigation-wrapper'];
    $wrapperStyles  = [];

    // Handle onclick behaviour for submenus
    $submenuType = $merosSubmenuSettings['type'] ?? 'default';
    $submenuOpenOnClick = $block['attrs']['openSubmenusOnClick'] ?? false;

    if ($submenuOpenOnClick) {
        $wrapperClasses[] = 'meros-open-submenus-on-click';
    }

    // Handle mega menu specific styles
    if ($submenuType === 'mega-menu') {
        $fillSpace = $merosSubmenuSettings['styles']['megaMenuFillSpace'] ?? false;

        if ($fillSpace) {
            $wrapperClasses[] = 'meros-mega-menu-fill-space';
        }
    }

    // Handle mobile menu settings and styles
    $mobileBreakpoint = null;

    if ($merosMobileSettings['enabled'] ?? true) {
        // Set the breakpoint
        $mobileBreakpoint = $merosMobileSettings['breakpoint'] ?? 768;

        $direction  = $merosMobileSettings['direction'] ?? 'left';
        $icon       = $merosMobileSettings['icon'] ?? 'hamburger-1';

        $mobileStyles = $merosMobileSettings['styles'] ?? [];
        $itemAlignment = $mobileStyles['itemAlignment'] ?? 'start';
        $itemHighlightType = $mobileStyles['itemHighlightType'] ?? 'none';

        $wrapperClasses[] = 'meros-has-mobile-menu';
        $wrapperClasses[] = 'meros-mobile-menu-direction-' . esc_attr($direction);
        $wrapperClasses[] = 'meros-mobile-menu-item-alignment-' . esc_attr($itemAlignment);

        if ($itemHighlightType !== 'none') {
            $wrapperClasses[] = 'meros-mobile-menu-highlight-' . esc_attr($itemHighlightType);
        }

        foreach($mobileStyles as $key => $value) {
            if (in_array($key, array_keys($merosDefaultSettings['mobileSettings']['styles']), true)) {
                if ($value === $merosDefaultSettings['mobileSettings']['styles'][$key]) {
                    continue;
                }

                $property = '--' . \Illuminate\Support\Str::kebab('merosNavMobile' . ucfirst($key));
                $wrapperStyles[$property] = $value;
            }
        }
    }

    // Handle submenu styles
    foreach($merosSubmenuSettings['styles'] ?? [] as $key => $value) {
        if (in_array($key, array_keys($merosDefaultSettings['submenuSettings']['styles']), true)) {
            if ($value === $merosDefaultSettings['submenuSettings']['styles'][$key]) {
                continue;
            }

            $property = '--' . \Illuminate\Support\Str::kebab('merosNavSubmenu' . ucfirst($key));
            $wrapperStyles[$property] = $value;
        }
    }
    

    // Create wrapper for $block_content
    $renderedClasses = implode(' ', array_map('esc_attr', $wrapperClasses));
    $renderedStyles  = implode('; ', array_map(
        function ($k, $v) {
            return $k . ': ' . $v;
        },
        array_keys($wrapperStyles),
        $wrapperStyles
    ));

    $dataBreakpoint = $mobileBreakpoint ? 'data-meros-mobile-breakpoint="' . esc_attr($mobileBreakpoint) . '"' : '';
    $navWrapper = '<div class="' . esc_attr($renderedClasses) . '" style="' . esc_attr($renderedStyles) . '" ' . $dataBreakpoint . '>';
    
    // Add mobile menu toggle if enabled
    if ($merosMobileSettings['enabled'] ?? true) {
        $mobileIcon = '
            <div class="meros-navigation-mobile-toggle" role="button" aria-label="Toggle mobile menu" title="Toggle mobile menu">
                 <svg
                    class="meros-navigation-mobile-toggle-svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Menu Toggle"
                >
                    <path
                        class="meros-navigation-mobile-toggle-bar top"
                        d="M5 5v1.5h14V5H5z"
                    />
                    <path
                        class="meros-navigation-mobile-toggle-bar middle"
                        d="M5 12.8h14v-1.5H5v1.5z"
                    />
                    <path
                        class="meros-navigation-mobile-toggle-bar bottom"
                        d="M5 19h14v-1.5H5V19z"
                    />
                </svg>
            </div>
        ';
        $navWrapper .= $mobileIcon;

        // Load block content into DOMDocument
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $block_content);
        libxml_clear_errors();

        $wpNavEl = $dom->getElementsByTagName('nav')->item(0);
        $wpNavContainer = $wpNavEl->getElementsByTagName('ul')->item(0);

        // Create mobile navigation buttons
        if (str_contains($wpNavContainer->getAttribute('class'), 'wp-block-navigation__container')) {
            $navBtnWrapper = $dom->createElement('ul');
            $navBtnWrapper->setAttribute('class', 'meros-navigation-btns');

            $backBtn = $dom->createElement('li');
            $backBtn->setAttribute('class', 'meros-navigation-back-btn meros-navigation-btn');
            $backBtn->setAttribute('role', 'button');
            $backBtn->setAttribute('aria-label', 'Back to main menu');
            $backBtn->setAttribute('title', 'Back to main menu');
            $backBtnSvg = '
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15px" height="15px" aria-label="Back Icon" style="transform: rotate(180deg);">
                    <path d="M 9.9989971 4.9999848 A 1.0001 1.0001 0 1 0 8.5857864 6.4141935 L 13.171572 11 L 8.5857864 15.585807 A 1.0001 1.0001 0 1 0 10.000001 17 L 16.999998 11 L 10.000001 5 A 1.0001 1.0001 0 0 0 9.9989971 4.9999848 z"/>
                </svg>';
            
            $fragment = $dom->createDocumentFragment();
            $fragment->appendXML($backBtnSvg);
            $backBtn->appendChild($fragment);

            $closeBtn = $dom->createElement('li');
            $closeBtn->setAttribute('class', 'meros-navigation-close-btn meros-navigation-btn');
            $closeBtn->setAttribute('role', 'button');
            $closeBtn->setAttribute('aria-label', 'Close mobile menu');
            $closeBtn->setAttribute('title', 'Close mobile menu');
            $closeBtnSvg = '
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15px" height="15px" aria-label="Close Icon">
                    <path d="M 4.7070312 3.2929688 A 1.0001 1.0001 0 0 0 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 A 1.0001 1.0001 0 1 0 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 A 1.0001 1.0001 0 1 0 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 A 1.0001 1.0001 0 0 0 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z"/>
                </svg>';

            $fragment = $dom->createDocumentFragment();
            $fragment->appendXML($closeBtnSvg);
            $closeBtn->appendChild($fragment);

            $navBtnWrapper->appendChild($backBtn);
            $navBtnWrapper->appendChild($closeBtn);
            $wpNavContainer->prepend($navBtnWrapper);

            $block_content = $dom->saveHTML($wpNavEl);
        }
    }

    $navWrapper .= $block_content;
    $navWrapper .= '</div>';
    
    return $navWrapper;
}, 10, 2);

// Filter to modify the rendered output of the Navigation Submenu block
add_filter('render_block', function ($block_content, $block) {
    if ($block['blockName'] !== 'core/navigation-submenu') {
        return $block_content;
    }

    // Get Settings
    $url = $block['attrs']['url'] ?? '';
    $openInNewTab = $block['attrs']['openInNewTab'] ?? false;

    $merosSubmenuSettings = isset($block['attrs']['merosSubmenu'])
        ? $block['attrs']['merosSubmenu']
        : [];

    if ($merosSubmenuSettings === []) {
        return $block_content;
    }

    $submenuType = $merosSubmenuSettings['type'] ?? 'default';
    $dropShadow  = $merosSubmenuSettings['styles']['dropShadow'] ?? false;

    // Set wrapper classes
    $wrapperClasses = ['meros-submenu-wrapper'];

    if ($submenuType === 'mega-menu') {
        $wrapperClasses[] = 'meros-mega-menu-wrapper';
        
        if ($dropShadow) {
            $wrapperClasses[] = 'meros-mega-menu-has-shadow';
        }
    }

    // Load block content into DOMDocument
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $block_content);
    libxml_clear_errors();

    // Get first <li> element as wrapper
    $wrapper = $dom->getElementsByTagName('li')->item(0);
    
    if (!$wrapper) {
        return $block_content;
    }

    // Add classes to the wrapper <li> element
    $existingClasses = $wrapper->getAttribute('class');
    $classes = preg_split('/\s+/', $existingClasses, -1, PREG_SPLIT_NO_EMPTY) ?: [];

    // Merge classes
    foreach ($wrapperClasses as $newClass) {
        if (!in_array($newClass, $classes, true)) {
            $classes[] = $newClass;
        }
    }

    // Set the merged classes back to the wrapper
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

    // Modify submenu containers if mega-menu
    if ($submenuType === 'mega-menu') {
        $innerElements = $wrapper->getElementsByTagName('*');
        $wpItemWrapper = null;

        // Get the default WP submenu item wrapper
        foreach ($innerElements as $element) {
            $classes = $element->getAttribute('class');
            
            if (str_contains($classes, 'wp-block-navigation__submenu-container')) {
                $wpItemWrapper = $element;
                break;
            }
        }

        if ($wpItemWrapper !== null) {
            // Replace WP item wrapper UL tag with DIV
            $newDiv = $dom->createElement('div');
            $newDiv->setAttribute('class', $wpItemWrapper->getAttribute('class'));
            
            while ($wpItemWrapper->childNodes->length > 0) {
                $newDiv->appendChild($wpItemWrapper->childNodes->item(0));
            }
            
            $wpItemWrapper->parentNode->replaceChild($newDiv, $wpItemWrapper);
            $wpItemWrapper = $newDiv;

            // Wrap the new item wrapper with a mega menu wrapper
            $merosWrapper = $dom->createElement('div');
            $merosWrapper->setAttribute('class', 'meros-mega-menu-items-container');

            $merosWrapper->appendChild($wpItemWrapper);
            $wrapper->appendChild($merosWrapper);
        }
    }

    // Save and return the modified block content
    $block_content = $dom->saveHTML($wrapper);
    return $block_content;
}, 10, 2);

// Filter to modify the rendered output of the Navigation Link block
add_filter('render_block', function ($block_content, $block) {
    if ($block['blockName'] !== 'core/navigation-link') {
        return $block_content;
    }

    // Get Settings
    $merosMenuItemType = isset($block['attrs']['merosMenuItem']['type'])
        ? $block['attrs']['merosMenuItem']['type']
        : 'dropdown-item';

    // Set wrapper classes
    $wrapperClasses = [];

    if ($merosMenuItemType === 'default-item') {
        $wrapperClasses[] = 'meros-default-item';
        $wrapperClasses[] = 'meros-submenu-item';
    }
    else if ($merosMenuItemType === 'dropdown-item') {
        $wrapperClasses[] = 'meros-dropdown-item';
        $wrapperClasses[] = 'meros-submenu-item';
    } else if ($merosMenuItemType === 'mega-menu-item') {
        $wrapperClasses[] = 'meros-mega-menu-item';
        $wrapperClasses[] = 'meros-submenu-item';
    } else if ($merosMenuItemType === 'top-level-item') {
        $wrapperClasses[] = 'meros-top-level-item';
    }

    // Load block content into DOMDocument
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $block_content);
    libxml_clear_errors();

    // Get first <li> element as wrapper
    $wrapper = $dom->getElementsByTagName('li')->item(0);
    if (!$wrapper) {
        return $block_content;
    }

    // Add classes to the wrapper <li> element
    $existingClasses = $wrapper->getAttribute('class');
    $classes = preg_split('/\s+/', $existingClasses, -1, PREG_SPLIT_NO_EMPTY) ?: [];

    foreach ($wrapperClasses as $newClass) {
        if (!in_array($newClass, $classes, true)) {
            $classes[] = $newClass;
        }
    }

    $wrapper->setAttribute('class', implode(' ', $classes));

    // Save and return the modified block content
    $block_content = $dom->saveHTML($wrapper);
    return $block_content;
}, 10, 2);

// Filter to add custom attributes to the Navigation Link block
add_filter( 'register_block_type_args', function( $args, $name ) {
    if ( 'core/navigation-link' !== $name ) {
        return $args;
    }

    $args['attributes']['merosMenuItem'] = [
        'type'    => 'object',
        'default' => [
            'type' => 'dropdown-item'
        ],
    ];

    return $args;
}, 10, 2 );
