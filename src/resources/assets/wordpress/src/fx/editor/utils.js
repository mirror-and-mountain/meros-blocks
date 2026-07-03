import { getIframeObjects, isChildOf } from "../../utils/editor";

// Blocks compatible with scroll fx
export const ScrollFxBlocks = [
    'core/group',
    'core/heading',
    'core/paragraph'
];

// Blocks compatible with hover fx
export const HoverFxBlocks = [
    'core/group',
    'core/image',
    'core/button'
];

// Blocks compatible with header fx
export const HeaderFxBlocks = [
    'core/group'
];

// Blocks able to trigger other blocks with triggerable fx enabled
export const TriggerFxBlocks = [
    'core/group',
    'core/button'
];

// Blocks able to be triggered by other blocks with trigger fx enabled
export const TriggerableFxBlocks = [
    'core/group'
];

// Stores block client IDs with active preview in the editor
export const previewFx = {
    hoverPreviewFx: {},
    headerPreviewFx: {},
    triggerPreviewFx: {},
    triggeredPreviewFx: {}
};

// Normalise stored logo width values.
// Legacy values are ratios (e.g. 1.2), newer editor values are percentages (e.g. 120).
export const normalizeLogoWidthFactor = (value) => {
    const raw = parseFloat(value);

    if (!Number.isFinite(raw) || raw <= 0) {
        return 1;
    }

    return raw > 10 ? raw / 100 : raw;
};

// Helper to determine if the block is a trigger for other blocks with triggerable fx enabled
export const isTriggerFxBlock = (blockName, attrs) => {
    return TriggerFxBlocks.includes(blockName) && attrs?.enabled;
};

// Helper to determine if the block is triggerable by other blocks with trigger fx enabled
export const isTriggerableFxBlock = (blockName, attrs) => {
    return TriggerableFxBlocks.includes(blockName) && attrs?.enabled;
};

// Helper to determine if the block is compatible with scroll fx and has it enabled
export const isScrollFxBlock = (blockName, attrs) => {
    return ScrollFxBlocks.includes(blockName) && attrs?.enabled;
};

// Helper to determine if the block is compatible with hover fx and has it enabled
export const isHoverFxBlock = (blockName, attrs) => {
    return HoverFxBlocks.includes(blockName) && attrs?.enabled;
};

// Helper to determine if the block is compatible with header fx, has it enabled, and is within a header template part
export const isHeaderFxBlock = (blockName, attrs, clientId = '', save = false) => {
    if (!save && clientId !== '') {
        // Check whether the block is an element with a <header> tag
        const isHeader = blockName === 'core/template-part' && attrs?.slug === 'header' ||
            blockName === 'core/group' && attrs?.tagName === 'header';

        if (isHeader) {
            return HeaderFxBlocks.includes(blockName) && attrs?.merosHeaderFx?.enabled;
        }

        // Check whether the block is inside an element with a <header> tag
        const isInHeader = isChildOf(
            clientId,
            ['core/template-part', 'core/group'],
            function (block) {
                if (block.name === 'core/template-part') {
                    return block.attributes?.slug === 'header';
                } else if (block.name === 'core/group') {
                    return block.attributes?.tagName === 'header';
                }
            }
        );

        return isInHeader && HeaderFxBlocks.includes(blockName) && attrs?.merosHeaderFx?.enabled;
    }

    return HeaderFxBlocks.includes(blockName) && attrs?.merosHeaderFx?.enabled;
};

// Helper to determine if the block is within a swiper block
export const isInSwiper = (clientId) => {
    return isChildOf(clientId, 'meros/swiper-slide');
};

// Determines whether the given block (id) contains a site logo block
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

// Helper to determine whether the block is compatible with any fx
export const isCompatible = (blockName) => {
    const isTriggerAnimate = TriggerFxBlocks.includes(blockName);
    const isTriggerableAnimate = TriggerableFxBlocks.includes(blockName);
    const isScrollAnimate = ScrollFxBlocks.includes(blockName)
    const isHoverAnimate = HoverFxBlocks.includes(blockName)
    const isHeaderAnimate = HeaderFxBlocks.includes(blockName)

    return isTriggerAnimate || isTriggerableAnimate || isScrollAnimate || isHoverAnimate || isHeaderAnimate;
};

// Helper to detemine whether the block has any fx enabled
export const isEnabled = (attributes) => {
    const triggerEnabled = attributes.merosTriggerFx?.enabled;
    const triggerableEnabled = attributes.merosTriggerableFx?.enabled;
    const scrollEnabled = attributes.merosScrollFx?.enabled;
    const hoverEnabled = attributes.merosHoverFx?.enabled;
    const headerEnabled = attributes.merosHeaderFx?.enabled;

    return triggerEnabled || triggerableEnabled || scrollEnabled || hoverEnabled || headerEnabled;
};

// Adds block client ID to previewFx list for the given fx type
export function setPreviewFx(fxType, clientId, value) {
    previewFx[`${fxType}PreviewFx`][clientId] = value;
}

// Patches the given fx attribute
export function updateFx(setAttributes, attribute, fx, patch) {
    setAttributes({
        [attribute]: {
            ...fx,
            ...patch
        }
    });
};

// Resolves a WordPress color value, supporting preset references and raw slugs
export function resolveWPColor(input, scope = 'editor') {
    if (!input || typeof input !== 'string') return null;

    if (scope === 'editor') {
        // Handle iframe scope by accessing the iframe's document
        scope = getIframeObjects()?.doc?.documentElement;
    } else {
        scope = document.documentElement;
    }

    if (!scope) return null;

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