import { subscribe, select, dispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

function initSubmenus(doc, type, navBlock, submenus) {
    submenus.forEach(submenu => {
        const clientId = submenu.clientId;
        const innerBlocks = submenu.innerBlocks || [];
        const clickBehaviour = navBlock?.attributes?.openSubmenusOnClick || false;

        if (type === 'default') {
            initDefaultSubmenu(doc, innerBlocks, clientId);
            return;
        }

        if (type === 'mega-menu') {
            initMegaMenu(doc, innerBlocks, clientId);
            return;
        }

        initSubmenuBehaviour(doc, submenu, clickBehaviour);
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

function initMegaMenu(doc, innerBlocks, clientId) {
    const blockElement = doc.getElementById(`block-${clientId}`);
    const wrapper = blockElement?.closest('.meros-mega-menu-wrapper');
    const initialised = wrapper?.dataset?.merosInitialised === 'true';
    
    let merosItemsContainer = wrapper?.querySelector('.meros-mega-menu-items-container') || null;
    if (!wrapper || (initialised && merosItemsContainer !== null)) return;

    const wpItemsContainer = blockElement.querySelector('.wp-block-navigation__submenu-container');
    if (!wpItemsContainer) return;

    merosItemsContainer = document.createElement('div');
    merosItemsContainer.classList.add('meros-mega-menu-items-container');

    merosItemsContainer.appendChild(wpItemsContainer);
    blockElement.appendChild(merosItemsContainer);

    createMegaMenuColumns(innerBlocks, clientId);
    wrapper.dataset.merosInitialised = 'true';
}

function createMegaMenuColumns(innerBlocks, clientId) {
    const { moveBlockToPosition, insertBlock } = dispatch('core/block-editor');

    const existingColumns = innerBlocks.filter(block => block.name === 'meros/mega-menu-column');
    if (existingColumns?.length || 0 > 0) return;

    const innerLinksToMove = innerBlocks && innerBlocks.length > 0
        ? innerBlocks.filter(block => block.name === 'core/navigation-link')
        : [];

    const column = createBlock('meros/mega-menu-column',{});
    insertBlock(column, -1, clientId);

    requestAnimationFrame(() => {
        innerLinksToMove.forEach(link => {
            moveBlockToPosition(link.clientId, clientId, column.clientId, -1);
        });
    });
}

function cleanUpMegaMenu(doc, innerBlocks, clientId) {
    const { moveBlockToPosition, removeBlock } = dispatch('core/block-editor');

    const blockElement = doc.getElementById(`block-${clientId}`);
    const wrapper = blockElement?.closest('.meros-submenu-wrapper');

    if (!wrapper) return;
    
    const merosItemsContainer = wrapper.querySelector('.meros-mega-menu-items-container');
    if (!merosItemsContainer) return;

    const originalWrapper = wrapper.querySelector('.wp-block-navigation__submenu-container');
    if (!originalWrapper) return;

    if (!innerBlocks?.length ) return;

    const megaMenuColumns = innerBlocks.filter(block => block?.name === 'meros/mega-menu-column');
    if (!megaMenuColumns || !megaMenuColumns?.length) return;

    megaMenuColumns.forEach(column => {
        if (!column || typeof column !== 'object') return;
        
        const innerLinks = column.innerBlocks || [];
        if (!innerLinks?.length) return; 

        if (column?.clientId) {
            requestAnimationFrame(() => {
                innerLinks.forEach(link => {
                    moveBlockToPosition(link.clientId, column.clientId, clientId, -1);
                });

                removeBlock(column.clientId);
            });
        }
    });

    blockElement.appendChild(originalWrapper);
    merosItemsContainer.remove();
}

function initSubmenuBehaviour(doc, submenu, openOnClick) {
    
}

export function subscribeToSubmenuChanges({doc}) {
    let merosNavUpdating = false;
    if (merosNavUpdating) return;

    const blockEditor = select('core/block-editor');

    // Run on initial load to set up any existing submenus
    const navBlocks = doc.querySelectorAll('.meros-navigation-wrapper');
    navBlocks.forEach(navBlock => {
        const id = navBlock.id.replace('block-', '');
        const block = blockEditor.getBlock(id);

        if (!block) return;

        const submenuType = block?.attributes?.merosMenu?.submenuSettings?.type || 'default';
        const submenus = block.innerBlocks.filter(block => block.name === 'core/navigation-submenu') || [];
        initSubmenus(doc, submenuType, submenus);
    });
    
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