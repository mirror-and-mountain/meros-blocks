import { createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';

export function initMegaMenu(doc, innerBlocks, clientId) {
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

export function cleanUpMegaMenu(doc, innerBlocks, clientId) {
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

function createMegaMenuColumns(innerBlocks, clientId) {
    const { moveBlockToPosition, insertBlock } = dispatch('core/block-editor');

    const existingColumns = innerBlocks.filter(block => block.name === 'meros/mega-menu-column');
    if (existingColumns?.length > 0) return;

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