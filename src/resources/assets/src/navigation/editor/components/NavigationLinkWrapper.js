import { createHigherOrderComponent } from '@wordpress/compose';
import { useNavigationLinkWrapperClasses } from '../hooks/navigationLinkHooks.js';
import { getParentBlockAttribute, isChildOf } from '../../../utils/editor.js';

export const NavigationLinkWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes, setAttributes, clientId } = props;
            if (name !== 'core/navigation-link') {
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
            
            // Get type
            const isInSubmenu = isChildOf(clientId, 'core/navigation-submenu');
            const type = isInSubmenu
                ? getParentBlockAttribute(
                    clientId, 
                    'core/navigation', 
                    'merosMenu.submenuSettings.type', 
                    'dropdown-item'
                ) + '-item'
                : 'top-level-item';

            // Set type
            if (type !== attributes.merosMenuItem?.type) {
                setAttributes({
                    merosMenuItem: {
                        ...attributes.merosMenuItem,
                        type
                    }
                });
            }

            // Determine wrapper classes
            const wrapperClasses = useNavigationLinkWrapperClasses(type);

            return (
                <BlockListBlock 
                    {...props} 
                    wrapperProps={{ 
                        ...props.wrapperProps,
                        className: [props.wrapperProps?.className, wrapperClasses].filter(Boolean).join(' '),
                    }} 
                />
            );
        }
    },
    'addMerosNavigationLinkWrapper'
);