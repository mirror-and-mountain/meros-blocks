import { isScrollFxBlock, isHoverFxBlock, isHeaderFxBlock } from '../utils.js';
import { getFxAttrs } from './fxAttributes';

// CSS variables used for blocks with fx enabled
export const AnimationStyleVars = [
    '--meros-scroll-animate-x',
    '--meros-scroll-animate-y',
    '--meros-scroll-transform-duration',
    '--meros-scroll-transform-delay',
    '--meros-scroll-animate-opacity',
    '--meros-scroll-opacity-duration',
    '--meros-scroll-opacity-delay',
    '--meros-scroll-animate-scale-x',
    '--meros-scroll-animate-scale-y',
    '--meros-scroll-animate-bg-color',
    '--meros-scroll-animate-text-color',
    '--meros-scroll-animate-link-color',
    '--meros-scroll-animate-link-hover-color',
    '--meros-scroll-color-duration',
    '--meros-scroll-color-delay',
    '--meros-hover-animate-x',
    '--meros-hover-animate-y',
    '--meros-hover-animate-scale-x',
    '--meros-hover-animate-scale-y',
    '--meros-hover-transform-duration',
    '--meros-hover-transform-delay',
    '--meros-header-animate-bg-color-start',
    '--meros-header-animate-bg-color-end',
    '--meros-header-animate-text-color-start',
    '--meros-header-animate-text-color-end',
    '--meros-header-animate-link-color-start',
    '--meros-header-animate-link-color-end',
    '--meros-header-animate-link-hover-color-start',
    '--meros-header-animate-link-hover-color-end',
    '--meros-header-color-duration',
    '--meros-header-color-delay',
    '--meros-animated-logo-width',
    '--meros-logo-width-duration',
    '--meros-logo-width-delay'
];

// CSS variables used for sticky blocks
export const StickyStyleVars = [
    '--meros-sticky-top-offset',
];

// Maps fx attributes to CSS variables
export const FxVarMap = {
    scrollAnimateX: v => ({ '--meros-scroll-animate-x': `${v}%` }),
    scrollAnimateY: v => ({ '--meros-scroll-animate-y': `${v}%` }),
    scrollTransformDuration: v => ({ '--meros-scroll-transform-duration': `${v}s` }),
    scrollTransformDelay: v => ({ '--meros-scroll-transform-delay': `${v}s` }),
    scrollAnimateOpacity: v => ({ '--meros-scroll-animate-opacity': v }),
    scrollOpacityDuration: v => ({ '--meros-scroll-opacity-duration': `${v}s` }),
    scrollOpacityDelay: v => ({ '--meros-scroll-opacity-delay': `${v}s` }),
    scrollAnimateScaleX: v => ({ '--meros-scroll-animate-scale-x': v }),
    scrollAnimateScaleY: v => ({ '--meros-scroll-animate-scale-y': v }),
    scrollAnimateBgColor: v => ({ '--meros-scroll-animate-bg-color': v }),
    scrollAnimateTextColor: v => ({ '--meros-scroll-animate-text-color': v }),
    scrollAnimateLinkColor: v => ({ '--meros-scroll-animate-link-color': v }),
    scrollAnimateLinkHoverColor: v => ({ '--meros-scroll-animate-link-hover-color': v }),
    scrollColorDuration: v => ({ '--meros-scroll-color-duration': `${v}s` }),
    scrollColorDelay: v => ({ '--meros-scroll-color-delay': `${v}s` }),
    hoverAnimateX: v => ({ '--meros-hover-animate-x': `${v}px` }),
    hoverAnimateY: v => ({ '--meros-hover-animate-y': `${v}px` }),
    hoverAnimateScaleX: v => ({ '--meros-hover-animate-scale-x': v }),
    hoverAnimateScaleY: v => ({ '--meros-hover-animate-scale-y': v }),
    hoverAnimateBgColor: v => ({ '--meros-hover-animate-bg-color': v }),
    hoverAnimateTextColor: v => ({ '--meros-hover-animate-text-color': v }),
    hoverTransformDuration: v => ({ '--meros-hover-transform-duration': `${v}s` }),
    hoverTransformDelay: v => ({ '--meros-hover-transform-delay': `${v}s` }),
    hoverColorDuration: v => ({ '--meros-hover-color-duration': `${v}s` }),
    hoverColorDelay: v => ({ '--meros-hover-color-delay': `${v}s` }),
    headerAnimateBgColor: v => ({ '--meros-header-animate-bg-color-start': v }),
    headerAnimateBgColorEnd: v => ({ '--meros-header-animate-bg-color-end': v }),
    headerAnimateTextColor: v => ({ '--meros-header-animate-text-color-start': v }),
    headerAnimateTextColorEnd: v => ({ '--meros-header-animate-text-color-end': v }),
    headerAnimateLinkColor: v => ({ '--meros-header-animate-link-color-start': v }),
    headerAnimateLinkColorEnd: v => ({ '--meros-header-animate-link-color-end': v }),
    headerAnimateLinkHoverColor: v => ({ '--meros-header-animate-link-hover-color-start': v }),
    headerAnimateLinkHoverColorEnd: v => ({ '--meros-header-animate-link-hover-color-end': v }),
    headerAnimateLogoWidth: v => ({ '--meros-header-animated-logo-width': v })
};

export function useFxStyleVars(blockName, attrs, clientId = '', save = false) {
    const NON_STYLE_KEYS = new Set(['enabled', 'preset', 'animateOnSlideChange']);

    const diffAttrs = (current, defaults = {}) => {
        const safeCurrent = current ?? {};
        return Object.fromEntries(
            Object.entries(safeCurrent).filter(
                ([key, value]) =>
                    !NON_STYLE_KEYS.has(key) &&
                    value !== defaults[key]
            )
        );
    };

    const fxToStyleVars = diff => {
        if (!diff || typeof diff !== 'object') {
            return {};
        }

        return Object.assign(
            {},
            ...Object.entries(diff)
                .filter(([key]) => FxVarMap[key])
                .map(([key, value]) => FxVarMap[key](value))
        );
    };

    const styleVars = {};

    if (isScrollFxBlock(blockName, attrs.merosScrollFx)) {
        Object.assign(
            styleVars,
            fxToStyleVars(diffAttrs(attrs.merosScrollFx, getFxAttrs('Scroll')))
        );
    }

    if (clientId !== '' && isHeaderFxBlock(blockName, attrs.merosHeaderFx, clientId, save)) {
        Object.assign(
            styleVars,
            fxToStyleVars(diffAttrs(attrs.merosHeaderFx, getFxAttrs('Header')))
        );
    }

    if (isHoverFxBlock(blockName, attrs.merosHoverFx)) {
        Object.assign(
            styleVars,
            fxToStyleVars(diffAttrs(attrs.merosHoverFx, getFxAttrs('Hover')))
        );
    }

    return styleVars;
}

// Cleans fx CSS variables from the given style object
export function removeStyleVars(style = {}, vars = []) {
    const cleaned = { ...style };
    vars.forEach((key) => {
        delete cleaned[key];
    });

    return cleaned;
}