import { subscribe, select } from '@wordpress/data';
import { initMobileMenu, cleanUpMobileMenu } from './mobile-menu.js';

import {
    enableSubmenuOpenOnClick,
    disableSubmenuOpenOnClick,
    enableSubmenuOpenOnHover,
    disableSubmenuOpenOnHover
} from '../../listeners.js'

function initNav(navBlockId, isMobile, doc, blockEditor) {
    // Get block
    const block = blockEditor.getBlock(navBlockId);
    if (!block) return;

    // Get attributes
    const attributes = block.attributes || {};
    const merosAttributes = attributes.merosMenu || null;

    if (!merosAttributes) return;

    // Bail if meros menu is not enabled
    if (!merosAttributes.enabled || !merosAttributes.menuInitialised) {
        return;
    }

    // Get block element
    const blockElement = doc.getElementById(`block-${navBlockId}`);
    if (!blockElement) return;

    // Get wrapper
    const wrapper = blockElement.closest('.meros-navigation-wrapper');
    if (!wrapper) return;

    // Get submenu type & click behaviour
    const submenuType = merosAttributes.submenuSettings?.type || 'default';

    // Update custom HTML areas
    const customMobileHTMLTop = merosAttributes.mobileSettings?.customHTMLTop || '';
    if (customMobileHTMLTop !== '') {
        const customHTMLArea = wrapper.querySelector('.meros-mobile-menu-top-content');
        if (customHTMLArea) {
            const innerHTML = customHTMLArea.innerHTML;
            if (innerHTML !== customMobileHTMLTop) {
                customHTMLArea.innerHTML = customMobileHTMLTop;
            }
        }
    }

    // Initialise mega menu if enabled
    if (submenuType === 'mega-menu') {
        initMegaMenu(wrapper, doc);
    }

    // Initialise mobile menu
    const mobileEnabled = merosAttributes.mobileSettings?.enabled ?? true;

    if (mobileEnabled && wrapper.dataset.merosMobileMenuInitialised !== 'true') {
        initMobileMenu(doc, wrapper);
    } else if (!mobileEnabled && wrapper.dataset.merosMobileMenuInitialised === 'true') {
        cleanUpMobileMenu(doc, wrapper);
    }

    if (!isMobile) {
        // Always on-click in the editor.
        enableSubmenuOpenOnClick(doc, wrapper);
    }
}

function initMegaMenu(wrapper, doc) {
    const initialised = wrapper?.dataset?.merosMegaMenuInitialised === 'true';
    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper.meros-mega-menu-wrapper');

    submenus.forEach(submenu => {
        let merosItemsContainer = submenu?.querySelector('.meros-mega-menu-items-container') || null;
        if (initialised && merosItemsContainer !== null) return;

        const wpItemsContainer = submenu.querySelector('.wp-block-navigation__submenu-container');
        if (!wpItemsContainer) return;

        merosItemsContainer = doc.createElement('div');
        merosItemsContainer.classList.add('meros-mega-menu-items-container');

        merosItemsContainer.appendChild(wpItemsContainer);
        submenu.appendChild(merosItemsContainer);

        wrapper.dataset.merosMegaMenuInitialised = 'true';
    });
}

export function subscribeToNavChanges({ doc }) {
    let merosNavUpdating = false;

    subscribe(() => {
        if (merosNavUpdating) return;

        const blockEditor = select('core/block-editor');

        const rootContainer = doc.querySelector('.is-root-container');
        if (!rootContainer) return;

        const isMobile = rootContainer.classList.contains('is-mobile-preview');

        const navBlocks = blockEditor.getBlocksByName('core/navigation') || [];
        if (!navBlocks.length) return;

        const handledNavBlocks = new Set();

        merosNavUpdating = true;

        navBlocks.forEach(navBlockId => {
            if (handledNavBlocks.has(navBlockId)) return;
            initNav(navBlockId, isMobile, doc, blockEditor);
            handledNavBlocks.add(navBlockId);
        });

        merosNavUpdating = false;
    });
}
