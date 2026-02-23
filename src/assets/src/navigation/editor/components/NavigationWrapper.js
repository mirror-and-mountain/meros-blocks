import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

import {
    useNavigationWrapperClasses,
    useNavigationWrapperStyles,
    useNavigationWrapperMenuTemplates
} from '../hooks/navigationHooks.js';

export const NavigationWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes, setAttributes, clientId } = props;

            if (name !== 'core/navigation') {
                return <BlockListBlock {...props} />;
            }

            // Meros Enabled
            const enabled = attributes?.merosMenu?.enabled;
            if (!enabled) {
                return <BlockListBlock {...props} />;
            }

            // Available menus
            const { availableMenus, menusResolved } = useSelect((select) => {
                const core = select('core');
                return {
                    availableMenus: core.getEntityRecords('postType', 'wp_navigation') || [],
                    menusResolved: core.hasFinishedResolution('getEntityRecords', ['postType', 'wp_navigation']),
                };
            }, []);

            // Current menu
            const menuRef = attributes?.ref || null;
            const { currentMenu, isCurrentMenuResolving } = useSelect((select) => {
                if (!menuRef) return { currentMenu: null, isCurrentMenuResolving: false };

                const core = select('core');
                return {
                    currentMenu: core.getEntityRecord('postType', 'wp_navigation', menuRef),
                    isCurrentMenuResolving: core.isResolving(
                        'getEntityRecord', 
                        ['postType', 'wp_navigation', menuRef]
                    ),
                };
            }, [menuRef]);


            // Initialise menu template
            const isInitialised = attributes?.merosMenu?.menuInitialised ?? false;
            useNavigationWrapperMenuTemplates(
                isInitialised, 
                availableMenus,
                menusResolved,
                currentMenu,
                isCurrentMenuResolving, 
                attributes.merosMenu, 
                clientId,
                setAttributes
            );

            // Get settings
            const { layout, openSubmenusOnClick, merosMenu } = attributes;
            const { mobileSettings, submenuSettings, desktopSettings } = merosMenu || {};
            const mobileStyles = mobileSettings?.styles || {};
            const desktopStyles = desktopSettings?.styles || {};

            const justification = layout?.justifyContent || 'left';

            // Determine wrapper classes
            const wrapperClasses = useNavigationWrapperClasses(
                desktopSettings,
                mobileSettings,
                openSubmenusOnClick
            );

            // Determine mobile menu styles
            const wrapperMobileStyles = useNavigationWrapperStyles(
                mobileSettings?.enabled,
                mobileStyles || {},
                desktopStyles || {}
            );

            return (
                <div
                    className={wrapperClasses}
                    style={{
                        ...props.wrapperProps?.style,
                        ...wrapperMobileStyles,
                        '--meros-mobile-menu-breakpoint': mobileSettings?.enabled ? `${mobileSettings.breakpoint}px` : undefined,
                        '--meros-mobile-menu-justification': justification === 'left' ? 'flex-start' : (justification === 'right' ? 'flex-end' : justification),
                    }}
                >
                    {mobileSettings?.enabled && (
                        <div 
                            className="meros-navigation-mobile-toggle"
                            role="button"
                            tabIndex={0}
                            aria-label="Toggle mobile menu"
                            title="Toggle mobile menu"
                        >
                            <svg
                                className="meros-navigation-mobile-toggle-svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                role="img"
                                aria-label="Menu Toggle"
                            >
                                <path
                                    className="meros-navigation-mobile-toggle-bar top"
                                    d="M5 5v1.5h14V5H5z"
                                />
                                <path
                                    className="meros-navigation-mobile-toggle-bar middle"
                                    d="M5 12.8h14v-1.5H5v1.5z"
                                />
                                <path
                                    className="meros-navigation-mobile-toggle-bar bottom"
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