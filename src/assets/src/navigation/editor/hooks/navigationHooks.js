import { useEffect, useRef, useMemo } from '@wordpress/element';
import { dispatch, select } from '@wordpress/data';
import { getNavigationAttributes } from './navigationAttributes.js';
import { attributeIsDefault, isChildOf } from '../../../utils/editor.js';

export function useNavigationWrapperClasses(
    desktopSettings,
    mobileSettings,
    openSubmenusOnClick
) {
    const classes = ['meros-navigation-wrapper'];

    // Desktop props
    const desktopHighlightType = desktopSettings?.styles?.itemHighlightType || 'none';

    // Mobile props
    const mobileEnabled = mobileSettings?.enabled;
    const mobileDirection = mobileSettings?.direction || 'left';
    const mobileUnderHeader = mobileDirection === 'top' && mobileSettings?.underHeader === true;
    const mobileAlignment = mobileSettings?.styles?.itemAlignment || 'left';
    const mobileHighlightType = mobileSettings?.styles?.itemHighlightType || 'none';
    const mobileShadow = mobileDirection !== 'top' && mobileSettings?.styles?.dropShadow === true;
    const mobileWidth = mobileSettings?.styles?.width || '80%';

    // Desktop classes
    classes.push('meros-desktop-menu-highlight-' + desktopHighlightType);

    // Mobile classes
    if (mobileEnabled) {
        classes.push('meros-has-mobile-menu');
        classes.push('meros-mobile-menu-direction-' + mobileDirection);
        classes.push('meros-mobile-menu-item-alignment-' + mobileAlignment);
        classes.push('meros-mobile-menu-highlight-' + mobileHighlightType);

        if (mobileUnderHeader) {
            classes.push('meros-mobile-menu-under-header');
        } else {
            const index = classes.indexOf('meros-mobile-menu-under-header');
            if (index !== -1) {
                classes.splice(index, 1);
            }
        }

        if (mobileShadow) {
            classes.push('meros-mobile-menu-has-shadow');
        } else {
            const index = classes.indexOf('meros-mobile-menu-has-shadow');
            if (index !== -1) {
                classes.splice(index, 1);
            }
        }

        if (mobileWidth === '100%') {
            classes.push('meros-mobile-menu-full-width');
        } else {
            const index = classes.indexOf('meros-mobile-menu-full-width');
            if (index !== -1) {
                classes.splice(index, 1);
            }
        }
    } else {
        classes.forEach((cls) => {
            if (cls.startsWith('meros-mobile-menu-direction-')) {
                classes.splice(classes.indexOf(cls), 1);
            } if (cls.startsWith('meros-mobile-menu-item-alignment-')) {
                classes.splice(classes.indexOf(cls), 1);
            } if (cls === 'meros-has-mobile-menu') {
                classes.splice(classes.indexOf(cls), 1);
            } if (cls.startsWith('meros-mobile-menu-highlight-')) {
                classes.splice(classes.indexOf(cls), 1);
            } if (cls === 'meros-mobile-menu-has-shadow') {
                classes.splice(classes.indexOf(cls), 1);
            } if (cls === 'meros-mobile-menu-full-width') {
                classes.splice(classes.indexOf(cls), 1);
            }
        });
    }

    // Open submenus on click class
    if (openSubmenusOnClick) {
        classes.push('meros-open-submenus-on-click');
    } else {
        const index = classes.indexOf('meros-open-submenus-on-click');
        if (index !== -1) {
            classes.splice(index, 1);
        }
    }

    return classes.join(' ');
}

export function useNavigationWrapperStyles(mobileEnabled, mobileStyles, desktopStyles) {
    const styles = {};
    const navigationAttributes = getNavigationAttributes();

    const setStyleAttribute = (type, key, value) => {
        // Ignore styles handled by classes
        if (
            key === 'itemAlignment' ||
            key === 'itemHighlightType' ||
            key === 'itemsJustification' ||
            key === 'showLogo' ||
            key === 'boxShadow'
        ) {
            return;
        }

        const defaultStyles = type === 'mobile'
            ? navigationAttributes.mobileSettings.styles
            : navigationAttributes.desktopSettings.styles;

        const cssVarName = `--meros-nav-${type}-${key.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())}`;

        if (
            attributeIsDefault(value, defaultStyles[key]) || // Remove the value if it is the same as the default
            defaultStyles[key] === undefined || // If the attribute doesn't exist in defaults, don't set it
            value === '' // If the value is an empty string, remove the style
        ) {
            delete styles[cssVarName];
        } else {
            styles[cssVarName] = value;
        }
    };

    // Set desktop styles
    Object.keys(desktopStyles).forEach((key) => {
        setStyleAttribute('desktop', key, desktopStyles[key]);
    });

    // Set mobile styles if mobile menu is enabled
    if (mobileEnabled) {
        Object.keys(mobileStyles).forEach((key) => {
            setStyleAttribute('mobile', key, mobileStyles[key]);
        });
    }

    return styles;
}

export function useNavigationWrapperRules(innerBlocks, clientId, isMounted) {
    const { removeBlock } = dispatch('core/block-editor');
    const restrictedBlocks = ['core/page-list'];

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        if (!innerBlocks.length) return;    

        innerBlocks.forEach((block) => {
            if (restrictedBlocks.includes(block.name)) {
                removeBlock(block.clientId);
            }
        });

    }, [innerBlocks, clientId]);
}

export function useNavigationWrapperMenuTemplates(
    isInitialised,
    availableMenus,
    menusResolved,
    currentMenu,
    isResolving,
    merosAttributes,
    clientId,
    setAttributes
) {
    const isCreating = useRef(false);

    const menuType =
        merosAttributes?.submenuSettings?.type || 'default';

    const blockEditor = select('core/block-editor');
    const { removeBlock } = dispatch('core/block-editor');

    /* ------------------------------------------------------------------ */
    /* Header placement helpers                                            */
    /* ------------------------------------------------------------------ */

    const isInHeader = (blockId) =>
        isChildOf(
            blockId,
            ['core/template-part', 'core/group'],
            (block) => {
                if (block.name === 'core/template-part') {
                    return block.attributes?.slug === 'header';
                }
                if (block.name === 'core/group') {
                    return block.attributes?.tagName === 'header';
                }
            }
        );

    /* ------------------------------------------------------------------ */
    /* 1. Placement validation (runs once, no async, no menus)             */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        const justInserted =
            blockEditor.wasBlockJustInserted(clientId);

        if (!justInserted) return;

        if (!isInHeader(clientId)) {
            removeBlock(clientId);

            alert(
                'Navigation blocks must be placed inside a header template part or a group with tag "header".'
            );
        }
    }, [clientId]);

    /* ------------------------------------------------------------------ */
    /* Memo: find an existing menu for this type                            */
    /* ------------------------------------------------------------------ */

    const existingMenuForType = useMemo(() => {
        if (!availableMenus?.length) return null;

        return availableMenus.find(
            (menu) => menu.slug?.includes(menuType)
        );
    }, [availableMenus, menuType]);

    /* ------------------------------------------------------------------ */
    /* 2. Initial menu assignment / creation                               */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        if (
            !menusResolved ||
            isInitialised ||
            isCreating.current ||
            !isInHeader(clientId)
        ) {
            return;
        }

        isCreating.current = true;

        // Prefer existing menu of correct type
        if (existingMenuForType) {
            setAttributes({
                ref: existingMenuForType.id,
                merosMenu: {
                    ...merosAttributes,
                    menuInitialised: true,
                    usedExistingMenu: true,
                },
            });

            isCreating.current = false;
            return;
        }

        // Otherwise create one
        createMenu(menuType, clientId)
            .then((menuId) => {
                setAttributes({
                    ref: menuId,
                    merosMenu: {
                        ...merosAttributes,
                        menuInitialised: true,
                    },
                });
            })
            .catch((err) => {
                console.error('Failed to create menu', err);
            })
            .finally(() => {
                isCreating.current = false;
            });
    }, [
        menusResolved,
        isInitialised,
        menuType,
        clientId,
        existingMenuForType,
    ]);

    /* ------------------------------------------------------------------ */
    /* 3. Replace menu if type changes                                     */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        if (
            !isInitialised ||
            !currentMenu ||
            isResolving ||
            isCreating.current ||
            !isInHeader(clientId)
        ) {
            return;
        }

        const matchesType =
            currentMenu.slug?.includes(menuType);

        if (matchesType) return;

        isCreating.current = true;

        // Clean up drafts
        if (currentMenu.status === 'draft') {
            deleteMenu(currentMenu.id);
        }

        // Reuse an existing correct menu if possible
        if (existingMenuForType) {
            setAttributes({
                ref: existingMenuForType.id,
                merosMenu: {
                    ...merosAttributes,
                    usedExistingMenu: true,
                },
            });

            isCreating.current = false;
            return;
        }

        // Otherwise create a new one
        createMenu(menuType, clientId)
            .then((menuId) => {
                setAttributes({
                    ref: menuId,
                });
            })
            .catch((err) => {
                console.error('Failed to replace menu', err);
            })
            .finally(() => {
                isCreating.current = false;
            });
    }, [
        isInitialised,
        currentMenu,
        isResolving,
        menuType,
        clientId,
        existingMenuForType,
        menusResolved,
    ]);
}

async function deleteMenu(menuId) {
    const { deleteEntityRecord } = dispatch('core');
    await deleteEntityRecord('postType', 'wp_navigation', menuId, { force: true });
}

async function createMenu(type, clientId) {
    const { saveEntityRecord } = dispatch('core');

    const title = type === 'default'
        ? 'Advanced Menu'
        : 'Mega Menu';

    const content = type === 'default'
        ? `
        <!-- wp:navigation-submenu {"label":"Submenu"} -->
        <!-- wp:navigation-link {"label":"Menu Item","url":"#"} /-->
        <!-- /wp:navigation-submenu -->
      `
        : `
        <!-- wp:navigation-link {"label":"Top Level Link","type":"page","url":"#","kind":"post-type","merosMenuItem":{"type":"top-level-item"}} /-->

        <!-- wp:navigation-submenu {"label":"Mega Menu","merosSubmenu":{"type":"mega-menu","styles":{"dropShadow":true}}} -->
        <!-- wp:meros/mega-menu-column -->
        <div class="meros-mega-menu-column"><div class="meros-mega-menu-column-title"><p>Column Title</p></div><ul class="meros-mega-menu-column-content"><!-- wp:navigation-link {"label":"Menu Item","url":"#"} /--></ul></div>
        <!-- /wp:meros/mega-menu-column -->

        <!-- wp:meros/mega-menu-column -->
        <div class="meros-mega-menu-column"><div class="meros-mega-menu-column-title"><p>Column Title</p></div><ul class="meros-mega-menu-column-content"><!-- wp:navigation-link {"label":"Menu Item","url":"#"} /--></ul></div>
        <!-- /wp:meros/mega-menu-column -->
        <!-- /wp:navigation-submenu -->
      `;

    const newMenu = await saveEntityRecord('postType', 'wp_navigation', {
        title: title,
        content: content,
        status: 'publish',
        slug: `${type}-${clientId.slice(0, 8)}`
    });

    return newMenu.id;
}