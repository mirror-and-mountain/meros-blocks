import { isCompatible, isEnabled } from '../utils.js';
import { AnimationClasses, useFxClasses, removeClasses } from './fxClasses.js';
import { AnimationStyleVars, useFxStyleVars, removeStyleVars } from './fxStyleVars.js';

export const saveFxStyles = (extraProps, blockType, attributes) => {
    if (!isCompatible(blockType.name)) {
        return extraProps;
    }

    // Clean up animation classes and style vars
    const baseClassName = removeClasses(
        extraProps.className || '',
        AnimationClasses
    );

    const baseStyle = removeStyleVars(
        extraProps.style || {},
        AnimationStyleVars
    );

    // Animation disabled - return fully cleaned props
    if (!isEnabled(attributes)) {
        return {
            ...extraProps,
            className: baseClassName,
            style: baseStyle,
        };
    }

    let dataAttrs = {};
    if (attributes?.merosTriggerFx?.enabled) {
        const triggeredBlocks = attributes?.merosTriggerFx?.triggeredBlocks || [];
        if (triggeredBlocks.length > 0) {
            const triggeredIds = triggeredBlocks.map(triggerLabel => {
                return triggerLabel.replace(/.*\(Trigger: (\w{8})\)$/, '$1');
            });
            dataAttrs['data-meros-triggered-ids'] = triggeredIds.join(' ');
        }

        const triggerType = attributes?.merosTriggerFx?.triggerType || 'toggle';
        if (triggerType === 'toggle' || triggerType === 'once') {
            dataAttrs['data-meros-trigger-type'] = triggerType;
        }

        const reverseOnNewSelection = attributes?.merosTriggerFx?.reverseOnNewSelection || false;
        if (reverseOnNewSelection === true) {
            dataAttrs['data-meros-trigger-reverse-on-new-selection'] = 'true';
        }
    }

    if (attributes?.merosTriggerableFx?.enabled) {
        const triggerId = attributes?.merosTriggerableFx?.triggerId || '';
        if (triggerId && triggerId !== '') {
            dataAttrs['data-meros-trigger-id'] = triggerId;
        }
    }

    // Animation enabled → add classes & vars cleanly
    return {
        ...extraProps,
        className: [
            ...useFxClasses(blockType.name, attributes, '', true),
            baseClassName,
        ].filter(Boolean).join(' ') || undefined,

        style: {
            ...baseStyle,
            ...useFxStyleVars(blockType.name, attributes, '', true),
        },
        ...dataAttrs
    };
};