import { __ } from '@wordpress/i18n';
import { PanelBody } from "@wordpress/components";
import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
    ToggleControl
} from '@wordpress/components';

import BreakpointControls from "./breakpoint.js";

export default function Breakpoints({ attributes, setAttributes, slideCount }) {
    const {
        slidesPerView,
        spaceBetween,
        showNavigation,
        showPagination,
        enableBreakPoints,
        breakPointDesktopWidth,
        breakPointTabletWidth,
        breakPointMobileWidth,
        breakpoints
    } = attributes;

    const resetSettings = () => {
        setAttributes({
            enableBreakPoints: false,
            breakpoints: {}
        });
    };

    return (
        <PanelBody title={__('Responsive Swiper Settings', 'meros-theme')} initialOpen={false}>
            <ToolsPanel label={__('Breakpoints', 'meros-theme')} resetAll={resetSettings}>
                <ToolsPanelItem
                    label={__('Enable Breakpoints', 'meros-theme')}
                    hasValue={() => enableBreakPoints === true}
                    isShownByDefault={true}
                    onDeselect={() => setAttributes({
                        enableBreakPoints: false,
                        breakpoints: {}
                    })}
                >
                    <ToggleControl
                        label={__('Enable Breakpoints', 'meros-theme')}
                        checked={enableBreakPoints}
                        onChange={(value) => {
                            if (value === true) {
                                const desktop = {
                                    slidesPerView: slidesPerView || 1,
                                    spaceBetween: spaceBetween || "0",
                                    navigation: showNavigation ? { enabled: true } : { enabled: false },
                                    pagination: showPagination ? { enabled: true } : { enabled: false }
                                };
                                const defaults = {
                                    slidesPerView: 1,
                                    spaceBetween: "0",
                                    navigation: showNavigation ? { enabled: true } : { enabled: false },
                                    pagination: showPagination ? { enabled: true } : { enabled: false }
                                };
                                setAttributes({
                                    enableBreakPoints: true,
                                    breakpoints: {
                                        1024: desktop,
                                        780: defaults,
                                        360: defaults,
                                        0: defaults
                                    }
                                });
                            } else {
                                setAttributes({
                                    enableBreakPoints: false,
                                    breakpoints: {}
                                });
                            }
                        }}
                    />
                </ToolsPanelItem>
                {enableBreakPoints && (
                    <>
                        <BreakpointControls
                            label="Desktop"
                            breakpoint={breakPointDesktopWidth}
                            defaultValue={1024}
                            breakpoints={breakpoints}
                            setAttributes={setAttributes}
                            slideCount={slideCount}
                        />
                        <BreakpointControls
                            label="Tablet"
                            breakpoint={breakPointTabletWidth}
                            defaultValue={780}
                            breakpoints={breakpoints}
                            setAttributes={setAttributes}
                            slideCount={slideCount}
                        />
                        <BreakpointControls
                            label="Mobile"
                            breakpoint={breakPointMobileWidth}
                            defaultValue={360}
                            breakpoints={breakpoints}
                            setAttributes={setAttributes}
                            slideCount={slideCount}
                        />
                    </>
                )}
            </ToolsPanel>
        </PanelBody>
    );
}