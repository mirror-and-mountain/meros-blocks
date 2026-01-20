import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import {
    ToggleControl, 
    SelectControl,
    RangeControl,
    __experimentalNumberControl as NumberControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem
} from '@wordpress/components';

import { getAttributes } from './utils.js';
import { ColorPicker } from '../../fx/components/ColorPicker.js';

export const addMerosControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { name, attributes, setAttributes } = props;
        if (name !== 'core/navigation') {
            return <BlockEdit {...props} />;
        }

        const { overlayMenu, showSubmenuIcon } = attributes;

        // Ensure overlay menu is set to 'never'
        if (overlayMenu !== 'never') {
            setAttributes({ overlayMenu: 'never' });
        }

        if (showSubmenuIcon !== false) {
            setAttributes({ showSubmenuIcon: false });
        }

        const {
            merosMobileMenu,
            merosDesktopMenu
        } = getAttributes(attributes);

        const resetMobileMenu = () => {
            setAttributes({
                merosMobileMenu: {
                    breakpoint: 768,
                    direction: 'left',
                    underHeader: false,
                    icon: 'hamburger-1',
                    showLogo: true,
                    bgColor: '#FFFFFF',
                    textColor: '#000000',
                    textHoverColor: '#f0f0f0',
                    itemPaddingX: 10,
                    itemPaddingY: 10,
                    itemBgColor: '#FFFFFF',
                    itemHoverBgColor: '#f0f0f0',
                    submenuBgColor: '#FFFFFF',
                    submenuHoverBgColor: '#f0f0f0',
                    submenuTextColor: '#000000',
                    submenuTextHoverColor: '#f0f0f0',
                }
            });
        };

        const resetDesktopMenu = () => {
            setAttributes({
                merosDesktopMenu: {
                    bgColor: '#FFFFFF',
                    textColor: '#000000',
                    textHoverColor: '#f0f0f0',
                    itemPaddingX: 10,
                    itemPaddingY: 10,
                    itemBgColor: '#FFFFFF',
                    itemHoverBgColor: '#f0f0f0',
                    submenuBgColor: '#FFFFFF',
                    submenuHoverBgColor: '#f0f0f0',
                    submenuTextColor: '#000000',
                    submenuTextHoverColor: '#f0f0f0',
                }
            });
        };

        return (
            <Fragment>
                <BlockEdit {...props} />
                <InspectorControls className="meros-advanced-navigation-controls">
                    <div className="meros-advanced-navigation-controls">
                        {/* Mobile Menu Controls */}
                        <ToolsPanel label={__('Mobile Menu', 'meros-theme')} resetAll={resetMobileMenu}>

                            {/* Enable Mobile Menu */}
                            <ToolsPanelItem
                                label={__('Enable Mobile Menu', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => merosMobileMenu.enabled !== true}
                                onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, enabled: true} })}
                            >
                                <ToggleControl
                                    label={__('Enable Mobile Menu', 'meros-theme')}
                                    checked={merosMobileMenu.enabled}
                                    onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, enabled: value } })}
                                />
                            </ToolsPanelItem>

                            { merosMobileMenu.enabled && (
                                <>
                                    {/* Breakpoint */}
                                    <ToolsPanelItem
                                        label={__('Menu Breakpoint', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.breakpoint !== 768}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, breakpoint: 768} })}
                                    >
                                        <NumberControl
                                            label={__('Breakpoint (px)', 'meros-theme')}
                                            value={merosMobileMenu.breakpoint}
                                            onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, breakpoint: value } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Items Gap */}
                                    <ToolsPanelItem
                                        label={__('Menu Items Gap', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.itemsGap !== 0}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, itemsGap: 0} })}
                                    >
                                        <NumberControl
                                            label={__('Items Gap (px)', 'meros-theme')}
                                            value={merosMobileMenu.itemsGap}
                                            onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, itemsGap: value } })}
                                            min={0}
                                            max={100}
                                        />
                                    </ToolsPanelItem>

                                    {/* Icon */}
                                    <ToolsPanelItem
                                        label={__('Menu Icon', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.icon !== 'hamburger-1'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, icon: 'hamburger-1'} })}
                                    >
                                        <SelectControl
                                            label={__('Menu Icon', 'meros-theme')}
                                            value={merosMobileMenu.icon}
                                            options={[
                                                { label: __('Hamburger 1', 'meros-theme'), value: 'hamburger-1' },
                                                { label: __('Hamburger 2', 'meros-theme'), value: 'hamburger-2' }
                                            ]}
                                            onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, icon: value } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Direction */}
                                    <ToolsPanelItem
                                        label={__('Menu Slide Direction', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.direction !== 'left'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, direction: 'left'} })}
                                    >
                                        <SelectControl
                                            label={__('Slide Direction', 'meros-theme')}
                                            value={merosMobileMenu.direction}
                                            options={[
                                                { label: __('Left', 'meros-theme'), value: 'left' },
                                                { label: __('Right', 'meros-theme'), value: 'right' },
                                                { label: __('Top', 'meros-theme'), value: 'top' }
                                            ]}
                                            onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, direction: value } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Under Header - Top only */}
                                    {merosMobileMenu.direction === 'top' && (
                                        <ToolsPanelItem
                                            label={__('Under Header', 'meros-theme')}
                                            isShownByDefault={true}
                                            hasValue={() => merosMobileMenu.underHeader !== false}
                                            onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, underHeader: false} })}
                                        >
                                            <ToggleControl
                                                label={__('Place menu under header', 'meros-theme')}
                                                checked={merosMobileMenu.underHeader}
                                                onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, underHeader: value } })}
                                            />
                                        </ToolsPanelItem>
                                    )}

                                    {/* Show Logo */}
                                    <ToolsPanelItem
                                        label={__('Show Logo', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.showLogo !== true}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, showLogo: true} })}
                                    >
                                        <ToggleControl
                                            label={__('Show logo in mobile menu', 'meros-theme')}
                                            checked={merosMobileMenu.showLogo}
                                            onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, showLogo: value } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Icon Color */}
                                    <ToolsPanelItem
                                        label={__('Menu Icon Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.iconColor !== '#000000'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, iconColor: '#000000'} })}
                                    >
                                        <ColorPicker
                                            label={__('Icon Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.iconColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, iconColor: color } })}
                                            margin={false}
                                        />
                                    </ToolsPanelItem>

                                    {/* Menu Background Color */}
                                    <ToolsPanelItem
                                        label={__('Menu Background Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.bgColor !== '#FFFFFF'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, bgColor: '#FFFFFF'} })}
                                    >
                                        <ColorPicker
                                            label={__('Background Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.bgColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, bgColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Menu Text Color - Top Level */}
                                    <ToolsPanelItem
                                        label={__('Menu Text Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.textColor !== '#000000'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, textColor: '#000000'} })}
                                    >
                                        <ColorPicker
                                            label={__('Text Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.textColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, textColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Menu Text Hover Color - Top Level */}
                                    <ToolsPanelItem
                                        label={__('Menu Text Hover Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.textHoverColor !== '#f0f0f0'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, textHoverColor: '#f0f0f0'} })}
                                    >
                                        <ColorPicker
                                            label={__('Text Hover Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.textHoverColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, textHoverColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Menu Item Padding X */}
                                    <ToolsPanelItem
                                        label={__('Menu Item Padding X (px)', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.itemPaddingX !== 10}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, itemPaddingX: 10} })}
                                    >
                                        <RangeControl
                                            label={__('Item Padding X (px)', 'meros-theme')}
                                            value={merosMobileMenu.itemPaddingX}
                                            onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, itemPaddingX: value } })}
                                            min={0}
                                            max={50}
                                        />
                                    </ToolsPanelItem>

                                    {/* Menu Item Padding Y */}
                                    <ToolsPanelItem
                                        label={__('Menu Item Padding Y (px)', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.itemPaddingY !== 10}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, itemPaddingY: 10} })}
                                    >
                                        <RangeControl
                                            label={__('Item Padding Y (px)', 'meros-theme')}
                                            value={merosMobileMenu.itemPaddingY}
                                            onChange={(value) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, itemPaddingY: value } })}
                                            min={0}
                                            max={50}
                                        />
                                    </ToolsPanelItem>

                                    {/* Item Background Color - Top Level */}
                                    <ToolsPanelItem
                                        label={__('Menu Item Background Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.itemBgColor !== '#FFFFFF'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, itemBgColor: '#FFFFFF'} })}
                                    >
                                        <ColorPicker
                                            label={__('Item Background Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.itemBgColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, itemBgColor: color } })}
                                            margin={false}
                                        />
                                    </ToolsPanelItem>

                                    {/* Item Hover Background Color - Top Level */}
                                    <ToolsPanelItem
                                        label={__('Menu Item Hover Background Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.itemHoverBgColor !== '#f0f0f0'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, itemHoverBgColor: '#f0f0f0'} })}
                                    >
                                        <ColorPicker
                                            label={__('Item Hover Background Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.itemHoverBgColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, itemHoverBgColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Submenu Background Color */}
                                    <ToolsPanelItem
                                        label={__('Submenu Background Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.submenuBgColor !== '#FFFFFF'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, submenuBgColor: '#FFFFFF'} })}
                                    >
                                        <ColorPicker
                                            label={__('Submenu Background Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.submenuBgColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, submenuBgColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Submenu Item Background Color */}
                                    <ToolsPanelItem
                                        label={__('Submenu Item Background Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.submenuItemBgColor !== '#FFFFFF'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, submenuItemBgColor: '#FFFFFF'} })}
                                    >
                                        <ColorPicker
                                            label={__('Submenu Item Background Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.submenuItemBgColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, submenuItemBgColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Submenu Hover Background Color */}
                                    <ToolsPanelItem
                                        label={__('Submenu Hover Background Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.submenuHoverBgColor !== '#f0f0f0'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, submenuHoverBgColor: '#f0f0f0'} })}
                                    >
                                        <ColorPicker
                                            label={__('Submenu Hover Background Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.submenuHoverBgColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, submenuHoverBgColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Submenu Text Color */}
                                    <ToolsPanelItem
                                        label={__('Submenu Text Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.submenuTextColor !== '#000000'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, submenuTextColor: '#000000'} })}
                                    >
                                        <ColorPicker
                                            label={__('Submenu Text Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.submenuTextColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, submenuTextColor: color } })}
                                        />
                                    </ToolsPanelItem>

                                    {/* Submenu Text Hover Color */}
                                    <ToolsPanelItem
                                        label={__('Submenu Text Hover Color', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => merosMobileMenu.submenuTextHoverColor !== '#f0f0f0'}
                                        onDeselect={() => setAttributes({ merosMobileMenu: {...merosMobileMenu, submenuTextHoverColor: '#f0f0f0'} })}
                                    >
                                        <ColorPicker
                                            label={__('Submenu Text Hover Color', 'meros-theme')}
                                            currentColor={merosMobileMenu.submenuTextHoverColor}
                                            onChange={(color) => setAttributes({ merosMobileMenu: { ...merosMobileMenu, submenuTextHoverColor: color } })}
                                        />
                                    </ToolsPanelItem>
                                </>
                            )}
                        </ToolsPanel>
                    </div>
                </InspectorControls>
            </Fragment>
        )
    };
});