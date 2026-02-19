import { createHigherOrderComponent } from '@wordpress/compose';
import { useNavigationLinkWrapperClasses } from '../hooks/navigationLinkHooks.js';

export const NavigationLinkWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes } = props;
            if (name !== 'core/navigation-link') {
                return <BlockListBlock {...props} />;
            }

            const type = attributes?.merosMenuItem?.type || 'dropdown-item';

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