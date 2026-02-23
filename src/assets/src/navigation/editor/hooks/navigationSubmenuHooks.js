import { useEffect } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { attributeIsDefault } from '../../../utils/editor.js';

import { getNavigationSubmenuAttributes } from './navigationAttributes.js';

export function useNavigationSubmenuWrapperClasses(submenuType, styles) {
    const classes = ['meros-submenu-wrapper'];

    const submenuHighlightType = styles?.itemHighlightType || 'none';
    const columnFill = submenuType === 'mega-menu' ? styles?.megaMenuFillSpace ?? false : false;
    const dropShadow = styles?.dropShadow || false;

    if (submenuType === 'mega-menu') {
        classes.push('meros-mega-menu-wrapper');

        if (dropShadow) {
            classes.push('meros-mega-menu-has-shadow');
        } else {
            const index = classes.indexOf('meros-mega-menu-has-shadow');
            if (index !== -1) {
                classes.splice(index, 1);
            }
        }

        if (columnFill) {
            classes.push('meros-mega-menu-fill-space');
        } else {
            const index = classes.indexOf('meros-mega-menu-fill-space');
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
        const fillIndex = classes.indexOf('meros-mega-menu-fill-space');
        if (fillIndex !== -1) {
            classes.splice(fillIndex, 1);
        }
    }

    classes.push(`meros-submenu-highlight-${submenuHighlightType}`);
    return classes.join(' ');
}

export function useNavigationSubmenuWrapperStyles(submenuStyles) {
    const styles = {};
    const defaultStyles = getNavigationSubmenuAttributes().styles || {};

    const setStyleAttribute = (key, value) => {
        if (
            key === 'megaMenuFillSpace' || 
            key === 'dropShadow'
        ) {
            return;
        }

        const cssVarName = `--meros-nav-submenu-${key.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())}`;

        if (
            attributeIsDefault(value, defaultStyles[key]) ||
            defaultStyles[key] === undefined ||
            value === ''
        ) {
            delete styles[cssVarName];
        } else {
            styles[cssVarName] = value;
        }
    };

    Object.keys(submenuStyles).forEach((key) => {
        setStyleAttribute(key, submenuStyles[key]);
    });

    return styles;
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

            innerBlocks.forEach((block) => {
                if (block.name === 'core/navigation-submenu') {
                    restrictInnerSubmenus(block, defaultColumnId);
                }

                else if (block.name === 'core/page-list') {
                    removeBlock(block.clientId, true);
                }

                else if (block.name !== 'meros/mega-menu-column') {
                    moveBlockToPosition(block.clientId, clientId, defaultColumnId, 0);
                }

                else if (block.name === 'meros/mega-menu-column') {
                    const columnBlocks = block.innerBlocks || [];

                    columnBlocks.forEach((columnBlock) => {
                        const nestedBlocks = columnBlock.innerBlocks || [];

                        if (!nestedBlocks.length) return;

                        nestedBlocks.forEach((link) => {
                            moveBlockToPosition(link.clientId, columnBlock.clientId, block.clientId, 0);
                        });
                    });
                }
            });
        }

        else if (submenuType === 'default') {
            innerBlocks.forEach((block) => {
                if (
                    block.name === 'meros/mega-menu-column' ||
                    block.name === 'core/page-list'

                ) {
                    removeBlock(block.clientId, true);
                }

                if (block.name === 'core/navigation-submenu') {
                    restrictInnerSubmenus(block, clientId);
                }
            });
        }
    }, [innerBlocks, submenuType, clientId, isMounted]);
}