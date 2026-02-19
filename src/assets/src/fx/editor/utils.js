
import { isDirectChildOf, isChildOf } from "../../utils/editor"; 

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

// Stores block client IDs with active preview in the editor
export const previewFx = {
    hoverPreviewFx: {},
    headerPreviewFx: {}
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
export const isHeaderFxBlock = (blockName, attrs, clientId, save = false) => {
    // if (!save) {
    //     const isInHeader = isDirectChildOf(
    //         clientId, 
    //         'core/template-part', 
    //         block => block.attributes?.slug === 'header'
    //     );
        
    //     return isInHeader && HeaderFxBlocks.includes(blockName) && attrs?.enabled;
    // }

    return HeaderFxBlocks.includes(blockName) && attrs?.enabled;
};

// Helper to determine if the block is within a swiper block
export const isInSwiper = (clientId) => {
    return isChildOf('meros/swiper', clientId);
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
    const isScrollAnimate = ScrollFxBlocks.includes(blockName)
    const isHoverAnimate = HoverFxBlocks.includes(blockName)
    const isHeaderAnimate = HeaderFxBlocks.includes(blockName)

    return isScrollAnimate || isHoverAnimate || isHeaderAnimate;
};

// Helper to detemine whether the block has any fx enabled
export const isEnabled = (attributes) => {
    const scrollEnabled = attributes.merosScrollFx?.enabled;
    const hoverEnabled = attributes.merosHoverFx?.enabled;
    const headerEnabled = attributes.merosHeaderFx?.enabled;

    return scrollEnabled || hoverEnabled || headerEnabled;
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