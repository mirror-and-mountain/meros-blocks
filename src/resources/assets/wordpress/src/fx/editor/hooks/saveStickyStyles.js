import { StickyClasses, removeClasses } from './fxClasses.js';
import { StickyStyleVars, removeStyleVars } from './fxStyleVars.js';

export const saveStickyStyles = (extraProps, blockType, attributes, clientId) => {
    if (blockType.name !== 'core/group') return extraProps;

    // Clean up sticky classes and style vars
    extraProps.className = removeClasses(
        extraProps.className,
        StickyClasses
    );

    extraProps.style = removeStyleVars(
        extraProps.style,
        StickyStyleVars
    );

    const {
        enabled,
        topOffset,
        removeHeaderBottomMargin,
        headerOffset
    } = attributes?.merosStickyElement || {};

    if (!enabled) return extraProps;

    extraProps.className = [
        extraProps.className,
        'meros-sticky-element',
        removeHeaderBottomMargin && 'meros-header-no-bottom-margin',
        headerOffset && 'meros-header-offset',
    ]
        .filter(Boolean)
        .join(' ') || undefined;

    extraProps.style = {
        ...extraProps.style,
        '--meros-sticky-top-offset': `${topOffset}px`
    };

    return extraProps;
};