import { registerBlockType } from '@wordpress/blocks';
import dynamicVariation from './dynamic/variation.json';
import dynamicInnerBlocks from './dynamic/innerBlocks.json';

import edit from './edit';
import save from './save';
import block from './block.json';

const transformInnerBlocks = (blocks) => {
    return blocks.map(block => [
        block.name,
        block.attributes || {},
        block.innerBlocks ? transformInnerBlocks(block.innerBlocks) : []
    ]);
};

registerBlockType( block.name, {
    edit,
    save,
});

const variationMetadata = {
    ...dynamicVariation,
    innerBlocks: transformInnerBlocks(dynamicInnerBlocks)
};

wp.hooks.addFilter(
    'blocks.registerBlockType',
    'meros/swiper/dynamic-query-population',
    (settings, name) => {
        if (name !== 'meros/swiper') return settings;

        const dynamicVariation = settings.variations?.find(
            (v) => v.name === 'meros/dynamic-swiper'
        );

        if (!dynamicVariation) return settings;

        dynamicVariation.innerBlocks = [
            [
                'core/query',
                variationMetadata.attributes,
                variationMetadata.innerBlocks
            ]
        ];

        return settings;
    }
);
