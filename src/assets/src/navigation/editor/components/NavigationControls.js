import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { getNavigationAttributes } from '../hooks/navigationAttributes.js';
import { isChildOf } from '../../../utils/editor.js';

import {
    InspectorControls,
    PanelBody,
    ToolsPanel,
    ToolsPanelItem,
    NumberControl,
    SelectControl,
    ToggleControl,
    UnitControl,
    ColorPicker
} from '../../../components/Controls.js';

export const NavigationControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { name, attributes, setAttributes, clientId } = props;
        if (name !== 'core/navigation') {
            return <BlockEdit {...props} />;
        }

        // Get settings
        const { overlayMenu, openSubmenusOnClick, maxNestingLevel, merosMenu } = attributes;
        const { submenuSettings, mobileSettings, desktopSettings } = merosMenu;

        const submenuStyles = submenuSettings?.styles || {};
        const mobileStyles = mobileSettings?.styles || {};
        const desktopStyles = desktopSettings?.styles || {};

        // Ensure overlayMenu is set to 'never'
        if (overlayMenu !== 'never' || maxNestingLevel !== 1) {
            setAttributes({
                overlayMenu: 'never',
                maxNestingLevel: 1
            });
        }

        // Check if the navigation is in a header template part
        const inHeader = isChildOf(
            clientId,
            ['core/template-part', 'core/group'],
            function (block) { 
                if (block.name === 'core/template-part') {
                    return block.attributes?.slug === 'header';
                } else if (block.name === 'core/group') {
                    return block.attributes?.tagName === 'header';
                }
            }
        );

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
                <InspectorControls className="meros-navigation-settings-controls">
                    {/* General Settings */}
                    <ToolsPanel
                        label={__('Settings', 'meros-theme')}
                        resetAll={() => {
                            resetSettings('submenuSettings', 'type');
                            setAttributes({ openSubmenusOnClick: false });
                        }}
                    >
                        {/* Submenu Type */}
                        <ToolsPanelItem
                            label={__('Submenu Type', 'meros-theme')}
                            isShownByDefault={true}
                            hasValue={() => submenuSettings.type !== 'default'}
                            onDeselect={() => resetSettings('submenuSettings', 'type')}
                        >
                            <SelectControl
                                label={__('Submenu Type', 'meros-theme')}
                                value={submenuSettings.type}
                                options={[
                                    { label: __('Default', 'meros-theme'), value: 'default' },
                                    { label: __('Mega Menu', 'meros-theme'), value: 'mega-menu' }
                                ]}
                                onChange={(value) => setSetting('submenuSettings', 'type', value)}
                            />
                        </ToolsPanelItem>

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
                                {inHeader && mobileSettings?.direction === 'top' && (
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
                                <ToolsPanelItem
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
                                </ToolsPanelItem>
                            </>
                        )}
                    </ToolsPanel>
                </InspectorControls>

                {/* Styles Tab */}
                <InspectorControls group="styles" className="meros-navigation-style-controls">
                    {/* Styles Tab - Desktop Styles */}
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

                                {/* Desktop Menu Item Text Colour */}
                                <ToolsPanelItem
                                    label={__('Item Text', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => desktopStyles.itemTextColor !== '#000000'}
                                    onDeselect={() => resetStyles('desktopSettings', 'itemTextColor')}
                                >
                                    <ColorPicker
                                        label={__('Item Text', 'meros-theme')}
                                        value={desktopStyles.itemTextColor || '#000000'}
                                        onChange={(value) => setStyle('desktopSettings', 'itemTextColor', value)}
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
                                        <ToolsPanelItem
                                            label={__('Item Highlight', 'meros-theme')}
                                            isShownByDefault={true}
                                            hasValue={() => desktopStyles.itemHighlightColor !== '#0693E3'}
                                            onDeselect={() => resetStyles('desktopSettings', 'itemHighlightColor')}
                                        >
                                            <ColorPicker
                                                label={__('Item Highlight', 'meros-theme')}
                                                value={desktopStyles.itemHighlightColor || '#0693E3'}
                                                onChange={(value) => setStyle('desktopSettings', 'itemHighlightColor', value)}
                                            />
                                        </ToolsPanelItem>

                                        <ToolsPanelItem
                                            label={__('Item Text Highlight', 'meros-theme')}
                                            isShownByDefault={true}
                                            hasValue={() => desktopStyles.itemTextHoverColor !== '#222222'}
                                            onDeselect={() => resetStyles('desktopSettings', 'itemTextHoverColor')}
                                        >
                                            <ColorPicker
                                                label={__('Item Text Highlight', 'meros-theme')}
                                                value={desktopStyles.itemTextHoverColor || '#222222'}
                                                onChange={(value) => setStyle('desktopSettings', 'itemTextHoverColor', value)}
                                            />
                                        </ToolsPanelItem>
                                    </>
                                )}
                            </ToolsPanel>
                        </PanelBody>
                    )}

                    {/* Styles Tab - Submenu Styles */}
                    {submenuSettings?.type === 'mega-menu' && (
                        <PanelBody title={__('Submenu Styles', 'meros-theme')} initialOpen={false}>
                            <ToolsPanel
                                label={__('Submenu Styles', 'meros-theme')}
                                resetAll={() => resetStyles('submenuSettings')}
                            >
                                {/* Mega Menu Background Colour */}
                                <ToolsPanelItem
                                    label={__('Background Colour', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.bgColor !== '#FFFFFF'}
                                    onDeselect={() => resetStyles('submenuSettings', 'bgColor')}
                                >
                                    <ColorPicker
                                        label={__('Background Colour', 'meros-theme')}
                                        value={submenuStyles.bgColor || '#FFFFFF'}
                                        margin={false}
                                        onChange={(value) => setStyle('submenuSettings', 'bgColor', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Border Colour */}
                                <ToolsPanelItem
                                    label={__('Border Colour', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.borderColor !== '#ABABAB'}
                                    onDeselect={() => resetStyles('submenuSettings', 'borderColor')}
                                >
                                    <ColorPicker
                                        label={__('Border Colour', 'meros-theme')}
                                        value={submenuStyles.borderColor || '#ABABAB'}
                                        onChange={(value) => setStyle('submenuSettings', 'borderColor', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Border Width */}
                                <ToolsPanelItem
                                    label={__('Border Width', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.borderWidth !== '1px'}
                                    onDeselect={() => resetStyles('submenuSettings', 'borderWidth')}
                                >
                                    <UnitControl
                                        label={__('Border Width', 'meros-theme')}
                                        value={submenuStyles.borderWidth || '1px'}
                                        onChange={(value) => setStyle('submenuSettings', 'borderWidth', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Box Shadow */}
                                <ToolsPanelItem
                                    label={__('Box Shadow', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.dropShadow !== true}
                                    onDeselect={() => resetStyles('submenuSettings', 'dropShadow')}
                                >
                                    <ToggleControl
                                        label={__('Box Shadow', 'meros-theme')}
                                        checked={submenuStyles.dropShadow}
                                        onChange={(value) => setStyle('submenuSettings', 'dropShadow', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Fill Space */}
                                <ToolsPanelItem
                                    label={__('Fill Space', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.megaMenuFillSpace !== false}
                                    onDeselect={() => resetStyles('submenuSettings', 'megaMenuFillSpace')}
                                >
                                    <ToggleControl
                                        label={__('Fill Space', 'meros-theme')}
                                        checked={submenuStyles.megaMenuFillSpace}
                                        onChange={(value) => setStyle('submenuSettings', 'megaMenuFillSpace', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Column Alignment */}
                                <ToolsPanelItem
                                    label={__('Column Alignment', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.megaMenuColumnAlignment !== 'start'}
                                    onDeselect={() => resetStyles('submenuSettings', 'megaMenuColumnAlignment')}
                                >
                                    <SelectControl
                                        label={__('Column Alignment', 'meros-theme')}
                                        value={submenuStyles.megaMenuColumnAlignment || 'start'}
                                        options={[
                                            { label: __('Start', 'meros-theme'), value: 'start' },
                                            { label: __('Center', 'meros-theme'), value: 'center' },
                                            { label: __('End', 'meros-theme'), value: 'end' },
                                        ]}
                                        onChange={(value) => setStyle('submenuSettings', 'megaMenuColumnAlignment', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Column Gap */}
                                <ToolsPanelItem
                                    label={__('Column Gap', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.megaMenuColumnGap !== '80px'}
                                    onDeselect={() => resetStyles('submenuSettings', 'megaMenuColumnGap')}
                                >
                                    <UnitControl
                                        label={__('Column Gap', 'meros-theme')}
                                        value={submenuStyles.megaMenuColumnGap || '80px'}
                                        onChange={(value) => setStyle('submenuSettings', 'megaMenuColumnGap', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Column Title Colour */}
                                <ToolsPanelItem
                                    label={__('Column Title Colour', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.titleColor !== '#5B5B5B'}
                                    onDeselect={() => resetStyles('submenuSettings', 'titleColor')}
                                >
                                    <ColorPicker
                                        label={__('Column Title Colour', 'meros-theme')}
                                        value={submenuStyles.titleColor || '#5B5B5B'}
                                        onChange={(value) => setStyle('submenuSettings', 'titleColor', value)}
                                        margin={false}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Column Title Size */}
                                <ToolsPanelItem
                                    label={__('Column Title Size', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.titleSize !== '0.875rem'}
                                    onDeselect={() => resetStyles('submenuSettings', 'titleSize')}
                                >
                                    <UnitControl
                                        label={__('Column Title Size', 'meros-theme')}
                                        value={submenuStyles.titleSize || '0.875rem'}
                                        onChange={(value) => setStyle('submenuSettings', 'titleSize', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Column Title Padding X */}
                                <ToolsPanelItem
                                    label={__('Column Title Padding X', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.titlePaddingX !== '16px'}
                                    onDeselect={() => resetStyles('submenuSettings', 'titlePaddingX')}
                                >
                                    <UnitControl
                                        label={__('Column Title Padding X', 'meros-theme')}
                                        value={submenuStyles.titlePaddingX || '16px'}
                                        onChange={(value) => setStyle('submenuSettings', 'titlePaddingX', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Column Title Padding Y */}
                                <ToolsPanelItem
                                    label={__('Column Title Padding Y', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.titlePaddingY !== '16px'}
                                    onDeselect={() => resetStyles('submenuSettings', 'titlePaddingY')}
                                >
                                    <UnitControl
                                        label={__('Column Title Padding Y', 'meros-theme')}
                                        value={submenuStyles.titlePaddingY || '16px'}
                                        onChange={(value) => setStyle('submenuSettings', 'titlePaddingY', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Item Colour */}
                                <ToolsPanelItem
                                    label={__('Item Colour', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.itemTextColor !== '#000000'}
                                    onDeselect={() => resetStyles('submenuSettings', 'itemTextColor')}
                                >
                                    <ColorPicker
                                        label={__('Item Colour', 'meros-theme')}
                                        value={submenuStyles.itemTextColor || '#000000'}
                                        margin={false}
                                        onChange={(value) => setStyle('submenuSettings', 'itemTextColor', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Item Hover Colour */}
                                <ToolsPanelItem
                                    label={__('Item Hover Colour', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.itemTextHoverColor !== '#222222'}
                                    onDeselect={() => resetStyles('submenuSettings', 'itemTextHoverColor')}
                                >
                                    <ColorPicker
                                        label={__('Item Hover Colour', 'meros-theme')}
                                        value={submenuStyles.itemTextHoverColor || '#222222'}
                                        onChange={(value) => setStyle('submenuSettings', 'itemTextHoverColor', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Item Size */}
                                <ToolsPanelItem
                                    label={__('Item Size', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.itemSize !== '1rem'}
                                    onDeselect={() => resetStyles('submenuSettings', 'itemSize')}
                                >
                                    <UnitControl
                                        label={__('Item Size', 'meros-theme')}
                                        value={submenuStyles.itemSize || '1rem'}
                                        onChange={(value) => setStyle('submenuSettings', 'itemSize', value)}
                                    />
                                </ToolsPanelItem>
                                
                                {/* Mega Menu Item Gap */}
                                 <ToolsPanelItem
                                    label={__('Item Gap', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.megaMenuItemGap !== '0px'}
                                    onDeselect={() => resetStyles('submenuSettings', 'megaMenuItemGap')}
                                >
                                    <UnitControl
                                        label={__('Item Gap', 'meros-theme')}
                                        value={submenuStyles.megaMenuItemGap || '0px'}
                                        onChange={(value) => setStyle('submenuSettings', 'megaMenuItemGap', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Item Padding X */}
                                <ToolsPanelItem
                                    label={__('Item Padding X', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.itemPaddingX !== '16px'}
                                    onDeselect={() => resetStyles('submenuSettings', 'itemPaddingX')}
                                >
                                    <UnitControl
                                        label={__('Item Padding X', 'meros-theme')}
                                        value={submenuStyles.itemPaddingX || '16px'}
                                        onChange={(value) => setStyle('submenuSettings', 'itemPaddingX', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Mega Menu Item Padding Y */}
                                <ToolsPanelItem
                                    label={__('Item Padding Y', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.itemPaddingY !== '8px'}
                                    onDeselect={() => resetStyles('submenuSettings', 'itemPaddingY')}
                                >
                                    <UnitControl
                                        label={__('Item Padding Y', 'meros-theme')}
                                        value={submenuStyles.itemPaddingY || '8px'}
                                        onChange={(value) => setStyle('submenuSettings', 'itemPaddingY', value)}
                                    />
                                </ToolsPanelItem>
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
                                    label={__('Icons', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => mobileStyles.iconColor !== '#000000'}
                                    onDeselect={() => resetStyles('mobileSettings', 'iconColor')}
                                >
                                    <ColorPicker
                                        label={__('Icons', 'meros-theme')}
                                        value={mobileStyles.iconColor || '#000000'}
                                        margin={false}
                                        onChange={(value) => setStyle('mobileSettings', 'iconColor', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Icon Color Open */}
                                <ToolsPanelItem
                                    label={__('Icons (Open)', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => mobileStyles.iconColorOpen !== '#000000'}
                                    onDeselect={() => resetStyles('mobileSettings', 'iconColorOpen')}
                                >
                                    <ColorPicker
                                        label={__('Icons (Open)', 'meros-theme')}
                                        value={mobileStyles.iconColorOpen || '#000000'}
                                        onChange={(value) => setStyle('mobileSettings', 'iconColorOpen', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Background Color */}
                                <ToolsPanelItem
                                    label={__('Background', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => mobileStyles.styles?.bgColor !== '#FFFFFF'}
                                    onDeselect={() => resetStyles('mobileSettings', 'bgColor')}
                                >
                                    <ColorPicker
                                        label={__('Background', 'meros-theme')}
                                        value={mobileStyles.bgColor || '#FFFFFF'}
                                        onChange={(value) => setStyle('mobileSettings', 'bgColor', value)}
                                    />
                                </ToolsPanelItem>

                                {/* Submenu Background Color */}
                                {/* <ToolsPanelItem
                                    label={__('Submenu Background', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => mobileStyles.submenuBgColor !== '#FFFFFF00'}
                                    onDeselect={() => resetStyles('mobileSettings', 'submenuBgColor')}
                                >
                                    <ColorPicker
                                        label={__('Submenu Background', 'meros-theme')}
                                        value={mobileStyles.submenuBgColor || '#FFFFFF00'}
                                        onChange={(value) => setStyle('mobileSettings', 'submenuBgColor', value)}
                                    />
                                </ToolsPanelItem> */}

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
                                    label={__('Item Text', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => mobileStyles.itemTextColor !== '#000000'}
                                    onDeselect={() => resetStyles('mobileSettings', 'itemTextColor')}
                                >
                                    <ColorPicker
                                        label={__('Item Text', 'meros-theme')}
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
                                            label={__('Item Highlight', 'meros-theme')}
                                            isShownByDefault={true}
                                            hasValue={() => mobileStyles.itemHighlightColor !== '#0693E3'}
                                            onDeselect={() => resetStyles('mobileSettings', 'itemHighlightColor')}
                                        >
                                            <ColorPicker
                                                label={__('Item Highlight', 'meros-theme')}
                                                value={mobileStyles.itemHighlightColor || '#0693E3'}
                                                margin={false}
                                                onChange={(value) => setStyle('mobileSettings', 'itemHighlightColor', value)}
                                            />
                                        </ToolsPanelItem>

                                        {/* Item Text Highlight Color */}
                                        <ToolsPanelItem
                                            label={__('Item Text Highlight', 'meros-theme')}
                                            isShownByDefault={true}
                                            hasValue={() => mobileStyles.itemTextHoverColor !== '#222222'}
                                            onDeselect={() => resetStyles('mobileSettings', 'itemTextHoverColor')}
                                        >
                                            <ColorPicker
                                                label={__('Item Text Highlight', 'meros-theme')}
                                                value={mobileStyles.itemTextHoverColor || '#222222'}
                                                onChange={(value) => setStyle('mobileSettings', 'itemTextHoverColor', value)}
                                            />
                                        </ToolsPanelItem>
                                    </>
                                )}
                            </ToolsPanel>
                        </PanelBody>
                    )}
                </InspectorControls>
            </Fragment>
        );
    };
});