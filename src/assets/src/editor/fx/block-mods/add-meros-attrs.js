import { getFxAttrs, isCompatible } from './utils.js';

export const addMerosAttrs = (settings, name) => {
    if (!isCompatible(name)) return settings;

    // Add sticky attributes to group block
    if (name === 'core/group') {
        settings = {
            ...settings,
            attributes: {
                ...settings.attributes,
                merosStickyElement: { type: 'object', default: getFxAttrs('Sticky') }
            }
        }
    }

    return {
        // Animation attributes
        ...settings,
        attributes: {
            ...settings.attributes,
            merosScrollFx: { type: 'object', default: getFxAttrs('Scroll') },
            merosHoverFx: { type: 'object', default: getFxAttrs('Hover') },
            merosHeaderFx: { type: 'object', default: getFxAttrs('Header') },
            merosSwiperFx: { type: 'object', default: getFxAttrs('Swiper') }
        }
    };
};
