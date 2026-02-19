import { useEffect } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

export function useNavigationSubmenuWrapperClasses(submenuType, styles) {
    const classes = ['meros-submenu-wrapper'];
    const hasShadow = styles?.dropShadow ?? true;

    if (submenuType === 'mega-menu') {
        classes.push('meros-mega-menu-wrapper');
        if (hasShadow) {
            classes.push('meros-mega-menu-has-shadow');
        } else {
            const index = classes.indexOf('meros-mega-menu-has-shadow');
            if (index !== -1) {
                classes.splice(index, 1);
            }
        }
    } else {
        const index = classes.indexOf('meros-mega-menu-wrapper');
        if (index !== -1) {
            classes.splice(index, 1);
        }
        const shadowIndex = classes.indexOf('meros-mega-menu-has-shadow');
        if (shadowIndex !== -1) {
            classes.splice(shadowIndex, 1);
        }
    }

    return classes.join(' ');
}

export function useNavigationSubmenuWrapperLinkSync(innerBlocks, submenuType, isMounted) {
    const { updateBlockAttributes } = dispatch('core/block-editor');

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        if (!innerBlocks?.length) return;
        console.log('Syncing submenu links with submenu type:', submenuType);

        innerBlocks.forEach((block) => {
            if (block.name !== 'core/navigation-link') return;
            const merosMenuItem = block.attributes?.merosMenuItem || {};
            if (merosMenuItem?.type === submenuType + '-item') return;

            const updatedAttributes = {
                ...block.attributes,
                merosMenuItem: {
                    ...merosMenuItem,
                    type: submenuType + '-item',
                },
            };

            updateBlockAttributes(block.clientId, updatedAttributes);
        })
    }, [innerBlocks, submenuType, isMounted]);
}

export function useNavigationSubmenuWrapperRules(innerBlocks, submenuType, clientId, isMounted) {
    const { moveBlockToPosition, insertBlock, removeBlock } = dispatch('core/block-editor');

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const restrictInnerSubmenus = (block, destId) => {
            const nestedLinks = block.innerBlocks.filter(
                (nestedBlock) => nestedBlock.name === 'core/navigation-link'
            );
            if (!nestedLinks.length) return;

            nestedLinks.forEach((link) => {
                moveBlockToPosition(link.clientId, block.clientId, destId, 0);
            })
        }

        if (submenuType === 'mega-menu') {
            let defaultColumnId = null;
            const megaMenuColumns = innerBlocks.filter(block => block.name === 'meros/mega-menu-column') || [];

            if (megaMenuColumns.length === 0) {
                const column = createBlock('meros/mega-menu-column');

                insertBlock(column, -1, clientId);
                defaultColumnId = column.clientId;
            } else {
                defaultColumnId = megaMenuColumns[0].clientId;
            }

            const innerBlocksCount = innerBlocks?.length || 0;

            innerBlocks.forEach((block) => {
                if (block.name === 'core/navigation-submenu') {
                    restrictInnerSubmenus(block, defaultColumnId);
                }

                else if (block.name !== 'meros/mega-menu-column') {
                    moveBlockToPosition(block.clientId, clientId, defaultColumnId, 0);
                }

                else if (block.name === 'meros/mega-menu-column' && innerBlocksCount < 4) {
                    const columnBlocks = block.innerBlocks || [];

                    columnBlocks.forEach((columnBlock) => {
                        const nestedBlocks = columnBlock.innerBlocks || [];

                        if (!nestedBlocks.length) return;

                        nestedBlocks.forEach((link) => {
                            moveBlockToPosition(link.clientId, columnBlock.clientId, block.clientId, 0);
                        });
                    });
                }

                else if (block.name === 'meros/mega-menu-column' && 
                    block === megaMenuColumns[3] &&
                    innerBlocksCount > 4
                ) {
                    removeBlock(block.clientId, true);
                }
            });
        }

        else if (submenuType === 'default') {
            innerBlocks.forEach((block) => {
                if (block.name === 'meros/mega-menu-column') {
                    if (!block.innerBlocks?.length || 
                        block.innerBlocks?.length === 0
                    ) {
                        removeBlock(block.clientId, true);
                    }
                }

                if (block.name === 'core/navigation-submenu') {
                    restrictInnerSubmenus(block, clientId);
                }
            });
        }
    }, [innerBlocks, submenuType, clientId, isMounted]);
}