<?php

namespace MM\Meros\Blocks;

use DOMDocument;
use Illuminate\Support\Str;
use MM\Meros\Helpers\Theme\Filters;

class MerosBlocksFilters extends Filters {
    /**
     * The default attributes used by navigation blocks in 
     * Advanced Nav.
     *
     * @var array
     */
    private array $navDefaultAttribitutes = [
        'submenuSettings' => [
            'type' => 'default'
        ],
        
        'mobileSettings' => [
            'enabled' => true,
            'breakpoint' => 768,
            'direction' => 'left',
            'underHeader' => false,
            'icon' => 'hamburger-1',
            'styles' => [
                'width' => '80%',
                'maxWidth' => '320px',
                'shadow' => true,
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
                'borderColor' => '#ABABAB',
                'borderWidth' => '1px',
                'itemsGap' => '0px',
                'itemsJustification' => 'start',
                'itemPaddingX' => '10px',
                'itemPaddingY' => '0px',
                'itemTextColor' => '#000000',
                'itemTextHoverColor' => '#222222',
                'itemHighlightType' => 'none',
                'itemHighlightColor' => '#0693E3',
                'itemHighlightBorderWidth' => '1px',
            ]
        ]
    ];

    /**
     * The default attributes used by submenu blocks in
     * Advanced Nav.
     *
     * @var array
     */
    private array $navSubmenuDefaultAttributes = [
        'type' => 'default',
        'styles' => [
            'topOffset' => '100%',
            'belowHeader' => false,
            'bgColor' => '#FFFFFF',
            'borderColor' => '#ABABAB',
            'borderWidth' => '0px',
            'itemBorderColor' => '#FFFFFF00',
            'itemBorderWidth' => '0px',
            'dropShadow' => true,
            'itemTextColor' => '#000000',
            'itemTextHoverColor' => '#222222',
            'itemPaddingX' => '0px',
            'itemPaddingY' => '0px',
            'itemHighlightType' => 'none',
            'itemHighlightColor' => '#0693E3',
            'itemHighlightBorderWidth' => '1px',
            'titleColor' => '#5B5B5B',
            'titleSize' => '0.875rem',
            'titlePaddingX' => '16px',
            'titlePaddingY' => '16px',
            'megaMenuColumnGap' => '80px',
            'megaMenuColumnAlignment' => 'start',
            'megaMenuFillSpace' => false,
            'megaMenuItemGap' => '0px'
        ]
    ];

    /**
     * Registers filters for this feature.
     *
     * @return void
     */
    public function register(): void {
        // Feature filters
        $this->add($this->hookPrefix . '_block_fx_is_experimental', '__return_true');
        $this->add($this->hookPrefix . '_advanced_navigation_is_experimental', '__return_true');
        $this->add($this->hookPrefix . '_mega_menu_column_is_switchable', '__return_false');

        // Nav filters
        $this->add('render_block', [$this, 'renderAdvancedNav'], 10, 2);
        $this->add('render_block', [$this, 'renderAdvancedNavSubmenu'], 10, 2);
        $this->add('render_block', [$this, 'renderAdvancedNavLink'], 10, 2);
        $this->add('register_block_type_args', [$this, 'registerAdvancedNavArgs'], 10, 2);

        // Block FX filters
        $this->add('render_block', [$this, 'renderBlockFxBlocks'], 10, 2);
    }

    /**
     * Renders the Advanced Navigation Block Variation
     *
     * @param string $block_content The content of the block.
     * @param array $block The block data.
     * @return string The modified block content.
     */
    public function renderAdvancedNav(string $block_content, array $block): string {
        if ($block['blockName'] !== 'core/navigation') {
            return $block_content;
        }

        // Default settings
        $merosDefaultSettings = $this->navDefaultAttribitutes;

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
        $submenuOpenOnClick = $block['attrs']['openSubmenusOnClick'] ?? false;

        if ($submenuOpenOnClick) {
            $wrapperClasses[] = 'meros-open-submenus-on-click';
        }

        // Handle desktop menu styles
        $desktopStyles = $merosDesktopSettings['styles'] ?? [];
        $desktopItemHighlightType = $desktopStyles['itemHighlightType'] ?? 'none';
        $wrapperClasses[] = 'meros-desktop-menu-highlight-' . esc_attr($desktopItemHighlightType);

        foreach ($desktopStyles as $key => $value) {
            if (in_array($key, array_keys($merosDefaultSettings['desktopSettings']['styles']), true)) {
                if ($value === '' ||
                    $value === $merosDefaultSettings['desktopSettings']['styles'][$key] ||
                    $key === 'itemsJustification' ||
                    $key === 'itemHighlightType'
                ) {
                    continue;
                }

                $property = '--' . Str::kebab('merosNavDesktop' . ucfirst($key));
                $wrapperStyles[$property] = $value;
            }
        }

        // Handle mobile menu settings and styles
        $mobileBreakpoint = null;

        if ($merosMobileSettings['enabled'] ?? true) {
            // Set the breakpoint
            $mobileBreakpoint = $merosMobileSettings['breakpoint'] ?? 768;

            $width       = $merosMobileSettings['styles']['width'] ?? '80%';
            $direction   = $merosMobileSettings['direction'] ?? 'left';
            $underHeader = $direction === 'top' && $merosMobileSettings['underHeader'] === true;
            $icon        = $merosMobileSettings['icon'] ?? 'hamburger-1';

            $mobileStyles = $merosMobileSettings['styles'] ?? [];
            $itemAlignment = $mobileStyles['itemAlignment'] ?? 'start';
            $itemHighlightType = $mobileStyles['itemHighlightType'] ?? 'none';
            $mobileShadow = $direction !== 'top' && $mobileStyles['boxShadow'] === true;

            $wrapperClasses[] = 'meros-has-mobile-menu';
            $wrapperClasses[] = 'meros-mobile-menu-direction-' . esc_attr($direction);
            $wrapperClasses[] = 'meros-mobile-menu-item-alignment-' . esc_attr($itemAlignment);

            if ($itemHighlightType !== 'none') {
                $wrapperClasses[] = 'meros-mobile-menu-highlight-' . esc_attr($itemHighlightType);
            }

            if ($underHeader) {
                $wrapperClasses[] = 'meros-mobile-menu-under-header';
            }

            if ($mobileShadow) {
                $wrapperClasses[] = 'meros-mobile-menu-has-shadow';
            }

            if ($width === '100%') {
                $wrapperClasses[] = 'meros-mobile-menu-full-width';
            }

            foreach ($mobileStyles as $key => $value) {
                if (in_array($key, array_keys($merosDefaultSettings['mobileSettings']['styles']), true)) {
                    if ($value === '' ||
                        $value === $merosDefaultSettings['mobileSettings']['styles'][$key] ||
                        $key === 'itemAlignment' ||
                        $key === 'itemHighlightType' ||
                        $key === 'showLogo' ||
                        $key === 'boxShadow'
                    ) {
                        continue;
                    }

                    $property = '--' . Str::kebab('merosNavMobile' . ucfirst($key));
                    $wrapperStyles[$property] = $value;
                }
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
    }

    /**
     * Renders submenu blocks used in the Advanced Navigation
     * Block Variation.
     *
     * @param string $block_content The content of the block.
     * @param array $block The block data.
     * @return string The modified block content.
     */
    public function renderAdvancedNavSubmenu(string $block_content, array $block): string {
        if ($block['blockName'] !== 'core/navigation-submenu') {
            return $block_content;
        }

        $merosDefaultSettings = $this->navSubmenuDefaultAttributes;

        // Get Settings
        $url = $block['attrs']['url'] ?? '';
        $openInNewTab = $block['attrs']['openInNewTab'] ?? false;

        $merosSubmenuSettings = isset($block['attrs']['merosSubmenu'])
            ? $block['attrs']['merosSubmenu']
            : [];

        // Fallback to default settings if not set
        if ($merosSubmenuSettings === []) {
            $merosSubmenuSettings = $merosDefaultSettings;
        }

        $submenuType = $merosSubmenuSettings['type'] ?? 'default';
        $styles = $merosSubmenuSettings['styles'] ?? [];

        // Set wrapper classes / styles
        $wrapperClasses = ['meros-submenu-wrapper', 'meros-submenu'];
        $wrapperStyles = [];

        // Classes
        $wrapperClasses[] = 'meros-submenu-highlight-' . esc_attr($styles['itemHighlightType']);
        
        if ($submenuType === 'mega-menu') {
            $wrapperClasses[] = 'meros-mega-menu-wrapper';

            if ($styles['megaMenuFillSpace'] ?? false) {
                $wrapperClasses[] = 'meros-mega-menu-fill-space';
            }

            if ($styles['dropShadow'] ?? false) {
                $wrapperClasses[] = 'meros-mega-menu-has-shadow';
            }
        } else {
            if ($styles['belowHeader'] ?? false) {
                $wrapperClasses[] = 'meros-submenu-below-header';
            }
            
        }

        // Styles
        foreach ($styles as $key => $value) {
            if (in_array($key, array_keys($merosDefaultSettings['styles']), true)) {
                if ($value === '' ||
                    $value === $merosDefaultSettings['styles'][$key] ||
                    $key === 'itemHighlightType' ||
                    $key === 'megaMenuFillSpace' ||
                    $key === 'dropShadow' ||
                    $key === 'belowHeader'
                ) {
                    continue;
                }

                $property = '--' . Str::kebab('merosNavSubmenu' . ucfirst($key));
                $wrapperStyles[$property] = $value;
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

        // Add classes/styles to the wrapper <li> element
        $existingClasses = $wrapper->getAttribute('class');
        $existingStyles = $wrapper->getAttribute('style');
        $classes = preg_split('/\s+/', $existingClasses, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $styles = preg_split('/;/', $existingStyles, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        // Merge classes/styles
        foreach ($wrapperClasses as $newClass) {
            if (!in_array($newClass, $classes, true)) {
                $classes[] = $newClass;
            }
        }

        foreach ($wrapperStyles as $property => $value) {
            $styleString = $property . ': ' . $value;
            if (!in_array($styleString, $styles, true)) {
                $styles[] = $styleString;
            }
        }

        // Set the merged classes/styles back to the wrapper
        $wrapper->setAttribute('class', implode(' ', $classes));
        $wrapper->setAttribute('style', implode(';', $styles));

        // Add link to button if URL exists
        if ($url !== '') {
            $wrapper->setAttribute('role', 'link');
            if ($openInNewTab) {
                $wrapper->setAttribute('data-action', 'window.open("' . esc_url($url) . '", "_blank")');
            } else {
                $wrapper->setAttribute('data-action', 'window.location.href="' . esc_url($url) . '"');
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
    }

    /**
     * Renders navivation link blocks used in the Advanced Navigation
     * Block Variation.
     *
     * @param string $block_content The content of the block.
     * @param array $block The block data.
     * @return string The modified block content.
     */
    public function renderAdvancedNavLink(string $block_content, array $block): string {
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
    }

    /**
     * Registers addition args for navigation-link and submenu blocks for
     * use in the Advanced Navigation Block Variation.
     *
     * @param array $args The block args.
     * @param string $name The block name.
     * @return array The modified args
     */
    public function registerAdvancedNavArgs(array $args, string $name): array {
         if ( $name === 'core/navigation-link' ) {
            $args['attributes']['merosMenuItem'] = [
                'type'    => 'object',
                'default' => [
                    'type' => 'dropdown-item'
                ],
            ];
        }

        if ( $name === 'core/navigation-submenu' ) {
            $args['attributes']['merosSubmenu'] = [
                'type'    => 'object',
                'default' => $this->navSubmenuDefaultAttributes
            ];
        }
        
        return $args;
    }

    /**
     * Renders blocks with Block FX enabled.
     *
     * @param string $block_content
     * @param array $block
     * @return string The modified block content.
     */
    public function renderBlockFxBlocks(string $block_content, array $block): string {
        $hasScrollFx = isset($block['attrs']['merosScrollFx']['enabled']) &&
        $block['attrs']['merosScrollFx']['enabled'] === true;

        if ($hasScrollFx) {
            $swiperClass = $block['attrs']['merosScrollFx']['animateOnSlideChange'] ? 'meros-animate-on-slide-change' : '';
            return '<div class="meros-animation-wrapper ' . $swiperClass . '">' . $block_content . '</div>';
        }

        return $block_content;
    }
}