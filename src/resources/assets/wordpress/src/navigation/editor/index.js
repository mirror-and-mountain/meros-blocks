import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { registerBlockVariation } from '@wordpress/blocks';

import { useNavigationAttributes, getNavigationAttributes } from './hooks/navigationAttributes.js';

import { NavigationControls } from './components/NavigationControls.js';
import { NavigationWrapper } from './components/NavigationWrapper.js';
import { NavigationSubmenuControls } from './components/NavigationSubmenuControls.js';
import { NavigationSubmenuWrapper } from './components/NavigationSubmenuWrapper.js';
import { NavigationLinkWrapper } from './components/NavigationLinkWrapper.js';

import { subscribeToNavChanges } from './utils/meros-nav.js';
import { initEditorScripts } from '../../utils/editor.js';
import { merosSetHeaderHeight } from '../helpers.js';
import './style.scss';

// Constants
const merosNavAttributes = getNavigationAttributes();

// Register Advanced Navigation Variation - Disabled for now
// registerBlockVariation('core/navigation', {
//     name: 'advanced-navigation',
//     title: __('Advanced Navigation', 'meros'),
//     description: __('A navigation block with advanced features including a customisable mobile menu.', 'meros'),
//     isActive: [ 'merosMenu.enabled', 'merosMenu.submenuSettings.type' ],
//     isDefault: false,
//     attributes: {
//         merosMenu: {
//             ...merosNavAttributes,
//             enabled: true,
//             submenuSettings: {
//                 ...merosNavAttributes.submenuSettings,
//                 type: 'default'
//             }
//         }
//     }
// });

// Register Advanced Navigation with Mega Menu Submenu Type
registerBlockVariation('core/navigation', {
    name: 'advanced-navigation-mega-menu',
    title: __('Advanced Navigation With Mega Menu', 'meros'),
    description: __('A navigation block with advanced features including a customisable mobile menu and mega-menu style submenus.', 'meros'),
    isActive: [ 'merosMenu.enabled', 'merosMenu.submenuSettings.type' ],
    isDefault: false,
    attributes: {
        merosMenu: {
            ...merosNavAttributes,
            enabled: true,
            submenuSettings: {
                ...merosNavAttributes.submenuSettings,
                type: 'mega-menu'
            }
        }
    },
    template: [
        [ 'meros/mega-menu-column' ]
    ]
});

wp.domReady(() => {
    // Add attributes to the navigation block
    addFilter('blocks.registerBlockType', 'meros/navigation-attributes', useNavigationAttributes);

    // Add controls to the inspector for the navigation block
    addFilter('editor.BlockEdit', 'meros/navigation-controls', NavigationControls);
    
    // Add controls to the inspector for the navigation submenu block
    addFilter('editor.BlockEdit', 'meros/navigation-submenu-controls', NavigationSubmenuControls);

    // Wrap the navigation block
    addFilter('editor.BlockListBlock', 'meros/navigation-wrapper', NavigationWrapper);

    // Wrap the navigation submenu block
    addFilter('editor.BlockListBlock', 'meros/navigation-submenu-wrapper', NavigationSubmenuWrapper);

    // Wrap the navigation link block
    addFilter('editor.BlockListBlock', 'meros/navigation-link-wrapper', NavigationLinkWrapper);

    // Set the header height CSS variable for the editor
    initEditorScripts(merosSetHeaderHeight);

    // Subscribe to menu changes
    initEditorScripts(subscribeToNavChanges);
});
