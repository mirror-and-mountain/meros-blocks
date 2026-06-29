import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { ToggleControl } from '../../../components/Controls.js';

import { updateFx } from '../utils.js';
import { getFxAttrs } from '../hooks/fxAttributes.js';
import { Enable, Presets, Transform, Opacity, Color } from './FX.js';

export default function ScrollFX({ attributes, setAttributes, isInSwiper }) {
    const {
        enabled,
        preset,
        scrollAnimateX,
        scrollAnimateY,
        scrollAnimateOpacity,
        scrollAnimateScaleX,
        scrollAnimateScaleY,
        scrollAnimateBgColor,
        scrollAnimateTextColor,
        scrollAnimateLinkColor,
        scrollTransformDuration,
        scrollTransformDelay,
        scrollOpacityDuration,
        scrollOpacityDelay,
        scrollColorDuration,
        scrollColorDelay,
        scrollInvisibleOccupySpace, // To be implemented
        animateOnSlideChange,
        scrollPreviewFx
    } = attributes.merosScrollFx;

    const presets = [
        { label: __('Fade In', 'meros-theme'), value: 'fadeIn' },
        { label: __('Slide In from Left', 'meros-theme'), value: 'slideInFromLeft' },
        { label: __('Slide In from Right', 'meros-theme'), value: 'slideInFromRight' },
        { label: __('Slide Up', 'meros-theme'), value: 'slideUp' },
        { label: __('Slide Down', 'meros-theme'), value: 'slideDown' },
        { label: __('Zoom In', 'meros-theme'), value: 'zoomIn' },
        { label: __('Manual', 'meros-theme'), value: 'manual' }
    ];

    const presetsMap = {
        fadeIn: {
            values: {
                scrollAnimateOpacity: 0,
                scrollAnimateX: 0,
                scrollAnimateY: 0,
                scrollAnimateScaleX: 1,
                scrollAnimateScaleY: 1,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0,
                scrollColorDelay: 0
            }
        },
        slideInFromLeft: {
            values: {
                scrollAnimateOpacity: 0,
                scrollAnimateX: -50,
                scrollAnimateY: 0,
                scrollAnimateScaleX: 1,
                scrollAnimateScaleY: 1,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0.8,
                scrollColorDelay: 0
            }
        },
        slideInFromRight: {
            values: {
                scrollAnimateOpacity: 0,
                scrollAnimateX: 50,
                scrollAnimateY: 0,
                scrollAnimateScaleX: 1,
                scrollAnimateScaleY: 1,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0.8,
                scrollColorDelay: 0
            }
        },
        slideUp: {
            values: {
                scrollAnimateOpacity: 0,
                scrollAnimateX: 0,
                scrollAnimateY: 50,
                scrollAnimateScaleX: 1,
                scrollAnimateScaleY: 1,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0.8,
                scrollColorDelay: 0
            }
        },
        slideDown: {
            values: {
                scrollAnimateOpacity: 0,
                scrollAnimateX: 0,
                scrollAnimateY: -50,
                scrollAnimateScaleX: 1,
                scrollAnimateScaleY: 1,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0.8,
                scrollColorDelay: 0
            }
        },
        zoomIn: {
            values: {
                scrollAnimateOpacity: 0,
                scrollAnimateX: 0,
                scrollAnimateY: 0,
                scrollAnimateScaleX: 0.8,
                scrollAnimateScaleY: 0.8,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0.8,
                scrollColorDelay: 0
            }
        },
        manual: {
            values: {
                scrollAnimateOpacity: 1,
                scrollAnimateX: 0,
                scrollAnimateY: 0,
                scrollAnimateScaleX: 1,
                scrollAnimateScaleY: 1,
                scrollAnimateBgColor: '',
                scrollAnimateTextColor: '',
                scrollAnimateLinkColor: '',
                scrollTransformDuration: 0.8,
                scrollTransformDelay: 0,
                scrollOpacityDuration: 0.8,
                scrollOpacityDelay: 0,
                scrollColorDuration: 0.8,
                scrollColorDelay: 0
            }
        }
    };

    const defaultValues = getFxAttrs('Scroll');
    const isTransformPreset = preset !== 'manual' && preset !== 'fadeIn';
    const isManual = preset === 'manual';

    const update = (patch) => {
        updateFx(
            setAttributes, 
            'merosScrollFx', 
            attributes.merosScrollFx, 
            patch
        );
    };

    const previewAnimation = () => {
        setAttributes({ 
            merosScrollFx: { 
                ...attributes.merosScrollFx, 
                scrollPreviewFx: false 
            } 
        });

        requestAnimationFrame(() => {
            setAttributes({ 
                merosScrollFx: { 
                    ...attributes.merosScrollFx, 
                    scrollPreviewFx: true 
                } 
            });
        });
    };

    return (
        <>
            <Enable
                enabled={enabled}
                onChange={(value) => {
                    if (!value) {
                        update({ ...defaultValues });
                        return;
                    }
                    update({ 
                        enabled: true,
                        preset: 'fadeIn',
                        ...presetsMap['fadeIn'].values
                    });
                }}
            />

            {enabled && (
                <>
                    {isInSwiper && (
                        <ToggleControl
                            label={__('Animate On Slide Change', 'meros-theme')}
                            checked={animateOnSlideChange !== false}
                            onChange={(value) =>
                                update({ animateOnSlideChange: value })
                            }
                        />
                    )}

                    <Presets
                        current={preset}
                        presets={presets}
                        defaultPreset="fadeIn"
                        onChange={(value) => {
                            const presetValues = presetsMap[value]?.values || {};
                            update({
                                preset: value,
                                ...presetValues
                            });
                        }}
                    />

                    <Button
                        variant="secondary"
                        onClick={previewAnimation}
                        style={{ width: '100%' }}
                        disabled={scrollPreviewFx}
                    >
                        {__('Preview Animation', 'meros-theme')}
                    </Button>
                
                    {(isTransformPreset || isManual) && (
                        <Transform
                            translateX={scrollAnimateX}
                            translateY={scrollAnimateY}
                            scaleX={scrollAnimateScaleX}
                            scaleY={scrollAnimateScaleY}
                            duration={scrollTransformDuration}
                            delay={scrollTransformDelay}
                            prefix="scroll"
                            defaultValues={{
                                scrollAnimateX: 0,
                                scrollAnimateY: 0,
                                scrollAnimateScaleX: 1,
                                scrollAnimateScaleY: 1,
                                scrollTransformDuration: 0.8,
                                scrollTransformDelay: 0
                            }}
                            update={update}
                            showControls={isManual}
                        />
                    )}

                    <Opacity
                        current={scrollAnimateOpacity}
                        duration={scrollOpacityDuration}
                        delay={scrollOpacityDelay}
                        prefix="scroll"
                        defaultValues={{
                            scrollAnimateOpacity: 1,
                            scrollOpacityDuration: 0.8,
                            scrollOpacityDelay: 0
                        }}
                        update={update}
                        showControls={isManual}
                    />

                    { isManual && (
                        <Color
                            bg={scrollAnimateBgColor}
                            text={scrollAnimateTextColor}
                            link={scrollAnimateLinkColor}
                            duration={scrollColorDuration}
                            delay={scrollColorDelay}
                            prefix="scroll"
                            defaultValues={{
                                scrollAnimateBgColor: '',
                                scrollAnimateTextColor: '',
                                scrollAnimateLinkColor: '',
                                scrollColorDuration: 0.8,
                                scrollColorDelay: 0
                            }}
                            update={update}
                            showControls={true}
                            showTiming={true}
                        />
                    )}
                </>
            )}
        </>
    );
}
