import { createHigherOrderComponent } from '@wordpress/compose';
import { useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

import {
    useNavigationSubmenuWrapperClasses,
    useNavigationSubmenuWrapperLinkSync,
    useNavigationSubmenuWrapperRules
} from '../hooks/navigationSubmenuHooks.js';

export const NavigationSubmenuWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes, clientId } = props;
            if (name !== 'core/navigation-submenu') {
                return <BlockListBlock {...props} />;
            }

            // Helpers
            const isMounted = useRef(false);

            // Get inner blocks
            const innerBlocks = useSelect((select) => {
                const { getBlocks } = select('core/block-editor');
                return getBlocks(clientId);
            }, [clientId]);

            // Get settings
            const type = attributes?.merosSubmenu?.type || 'dropdown';
            const styles = attributes?.merosSubmenu?.styles || {};

            // Effects
            // Sync child link types with submenu type
            useNavigationSubmenuWrapperLinkSync(innerBlocks, type, isMounted);
            // Block nested submenus if mega menu
            useNavigationSubmenuWrapperRules(innerBlocks, type, clientId, isMounted);

            // Determine wrapper classes
            const wrapperClasses = useNavigationSubmenuWrapperClasses(type, styles);

            return (
                <div className={wrapperClasses}>
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