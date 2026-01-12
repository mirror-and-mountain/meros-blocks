import { createHigherOrderComponent } from '@wordpress/compose';
import { removeClasses, removeStyleVars, StickyClasses, StickyStyleVars } from './utils.js';

export const addStickyElementEditorStyle = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes } = props;

            if (name !== 'core/group') {
                return <BlockListBlock {...props} />;
            }

            const {
                enabled,
                topOffset,
                removeHeaderBottomMargin,
                headerOffset
            } = attributes?.merosStickyElement || {};

            const baseClassName = removeClasses(
                props.wrapperProps?.className,
                StickyClasses
            );

            const baseStyle = removeStyleVars(
                props.wrapperProps?.style,
                StickyStyleVars
            );

            if (!enabled) {
                return (
                    <BlockListBlock
                        {...props}
                        wrapperProps={{
                            ...props.wrapperProps,
                            className: baseClassName,
                            style: baseStyle,
                        }}
                    />
                );
            }

            return (
                <BlockListBlock
                    {...props}
                    wrapperProps={{
                        ...props.wrapperProps,
                        className: [
                            baseClassName,
                            'meros-sticky-element',
                            removeHeaderBottomMargin && 'meros-header-no-bottom-margin',
                            headerOffset && 'meros-header-offset',
                        ]
                            .filter(Boolean)
                            .join(' ') || undefined,
                        style: {
                            ...baseStyle,
                            '--meros-sticky-top-offset': `${topOffset}px`,
                        },
                    }}
                />
            );
        };
    },
    'addStickyElementEditorStyle'
);