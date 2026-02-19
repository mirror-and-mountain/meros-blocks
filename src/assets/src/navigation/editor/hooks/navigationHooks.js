import { useEffect } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { getNavigationAttributes } from './navigationAttributes.js';
import { attributeIsDefault } from '../../../utils/editor.js';

export function useNavigationWrapperClasses(
    desktopSettings,
    mobileSettings,
    submenuSettings,
    openSubmenusOnClick
) {
    const classes = ['meros-navigation-wrapper'];

    // Desktop props
    const desktopHighlightType = desktopSettings?.styles?.itemHighlightType || 'none';

    // Submenu props
    const columnFill = submenuSettings?.type === 'mega-menu' && submenuSettings?.styles?.megaMenuFillSpace
        ? submenuSettings.styles.megaMenuFillSpace
        : false;

    // Mobile props
    const mobileEnabled = mobileSettings?.enabled;
    const mobileDirection = mobileSettings?.direction || 'left';
    const mobileAlignment = mobileSettings?.styles?.itemAlignment || 'left';
    const mobileHighlightType = mobileSettings?.styles?.itemHighlightType || 'none';

    // Desktop classes
    classes.push('meros-desktop-menu-highlight-' + desktopHighlightType);

    // Mobile classes
    if (mobileEnabled) {
        classes.push('meros-has-mobile-menu');
        classes.push('meros-mobile-menu-direction-' + mobileDirection);
        classes.push('meros-mobile-menu-item-alignment-' + mobileAlignment);
        classes.push('meros-mobile-menu-highlight-' + mobileHighlightType);
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
            }
        });
    }

    // Submenu classes
    if (columnFill) {
        classes.push('meros-mega-menu-fill-space');
    } else {
        const index = classes.indexOf('meros-mega-menu-fill-space');
        if (index !== -1) {
            classes.splice(index, 1);
        }
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

export function useNavigationWrapperStyles(mobileEnabled, mobileStyles, submenuStyles, desktopStyles) {
    const styles = {};
    const navigationAttributes = getNavigationAttributes();

    const setStyleAttribute = (type, key, value) => {
        // Ignore styles handled by classes
        if (
            key === 'itemAlignment' ||
            key === 'itemHighlightType' ||
            key === 'itemsJustification' ||
            key === 'megaMenuColumnAlignment'
        ) {
            return;
        }
        
        const defaultStyles = type === 'submenu' 
            ? navigationAttributes.submenuSettings.styles
            : type === 'mobile'
                ? navigationAttributes.mobileSettings.styles
                : navigationAttributes.desktopSettings.styles;

        const cssVarName = `--meros-nav-${type}-${key.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())}`;
        
        if (
            attributeIsDefault(value, defaultStyles[key]) || // Remove the value if it is the same as the default
            defaultStyles[key] === undefined // If the attribute doesn't exist in defaults, don't set it
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

    // Set submenu styles
    Object.keys(submenuStyles).forEach((key) => {
        setStyleAttribute('submenu', key, submenuStyles[key]);
    });

    // Set mobile styles if mobile menu is enabled
    if (mobileEnabled) {
        Object.keys(mobileStyles).forEach((key) => {
            setStyleAttribute('mobile', key, mobileStyles[key]);
        });
    }

    return styles;
}

export function useNavigationWrapperSubmenuSync(innerBlocks, submenuSettings) {
    const { updateBlockAttributes } = dispatch('core/block-editor');

    // Update child submenus with selected submenu type
    useEffect(() => {
        if (!innerBlocks?.length) return;

        innerBlocks.forEach((childBlock) => {
            if (childBlock.name !== 'core/navigation-submenu') return;

            const childAttributes = childBlock.attributes;
            const submenuType = childAttributes?.merosSubmenu?.type || 'default';
            const submenuDropShadow = childAttributes?.merosSubmenu?.styles?.dropShadow ?? true;

            if (submenuType !== submenuSettings?.type || 
                submenuDropShadow !== (submenuSettings?.styles?.dropShadow ?? true)
            ) {
                const updatedAttributes = {
                    ...childAttributes,
                    merosSubmenu: {
                        ...(childAttributes.merosSubmenu || {}),
                        type: submenuSettings?.type || 'default',
                        styles: {
                            ...(childAttributes.merosSubmenu?.styles || {}),
                            dropShadow: submenuSettings?.styles?.dropShadow ?? true,
                        }
                    }
                };

                updateBlockAttributes(
                    childBlock.clientId,
                    updatedAttributes
                );
            }
        });
    }, [innerBlocks, submenuSettings?.type, submenuSettings?.styles?.dropShadow]);
}

export function useNavigationWrapperLinkSync(innerBlocks) {
    const { updateBlockAttributes } = dispatch('core/block-editor');

    // Update child navigation links with top-level item type
    useEffect(() => {
        if (!innerBlocks?.length) return;

        innerBlocks.forEach((block) => {
            if (block.name !== 'core/navigation-link') return;
            const childAttributes = block.attributes;
            const linkType = childAttributes?.merosMenuItem?.type || 'top-level-item';

            if (linkType !== 'top-level-item') {
                const updatedAttributes = {
                    ...childAttributes,
                    merosMenuItem: {
                        ...(childAttributes.merosMenuItem || {}),
                        type: 'top-level-item'
                    }
                };

                updateBlockAttributes(
                    block.clientId,
                    updatedAttributes
                );
            }
        });
    }, [innerBlocks]);
}