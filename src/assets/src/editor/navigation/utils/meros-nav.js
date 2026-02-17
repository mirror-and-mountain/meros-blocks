import { subscribe, select } from '@wordpress/data';
import { initMegaMenu, cleanUpMegaMenu } from './mega-menu.js';
import { initMobileMenus, cleanUpMobileMenus } from './mobile-menu.js';

function initMerosNav(doc, rootContainer, navBlock, submenuType, submenus) {
    submenus.forEach(submenu => {
        const clientId = submenu.clientId;
        const innerBlocks = submenu.innerBlocks || [];

        if (submenuType === 'default') {
            initDefaultSubmenu(doc, innerBlocks, clientId);
        }

        if (submenuType === 'mega-menu') {
            initMegaMenu(doc, innerBlocks, clientId);
        }
    });

    const navEl = doc.getElementById(`block-${navBlock.clientId}`);
    const wrapper = navEl?.closest('.meros-navigation-wrapper');
    if (!wrapper) return;

    const mobileMenuEnabled = navBlock?.attributes?.merosMenu?.mobileSettings?.enabled ?? true;
    const openSubmenusOnClick = navBlock?.attributes?.openSubmenusOnClick ?? false;
    
    if (openSubmenusOnClick) {        
        enableSubmenuOpenOnClick(doc, wrapper);
    }

    if (mobileMenuEnabled && wrapper.dataset.merosMobileMenuInitialised !== 'true') {
        initMobileMenus(doc, rootContainer);
    }

    if (!mobileMenuEnabled && wrapper.dataset.merosMobileMenuInitialised === 'true') {
        cleanUpMobileMenus(doc, rootContainer);
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

function openSubmenu(e) {
    const submenu = e.currentTarget;
    const wrapper = submenu.closest('.meros-navigation-wrapper');
    if (!wrapper || !wrapper.classList.contains('meros-open-submenus-on-click')) return;

    if (!submenu.classList.contains('meros-submenu-open')) {
        submenu.classList.add('meros-submenu-open');
        wrapper.classList.add('meros-submenu-open');
    }
}

function closeSubmenu(e) {
    if (e.target.classList.contains('meros-submenu-wrapper')) return;
    if (e.target.closest('.meros-submenu-wrapper') !== null) return;

    const wrapper = e.currentTarget.querySelector(
        '.meros-navigation-wrapper.meros-open-submenus-on-click'
    );

    if (!wrapper) return;
    wrapper.classList.remove('meros-submenu-open');
    
    const openSubmenu = wrapper.querySelector('.meros-submenu-open');
    if (!openSubmenu) return;

    openSubmenu.classList.remove('meros-submenu-open');
}

export function enableSubmenuOpenOnClick(doc, wrapper, force = false) {
    wrapper.classList.add('meros-open-submenus-on-click');

    if (force) {
        wrapper.dataset.forcedSubmenuOpenOnClick = 'true';
    }

    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
    submenus.forEach(submenu => {
        submenu.firstElementChild.classList.remove('open-on-hover-click');
        submenu.firstElementChild.classList.add('open-on-click');
        submenu.addEventListener('click', openSubmenu);
    });

    const rootContainer = doc.querySelector('.is-root-container');
    if (!rootContainer) return;

    const rootInitialised = rootContainer.dataset?.merosListeningForSubmenus === 'true';
   
    if (!rootInitialised) {
        rootContainer.addEventListener('click', closeSubmenu);
        rootContainer.dataset.merosListeningForSubmenus = 'true';
    }
}

export function disableSubmenuOpenOnClick(doc, wrapper) {
    wrapper.classList.remove('meros-open-submenus-on-click');
    
    if (wrapper.dataset.forcedSubmenuOpenOnClick === 'true') {
        delete wrapper.dataset.forcedSubmenuOpenOnClick;
    }

    const submenus = wrapper.querySelectorAll('.meros-submenu-wrapper');
    submenus.forEach(submenu => {
        submenu.removeEventListener('click', openSubmenu);
        submenu.firstElementChild.classList.remove('open-on-click');
        submenu.firstElementChild.classList.add('open-on-hover-click');
    });

    const rootContainer = doc.querySelector('.is-root-container');
    if (!rootContainer) return;

    const anyOpenOnClick = rootContainer.querySelector(
        '.meros-navigation-wrapper.meros-open-submenus-on-click'
    );

    if (!anyOpenOnClick) {
        rootContainer.removeEventListener('click', closeSubmenu);
        delete rootContainer.dataset.merosListeningForSubmenus;
    }
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

        if (blockName === 'core/navigation') {
            merosNavUpdating = true;

            const submenuSettings = blockAttributes?.merosMenu?.submenuSettings || {};
            const submenuType = submenuSettings.type || 'dropdown';
            const submenus = blockEditor.getBlocks(blockClientId)
                .filter(block => block.name === 'core/navigation-submenu') || [];

            initMerosNav(doc, rootContainer, selectedBlock, submenuType, submenus);

            merosNavUpdating = false;
        }
    });
}