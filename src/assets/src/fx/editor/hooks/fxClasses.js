import {
    isEnabled,
    isTriggerFxBlock,
    isTriggerableFxBlock,
    isScrollFxBlock,
    isHoverFxBlock,
    isHeaderFxBlock
} from '../utils.js';

import { isChildOf } from '../../../utils/editor.js';

// Classes used on blocks with fx enabled
export const AnimationClasses = [
    'meros-is-animation-trigger',
    'meros-has-triggerable-animation',
    'meros-has-scroll-animation',
    'meros-has-hover-transform-animation',
    'meros-has-hover-color-animation',
    'meros-has-header-animation',
    'meros-has-animated-logo',
    'meros-has-animated-bg-color',
    'meros-has-animated-text-color',
    'meros-has-animated-link-color',
    'meros-has-animated-link-hover-color',
    'meros-animate-on-slide-change',
    'meros-start-hidden',
    'meros-animating',
    'meros-animated',
    'meros-preview-hover-fx',
    'meros-preview-header-fx',
    'meros-preview-logo-fx',
    'meros-preview-trigger-fx',
    'meros-preview-triggered-fx'
];

// Classes used for sticky blocks
export const StickyClasses = [
    'meros-sticky-element',
    'meros-header-offset',
    'meros-header-no-bottom-margin',
];

export function useFxClasses(blockName, attrs, clientId = '', save = false) {
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

    if (isTriggerFxBlock(blockName, attrs.merosTriggerFx)) {
        classes.push('meros-is-animation-trigger');
    }

    if (isTriggerableFxBlock(blockName, attrs.merosTriggerableFx)) {
        classes.push('meros-has-triggerable-animation');

        if (attrs.merosTriggerableFx.triggeredAnimateOpacity === 0) {
            classes.push('meros-start-hidden');
        }
    }

    if (isScrollFxBlock(blockName, attrs.merosScrollFx)) {
        classes.push('meros-has-scroll-animation');
        if (
            clientId !== '' && 
            isChildOf(clientId, 'meros/swiper-slide') &&
            attrs.merosScrollFx.animateOnSlideChange
        ) {
            classes.push('meros-animate-on-slide-change');
        }

        if (attrs.merosScrollFx.scrollAnimateOpacity === 0) {
            classes.push('meros-start-hidden');
        }
    }

    if (isHoverFxBlock(blockName, attrs.merosHoverFx)) {
        if (attrs.merosHoverFx.hoverAnimationType === 'transform') {
            classes.push('meros-has-hover-transform-animation');
        } else if (attrs.merosHoverFx.hoverAnimationType === 'color') {
            classes.push('meros-has-hover-color-animation');
        }
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

// Cleans fx classes from the given className string
export function removeClasses(className = '', classesToRemove = []) {
    return className
        .split(/\s+/)
        .filter((cls) => cls && !classesToRemove.includes(cls))
        .join(' ');
}
