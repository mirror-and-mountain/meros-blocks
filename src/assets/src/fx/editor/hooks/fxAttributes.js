import { isCompatible } from '../utils.js';

export const useFxAttributes = (settings, name) => {
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
            merosClidentId: { type: 'string', default: '' },
            merosScrollFx: { type: 'object', default: getFxAttrs('Scroll') },
            merosHoverFx: { type: 'object', default: getFxAttrs('Hover') },
            merosHeaderFx: { type: 'object', default: getFxAttrs('Header') },
            merosSwiperFx: { type: 'object', default: getFxAttrs('Swiper') }
        }
    };
};

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
                hoverAnimationType: 'transform',
                preset: 'grow',
                hoverAnimateX: 0,
                hoverAnimateY: 0,
                hoverAnimateScaleX: 1,
                hoverAnimateScaleY: 1,
                hoverAnimateTextColor: '',
                hoverAnimateBgColor: '',
                hoverTransformDuration: 0.3,
                hoverTransformDelay: 0,
                hoverColorDuration: 0.3,
                hoverColorDelay: 0
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
