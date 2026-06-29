import { createHigherOrderComponent } from '@wordpress/compose';
import { useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

import { getParentBlockAttribute } from '../../../utils/editor.js';

import {
    useNavigationSubmenuWrapperClasses,
    useNavigationSubmenuWrapperStyles,
    useNavigationSubmenuWrapperRules
} from '../hooks/navigationSubmenuHooks.js';

export const NavigationSubmenuWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes, setAttributes, clientId } = props;
            if (name !== 'core/navigation-submenu') {
                return <BlockListBlock {...props} />;
            }

             // Meros Enabled
            const enabled = getParentBlockAttribute(
                clientId, 
                'core/navigation', 
                'merosMenu.enabled', 
                false
            );

            if (!enabled) {
                return <BlockListBlock {...props} />;
            }

            // Helpers
            const isMounted = useRef(false);

            // Get inner blocks
            const innerBlocks = useSelect((select) => {
                const { getBlocks } = select('core/block-editor');
                return getBlocks(clientId);
            }, [clientId]);

            // Get type
            const type = getParentBlockAttribute(
                clientId, 
                'core/navigation', 
                'merosMenu.submenuSettings.type', 
                'default'
            );

            // Set type
            if (type !== attributes.merosSubmenu?.type) {
                setAttributes({
                    merosSubmenu: {
                        ...attributes.merosSubmenu,
                        type
                    }
                });
            }

            // Block nested submenus if mega menu
            useNavigationSubmenuWrapperRules(innerBlocks, type, clientId, isMounted);

            // Determine wrapper classes
            const styles = attributes.merosSubmenu?.styles || {};
            const wrapperClasses = useNavigationSubmenuWrapperClasses(type, styles);

            // Determine wrapper styles
            const wrapperStyles = useNavigationSubmenuWrapperStyles(styles);

            return (
                <div className={wrapperClasses} style={wrapperStyles}>
                    <BlockListBlock 
                        {...props}
                        wrapperProps={{
                            ...props.wrapperProps,
                            className: [
                                props.wrapperProps?.className,
                                'meros-submenu'
                            ]
                        }}
                    />
                </div>
            );
        }
    },
'addMerosNavigationSubmenuWrapper'
);