import { __ } from '@wordpress/i18n';
import {
    ToolsPanelItem,
    NumberControl,
    ToggleControl
} from '../../../../assets/wordpress/src/components/Controls.js';

export default function BreakpointControls({
    label,
    breakpoint,
    defaultValue,
    breakpoints,
    setAttributes,
    slideCount
}) {
    const attribute = `breakPoint${label}Width`;

    const updateBreakpoints = (updates) => {
        const next = { ...breakpoints };

        Object.entries(updates).forEach(([key, value]) => {
            next[key] = {
                ...breakpoints[key],
                ...value
            };
        });

        return next;
    };

    return (
        <>
            {/* Breakpoint width */}
            <ToolsPanelItem
                label={__(`${label} Breakpoint`, 'meros-theme')}
                hasValue={() => (breakpoint || defaultValue) !== defaultValue}
                isShownByDefault
                onDeselect={() => setAttributes({ [attribute]: defaultValue })}
            >
                <NumberControl
                    label={__(`${label} Breakpoint`, 'meros-theme')}
                    value={breakpoint || defaultValue}
                    onChange={(value) => {
                        const newBreakpoints = { ...breakpoints };
                        newBreakpoints[String(value)] = newBreakpoints[String(breakpoint)] || {};
                        delete newBreakpoints[String(breakpoint)];

                        setAttributes({
                            breakpoints: newBreakpoints,
                            [attribute]: parseInt(value) || defaultValue
                        });
                    }}
                />
            </ToolsPanelItem>

            {/* Slides Per View */}
            <ToolsPanelItem
                label={__(`${label} Slides Per View`, 'meros-theme')}
                hasValue={() =>
                    breakpoints?.[String(breakpoint)]?.slidesPerView !== undefined
                }
                isShownByDefault
                onDeselect={() => {
                    const updates = {
                        [String(breakpoint)]: { slidesPerView: undefined }
                    };

                    if (label === 'Mobile') {
                        updates['0'] = { slidesPerView: undefined };
                    }

                    setAttributes({
                        breakpoints: updateBreakpoints(updates),
                        ...(label === 'Desktop' && { slidesPerView: 1 })
                    });
                }}
            >
                <NumberControl
                    label={__(`${label} Slides Per View`, 'meros-theme')}
                    value={breakpoints?.[String(breakpoint)]?.slidesPerView ?? 1}
                    min={1}
                    max={Math.max(1, slideCount)}
                    onChange={(value) => {
                        const slides = parseInt(value) || 1;
                        const updates = {
                            [String(breakpoint)]: { slidesPerView: slides }
                        };

                        if (label === 'Mobile') {
                            updates['0'] = { slidesPerView: slides };
                        }

                        setAttributes({
                            breakpoints: updateBreakpoints(updates),
                            ...(label === 'Desktop' && { slidesPerView: slides })
                        });
                    }}
                />
            </ToolsPanelItem>

            {/* Space Between */}
            <ToolsPanelItem
                label={__(`${label} Space Between`, 'meros-theme')}
                hasValue={() =>
                    breakpoints?.[String(breakpoint)]?.spaceBetween !== undefined
                }
                isShownByDefault
                onDeselect={() => {
                    const updates = {
                        [String(breakpoint)]: { spaceBetween: undefined }
                    };

                    if (label === 'Mobile') {
                        updates['0'] = { spaceBetween: undefined };
                    }

                    setAttributes({
                        breakpoints: updateBreakpoints(updates),
                        ...(label === 'Desktop' && { spaceBetween: '0' })
                    });
                }}
            >
                <NumberControl
                    label={__(`${label} Space Between (px)`, 'meros-theme')}
                    value={breakpoints?.[String(breakpoint)]?.spaceBetween ?? '0'}
                    min={0}
                    max={100}
                    onChange={(value) => {
                        const space = String(value) || '0';
                        const updates = {
                            [String(breakpoint)]: { spaceBetween: space }
                        };

                        if (label === 'Mobile') {
                            updates['0'] = { spaceBetween: space };
                        }

                        setAttributes({
                            breakpoints: updateBreakpoints(updates),
                            ...(label === 'Desktop' && { spaceBetween: space })
                        });
                    }}
                />
            </ToolsPanelItem>

            {/* Navigation */}
            <ToolsPanelItem
                label={__(`${label} Show Navigation`, 'meros-theme')}
                hasValue={() =>
                    breakpoints?.[String(breakpoint)]?.navigation?.enabled === false
                }
                isShownByDefault
                onDeselect={() => {
                    const updates = {
                        [String(breakpoint)]: { navigation: { enabled: true } }
                    };

                    if (label === 'Mobile') {
                        updates['0'] = { navigation: { enabled: true } };
                    }

                    setAttributes({
                        breakpoints: updateBreakpoints(updates)
                    });
                }}
            >
                <ToggleControl
                    label={__(`Show Navigation at ${label} Breakpoint`, 'meros-theme')}
                    checked={
                        breakpoints?.[String(breakpoint)]?.navigation?.enabled ?? true
                    }
                    onChange={(value) => {
                        const updates = {
                            [String(breakpoint)]: { navigation: { enabled: value } }
                        };

                        if (label === 'Mobile') {
                            updates['0'] = { navigation: { enabled: value } };
                        }

                        setAttributes({
                            breakpoints: updateBreakpoints(updates)
                        });
                    }}
                />
            </ToolsPanelItem>

            {/* Pagination */}
            <ToolsPanelItem
                label={__(`${label} Show Pagination`, 'meros-theme')}
                hasValue={() =>
                    breakpoints?.[String(breakpoint)]?.pagination?.enabled === false
                }
                isShownByDefault
                onDeselect={() => {
                    const updates = {
                        [String(breakpoint)]: { pagination: { enabled: true } }
                    };

                    if (label === 'Mobile') {
                        updates['0'] = { pagination: { enabled: true } };
                    }

                    setAttributes({
                        breakpoints: updateBreakpoints(updates)
                    });
                }}
            >
                <ToggleControl
                    label={__(`Show Pagination at ${label} Breakpoint`, 'meros-theme')}
                    checked={
                        breakpoints?.[String(breakpoint)]?.pagination?.enabled ?? true
                    }
                    onChange={(value) => {
                        const updates = {
                            [String(breakpoint)]: { pagination: { enabled: value } }
                        };

                        if (label === 'Mobile') {
                            updates['0'] = { pagination: { enabled: value } };
                        }

                        setAttributes({
                            breakpoints: updateBreakpoints(updates)
                        });
                    }}
                />
            </ToolsPanelItem>
        </>
    );
}