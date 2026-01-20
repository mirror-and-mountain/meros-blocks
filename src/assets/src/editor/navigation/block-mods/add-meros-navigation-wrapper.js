import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect, useState } from '@wordpress/element';
import { getAttributes } from './utils.js';

export const addMerosNavigationWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes, setAttributes, clientId } = props;

            if (name !== 'core/navigation') {
                return <BlockListBlock {...props} />;
            }

            const { openSubmenusOnClick } = attributes;

            const {
                merosMobileMenu,
                merosDesktopMenu
            } = getAttributes(attributes);

            const mobileEnabled = merosMobileMenu.enabled;
            const desktopEnabled = merosDesktopMenu.enabled;

            const wrapperClasses = mobileEnabled
                ? [
                    'meros-navigation-wrapper',
                    'meros-has-mobile-menu',
                    'meros-mobile-menu-direction-' + merosMobileMenu.direction,
                ]
                : ['meros-navigation-wrapper'];

            // Apply styles for mobile menu
            const wrapperStyles = mobileEnabled ? {
                ...props.wrapperProps?.style,
                '--meros-mobile-menu-breakpoint': `${merosMobileMenu.breakpoint}px`,
                '--meros-mobile-menu-icon-color': merosMobileMenu.iconColor,
                '--meros-mobile-menu-items-gap': `${merosMobileMenu.itemsGap}px`,
                '--meros-mobile-menu-bg-color': merosMobileMenu.bgColor,
                '--meros-mobile-menu-text-color': merosMobileMenu.textColor,
                '--meros-mobile-menu-text-hover-color': merosMobileMenu.textHoverColor,
                '--meros-mobile-menu-item-bg-color': merosMobileMenu.itemBgColor,
                '--meros-mobile-menu-item-hover-bg-color': merosMobileMenu.itemHoverBgColor,
                '--meros-mobile-menu-item-padding-x': `${merosMobileMenu.itemPaddingX}px`,
                '--meros-mobile-menu-item-padding-y': `${merosMobileMenu.itemPaddingY}px`,
                '--meros-mobile-submenu-bg-color': merosMobileMenu.submenuBgColor,
                '--meros-mobile-submenu-item-bg-color': merosMobileMenu.submenuItemBgColor,
                '--meros-mobile-submenu-hover-bg-color': merosMobileMenu.submenuHoverBgColor,
                '--meros-mobile-submenu-text-color': merosMobileMenu.submenuTextColor,
                '--meros-mobile-submenu-text-hover-color': merosMobileMenu.submenuTextHoverColor,
            } : {};

            return (
                <div 
                    className={wrapperClasses.join(' ')}
                    style={wrapperStyles}
                    data-open-on-click={ openSubmenusOnClick ? 'true' : 'false' }
                >
                    { mobileEnabled && (
                        <div 
                            className="meros-navigation-mobile-icon" 
                            style={{ '--meros-mobile-menu-icon-color': merosMobileMenu.iconColor}}
                        >
                            <svg
                                className="meros-navigation-mobile-icon-svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                role="img"
                                aria-label="Menu Icon"
                                >
                                <path
                                    className="meros-navigation-mobile-icon-bar top"
                                    d="M5 5v1.5h14V5H5z"
                                />
                                <path
                                    className="meros-navigation-mobile-icon-bar middle"
                                    d="M5 12.8h14v-1.5H5v1.5z"
                                />
                                <path
                                    className="meros-navigation-mobile-icon-bar bottom"
                                    d="M5 19h14v-1.5H5V19z"
                                />
                            </svg>
                        </div>
                    )}
                    <BlockListBlock {...props} />
                </div>
            );
        }
    },
    'addMerosNavigationWrapper'
);