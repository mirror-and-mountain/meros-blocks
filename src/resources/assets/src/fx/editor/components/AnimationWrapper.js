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
            const triggerPreview = previewFx.triggerPreviewFx[clientId] || false;
            const triggerablePreview = previewFx.triggeredPreviewFx[clientId] || false;
            const triggerId = attributes?.merosTriggerableFx?.triggerId || null;
            const triggeredBlocks = attributes?.merosTriggerFx?.triggeredBlocks || [];
            const triggerType = attributes?.merosTriggerFx?.triggerType || 'toggle';
            const reverseOnNewSelection = attributes?.merosTriggerFx?.reverseOnNewSelection || false;

            const [isScrollAnimating, setIsScrollAnimating] = useState(false);
            const [isScrollAnimated, setIsScrollAnimated] = useState(false);
            const [hoverPreviewClasses, setHoverPreviewClasses] = useState([]);
            const [headerPreviewClasses, setHeaderPreviewClasses] = useState([]);
            const [triggerPreviewClasses, setTriggerPreviewClasses] = useState([]);
            const [triggerablePreviewClasses, setTriggerablePreviewClasses] = useState([]);

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

                if (triggerPreview) {
                    setTriggerPreviewClasses([
                        'meros-preview-trigger-fx'
                    ]);
                } else {
                    setTriggerPreviewClasses([]);
                }

                if (triggerablePreview) {
                    setTriggerablePreviewClasses([
                        'meros-preview-triggered-fx'
                    ]);
                } else {
                    setTriggerablePreviewClasses([]);
                }

            }, [hoverPreview, headerPreview, triggerPreview, triggerablePreview]);

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


            let dataAttrs = {};
            if (attributes?.merosTriggerFx?.enabled) {
                if (triggeredBlocks.length > 0) {
                    const triggeredIds = triggeredBlocks.map(triggerLabel => {
                        return triggerLabel.replace(/.*\(Trigger: (\w{8})\)$/, '$1');
                    });
                    dataAttrs['data-meros-triggered-ids'] = triggeredIds.join(' ');
                }

                if (
                    triggerType === 'toggle' ||
                    triggerType === 'once'
                ) {
                    dataAttrs['data-meros-trigger-type'] = triggerType;
                }

                if (reverseOnNewSelection === true) {
                    dataAttrs['data-meros-trigger-reverse-on-new-selection'] = 'true';
                }
            }

            if (attributes?.merosTriggerableFx?.enabled) {
                if (triggerId && triggerId !== '') {
                    dataAttrs['data-meros-trigger-id'] = triggerId;
                }
            }

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
                            ...triggerPreviewClasses,
                            ...triggerablePreviewClasses,
                            baseClassName,
                        ]
                            .filter(Boolean)
                            .join(' ') || undefined,
                        style: {
                            ...baseStyle,
                            ...useFxStyleVars(name, attributes, clientId),
                        },
                        ...dataAttrs
                    }}
                />
            );
        };
    },
    'addEditorAnimationWrapper'
);
