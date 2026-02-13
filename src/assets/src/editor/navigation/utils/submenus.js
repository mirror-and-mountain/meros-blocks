import { subscribe, select } from '@wordpress/data';
import { initMegaMenu, cleanUpMegaMenu } from './mega-menu.js';
import { initMobileMenu } from './mobile-menu.js';


function initSubmenus(doc, type, navBlock, submenus) {
    submenus.forEach(submenu => {
        const clientId = submenu.clientId;
        const innerBlocks = submenu.innerBlocks || [];
        const clickBehaviour = navBlock?.attributes?.openSubmenusOnClick || false;

        if (type === 'default') {
            initDefaultSubmenu(doc, innerBlocks, clientId);
        }

        if (type === 'mega-menu') {
            initMegaMenu(doc, innerBlocks, clientId);
        }

        initSubmenuBehaviour(doc, clientId, clickBehaviour);
    });
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

function initSubmenuBehaviour(doc, clientId, openOnClick, forceOpenOnClick = false) {
    const navigateOnClick = (e) => {
        const button = e.currentTarget;
        if (button.classList.contains('wp-block-navigation-submenu__toggle')) {
            const parent = button.parentElement;
            if (parent && parent.classList.contains('meros-submenu-wrapper')) {
                parent.classList.remove('meros-submenu-open');

                const wrapper = parent.closest('.meros-navigation-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('meros-submenu-open');
                }

                const action = button.getAttribute('data-action');
                if (action) {
                    eval(action);
                }
            }
        }
    };

    const openSubmenuOnClick = (e) => {
        const submenu = e.currentTarget;
        const wrapper = submenu.closest('.meros-navigation-wrapper');
        if (!wrapper) return;

        if (!submenu.classList.contains('meros-submenu-open')) {
            const button = submenu.querySelector('button');
            if (button.classList.contains('wp-block-navigation-submenu__toggle')) {
                button.addEventListener('click', navigateOnClick);
            }

            submenu.classList.add('meros-submenu-open');
            wrapper.classList.add('meros-submenu-open');
        }
    };

    const closeSubmenu = (e) => {
        if (!submenu.contains(e.target)) {
            const button = submenu.querySelector('button');
            if (button.classList.contains('wp-block-navigation-submenu__toggle')) {
                button.removeEventListener('click', navigateOnClick);
            }

            submenu.classList.remove('meros-submenu-open');

            const wrapper = submenu.closest('.meros-navigation-wrapper');
            if (wrapper) {
                wrapper.classList.remove('meros-submenu-open');
            }
        }
    };

    const enableOpenOnClick = (wrapper) => {
        if (!wrapper.classList.contains('meros-open-submenus-on-click') &&
            (forceOpenOnClick)
        ) {
            wrapper.classList.add('meros-open-submenus-on-click');
            wrapper.dataset.forcedOpenOnClick = 'true';
        }

        if (wrapper.classList.contains('meros-open-submenus-on-click')) {
            submenu.addEventListener('click', openSubmenuOnClick);
            doc.addEventListener('click', closeSubmenu);
        }
    };

    const disableOpenOnClick = (wrapper) => {
        if (wrapper.dataset.forcedOpenOnClick === 'true') {
            wrapper.classList.remove('meros-open-submenus-on-click');
            delete wrapper.dataset.forcedOpenOnClick;
        }

        submenu.removeEventListener('click', openSubmenuOnClick);
        doc.removeEventListener('click', closeSubmenu);
    };

    const blockElement = doc.getElementById(`block-${clientId}`);
    const submenu = blockElement?.closest('.meros-submenu-wrapper');
    if (!submenu) return;

    const wrapper = submenu.closest('.meros-navigation-wrapper');
    if (!wrapper) return;

    if (openOnClick || forceOpenOnClick) {
        enableOpenOnClick(wrapper);
    } else {
        disableOpenOnClick(wrapper);
    }
}

export function subscribeToSubmenuChanges({ iframe, doc }) {
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
        initSubmenus(doc, submenuType, submenus);
    });

    initMobileMenu(iframe, rootContainer);

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

            initSubmenus(doc, submenuType, selectedBlock, submenus);

            merosNavUpdating = false;
        }
    });
}