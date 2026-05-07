import { __ } from '@wordpress/i18n';
import { useSelect, dispatch } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { ToggleControl, FormTokenField, SelectControl } from '../../../components/Controls.js';

import { updateFx, previewFx } from '../utils.js';
import { getFxAttrs } from '../hooks/fxAttributes.js';
import { Enable, Color } from './FX.js';

export default function TriggerFX({ name, attributes, setAttributes, clientId, setPreview }) {
    const {
        enabled,
        triggeredBlocks,
        triggerType,
        reverseOnNewSelection,
        triggerHoverAnimateBgColor,
        triggerHoverAnimateTextColor,
        triggerHoverAnimateLinkColor,
        triggerActiveAnimateBgColor,
        triggerActiveAnimateTextColor,
        triggerActiveAnimateLinkColor
    } = attributes.merosTriggerFx;

    const { triggeredBlockObjects, triggerableBlocks } = useSelect((select) => {
        const { getBlocksByName, getBlock } = select('core/block-editor');
        const allBlockIds = getBlocksByName('core/group');
        
        const triggeredBlockObjects = allBlockIds.map(blockId => {
            const blockObj = getBlock(blockId);
            if (!blockObj) return null;

            const attrs = blockObj?.attributes;
            const metadata = blockObj?.attributes?.metadata || {};

            if (
                blockObj?.clientId !== clientId &&
                metadata?.name &&
                attrs?.merosTriggerableFx?.enabled &&
                attrs?.merosTriggerableFx?.triggerId &&
                attrs?.merosTriggerableFx?.triggerId !== '' &&
                triggeredBlocks.includes(metadata?.name)
            ) {
                return blockObj;
            }
            return null;
        }).filter(Boolean) || [];

        const triggerableBlocks = allBlockIds.map(blockId => {
            const blockObj = getBlock(blockId);
            if (!blockObj) return null;

            const attrs = blockObj?.attributes;
            if (
                attrs?.merosTriggerableFx?.enabled && 
                attrs?.merosTriggerableFx?.triggerId &&
                attrs?.merosTriggerableFx?.triggerId !== '' &&
                blockObj?.clientId !== clientId
            ) {
                return blockObj;
            }
            return null;
        }).filter(Boolean) || [];

        return { triggeredBlockObjects, triggerableBlocks };
    }, [clientId]);

    const defaultValues = getFxAttrs('Trigger');
    const defaultHoverValues = getFxAttrs('Hover');
    const preview = previewFx.triggerPreviewFx[clientId] || false;

    const update = (patch) => {
        updateFx(
            setAttributes,
            'merosTriggerFx',
            attributes.merosTriggerFx,
            patch
        );
    };

    const previewAnimation = (preview) => {
        const { updateBlockAttributes } = dispatch('core/block-editor');

        // Set preview on this block
        setPreview('trigger', clientId, preview);

        // Set preview on triggered blocks
        triggeredBlockObjects.forEach(block => {
            setPreview('triggered', block.clientId, preview);
            // Force re-render
            updateBlockAttributes(block.clientId, {
                merosTriggerableFx: {
                    ...block.attributes.merosTriggerableFx,
                    triggeredPreviewFx: !preview
                }
            });
        });

        // Force re-render
        setAttributes({
            merosTriggerFx: {
                ...attributes.merosTriggerFx,
                enabled: true
            }
        });
    };

    return (
        <>
            <Enable
                enabled={enabled}
                onChange={(value) => {
                    if (value === false) {
                        update(defaultValues);
                        previewAnimation(false);
                        return;
                    }
                    update({ enabled: true });
                    
                    // Disable hover fx
                    setAttributes({
                        merosHoverFx: {
                            ...attributes.merosHoverFx,
                            ...defaultHoverValues
                        }
                    })
                }}
            />

            {enabled && (
                <>
                    <FormTokenField
                        label={__('Triggered Blocks', 'meros-theme')}
                        value={triggeredBlocks}
                        suggestions={triggerableBlocks.map(block => (
                            block?.attributes?.metadata?.name || 'Group'
                        ))}
                        onChange={(selectedBlocks) => {
                            const newBlocks = [];
                            selectedBlocks.forEach(blockName => {
                                const triggerId = blockName.replace(/.*\(Trigger: (\w{8})\)$/, '$1');
                                const block = triggerableBlocks.find(block => block.attributes?.merosTriggerableFx?.triggerId === triggerId);
                                if (block) {
                                    newBlocks.push(blockName);
                                }
                            });

                            update({ triggeredBlocks: newBlocks});
                        }}
                    />

                    <SelectControl 
                        label={__('Trigger Type', 'meros-theme')}
                        value={triggerType}
                        options={[
                            { label: __('Toggle', 'meros-theme'), value: 'toggle' },
                            { label: __('Once', 'meros-theme'), value: 'once' }
                        ]}
                        onChange={(value) => {
                            update({ triggerType: value });
                        }}
                    />

                    <ToggleControl
                        label={__('Reverse on New Selection', 'meros-theme')}
                        checked={reverseOnNewSelection}
                        onChange={(value) => {
                            update({ reverseOnNewSelection: value });
                        }}
                    />

                    <Button
                        variant="secondary"
                        onClick={() => previewAnimation(!preview)}
                        style={{ width: '100%' }}
                    >
                        {__(preview ? 'Stop Previewing in Editor' : 'Preview In Editor', 'meros-theme')}
                    </Button>

                    {name !== 'core/button' && (
                        <Color
                            bg={triggerHoverAnimateBgColor}
                            text={triggerHoverAnimateTextColor}
                            link={triggerHoverAnimateLinkColor}
                            duration={0.3}
                            delay={0}
                            prefix="triggerHover"
                            showTiming={false}
                            defaultValues={{
                                triggerHoverAnimateBgColor: '',
                                triggerHoverAnimateTextColor: '',
                                triggerHoverAnimateLinkColor: ''
                            }}
                            bgLabel={__('Hover Background Colour', 'meros-theme')}
                            textLabel={__('Hover Text Colour', 'meros-theme')}
                            linkLabel={__('Hover Link Colour', 'meros-theme')}
                            update={update}
                        />
                    )}

                    <Color
                        bg={triggerActiveAnimateBgColor}
                        text={triggerActiveAnimateTextColor}
                        link={triggerActiveAnimateLinkColor}
                        duration={0.3}
                        delay={0}
                        prefix="triggerActive"
                        showTiming={false}
                        defaultValues={{
                            triggerActiveAnimateBgColor: '',
                            triggerActiveAnimateTextColor: '',
                            triggerActiveAnimateLinkColor: ''
                        }}
                        bgLabel={__('Active Background Colour', 'meros-theme')}
                        textLabel={__('Active Text Colour', 'meros-theme')}
                        linkLabel={__('Active Link Colour', 'meros-theme')}
                        update={update}
                    />
                </>
            )}
        </>
    );
}