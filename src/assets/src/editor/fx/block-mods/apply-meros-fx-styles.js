import {
    isCompatible,
    isEnabled,
    AnimationClasses,
    AnimationStyleVars,
    removeClasses,
    removeStyleVars,
    getFxClasses,
    getFxStyleVars
} from './utils.js';

// Refactored to use helpers and logic similar to add-editor-animation-wrapper.js
export const applyMerosFxStyles = (extraProps, blockType, attributes, clientId) => {
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
            ...getFxClasses(blockType.name, attributes, clientId, true),
            baseClassName,
        ].filter(Boolean).join(' ') || undefined,

        style: {
            ...baseStyle,
            ...getFxStyleVars(blockType.name, attributes, clientId, true),
        },
    };
};