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
            merosTriggerFx: { type: 'object', default: getFxAttrs('Trigger') },
            merosTriggerableFx: { type: 'object', default: getFxAttrs('Triggerable') },
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
                scrollInvisibleOccupySpace: true,
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
        case 'Triggerable':
            return {
                enabled: false,
                triggerId: '',
                preset: 'fadeIn',
                triggeredAnimateX: 0,
                triggeredAnimateY: 0,
                triggeredAnimateScaleX: 1,
                triggeredAnimateScaleY: 1,
                triggeredAnimateOpacity: 1,
                triggeredAnimateRotation: 0,
                triggeredTransformDuration: 0.3,
                triggeredTransformDelay: 0,
                triggeredOpacityDuration: 0.3,
                triggeredOpacityDelay: 0,
                triggeredRotationDuration: 0.3,
                triggeredRotationDelay: 0,
                triggeredInvisibleOccupySpace: true,
                triggeredPreviewFx: false
            };
        case 'Trigger':
            return {
                enabled: false,
                triggeredBlocks: [],
                triggerType: 'toggle',
                reverseOnNewSelection: false,
                triggerHoverAnimateBgColor: '',
                triggerHoverAnimateTextColor: '',
                triggerHoverAnimateLinkColor: '',
                triggerActiveAnimateBgColor: '',
                triggerActiveAnimateTextColor: '',
                triggerActiveAnimateLinkColor: '',
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
