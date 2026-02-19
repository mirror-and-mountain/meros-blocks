import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

import { useNavigationAttributes } from './hooks/navigationAttributes.js';

import { NavigationControls } from './components/NavigationControls.js';
import { NavigationWrapper } from './components/NavigationWrapper.js';
import { NavigationSubmenuWrapper } from './components/NavigationSubmenuWrapper.js';
import { NavigationLinkWrapper } from './components/NavigationLinkWrapper.js';

import { subscribeToNavChanges } from './utils/meros-nav.js';
import { initEditorScripts } from '../../utils/editor.js';
import './style.scss';

wp.domReady(() => {
    // Add attributes to the navigation block
    addFilter('blocks.registerBlockType', 'meros/navigation-attributes', useNavigationAttributes);

    // Add controls to the inspector for the navigation block
    addFilter('editor.BlockEdit', 'meros/navigation-controls', NavigationControls);

    // Wrap the navigation block
    addFilter('editor.BlockListBlock', 'meros/navigation-wrapper', NavigationWrapper);

    // Wrap the navigation submenu block
    addFilter('editor.BlockListBlock', 'meros/navigation-submenu-wrapper', NavigationSubmenuWrapper);

    // Wrap the navigation link block
    addFilter('editor.BlockListBlock', 'meros/navigation-link-wrapper', NavigationLinkWrapper);

    // Subscribe to menu changes
    initEditorScripts(subscribeToNavChanges);
});
