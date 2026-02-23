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
    };
};