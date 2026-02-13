import { subscribe, select, dispatch } from '@wordpress/data';
import { getChildBlocks } from '../shared/utils.js';

// These have been updated - fix wrappers and frontend
export function getNavigationAttributes() {
    return {
        "submenuSettings": {
            "type": "default",
            "styles": {
                "bgColor": "#FFFFFF",
                "borderColor": "#ABABAB",
                "borderWidth": '1px',
                "dropShadow": true,
                "borderWidth": '1px',
                "titleColor": "#5B5B5B",
                "titleSize": '0.875rem',
                "titlePaddingX": '16px',
                "titlePaddingY": '8px',
                "itemColor": "#000000",
                "itemHoverColor": "#222222",
                "itemSize": '1rem',
                "itemPaddingX": '0px',
                "itemPaddingY": '0px',
                "megaMenuColumnGap": '50px',
                "megaMenuColumnAlignment": "start",
                "megaMenuFillSpace": false
            }
        },
        "mobileSettings": {
            "enabled": true,
            "breakpoint": 768,
            "direction": "left",
            "underHeader": false,
            "icon": "hamburger-1",
            "styles": {
                "itemsGap": '10px',
                "iconColor": "#000000",
                "iconColorOpen": "#000000",
                "showLogo": true,
                "bgColor": "#FFFFFF",
                "textColor": "#000000",
                "textHoverColor": "#222222",
                "itemPaddingX": '10px',
                "itemPaddingY": '15px',
                "itemAlignment": "start",
                "itemBgColor": "#FFFFFF00",
                "itemHoverBgColor": "#e9e9e9",
                "submenuBgColor": "#FFFFFF00",
                "submenuItemBgColor": "#FFFFFF00",
                "submenuHoverBgColor": "#e9e9e9",
                "submenuTextColor": "#000000",
                "submenuTextHoverColor": "#222222"
            }
        },
        "desktopSettings": {
            "enabled": true,
            "styles": {
                "textColor": "#000000",
                "textHoverColor": "#222222",
                "itemBgColor": "#FFFFFF00",
                "itemHoverBgColor": "#e9e9e9",
                "submenuBgColor": "#FFFFFF00",
                "submenuItemBgColor": "#FFFFFF00",
                "submenuHoverBgColor": "#e9e9e9",
                "submenuTextColor": "#000000",
                "submenuTextHoverColor": "#222222"
            }
        }
    };
}

export function addNavigationAttributes(settings, name) {
    if (name === 'core/navigation-link') {
        return {
            ...settings,
            attributes: {
                ...settings.attributes,
                merosMenuItem: {
                    type: 'object',
                    default: {
                        type: 'default-item'
                    }
                }
            },
            supports: {
                ...settings.supports,
                color: {
                    text: true,
                    background: false
                },
                spacing: {
                    padding: true
                }
            }
        };
    }

    if (name === 'core/navigation-submenu') {
        return {
            ...settings,
            attributes: {
                ...settings.attributes,
                merosSubmenu: {
                    type: 'object',
                    default: {
                        type: 'default',
                        styles: {
                            dropShadow: true,
                        }
                    }
                }
            }
        };
    }

    if (name === 'core/navigation') {
        return {
            ...settings,
            attributes: {
                ...settings.attributes,
                merosMenu: {
                    type: 'object',
                    default: getNavigationAttributes(),
                }
            }
        };
    }

    return settings;
}

export function resetNavigationSettings(attributes, setAttributes, keys = []) {
    const currentSettings = getNavigationAttributes(attributes);
    const defaultSettings = getNavigationAttributes();

    const newSettings = { ...currentSettings };

    if (keys.length === 0) {
        // Reset all settings
        for (const key in defaultSettings) {
            newSettings[key] = defaultSettings[key];
        }
    } else {
        // Reset only specified keys
        for (const key of keys) {
            if (key in defaultSettings) {
                newSettings[key] = defaultSettings[key];
            }
        }
    }

    setAttributes({ merosMenu: newSettings });
}

export function resetAttribute(attributes, setAttributes, attribute) {
    const defaultSettings = getNavigationAttributes();
    const currentSettings = getNavigationAttributes(attributes);

    if (attribute.includes('.')) {
        // Handle nested attributes
        const keys = attribute.split('.');
        let newValue = defaultSettings;
        for (const key of keys) {
            newValue = newValue[key];
        }

        // Deep clone if it's an object
        if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
            newValue = JSON.parse(JSON.stringify(newValue));
        }

        // Update nested attribute
        const updatedSettings = { ...currentSettings };
        let temp = updatedSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            temp[key] = { ...temp[key] };
            temp = temp[key];
        }
        temp[keys[keys.length - 1]] = newValue;

        setAttributes({ merosMenu: updatedSettings });
        return;
    }

    // Handle top-level attributes
    let newValue;
    if (
        typeof defaultSettings[attribute] === 'object' &&
        defaultSettings[attribute] !== null &&
        !Array.isArray(defaultSettings[attribute])
    ) {
        newValue = JSON.parse(JSON.stringify(defaultSettings[attribute]));
    } else {
        newValue = defaultSettings[attribute];
    }

    setAttributes({
        merosMenu: {
            ...currentSettings,
            [attribute]: newValue
        }
    });
}

export function initSubmenuHandler() {
    let isCorrecting = false;

    subscribe(() => {
        if (isCorrecting) return;

        const editor = select('core/block-editor');
        const { moveBlockToPosition, replaceBlock } = dispatch('core/block-editor');
        const { createBlock } = wp.blocks;

        const blocks = editor.getBlocks();
        if (!blocks?.length) return;

        const scanInnerBlocks = (block, result = []) => {
            if (!block?.innerBlocks?.length) {
                return result;
            }

            block.innerBlocks.forEach((innerBlock) => {
                if (innerBlock.name === 'core/navigation') {
                    result.push(innerBlock);
                }

                scanInnerBlocks(innerBlock, result);
            });

            return result;
        };

        const menuBlocks = scanInnerBlocks(blocks[0]);
        if (menuBlocks.length > 0) {
            menuBlocks.forEach((menuBlock) => {
                if (menuBlock?.attributes?.maxNestingLevel !== 1) {
                    return;
                }

                const items = getChildBlocks(menuBlock.clientId);
                items.forEach((item) => {
                    if (item.name === 'core/navigation-submenu') {
                        const children = getChildBlocks(item.clientId);

                        const replaceInnerSubmenu = (block) => {
                            if (block.name === 'core/navigation-submenu') {
                                const url = block.attributes?.url || '';
                                const title = block.attributes?.label || '';
                                const type = block.attributes?.type || '';
                                const openInNewTab = block.attributes?.openInNewTab || false;

                                isCorrecting = true;
                                const newLink = createBlock('core/navigation-link', {
                                    url: url,
                                    label: title,
                                    type: type,
                                    openInNewTab: openInNewTab,
                                    merosMenuItem: {
                                        initialised: false,
                                        isInMerosMegaMenu: false,
                                        megaMenuColumnIndex: 1
                                    }
                                }
                                );

                                replaceBlock(block.clientId, newLink);
                                isCorrecting = false;
                            }
                        }

                        children.forEach((child) => {
                            if (child.name === 'core/navigation-submenu') {
                                const disallowedLinks = getChildBlocks(child.clientId);
                                disallowedLinks.forEach((link) => {
                                    if (link.name === 'core/navigation-link' || link.name === 'core/navigation-submenu') {
                                        isCorrecting = true;
                                        moveBlockToPosition(link.clientId, child.clientId, item.clientId, 0);
                                        isCorrecting = false;
                                    }
                                });

                                replaceInnerSubmenu(child);
                            }
                        });
                    }
                });
            });
        }
    });
}