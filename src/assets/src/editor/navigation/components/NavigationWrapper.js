import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

import {
    useNavigationWrapperClasses,
    useNavigationWrapperStyles,
    useNavigationWrapperSubmenuSync,
    useNavigationWrapperLinkSync
} from '../hooks/navigationHooks.js';

export const NavigationWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes, clientId } = props;
            if (name !== 'core/navigation') {
                return <BlockListBlock {...props} />;
            }

            // Get inner blocks
            const innerBlocks = useSelect((select) => {
                const { getBlocks } = select('core/block-editor');
                return getBlocks(clientId);
            }, [clientId]);

            // Get settings
            const { layout, openSubmenusOnClick, merosMenu } = attributes;
            const { mobileSettings, submenuSettings } = merosMenu || {};
            const submenuStyles = submenuSettings.styles || {};
            const mobileStyles = mobileSettings?.styles || {};

            const justification = layout?.justifyContent || 'left';

            // Effects
            // Update child submenus with selected submenu type
            useNavigationWrapperSubmenuSync(innerBlocks, submenuSettings);

            // Update child navigation links with top-level item type
            useNavigationWrapperLinkSync(innerBlocks);

            // Determine wrapper classes
            const wrapperClasses = useNavigationWrapperClasses(
                mobileSettings?.enabled,
                mobileSettings?.direction,
                mobileStyles?.itemAlignment,
                mobileStyles?.itemHighlightType,
                submenuSettings.type === 'mega-menu' 
                    ? submenuStyles.megaMenuFillSpace || false
                    : false,
                openSubmenusOnClick
            );

            // Determine mobile menu styles
            const wrapperMobileStyles = useNavigationWrapperStyles(
                mobileSettings?.enabled,
                mobileStyles || {},
                submenuStyles || {}
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