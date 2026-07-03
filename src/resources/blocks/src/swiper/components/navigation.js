import { __ } from '@wordpress/i18n';
import {
    ToolsPanel,
    ToolsPanelItem,
    ToggleControl,
    SelectControl,
    RangeControl
} from '../../../../assets/wordpress/src/components/Controls.js';

import { ColorPicker } from '../../../../assets/wordpress/src/components/ColorPicker.js';
import { NavigationSets } from '../navigation/navigation-sets.js';

export default function NavigationControls({ attributes, setAttributes }) {
    const {
        showNavigation,
        showPagination,
        pagination,
        navigationStyle,
        paginationStyle,
        enableBreakPoints,
        breakPointDesktopWidth,
        breakpoints
    } = attributes;

    const resetNavigationSettings = () => {
        setAttributes({
            showNavigation: true,
            showPagination: true,
            navigation: {
                enabled: true,
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
                addIcons: false
            },
            pagination: {
                enabled: true,
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true
            },
            navigationStyle: {
                icon: 'default',
                color: '#000000',
                size: 44
            },
            paginationStyle: {
                activeColor: '#000000',
                inactiveColor: '#888888',
                top: 'auto'
            }
        });
    };

    return (
        <ToolsPanel label={__('Navigation & Pagination', 'meros-theme')} resetAll={resetNavigationSettings}>
            <ToolsPanelItem
                label={__('Show Navigation Icons', 'meros-theme')}
                hasValue={() => (showNavigation || true) !== true}
                isShownByDefault={true}
                onDeselect={() => {
                    if (enableBreakPoints) {
                        const newBreakpoints = { ...breakpoints };
                        if (newBreakpoints[String(breakPointDesktopWidth)]?.navigation) {
                            newBreakpoints[String(breakPointDesktopWidth)].navigation.enabled = true;
                            setAttributes({ breakpoints: newBreakpoints });
                        }
                    }
                    setAttributes({
                        showNavigation: true
                    });
                }}
            >
                <ToggleControl
                    label={__('Show Navigation Icons', 'meros-theme')}
                    checked={showNavigation !== false}
                    onChange={(value) => {
                        if (enableBreakPoints) {
                            const newBreakpoints = { ...breakpoints };
                            if (!newBreakpoints[String(breakPointDesktopWidth)]) {
                                newBreakpoints[String(breakPointDesktopWidth)] = {};
                            }
                            if (!newBreakpoints[String(breakPointDesktopWidth)].navigation) {
                                newBreakpoints[String(breakPointDesktopWidth)].navigation = {};
                            }
                            newBreakpoints[String(breakPointDesktopWidth)].navigation.enabled = value;
                            setAttributes({ breakpoints: newBreakpoints });
                        }
                        setAttributes({ showNavigation: value });
                    }}
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                label={__('Show Pagination', 'meros-theme')}
                hasValue={() => (showPagination || true) !== true}
                isShownByDefault={true}
                onDeselect={() => {
                    if (enableBreakPoints) {
                        const newBreakpoints = { ...breakpoints };
                        if (newBreakpoints[String(breakPointDesktopWidth)]?.pagination) {
                            newBreakpoints[String(breakPointDesktopWidth)].pagination.enabled = true;
                            setAttributes({ breakpoints: newBreakpoints });
                        }
                    }
                    setAttributes({
                        showPagination: true
                    });
                }}
            >
                <ToggleControl
                    label={__('Show Pagination', 'meros-theme')}
                    checked={showPagination !== false}
                    onChange={(value) => {
                        if (enableBreakPoints) {
                            const newBreakpoints = { ...breakpoints };
                            if (!newBreakpoints[String(breakPointDesktopWidth)]) {
                                newBreakpoints[String(breakPointDesktopWidth)] = {};
                            }
                            if (!newBreakpoints[String(breakPointDesktopWidth)].pagination) {
                                newBreakpoints[String(breakPointDesktopWidth)].pagination = {};
                            }
                            newBreakpoints[String(breakPointDesktopWidth)].pagination.enabled = value;
                            setAttributes({ breakpoints: newBreakpoints });
                        }
                        setAttributes({ showPagination: value });
                    }}
                />
            </ToolsPanelItem>

            { showNavigation && (
                <>
                    <ToolsPanelItem
                        label={__('Navigation Icon', 'meros-theme')}
                        hasValue={() => (navigationStyle.icon || 'default') !== 'default'}
                        isShownByDefault={true}
                        onDeselect={() => setAttributes({
                            navigationStyle: {
                                ...navigationStyle,
                                icon: 'default'
                            }
                        })}
                    >
                        <SelectControl
                            label={__('Navigation Icon', 'meros-theme')}
                            value={navigationStyle.icon || 'default'}
                            options={Object.keys(NavigationSets).map((key) => ({
                                label: key.charAt(0).toUpperCase() + key.slice(1),
                                value: key
                            }))}
                            onChange={(value) => setAttributes({
                                navigationStyle: {
                                    ...navigationStyle,
                                    icon: value
                                }
                            })}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__('Navigation Icon Colour', 'meros-theme')}
                        hasValue={() => (navigationStyle.color || '#000000') !== '#000000'}
                        isShownByDefault={true}
                        onDeselect={() => setAttributes({
                            navigationStyle: {
                                ...navigationStyle,
                                color: '#000000'
                            }
                        })}
                    >
                        <ColorPicker
                            label={__('Navigation Icon Colour', 'meros-theme')}
                            currentColor={navigationStyle.color || '#000000'}
                            onChange={(color) => setAttributes({
                                navigationStyle: {
                                    ...navigationStyle,
                                    color: color
                                }
                            })}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__('Navigation Icon Size', 'meros-theme')}
                        hasValue={() => (navigationStyle.size || 44) !== 44}
                        isShownByDefault={true}
                        onDeselect={() => setAttributes({
                            navigationStyle: {
                                ...navigationStyle,
                                size: 44
                            }
                        })}
                    >
                        <RangeControl
                            label={__('Navigation Icon Size', 'meros-theme')}
                            value={navigationStyle.size || 44}
                            onChange={(value) => setAttributes({
                                navigationStyle: {
                                    ...navigationStyle,
                                    size: parseInt(value) || 0
                                }
                            })}
                            min={20}
                            max={100}
                        />
                    </ToolsPanelItem>
                </>
            )}

            { showPagination && (
                <>
                    <ToolsPanelItem
                        label={__('Pagination Type', 'meros-theme')}
                        hasValue={() => (pagination.type || 'bullets') !== 'bullets'}
                        isShownByDefault={true}
                        onDeselect={() => setAttributes({
                            pagination: {
                                ...pagination,
                                type: 'bullets'
                            }
                        })}
                    >
                        <SelectControl
                            label={__('Pagination Type', 'meros-theme')}
                            value={pagination.type || 'bullets'}
                            options={[
                                { label: __('Bullets', 'meros-theme'), value: 'bullets' },
                                { label: __('Fraction', 'meros-theme'), value: 'fraction' },
                                { label: __('Progress Bar', 'meros-theme'), value: 'progressbar' }
                            ]}
                            onChange={(value) => setAttributes({ pagination: { ...pagination, type: value } })}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        label={__('Pagination Colour', 'meros-theme')}
                        hasValue={() => (paginationStyle.activeColor || '#000000') !== '#000000'}
                        isShownByDefault={true}
                        onDeselect={() => setAttributes({
                            paginationStyle: {
                                ...paginationStyle,
                                activeColor: '#000000'
                            }
                        })}
                    >
                        <ColorPicker
                            label={__('Pagination Colour', 'meros-theme')}
                            currentColor={paginationStyle.activeColor || '#000000'}
                            onChange={(color) => setAttributes({
                                paginationStyle: {
                                    ...paginationStyle,
                                    activeColor: color
                                }
                            })}
                        />
                    </ToolsPanelItem>
                    { showPagination && pagination.type === 'bullets' && (
                        <ToolsPanelItem
                            label={__('Pagination Inactive Colour', 'meros-theme')}
                            hasValue={() => (paginationStyle.inactiveColor || '#000000') !== '#000000'}
                            isShownByDefault={true}
                            onDeselect={() => setAttributes({
                                paginationStyle: {
                                    ...paginationStyle,
                                    inactiveColor: '#888888'
                                }
                            })}
                        >
                            <ColorPicker
                                label={__('Pagination Inactive Colour', 'meros-theme')}
                                currentColor={paginationStyle.inactiveColor || '#888888'}
                                onChange={(color) => setAttributes({
                                    paginationStyle: {
                                        ...paginationStyle,
                                        inactiveColor: color
                                    }
                                })}
                                margin={true}
                            />
                        </ToolsPanelItem>
                    )}
                    { showPagination && pagination.type !== 'progressbar' && (
                        <ToolsPanelItem
                            label={__('Pagination Position from Top (%)', 'meros-theme')}
                            hasValue={() => (paginationStyle.top || 'auto') !== 'auto'}
                            isShownByDefault={true}
                            onDeselect={() => setAttributes({
                                paginationStyle: {
                                    ...paginationStyle,
                                    top: 'auto'
                                }
                            })}
                        >
                            <RangeControl
                                label={__('Pagination Position from Top (%)', 'meros-theme')}
                                value={paginationStyle.top === 'auto' ? 0 : parseInt(paginationStyle.top)}
                                onChange={(value) => setAttributes({
                                    paginationStyle: {
                                        ...paginationStyle,
                                        top: value === 0 ? 'auto' : `${value}%`
                                    }
                                })}
                                min={0}
                                max={200}
                            />
                        </ToolsPanelItem>
                    )}
                </>
            )}
        </ToolsPanel>
    );
}