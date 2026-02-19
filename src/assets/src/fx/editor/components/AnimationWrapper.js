import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect, useState } from '@wordpress/element';

import { previewFx, isCompatible, isEnabled } from '../utils.js';

import { AnimationClasses, removeClasses, useFxClasses } from '../hooks/fxClasses.js';
import { AnimationStyleVars, removeStyleVars, useFxStyleVars } from '../hooks/fxStyleVars.js';

export const AnimationWrapper = createHigherOrderComponent(
    (BlockListBlock) => {
        return (props) => {
            const { name, attributes, setAttributes, clientId } = props;

            if (!isCompatible(name)) {
                return <BlockListBlock {...props} />;
            }

            const baseClassName = removeClasses(
                props.wrapperProps?.className || '',
                AnimationClasses
            );

            const baseStyle = removeStyleVars(
                props.wrapperProps?.style || {},
                AnimationStyleVars
            );

            const scrollPreview = attributes?.merosScrollFx?.scrollPreviewFx || false;
            const hoverPreview = previewFx.hoverPreviewFx[clientId] || false;
            const headerPreview = previewFx.headerPreviewFx[clientId] || false;

            const [isScrollAnimating, setIsScrollAnimating] = useState(false);
            const [isScrollAnimated, setIsScrollAnimated] = useState(false);
            const [hoverPreviewClasses, setHoverPreviewClasses] = useState([]);
            const [headerPreviewClasses, setHeaderPreviewClasses] = useState([]);

            useEffect(() => {
                if (!scrollPreview) return;

                setIsScrollAnimating(false);
                setIsScrollAnimated(false);

                requestAnimationFrame(() => {
                    setIsScrollAnimating(true);

                    requestAnimationFrame(() => {
                        setIsScrollAnimated(true);

                        setTimeout(() => {
                            setAttributes({
                                merosScrollFx: {
                                    ...attributes.merosScrollFx,
                                    scrollPreviewFx: false
                                }
                            });
                        }, 0);
                    });
                });
            }, [scrollPreview]);

            useEffect(() => {
                if (hoverPreview) {
                    setHoverPreviewClasses([
                        'meros-preview-hover-fx'
                    ]);
                } else {
                    setHoverPreviewClasses([]);
                }

                if (headerPreview) {
                    setHeaderPreviewClasses([
                        'meros-preview-header-fx'
                    ]);
                } else {
                    setHeaderPreviewClasses([]);
                }
            }, [hoverPreview, headerPreview]);

            if (!isEnabled(attributes)) {
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

            const fxClasses = useFxClasses(name, attributes, clientId);

            const scrollPreviewClasses = scrollPreview
                ? [
                    isScrollAnimating && 'meros-animating',
                    isScrollAnimated && 'meros-animated',
                ]
                : [];

            return (
                <BlockListBlock
                    {...props}
                    wrapperProps={{
                        ...props.wrapperProps,
                        className: [
                            ...fxClasses,
                            ...scrollPreviewClasses,
                            ...hoverPreviewClasses,
                            ...headerPreviewClasses,
                            baseClassName,
                        ]
                            .filter(Boolean)
                            .join(' ') || undefined,
                        style: {
                            ...baseStyle,
                            ...useFxStyleVars(name, attributes, clientId),
                        },
                    }}
                />
            );
        };
    },
    'addEditorAnimationWrapper'
);
