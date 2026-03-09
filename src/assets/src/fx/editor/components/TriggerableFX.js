import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect, dispatch } from '@wordpress/data';

import { updateFx } from '../utils.js';
import { getFxAttrs } from '../hooks/fxAttributes.js';
import { Enable, Presets, Transform, Opacity, Rotation } from './FX.js';

export default function TriggerableFX({ attributes, setAttributes, clientId }) {
    const {
        enabled,
        preset,
        triggerId,
        triggeredAnimateX,
        triggeredAnimateY,
        triggeredAnimateScaleX,
        triggeredAnimateScaleY,
        triggeredAnimateOpacity,
        triggeredAnimateRotation,
        triggeredTransformDuration,
        triggeredTransformDelay,
        triggeredOpacityDuration,
        triggeredOpacityDelay,
        triggeredRotationDuration,
        triggeredRotationDelay
    } = attributes.merosTriggerableFx;

    const metadata = attributes?.metadata || {};

    const presets = [
        { label: __('Fade In', 'meros-theme'), value: 'fadeIn' },
        { label: __('Lift Up', 'meros-theme'), value: 'liftUp' },
        { label: __('Sink Down', 'meros-theme'), value: 'sinkDown' },
        { label: __('Manual', 'meros-theme'), value: 'manual' }
    ];

    const presetsMap = {
        fadeIn: {
            values: {
                triggeredAnimateOpacity: 0,
                triggeredAnimateScaleX: 1,
                triggeredAnimateScaleY: 1,
                triggeredAnimateX: 0,
                triggeredAnimateY: 0,
                triggeredAnimateHeight: 0,
                triggeredTransformDuration: 0.8,
                triggeredTransformDelay: 0,
                triggeredOpacityDuration: 0.8,
                triggeredOpacityDelay: 0,
                triggeredHeightDuration: 0.8,
                triggeredHeightDelay: 0
            }
        },
        liftUp: {
            values: {
                triggeredAnimateOpacity: 0,
                triggeredAnimateScaleX: 1,
                triggeredAnimateScaleY: 1,
                triggeredAnimateX: 0,
                triggeredAnimateY: -10,
                triggeredAnimateHeight: 0,
                triggeredTransformDuration: 0.8,
                triggeredTransformDelay: 0,
                triggeredOpacityDuration: 0.8,
                triggeredOpacityDelay: 0,
                triggeredHeightDuration: 0.8,
                triggeredHeightDelay: 0
            }
        },
        sinkDown: {
            values: {
                triggeredAnimateOpacity: 0,
                triggeredAnimateScaleX: 1,
                triggeredAnimateScaleY: 1,
                triggeredAnimateX: 0,
                triggeredAnimateY: 10,
                triggeredAnimateHeight: 0,
                triggeredTransformDuration: 0.8,
                triggeredTransformDelay: 0,
                triggeredOpacityDuration: 0.8,
                triggeredOpacityDelay: 0,
                triggeredHeightDuration: 0.8,
                triggeredHeightDelay: 0
            }
        }
    };

    const defaultValues = getFxAttrs('Triggerable');
    const isTransformPreset = preset !== 'manual' && preset !== 'fadeIn';
    const isManual = preset === 'manual';

    const triggeringBlocks = useSelect((select) => {
        const { getBlocksByName, getBlock } = select('core/block-editor');
        const thisName = metadata?.name;

        if (!thisName) return [];

        const allBlockIds = getBlocksByName('core/group');
        const blocks = allBlockIds.map(blockId => {
            const blockObj = getBlock(blockId);
            const attrs = blockObj?.attributes?.merosTriggerFx;
            if (
                attrs?.enabled &&
                attrs?.triggeredBlocks &&
                Array.isArray(attrs.triggeredBlocks) &&
                attrs.triggeredBlocks.includes(thisName) &&
                blockObj?.clientId !== clientId
            ) {
                return blockObj;
            }
            return null;
        }).filter(Boolean) || [];

        return blocks;
    }, [clientId]);

    const update = (patch) => {
        updateFx(
            setAttributes,
            'merosTriggerableFx',
            attributes.merosTriggerableFx,
            patch
        );
    };

    const updateTriggers = () => {
        const { updateBlockAttributes } = dispatch('core/block-editor');
        const thisName = metadata?.name;

        if (!thisName) return;

        triggeringBlocks.forEach(block => {
            const id = block.clientId;
            const triggeredBlocks = block.attributes.merosTriggerFx?.triggeredBlocks || [];
            updateBlockAttributes(id, {
                merosTriggerFx: {
                    ...block.attributes.merosTriggerFx,
                    triggeredBlocks: triggeredBlocks.filter(label => label !== thisName)
                }
            });
        });
    }

    useEffect(() => {
        if (!enabled) return;
        if (triggerId !== '') return;

        update({
            triggerId: clientId.slice(-8)
        });

        const editorName = metadata?.name || 'Group';
        setAttributes({
            metadata: {
                ...metadata,
                name: `${editorName} (Trigger: ${clientId.slice(-8)})`
            }
        })

    }, [enabled, triggerId, metadata, clientId]);

    return (
        <>
            <Enable
                enabled={enabled}
                onChange={(value) => {
                    if (value === false) {
                        update(defaultValues);
                        updateTriggers(); // Remove this block from all triggeredBlocks arrays
                        setAttributes({
                            metadata: {
                                ...metadata,
                                name: metadata?.name
                                    ? metadata.name.replace(/ \(Trigger: \w{8}\)$/, '')
                                    : undefined
                            }
                        }); // Reset the block name to remove the trigger label
                        return;
                    }
                    update({ enabled: true });
                }}
            />

            {enabled && (
                <>
                    <Presets
                        current={preset}
                        presets={presets}
                        defaultPreset={'fadeIn'}
                        onChange={(value) => {
                            const presetValues = presetsMap[value]?.values || {};
                            update({
                                preset: value,
                                ...presetValues
                            });
                        }}
                    />
                

                    {(isTransformPreset || isManual) && (
                        <Transform
                            translateX={triggeredAnimateX}
                            translateY={triggeredAnimateY}
                            scaleX={triggeredAnimateScaleX}
                            scaleY={triggeredAnimateScaleY}
                            duration={triggeredTransformDuration}
                            delay={triggeredTransformDelay}
                            prefix="triggered"
                            defaultValues={{
                                triggeredAnimateX: 0,
                                triggeredAnimateY: 0,
                                triggeredAnimateScaleX: 1,
                                triggeredAnimateScaleY: 1,
                                triggeredTransformDuration: 0.8,
                                triggeredTransformDelay: 0
                            }}
                            update={update}
                            showControls={isManual}
                        />
                    )}

                    <Opacity
                        current={triggeredAnimateOpacity}
                        duration={triggeredOpacityDuration}
                        delay={triggeredOpacityDelay}
                        prefix="triggered"
                        defaultValues={{
                            triggeredAnimateOpacity: 1,
                            triggeredOpacityDuration: 0.8,
                            triggeredOpacityDelay: 0
                        }}
                        update={update}
                        showControls={isManual}
                    />

                    <Rotation
                        current={triggeredAnimateRotation}
                        duration={triggeredRotationDuration}
                        delay={triggeredRotationDelay}
                        prefix="triggered"
                        defaultValues={{
                            triggeredAnimateRotation: 0,
                            triggeredRotationDuration: 0.8,
                            triggeredRotationDelay: 0
                        }}
                        update={update}
                    />
                </>
            )}
        </>
    );
}