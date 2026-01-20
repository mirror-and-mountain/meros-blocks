import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { addMerosControls } from './block-mods/add-meros-controls.js';
import { addMerosNavigationWrapper } from './block-mods/add-meros-navigation-wrapper.js';

import { initEditorScripts } from '../editorUtils.js';
import './style.scss';

// Add advanced menu attributes to the navigation block
const addNavigationAttributes = (settings, name) => {
    if (name !== 'core/navigation') return settings;
    return {
        ...settings,
        allowedBlocks: [
            "core/navigation-link",
            "core/search",
            "core/social-links",
            "core/page-list",
            "core/spacer",
            "core/home-link",
            "core/site-title",
            "core/site-logo",
            "core/navigation-submenu",
            "core/loginout",
            "core/buttons"
        ],
        attributes: {
            ...settings.attributes,
            merosMobileMenu: {
                "type": "object",
                "default": {
                    "enabled": true,
                    "preview": true,
                    "breakpoint": 768,
                    "itemsGap": 0,
                    "direction": "left",
                    "underHeader": false,
                    "icon": "hamburger-1",
                    "iconColor": "#000000",
                    "showLogo": true,
                    "bgColor": "#FFFFFF",
                    "textColor": "#000000",
                    "textHoverColor": "#f0f0f0",
                    "itemPaddingX": 10,
                    "itemPaddingY": 10,
                    "itemBgColor": "#FFFFFF",
                    "itemHoverBgColor": "#f0f0f0",
                    "submenuBgColor": "#FFFFFF",
                    "submenuItemBgColor": "#FFFFFF",
                    "submenuHoverBgColor": "#f0f0f0",
                    "submenuTextColor": "#000000",
                    "submenuTextHoverColor": "#f0f0f0",
                }
            },
            "merosDesktopMenu": {
                "type": "object",
                "default": {
                    "enabled": false,
                    "bgColor": "#FFFFFF",
                    "textColor": "#000000",
                    "textHoverColor": "#f0f0f0",
                    "itemPadding": { "top": 10, "right": 15, "bottom": 10, "left": 15 },
                    "itemBgColor": "#FFFFFF",
                    "itemHoverBgColor": "#f0f0f0",
                    "submenuBgColor": "#FFFFFF",
                    "submenuHoverBgColor": "#f0f0f0",
                    "submenuTextColor": "#000000",
                    "submenuTextHoverColor": "#f0f0f0",
                }
            }
        }
    };
};

wp.domReady(() => {
    // Add attributes to the navigation block
    addFilter('blocks.registerBlockType', 'meros/navigation-attributes', addNavigationAttributes);

    // Add controls to the inspector for the navigation block
    addFilter('editor.BlockEdit', 'meros/navigation-controls', addMerosControls);

    // Wrap the navigation block in a custom wrapper for editor display
    addFilter('editor.BlockListBlock', 'meros/navigation-wrapper', addMerosNavigationWrapper);

    const mobileMenuHandler = ({ doc }) => {
        const wrappers = doc.querySelectorAll('.meros-navigation-wrapper');
        wrappers.forEach((wrapper) => {
            const container = wrapper.querySelector('nav');
            if (!container) return;

            const mobileIcon = wrapper.querySelector('.meros-navigation-mobile-icon');
            if (!mobileIcon) return;

            // Toggle mobile menu open class on click
            mobileIcon.addEventListener('click', () => {
                if (wrapper.classList.contains('meros-mobile-menu-open')) {
                    const isOpenOnClick = wrapper.dataset.openOnClick === 'true';
                    if (!isOpenOnClick) {
                        const submenus = wrapper.querySelectorAll('.wp-block-navigation-submenu');
                        submenus.forEach((submenu) => {
                            submenu.classList.remove('open-on-click');
                        });
                    }

                    mobileIcon.classList.remove('open');

                    wrapper.classList.remove('meros-mobile-menu-open');
                    wrapper.classList.add('meros-mobile-menu-closing');

                    setTimeout(() => {
                        wrapper.classList.remove('meros-mobile-menu-closing');
                    }, 400);
                } 
                
                else {
                    mobileIcon.classList.add('open');
                    const isOpenOnClick = wrapper.dataset.openOnClick === 'true';
                    if (!isOpenOnClick) {
                        const submenus = wrapper.querySelectorAll('.wp-block-navigation-submenu');
                        submenus.forEach((submenu) => {
                            submenu.classList.add('open-on-click');
                        });
                    }
                    wrapper.classList.add('meros-mobile-menu-open');
                }
            });

            // const justificationObserver = new MutationObserver(() => {
            //     const styles = getComputedStyle(container);
            //     const justification = styles.getPropertyValue('justify-content') || 'flex-start';
            //     wrapper.style.setProperty('--meros-mobile-menu-justification', justification);
            // });
            // justificationObserver.observe(container, { attributes: true, attributeFilter: ['style', 'class'] });
        });

    };
    initEditorScripts(mobileMenuHandler);
});
