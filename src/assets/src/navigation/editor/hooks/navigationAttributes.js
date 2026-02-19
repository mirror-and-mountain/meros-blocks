export function useNavigationAttributes(settings, name) {
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
            },
            supports: {}
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
                "titlePaddingY": '16px',
                "itemTextColor": "#000000",
                "itemTextHoverColor": "#222222",
                "itemSize": '1rem',
                "itemPaddingX": '0px',
                "itemPaddingY": '0px',
                "itemHighlightType": "none",
                "itemHighlightColor": "#0693E3",
                "megaMenuColumnGap": '80px',
                "megaMenuColumnAlignment": "start",
                "megaMenuFillSpace": false,
                "megaMenuItemGap": '0px'
            }
        },
        "mobileSettings": {
            "enabled": true,
            "breakpoint": 768,
            "direction": "left",
            "underHeader": false,
            "icon": "hamburger-1",
            "styles": {
                "itemsGap": '0px',
                "iconColor": "#000000",
                "iconColorOpen": "#000000",
                "showLogo": true,
                "bgColor": "#FFFFFF",
                "itemPaddingX": '30px',
                "itemPaddingY": '10px',
                "itemAlignment": "start",
                "itemTextColor": "#000000",
                "itemTextHoverColor": "#222222",
                "itemHighlightType": "none",
                "itemHighlightColor": "#0693E3",
            }
        },
        "desktopSettings": {
            "enabled": true,
            "styles": {
                "borderColor": "#ABABAB",
                "borderWidth": '1px',
                "itemsGap": '0px',
                "itemsJustification": "start",
                "itemPaddingX": '0px',
                "itemPaddingY": '0px',
                "itemTextColor": "#000000",
                "itemTextHoverColor": "#222222",
                "itemHighlightType": "none",
                "itemHighlightColor": "#0693E3",
            }
        }
    };
}