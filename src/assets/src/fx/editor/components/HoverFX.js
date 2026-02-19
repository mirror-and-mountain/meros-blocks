import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { previewFx, updateFx } from '../utils.js';
import { getFxAttrs } from '../hooks/fxAttributes.js';
import { Enable, Presets, Transform } from './FX.js';

export default function HoverFX({ attributes, setAttributes, clientId, setPreview }) {
    const {
        enabled,
        preset,
        hoverAnimateX,
        hoverAnimateY,
        hoverAnimateScaleX,
        hoverAnimateScaleY,
        hoverTransformDuration,
        hoverTransformDelay
    } = attributes.merosHoverFx;

    const presets = [
        { label: __('Grow', 'meros-theme'), value: 'grow' },
        { label: __('Shrink', 'meros-theme'), value: 'shrink' },
        { label: __('Lift Up', 'meros-theme'), value: 'liftUp' },
        { label: __('Sink Down', 'meros-theme'), value: 'sinkDown' },
        { label: __('Manual', 'meros-theme'), value: 'manual' }
    ];

    const presetsMap = {
        grow: {
            values: {
                hoverAnimateScaleX: 1.05,
                hoverAnimateScaleY: 1.05,
                hoverAnimateX: 0,
                hoverAnimateY: 0,
                hoverTransformDuration: 0.3,
                hoverTransformDelay: 0
            }
        },
        shrink: {
            values: {
                hoverAnimateScaleX: 0.95,
                hoverAnimateScaleY: 0.95,
                hoverAnimateX: 0,
                hoverAnimateY: 0,
                hoverTransformDuration: 0.3,
                hoverTransformDelay: 0
            }
        },
        liftUp: {
            values: {
                hoverAnimateX: 0,
                hoverAnimateY: -10,
                hoverAnimateScaleX: 1,
                hoverAnimateScaleY: 1,
                hoverTransformDuration: 0.3,
                hoverTransformDelay: 0
            }
        },
        sinkDown: {
            values: {
                hoverAnimateX: 0,
                hoverAnimateY: 10,
                hoverAnimateScaleX: 1,
                hoverAnimateScaleY: 1,
                hoverTransformDuration: 0.3,
                hoverTransformDelay: 0
            }
        },
        manual: {
            values: {
                hoverAnimateX: 0,
                hoverAnimateY: 0,
                hoverAnimateScaleX: 1,
                hoverAnimateScaleY: 1,
                hoverTransformDuration: 0,
                hoverTransformDelay: 0
            }
        }
    }

    const defaultValues = getFxAttrs('Hover');
    const isManual = preset === 'manual';
    const preview = previewFx.hoverPreviewFx[clientId] || false;

    const update = (patch) => {
        updateFx(
            setAttributes, 
            'merosHoverFx', 
            attributes.merosHoverFx, 
            patch
        );
    }

    const previewAnimation = () => {
        setPreview('hover', clientId, !preview);
        // Force a re-render
        setAttributes({
            merosHoverFx: {
                ...attributes.merosHoverFx,
                enabled: true
            }
        });
    }

    return (
        <>
            <Enable
                enabled={enabled}
                onChange={(value) => {
                    if (value === false) {
                        update(defaultValues);
                        setPreview('hover', clientId, false);
                        return;
                    }
                    update({ 
                        enabled: true,
                        preset: 'grow' 
                    });
                }}
            />
            
            {enabled && (
                <>
                    <Presets
                        current={preset}
                        presets={presets}
                        defaultPreset={'grow'}
                        onChange={(value) => {
                            const presetValues = presetsMap[value]?.values || {};
                            update({
                                preset: value,
                                ...presetValues
                            });
                        }}
                    />

                    <Button
                        variant="secondary"
                        onClick={previewAnimation}
                        style={{ width: '100%' }}
                    >
                        {__(preview ? 'Stop Previewing in Editor' : 'Preview In Editor', 'meros-theme')}
                    </Button>

                    <Transform
                        translateX={hoverAnimateX}
                        translateY={hoverAnimateY}
                        scalexeX={hoverAnimateScaleX}
                        scaleY={hoverAnimateScaleY}
                        duration={hoverTransformDuration}
                        delay={hoverTransformDelay}
                        prefix="hover"
                        defaultValues={{
                            hoverAnimateX: 0,
                            hoverAnimateY: 0,
                            hoverAnimateScaleX: 1,
                            hoverAnimateScaleY: 1,
                            hoverTransformDuration: 0.5,
                            hoverTransformDelay: 0
                        }}
                        update={update}
                        showControls={isManual}
                    />
                </>
            )}
        </>
    );
}