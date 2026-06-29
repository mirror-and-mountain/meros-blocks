import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { getNavigationSubmenuAttributes } from '../hooks/navigationAttributes.js';

import { getParentBlockAttribute } from '../../../utils/editor.js';

import {
    InspectorControls,
    ToolsPanel,
    ToolsPanelItem,
    SelectControl,
    ToggleControl,
    UnitControl,
    ColorPicker
} from '../../../components/Controls.js';

export const NavigationSubmenuControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { name, attributes, setAttributes, clientId } = props;
        if (name !== 'core/navigation-submenu') {
            return <BlockEdit {...props} />;
        }

        // Meros Enabled
        const enabled = getParentBlockAttribute(
            clientId,
            'core/navigation',
            'merosMenu.enabled',
            false
        );

        if (!enabled) {
            return <BlockEdit {...props} />;
        }

        const merosSettings = attributes.merosSubmenu || {};
        const submenuStyles = merosSettings.styles || {};

        const resetStyles = (attribute = '') => {
            const defaultStyles = getNavigationSubmenuAttributes()?.styles || {};
            if (attribute === '') {
                setAttributes({
                    merosSubmenu: {
                        ...merosSettings,
                        styles: {
                            ...defaultStyles
                        }
                    }
                });
            } else {
                setAttributes({
                    merosSubmenu: {
                        ...merosSettings,
                        styles: {
                            ...submenuStyles,
                            [attribute]: defaultStyles[attribute]
                        }
                    }
                });
            }
        };

        const setStyle = (attribute, value) => {
            setAttributes({
                merosSubmenu: {
                    ...merosSettings,
                    styles: {
                        ...submenuStyles,
                        [attribute]: value
                    }
                }
            });
        };

        return (
            <Fragment>
                <BlockEdit {...props} />
                <InspectorControls group="styles" className="meros-navigation-style-controls">
                    <div className="meros-navigation-style-controls">
                        <ToolsPanel
                            label={__('Submenu Styles', 'meros-theme')}
                            resetAll={() => resetStyles()}
                        >
                            {/* Place below header */}
                            {/* <ToolsPanelItem
                                label={__('Place Below Header', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.belowHeader === true}
                                onDeselect={() => resetStyles('belowHeader')}
                            >
                                <ToggleControl
                                    label={__('Place Below Header', 'meros-theme')}
                                    checked={submenuStyles.belowHeader ?? false}
                                    onChange={(value) => setStyle('belowHeader', value)}
                                />
                            </ToolsPanelItem> */}

                            {/* Top */}
                            {submenuStyles.belowHeader === false && (
                                <ToolsPanelItem
                                    label={__('Top', 'meros-theme')}
                                    isShownByDefault={true}
                                    hasValue={() => submenuStyles.topOffset !== '100%'}
                                    onDeselect={() => resetStyles('topOffset')}
                                >
                                    <UnitControl
                                        label={__('Top', 'meros-theme')}
                                        value={submenuStyles.topOffset || '100%'}
                                        onChange={(value) => setStyle('topOffset', value)}
                                    />
                                </ToolsPanelItem>
                            )}

                            {/* Background Colour */}
                            <ToolsPanelItem
                                label={__('Background Colour', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.bgColor !== '#FFFFFF'}
                                onDeselect={() => resetStyles('bgColor')}
                            >
                                <ColorPicker
                                    label={__('Background Colour', 'meros-theme')}
                                    value={submenuStyles.bgColor || '#FFFFFF'}
                                    margin={false}
                                    onChange={(value) => setStyle('bgColor', value)}
                                />
                            </ToolsPanelItem>

                            {/* Border Colour */}
                            <ToolsPanelItem
                                label={__('Border Colour', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.borderColor !== '#FFFFFF00'}
                                onDeselect={() => resetStyles('borderColor')}
                            >
                                <ColorPicker
                                    label={__('Border Colour', 'meros-theme')}
                                    value={submenuStyles.borderColor || '#FFFFFF00'}
                                    onChange={(value) => setStyle('borderColor', value)}
                                />
                            </ToolsPanelItem>

                            {/* Border Width */}
                            <ToolsPanelItem
                                label={__('Border Width', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.borderWidth !== '0px'}
                                onDeselect={() => resetStyles('borderWidth')}
                            >
                                <UnitControl
                                    label={__('Border Width', 'meros-theme')}
                                    value={submenuStyles.borderWidth || '0px'}
                                    onChange={(value) => setStyle('borderWidth', value)}
                                />
                            </ToolsPanelItem>

                            {/* Mega Menu Styles */}
                            {merosSettings.type === 'mega-menu' && (
                                <>
                                    <ToolsPanelItem
                                        label={__('Box Shadow', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.dropShadow !== true}
                                        onDeselect={() => resetStyles('dropShadow')}
                                    >
                                        <ToggleControl
                                            label={__('Box Shadow', 'meros-theme')}
                                            checked={submenuStyles.dropShadow}
                                            onChange={(value) => setStyle('dropShadow', value)}
                                        />
                                    </ToolsPanelItem>

                                    {/* <ToolsPanelItem
                                        label={__('Fill Space', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.megaMenuFillSpace !== false}
                                        onDeselect={() => resetStyles('megaMenuFillSpace')}
                                    >
                                        <ToggleControl
                                            label={__('Fill Space', 'meros-theme')}
                                            checked={submenuStyles.megaMenuFillSpace}
                                            onChange={(value) => setStyle('megaMenuFillSpace', value)}
                                        />
                                    </ToolsPanelItem> */}

                                    <ToolsPanelItem
                                        label={__('Column Alignment', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.megaMenuColumnAlignment !== 'start'}
                                        onDeselect={() => resetStyles('megaMenuColumnAlignment')}
                                    >
                                        <SelectControl
                                            label={__('Column Alignment', 'meros-theme')}
                                            value={submenuStyles.megaMenuColumnAlignment || 'start'}
                                            options={[
                                                { label: __('Start', 'meros-theme'), value: 'start' },
                                                { label: __('Center', 'meros-theme'), value: 'center' },
                                                { label: __('End', 'meros-theme'), value: 'end' },
                                            ]}
                                            onChange={(value) => setStyle('megaMenuColumnAlignment', value)}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Column Gap', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.megaMenuColumnGap !== '80px'}
                                        onDeselect={() => resetStyles('megaMenuColumnGap')}
                                    >
                                        <UnitControl
                                            label={__('Column Gap', 'meros-theme')}
                                            value={submenuStyles.megaMenuColumnGap || '80px'}
                                            onChange={(value) => setStyle('megaMenuColumnGap', value)}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Column Title Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.titleColor !== '#5B5B5B'}
                                        onDeselect={() => resetStyles('titleColor')}
                                    >
                                        <ColorPicker
                                            label={__('Column Title Colour', 'meros-theme')}
                                            value={submenuStyles.titleColor || '#5B5B5B'}
                                            onChange={(value) => setStyle('titleColor', value)}
                                            margin={false}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Column Title Size', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.titleSize !== '0.875rem'}
                                        onDeselect={() => resetStyles('titleSize')}
                                    >
                                        <UnitControl
                                            label={__('Column Title Size', 'meros-theme')}
                                            value={submenuStyles.titleSize || '0.875rem'}
                                            onChange={(value) => setStyle('titleSize', value)}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Column Title Padding X', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.titlePaddingX !== '16px'}
                                        onDeselect={() => resetStyles('titlePaddingX')}
                                    >
                                        <UnitControl
                                            label={__('Column Title Padding X', 'meros-theme')}
                                            value={submenuStyles.titlePaddingX || '16px'}
                                            onChange={(value) => setStyle('titlePaddingX', value)}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Column Title Padding Y', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.titlePaddingY !== '16px'}
                                        onDeselect={() => resetStyles('titlePaddingY')}
                                    >
                                        <UnitControl
                                            label={__('Column Title Padding Y', 'meros-theme')}
                                            value={submenuStyles.titlePaddingY || '16px'}
                                            onChange={(value) => setStyle('titlePaddingY', value)}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Item Gap', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.megaMenuItemGap !== '0px'}
                                        onDeselect={() => resetStyles('megaMenuItemGap')}
                                    >
                                        <UnitControl
                                            label={__('Item Gap', 'meros-theme')}
                                            value={submenuStyles.megaMenuItemGap || '0px'}
                                            onChange={(value) => setStyle('megaMenuItemGap', value)}
                                        />
                                    </ToolsPanelItem>
                                </>
                            )}

                            {/* Item Padding X */}
                            <ToolsPanelItem
                                label={__('Item Padding X', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.itemPaddingX !== '16px'}
                                onDeselect={() => resetStyles('itemPaddingX')}
                            >
                                <UnitControl
                                    label={__('Item Padding X', 'meros-theme')}
                                    value={submenuStyles.itemPaddingX || '16px'}
                                    onChange={(value) => setStyle('itemPaddingX', value)}
                                />
                            </ToolsPanelItem>

                            {/* Item Padding Y */}
                            <ToolsPanelItem
                                label={__('Item Padding Y', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.itemPaddingY !== '8px'}
                                onDeselect={() => resetStyles('itemPaddingY')}
                            >
                                <UnitControl
                                    label={__('Item Padding Y', 'meros-theme')}
                                    value={submenuStyles.itemPaddingY || '8px'}
                                    onChange={(value) => setStyle('itemPaddingY', value)}
                                />
                            </ToolsPanelItem>

                            {/* Item Text Colour */}
                            <ToolsPanelItem
                                label={__('Item Text Colour', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.itemTextColor !== '#000000'}
                                onDeselect={() => resetStyles('itemTextColor')}
                            >
                                <ColorPicker
                                    label={__('Item Text Colour', 'meros-theme')}
                                    value={submenuStyles.itemTextColor || '#000000'}
                                    margin={false}
                                    onChange={(value) => setStyle('itemTextColor', value)}
                                />
                            </ToolsPanelItem>

                            {/* Item Border Settings -- Not Mega Menu */}
                            {merosSettings.type !== 'mega-menu' && (
                                <>
                                    <ToolsPanelItem
                                        label={__('Item Border Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.itemBorderColor !== '#FFFFFF00'}
                                        onDeselect={() => resetStyles('itemBorderColor')}
                                    >
                                        <ColorPicker
                                            label={__('Item Border Colour', 'meros-theme')}
                                            value={submenuStyles.itemBorderColor || '#FFFFFF00'}
                                            onChange={(value) => setStyle('itemBorderColor', value)}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Item Border Width', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.itemBorderWidth !== '0px'}
                                        onDeselect={() => resetStyles('itemBorderWidth')}
                                    >
                                        <UnitControl
                                            label={__('Item Border Width', 'meros-theme')}
                                            value={submenuStyles.itemBorderWidth || '0px'}
                                            onChange={(value) => setStyle('itemBorderWidth', value)}
                                        />
                                    </ToolsPanelItem>
                                </>
                            )}

                            {/* Item Highlight Type */}
                            <ToolsPanelItem
                                label={__('Item Highlight Type', 'meros-theme')}
                                isShownByDefault={true}
                                hasValue={() => submenuStyles.itemHighlightType !== 'none'}
                                onDeselect={() => resetStyles('itemHighlightType')}
                            >
                                <SelectControl
                                    label={__('Item Highlight Type', 'meros-theme')}
                                    value={submenuStyles.itemHighlightType || 'none'}
                                    options={[
                                        { label: __('None', 'meros-theme'), value: 'none' },
                                        ...(merosSettings.type !== 'mega-menu'
                                            ? [{ label: __('Background', 'meros-theme'), value: 'background' }]
                                            : []),
                                        { label: __('Underline', 'meros-theme'), value: 'underline' },
                                        { label: __('Overline', 'meros-theme'), value: 'overline' },
                                        ...(merosSettings.type !== 'mega-menu'
                                            ? [{ label: __('Border', 'meros-theme'), value: 'border' }]
                                            : []),
                                    ]}
                                    onChange={(value) => setStyle('itemHighlightType', value)}
                                />
                            </ToolsPanelItem>

                            {submenuStyles.itemHighlightType && submenuStyles.itemHighlightType !== 'none' && (
                                <>
                                    {submenuStyles.itemHighlightType !== 'background' && (
                                        <ToolsPanelItem
                                            label={__('Item Highlight Width', 'meros-theme')}
                                            isShownByDefault={true}
                                            hasValue={() => submenuStyles.itemHighlightBorderWidth !== '1px'}
                                            onDeselect={() => resetStyles('itemHighlightBorderWidth')}
                                        >
                                            <UnitControl
                                                label={__('Item Highlight Width', 'meros-theme')}
                                                value={submenuStyles.itemHighlightBorderWidth || '1px'}
                                                onChange={(value) => setStyle('itemHighlightBorderWidth', value)}
                                            />
                                        </ToolsPanelItem>
                                    )}

                                    <ToolsPanelItem
                                        label={__('Item Highlight Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.itemHighlightColor !== '#0693E3'}
                                        onDeselect={() => resetStyles('itemHighlightColor')}
                                    >
                                        <ColorPicker
                                            label={__('Item Highlight Colour', 'meros-theme')}
                                            value={submenuStyles.itemHighlightColor || '#0693E3'}
                                            margin={false}
                                            onChange={(value) => setStyle('itemHighlightColor', value)}
                                        />
                                    </ToolsPanelItem>

                                    <ToolsPanelItem
                                        label={__('Item Text Highlight Colour', 'meros-theme')}
                                        isShownByDefault={true}
                                        hasValue={() => submenuStyles.itemTextHoverColor !== '#222222'}
                                        onDeselect={() => resetStyles('itemTextHoverColor')}
                                    >
                                        <ColorPicker
                                            label={__('Item Text Highlight Colour', 'meros-theme')}
                                            value={submenuStyles.itemTextHoverColor || '#222222'}
                                            onChange={(value) => setStyle('itemTextHoverColor', value)}
                                        />
                                    </ToolsPanelItem>
                                </>
                            )}
                        </ToolsPanel>
                    </div>
                </InspectorControls>
            </Fragment>
        )


    }
}, 'NavigationSubmenuControls');