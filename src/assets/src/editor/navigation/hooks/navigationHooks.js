import { useEffect } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { getNavigationAttributes } from '../utils';
import { attributeIsDefault } from '../../shared/utils';

export function useNavigationWrapperClasses(
    mobileEnabled, 
    mobileDirection, 
    columnFill, 
    openSubmenusOnClick
) {
    const classes = ['meros-navigation-wrapper'];

    if (mobileEnabled) {
        classes.push('meros-has-mobile-menu');
        classes.push('meros-mobile-menu-direction-' + mobileDirection);
    } else {
        classes.forEach((cls) => {
            if (cls.startsWith('meros-mobile-menu-direction-')) {
                classes.splice(classes.indexOf(cls), 1);
            } if (cls === 'meros-has-mobile-menu') {
                classes.splice(classes.indexOf(cls), 1);
            }
        });
    }

    if (columnFill) {
        classes.push('meros-mega-menu-fill-space');
    } else {
        const index = classes.indexOf('meros-mega-menu-fill-space');
        if (index !== -1) {
            classes.splice(index, 1);
        }
    }

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

export function useNavigationWrapperStyles(mobileEnabled, mobileStyles, submenuStyles) {
    const styles = {};
    const navigationAttributes = getNavigationAttributes();

    const setStyleAttribute = (type, key, value) => {
        const defaultStyles = type === 'submenu' 
            ? navigationAttributes.submenuSettings.styles
            : navigationAttributes.mobileSettings.styles;

        const cssVarName = `--meros-nav-${type}-${key.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())}`;
        
        if (attributeIsDefault(value, defaultStyles[key])) {
            delete styles[cssVarName];
        } else {
            styles[cssVarName] = value;
        }
    };

    Object.keys(submenuStyles).forEach((key) => {
        setStyleAttribute('submenu', key, submenuStyles[key]);
    });

    if (!mobileEnabled) return;

    Object.keys(mobileStyles).forEach((key) => {
        setStyleAttribute('mobile', key, mobileStyles[key]);
    });

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