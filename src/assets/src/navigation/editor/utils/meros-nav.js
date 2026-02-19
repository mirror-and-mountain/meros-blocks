import { subscribe, select } from '@wordpress/data';
import { initMegaMenu, cleanUpMegaMenu } from './mega-menu.js';
import { initMobileMenus, cleanUpMobileMenus } from './mobile-menu.js';
import { 
    enableSubmenuOpenOnClick, 
    disableSubmenuOpenOnClick,
    enableSubmenuOpenOnHover, 
    disableSubmenuOpenOnHover 
} from '../utils/listeners.js';

function initMerosNav(doc, rootContainer, navBlock, submenuType, submenus, isMobile) {
    submenus.forEach(submenu => {
        initSubmenu(doc, submenu, submenuType);
    });

    const navEl = doc.getElementById(`block-${navBlock.clientId}`);
    const wrapper = navEl?.closest('.meros-navigation-wrapper');
    if (!wrapper) return;

    const mobileMenuEnabled = navBlock?.attributes?.merosMenu?.mobileSettings?.enabled ?? true;
    const openSubmenusOnClick = navBlock?.attributes?.openSubmenusOnClick ?? false;

    if (!isMobile) {
        if (openSubmenusOnClick) {
            disableSubmenuOpenOnHover(doc, wrapper);
            enableSubmenuOpenOnClick(doc, wrapper);
        } else {
            disableSubmenuOpenOnClick(doc, wrapper);
            enableSubmenuOpenOnHover(doc, wrapper);
        }
    }

    if (mobileMenuEnabled && wrapper.dataset.merosMobileMenuInitialised !== 'true') {
        initMobileMenus(doc, rootContainer);
    }

    if (!mobileMenuEnabled && wrapper.dataset.merosMobileMenuInitialised === 'true') {
        cleanUpMobileMenus(doc, rootContainer);
    }
}

function initSubmenu(doc, submenu, submenuType) {
    const clientId = submenu.clientId;
    const innerBlocks = submenu.innerBlocks || [];

    if (submenuType === 'default') {
        initDefaultSubmenu(doc, innerBlocks, clientId);
    }

    if (submenuType === 'mega-menu') {
        initMegaMenu(doc, innerBlocks, clientId);
    }
}

function initDefaultSubmenu(doc, innerBlocks, clientId) {
    const blockElement = doc.getElementById(`block-${clientId}`);
    const wrapper = blockElement?.closest('.meros-submenu-wrapper');
    if (!wrapper) return;

    const isMegaMenu = wrapper?.querySelector('.meros-mega-menu-items-container') !== null;
    const initialised = wrapper?.dataset?.merosInitialised === 'true';

    if (!isMegaMenu && initialised) return;

    if (isMegaMenu) {
        cleanUpMegaMenu(doc, innerBlocks, clientId);
    }

    wrapper.dataset.merosInitialised = 'true';
}

export function subscribeToNavChanges({ doc }) {
    let merosNavUpdating = false;
    if (merosNavUpdating) return;

    const blockEditor = select('core/block-editor');

    const rootContainer = doc.querySelector('.is-root-container');
    if (!rootContainer) return;

    // Run on initial load to set up any existing submenus
    const navBlocks = rootContainer.querySelectorAll('.meros-navigation-wrapper');
    navBlocks.forEach(navBlock => {
        const id = navBlock.id.replace('block-', '');
        const block = blockEditor.getBlock(id);

        if (!block) return;

        const submenuType = block?.attributes?.merosMenu?.submenuSettings?.type || 'default';
        const submenus = block.innerBlocks.filter(block => block.name === 'core/navigation-submenu') || [];
        initMerosNav(doc, block, submenuType, submenus);
    });

    initMobileMenus(doc, rootContainer);

    // Subscribe to changes in the editor
    subscribe(() => {
        const selectedBlock = blockEditor.getSelectedBlock();
        const blockClientId = blockEditor.getSelectedBlockClientId();
        const blockName = selectedBlock?.name;
        const blockAttributes = selectedBlock?.attributes || {};

        const isMobile = rootContainer.classList.contains('is-mobile-preview');

        if (blockName === 'core/navigation') {
            merosNavUpdating = true;

            const submenuSettings = blockAttributes?.merosMenu?.submenuSettings || {};
            const submenuType = submenuSettings.type || 'dropdown';
            const submenus = blockEditor.getBlocks(blockClientId)
                .filter(block => block.name === 'core/navigation-submenu') || [];

            initMerosNav(doc, rootContainer, selectedBlock, submenuType, submenus, isMobile);

            merosNavUpdating = false;
        }

        if (blockName === 'core/navigation-submenu') {
            const parentBlock = blockEditor.getBlock(selectedBlock?.parentClientId);
            if (parentBlock?.name !== 'core/navigation') return;

            merosNavUpdating = true;

            const submenuType = blockAttributes?.merosSubmenu?.type || 'default';
            initSubmenu(doc, selectedBlock, submenuType);

            merosNavUpdating = false;
        }

    });
}