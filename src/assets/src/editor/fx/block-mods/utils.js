export const ScrollFxBlocks = [
    'core/group',
    'core/heading',
    'core/paragraph'
];

export const HoverFxBlocks = [
    'core/group',
    'core/image',
    'core/button'
];

export const HeaderFxBlocks = [
    'core/group'
];

export const AnimationClasses = [
    'meros-has-scroll-animation',
    'meros-has-hover-animation',
    'meros-has-header-animation',
    'meros-has-animated-logo',
    'meros-has-animated-bg-color',
    'meros-has-animated-text-color',
    'meros-has-animated-link-color',
    'meros-has-animated-link-hover-color',
    'meros-animate-on-slide-change',
    'meros-animating',
    'meros-animated',
    'meros-preview-hover-fx',
    'meros-preview-header-fx',
    'meros-preview-logo-fx'
];

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

export const StickyClasses = [
    'meros-sticky-element',
    'meros-header-offset',
    'meros-header-no-bottom-margin',
];

export const StickyStyleVars = [
    '--meros-sticky-top-offset',
];

export const previewFx = {
    hoverPreviewFx: {},
    headerPreviewFx: {}
};

const FxVarMap = {
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
    hoverTransformDuration: v => ({ '--meros-hover-transform-duration': `${v}s` }),
    hoverTransformDelay: v => ({ '--meros-hover-transform-delay': `${v}s` }),
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

const isScrollFxBlock = (blockName, attrs) => {
    return ScrollFxBlocks.includes(blockName) && attrs?.enabled;
};

const isHoverFxBlock = (blockName, attrs) => {
    return HoverFxBlocks.includes(blockName) && attrs?.enabled;
};

const isHeaderFxBlock = (blockName, attrs, clientId, save = false) => {
    if (!save) {
        const isInHeader = getBlockParentType(clientId) === 'header';
        return isInHeader && HeaderFxBlocks.includes(blockName) && attrs?.enabled;
    }

    return HeaderFxBlocks.includes(blockName) && attrs?.enabled;
};

const isInSwiper = (clientId) => {
    getBlockParentType(clientId) === 'swiper';
};

export const isCompatible = (blockName) => {
    const isScrollAnimate = ScrollFxBlocks.includes(blockName)
    const isHoverAnimate = HoverFxBlocks.includes(blockName)
    const isHeaderAnimate = HeaderFxBlocks.includes(blockName)

    return isScrollAnimate || isHoverAnimate || isHeaderAnimate;
};

export const isEnabled = (attributes) => {
    const scrollEnabled = attributes.merosScrollFx?.enabled;
    const hoverEnabled = attributes.merosHoverFx?.enabled;
    const headerEnabled = attributes.merosHeaderFx?.enabled;

    return scrollEnabled || hoverEnabled || headerEnabled;
};

export function setPreviewFx(fxType, clientId, value) {
    previewFx[`${fxType}PreviewFx`][clientId] = value;
}

export function getFxAttrs(fxType) {
    switch (fxType) {
        case 'Scroll':
            return {
                enabled: false,
                preset: 'fadeIn',
                scrollAnimateX: 0,
                scrollAnimateY: 0,
                scrollAnimateScaleX: 1,
                scrollAnimateScaleY: 1,
                scrollAnimateOpacity: 1,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0.8,
                scrollColorDelay: 0,
                animateOnSlideChange: false,
                scrollPreviewFx: false
            };
        case 'Hover':
            return {
                enabled: false,
                preset: 'grow',
                hoverAnimateX: 0,
                hoverAnimateY: 0,
                hoverAnimateScaleX: 1,
                hoverAnimateScaleY: 1,
                hoverTransformDuration: 0.3,
                hoverTransformDelay: 0
            };
        case 'Header':
            return {
                enabled: false,
                headerAnimateBgColor: '',
                headerAnimateBgColorEnd: '',
                headerAnimateTextColor: '',
                headerAnimateTextColorEnd: '',
                headerAnimateLinkColor: '',
                headerAnimateLinkColorEnd: '',
                headerAnimateLinkHoverColor: '',
                headerAnimateLinkHoverColorEnd: '',
                headerColorDuration: 0.8,
                headerColorDelay: 0,
                headerAnimateLogoWidth: 1
            };
        case 'Sticky': {
            return {
                enabled: false,
                topOffset: 0,
                removeHeaderBottomMargin: false,
                headerOffset: false
            };
        }
        default:
            return {};
    }
}

export function updateFx(setAttributes, attribute, fx, patch) {
    setAttributes({
        [attribute]: {
            ...fx,
            ...patch
        }
    }); 
};

export function removeStyleVars(style = {}, vars = []) {
    const cleaned = { ...style };
    vars.forEach((key) => {
        delete cleaned[key];
    });

    return cleaned;
}

export function removeClasses(className = '', classesToRemove = []) {
    return className
        .split(/\s+/)
        .filter((cls) => cls && !classesToRemove.includes(cls))
        .join(' ');
}

export function hasSiteLogo(clientId) {
    const { getBlock } = wp.data.select('core/block-editor');

    function checkBlock(block, depth = 1) {
        if (!block || depth > 5) {
            return false;
        }

        if (block.name === 'core/site-logo') {
            return true;
        }

        for (const inner of block.innerBlocks ?? []) {
            const result = checkBlock(inner, depth + 1);
            if (result !== false) {
                return result;
            }
        }

        return false;
    }

    const rootBlock = getBlock(clientId);
    return checkBlock(rootBlock, 1);
}

export function getBlockParentType(clientId) {
    const { getBlock, getBlockParents } = wp.data.select('core/block-editor');
    const parents = getBlockParents(clientId);

    for (const parentClientId of parents) {
        const parentBlock = getBlock(parentClientId);
        if (parentBlock?.name === 'core/template-part' &&
            parentBlock?.attributes?.slug === 'header'
        ) {
            if (parents.length === 1 && parentBlock.clientId === parentClientId) {
                return 'header';
            } else if (parents.length > 1) {
                return 'inner-header';
            } else {
                return false;
            }
        }
        if (parentBlock?.name === 'meros/swiper') {
            return 'swiper';
        }
    }
    return false;
}

export function resolveWPColor(input, scope = document.documentElement) {
  if (!input || typeof input !== 'string') return null;

  let value = input.trim();

  // Case 1: Gutenberg preset reference
  if (value.startsWith('var:preset|color|')) {
    const slug = value.split('|').pop();
    const cssVar = `--wp--preset--color--${slug}`;
    const resolved = getComputedStyle(scope).getPropertyValue(cssVar).trim();
    return resolved || null;
  }

  // Case 2: Raw preset slug
  if (!value.startsWith('#') && !value.startsWith('rgb') && !value.startsWith('hsl') && !value.startsWith('var(')) {
    const cssVar = `--wp--preset--color--${value}`;
    const resolved = getComputedStyle(scope).getPropertyValue(cssVar).trim();
    if (resolved) return resolved;
  }

  // Case 3: Already a concrete CSS colour → pass through
  return value;
}

export function getFxClasses(blockName, attrs, clientId, save = false) {
    const classes = [];

    if (isEnabled(attrs) === false) {
        return classes;
    }

    classes.push('meros-has-block-animation');

    const hasClassAttr = (blockName, attr, attrs) => {
        if (!isScrollFxBlock(blockName, attrs.merosScrollFx) &&
            !isHeaderFxBlock(blockName, attrs.merosHeaderFx, clientId, save)) {
            return false;
        }

        const prefix = isScrollFxBlock(blockName, attrs.merosScrollFx)
            ? 'scroll'
            : 'header';

        const attrName = `${prefix}${attr.charAt(0).toUpperCase()}${attr.slice(1)}`;

        return Boolean(
            attrs.merosScrollFx?.[attrName] ||
            attrs.merosHeaderFx?.[attrName]
        );
    };

    if (isScrollFxBlock(blockName, attrs.merosScrollFx)) {
        classes.push('meros-has-scroll-animation');
        if (isInSwiper(clientId) && attrs.merosScrollFx.animateOnSlideChange) {
            classes.push('meros-animate-on-slide-change');
        }
    }

    if (isHoverFxBlock(blockName, attrs.merosHoverFx)) {
        classes.push('meros-has-hover-animation');
    }

    if (isHeaderFxBlock(blockName, attrs.merosHeaderFx, clientId, save)) {
        classes.push('meros-has-header-animation');
        if (attrs.merosHeaderFx.headerAnimateLogoWidth !== 100) {
            classes.push('meros-has-animated-logo-width');
        }
    }

    if (hasClassAttr(blockName, 'animateBgColor', attrs)) {
        classes.push('meros-has-animated-bg-color');
    }

    if (hasClassAttr(blockName, 'animateTextColor', attrs)) {
        classes.push('meros-has-animated-text-color');
    }

    if (hasClassAttr(blockName, 'animateLinkColor', attrs)) {
        classes.push('meros-has-animated-link-color');
    }

    if (hasClassAttr(blockName, 'animateLinkHoverColor', attrs)) {
        classes.push('meros-has-animated-link-hover-color');
    }

    return classes;
}

export function getFxStyleVars(blockName, attrs, clientId, save = false) {
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

    if (isHeaderFxBlock(blockName, attrs.merosHeaderFx, clientId, save)) {
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