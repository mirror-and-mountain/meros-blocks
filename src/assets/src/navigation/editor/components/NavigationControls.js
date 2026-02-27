import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { getNavigationAttributes } from '../hooks/navigationAttributes.js';

import {
    InspectorControls,
    PanelBody,
    ToolsPanel,
    ToolsPanelItem,
    NumberControl,
    SelectControl,
    ToggleControl,
    UnitControl,
    ColorPicker,
    HTMLEditorModal
} from '../../../components/Controls.js';

export const NavigationControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { name, attributes, setAttributes } = props;
        if (name !== 'core/navigation') {
            return <BlockEdit {...props} />;
        }

        // Meros enabled
        const merosEnabled = attributes.merosMenu?.enabled;
        if (!merosEnabled) {
            return <BlockEdit {...props} />;
        }

        // Get settings
        const { overlayMenu, openSubmenusOnClick, maxNestingLevel, merosMenu } = attributes;
        const { mobileSettings, desktopSettings } = merosMenu;

        const mobileStyles = mobileSettings?.styles || {};
        const desktopStyles = desktopSettings?.styles || {};

        // Ensure overlayMenu is set to 'never'
        if (overlayMenu !== 'never' || maxNestingLevel !== 1) {
            setAttributes({
                overlayMenu: 'never',
                maxNestingLevel: 1
            });
        }

        // Reset Settings Helper
        const resetSettings = (key, attribute = '') => {
            const defaultAttributes = getNavigationAttributes();
            const defaultValue = attribute === '' ? defaultAttributes[key] : defaultAttributes[key][attribute];
            // Reset all attributes except styles
            if (attribute === '') {
                setAttributes({
                    merosMenu: {
                        ...merosMenu,
                        [key]: {
                            ...merosMenu[key],
                            styles: {
                                ...merosMenu[key].styles,
                            },
                            ...defaultValue
                        }
                    }
                });
            } else {
                // Reset specific attribute
                setAttributes({
                    merosMenu: {
                        ...merosMenu,
                        [key]: {
                            ...merosMenu[key],
                            [attribute]: defaultValue
                        }
                    }
                });
            }
        };

        // Reset Styles Helper
        const resetStyles = (key, attribute = '') => {
            const defaultAttributes = getNavigationAttributes();
            const defaultStyles = defaultAttributes[key].styles;
            // Reset all styles
            if (attribute === '') {
                setAttributes({
                    merosMenu: {
                        ...merosMenu,
                        [key]: {
                            ...merosMenu[key],
                            styles: {
                                ...defaultStyles
                            }
                        }
                    }
                });
            } else {
                // Reset specific style
                setAttributes({
                    merosMenu: {
                        ...merosMenu,
                        [key]: {
                            ...merosMenu[key],
                            styles: {
                                ...merosMenu[key].styles,
                                [attribute]: defaultStyles[attribute]
                            }
                        }
                    }
                });
            }
        };

        // Helper to set individual settings
        const setSetting = (area, key, value) => {
            setAttributes({
                merosMenu: {
                    ...merosMenu,
                    [area]: {
                        ...merosMenu[area],
                        [key]: value
                    }
                }
            });
        };

        // Helper to set individual styles
        const setStyle = (area, key, value) => {
            setAttributes({
                merosMenu: {
                    ...merosMenu,
                    [area]: {
                        ...merosMenu[area],
                        styles: {
                            ...merosMenu[area].styles,
                            [key]: value
                        }
                    }
                }
            });
        };

        return (
            <Fragment>
                <BlockEdit {...props} />
                {/* Settings Tab */}
                <InspectorControls>
                    {/* General Settings */}
                    <div className="meros-navigation-settings-controls">
                        <ToolsPanel
                            label={__('Settings', 'meros-theme')}
                            resetAll={() => {
                                resetSettings('submenuSettings', 'type');
                                setAttributes({ openSubmenusOnClick: false });
                            }}
                        >
                            {/* Submenu Behavior */}
                            <ToolsPanelItem
                                label={__('Submenu Behavior', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => openSubmenusOnClick !== false}
                                onDeselect={() => setAttributes({
                                    openSubmenusOnClick: false
                                })}
                            >
                                <ToggleControl
                                    label={__('Open Submenu on Click', 'meros-theme')}
                                    checked={openSubmenusOnClick}
                                    onChange={(value) => setAttributes({
                                        openSubmenusOnClick: value
                                    })}
                                />
                            </ToolsPanelItem>
                        </ToolsPanel>

                        {/* Mobile Menu Settings */}
                        <ToolsPanel
                            label={__('Mobile Menu Settings', 'meros-theme')}
                            resetAll={() => resetSettings('mobileSettings')}
                        >
                            {/* Enable Mobile Menu */}
                            <ToolsPanelItem
                                label={__('Enable Mobile Menu', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => mobileSettings?.enabled !== true}
                                onDeselect={() => resetSettings('mobileSettings', 'enabled')}
                            >
                                <ToggleControl
                                    label={__('Enable Mobile Menu', 'meros-theme')}
                                    checked={mobileSettings?.enabled}
                                    onChange={(value) => setSetting('mobileSettings', 'enabled', value)}
                                />
                            </ToolsPanelItem>

                            {mobileSettings?.enabled && (
                                <>
                                    {/* Mobile Menu Breakpoint */}
                                    <ToolsPanelItem
                                        label={__('Mobile Menu Breakpoint (px)', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileSettings?.breakpoint !== 768}
                                        onDeselect={() => resetSettings('mobileSettings', 'breakpoint')}
                                    >
                                        <NumberControl
                                            label={__('Mobile Menu Breakpoint (px)', 'meros-theme')}
                                            value={mobileSettings?.breakpoint || 768}
                                            onChange={(value) => setSetting('mobileSettings', 'breakpoint', value)}
                                            min={320}
                                            max={1440}
                                            step={1}
                                        />
                                    </ToolsPanelItem>

                                    {/* Mobile Menu Direction */}
                                    <ToolsPanelItem
                                        label={__('Mobile Menu Direction', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileSettings?.direction !== 'left'}
                                        onDeselect={() => resetSettings('mobileSettings', 'direction')}
                                    >
                                        <SelectControl
                                            label={__('Mobile Menu Direction', 'meros-theme')}
                                            value={mobileSettings?.direction}
                                            options={[
                                                { label: __('Left', 'meros-theme'), value: 'left' },
                                                { label: __('Right', 'meros-theme'), value: 'right' },
                                                { label: __('Top', 'meros-theme'), value: 'top' },
                                            ]}
                                            onChange={(value) => setSetting('mobileSettings', 'direction', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Mobile Menu Under Header */}
                                    {mobileSettings?.direction === 'top' && (
                                        <ToolsPanelItem
                                            label={__('Place Under Header', 'meros-theme')}
                                            isShownByDefault={true}
                                            hasValue={() => mobileSettings?.underHeader !== false}
                                            onDeselect={() => resetSettings('mobileSettings', 'underHeader')}
                                        >
                                            <ToggleControl
                                                label={__('Place Under Header', 'meros-theme')}
                                                checked={mobileSettings?.underHeader}
                                                onChange={(value) => setSetting('mobileSettings', 'underHeader', value)}
                                            />
                                        </ToolsPanelItem>
                                    )}

                                    {/* Icon Type */}
                                    {/* <ToolsPanelItem
                                        label={__('Mobile Menu Icon', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileSettings?.icon !== 'hamburger-1'}
                                        onDeselect={() => resetSettings('mobileSettings', 'icon')}
                                    >
                                        <SelectControl
                                            label={__('Mobile Menu Icon', 'meros-theme')}
                                            value={mobileSettings?.icon}
                                            options={[
                                                { label: __('Hamburger 1', 'meros-theme'), value: 'hamburger-1' },
                                                { label: __('Hamburger 2', 'meros-theme'), value: 'hamburger-2' },
                                                { label: __('Dots', 'meros-theme'), value: 'dots' },
                                            ]}
                                            onChange={(value) => setSetting('mobileSettings', 'icon', value)}
                                        />
                                    </ToolsPanelItem> */}

                                    {/* Custom HTML - Top */}
                                    <ToolsPanelItem
                                        label={__('Custom HTML (Top)', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileSettings?.customHtmlTop !== ''}
                                        onDeselect={() => resetSettings('mobileSettings', 'customHtmlTop')}
                                    >
                                         <HTMLEditorModal
                                            label={__('Custom HTML (Top)', 'meros-theme')}
                                            value={mobileSettings?.customHtmlTop}
                                            onChange={(value) =>
                                                setSetting('mobileSettings', 'customHtmlTop', value)
                                            }
                                        />
                                    </ToolsPanelItem>
                                </>
                            )}
                        </ToolsPanel>
                    </div>
                </InspectorControls>

                {/* Styles Tab */}
                <InspectorControls group="styles">
                    {/* Styles Tab - Desktop Styles */}
                    <div className="meros-navigation-style-controls">
                        {desktopSettings?.enabled && (
                            <PanelBody title={__('Desktop Menu Styles', 'meros-theme')} initialOpen={false}>
                                <ToolsPanel
                                    label={__('Desktop Menu Styles', 'meros-theme')}
                                    resetAll={() => resetSettings('desktopSettings')}
                                >
                                    {/* Desktop Menu Items Gap */}
                                    <ToolsPanelItem
                                        label={__('Items Gap', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => desktopStyles.itemsGap !== '0px'}
                                        onDeselect={() => resetStyles('desktopSettings', 'itemsGap')}
                                    >
                                        <UnitControl
                                            label={__('Items Gap', 'meros-theme')}
                                            value={desktopStyles.itemsGap || '0px'}
                                            onChange={(value) => setStyle('desktopSettings', 'itemsGap', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Desktop Menu Item Padding X */}
                                    <ToolsPanelItem
                                        label={__('Item Padding X', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => desktopStyles.itemPaddingX !== '0px'}
                                        onDeselect={() => resetStyles('desktopSettings', 'itemPaddingX')}
                                    >
                                        <UnitControl
                                            label={__('Item Padding X', 'meros-theme')}
                                            value={desktopStyles.itemPaddingX || '0px'}
                                            onChange={(value) => setStyle('desktopSettings', 'itemPaddingX', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Desktop Menu Item Padding Y */}
                                    <ToolsPanelItem
                                        label={__('Item Padding Y', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => desktopStyles.itemPaddingY !== '0px'}
                                        onDeselect={() => resetStyles('desktopSettings', 'itemPaddingY')}
                                    >
                                        <UnitControl
                                            label={__('Item Padding Y', 'meros-theme')}
                                            value={desktopStyles.itemPaddingY || '0px'}
                                            onChange={(value) => setStyle('desktopSettings', 'itemPaddingY', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Desktop Menu Border Width */}
                                    <ToolsPanelItem
                                        label={__('Item Border Width', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => desktopStyles.itemBorderWidth !== '1px'}
                                        onDeselect={() => resetStyles('desktopSettings', 'itemBorderWidth')}
                                    >
                                        <UnitControl
                                            label={__('Item Border Width', 'meros-theme')}
                                            value={desktopStyles.itemBorderWidth || '1px'}
                                            onChange={(value) => setStyle('desktopSettings', 'itemBorderWidth', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Desktop Menu Item Text Colour */}
                                    <ToolsPanelItem
                                        label={__('Item Text Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => desktopStyles.itemTextColor !== '#000000'}
                                        onDeselect={() => resetStyles('desktopSettings', 'itemTextColor')}
                                    >
                                        <ColorPicker
                                            label={__('Item Text Colour', 'meros-theme')}
                                            value={desktopStyles.itemTextColor || '#000000'}
                                            onChange={(value) => setStyle('desktopSettings', 'itemTextColor', value)}
                                            margin={false}
                                        />
                                    </ToolsPanelItem>

                                    {/* Desktop Menu Item Highlight Type */}
                                    <ToolsPanelItem
                                        label={__('Item Highlight Type', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => desktopStyles.itemHighlightType !== 'none'}
                                        onDeselect={() => resetStyles('desktopSettings', 'itemHighlightType')}
                                    >
                                        <SelectControl
                                            label={__('Item Highlight Type', 'meros-theme')}
                                            value={desktopStyles.itemHighlightType || 'none'}
                                            options={[
                                                { label: __('None', 'meros-theme'), value: 'none' },
                                                { label: __('Background', 'meros-theme'), value: 'background' },
                                                { label: __('Underline', 'meros-theme'), value: 'underline' },
                                                { label: __('Overline', 'meros-theme'), value: 'overline' },
                                                { label: __('Border', 'meros-theme'), value: 'border' },
                                            ]}
                                            onChange={(value) => setStyle('desktopSettings', 'itemHighlightType', value)}
                                        />
                                    </ToolsPanelItem>

                                    {desktopStyles.itemHighlightType !== 'none' && (
                                        <>
                                            {desktopStyles.itemHighlightType !== 'none' &&
                                                desktopStyles.itemHighlightType !== 'background' && (
                                                    <ToolsPanelItem
                                                        label={__('Item Highlight Width', 'meros-theme')}
                                                        isShownByDefault={true}
                                                        hasValue={() => desktopStyles.itemHighlightBorderWidth !== '1px'}
                                                        onDeselect={() => resetStyles('desktopSettings', 'itemHighlightBorderWidth')}
                                                    >
                                                        <UnitControl
                                                            label={__('Item Highlight Width', 'meros-theme')}
                                                            value={desktopStyles.itemHighlightBorderWidth || '1px'}
                                                            onChange={(value) => setStyle('desktopSettings', 'itemHighlightBorderWidth', value)}
                                                        />
                                                    </ToolsPanelItem>
                                                )}

                                            <ToolsPanelItem
                                                label={__('Item Highlight Colour', 'meros-theme')}
                                                isShownByDefault={true}
                                                hasValue={() => desktopStyles.itemHighlightColor !== '#0693E3'}
                                                onDeselect={() => resetStyles('desktopSettings', 'itemHighlightColor')}
                                            >
                                                <ColorPicker
                                                    label={__('Item Highlight Colour', 'meros-theme')}
                                                    value={desktopStyles.itemHighlightColor || '#0693E3'}
                                                    onChange={(value) => setStyle('desktopSettings', 'itemHighlightColor', value)}
                                                />
                                            </ToolsPanelItem>

                                            <ToolsPanelItem
                                                label={__('Item Text Highlight Colour', 'meros-theme')}
                                                isShownByDefault={true}
                                                hasValue={() => desktopStyles.itemTextHoverColor !== '#222222'}
                                                onDeselect={() => resetStyles('desktopSettings', 'itemTextHoverColor')}
                                            >
                                                <ColorPicker
                                                    label={__('Item Text Highlight Colour', 'meros-theme')}
                                                    value={desktopStyles.itemTextHoverColor || '#222222'}
                                                    onChange={(value) => setStyle('desktopSettings', 'itemTextHoverColor', value)}
                                                />
                                            </ToolsPanelItem>
                                        </>
                                    )}
                                </ToolsPanel>
                            </PanelBody>
                        )}

                        {/* Styles Tab - Mobile Styles */}
                        {mobileSettings?.enabled && (
                            <PanelBody title={__('Mobile Menu Styles', 'meros-theme')} initialOpen={false}>
                                <ToolsPanel
                                    label={__('Mobile Menu Styles', 'meros-theme')}
                                    resetAll={() => resetStyles('mobileSettings')}
                                >
                                    {/* Full width */}
                                    <ToolsPanelItem
                                        label={__('Full Width Menu', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.width === '100%'}
                                        onDeselect={() => resetStyles('mobileSettings', 'width')}
                                    >
                                        <ToggleControl
                                            label={__('Full Width Menu', 'meros-theme')}
                                            checked={mobileStyles.width === '100%'}
                                            onChange={(value) => setStyle('mobileSettings', 'width', value ? '100%' : '80%')}
                                            disabled={mobileSettings.direction === 'top'}
                                        />
                                    </ToolsPanelItem>

                                    {mobileStyles.width && mobileStyles.width !== '100%' && mobileSettings.direction !== 'top' && (
                                        <>
                                            <ToolsPanelItem
                                                label={__('Menu Width', 'meros-theme')}
                                                isShownByDefault={true}
                                                hasValue={() => mobileStyles.width !== '80%'}
                                                onDeselect={() => resetStyles('mobileSettings', 'width')}
                                            >
                                                <UnitControl
                                                    label={__('Menu Width', 'meros-theme')}
                                                    value={mobileStyles.width || '80%'}
                                                    onChange={(value) => setStyle('mobileSettings', 'width', value)}
                                                />
                                            </ToolsPanelItem>

                                            <ToolsPanelItem
                                                label={__('Menu Max Width', 'meros-theme')}
                                                isShownByDefault={true}
                                                hasValue={() => mobileStyles.maxWidth !== '320px'}
                                                onDeselect={() => resetStyles('mobileSettings', 'maxWidth')}
                                            >
                                                <UnitControl
                                                    label={__('Menu Max Width', 'meros-theme')}
                                                    value={mobileStyles.maxWidth || '320px'}
                                                    onChange={(value) => setStyle('mobileSettings', 'maxWidth', value)}
                                                />
                                            </ToolsPanelItem>

                                            <ToolsPanelItem
                                                label={__('Box Shadow', 'meros-theme')}
                                                isShownByDefault={true}
                                                hasValue={() => mobileStyles.boxShadow !== true}
                                                onDeselect={() => resetStyles('mobileSettings', 'boxShadow')}
                                            >
                                                <ToggleControl
                                                    label={__('Box Shadow', 'meros-theme')}
                                                    checked={mobileStyles.boxShadow ?? true}
                                                    onChange={(value) => setStyle('mobileSettings', 'boxShadow', value)}
                                                />
                                            </ToolsPanelItem>
                                        </>
                                    )}

                                    {/* Items Gap */}
                                    <ToolsPanelItem
                                        label={__('Items Gap', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.itemsGap !== '0px'}
                                        onDeselect={() => resetStyles('mobileSettings', 'itemsGap')}
                                    >
                                        <UnitControl
                                            label={__('Items Gap', 'meros-theme')}
                                            value={mobileStyles.itemsGap || '0px'}
                                            onChange={(value) => setStyle('mobileSettings', 'itemsGap', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Mobile Menu Icon Color */}
                                    <ToolsPanelItem
                                        label={__('Icons Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.iconColor !== '#000000'}
                                        onDeselect={() => resetStyles('mobileSettings', 'iconColor')}
                                    >
                                        <ColorPicker
                                            label={__('Icons Colour', 'meros-theme')}
                                            value={mobileStyles.iconColor || '#000000'}
                                            margin={false}
                                            onChange={(value) => setStyle('mobileSettings', 'iconColor', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Icon Color Open */}
                                    <ToolsPanelItem
                                        label={__('Icons Colour (Open)', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.iconColorOpen !== '#000000'}
                                        onDeselect={() => resetStyles('mobileSettings', 'iconColorOpen')}
                                    >
                                        <ColorPicker
                                            label={__('Icons Colour (Open)', 'meros-theme')}
                                            value={mobileStyles.iconColorOpen || '#000000'}
                                            onChange={(value) => setStyle('mobileSettings', 'iconColorOpen', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Background Color */}
                                    <ToolsPanelItem
                                        label={__('Background Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.styles?.bgColor !== '#FFFFFF'}
                                        onDeselect={() => resetStyles('mobileSettings', 'bgColor')}
                                    >
                                        <ColorPicker
                                            label={__('Background Colour', 'meros-theme')}
                                            value={mobileStyles.bgColor || '#FFFFFF'}
                                            onChange={(value) => setStyle('mobileSettings', 'bgColor', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Item Padding X */}
                                    <ToolsPanelItem
                                        label={__('Item Padding X', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.itemPaddingX !== '10px'}
                                        onDeselect={() => resetStyles('mobileSettings', 'itemPaddingX')}
                                    >
                                        <UnitControl
                                            label={__('Item Padding X', 'meros-theme')}
                                            value={mobileStyles.itemPaddingX || '10px'}
                                            onChange={(value) => setStyle('mobileSettings', 'itemPaddingX', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Item Padding Y */}
                                    <ToolsPanelItem
                                        label={__('Item Padding Y', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.itemPaddingY !== '10px'}
                                        onDeselect={() => resetStyles('mobileSettings', 'itemPaddingY')}
                                    >
                                        <UnitControl
                                            label={__('Item Padding Y', 'meros-theme')}
                                            value={mobileStyles.itemPaddingY || '10px'}
                                            onChange={(value) => setStyle('mobileSettings', 'itemPaddingY', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Item Alignment */}
                                    <ToolsPanelItem
                                        label={__('Item Alignment', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.itemAlignment !== 'start'}
                                        onDeselect={() => resetStyles('mobileSettings', 'itemAlignment')}
                                    >
                                        <SelectControl
                                            label={__('Item Alignment', 'meros-theme')}
                                            value={mobileStyles.itemAlignment}
                                            options={[
                                                { label: __('Start', 'meros-theme'), value: 'start' },
                                                { label: __('Center', 'meros-theme'), value: 'center' },
                                                { label: __('End', 'meros-theme'), value: 'end' }
                                            ]}
                                            onChange={(value) => setStyle('mobileSettings', 'itemAlignment', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Item Text Color */}
                                    <ToolsPanelItem
                                        label={__('Item Text Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.itemTextColor !== '#000000'}
                                        onDeselect={() => resetStyles('mobileSettings', 'itemTextColor')}
                                    >
                                        <ColorPicker
                                            label={__('Item Text Colour', 'meros-theme')}
                                            value={mobileStyles.itemTextColor || '#000000'}
                                            margin={false}
                                            onChange={(value) => setStyle('mobileSettings', 'itemTextColor', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* Item Highlight Type */}
                                    <ToolsPanelItem
                                        label={__('Item Highlight Type', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => mobileStyles.itemHighlightType !== 'none'}
                                        onDeselect={() => resetStyles('mobileSettings', 'itemHighlightType')}
                                    >
                                        <SelectControl
                                            label={__('Item Highlight Type', 'meros-theme')}
                                            value={mobileStyles.itemHighlightType}
                                            options={[
                                                { label: __('None', 'meros-theme'), value: 'none' },
                                                { label: __('Background', 'meros-theme'), value: 'background' },
                                                { label: __('Underline', 'meros-theme'), value: 'underline' },
                                                { label: __('Overline', 'meros-theme'), value: 'overline' }
                                            ]}
                                            onChange={(value) => setStyle('mobileSettings', 'itemHighlightType', value)}
                                        />
                                    </ToolsPanelItem>

                                    {mobileStyles.itemHighlightType !== 'none' && (
                                        <>
                                            {/* Item Highlight */}
                                            <ToolsPanelItem
                                                label={__('Item Highlight Colour', 'meros-theme')}
                                                isShownByDefault={true}
                                                hasValue={() => mobileStyles.itemHighlightColor !== '#0693E3'}
                                                onDeselect={() => resetStyles('mobileSettings', 'itemHighlightColor')}
                                            >
                                                <ColorPicker
                                                    label={__('Item Highlight Colour', 'meros-theme')}
                                                    value={mobileStyles.itemHighlightColor || '#0693E3'}
                                                    margin={false}
                                                    onChange={(value) => setStyle('mobileSettings', 'itemHighlightColor', value)}
                                                />
                                            </ToolsPanelItem>

                                            {/* Item Text Highlight Colour */}
                                            <ToolsPanelItem
                                                label={__('Item Text Highlight Colour', 'meros-theme')}
                                                isShownByDefault={true}
                                                hasValue={() => mobileStyles.itemTextHoverColor !== '#222222'}
                                                onDeselect={() => resetStyles('mobileSettings', 'itemTextHoverColor')}
                                            >
                                                <ColorPicker
                                                    label={__('Item Text Highlight Colour', 'meros-theme')}
                                                    value={mobileStyles.itemTextHoverColor || '#222222'}
                                                    onChange={(value) => setStyle('mobileSettings', 'itemTextHoverColor', value)}
                                                />
                                            </ToolsPanelItem>
                                        </>
                                    )}
                                </ToolsPanel>
                            </PanelBody>
                        )}
                    </div>
                </InspectorControls>
            </Fragment>
        );
    };
});