import { __ } from '@wordpress/i18n';
import {
    ToolsPanel,
    ToolsPanelItem,
    NumberControl,
    ToggleControl,
    RangeControl
} from '../../../../assets/src/components/Controls.js';

export default function SettingsControls({ attributes, setAttributes, slideCount }) {
    const {
        slidesPerView,
        spaceBetween,
        centeredSlides,
        initialSlide,
        fixHeight,
        height,
        mousewheel,
        freeMode,
        loop,
        autoplay,
        enableBreakPoints,
        breakPointDesktopWidth,
        breakpoints
    } = attributes;

    const resetSettings = () => {
        setAttributes({
            fixHeight: false,
            height: 400,
            slidesPerView: 1,
            spaceBetween: "0"
        });

        if (enableBreakPoints) {
            const newBreakpoints = { ...breakpoints };
            newBreakpoints[breakPointDesktopWidth].slidesPerView = 1;
            newBreakpoints[breakPointDesktopWidth].spaceBetween = "0";
            setAttributes({
                breakpoints: newBreakpoints
            });
        }
    };

    return (
        <ToolsPanel label={__('Slide Settings', 'meros-theme')} resetAll={resetSettings}>
            <ToolsPanelItem
                label={__('Slides Per View', 'meros-theme')}
                hasValue={() => (slidesPerView || 1) !== 1}
                isShownByDefault={true}
                onDeselect={() => {
                    if (enableBreakPoints) {
                        const newBreakpoints = { ...breakpoints };
                        newBreakpoints[breakPointDesktopWidth].slidesPerView = 1;
                        setAttributes({
                            breakpoints: newBreakpoints,
                            slidesPerView: 1
                        });
                    }
                    setAttributes({
                        slidesPerView: 1
                })}}
            >
                <RangeControl
                    label={__('Slides Per View', 'meros-theme')}
                    value={slidesPerView || 1}
                    onChange={(value) => {
                        if (enableBreakPoints) {
                            const newBreakpoints = { ...breakpoints };
                            newBreakpoints[breakPointDesktopWidth].slidesPerView = parseFloat(value) || 1;
                            setAttributes({
                                breakpoints: newBreakpoints,
                                slidesPerView: parseFloat(value) || 1
                            });
                            return;
                        }
                        setAttributes({ slidesPerView: parseFloat(value) || 1 });
                    }}
                    min={1}
                    max={Math.max(1, slideCount)}
                    step={0.1}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Space Between Slides', 'meros-theme')}
                hasValue={() => (spaceBetween || "0") !== "0"}
                isShownByDefault={true}
                onDeselect={() => {
                    if (enableBreakPoints) {
                        const newBreakpoints = { ...breakpoints };
                        newBreakpoints[breakPointDesktopWidth].spaceBetween = "0";
                        setAttributes({
                            breakpoints: newBreakpoints,
                            spaceBetween: "0"
                        });
                        return;
                    }
                    setAttributes({ spaceBetween: "0" });
                }}
            >
                <NumberControl
                    label={__('Space Between Slides (px)', 'meros-theme')}
                    value={spaceBetween || "0"}
                    onChange={(value) => {
                        if (enableBreakPoints) {
                            const newBreakpoints = { ...breakpoints };
                            newBreakpoints[breakPointDesktopWidth].spaceBetween = String(parseInt(value) || 0);
                            setAttributes({
                                breakpoints: newBreakpoints,
                                spaceBetween: String(parseInt(value) || 0)
                            });
                            return;
                        }
                        setAttributes({ spaceBetween: String(parseInt(value) || 0) });
                    }}
                    min={0}
                    max={100}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Initial Slide', 'meros-theme')}
                hasValue={() => (initialSlide || 0) !== 0}
                isShownByDefault={true}
                onDeselect={() => 
                    setAttributes({ initialSlide: 0 })
                }
            >
                <NumberControl
                    label={__('Initial Slide', 'meros-theme')}
                    value={initialSlide || 0}
                    onChange={(value) => 
                        setAttributes({ initialSlide: parseInt(value) || 0 })
                    }
                    min={0}
                    max={Math.max(1, slideCount)}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Center Slides', 'meros-theme')}
                hasValue={() => (centeredSlides || false) !== false}
                isShownByDefault={true}
                onDeselect={() => setAttributes({
                    centeredSlides: false
                })}
            >
                <ToggleControl
                    label={__('Center Slides', 'meros-theme')}
                    checked={centeredSlides || false}
                    onChange={(value) => {
                        setAttributes({ centeredSlides: value });
                        if (value === true) {
                            setAttributes({ loop: false });
                            if (initialSlide === 0) {
                                setAttributes({ initialSlide: 1 });
                            }
                        }
                    }}
                    disabled={loop === true}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Enable Mousewheel Control', 'meros-theme')}
                hasValue={() => (mousewheel?.enabled || false) !== false}
                isShownByDefault={true}
                onDeselect={() => setAttributes({
                    mousewheel: { enabled: false }
                })}
            >
                <ToggleControl
                    label={__('Enable Mousewheel Control', 'meros-theme')}
                    checked={mousewheel?.enabled || false}
                    onChange={(value) => {
                        setAttributes({ mousewheel: { enabled: value } });
                        if (value === true) {
                            setAttributes({ autoplay: false });
                        }
                    }}
                    disabled={autoplay === true}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Enable Free Mode', 'meros-theme')}
                hasValue={() => (freeMode?.enabled || false) !== false}
                isShownByDefault={true}
                onDeselect={() => setAttributes({
                    freeMode: { ...freeMode, enabled: false }
                })}
            >
                <ToggleControl
                    label={__('Enable Free Mode', 'meros-theme')}
                    checked={freeMode?.enabled || false}
                    onChange={(value) => {
                        setAttributes({ freeMode: { ...freeMode, enabled: value } });
                        if (value === true) {
                            setAttributes({ autoplay: false });
                        }
                    }}
                    disabled={autoplay === true}
                />
            </ToolsPanelItem>

            { freeMode?.enabled === true && (
                 <ToolsPanelItem
                    label={__('Free Mode Sticky', 'meros-theme')}
                    hasValue={() => (freeMode?.sticky || true) !== true}
                    isShownByDefault={true}
                    onDeselect={() => setAttributes({
                        freeMode: { ...freeMode, sticky: true }
                    })}
                >
                    <ToggleControl
                        label={__('Free Mode Sticky', 'meros-theme')}
                        checked={freeMode?.sticky || false}
                        onChange={(value) => 
                            setAttributes({ freeMode: { ...freeMode, sticky: value } })
                        }
                        disabled={autoplay === true}
                    />
                </ToolsPanelItem>
            )}

            <ToolsPanelItem
                label={__('Fix Height', 'meros-theme')}
                hasValue={() => (fixHeight || false) !== false}
                isShownByDefault={true}
                onDeselect={() => setAttributes({
                    fixHeight: false
                })}
            >
                <ToggleControl
                    label={__('Fix Height', 'meros-theme')}
                    checked={fixHeight !== false}
                    onChange={(value) => setAttributes({ fixHeight: value, height: 400 })}
                />
            </ToolsPanelItem>
            {fixHeight === true && (
                <ToolsPanelItem
                    label={__('Height', 'meros-theme')}
                    hasValue={() => (height || 400) !== 400}
                    isShownByDefault={true}
                    onDeselect={() => setAttributes({
                        height: 400
                    })}
                >
                    <RangeControl
                        label={__('Height (px)', 'meros-theme')}
                        value={height || 400}
                        onChange={(value) => setAttributes({ height: parseInt(value) || 0 })}
                        min={50}
                        max={1000}
                    />
                </ToolsPanelItem>
            )}
        </ToolsPanel>
    );
}